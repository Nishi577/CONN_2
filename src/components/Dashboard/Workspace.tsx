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
import { AIAssistantModal } from './AIAssistantModal';
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
  Globe,
  Lock,
  Copy,
  Check,
} from 'lucide-react';

interface WorkspaceProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
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
    title: 'Links & Categories',
    subtitle: 'Articles, essays, projects, and categorized media',
    whatItDoes: 'Add, categorize, and drag-and-drop your external links, repositories, and media. Mark links as Featured to highlight them.',
    publicOutput: 'Renders clean, categorized editorial link cards with click tracking, collapse toggles, and custom thumbnails.',
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
    whatItDoes: 'Add past and current roles, companies, dates, key responsibilities, and major achievements.',
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
    whatItDoes: 'Select from 28+ curated editorial themes or customize colors, fonts (Serif/Sans/Mono), backgrounds, and card shapes.',
    publicOutput: 'Instantly updates colors, typography, card shapes, and canvas textures on your live mobile preview and public page.',
    category: 'Design',
  },
  {
    id: 'visual_builder',
    icon: <Sliders className="w-4 h-4 text-[#C85A32]" />,
    title: 'Visual Page Builder',
    subtitle: 'Reorder sections and customize page layout',
    whatItDoes: 'Drag and reorder which content blocks appear first (e.g., Bio -> Featured Links -> Timeline -> Living Hub).',
    publicOutput: 'Controls the exact vertical structure, density, and section ordering of your public page.',
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
  const [copiedHeaderUrl, setCopiedHeaderUrl] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleCopyHeaderUrl = async () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/${profile.username}`
      : `https://conn.bio/${profile.username}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedHeaderUrl(true);
      onShowToast(`Public profile URL copied: ${url}`);
      setTimeout(() => setCopiedHeaderUrl(false), 2000);
    } catch {
      onShowToast('Failed to copy URL', 'error');
    }
  };

  // Compute profile completion rate safely
  const completionTasks = [
    { label: 'Avatar set', done: !!profile.avatarUrl },
    { label: 'Bio written', done: !!profile.bio && profile.bio.length > 10 },
    { label: 'At least 3 links', done: (profile.links || []).length >= 3 },
    { label: 'Work timeline added', done: (profile.timeline || []).length > 0 },
    { label: 'Social profiles linked', done: (profile.socials || []).length > 0 },
    { label: 'Custom status badge', done: !!profile.statusBadge },
  ];
  const completedCount = completionTasks.filter((t) => t.done).length;
  const completionPercentage = Math.round((completedCount / completionTasks.length) * 100);
  const categoriesCount = new Set((profile.links || []).map((l) => l.category)).size;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1B18] font-sans-ui flex flex-col">
      {/* Sub-header status bar */}
      <div className="shrink-0 bg-[#1C1B18] text-[#FAF8F5] px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono-code z-10 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Workspace
          </span>
          <span className="hidden sm:inline text-[#9C978E]">|</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[#FAF8F5]/80">conn.bio/{profile.username}</span>
            <button
              type="button"
              onClick={handleCopyHeaderUrl}
              className="p-1 hover:text-white transition-colors cursor-pointer"
              title="Copy complete public URL"
            >
              {copiedHeaderUrl ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-[#9C978E] hover:text-[#FAF8F5]" />
              )}
            </button>
          </div>

          {/* Publication Status Pill & Quick Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextStatus = !(profile.isPublic ?? true);
              onChangeProfile({ ...profile, isPublic: nextStatus });
              onShowToast(
                nextStatus
                  ? `Profile published! It is now live at conn.bio/${profile.username}`
                  : 'Profile unpublished. It is now private.'
              );
            }}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
              (profile.isPublic ?? true)
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
            title="Click to toggle Public / Draft status"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                (profile.isPublic ?? true) ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{(profile.isPublic ?? true) ? 'Published' : 'Draft / Private'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2C2A24] text-[#D49A3E] hover:bg-[#3C3A34] rounded-lg font-medium text-[11px] transition-all border border-[#D49A3E]/30"
            title="Editorial AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5" /> <span className="hidden sm:inline">AI Copilot</span><span className="sm:hidden">AI</span>
          </button>
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:overflow-hidden">
        {/* LEFT PANE: Categorized Navigation & Status (lg:col-span-2) */}
        <aside className="lg:col-span-2 border-r border-[#E8E4D9] bg-[#FAF8F5] p-3.5 sm:p-4 flex flex-col justify-between space-y-5 lg:h-[calc(100vh-105px)] lg:overflow-y-auto">
          <div className="space-y-5">
            {/* GROUP 1: CONTENT & IDENTITY */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-mono-code text-[#6B665E] block px-2 mb-1.5 font-bold">
                Content & Identity
              </span>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('links')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'links'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <LinkIcon className="w-4 h-4 shrink-0 text-[#C85A32]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">Links & Items</div>
                      <div className={`text-[10px] truncate ${activeTab === 'links' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                        Projects, essays & URLs
                      </div>
                    </div>
                  </div>
                  {(profile.links || []).length > 0 && (
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {categoriesCount > 1 && (
                        <span className={`text-[9px] font-mono-code font-bold px-1.5 py-0.2 rounded ${
                          activeTab === 'links' ? 'bg-white/20 text-white' : 'bg-[#C85A32]/10 text-[#C85A32]'
                        }`}>
                          {categoriesCount} cats
                        </span>
                      )}
                      <span className={`text-[10px] font-mono-code font-bold px-1.5 py-0.2 rounded-full ${
                        activeTab === 'links' ? 'bg-white/20 text-white' : 'bg-[#E8E4D9] text-[#1C1B18]'
                      }`}>
                        {(profile.links || []).length}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <User className="w-4 h-4 shrink-0 text-[#D49A3E]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">Profile Identity</div>
                    <div className={`text-[10px] truncate ${activeTab === 'profile' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      Bio, avatar & socials
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'timeline'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Clock className="w-4 h-4 shrink-0 text-[#C85A32]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">Work Timeline</div>
                      <div className={`text-[10px] truncate ${activeTab === 'timeline' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                        Career & milestones
                      </div>
                    </div>
                  </div>
                  {(profile.timeline || []).length > 0 && (
                    <span className={`text-[10px] font-mono-code font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1 ${
                      activeTab === 'timeline' ? 'bg-white/20 text-white' : 'bg-[#E8E4D9] text-[#1C1B18]'
                    }`}>
                      {(profile.timeline || []).length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('identity_hub')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'identity_hub'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Sparkles className="w-4 h-4 shrink-0 text-[#D49A3E]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">Living Hub ("Now")</div>
                      <div className={`text-[10px] truncate ${activeTab === 'identity_hub' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                        Current focus & status
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#C85A32] text-white rounded shrink-0 ml-1">
                    HUB
                  </span>
                </button>
              </nav>
            </div>

            {/* GROUP 2: DESIGN & APPEARANCE */}
            <div className="space-y-1 pt-2 border-t border-[#E8E4D9]/80">
              <span className="text-[10px] uppercase tracking-widest font-mono-code text-[#6B665E] block px-2 mb-1.5 font-bold">
                Design & Appearance
              </span>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('themes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'themes'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <Palette className="w-4 h-4 shrink-0 text-[#385842]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">Themes & Design</div>
                    <div className={`text-[10px] truncate ${activeTab === 'themes' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      Palettes, fonts & shapes
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('visual_builder')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'visual_builder'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Sliders className="w-4 h-4 shrink-0 text-[#C85A32]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">Visual Page Builder</div>
                      <div className={`text-[10px] truncate ${activeTab === 'visual_builder' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                        Section ordering & grid
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#1C1B18] text-white border border-white/20 rounded shrink-0 ml-1">
                    BUILDER
                  </span>
                </button>
              </nav>
            </div>

            {/* GROUP 3: GROWTH & SETTINGS */}
            <div className="space-y-1 pt-2 border-t border-[#E8E4D9]/80">
              <span className="text-[10px] uppercase tracking-widest font-mono-code text-[#6B665E] block px-2 mb-1.5 font-bold">
                Growth & Settings
              </span>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 shrink-0 text-[#4E78E6]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">Traffic & Analytics</div>
                    <div className={`text-[10px] truncate ${activeTab === 'analytics' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      Visitor views & link clicks
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/40'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0 text-[#6B665E]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">Workspace Settings</div>
                    <div className={`text-[10px] truncate ${activeTab === 'settings' ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      SEO, privacy & backups
                    </div>
                  </div>
                </button>
              </nav>
            </div>

            {/* Quick Feature Guide & Map Pill */}
            <button
              type="button"
              onClick={() => setIsHelpGuideOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#E8E4D9]/40 border border-[#E8E4D9] rounded-xl text-xs font-medium text-[#6B665E] hover:text-[#1C1B18] transition-all cursor-pointer shadow-2xs"
            >
              <Compass className="w-4 h-4 text-[#D49A3E] shrink-0" />
              <span className="truncate">Feature Guide & Map</span>
            </button>

            {/* Profile Health Progress */}
            <div className="p-3.5 bg-white border border-[#E8E4D9] rounded-2xl space-y-2">
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

              <p className="text-[10px] text-[#6B665E] leading-tight pt-0.5">
                {completionPercentage === 100
                  ? 'Your profile is fully curated and live!'
                  : 'Add links or status badge to reach 100% strength.'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E4D9]">
            <div className="flex items-center gap-2.5 mb-2.5">
              <img src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="" className="w-7 h-7 rounded-full object-cover border border-[#E8E4D9]" />
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
          <main className="lg:col-span-10 bg-[#FAF8F5] p-5 sm:p-8 overflow-y-auto lg:h-[calc(100vh-105px)]">
            <VisualLayoutBuilder
              profile={profile}
              onUpdateProfile={onChangeProfile}
              onShowToast={onShowToast}
            />
          </main>
        ) : (
          <>
            <main className="lg:col-span-5 border-r border-[#E8E4D9] bg-[#FAF8F5] p-5 sm:p-8 overflow-y-auto lg:h-[calc(100vh-105px)]">
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
            <aside className="lg:col-span-5 bg-[#EFECE6] p-4 sm:p-6 lg:p-7 flex flex-col items-center justify-start relative lg:h-[calc(100vh-105px)] lg:overflow-hidden">
              <div className="w-full lg:sticky lg:top-0 lg:self-start flex flex-col items-center justify-start h-full max-h-[calc(100vh-125px)]">
                {/* Preview Header controls */}
                <div
                  className={`w-full flex items-center justify-between mb-3 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-[#E8E4D9] shadow-2xs transition-all ${
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

                {/* Live Phone/Canvas Frame (Slightly Zoomed, Static & Intact) */}
                <div
                  className={`transition-all duration-300 w-full overflow-hidden shadow-2xl border border-[#1C1B18]/10 flex flex-col ${
                    previewDevice === 'mobile'
                      ? 'max-w-[420px] rounded-[42px] border-[9px] border-[#1C1B18] bg-white h-[calc(100vh-185px)] max-h-[790px] min-h-[520px]'
                      : 'max-w-xl rounded-2xl border-2 border-[#E8E4D9] bg-white h-[calc(100vh-185px)] max-h-[790px] min-h-[520px]'
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

      {/* FEATURE GUIDE & MAP MODAL */}
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
                className="p-1.5 text-[#6B665E] hover:text-[#1C1B18] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
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
                    className="w-full py-2 px-3 bg-white hover:bg-[#1C1B18] text-[#1C1B18] hover:text-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open {item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B665E]">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#D49A3E] shrink-0" />
                <span>Tip: Every edit in your dashboard is saved locally and instantly rendered on your public profile.</span>
              </span>
              <button
                type="button"
                onClick={() => setIsHelpGuideOpen(false)}
                className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] rounded-xl font-medium hover:bg-[#33312B] transition-colors cursor-pointer shrink-0"
              >
                Got It, Let&apos;s Build
              </button>
            </div>
          </div>
        </div>
      )}

      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        profile={profile}
        onApplyBio={(newBio) => onChangeProfile({ ...profile, bio: newBio })}
        onApplyStatus={(newStatus) => onChangeProfile({ ...profile, statusBadge: newStatus })}
        onShowToast={onShowToast}
      />
    </div>
  );
};
