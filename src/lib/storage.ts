import { ConnProfile, AnalyticsData, ClickLog, ViewLog } from '../types';
import { SAMPLE_PROFILES, INITIAL_ANALYTICS } from '../data/mockData';

const PROFILE_STORAGE_KEY = 'conn_active_profile_v2';
const ALL_PROFILES_KEY = 'conn_all_profiles_v2';
const ANALYTICS_KEY = 'conn_analytics_v2';
const AUTH_KEY = 'conn_auth_session_v2';
const LAST_VIEW_KEY = 'conn_last_view_ts_v2';

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

export const loadActiveProfile = (): ConnProfile => {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse saved profile:', e);
  }
  return SAMPLE_PROFILES[0];
};

export const saveActiveProfile = (profile: ConnProfile): void => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    
    // Also sync to all profiles list
    const allProfiles = loadAllProfiles();
    const index = allProfiles.findIndex(p => p.username === profile.username);
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
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse all profiles:', e);
  }
  return SAMPLE_PROFILES;
};

export const loadAnalytics = (): AnalyticsData => {
  try {
    const saved = localStorage.getItem(ANALYTICS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse analytics:', e);
  }
  return INITIAL_ANALYTICS;
};

export const saveAnalytics = (data: AnalyticsData): void => {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
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
};
