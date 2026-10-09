import React, { useState } from 'react';
import { ConnProfile, DashboardTab } from '../../types';
import { LinksManager } from './LinksManager';
import { ProfileEditor } from './ProfileEditor';
import { ThemeSelector } from './ThemeSelector';
import { AnalyticsView } from './AnalyticsView';
import { SettingsView } from './SettingsView';
import { IdentityHubManager } from './IdentityHubManager';
import { TimelineManager } from './TimelineManager';
import { VisualLayoutBuilder } from './VisualLayoutBuilder';
import { PublicProfile } from '../PublicProfile';
import {
  Link as LinkIcon,
  User,
  Palette,
  BarChart2,
  Settings,
  Smartphone,
  Monitor,
  ExternalLink,
  Eye,
  CheckCircle2,
  Share2,
  Layers,
  Sparkles,
  Sliders,
  Clock,
} from 'lucide-react';

interface WorkspaceProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
  onOpenShare: () => void;
  onViewPublicProfile: () => void;
  onLogout: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  profile,
  onChangeProfile,
  onShowToast,
  onOpenShare,
  onViewPublicProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('links');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Compute profile completion rate
  const completionTasks = [
    { label: 'Avatar set', done: !!profile.avatarUrl },
    { label: 'Bio written', done: profile.bio.length > 10 },
    { label: 'At least 3 links', done: profile.links.length >= 3 },
    { label: 'Work timeline added', done: (profile.timeline || []).length > 0 },
    { label: 'Social profiles linked', done: profile.socials.length > 0 },
    { label: 'Custom status badge', done: !!profile.statusBadge },
  ];
  const completedCount = completionTasks.filter((t) => t.done).length;
  const completionPercentage = Math.round((completedCount / completionTasks.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1B18] font-sans-ui flex flex-col">
      {/* Sub-header status bar */}
      <div className="bg-[#1C1B18] text-[#FAF8F5] px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono-code">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Workspace
          </span>
          <span className="hidden sm:inline text-[#9C978E]">|</span>
          <span className="hidden sm:inline text-[#FAF8F5]/80">conn.bio/{profile.username}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 text-xs text-[#9C978E] hover:text-[#FAF8F5] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button
            onClick={onViewPublicProfile}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] text-[#1C1B18] hover:bg-[#E8E4D9] rounded-lg font-medium text-[11px] transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> Public View
          </button>
        </div>
      </div>

      {/* Main 3-Pane Modular Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* LEFT PANE: Navigation & Status (lg:col-span-2) */}
        <aside className="lg:col-span-2 border-r border-[#E8E4D9] bg-[#FAF8F5] p-4 sm:p-5 flex flex-col justify-between space-y-6 lg:sticky lg:top-[57px] lg:self-start lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-mono-code text-[#6B665E] block mb-3 font-semibold">
                WORKSPACE
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('identity_hub')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'identity_hub'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 shrink-0 text-[#D49A3E]" />
                    <span>Living Identity Hub</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#C85A32] text-white rounded">HUB</span>
                </button>

                <button
                  onClick={() => setActiveTab('links')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'links'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 shrink-0" />
                  <span>Links & Items</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 shrink-0 text-[#C85A32]" />
                    <span>Work & Timeline</span>
                  </div>
                  {(profile.timeline || []).length > 0 && (
                    <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.2 bg-[#E8E4D9] text-[#1C1B18] rounded-full">
                      {(profile.timeline || []).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'profile'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>Profile Identity</span>
                </button>

                <button
                  onClick={() => setActiveTab('visual_builder')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'visual_builder'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sliders className="w-4 h-4 shrink-0 text-[#C85A32]" />
                    <span>Visual Page Builder</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#1C1B18] text-white border border-white/20 rounded">BUILDER</span>
                </button>

                <button
                  onClick={() => setActiveTab('themes')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'themes'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>Themes & Design</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'settings'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Settings</span>
                </button>
              </nav>
            </div>

            {/* Profile Health Progress */}
            <div className="p-4 bg-white border border-[#E8E4D9] rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1C1B18]">Profile Strength</span>
                <span className="font-mono-code font-bold text-[#C85A32]">{completionPercentage}%</span>
              </div>

              <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1C1B18] transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <p className="text-[11px] text-[#6B665E] leading-tight pt-1">
                {completionPercentage === 100
                  ? 'Your profile is fully curated and published!'
                  : 'Add social links or custom status to complete your space.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E4D9]">
            <div className="flex items-center gap-3 mb-3">
              <img src={profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-[#E8E4D9]" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium truncate">{profile.name}</div>
                <div className="text-[10px] text-[#6B665E] truncate font-mono-code">@{profile.username}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full text-center text-xs text-[#6B665E] hover:text-red-600 font-medium transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* CENTER PANE: Active Editor Canvas or Full Visual Page Builder */}
        {activeTab === 'visual_builder' ? (
          <main className="lg:col-span-10 bg-[#FAF8F5] p-5 sm:p-8 overflow-y-auto">
            <VisualLayoutBuilder
              profile={profile}
              onUpdateProfile={onChangeProfile}
              onShowToast={onShowToast}
            />
          </main>
        ) : (
          <>
            <main className="lg:col-span-5 border-r border-[#E8E4D9] bg-[#FAF8F5] p-5 sm:p-8">
              {activeTab === 'identity_hub' && (
                <IdentityHubManager
                  profile={profile}
                  onChangeProfile={onChangeProfile}
                  onShowToast={onShowToast}
                />
              )}

              {activeTab === 'links' && (
                <LinksManager
                  profile={profile}
                  onChangeProfile={onChangeProfile}
                  onShowToast={onShowToast}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineManager
                  profile={profile}
                  onChangeProfile={onChangeProfile}
                  onShowToast={onShowToast}
                  onViewPublicProfile={onViewPublicProfile}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileEditor
                  profile={profile}
                  onChangeProfile={onChangeProfile}
                  onShowToast={onShowToast}
                />
              )}

              {activeTab === 'themes' && (
                <ThemeSelector
                  profile={profile}
                  onChangeProfile={onChangeProfile}
                  onShowToast={onShowToast}
                />
              )}

              {activeTab === 'analytics' && <AnalyticsView profile={profile} />}

              {activeTab === 'settings' && (
                <SettingsView
                  profile={profile}
                  onChangeProfile={onChangeProfile}
                  onShowToast={onShowToast}
                  onLogout={onLogout}
                />
              )}
            </main>

            {/* RIGHT PANE: Live Sticky Interactive Preview (lg:col-span-5) */}
            <aside className="lg:col-span-5 bg-[#EFECE6] p-4 sm:p-6 lg:p-7 flex flex-col items-center justify-start relative">
              <div className="w-full lg:sticky lg:top-[72px] lg:self-start flex flex-col items-center justify-start max-h-[calc(100vh-80px)]">
                {/* Preview Header controls */}
                <div
                  className={`w-full flex items-center justify-between mb-3.5 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-[#E8E4D9] shadow-2xs transition-all ${
                    previewDevice === 'mobile' ? 'max-w-[420px]' : 'max-w-xl'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        previewDevice === 'mobile' ? 'bg-[#1C1B18] text-[#FAF8F5]' : 'text-[#6B665E] hover:text-[#1C1B18]'
                      }`}
                      title="Mobile View"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Mobile</span>
                    </button>

                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        previewDevice === 'desktop' ? 'bg-[#1C1B18] text-[#FAF8F5]' : 'text-[#6B665E] hover:text-[#1C1B18]'
                      }`}
                      title="Desktop View"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Full</span>
                    </button>
                  </div>

                  <button
                    onClick={onViewPublicProfile}
                    className="text-[11px] font-medium text-[#6B665E] hover:text-[#1C1B18] flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#E8E4D9]/50 transition-colors cursor-pointer"
                  >
                    Open Live <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Live Phone/Canvas Frame (Slightly Zoomed) */}
                <div
                  className={`transition-all duration-300 w-full overflow-hidden shadow-2xl border border-[#1C1B18]/10 flex flex-col ${
                    previewDevice === 'mobile'
                      ? 'max-w-[420px] rounded-[42px] border-[9px] border-[#1C1B18] bg-white h-[calc(100vh-165px)] max-h-[790px] min-h-[560px]'
                      : 'max-w-xl rounded-2xl border-2 border-[#E8E4D9] bg-white h-[calc(100vh-165px)] max-h-[790px] min-h-[560px]'
                  }`}
                >
                  {/* Phone Notch/Speaker Header if mobile */}
                  {previewDevice === 'mobile' && (
                    <div className="w-full bg-[#1C1B18] h-6 flex justify-center items-center shrink-0">
                      <div className="w-20 h-3 bg-black rounded-b-xl" />
                    </div>
                  )}

                  <div className="flex-1 h-full overflow-y-auto min-h-0 bg-white">
                    <PublicProfile
                      profile={profile}
                      onOpenShare={onOpenShare}
                      onShowToast={onShowToast}
                      isEmbeddedPreview={true}
                    />
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
};
