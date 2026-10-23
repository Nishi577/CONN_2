import React, { useState, useEffect } from 'react';
import {
  ConnProfile,
  LinkItem,
  LinkCategory,
  AudienceContext,
  ThemeFamily,
  ProfileSectionConfig,
  ProfileSectionId,
} from '../types';
import { EDITORIAL_THEMES } from '../data/themes';
import { recordLinkClick, recordProfileView } from '../lib/storage';
import {
  getBackgroundStyleAndElements,
  getElementTransformStyle,
  getElementAlignmentClasses,
  renderDecorativeObjects,
  getMicroHoverClass,
  getElementAnimationStyle,
} from '../lib/customStyleUtils';
import {
  ExternalLink,
  Share2,
  BookOpen,
  Folder,
  Sparkles,
  Music,
  Bookmark,
  Terminal,
  GitBranch,
  Mic,
  MapPin,
  Check,
  ArrowUpRight,
  Send,
  Globe,
  Mail,
  Instagram,
  Twitter,
  Github,
  Linkedin,
  Radio,
  ChevronDown,
  ChevronRight,
  Activity,
  Layers,
  ShieldCheck,
  UserCheck,
  Clock,
  Briefcase,
  Award,
  Code2,
  MessageSquare,
  QrCode,
  X,
  Copy,
  Cpu,
  FileText,
  BookmarkCheck,
} from 'lucide-react';

