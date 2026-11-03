import { ConnProfile, AnalyticsData, ClickLog, ViewLog, UserAccount } from '../types';
import { SAMPLE_PROFILES, INITIAL_ANALYTICS } from '../data/mockData';

const PROFILE_STORAGE_KEY = 'conn_active_profile_v2';
const ALL_PROFILES_KEY = 'conn_all_profiles_v2';
const ANALYTICS_KEY = 'conn_analytics_v2';
const AUTH_KEY = 'conn_auth_session_v2';
const LAST_VIEW_KEY = 'conn_last_view_ts_v2';
// Key that stores the username of the currently authenticated user.
const CURRENT_USER_KEY = 'conn_current_user_v2';
// Key that stores the Supabase user UUID of the currently authenticated user.
const CURRENT_USER_ID_KEY = 'conn_current_user_id_v2';
// Prefix for per-user account records.
const USER_ACCOUNT_PREFIX = 'conn_user_account_';
// Prefix for per-user profile records.
const USER_PROFILE_PREFIX = 'conn_user_profile_';
// Prefix for per-user analytics.
const USER_ANALYTICS_PREFIX = 'conn_user_analytics_';

const getDeviceType = (): 'Desktop' | 'Mobile' | 'Tablet' => {
  if (typeof navigator === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
};

const getReferrerChannel = (): string => {
  if (typeof document === 'undefined') return 'Direct / Bio Link';
  const ref = document.referrer;
  if (!ref) return 'Direct / Bio Link';
  if (ref.includes('twitter.com') || ref.includes('x.com') || ref.includes('t.co')) return 'X / Twitter';
  if (ref.includes('substack.com')) return 'Substack';
  if (ref.includes('instagram.com')) return 'Instagram';
  if (ref.includes('linkedin.com')) return 'LinkedIn';
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('duckduckgo.')) return 'Search & Others';
  return 'Direct / Bio Link';
};

// ---------------------------------------------------------------------------
// Per-user account helpers
// ---------------------------------------------------------------------------

/** Persist a UserAccount record (keyed by username). */
export const saveUserAccount = (account: UserAccount): void => {
  try {
    localStorage.setItem(USER_ACCOUNT_PREFIX + account.username, JSON.stringify(account));
    // Also index by email so we can look up at login time.
    localStorage.setItem(USER_ACCOUNT_PREFIX + 'email_' + account.email.toLowerCase(), account.username);
  } catch (e) {
    console.error('Failed to save user account:', e);
  }
};

/** Load a UserAccount by username, or null if not found. */
export const loadUserAccount = (username: string): UserAccount | null => {
  try {
    const saved = localStorage.getItem(USER_ACCOUNT_PREFIX + username);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load user account:', e);
  }
  return null;
};

/** Look up a UserAccount by email address, or null if not registered. */
export const loadUserAccountByEmail = (email: string): UserAccount | null => {
  try {
    const username = localStorage.getItem(USER_ACCOUNT_PREFIX + 'email_' + email.toLowerCase());
    if (username) return loadUserAccount(username);
  } catch (e) {
    console.error('Failed to look up user by email:', e);
  }
  return null;
};

/** Store the username of the currently authenticated user. */
export const saveCurrentUser = (username: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, username);
};

/** Retrieve the username of the currently authenticated user, or null. */
export const loadCurrentUser = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

/** Clear the current user session marker. */
export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

/** Store the Supabase UUID of the currently authenticated user. */
export const saveCurrentUserId = (userId: string): void => {
  localStorage.setItem(CURRENT_USER_ID_KEY, userId);
};

/** Retrieve the Supabase UUID of the currently authenticated user, or null. */
export const loadCurrentUserId = (): string | null => {
  return localStorage.getItem(CURRENT_USER_ID_KEY);
};

/** Clear the current user ID session marker. */
export const clearCurrentUserId = (): void => {
  localStorage.removeItem(CURRENT_USER_ID_KEY);
};

// ---------------------------------------------------------------------------
// Per-user profile helpers
// ---------------------------------------------------------------------------

/** Load the ConnProfile stored for a specific username or UUID, or null if none. */
export const loadProfileForUser = (identifier: string): ConnProfile | null => {
  try {
    const saved = localStorage.getItem(USER_PROFILE_PREFIX + identifier);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load profile for user:', e);
  }
  return null;
};

