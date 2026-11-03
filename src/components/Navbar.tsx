import React from 'react';
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
  if (currentView === 'public_profile') return null; // Public profile has its own top floating header

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4D9] px-4 sm:px-8 py-3.5 font-sans-ui text-[#1C1B18]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 group text-left"
          >
            <span className="font-serif-display text-3xl font-normal tracking-tight text-[#1C1B18] group-hover:opacity-80 transition-opacity">
              Conn.
            </span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
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
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
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
              className="px-3 py-1.5 rounded-lg text-[#6B665E] hover:text-[#1C1B18] transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public View</span>
            </button>
          </nav>
        </div>

        {/* Profile Switcher & Actions */}
        <div className="flex items-center gap-3">
          {/* Sample Profile Selector Dropdown */}
          <div className="hidden sm:flex items-center gap-2 border border-[#E8E4D9] bg-white rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] uppercase font-mono-code text-[#6B665E]">Active:</span>
            <select
              value={activeProfile.username}
              onChange={(e) => {
                const selected = allProfiles.find((p) => p.username === e.target.value);
                if (selected) onSelectProfile(selected);
              }}
              className="bg-transparent font-medium text-[#1C1B18] outline-none text-xs cursor-pointer"
            >
              {allProfiles.map((p) => (
                <option key={p.id} value={p.username}>
                  {p.name} (@{p.username})
                </option>
              ))}
            </select>
          </div>

          {/* Share Button */}
          <button
            onClick={onOpenShare}
            className="p-2 border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl text-[#6B665E] hover:text-[#1C1B18] transition-colors"
            title="Share profile link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Auth Button Group */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-medium text-[#6B665E] hover:text-[#1C1B18] px-3 py-1.5 rounded-lg transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-2xs"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-white border border-[#E8E4D9] rounded-xl hover:border-[#1C1B18] transition-colors"
            >
              <img
                src={activeProfile.avatarUrl}
                alt=""
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-[#1C1B18]">@{activeProfile.username}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
