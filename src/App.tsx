import React, { useState, useEffect } from 'react';
import { ViewMode, ConnProfile, ToastMessage, UserAccount } from './types';
import { SAMPLE_PROFILES } from './data/mockData';
import {
  loadActiveProfile,
  saveActiveProfile,
  loadAllProfiles,
  checkIsLoggedIn,
  setLoggedIn,
  recordProfileView,
} from './lib/storage';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Workspace } from './components/Dashboard/Workspace';
import { PublicProfile } from './components/PublicProfile';
import { ToastContainer } from './components/Toast';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [activeProfile, setActiveProfile] = useState<ConnProfile>(loadActiveProfile());
  const [allProfiles, setAllProfiles] = useState<ConnProfile[]>(loadAllProfiles());
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => checkIsLoggedIn());
  const [currentView, setCurrentView] = useState<ViewMode>(() => (checkIsLoggedIn() ? 'dashboard' : 'landing'));

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

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

  // Sync profile changes to state & storage
  const handleUpdateProfile = (updated: ConnProfile) => {
    setActiveProfile(updated);
    saveActiveProfile(updated);
    setAllProfiles(loadAllProfiles());
  };

  // Select another profile (e.g. Marcus Chen vs Elena Rostova)
  const handleSelectProfile = (profile: ConnProfile) => {
    setActiveProfile(profile);
    saveActiveProfile(profile);
    showToast(`Loaded profile @${profile.username}`);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setLoggedIn(true);
    setIsLoggedInState(true);

    // Look for matching profile or generate new one
    const cleanUsername = user.username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const currentList = loadAllProfiles();
    const existing = currentList.find(
      (p) => p.username.toLowerCase() === cleanUsername
    );

    if (existing) {
      setActiveProfile(existing);
      saveActiveProfile(existing);
    } else {
      const newProfile: ConnProfile = {
        id: `profile-${cleanUsername}-${Date.now()}`,
        username: cleanUsername,
        name: user.name || cleanUsername,
        role: 'Creator & Technologist',
        organization: 'Independent',
        bio: 'Welcome to my space. Curating projects, notes, and links.',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400`,
        themeId: 'warm-paper',
        isPublic: true,
        contactEmail: user.email,
        links: [
          {
            id: `link-${Date.now()}-1`,
            title: 'Welcome to My Conn Space',
            url: 'https://conn.bio',
            description: 'My newly created personal link page.',
            category: 'Writing & Essays',
            isActive: true,
            clicks: 0,
            order: 1,
            isFeatured: true,
          },
          {
            id: `link-${Date.now()}-2`,
            title: 'Projects & Repositories',
            url: `https://github.com/${cleanUsername}`,
            category: 'Projects & Work',
            isActive: true,
            clicks: 0,
            order: 2,
            iconName: 'Folder',
          },
        ],
        socials: [
          { platform: 'website', url: 'https://conn.bio' },
          { platform: 'email', url: `mailto:${user.email}` },
        ],
      };
      setActiveProfile(newProfile);
      saveActiveProfile(newProfile);
      setAllProfiles(loadAllProfiles());
    }
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setIsLoggedInState(false);
    setCurrentView('landing');
    showToast('Signed out of workspace', 'info');
  };

  // Sync profile when updated externally (e.g. from background clicks or storage)
  useEffect(() => {
    const handleProfileSync = () => {
      setActiveProfile(loadActiveProfile());
      setAllProfiles(loadAllProfiles());
    };
    window.addEventListener('conn_profile_updated', handleProfileSync);
    return () => window.removeEventListener('conn_profile_updated', handleProfileSync);
  }, []);

  // Listen to hash routes e.g. #elenarostova to view public profiles
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        const found = allProfiles.find(
          (p) => p.username.toLowerCase() === hash.toLowerCase()
        );
        if (found) {
          setActiveProfile(found);
          setCurrentView('public_profile');
          recordProfileView();
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allProfiles]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1B18] font-sans-ui flex flex-col antialiased">
      {/* Navigation header bar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
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
      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onSignUp={() => {
              if (isLoggedIn) {
                setCurrentView('dashboard');
              } else {
                setAuthMode('signup');
                setIsAuthOpen(true);
              }
            }}
            onLogin={() => {
              if (isLoggedIn) {
                setCurrentView('dashboard');
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
            onViewPublicProfile={() => setCurrentView('public_profile')}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'public_profile' && (
          <PublicProfile
            profile={activeProfile}
            onOpenShare={() => setIsShareOpen(true)}
            onShowToast={showToast}
            onBack={() => setCurrentView(isLoggedIn ? 'dashboard' : 'landing')}
          />
        )}
      </div>

      {/* Modals & Overlays */}
      <ShareModal
        profile={activeProfile}
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
