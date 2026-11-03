import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, ConnProfile, ToastMessage, UserAccount } from './types';
import { SAMPLE_PROFILES } from './data/mockData';
import {
  loadActiveProfile,
  saveActiveProfile,
  loadAllProfiles,
  checkIsLoggedIn,
  setLoggedIn,
  recordProfileView,
  saveCurrentUser,
  clearCurrentUser,
  saveCurrentUserId,
  loadCurrentUserId,
  clearCurrentUserId,
  createBlankProfileForUser,
} from './lib/storage';
import {
  supabase,
  isSupabaseConfigured,
  fetchProfileFromSupabase,
  upsertProfileToSupabase,
  fetchPublicProfileByUsername,
  fetchAllPublicProfilesFromSupabase,
} from './lib/supabase';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Workspace } from './components/Dashboard/Workspace';
import { PublicProfile } from './components/PublicProfile';
import { UnpublishedProfileView } from './components/UnpublishedProfileView';
import { ProfileNotFoundView } from './components/ProfileNotFoundView';
import { ToastContainer } from './components/Toast';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { Loader2 } from 'lucide-react';

/**
 * Extracts a profile slug from pathname or hash if present.
 * Supports /username, /@username, /p/username, /#username, /#/username
 */
function extractSlugFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check path (e.g. /nishi or /@nishi or /p/nishi)
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
  if (path) {
    const segments = path.split('/');
    let candidate = segments[0];
    if (candidate === 'p' && segments[1]) {
      candidate = segments[1];
    } else if (candidate.startsWith('@')) {
      candidate = candidate.slice(1);
    }
    const clean = candidate.toLowerCase();
    const reserved = [
      'dashboard',
      'login',
      'signup',
      'settings',
      'admin',
      'api',
      'assets',
      'favicon.ico',
      'robots.txt',
    ];
    if (!reserved.includes(clean)) {
      return clean;
    }
  }

  // 2. Check hash route fallback (e.g. #nishi or #/nishi)
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash) {
    const clean = hash.toLowerCase();
    const reserved = ['dashboard', 'login', 'signup', 'settings', 'admin', 'api'];
    if (!reserved.includes(clean)) {
      return clean;
    }
  }

  return null;
}