/** Save the ConnProfile for its owner username and user ID. */
export const saveProfileForUser = (profile: ConnProfile): void => {
  try {
    if (profile.username) {
      localStorage.setItem(USER_PROFILE_PREFIX + profile.username, JSON.stringify(profile));
    }
    if (profile.id) {
      localStorage.setItem(USER_PROFILE_PREFIX + profile.id, JSON.stringify(profile));
    }
  } catch (e) {
    console.error('Failed to save profile for user:', e);
  }
};

/**
 * Create a minimal blank ConnProfile for a brand-new user.
 * No sample data, no Elena content — just the user's own name and username.
 */
export const createBlankProfileForUser = (account: UserAccount): ConnProfile => ({
  id: account.id || 'profile-' + account.username,
  username: account.username,
  name: account.name,
  bio: '',
  avatarUrl: '',
  location: '',
  pronouns: '',
  statusBadge: '',
  themeId: 'warm-paper',
  isPublic: true,
  links: [],
  socials: [],
  skills: [],
  experience: [],
  education: [],
  achievements: [],
  certifications: [],
  timeline: [],
  contactEmail: account.email,
});

// ---------------------------------------------------------------------------
// Active profile (legacy key, now used only for the current session's profile)
// ---------------------------------------------------------------------------

/**
 * Load the active profile for the current session.
 * - If a user is logged in, return their per-user profile (or a blank one if first login).
 * - If no user is logged in, return the first sample profile for unauthenticated demo browsing.
 */
export const loadActiveProfile = (): ConnProfile => {
  const currentUserId = loadCurrentUserId();
  const currentUsername = loadCurrentUser();
  const identifier = currentUserId || currentUsername;

  if (identifier) {
    // Authenticated: load this user's own profile.
    const userProfile = loadProfileForUser(identifier);
    if (userProfile) return userProfile;

    if (currentUsername) {
      const byUsername = loadProfileForUser(currentUsername);
      if (byUsername) return byUsername;

      // If profile not found yet, check saved account info and build a blank one.
      const account = loadUserAccount(currentUsername);
      if (account) {
        const blank = createBlankProfileForUser(account);
        saveProfileForUser(blank);
        return blank;
      }
    }

    // Authenticated but no profile record yet: return a clean blank profile (NOT Elena's!)
    return {
      id: currentUserId || 'user-' + Date.now(),
      username: currentUsername || 'user',
      name: currentUsername || 'User',
      bio: '',
      avatarUrl: '',
      themeId: 'warm-paper',
      isPublic: true,
      links: [],
      socials: [],
      skills: [],
      experience: [],
      education: [],
      achievements: [],
      certifications: [],
      timeline: [],
    };
  }

  // Unauthenticated: fall back to sample profile for public browsing only.
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse saved profile:', e);
  }
  return SAMPLE_PROFILES[0];
};

export const saveActiveProfile = (profile: ConnProfile): void => {
  try {
    // Always persist to per-user storage
    saveProfileForUser(profile);

    const currentUsername = loadCurrentUser();
    if (currentUsername && profile.username && profile.username !== currentUsername) {
      saveCurrentUser(profile.username);
    }

    // Also keep the legacy key in sync
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

    // Sync to the all-profiles index.
    const allProfiles = loadAllProfiles();
    const index = allProfiles.findIndex(p => p.username === profile.username || (p.id && p.id === profile.id));
    if (index >= 0) {
      allProfiles[index] = profile;
    } else {
      allProfiles.push(profile);
    }
    localStorage.setItem(ALL_PROFILES_KEY, JSON.stringify(allProfiles));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('conn_profile_updated'));
    }
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
};