interface PublicProfileProps {
  profile: ConnProfile;
  onOpenShare: () => void;
  onShowToast: (msg: string) => void;
  isEmbeddedPreview?: boolean;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({
  profile,
  onOpenShare,
  onShowToast,
  isEmbeddedPreview = false,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Audience Context Filter (All, Recruiter, Developer, Client, Academic)
  const [activeContext, setActiveContext] = useState<AudienceContext>('public');

  // Smart Contact Router Modal
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryIntent, setInquiryIntent] = useState<'hiring' | 'collaboration' | 'freelance' | 'speaking' | 'networking'>('collaboration');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  // QR Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    recordProfileView();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsInquiryModalOpen(false);
        setIsQrModalOpen(false);
      }
    };
    if (isInquiryModalOpen || isQrModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInquiryModalOpen, isQrModalOpen]);

  // Category collapse states
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    if (profile.categoriesMeta) {
      profile.categoriesMeta.forEach((cat) => {
        if (cat.isCollapsedByDefault) {
          initialMap[cat.name] = true;
        }
      });
    }
    return initialMap;
  });

  const toggleCategoryCollapse = (catName: string) => {
    setCollapsedCats((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  // Find active theme configuration
  const theme =
    profile.themeId === 'custom' && profile.customTheme
      ? profile.customTheme
      : EDITORIAL_THEMES.find((t) => t.id === profile.themeId) || profile.customTheme || EDITORIAL_THEMES[0];

  const themeFamily: ThemeFamily =
    profile.layoutConfig?.themeFamily || theme.themeFamily || 'editorial';

  const activeCustomFamily = (profile.customDesignFamilies || []).find((f) => f.id === themeFamily);

  const linkShape = profile.customLinkShape || theme.linkShape;
  const accentColor = activeCustomFamily?.accentHex || profile.customAccentColor || theme.accentHex;

  // Active sorted links
  const activeLinks = profile.links.filter((l) => l.isActive).sort((a, b) => a.order - b.order);
  const featuredLink = activeLinks.find((l) => l.isFeatured);
  const regularLinks = activeLinks.filter((l) => !l.isFeatured);
  const categories: LinkCategory[] = Array.from(new Set(regularLinks.map((l) => l.category)));

  const handleLinkClick = (link: LinkItem, e: React.MouseEvent) => {
    recordLinkClick(link.id);
    if (isEmbeddedPreview) {
      e.preventDefault();
      onShowToast(`[Preview Mode] Navigating to: ${link.title}`);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    onShowToast(`Subscribed ${newsletterEmail} to ${profile.name}'s field notes.`);
    setNewsletterEmail('');
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail) return;
    setInquirySent(true);
    onShowToast(`Routed [${inquiryIntent.toUpperCase()}] inquiry to ${profile.name}`);
    setTimeout(() => {
      setIsInquiryModalOpen(false);
      setInquirySent(false);
      setInquiryMessage('');
    }, 1500);
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Folder': return <Folder className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Music': return <Music className="w-4 h-4" />;
      case 'Bookmark': return <Bookmark className="w-4 h-4" />;
      case 'Terminal': return <Terminal className="w-4 h-4" />;
      case 'GitBranch': return <GitBranch className="w-4 h-4" />;
      case 'Mic': return <Mic className="w-4 h-4" />;
      default: return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  const renderSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'spotify': return <Radio className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getShapeStyle = () => {
    if (activeCustomFamily) {
      switch (activeCustomFamily.borderStyle) {
        case 'brutalist':
          return 'rounded-none border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]';
        case 'double':
          return 'rounded-xl border-4 border-double';
        case 'glass':
          return 'rounded-2xl border border-white/30 backdrop-blur-md bg-white/20 shadow-md';
        case 'paper':
          return 'rounded-xl border shadow-xs bg-[#FAF8F5] relative';
        case 'sharp':
          return 'rounded-none border-2';
        case 'rounded':
        default:
          return 'rounded-2xl border shadow-xs';
      }
    }
    if (themeFamily === 'modernist') return 'rounded-none border-2';
    if (themeFamily === 'paper') return 'rounded-xl border shadow-xs bg-[#FAF8F5] relative';
    switch (linkShape) {
      case 'sharp': return 'rounded-none';
      case 'pill': return 'rounded-full px-6';
      case 'underline': return 'rounded-none border-b border-t-0 border-x-0 bg-transparent px-2 shadow-none';
      case 'ghost': return 'rounded-xl border-dashed bg-transparent';
      case 'rounded': default: return 'rounded-xl';
    }
  };

  const displayFontClass =
    activeCustomFamily?.fontFamilyDisplay === 'mono-code'
      ? 'font-mono-code'
      : activeCustomFamily?.fontFamilyDisplay === 'serif-editorial'
      ? 'font-serif-editorial'
      : activeCustomFamily?.fontFamilyDisplay === 'sans-ui'
      ? 'font-sans-ui'
      : activeCustomFamily?.fontFamilyDisplay === 'serif-display'
      ? 'font-serif-display'
      : themeFamily === 'terminal'
      ? 'font-mono-code'
      : themeFamily === 'paper' || themeFamily === 'editorial'
      ? 'font-serif-editorial'
      : theme.fontFamilyDisplay === 'mono-code'
      ? 'font-mono-code'
      : 'font-serif-display';

  // Sections configuration
  const defaultSectionsList: ProfileSectionConfig[] = (
    theme.defaultSectionOrder || [
      'header',
      'socials',
      'availability',
      'now',
      'featured_project',
      'projects',
      'timeline',
      'experience',
      'skills',
      'opensource',
      'newsletter',
      'contact',
    ]
  ).map((id) => ({
    id: id as ProfileSectionId,
    label: id,
    visible: true,
  }));

  const configuredSections = profile.layoutConfig?.sections || defaultSectionsList;
  const activeSections = configuredSections.filter((s) => s.visible);

  // SECTION RENDERERS BY THEME FAMILY

  // 1. HEADER SECTION
  const renderHeaderSection = (cfg: ProfileSectionConfig) => {
    const avatarOverride = profile.elementOverrides?.['avatar'];
    const avatarTransform = getElementTransformStyle(avatarOverride);
    const avatarAnim = getElementAnimationStyle(profile.motionConfig?.elementAnimations?.['avatar'], profile.motionConfig, 0);
    const avatarHover = getMicroHoverClass(profile.motionConfig?.microInteractions?.avatarHoverEffect);

    const nameOverride = profile.elementOverrides?.['name'];
    const nameTransform = getElementTransformStyle(nameOverride);
    const headerAnim = getElementAnimationStyle(profile.motionConfig?.elementAnimations?.['header'], profile.motionConfig, 1);

    const bioOverride = profile.elementOverrides?.['bio'];
    const bioTransform = getElementTransformStyle(bioOverride);

    const headerOverride = profile.elementOverrides?.['header'];
    const headerSectionTransform = getElementTransformStyle(headerOverride);
    const headerSectionAlign = getElementAlignmentClasses(headerOverride);

    let headerContent: React.ReactNode = null;

    if (themeFamily === 'terminal') {
      headerContent = (
        <section key={cfg.instanceKey || cfg.id} className="p-4 border font-mono-code rounded-xl space-y-3" style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}>
          <div className="flex items-center justify-between pb-2 border-b text-[10px]" style={{ borderColor: theme.borderHex, color: theme.mutedHex }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 font-bold text-xs" style={{ color: theme.textHex }}>bash - conn-identity-v2.sh</span>
            </div>
            <span>PID: 4092</span>
          </div>

          <div className="flex items-start gap-4 pt-1">
            <div style={avatarTransform} className={`shrink-0 transition-transform ${avatarOverride?.alignment === 'center' ? 'mx-auto' : avatarOverride?.alignment === 'right' ? 'ml-auto' : ''}`}>
              <div style={avatarAnim.style} className={`${avatarAnim.className} ${avatarHover}`}>
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-16 h-16 rounded object-cover border"
                  style={{ borderColor: theme.borderHex }}
                />
              </div>
            </div>
            <div style={nameTransform} className={`space-y-1 transition-transform ${nameOverride?.alignment === 'center' ? 'text-center' : nameOverride?.alignment === 'right' ? 'text-right' : 'text-left'}`}>
              <div style={headerAnim.style} className={headerAnim.className}>
                <div className="text-xs text-emerald-400 font-bold">$ whoami --verbose</div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{profile.name}</h1>
                {(profile.role || profile.organization) && (
                  <div className="text-xs" style={{ color: accentColor }}>
                    {profile.role} {profile.organization && `@ ${profile.organization}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={bioTransform} className={`transition-transform ${bioOverride?.alignment === 'center' ? 'text-center mx-auto' : bioOverride?.alignment === 'right' ? 'text-right ml-auto' : 'text-left'}`}>
            <p className="text-xs leading-relaxed font-mono-code" style={{ color: theme.mutedHex }}>
              {profile.bio}
            </p>
          </div>
        </section>
      );
    } else if (themeFamily === 'paper') {
      headerContent = (
        <section key={cfg.instanceKey || cfg.id} className="p-6 border rounded-2xl relative space-y-4 shadow-sm" style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}>
          {/* Paper tape accent */}
          <div className="absolute -top-3 left-8 px-4 py-0.5 bg-amber-100/80 text-amber-900 text-[9px] font-mono-code uppercase font-bold tracking-wider border border-amber-200/60 shadow-xs rotate-1">
            PARCHMENT RECORD
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              <div style={avatarTransform} className={`shrink-0 transition-transform ${avatarOverride?.alignment === 'center' ? 'mx-auto' : avatarOverride?.alignment === 'right' ? 'ml-auto' : ''}`}>
                <div style={avatarAnim.style} className={`${avatarAnim.className} ${avatarHover}`}>
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 shadow-xs"
                    style={{ borderColor: theme.borderHex }}
                  />
                </div>
              </div>
              <div style={nameTransform} className={`transition-transform ${nameOverride?.alignment === 'center' ? 'text-center' : nameOverride?.alignment === 'right' ? 'text-right' : 'text-left'}`}>
                <div style={headerAnim.style} className={headerAnim.className}>
                  <h1 className="text-3xl sm:text-4xl font-serif-editorial tracking-tight">{profile.name}</h1>
                  {(profile.role || profile.organization) && (
                    <div className="text-xs font-serif-editorial italic mt-0.5" style={{ color: accentColor }}>
                      {profile.role} {profile.organization && `@ ${profile.organization}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {profile.location && (
              <span className="text-xs font-mono-code px-3 py-1 rounded-full border flex items-center gap-1.5" style={{ borderColor: theme.borderHex }}>
                <MapPin className="w-3.5 h-3.5" /> {profile.location}
              </span>
            )}
          </div>

          <div style={bioTransform} className={`transition-transform ${bioOverride?.alignment === 'center' ? 'text-center mx-auto' : bioOverride?.alignment === 'right' ? 'text-right ml-auto' : 'text-left'}`}>
            <p className="text-sm sm:text-base font-serif-editorial leading-relaxed max-w-xl font-light" style={{ color: theme.mutedHex }}>
              {profile.bio}
            </p>
          </div>
        </section>
      );
    } else if (themeFamily === 'modernist') {
      headerContent = (
        <section key={cfg.instanceKey || cfg.id} className="p-6 border-2 rounded-none space-y-4" style={{ borderColor: theme.textHex, backgroundColor: theme.cardBgHex }}>
          <div className="flex items-center justify-between text-[10px] font-mono-code font-bold uppercase border-b-2 pb-2" style={{ borderColor: theme.textHex }}>
            <span>INDEX // 01</span>
            <span>SWISS TYPOGRAPHIC MATRIX</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div style={nameTransform} className={`space-y-2 transition-transform ${nameOverride?.alignment === 'center' ? 'text-center' : nameOverride?.alignment === 'right' ? 'text-right' : 'text-left'}`}>
              <div style={headerAnim.style} className={headerAnim.className}>
                <h1 className="text-3xl sm:text-5xl font-mono-code font-extrabold uppercase tracking-tighter">
                  {profile.name}
                </h1>
                {(profile.role || profile.organization) && (
                  <div className="text-xs font-mono-code font-bold uppercase tracking-wide px-2 py-1 inline-block text-white" style={{ backgroundColor: theme.textHex }}>
                    {profile.role} {profile.organization && `[${profile.organization}]`}
                  </div>
                )}
              </div>
            </div>

            <div style={avatarTransform} className={`shrink-0 transition-transform ${avatarOverride?.alignment === 'center' ? 'mx-auto' : avatarOverride?.alignment === 'right' ? 'ml-auto' : ''}`}>
              <div style={avatarAnim.style} className={`${avatarAnim.className} ${avatarHover}`}>
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-20 h-20 rounded-none object-cover border-2"
                  style={{ borderColor: theme.textHex }}
                />
              </div>
            </div>
          </div>

          <div style={bioTransform} className={`transition-transform ${bioOverride?.alignment === 'center' ? 'text-center mx-auto' : bioOverride?.alignment === 'right' ? 'text-right ml-auto' : 'text-left'}`}>
            <p className="text-sm font-sans-ui leading-relaxed max-w-lg font-normal pt-2" style={{ color: theme.mutedHex }}>
              {profile.bio}
            </p>
          </div>
        </section>
      );
    } else {
      // Editorial & Studio Default Header
      headerContent = (
        <section key={cfg.instanceKey || cfg.id} className="text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div style={avatarTransform} className={`shrink-0 transition-transform ${avatarOverride?.alignment === 'center' ? 'mx-auto' : avatarOverride?.alignment === 'right' ? 'ml-auto' : ''}`}>
              <div style={avatarAnim.style} className={`relative group ${avatarAnim.className} ${avatarHover}`}>
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 shadow-sm transition-transform duration-300 group-hover:scale-105"
                  style={{ borderColor: theme.borderHex }}
                />
                {profile.statusBadge && (
                  <div
                    className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                    style={{
                      backgroundColor: theme.bgHex,
                      color: theme.textHex,
                      borderColor: theme.borderHex,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                    <span className="truncate max-w-[140px]">{profile.statusBadge.replace(/^●\s*/, '')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: theme.mutedHex }}>
              {profile.location && (
                <span className="flex items-center gap-1 border px-2.5 py-1 rounded-full" style={{ borderColor: theme.borderHex }}>
                  <MapPin className="w-3 h-3" /> {profile.location}
                </span>
              )}
              {profile.pronouns && (
                <span className="border px-2.5 py-1 rounded-full" style={{ borderColor: theme.borderHex }}>
                  {profile.pronouns}
                </span>
              )}
            </div>
          </div>

          <div>
            <div style={nameTransform} className={`transition-transform ${nameOverride?.alignment === 'center' ? 'text-center' : nameOverride?.alignment === 'right' ? 'text-right' : 'text-left'}`}>
              <div style={headerAnim.style} className={headerAnim.className}>
                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight mb-1 ${displayFontClass}`}>
                  {profile.name}
                </h1>

                {(profile.role || profile.organization) && (
                  <div className={`text-sm font-medium flex items-center gap-2 mb-2 ${nameOverride?.alignment === 'center' ? 'justify-center' : nameOverride?.alignment === 'right' ? 'justify-end' : ''}`} style={{ color: accentColor }}>
                    <span>{profile.role}</span>
                    {profile.organization && <span>@ {profile.organization}</span>}
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                      Verified ✓
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={bioTransform} className={`transition-transform ${bioOverride?.alignment === 'center' ? 'text-center mx-auto' : bioOverride?.alignment === 'right' ? 'text-right ml-auto' : 'text-left'}`}>
              <p className={`text-sm sm:text-base leading-relaxed max-w-lg font-light ${bioOverride?.alignment === 'center' ? 'text-center mx-auto' : bioOverride?.alignment === 'right' ? 'text-right ml-auto' : 'text-left'}`} style={{ color: theme.mutedHex }}>
                {profile.bio}
              </p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <div style={headerSectionTransform} className={`w-full transition-all duration-300 ${headerSectionAlign}`}>
        {headerContent}
      </div>
    );
  };

  // 2. NOW SECTION
  const renderNowSection = (cfg: ProfileSectionConfig) => {
    if (!profile.nowSection) return null;
    return (
      <section key={cfg.instanceKey || cfg.id} className={`p-5 border rounded-2xl space-y-3 ${getShapeStyle()}`} style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}>
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.borderHex }}>
          <span className="text-[11px] font-mono-code uppercase font-bold flex items-center gap-1.5" style={{ color: accentColor }}>
            <Activity className="w-3.5 h-3.5" /> {cfg.customTitle || 'NOW Live Activity'}
          </span>
          <span className="text-[10px] font-mono-code" style={{ color: theme.mutedHex }}>
            {themeFamily === 'terminal' ? '$ cat now.status' : 'Real-Time'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {profile.nowSection.building && (
            <div>
              <span className="font-mono-code text-[10px] uppercase block" style={{ color: theme.mutedHex }}>Building</span>
              <span className="font-medium">{profile.nowSection.building}</span>
            </div>
          )}
          {profile.nowSection.learning && (
            <div>
              <span className="font-mono-code text-[10px] uppercase block" style={{ color: theme.mutedHex }}>Learning</span>
              <span className="font-medium">{profile.nowSection.learning}</span>
            </div>
          )}
          {profile.nowSection.workingOn && (
            <div>
              <span className="font-mono-code text-[10px] uppercase block" style={{ color: theme.mutedHex }}>Working On</span>
              <span className="font-medium">{profile.nowSection.workingOn}</span>
            </div>
          )}
          {profile.nowSection.reading && (
            <div>
              <span className="font-mono-code text-[10px] uppercase block" style={{ color: theme.mutedHex }}>Reading</span>
              <span className="font-medium">{profile.nowSection.reading}</span>
            </div>
          )}
        </div>
      </section>
    );
  };

  // 3. PROJECTS SECTION
  const renderProjectsSection = (cfg: ProfileSectionConfig) => {
    const linkHover = getMicroHoverClass(profile.motionConfig?.microInteractions?.linkHoverEffect || 'lift');

    return (
      <section key={cfg.instanceKey || cfg.id} className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.borderHex }}>
          <span className="text-[11px] font-mono-code uppercase font-bold tracking-widest flex items-center gap-1.5" style={{ color: theme.mutedHex }}>
            <Folder className="w-3.5 h-3.5" style={{ color: accentColor }} /> {cfg.customTitle || 'Projects & Works'}
          </span>
          <span className="text-[10px] font-mono-code" style={{ color: theme.mutedHex }}>
            {regularLinks.length} Items
          </span>
        </div>

        {themeFamily === 'studio' ? (
          /* STUDIO VISUAL GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {regularLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => handleLinkClick(link, e)}
                className={`group block p-4 border rounded-2xl transition-all duration-300 space-y-3 ${linkHover}`}
                style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}
              >
                {link.thumbnailUrl && (
                  <div className="w-full h-36 overflow-hidden rounded-xl bg-black/10">
                    <img
                      src={link.thumbnailUrl}
                      alt={link.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-serif-display text-base font-bold group-hover:underline flex items-center gap-1">
                    {link.title} <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </h4>
                  {link.description && (
                    <p className="text-xs font-light line-clamp-2 mt-1" style={{ color: theme.mutedHex }}>
                      {link.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : themeFamily === 'terminal' ? (
          /* TERMINAL DIRECTORY LIST */
          <div className="p-4 border font-mono-code text-xs rounded-xl space-y-2" style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}>
            <div className="text-emerald-400 font-bold">$ ls -la projects/</div>
            {regularLinks.map((link, idx) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => handleLinkClick(link, e)}
                className={`flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors block ${linkHover}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#6B665E]">drwxr-xr-x</span>
                  <span className="font-bold">{link.title.toLowerCase().replace(/\s+/g, '-')}</span>
                </div>
                <span className="text-[10px]" style={{ color: accentColor }}>[EXECUTE →]</span>
              </a>
            ))}
          </div>
        ) : (
          /* STANDARD / EDITORIAL / PAPER LIST */
          <div className="space-y-3">
            {regularLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => handleLinkClick(link, e)}
                className={`group flex items-center justify-between p-4 border transition-all duration-200 ${getShapeStyle()} ${linkHover}`}
                style={{
                  backgroundColor: theme.cardBgHex,
                  borderColor: theme.borderHex,
                }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {link.thumbnailUrl ? (
                    <img
                      src={link.thumbnailUrl}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border"
                      style={{ borderColor: theme.borderHex }}
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 text-sm"
                      style={{ borderColor: theme.borderHex, color: accentColor }}
                    >
                      {renderIcon(link.iconName)}
                    </div>
                  )}

                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-medium tracking-tight truncate group-hover:underline">
                        {link.title}
                      </h4>
                      {link.badge && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                          style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
                        >
                          {link.badge}
                        </span>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-xs truncate font-light mt-0.5" style={{ color: theme.mutedHex }}>
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="p-1.5 rounded-full border shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ borderColor: theme.borderHex }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    );
  };

  // 4. FEATURED PROJECT HIGHLIGHT
  const renderFeaturedProjectSection = (cfg: ProfileSectionConfig) => {
    if (!featuredLink) return null;
    return (
      <section key={cfg.instanceKey || cfg.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest font-mono-code font-semibold" style={{ color: accentColor }}>
            {cfg.customTitle || 'FEATURED HIGHLIGHT'}
          </span>
          {featuredLink.badge && (
            <span
              className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full uppercase"
              style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
            >
              {featuredLink.badge}
            </span>
          )}
        </div>

        <a
          href={featuredLink.url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => handleLinkClick(featuredLink, e)}
          className={`group block p-5 sm:p-6 border transition-all duration-300 hover:-translate-y-1 ${getShapeStyle()}`}
          style={{
            backgroundColor: theme.cardBgHex,
            borderColor: theme.borderHex,
          }}
        >
          {featuredLink.thumbnailUrl && (
            <div className="w-full h-44 sm:h-52 mb-4 overflow-hidden rounded-lg bg-black/5">
              <img
                src={featuredLink.thumbnailUrl}
                alt={featuredLink.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className={`text-xl sm:text-2xl font-normal leading-snug mb-1.5 group-hover:underline ${displayFontClass}`}>
                {featuredLink.title}
              </h3>
              {featuredLink.description && (
                <p className="text-xs sm:text-sm leading-relaxed mb-3" style={{ color: theme.mutedHex }}>
                  {featuredLink.description}
                </p>
              )}
            </div>
            <div
              className="p-2 rounded-full border shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ borderColor: theme.borderHex }}
            >
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </a>
      </section>
    );
  };

  // 5. SKILLS SECTION
  const renderSkillsSection = (cfg: ProfileSectionConfig) => {
    if (!profile.skills || profile.skills.length === 0) return null;
    return (
      <section key={cfg.instanceKey || cfg.id} className="space-y-3">
        <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: theme.borderHex }}>
          <span className="text-[11px] font-mono-code uppercase font-bold flex items-center gap-1.5" style={{ color: theme.mutedHex }}>
            <Cpu className="w-3.5 h-3.5" /> {cfg.customTitle || 'Skills & Technical Stack'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {profile.skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className={`text-xs font-mono-code px-3 py-1.5 border ${
                themeFamily === 'modernist' ? 'rounded-none border-2' : 'rounded-lg'
              }`}
              style={{ borderColor: theme.borderHex, color: theme.textHex, backgroundColor: theme.cardBgHex }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    );
  };

  // 6. EXPERIENCE SECTION
  const renderExperienceSection = (cfg: ProfileSectionConfig) => {
    if (!profile.experience || profile.experience.length === 0) return null;
    return (
      <section key={cfg.instanceKey || cfg.id} className="space-y-3">
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.borderHex }}>
          <span className="text-[11px] font-mono-code uppercase font-bold flex items-center gap-1.5" style={{ color: theme.mutedHex }}>
            <Briefcase className="w-3.5 h-3.5" /> {cfg.customTitle || 'Work Experience'}
          </span>
        </div>

        <div className="space-y-2">
          {profile.experience.map((exp) => (
            <div key={exp.id} className={`p-4 border rounded-xl space-y-1 ${getShapeStyle()}`} style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{exp.title}</span>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded border" style={{ borderColor: theme.borderHex, color: theme.mutedHex }}>
                  {exp.period}
                </span>
              </div>
              <div className="text-xs font-medium" style={{ color: accentColor }}>{exp.company}</div>
              {exp.description && <p className="text-xs font-light mt-1" style={{ color: theme.mutedHex }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  // 7. TIMELINE SECTION
  const renderTimelineSection = (cfg: ProfileSectionConfig) => {
    if (!profile.timeline || profile.timeline.length === 0) return null;
    const style = profile.timelineStyle || 'roadmap';

    return (
      <section key={cfg.instanceKey || cfg.id} className="space-y-3">
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.borderHex }}>
          <span className="text-[11px] font-mono-code uppercase font-bold flex items-center gap-1.5" style={{ color: theme.mutedHex }}>
            <Clock className="w-3.5 h-3.5" /> {cfg.customTitle || 'Work & Timeline'}
          </span>
          <span className="text-[10px] font-mono-code" style={{ color: theme.mutedHex }}>
            {profile.timeline.length} milestones
          </span>
        </div>

        {style === 'roadmap' ? (
          <div className="relative pl-5 space-y-3.5">
            {/* Vertical connector line */}
            <div
              className="absolute left-[7px] top-2 bottom-2 w-0.5 opacity-60"
              style={{ backgroundColor: theme.borderHex }}
            />

            {profile.timeline.map((tl) => (
              <div key={tl.id} className="relative group">
                {/* Node circle on connector line */}
                <div
                  className="absolute -left-5 top-2.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{
                    borderColor: tl.current ? accentColor : theme.textHex,
                    backgroundColor: tl.current ? accentColor : theme.cardBgHex,
                  }}
                />

                <div
                  className={`p-3.5 border rounded-xl space-y-1.5 ${getShapeStyle()}`}
                  style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className="px-1.5 py-0.2 text-[10px] font-mono-code font-bold rounded"
                        style={{ backgroundColor: theme.textHex, color: theme.bgHex }}
                      >
                        {tl.year}
                      </span>
                      <span
                        className="text-[9px] font-mono-code uppercase px-1.5 py-0.2 rounded border"
                        style={{ borderColor: theme.borderHex, color: theme.mutedHex }}
                      >
                        {tl.category}
                      </span>
                      {tl.current && (
                        <span className="text-[9px] font-mono-code font-bold px-1 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Current
                        </span>
                      )}
                      {tl.verified && (
                        <span className="text-[9px] font-mono-code font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                          ✓
                        </span>
                      )}
                    </div>

                    {tl.linkUrl && (
                      <a
                        href={tl.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono-code flex items-center gap-0.5 hover:underline"
                        style={{ color: accentColor }}
                      >
                        <span>Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <div>
                    <h5 className="font-bold text-xs" style={{ color: theme.textHex }}>
                      {tl.title}
                      {tl.organization && (
                        <span className="font-normal opacity-80"> @ {tl.organization}</span>
                      )}
                    </h5>
                  </div>

                  {tl.description && (
                    <p className="text-xs font-light leading-relaxed" style={{ color: theme.mutedHex }}>
                      {tl.description}
                    </p>
                  )}

                  {tl.skillsOrTags && tl.skillsOrTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {tl.skillsOrTags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-1.5 py-0.2 rounded text-[9px] font-mono-code border"
                          style={{ borderColor: theme.borderHex, color: theme.mutedHex }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {profile.timeline.map((tl) => (
              <div
                key={tl.id}
                className={`p-3.5 border rounded-xl space-y-1.5 text-xs ${getShapeStyle()}`}
                style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="px-1.5 py-0.2 text-[10px] font-mono-code font-bold rounded"
                      style={{ backgroundColor: theme.textHex, color: theme.bgHex }}
                    >
                      {tl.year}
                    </span>
                    <span
                      className="text-[9px] font-mono-code uppercase px-1.5 py-0.2 rounded border"
                      style={{ borderColor: theme.borderHex, color: theme.mutedHex }}
                    >
                      {tl.category}
                    </span>
                    {tl.current && (
                      <span className="text-[9px] font-mono-code font-bold px-1 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Current
                      </span>
                    )}
                    {tl.verified && (
                      <span className="text-[9px] font-mono-code font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {tl.linkUrl && (
                    <a
                      href={tl.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono-code flex items-center gap-0.5 hover:underline"
                      style={{ color: accentColor }}
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <div>
                  <h5 className="font-bold text-xs" style={{ color: theme.textHex }}>
                    {tl.title}
                    {tl.organization && (
                      <span className="font-normal opacity-80"> @ {tl.organization}</span>
                    )}
                  </h5>
                </div>

                {tl.description && (
                  <p className="text-xs font-light leading-relaxed" style={{ color: theme.mutedHex }}>
                    {tl.description}
                  </p>
                )}

                {tl.skillsOrTags && tl.skillsOrTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {tl.skillsOrTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-1.5 py-0.2 rounded text-[9px] font-mono-code border"
                        style={{ borderColor: theme.borderHex, color: theme.mutedHex }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  // 8. OPEN SOURCE SECTION
  const renderOpenSourceSection = (cfg: ProfileSectionConfig) => {
    if (!profile.openSourceStats) return null;
    return (
      <section key={cfg.instanceKey || cfg.id} className={`p-5 border rounded-2xl space-y-4 ${getShapeStyle()}`} style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}>
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.borderHex }}>
          <span className="text-[11px] font-mono-code uppercase font-bold flex items-center gap-1.5" style={{ color: accentColor }}>
            <GitBranch className="w-3.5 h-3.5" /> {cfg.customTitle || 'Open Source GitHub Activity'}
          </span>
          <span className="text-[10px] font-mono-code font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Verified ✓
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl border" style={{ borderColor: theme.borderHex }}>
            <div className="font-mono-code font-bold text-base">{profile.openSourceStats.reposCount}</div>
            <div className="text-[9px] uppercase font-mono-code" style={{ color: theme.mutedHex }}>Repos</div>
          </div>
          <div className="p-2 rounded-xl border" style={{ borderColor: theme.borderHex }}>
            <div className="font-mono-code font-bold text-base" style={{ color: accentColor }}>{profile.openSourceStats.mergedPRsCount}</div>
            <div className="text-[9px] uppercase font-mono-code" style={{ color: theme.mutedHex }}>PRs Merged</div>
          </div>
          <div className="p-2 rounded-xl border" style={{ borderColor: theme.borderHex }}>
            <div className="font-mono-code font-bold text-base">{profile.openSourceStats.totalStarsCount}</div>
            <div className="text-[9px] uppercase font-mono-code" style={{ color: theme.mutedHex }}>Stars</div>
          </div>
        </div>
      </section>
    );
  };

  // 9. SOCIALS SECTION
  const renderSocialsSection = (cfg: ProfileSectionConfig) => {
    if (!profile.socials || profile.socials.length === 0) return null;
    const socialsHover = getMicroHoverClass(profile.motionConfig?.microInteractions?.socialsHoverEffect || 'scale');
    const socialsOverride = profile.elementOverrides?.['socials'];
    const alignJustify =
      socialsOverride?.alignment === 'center'
        ? 'justify-center'
        : socialsOverride?.alignment === 'right'
        ? 'justify-end'
        : 'justify-start';

    return (
      <section key={cfg.instanceKey || cfg.id} className="pt-2 border-t" style={{ borderColor: theme.borderHex }}>
        <div className={`flex flex-wrap items-center gap-2 ${alignJustify}`}>
          {profile.socials.map((soc, idx) => (
            <a
              key={idx}
              href={soc.url}
              target="_blank"
              rel="noreferrer"
              className={`p-2.5 rounded-full border transition-all duration-200 ${socialsHover}`}
              style={{
                borderColor: theme.borderHex,
                backgroundColor: theme.cardBgHex,
                color: theme.textHex,
              }}
              title={soc.label || soc.platform}
            >
              {renderSocialIcon(soc.platform)}
            </a>
          ))}
        </div>
      </section>
    );
  };

  // 10. AVAILABILITY SECTION
  const renderAvailabilitySection = (cfg: ProfileSectionConfig) => {
    if (!profile.availability) return null;
    return (
      <section key={cfg.instanceKey || cfg.id}>
        <div
          className={`p-3.5 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${getShapeStyle()}`}
          style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="font-bold">Available for Collaboration</div>
              <div className="text-[11px]" style={{ color: theme.mutedHex }}>
                {profile.availability.preferredRole} • {profile.availability.locationPreference}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsInquiryModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-102 shrink-0"
            style={{ backgroundColor: theme.textHex, color: theme.bgHex }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact & Intent Router</span>
          </button>
        </div>
      </section>
    );
  };

  // 11. NEWSLETTER SECTION
  const renderNewsletterSection = (cfg: ProfileSectionConfig) => {
    if (!profile.newsletterEnabled) return null;
    return (
      <section
        key={cfg.instanceKey || cfg.id}
        className={`p-6 border rounded-2xl relative overflow-hidden ${getShapeStyle()}`}
        style={{
          backgroundColor: theme.cardBgHex,
          borderColor: theme.borderHex,
        }}
      >
        <div className="max-w-md">
          <h3 className={`text-2xl font-normal mb-1.5 ${displayFontClass}`}>
            {profile.newsletterHeadline || 'Subscribe to field notes.'}
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{ color: theme.mutedHex }}>
            {profile.newsletterSubtext || 'A thoughtful periodic newsletter.'}
          </p>

          {subscribed ? (
            <div
              className="flex items-center gap-2 p-3 rounded-xl border text-xs font-medium"
              style={{ borderColor: theme.borderHex, color: accentColor }}
            >
              <Check className="w-4 h-4" />
              You are now subscribed to @{profile.username}&apos;s updates.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border bg-transparent focus:border-current transition-colors"
                style={{ borderColor: theme.borderHex, color: theme.textHex }}
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-transform hover:scale-102 active:scale-98"
                style={{
                  backgroundColor: theme.textHex,
                  color: theme.bgHex,
                }}
              >
                <span>Subscribe</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          )}
        </div>
      </section>
    );
  };

  // 12. CONTACT ROUTER SECTION
  const renderContactSection = (cfg: ProfileSectionConfig) => {
    return (
      <section key={cfg.instanceKey || cfg.id} className="p-4 border rounded-2xl text-center space-y-2" style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}>
        <h4 className="font-serif-display text-sm font-bold">Smart Intent Contact</h4>
        <p className="text-xs font-light" style={{ color: theme.mutedHex }}>
          Direct intent-based inquiry routing for hiring, freelance, and speaking opportunities.
        </p>
        <button
          type="button"
          onClick={() => setIsInquiryModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
          style={{ backgroundColor: theme.textHex, color: theme.bgHex }}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send Routed Inquiry</span>
        </button>
      </section>
    );
  };

  // Section Mapper Dispatcher
  const renderSectionByConfig = (cfg: ProfileSectionConfig) => {
    let node: React.ReactNode = null;
    switch (cfg.id) {
      case 'header': node = renderHeaderSection(cfg); break;
      case 'socials': node = renderSocialsSection(cfg); break;
      case 'availability': node = renderAvailabilitySection(cfg); break;
      case 'now': node = renderNowSection(cfg); break;
      case 'featured_project': node = renderFeaturedProjectSection(cfg); break;
      case 'projects': node = renderProjectsSection(cfg); break;
      case 'timeline': node = renderTimelineSection(cfg); break;
      case 'experience': node = renderExperienceSection(cfg); break;
      case 'skills': node = renderSkillsSection(cfg); break;
      case 'opensource': node = renderOpenSourceSection(cfg); break;
      case 'newsletter': node = renderNewsletterSection(cfg); break;
      case 'contact': node = renderContactSection(cfg); break;
      default: node = null; break;
    }

    if (!node) return null;

    const override =
      profile.elementOverrides?.[cfg.id] ||
      (cfg.id === 'projects' ? profile.elementOverrides?.['links'] : undefined);
    const transformStyle = getElementTransformStyle(override);
    const alignClasses = getElementAlignmentClasses(override);

    const animSetting =
      profile.motionConfig?.elementAnimations?.[cfg.id] ||
      (cfg.id === 'projects' ? profile.motionConfig?.elementAnimations?.['links'] : undefined);
    const anim = getElementAnimationStyle(animSetting, profile.motionConfig, 1);

    return (
      <div
        key={cfg.instanceKey || cfg.id}
        style={transformStyle}
        className={`transition-all duration-300 w-full ${alignClasses}`}
      >
        <div
          style={anim.style}
          className={`w-full ${anim.className}`}
        >
          {node}
        </div>
      </div>
    );
  };

  const { containerStyle, backgroundOverlayElements } = getBackgroundStyleAndElements(
    profile.customBackground,
    theme.bgHex
  );

  return (
    <div
      className={`min-h-full w-full transition-colors duration-300 relative ${
        theme.showNoiseGrain ? 'paper-grain' : ''
      }`}
      style={{
        background: theme.useGradientBg && theme.gradientBgHex
          ? `linear-gradient(135deg, ${theme.bgHex} 0%, ${theme.gradientBgHex} 100%)`
          : theme.bgHex,
        color: theme.textHex,
        ...containerStyle,
      }}
    >
      {/* Background Overlays & Custom Layers */}
      {backgroundOverlayElements}

      {/* Floating Decorative Objects */}
      {renderDecorativeObjects(profile.decorativeObjects)}
      {/* Top Floating Header */}
      {!isEmbeddedPreview && (
        <header
          className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-md bg-opacity-80 border-b transition-colors"
          style={{ borderColor: theme.borderHex }}
        >
          <div className="flex items-center gap-2">
            <span className={`text-xl font-normal tracking-tight ${displayFontClass}`}>Conn.</span>
            <span
              className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded-full border opacity-70"
              style={{ borderColor: theme.borderHex, color: theme.mutedHex }}
            >
              @{profile.username}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-2 rounded-full border transition-transform hover:scale-105"
              style={{ borderColor: theme.borderHex, color: theme.textHex }}
              title="Identity QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all hover:scale-105"
              style={{
                backgroundColor: theme.textHex,
                color: theme.bgHex,
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Profile Canvas */}
      <main className="max-w-xl mx-auto px-5 sm:px-6 py-8 sm:py-12 font-sans-ui space-y-8">
        
        {/* AUDIENCE CONTEXT BAR */}
        <div className="p-1.5 rounded-xl border flex items-center gap-1 overflow-x-auto text-[11px]" style={{ borderColor: theme.borderHex, backgroundColor: theme.cardBgHex }}>
          <span className="text-[10px] font-mono-code uppercase px-2 py-1 shrink-0 font-bold" style={{ color: theme.mutedHex }}>
            👁 Context:
          </span>
          {[
            { id: 'public', label: 'All' },
            { id: 'recruiter', label: 'Recruiter' },
            { id: 'developer', label: 'Developer' },
            { id: 'client', label: 'Client' },
          ].map((ctx) => (
            <button
              key={ctx.id}
              onClick={() => setActiveContext(ctx.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeContext === ctx.id ? 'font-bold underline' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeContext === ctx.id ? theme.textHex : 'transparent',
                color: activeContext === ctx.id ? theme.bgHex : theme.textHex,
              }}
            >
              {ctx.label}
            </button>
          ))}
        </div>

        {/* DYNAMIC SPATIAL SECTIONS SEQUENCE */}
        {activeSections.map((cfg) => renderSectionByConfig(cfg))}

        {/* Footnote */}
        <footer className="mt-16 pt-8 border-t text-center font-mono-code text-[11px]" style={{ borderColor: theme.borderHex, color: theme.mutedHex }}>
          <p>
            Designed with <span className="font-serif-display text-sm">Conn</span> — Living Identity System ({themeFamily.toUpperCase()}).
          </p>
        </footer>
      </main>

      {/* SMART CONTACT ROUTER MODAL */}
      {isInquiryModalOpen && (
        <div
          onClick={() => setIsInquiryModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 bg-white border border-[#E8E4D9] rounded-2xl shadow-xl text-[#1C1B18] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D9]">
              <h3 className="font-serif-display text-lg font-bold">Contact & Intent Router</h3>
              <button
                onClick={() => setIsInquiryModalOpen(false)}
                className="p-1 text-gray-500 hover:text-black rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inquirySent ? (
              <div className="py-8 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-sm">Inquiry Routed Successfully!</div>
                <p className="text-xs text-[#6B665E]">{profile.name} will respond directly to {inquiryEmail}.</p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono-code uppercase block mb-1 text-[#6B665E]">Select Inquiry Intent</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'hiring', label: 'Brief / Hiring' },
                      { id: 'collaboration', label: 'Collaboration' },
                      { id: 'freelance', label: 'Freelance Design' },
                      { id: 'speaking', label: 'Speaking / Podcast' },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setInquiryIntent(opt.id as any)}
                        className={`p-2 rounded-lg border text-xs text-left ${
                          inquiryIntent === opt.id ? 'bg-[#1C1B18] text-[#FAF8F5] font-bold' : 'bg-[#FAF8F5] text-[#1C1B18]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono-code uppercase block mb-1 text-[#6B665E]">Your Name</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono-code uppercase block mb-1 text-[#6B665E]">Your Email</label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono-code uppercase block mb-1 text-[#6B665E]">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Describe project context or opportunity..."
                    className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1C1B18] text-[#FAF8F5] text-xs font-bold rounded-xl hover:bg-[#33312B]"
                >
                  Send Routed Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {isQrModalOpen && (
        <div
          onClick={() => setIsQrModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm p-6 bg-white border border-[#E8E4D9] rounded-2xl text-center space-y-4 text-[#1C1B18]"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-serif-display text-base font-bold">Personal QR Identity</h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 text-gray-500 hover:text-black rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl inline-block mx-auto">
              <svg className="w-40 h-40 mx-auto" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="5" width="30" height="30" fill="#1C1B18" />
                <rect x="10" y="10" width="20" height="20" fill="#FAF8F5" />
                <rect x="15" y="15" width="10" height="10" fill="#1C1B18" />

                <rect x="65" y="5" width="30" height="30" fill="#1C1B18" />
                <rect x="70" y="10" width="20" height="20" fill="#FAF8F5" />
                <rect x="75" y="15" width="10" height="10" fill="#1C1B18" />

                <rect x="5" y="65" width="30" height="30" fill="#1C1B18" />
                <rect x="10" y="70" width="20" height="20" fill="#FAF8F5" />
                <rect x="15" y="75" width="10" height="10" fill="#1C1B18" />

                <rect x="45" y="45" width="10" height="10" fill="#C85A32" />
                <rect x="60" y="60" width="15" height="15" fill="#1C1B18" />
                <rect x="80" y="80" width="10" height="10" fill="#1C1B18" />
              </svg>
            </div>

            <div className="text-xs font-mono-code font-bold">
              conn.bio/{profile.username}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://conn.bio/${profile.username}`);
                onShowToast('Copied permanent Conn identity link!');
              }}
              className="w-full py-2 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Permanent Identity Link</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