export default function App() {
  const [activeProfile, setActiveProfile] = useState<ConnProfile>(loadActiveProfile());
  const [allProfiles, setAllProfiles] = useState<ConnProfile[]>(loadAllProfiles());
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => checkIsLoggedIn());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Public Profile View state (independent from active creator profile)
  const [publicProfile, setPublicProfile] = useState<ConnProfile | null>(null);
  const [publicSlug, setPublicSlug] = useState<string>('');
  const [publicProfileState, setPublicProfileState] = useState<
    'idle' | 'loading' | 'found' | 'unpublished' | 'not_found'
  >('idle');

  // Initial view decision
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const slug = extractSlugFromUrl();
    if (slug) {
      return 'public_profile';
    }
    return checkIsLoggedIn() ? 'dashboard' : 'landing';
  });

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [prefilledUsername, setPrefilledUsername] = useState<string>('');

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: ToastMessage['type'] = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      text,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Fetch and resolve a public profile dynamically by its slug.
   * Works independently of whether a user is logged in.
   */
  const loadPublicProfile = useCallback(
    async (slug: string) => {
      const clean = slug.toLowerCase().trim();
      setPublicSlug(clean);
      setPublicProfileState('loading');
      setCurrentView('public_profile');

      // 1. Try local Express backend API
      try {
        const res = await fetch(`/api/profile/${clean}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            if (data.profile.isPublic !== false) {
              setPublicProfile(data.profile);
              setPublicProfileState('found');
              recordProfileView();
              return;
            } else {
              setPublicProfileState('unpublished');
              return;
            }
          }
        } else if (res.status === 403) {
          setPublicProfileState('unpublished');
          return;
        }
      } catch {
        // Fall through to direct Supabase / local lookup
      }

      // 2. Try direct Supabase query
      if (isSupabaseConfigured) {
        try {
          const { profile: remote, isPrivate, error } = await fetchPublicProfileByUsername(clean);
          if (isPrivate) {
            setPublicProfileState('unpublished');
            return;
          }
          if (remote) {
            setPublicProfile(remote);
            setPublicProfileState('found');
            recordProfileView();
            return;
          }
        } catch (err) {
          console.warn('Direct Supabase fetch fallback warning:', err);
        }
      }

      // 3. Try loaded local profiles / mock directory
      const localMatch = allProfiles.find(
        (p) => p.username.toLowerCase() === clean
      ) || SAMPLE_PROFILES.find(
        (p) => p.username.toLowerCase() === clean
      );

      if (localMatch) {
        if (localMatch.isPublic !== false) {
          setPublicProfile(localMatch);
          setPublicProfileState('found');
          recordProfileView();
          return;
        } else {
          setPublicProfileState('unpublished');
          return;
        }
      }

      // 4. Not found anywhere
      setPublicProfileState('not_found');
    },
    [allProfiles]
  );

  // Restore authenticated session and profile on page refresh / mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      if (!isSupabaseConfigured) return;

      try {
        const {
          data: { session },
          error: sessionErr,
        } = await supabase.auth.getSession();

        if (sessionErr) {
          console.warn('Supabase getSession error:', sessionErr.message);
          return;
        }

        if (session?.user && isMounted) {
          const user = session.user;
          const metadata = user.user_metadata || {};
          const name = metadata.name || user.email?.split('@')[0] || 'User';
          const username = (
            metadata.username ||
            user.email?.split('@')[0] ||
            'user'
          )
            .toLowerCase()
            .replace(/[^a-z0-9_\-]/g, '');

          const account: UserAccount = {
            id: user.id,
            email: user.email || '',
            name,
            username,
            createdAt: user.created_at
              ? user.created_at.split('T')[0]
              : new Date().toISOString().split('T')[0],
          };

          setCurrentUser(account);
          saveCurrentUser(username);
          saveCurrentUserId(user.id);
          setLoggedIn(true);
          setIsLoggedInState(true);

          // Fetch user's own profile from Supabase
          const { profile: dbProfile } = await fetchProfileFromSupabase(user.id);

          if (dbProfile && isMounted) {
            setActiveProfile(dbProfile);
            saveActiveProfile(dbProfile);
          } else if (isMounted) {
            const blank = createBlankProfileForUser(account);
            blank.id = user.id;
            setActiveProfile(blank);
            saveActiveProfile(blank);
            await upsertProfileToSupabase(blank, user.id);
          }
        }
      } catch (err) {
        console.error('Session restore failure:', err);
      }

      // Populate directory with real public profiles
      try {
        const { profiles: remotePublics } = await fetchAllPublicProfilesFromSupabase();
        if (remotePublics && remotePublics.length > 0 && isMounted) {
          setAllProfiles(remotePublics);
        }
      } catch (err) {
        console.warn('Directory fetch warning:', err);
      }
    };

    restoreSession();

    // Listen to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && isMounted) {
        const user = session.user;
        const metadata = user.user_metadata || {};
        const account: UserAccount = {
          id: user.id,
          email: user.email || '',
          name: metadata.name || user.email?.split('@')[0] || 'User',
          username: (metadata.username || user.email?.split('@')[0] || 'user')
            .toLowerCase()
            .replace(/[^a-z0-9_\-]/g, ''),
          createdAt: user.created_at
            ? user.created_at.split('T')[0]
            : new Date().toISOString().split('T')[0],
        };
        setCurrentUser(account);
        saveCurrentUser(account.username);
        saveCurrentUserId(user.id);
        setLoggedIn(true);
        setIsLoggedInState(true);
      } else if (event === 'SIGNED_OUT' && isMounted) {
        setCurrentUser(null);
        clearCurrentUser();
        clearCurrentUserId();
        setLoggedIn(false);
        setIsLoggedInState(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Listen to URL changes (both browser popstate and hashchange)
  useEffect(() => {
    const handleLocationChange = () => {
      const slug = extractSlugFromUrl();
      if (slug) {
        loadPublicProfile(slug);
      } else {
        const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
        if (path === 'dashboard' && checkIsLoggedIn()) {
          setCurrentView('dashboard');
        } else if (!path || path === 'home' || path === 'landing') {
          setCurrentView('landing');
        }
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [loadPublicProfile]);

  // Sync profile changes to state, local storage & Supabase
  const handleUpdateProfile = async (updated: ConnProfile) => {
    setActiveProfile(updated);
    saveActiveProfile(updated);
    setAllProfiles(loadAllProfiles());

    // If viewing own public profile, keep public view updated immediately
    if (publicProfile && publicProfile.id === updated.id) {
      setPublicProfile(updated);
    }

    // Persist to Supabase if authenticated
    const userId = loadCurrentUserId() || currentUser?.id;
    if (userId && isSupabaseConfigured) {
      setSaveStatus('saving');
      try {
        const { error } = await upsertProfileToSupabase(updated, userId);
        if (error) {
          console.error('Supabase profile sync error:', error);
          setSaveStatus('error');
          showToast(`Cloud sync warning: ${error.message}`, 'error');
        } else {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2500);
        }
      } catch (err: any) {
        setSaveStatus('error');
        console.error('Unexpected save error:', err);
      }
    }
  };

  // Select another profile (e.g. from landing page sample profiles)
  const handleSelectProfile = (profile: ConnProfile) => {
    setPublicProfile(profile);
    setPublicSlug(profile.username);
    setPublicProfileState('found');
    setCurrentView('public_profile');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${profile.username}`);
    }
    showToast(`Loaded profile @${profile.username}`);
  };

  const handleLoginSuccess = async (user: UserAccount) => {
    setCurrentUser(user);
    saveCurrentUser(user.username);
    if (user.id) saveCurrentUserId(user.id);
    setLoggedIn(true);
    setIsLoggedInState(true);

    if (user.id && isSupabaseConfigured) {
      const { profile: dbProfile } = await fetchProfileFromSupabase(user.id);
      if (dbProfile) {
        setActiveProfile(dbProfile);
        saveActiveProfile(dbProfile);
      } else {
        const blank = createBlankProfileForUser(user);
        blank.id = user.id;
        setActiveProfile(blank);
        saveActiveProfile(blank);
        await upsertProfileToSupabase(blank, user.id);
      }
    } else {
      setActiveProfile(loadActiveProfile());
    }

    setCurrentView('dashboard');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/dashboard');
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    setCurrentUser(null);
    clearCurrentUser();
    clearCurrentUserId();
    setLoggedIn(false);
    setIsLoggedInState(false);
    setActiveProfile(SAMPLE_PROFILES[0]);
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    showToast('Signed out of workspace', 'info');
  };

  // Navigating views with URL update
  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'dashboard') {
        window.history.pushState(null, '', '/dashboard');
      } else if (view === 'landing') {
        window.history.pushState(null, '', '/');
      } else if (view === 'public_profile') {
        const slug = activeProfile.username;
        setPublicProfile(activeProfile);
        setPublicSlug(slug);
        setPublicProfileState('found');
        window.history.pushState(null, '', `/${slug}`);
      }
    }
  };

  const handleClaimUsername = (slugToClaim: string) => {
    setPrefilledUsername(slugToClaim);
    setAuthMode('signup');
    setIsAuthOpen(true);
  };

  return (
    <div
      className={`min-h-screen ${
        currentView === 'dashboard' ? 'lg:h-screen lg:overflow-hidden' : ''
      } bg-[#FAF8F5] text-[#1C1B18] font-sans-ui flex flex-col antialiased`}
    >
      {/* Navigation header bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        activeProfile={activeProfile}
        isLoggedIn={isLoggedIn}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onOpenShare={() => setIsShareOpen(true)}
        onSelectProfile={handleSelectProfile}
        allProfiles={allProfiles}
      />

      {/* Main View Switcher */}
      <div
        className={`flex-1 min-h-0 ${
          currentView === 'dashboard' ? 'lg:overflow-hidden lg:flex lg:flex-col' : ''
        }`}
      >
        {currentView === 'landing' && (
          <LandingPage
            onSignUp={() => {
              if (isLoggedIn) {
                handleNavigate('dashboard');
              } else {
                setAuthMode('signup');
                setIsAuthOpen(true);
              }
            }}
            onLogin={() => {
              if (isLoggedIn) {
                handleNavigate('dashboard');
              } else {
                setAuthMode('login');
                setIsAuthOpen(true);
              }
            }}
            onSelectSampleProfile={(profile) => {
              handleSelectProfile(profile);
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <Workspace
            profile={activeProfile}
            onChangeProfile={handleUpdateProfile}
            onShowToast={showToast}
            onOpenShare={() => setIsShareOpen(true)}
            onViewPublicProfile={() => handleNavigate('public_profile')}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'public_profile' && (
          <>
            {publicProfileState === 'loading' && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 text-[#1C1B18] animate-spin" />
                <p className="font-mono-code text-xs text-[#6B665E]">
                  Loading @{publicSlug}&apos;s profile...
                </p>
              </div>
            )}

            {publicProfileState === 'unpublished' && (
              <UnpublishedProfileView
                username={publicSlug}
                isLoggedIn={isLoggedIn}
                onGoHome={() => handleNavigate('landing')}
                onGoDashboard={() => handleNavigate('dashboard')}
              />
            )}

            {publicProfileState === 'not_found' && (
              <ProfileNotFoundView
                username={publicSlug}
                onGoHome={() => handleNavigate('landing')}
                onClaimUsername={handleClaimUsername}
              />
            )}

            {publicProfileState === 'found' && publicProfile && (
              <PublicProfile
                profile={publicProfile}
                onOpenShare={() => setIsShareOpen(true)}
                onShowToast={showToast}
                onNavigateHome={() => handleNavigate('landing')}
              />
            )}
          </>
        )}
      </div>

      {/* Modals & Overlays */}
      <ShareModal
        profile={currentView === 'public_profile' && publicProfile ? publicProfile : activeProfile}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onShowToast={showToast}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={handleLoginSuccess}
        onShowToast={showToast}
      />

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
