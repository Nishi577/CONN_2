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
  HelpCircle,
  X,
  ArrowRight,
  Info,
  BookOpen,
  MousePointer,
  Compass,
} from 'lucide-react';

interface WorkspaceProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
  onOpenShare: () => void;
  onViewPublicProfile: () => void;
  onLogout: () => void;
}

interface FeatureGuideItem {
  id: DashboardTab;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  whatItDoes: string;
  publicOutput: string;
  category: 'Content' | 'Design' | 'Insights';
}

const FEATURE_GUIDES: FeatureGuideItem[] = [
  {
    id: 'links',
    icon: <LinkIcon className="w-4 h-4 text-[#C85A32]" />,
    title: 'Links & Content',
    subtitle: 'Articles, essays, projects, and media links',
    whatItDoes: 'Add and categorize your external links, blog posts, repositories, and media. Mark top links as "Featured" to pin them.',
    publicOutput: 'Appears as clean, categorized editorial link cards with click tracking, optional badges (e.g. "NEW"), and custom thumbnails.',
    category: 'Content',
  },
  {
    id: 'profile',
    icon: <User className="w-4 h-4 text-[#D49A3E]" />,
    title: 'Profile Identity',
    subtitle: 'Bio, avatar, handle, and social networks',
    whatItDoes: 'Configure your profile photo, display name, handle (@username), bio summary, location, and social media links.',
    publicOutput: 'Renders the header banner of your profile with your avatar, bio text, custom status badge, and clickable social icons.',
    category: 'Content',
  },
  {
    id: 'timeline',
    icon: <Clock className="w-4 h-4 text-[#C85A32]" />,
    title: 'Career & Work Timeline',
    subtitle: 'Work history, education, and milestones',
    whatItDoes: 'Add past and current roles, companies, dates, key responsibilities, and major life achievements.',
    publicOutput: 'Renders an elegant chronological timeline stream on your public profile with company badges and role details.',
    category: 'Content',
  },
  {
    id: 'identity_hub',
    icon: <Sparkles className="w-4 h-4 text-[#D49A3E]" />,
    title: 'Living Identity Hub ("Now")',
    subtitle: 'What you are reading, building, and availability',
    whatItDoes: 'Share dynamic live widgets: current book, project focus, learning goals, and availability for consulting.',
    publicOutput: 'Displays dynamic interactive cards (e.g. book covers, project highlights) and a pulsing status badge.',
    category: 'Content',
  },
  {
    id: 'themes',
    icon: <Palette className="w-4 h-4 text-[#385842]" />,
    title: 'Themes & Visual Design',
    subtitle: 'Palettes, typography, and card geometry',
    whatItDoes: 'Select from 12 curated editorial themes or customize colors, fonts (Serif/Sans/Mono), backgrounds, and hover animations.',
    publicOutput: 'Instantly changes the colors, fonts, card corner radii, and ambient canvas textures of your public profile.',
    category: 'Design',
  },
  {
    id: 'visual_builder',
    icon: <Sliders className="w-4 h-4 text-[#C85A32]" />,
    title: 'Visual Page Builder',
    subtitle: 'Reorder sections and customize page layout',
    whatItDoes: 'Drag and reorder which content blocks appear first (e.g., Bio -> Featured Links -> Timeline -> Living Hub).',
    publicOutput: 'Controls the exact vertical structure and ordering of content blocks on your public page.',
    category: 'Design',
  },
  {
    id: 'analytics',
    icon: <BarChart2 className="w-4 h-4 text-[#4E78E6]" />,
    title: 'Analytics & Traffic',
    subtitle: 'Visitor views and click statistics',
    whatItDoes: 'Track how many people visit your profile, click your links, and which platforms refer the most visitors.',
    publicOutput: 'Private dashboard view only. Your public page stays fast, lightweight, and completely ad/cookie free.',
    category: 'Insights',
  },
];

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
  const [isHelpGuideOpen, setIsHelpGuideOpen] = useState(false);

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
    <div className="h-full flex-1 flex flex-col min-h-0 bg-[#FAF8F5] text-[#1C1B18] font-sans-ui overflow-hidden">
      {/* Sub-header status bar */}
      <div className="shrink-0 bg-[#1C1B18] text-[#FAF8F5] px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono-code z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Workspace
          </span>
          <span className="hidden sm:inline text-[#9C978E]">|</span>
          <span className="hidden sm:inline text-[#FAF8F5]/80">conn.bio/{profile.username}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Feature Guide Help Button */}
          <button
            type="button"
            onClick={() => setIsHelpGuideOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs transition-colors"
            title="Open Feature Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#D49A3E]" />
            <span className="hidden sm:inline">Feature Guide</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 text-xs text-[#9C978E] hover:text-[#FAF8F5] transition-colors px-2 py-1"
          >
            <Share2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={onViewPublicProfile}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] text-[#1C1B18] hover:bg-[#E8E4D9] rounded-lg font-medium text-[11px] transition-all shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" /> Public View
          </button>
        </div>
      </div>

      {/* Main 3-Pane Modular Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 h-full overflow-hidden">
        {/* LEFT PANE: Navigation & Status (lg:col-span-2) - STATIC */}
        <aside className="lg:col-span-2 border-r border-[#E8E4D9] bg-[#FAF8F5] p-4 sm:p-5 flex flex-col justify-between space-y-6 overflow-y-auto h-full custom-scrollbar shrink-0 select-none">
          <div className="space-y-6">
            {/* GROUP 1: CONTENT & IDENTITY */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-mono-code text-[#6B665E] block mb-2 font-bold">
                Content & Profile
              </span>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('links')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    activeTab === 'links'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 shrink-0 text-[#C85A32]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">Links & Content</div>
                    <div className={`text-[10px] truncate ${activeTab === 'links' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      Articles, projects & media
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    activeTab === 'profile'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <User className="w-4 h-4 shrink-0 text-[#D49A3E]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">Profile Identity</div>
                    <div className={`text-[10px] truncate ${activeTab === 'profile' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      Bio, avatar & socials
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    activeTab === 'timeline'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Clock className="w-4 h-4 shrink-0 text-[#C85A32]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">Work & Timeline</div>
                      <div className={`text-[10px] truncate ${activeTab === 'timeline' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                        Career & milestones
                      </div>
                    </div>
                  </div>
                  {(profile.timeline || []).length > 0 && (
                    <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.2 bg-[#E8E4D9] text-[#1C1B18] rounded-full shrink-0">
                      {(profile.timeline || []).length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('identity_hub')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    activeTab === 'identity_hub'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Sparkles className="w-4 h-4 shrink-0 text-[#D49A3E]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">Living Hub ("Now")</div>
                      <div className={`text-[10px] truncate ${activeTab === 'identity_hub' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                        Focus, reading & status
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#C85A32] text-white rounded shrink-0">
                    LIVE
                  </span>
                </button>
              </nav>
            </div>

            {/* GROUP 2: DESIGN & LAYOUT */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-mono-code text-[#6B665E] block mb-2 font-bold">
                Design & Layout
              </span>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('themes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    activeTab === 'themes'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <Palette className="w-4 h-4 shrink-0 text-[#385842]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">Themes & Appearance</div>
                    <div className={`text-[10px] truncate ${activeTab === 'themes' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      Palettes, fonts & shapes
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('visual_builder')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    activeTab === 'visual_builder'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Sliders className="w-4 h-4 shrink-0 text-[#C85A32]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">Visual Page Builder</div>
                      <div className={`text-[10px] truncate ${activeTab === 'visual_builder' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                        Reorder sections
                      </div>
                    </div>
                  </div>
                </button>
              </nav>
            </div>

            {/* GROUP 3: INSIGHTS & ACCOUNT */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-mono-code text-[#6B665E] block mb-2 font-bold">
                Insights & Settings
              </span>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    activeTab === 'analytics'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 shrink-0 text-[#4E78E6]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">Analytics</div>
                    <div className={`text-[10px] truncate ${activeTab === 'analytics' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      Views & link clicks
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    activeTab === 'settings'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0 text-[#6B665E]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">Settings</div>
                    <div className={`text-[10px] truncate ${activeTab === 'settings' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      Account & data export
                    </div>
                  </div>
                </button>
              </nav>
            </div>

            {/* Profile Health Progress */}
            <div className="p-4 bg-white border border-[#E8E4D9] rounded-2xl space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1C1B18]">Profile Readiness</span>
                <span className="font-mono-code font-bold text-[#C85A32]">{completionPercentage}%</span>
              </div>

              <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1C1B18] transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <p className="text-[11px] text-[#6B665E] leading-tight">
                {completionPercentage === 100
                  ? '✨ Your space is fully complete and ready to share!'
                  : 'Add links or status to complete your public profile.'}
              </p>
            </div>
          </div>

          {/* User Account & Sign Out */}
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

        {/* CENTER PANE: Active Editor Canvas or Full Visual Page Builder - SCROLLABLE WITH SMOOTH EFFECT */}
        {activeTab === 'visual_builder' ? (
          <main className="lg:col-span-10 bg-[#FAF8F5] p-5 sm:p-8 overflow-y-auto h-full scroll-smooth custom-scrollbar pb-24 focus:outline-hidden">
            <VisualLayoutBuilder
              profile={profile}
              onUpdateProfile={onChangeProfile}
              onShowToast={onShowToast}
            />
          </main>
        ) : (
          <>
            <main
              id="dashboard-center-scroll-panel"
              className="lg:col-span-5 border-r border-[#E8E4D9] bg-[#FAF8F5] p-5 sm:p-8 overflow-y-auto h-full scroll-smooth custom-scrollbar pb-28 focus:outline-hidden relative"
            >
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

            {/* RIGHT PANE: Live Interactive Preview (lg:col-span-5) - STATIC */}
            <aside className="lg:col-span-5 bg-[#EFECE6] p-4 sm:p-6 lg:p-7 flex flex-col items-center justify-start overflow-hidden h-full relative shrink-0">
              {/* Preview Header controls */}
              <div
                className={`w-full flex items-center justify-between mb-3 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-[#E8E4D9] shadow-2xs shrink-0 transition-all ${
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
                    <span className="text-[11px]">Desktop</span>
                  </button>
                </div>

                <button
                  onClick={onViewPublicProfile}
                  className="text-[11px] font-medium text-[#6B665E] hover:text-[#1C1B18] flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#E8E4D9]/50 transition-colors cursor-pointer"
                >
                  <span>Open Live</span> <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Helper badge */}
              <div
                className={`w-full mb-3 px-3 py-1.5 bg-[#FAF8F5]/80 border border-[#E8E4D9] rounded-xl text-[10px] text-[#6B665E] flex items-center justify-center gap-1.5 text-center shrink-0 transition-all ${
                  previewDevice === 'mobile' ? 'max-w-[420px]' : 'max-w-xl'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#D49A3E] shrink-0" />
                <span>Live Preview &bull; Changes on the left update here in real-time</span>
              </div>

              {/* Live Phone/Canvas Frame */}
              <div className="w-full flex-1 min-h-0 flex items-center justify-center">
                <div
                  className={`transition-all duration-300 w-full overflow-hidden shadow-2xl border border-[#1C1B18]/10 flex flex-col h-full ${
                    previewDevice === 'mobile'
                      ? 'max-w-[420px] rounded-[42px] border-[9px] border-[#1C1B18] bg-white max-h-[780px]'
                      : 'max-w-xl rounded-2xl border-2 border-[#E8E4D9] bg-white max-h-[780px]'
                  }`}
                >
                  {/* Phone Notch/Speaker Header if mobile */}
                  {previewDevice === 'mobile' && (
                    <div className="w-full bg-[#1C1B18] h-6 flex justify-center items-center shrink-0">
                      <div className="w-20 h-3 bg-black rounded-b-xl" />
                    </div>
                  )}

                  <div className="flex-1 h-full overflow-y-auto min-h-0 bg-white custom-scrollbar">
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

      {/* FEATURE GUIDE MODAL */}
      {isHelpGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8E4D9] rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[88vh] overflow-y-auto shadow-2xl space-y-6 font-sans-ui text-[#1C1B18]">
            <div className="flex items-start justify-between border-b border-[#E8E4D9] pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-[#1C1B18] text-white rounded-xl">
                  <Compass className="w-5 h-5 text-[#D49A3E]" />
                </span>
                <div>
                  <h3 className="font-serif-display text-2xl font-normal">Conn Feature Guide & Map</h3>
                  <p className="text-xs text-[#6B665E]">
                    Learn what each feature does, what output it produces on your live public profile, and how to use it.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpGuideOpen(false)}
                className="p-1.5 text-[#6B665E] hover:text-[#1C1B18] rounded-xl hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURE_GUIDES.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-[#E8E4D9] rounded-2xl bg-[#FAF8F5] space-y-3 flex flex-col justify-between hover:border-[#1C1B18] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-white border border-[#E8E4D9] rounded-lg">
                          {item.icon}
                        </span>
                        <h4 className="font-serif-display text-base font-bold text-[#1C1B18]">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[9px] uppercase font-mono-code font-bold px-2 py-0.5 rounded-full bg-white border border-[#E8E4D9] text-[#6B665E]">
                        {item.category}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="font-bold text-[#1C1B18] block text-[11px]">What it does:</span>
                        <p className="text-[#6B665E] leading-relaxed">{item.whatItDoes}</p>
                      </div>
                      <div className="pt-1">
                        <span className="font-bold text-[#C85A32] block text-[11px]">Public Page Output:</span>
                        <p className="text-[#6B665E] leading-relaxed">{item.publicOutput}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsHelpGuideOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-[#1C1B18] text-[#1C1B18] hover:text-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Open {item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E8E4D9] flex items-center justify-between text-xs text-[#6B665E]">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#D49A3E]" />
                <span>Tip: Every edit in your dashboard is saved locally and instantly rendered on your public profile.</span>
              </span>
              <button
                type="button"
                onClick={() => setIsHelpGuideOpen(false)}
                className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] rounded-xl font-medium hover:bg-[#33312B] transition-colors"
              >
                Got It, Let's Build
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
