export type ViewMode = 'landing' | 'login' | 'signup' | 'forgot_password' | 'dashboard' | 'public_profile';

export type DashboardTab = 'links' | 'timeline' | 'profile' | 'themes' | 'analytics' | 'settings' | 'identity_hub' | 'visual_builder';

export type LinkCategory = string;

export interface CategoryMeta {
  name: string;
  order: number;
  isCollapsedByDefault?: boolean;
}

export type LinkShape = 'rounded' | 'sharp' | 'pill' | 'underline' | 'ghost';

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: LinkCategory;
  isFeatured?: boolean;
  isActive: boolean;
  iconName?: string;
  thumbnailUrl?: string;
  clicks: number;
  order: number;
  badge?: string;
  linkType?: 'link' | 'project';
  techStack?: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
}

export interface SocialProfile {
  platform: 'twitter' | 'github' | 'instagram' | 'substack' | 'spotify' | 'youtube' | 'linkedin' | 'dribbble' | 'email' | 'website';
  url: string;
  label?: string;
}

export type ThemeFamily = 'editorial' | 'studio' | 'terminal' | 'paper' | 'modernist' | string;

export interface CustomDesignFamily {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultSectionOrder?: ProfileSectionId[];
  fontFamilyDisplay?: 'serif-display' | 'serif-editorial' | 'mono-code' | 'sans-ui';
  borderStyle?: 'sharp' | 'rounded' | 'brutalist' | 'paper' | 'double' | 'glass';
  cardStyle?: 'flat' | 'elevated' | 'glass' | 'retro' | 'minimal' | 'bordered';
  accentHex?: string;
  bgHex?: string;
  cardBgHex?: string;
  textHex?: string;
  isUserCreated?: boolean;
}

export type ProfileSectionId =
  | 'header'
  | 'socials'
  | 'availability'
  | 'now'
  | 'featured_project'
  | 'opensource'
  | 'projects'
  | 'timeline'
  | 'experience'
  | 'skills'
  | 'newsletter'
  | 'contact';

export type SectionSizeVariant = 'small' | 'medium' | 'large' | 'half' | 'full';

export interface ProfileSectionConfig {
  id: ProfileSectionId;
  label: string;
  visible: boolean;
  sizeVariant?: SectionSizeVariant;
  customTitle?: string;
  instanceKey?: string;
  subCategoryFilter?: string;
}

export interface ProfileLayoutConfig {
  themeFamily: ThemeFamily;
  sections: ProfileSectionConfig[];
  editingMode?: 'content' | 'layout';
  gridDensity?: 'compact' | 'comfortable' | 'spacious';
  contentWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  mobileOrderOverride?: ProfileSectionId[];
}

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  themeFamily: ThemeFamily;
  bgClass: string;
  bgHex: string;
  textHex: string;
  mutedHex: string;
  borderHex: string;
  accentHex: string;
  cardBgHex: string;
  fontFamilyDisplay: 'serif-display' | 'serif-editorial' | 'sans-ui' | 'mono-code';
  fontFamilyBody: 'sans-ui' | 'serif-editorial';
  linkShape: LinkShape;
  showNoiseGrain?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: 'sm' | 'md' | 'lg';
  buttonStyle?: 'solid' | 'outline' | 'soft' | 'ghost';
  cardStyle?: 'flat' | 'bordered' | 'elevated' | 'glass';
  borderRadius?: number;
  shadowIntensity?: 'none' | 'soft' | 'crisp' | 'heavy';
  animationsEnabled?: boolean;
  profileLayout?: 'centered' | 'left' | 'compact';
  mode?: 'light' | 'dark';
  useGradientBg?: boolean;
  gradientBgHex?: string;
  defaultSectionOrder?: ProfileSectionId[];
}

export type AudienceContext = 'public' | 'recruiter' | 'developer' | 'client' | 'academic';
export type SectionVisibility = 'public' | 'recruiter_only' | 'unlisted' | 'private';

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  description?: string;
  verified?: boolean;
  verificationSource?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  year: string;
  verified?: boolean;
}

export interface AchievementItem {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  verified?: boolean;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  verified?: boolean;
}

export interface TimelineItem {
  id: string;
  year: string;
  category: 'Education' | 'Career' | 'Project' | 'OpenSource' | 'Achievement';
  title: string;
  description: string;
  role?: string;
  organization?: string;
  linkUrl?: string;
  skillsOrTags?: string[];
  current?: boolean;
  verified?: boolean;
}

export interface NowSection {
  building?: string;
  learning?: string;
  workingOn?: string;
  interestedIn?: string;
  reading?: string;
}

export interface AvailabilityStatus {
  status: 'open_opportunities' | 'open_freelance' | 'available_collaboration' | 'not_available';
  preferredRole?: string;
  locationPreference?: 'Remote' | 'On-site' | 'Hybrid';
  contactMethod?: string;
}

export interface ConnectedService {
  platform: 'github' | 'linkedin' | 'medium' | 'devto' | 'x' | 'youtube' | 'kaggle' | 'behance' | 'dribbble' | 'npm' | 'huggingface' | 'substack' | 'twitter' | 'instagram' | 'spotify' | 'email' | 'website';
  connected: boolean;
  username?: string;
  lastSynced?: string;
}

export interface FeaturedRepo {
  name: string;
  description: string;
  stars: number;
  language: string;
  url: string;
  updatedAt?: string;
}

export interface OpenSourceStats {
  reposCount: number;
  mergedPRsCount: number;
  activeProjectsCount: number;
  totalStarsCount: number;
  featuredRepos?: FeaturedRepo[];
}

export interface ProfileSnapshot {
  id: string;
  name: string;
  viewContext: AudienceContext;
  createdAt: string;
}

