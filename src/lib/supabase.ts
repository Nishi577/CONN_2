import { createClient } from '@supabase/supabase-js';
import { ConnProfile, AnalyticsData } from '../types';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// Normalize URL: supports project ID (e.g. 'rrihwgowsiudlpazbprv') or full URL (e.g. 'https://xxx.supabase.co')
export const getNormalizedSupabaseUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}.supabase.co`;
};

const supabaseUrl = getNormalizedSupabaseUrl(rawUrl);

export const isSupabaseConfigured = Boolean(supabaseUrl && anonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// ============================================================================
// Data Transformation: ConnProfile <-> Database Row
// ============================================================================

/**
 * Maps a ConnProfile (camelCase) to the `conn_profiles` Postgres row (snake_case).
 */
export const profileToDbRow = (profile: ConnProfile, userId: string) => {
  return {
    id: userId,
    username: profile.username.toLowerCase().trim(),
    name: profile.name || '',
    bio: profile.bio || '',
    avatar_url: profile.avatarUrl || '',
    location: profile.location || '',
    pronouns: profile.pronouns || '',
    status_badge: profile.statusBadge || '',
    contact_email: profile.contactEmail || '',
    resume_url: profile.resumeUrl || '',
    custom_domain: profile.customDomain || '',
    role: profile.role || '',
    organization: profile.organization || '',
    theme_id: profile.themeId || 'warm-paper',
    is_public: profile.isPublic ?? true,
    is_password_protected: profile.isPasswordProtected ?? false,
    links: Array.isArray(profile.links) ? profile.links : [],
    socials: Array.isArray(profile.socials) ? profile.socials : [],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    experience: Array.isArray(profile.experience) ? profile.experience : [],
    education: Array.isArray(profile.education) ? profile.education : [],
    achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    timeline: Array.isArray(profile.timeline) ? profile.timeline : [],
    timeline_style: profile.timelineStyle || 'roadmap',
    now_section: profile.nowSection || {},
    availability: profile.availability || null,
    connected_services: Array.isArray(profile.connectedServices) ? profile.connectedServices : [],
    open_source_stats: profile.openSourceStats || null,
    snapshots: Array.isArray(profile.snapshots) ? profile.snapshots : [],
    visibility: profile.visibility || {},
    layout_config: profile.layoutConfig || null,
    custom_theme: profile.customTheme || null,
    custom_accent_color: profile.customAccentColor || null,
    custom_link_shape: profile.customLinkShape || null,
    saved_custom_themes: Array.isArray(profile.savedCustomThemes) ? profile.savedCustomThemes : [],
    custom_design_families: Array.isArray(profile.customDesignFamilies) ? profile.customDesignFamilies : [],
    custom_background: profile.customBackground || null,
    motion_config: profile.motionConfig || null,
    element_overrides: profile.elementOverrides || {},
    decorative_objects: Array.isArray(profile.decorativeObjects) ? profile.decorativeObjects : [],
    categories_meta: Array.isArray(profile.categoriesMeta) ? profile.categoriesMeta : [],
    newsletter_enabled: profile.newsletterEnabled ?? false,
    newsletter_headline: profile.newsletterHeadline || '',
    newsletter_subtext: profile.newsletterSubtext || '',
    updated_at: new Date().toISOString(),
  };
};

/**
 * Maps a `conn_profiles` Postgres row (snake_case) to ConnProfile (camelCase).
 */
export const dbRowToProfile = (row: any): ConnProfile => {
  return {
    id: row.id,
    username: row.username || '',
    name: row.name ?? '',
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url ?? '',
    location: row.location || undefined,
    pronouns: row.pronouns || undefined,
    statusBadge: row.status_badge || undefined,
    contactEmail: row.contact_email || undefined,
    resumeUrl: row.resume_url || undefined,
    customDomain: row.custom_domain || undefined,
    role: row.role || undefined,
    organization: row.organization || undefined,
    themeId: row.theme_id || 'warm-paper',
    isPublic: row.is_public ?? true,
    isPasswordProtected: row.is_password_protected ?? false,
    links: Array.isArray(row.links) ? row.links : [],
    socials: Array.isArray(row.socials) ? row.socials : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    experience: Array.isArray(row.experience) ? row.experience : [],
    education: Array.isArray(row.education) ? row.education : [],
    achievements: Array.isArray(row.achievements) ? row.achievements : [],
    certifications: Array.isArray(row.certifications) ? row.certifications : [],
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    timelineStyle: row.timeline_style || 'roadmap',
    nowSection: row.now_section || {},
    availability: row.availability || undefined,
    connectedServices: Array.isArray(row.connected_services) ? row.connected_services : [],
    openSourceStats: row.open_source_stats || undefined,
    snapshots: Array.isArray(row.snapshots) ? row.snapshots : [],
    visibility: row.visibility || {},
    layoutConfig: row.layout_config || undefined,
    customTheme: row.custom_theme || undefined,
    customAccentColor: row.custom_accent_color || undefined,
    customLinkShape: row.custom_link_shape || undefined,
    savedCustomThemes: Array.isArray(row.saved_custom_themes) ? row.saved_custom_themes : [],
    customDesignFamilies: Array.isArray(row.custom_design_families) ? row.custom_design_families : [],
    customBackground: row.custom_background || undefined,
    motionConfig: row.motion_config || undefined,
    elementOverrides: row.element_overrides || {},
    decorativeObjects: Array.isArray(row.decorative_objects) ? row.decorative_objects : [],
    categoriesMeta: Array.isArray(row.categories_meta) ? row.categories_meta : [],
    newsletterEnabled: row.newsletter_enabled ?? false,
    newsletterHeadline: row.newsletter_headline || undefined,
    newsletterSubtext: row.newsletter_subtext || undefined,
  };
};

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Fetch profile row for an authenticated user by their UUID.
 */
export const fetchProfileFromSupabase = async (
  userId: string
): Promise<{ profile: ConnProfile | null; error: Error | null }> => {
  if (!isSupabaseConfigured) {
    return { profile: null, error: new Error('Supabase is not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('conn_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch profile from Supabase:', error);
      return { profile: null, error: new Error(error.message) };
    }

    if (!data) {
      return { profile: null, error: null };
    }

    return { profile: dbRowToProfile(data), error: null };
  } catch (err: any) {
    console.error('Unexpected error fetching profile:', err);
    return { profile: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

/**
 * Upsert profile row into conn_profiles using the authenticated user's UUID.
 */
export const upsertProfileToSupabase = async (
  profile: ConnProfile,
  userId: string
): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured') };
  }

  try {
    const row = profileToDbRow(profile, userId);
    const { error } = await supabase
      .from('conn_profiles')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Failed to upsert profile to Supabase:', error);
      let userFriendlyMessage = error.message;
      if (error.code === '23505' && error.message.includes('username')) {
        userFriendlyMessage = `The username @${profile.username} is already taken by another account.`;
      }
      return { error: new Error(userFriendlyMessage) };
    }

    return { error: null };
  } catch (err: any) {
    console.error('Unexpected error saving profile:', err);
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
};

export const RESERVED_USERNAMES = [
  'api',
  'dashboard',
  'login',
  'signup',
  'settings',
  'admin',
  'profile',
  'conn',
  'home',
  'auth',
  'help',
  'about',
  'assets',
  'public',
  'edit',
  'user',
  'users',
];

/**
 * Validates username syntax and checks whether it's available in Supabase.
 */
export const checkUsernameAvailability = async (
  username: string,
  excludeUserId?: string
): Promise<{ available: boolean; reason?: string }> => {
  const cleanUsername = username.toLowerCase().trim();

  // 1. Length & character format check
  if (!cleanUsername || cleanUsername.length < 3) {
    return { available: false, reason: 'Username must be at least 3 characters long.' };
  }
  if (cleanUsername.length > 30) {
    return { available: false, reason: 'Username cannot exceed 30 characters.' };
  }
  if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
    return { available: false, reason: 'Only lowercase letters, numbers, hyphens, and underscores are allowed.' };
  }

  // 2. Reserved routes check
  if (RESERVED_USERNAMES.includes(cleanUsername)) {
    return { available: false, reason: `"${cleanUsername}" is a reserved system URL.` };
  }

  // 3. Supabase check
  if (!isSupabaseConfigured) {
    return { available: true };
  }

  try {
    const { data, error } = await supabase
      .from('conn_profiles')
      .select('id, username')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (error) {
      console.warn('Error checking username availability:', error);
      return { available: true }; // Allow optimistically if network warning
    }

    if (data) {
      if (excludeUserId && data.id === excludeUserId) {
        return { available: true }; // Belonging to current user
      }
      return { available: false, reason: `@${cleanUsername} is already taken.` };
    }

    return { available: true };
  } catch (err) {
    console.error('Unexpected error checking username:', err);
    return { available: true };
  }
};

/**
 * Look up a public profile by username handle (for public profile view).
 * Handles unpublished/private profiles gracefully.
 */
export const fetchPublicProfileByUsername = async (
  username: string
): Promise<{ profile: ConnProfile | null; isPrivate?: boolean; error: Error | null }> => {
  if (!isSupabaseConfigured) {
    return { profile: null, error: new Error('Supabase is not configured') };
  }

  try {
    const cleanUsername = username.toLowerCase().trim();
    const { data, error } = await supabase
      .from('conn_profiles')
      .select('*')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (error) {
      return { profile: null, error: new Error(error.message) };
    }

    if (!data) {
      return { profile: null, error: null };
    }

    if (data.is_public === false) {
      return { profile: null, isPrivate: true, error: null };
    }

    return { profile: dbRowToProfile(data), isPrivate: false, error: null };
  } catch (err: any) {
    return { profile: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

/**
 * Update the public publishing status of a profile directly in Supabase.
 */
export const setProfilePublicationStatus = async (
  userId: string,
  isPublic: boolean
): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured') };
  }

  try {
    const { error } = await supabase
      .from('conn_profiles')
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
};

/**
 * Fetch all public profiles from Supabase.
 */
export const fetchAllPublicProfilesFromSupabase = async (): Promise<{
  profiles: ConnProfile[];
  error: Error | null;
}> => {
  if (!isSupabaseConfigured) {
    return { profiles: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('conn_profiles')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) {
      return { profiles: [], error: new Error(error.message) };
    }

    return { profiles: (data || []).map(dbRowToProfile), error: null };
  } catch (err: any) {
    return { profiles: [], error: err instanceof Error ? err : new Error(String(err)) };
  }
};

/**
 * Fetch analytics for an authenticated user.
 */
export const fetchAnalyticsFromSupabase = async (
  userId: string
): Promise<{ analytics: AnalyticsData | null; error: Error | null }> => {
  if (!isSupabaseConfigured) {
    return { analytics: null, error: new Error('Supabase is not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('conn_analytics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { analytics: null, error: new Error(error.message) };
    }

    if (!data) return { analytics: null, error: null };

    const analytics: AnalyticsData = {
      totalViews: data.total_views ?? 0,
      totalClicks: data.total_clicks ?? 0,
      ctrPercentage: Number(data.ctr_percentage ?? 0),
      dailyViews: Array.isArray(data.daily_views) ? data.daily_views : [],
      trafficSources: Array.isArray(data.traffic_sources) ? data.traffic_sources : [],
      deviceBreakdown: Array.isArray(data.device_breakdown) ? data.device_breakdown : [],
      clickLogs: Array.isArray(data.click_logs) ? data.click_logs : [],
      viewLogs: Array.isArray(data.view_logs) ? data.view_logs : [],
    };

    return { analytics, error: null };
  } catch (err: any) {
    return { analytics: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

/**
 * Upsert analytics row for an authenticated user.
 */
export const upsertAnalyticsToSupabase = async (
  userId: string,
  analytics: AnalyticsData
): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured') };
  }

  try {
    const { error } = await supabase.from('conn_analytics').upsert(
      {
        user_id: userId,
        total_views: analytics.totalViews,
        total_clicks: analytics.totalClicks,
        ctr_percentage: analytics.ctrPercentage,
        daily_views: analytics.dailyViews,
        traffic_sources: analytics.trafficSources,
        device_breakdown: analytics.deviceBreakdown,
        click_logs: analytics.clickLogs || [],
        view_logs: analytics.viewLogs || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
};