export const loadAllProfiles = (): ConnProfile[] => {
  try {
    const saved = localStorage.getItem(ALL_PROFILES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse all profiles:', e);
  }
  // Only show sample profiles when not logged in (for demo/public browsing).
  return checkIsLoggedIn() ? [] : SAMPLE_PROFILES;
};

export const EMPTY_ANALYTICS: AnalyticsData = {
  totalViews: 0,
  totalClicks: 0,
  ctrPercentage: 0,
  dailyViews: [],
  trafficSources: [],
  deviceBreakdown: [],
  clickLogs: [],
  viewLogs: [],
};

export const loadAnalytics = (): AnalyticsData => {
  const currentUsername = loadCurrentUser();
  if (currentUsername) {
    return loadAnalyticsForUser(currentUsername);
  }
  try {
    const saved = localStorage.getItem(ANALYTICS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse analytics:', e);
  }
  return checkIsLoggedIn() ? EMPTY_ANALYTICS : INITIAL_ANALYTICS;
};

export const saveAnalytics = (data: AnalyticsData): void => {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    const currentUsername = loadCurrentUser();
    if (currentUsername) {
      saveAnalyticsForUser(currentUsername, data);
    }
  } catch (e) {
    console.error('Failed to save analytics:', e);
  }
};

export const recordLinkClick = (linkId: string): void => {
  const allProfiles = loadAllProfiles();
  const activeProfile = loadActiveProfile();
  const targetProfile = allProfiles.find(p => (p.links || []).some(l => l.id === linkId)) || activeProfile;
  let clickedTitle = 'Link';

  const updatedLinks = (targetProfile.links || []).map(l => {
    if (l.id === linkId) {
      clickedTitle = l.title;
      return { ...l, clicks: (l.clicks || 0) + 1 };
    }
    return l;
  });
  saveActiveProfile({ ...targetProfile, links: updatedLinks });

  const analytics = loadAnalytics();
  const device = getDeviceType();
  const referrer = getReferrerChannel();

  const newLog: ClickLog = {
    id: `clk-${Date.now()}`,
    linkId,
    linkTitle: clickedTitle,
    timestamp: new Date().toISOString(),
    deviceType: device,
    referrer,
  };

  const currentLogs = analytics.clickLogs || [];
  const updatedLogs = [newLog, ...currentLogs].slice(0, 100);

  const newTotalClicks = analytics.totalClicks + 1;
  const ctr = parseFloat(((newTotalClicks / Math.max(analytics.totalViews, 1)) * 100).toFixed(1));

  saveAnalytics({
    ...analytics,
    totalClicks: newTotalClicks,
    ctrPercentage: ctr,
    clickLogs: updatedLogs,
  });
};

export const recordProfileView = (): void => {
  const now = Date.now();
  const lastView = sessionStorage.getItem(LAST_VIEW_KEY);
  
  // Dedupe/debounce: 1 view per 10 minutes in same browser session
  if (lastView && now - parseInt(lastView, 10) < 10 * 60 * 1000) {
    return;
  }
  sessionStorage.setItem(LAST_VIEW_KEY, now.toString());

  const analytics = loadAnalytics();
  const device = getDeviceType();
  const referrer = getReferrerChannel();

  const newViewLog: ViewLog = {
    id: `vw-${Date.now()}`,
    timestamp: new Date().toISOString(),
    deviceType: device,
    referrer,
  };

  const currentViewLogs = analytics.viewLogs || [];
  const updatedViewLogs = [newViewLog, ...currentViewLogs].slice(0, 100);

  const newTotalViews = analytics.totalViews + 1;
  const ctr = parseFloat(((analytics.totalClicks / newTotalViews) * 100).toFixed(1));

  saveAnalytics({
    ...analytics,
    totalViews: newTotalViews,
    ctrPercentage: ctr,
    viewLogs: updatedViewLogs,
  });
};

export const checkIsLoggedIn = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};

export const setLoggedIn = (status: boolean): void => {
  localStorage.setItem(AUTH_KEY, status ? 'true' : 'false');
  if (!status) {
    // On logout also clear the active profile cache so the next user
    // does not see the previous user's data.
    clearCurrentUser();
    clearCurrentUserId();
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }
};

// ---------------------------------------------------------------------------
// Per-user analytics helpers
// ---------------------------------------------------------------------------

export const loadAnalyticsForUser = (username: string): AnalyticsData => {
  try {
    const saved = localStorage.getItem(USER_ANALYTICS_PREFIX + username);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load analytics for user:', e);
  }
  return INITIAL_ANALYTICS;
};

export const saveAnalyticsForUser = (username: string, data: AnalyticsData): void => {
  try {
    localStorage.setItem(USER_ANALYTICS_PREFIX + username, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save analytics for user:', e);
  }
};