export interface CustomBackgroundConfig {
  type: 'solid' | 'gradient' | 'mesh' | 'animated_gradient' | 'image' | 'pattern' | 'creative';
  solidHex?: string;
  gradient?: {
    style: 'linear' | 'radial' | 'conic';
    directionAngle?: number;
    colors: string[];
    intensity?: number;
  };
  mesh?: {
    colors: string[];
    blurPx?: number;
    opacity?: number;
  };
  animatedGradient?: {
    colors: string[];
    speed?: number;
    direction?: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
    opacity?: number;
  };
  image?: {
    url: string;
    position?: string;
    scale?: number;
    opacity?: number;
    blurPx?: number;
    overlayColor?: string;
    overlayOpacity?: number;
    brightness?: number;
    contrast?: number;
  };
  pattern?: {
    style: 'dots' | 'grid' | 'lines' | 'noise' | 'paper' | 'geometric';
    scale?: number;
    opacity?: number;
    rotation?: number;
    spacingPx?: number;
    colorHex?: string;
  };
  creative?: {
    effect: 'floating_shapes' | 'particles' | 'grain' | 'glow' | 'moving_lines' | 'soft_blobs' | 'stars' | 'waves';
    primaryHex?: string;
    secondaryHex?: string;
    speed?: number;
    density?: number;
    opacity?: number;
  };
}

export interface ElementAnimationSetting {
  type: 'none' | 'fade' | 'slide' | 'scale' | 'float' | 'reveal' | 'blur_reveal' | 'parallax' | 'custom';
  durationMs?: number;
  delayMs?: number;
  easing?: 'ease-out' | 'ease-in-out' | 'spring' | 'linear';
  direction?: 'up' | 'down' | 'left' | 'right';
  distancePx?: number;
  staggerMs?: number;
}

export interface MotionConfig {
  globalIntensity: 'none' | 'subtle' | 'balanced' | 'expressive';
  globalSpeed: number; // 0.5, 1.0, 1.5, 2.0
  reduceMotion: boolean;
  sequenceStaggerMs?: number;
  elementAnimations?: Record<string, ElementAnimationSetting>;
  microInteractions?: {
    linkHoverEffect?: 'lift' | 'scale' | 'glow' | 'underline' | 'slide' | 'bg_shift' | 'border_shift' | 'shadow' | 'tilt' | 'magnetic' | 'none';
    avatarHoverEffect?: 'scale' | 'rotate' | 'glow' | 'border_pulse' | 'reveal' | 'none';
    cardHoverEffect?: 'zoom' | 'lift' | 'reveal' | 'tilt' | 'border_glow' | 'none';
    socialsHoverEffect?: 'scale' | 'rotate' | 'color_shift' | 'underline' | 'none';
    hoverIntensity?: number;
    hoverSpeedMs?: number;
  };
}

export interface ElementPositionOverride {
  id: string;
  offsetX?: number; // px offset
  offsetY?: number;
  scale?: number; // percentage (e.g., 100)
  rotation?: number; // degrees
  width?: string; // e.g. 'auto', '100%', '320px'
  alignment?: 'left' | 'center' | 'right';
  margin?: string;
  padding?: string;
  zIndex?: number;
}

export interface DecorativeObject {
  id: string;
  type: 'shape' | 'line' | 'circle' | 'star' | 'dot' | 'wave' | 'gradient_blob' | 'icon' | 'badge' | 'text_label';
  content?: string;
  colorHex: string;
  xPercent: number; // 0-100%
  yPercent: number; // 0-100%
  scale: number;
  rotation: number;
  opacity: number;
  blurPx: number;
  zIndex: number;
  animation: 'none' | 'float' | 'pulse' | 'spin' | 'drift';
  speed: number;
}

export interface ConnProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  location?: string;
  pronouns?: string;
  statusBadge?: string;
  themeId: string;
  customTheme?: ThemeOption;
  customAccentColor?: string;
  customLinkShape?: LinkShape;
  isPublic: boolean;
  isPasswordProtected?: boolean;
  passwordCode?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoImageUrl?: string;
  links: LinkItem[];
  socials: SocialProfile[];
  newsletterEnabled?: boolean;
  newsletterHeadline?: string;
  newsletterSubtext?: string;
  categoriesMeta?: CategoryMeta[];
  savedCustomThemes?: ThemeOption[];
  customDesignFamilies?: CustomDesignFamily[];
  customBackground?: CustomBackgroundConfig;
  motionConfig?: MotionConfig;
  elementOverrides?: Record<string, ElementPositionOverride>;
  decorativeObjects?: DecorativeObject[];

  // Living Personal Identity Hub Extensions
  role?: string;
  organization?: string;
  skills?: string[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
  achievements?: AchievementItem[];
  certifications?: CertificationItem[];
  timeline?: TimelineItem[];
  timelineStyle?: 'roadmap' | 'cards' | 'minimal';
  nowSection?: NowSection;
  availability?: AvailabilityStatus;
  connectedServices?: ConnectedService[];
  openSourceStats?: OpenSourceStats;
  snapshots?: ProfileSnapshot[];
  visibility?: Record<string, SectionVisibility>;
  contactEmail?: string;
  resumeUrl?: string;
  customDomain?: string;
  layoutConfig?: ProfileLayoutConfig;
}

export interface ClickLog {
  id: string;
  linkId: string;
  linkTitle: string;
  timestamp: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  referrer: string;
}

export interface ViewLog {
  id: string;
  timestamp: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  referrer: string;
}

export interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  ctrPercentage: number;
  dailyViews: { date: string; views: number; clicks: number }[];
  trafficSources: { name: string; percentage: number; count: number }[];
  deviceBreakdown: { device: string; percentage: number; count?: number }[];
  clickLogs?: ClickLog[];
  viewLogs?: ViewLog[];
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  username: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}
