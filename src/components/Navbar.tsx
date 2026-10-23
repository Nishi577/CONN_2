import React, { useState } from 'react';
import { ViewMode, ConnProfile } from '../types';
import {
  Sparkles,
  Layout,
  Eye,
  Share2,
  User,
  LogOut,
  ChevronDown,
  Globe,
  Home,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  activeProfile: ConnProfile;
  isLoggedIn: boolean;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenShare: () => void;
  onSelectProfile: (profile: ConnProfile) => void;
  allProfiles: ConnProfile[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeProfile,
  isLoggedIn,
  onOpenAuth,
  onOpenShare,
  onSelectProfile,
  allProfiles,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (currentView === 'public_profile') return null; // Public profile has its own top floating header

  const handleMobileNav = (view: ViewMode) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E4D9] px-4 sm:px-8 py-3.5 font-sans-ui text-[#1C1B18]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleMobileNav('landing')}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            <span className="font-serif-display text-3xl font-normal tracking-tight text-[#1C1B18] group-hover:opacity-80 transition-opacity">
              Conn.
            </span>
            <span className="hidden sm:inline text-[11px] uppercase font-mono-code px-2.5 py-0.5 rounded-full border border-[#E8E4D9] text-[#6B665E]">
              Editorial Profiles
            </span>
          </button>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-[#E8E4D9]/60 text-[#1C1B18]'
                  : 'text-[#6B665E] hover:text-[#1C1B18]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {isLoggedIn && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-[#1C1B18] text-[#FAF8F5]'
                    : 'text-[#6B665E] hover:text-[#1C1B18]'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Dashboard Workspace</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('public_profile')}
              className="px-3 py-1.5 rounded-lg text-[#6B665E] hover:text-[#1C1B18] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public View</span>
            </button>
          </nav>
        </div>

        {/* Profile Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share Button */}
          <button
            onClick={onOpenShare}
            className="p-2 border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl text-[#6B665E] hover:text-[#1C1B18] transition-colors cursor-pointer"
            title="Share profile link"
            aria-label="Share profile link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Auth Button Group (desktop & tablet) */}
          {!isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-medium text-[#6B665E] hover:text-[#1C1B18] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1 bg-white border border-[#E8E4D9] rounded-xl hover:border-[#1C1B18] transition-colors cursor-pointer"
            >
              <img
                src={activeProfile.avatarUrl}
                alt=""
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-[#1C1B18]">@{activeProfile.username}</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border border-[#E8E4D9] hover:border-[#1C1B18] text-[#1C1B18] rounded-xl transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 mt-3 border-t border-[#E8E4D9] flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleMobileNav('landing')}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 text-left transition-colors ${
              currentView === 'landing'
                ? 'bg-[#E8E4D9]/70 text-[#1C1B18]'
                : 'text-[#6B665E] hover:bg-[#E8E4D9]/30 hover:text-[#1C1B18]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          {isLoggedIn && (
            <button
              onClick={() => handleMobileNav('dashboard')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 text-left transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-[#1C1B18] text-[#FAF8F5]'
                  : 'text-[#6B665E] hover:bg-[#E8E4D9]/30 hover:text-[#1C1B18]'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Dashboard Workspace</span>
            </button>
          )}

          <button
            onClick={() => handleMobileNav('public_profile')}
            className="w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 text-left text-[#6B665E] hover:bg-[#E8E4D9]/30 hover:text-[#1C1B18] transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Public Profile View</span>
          </button>

          {/* Mobile Auth actions */}
          <div className="pt-2 mt-1 border-t border-[#E8E4D9] flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 py-2 text-xs font-medium border border-[#E8E4D9] text-[#1C1B18] bg-white rounded-xl text-center hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="flex-1 py-2 text-xs font-medium bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] rounded-xl text-center transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between px-2 py-1 bg-white border border-[#E8E4D9] rounded-xl">
                <div className="flex items-center gap-2">
                  <img
                    src={activeProfile.avatarUrl}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-[#1C1B18]">@{activeProfile.username}</span>
                </div>
                <button
                  onClick={() => handleMobileNav('dashboard')}
                  className="text-xs font-medium text-[#C85A32] hover:underline px-2 py-1"
                >
                  Open Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
