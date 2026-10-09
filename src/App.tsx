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
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setIsLoggedInState(false);
    setCurrentView('landing');
    showToast('Signed out of workspace', 'info');
  };

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
    <div
      className={`min-h-screen ${
        currentView === 'dashboard' ? 'lg:h-screen lg:overflow-hidden' : ''
      } bg-[#FAF8F5] text-[#1C1B18] font-sans-ui flex flex-col antialiased`}
    >
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
      <div
        className={`flex-1 min-h-0 ${
          currentView === 'dashboard' ? 'lg:overflow-hidden lg:flex lg:flex-col' : ''
        }`}
      >
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
