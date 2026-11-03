import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Polyfill WebSocket for Node < 22 environments where Supabase Realtime checks globalThis.WebSocket
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class WebSocket {};
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Middleware
app.use(express.json({ limit: '10mb' }));

// CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Reserved system slugs that cannot be used as user profile handles
export const RESERVED_SLUGS = [
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
  'users',
  'user',
  'status',
  'health',
  'privacy',
  'terms',
];

/**
 * Sanitizes a database profile row into a safe public profile object
 * Excludes private credentials and internal system fields.
 */
function sanitizePublicProfile(row: any) {
  return {
    id: row.id,
    username: row.username,
    name: row.name || row.username,
    bio: row.bio || '',
    avatarUrl: row.avatar_url || '',
    location: row.location || undefined,
    pronouns: row.pronouns || undefined,
    statusBadge: row.status_badge || undefined,
    themeId: row.theme_id || 'warm-paper',
    isPublic: row.is_public ?? true,
    isPasswordProtected: row.is_password_protected ?? false,
    role: row.role || undefined,
    organization: row.organization || undefined,
    resumeUrl: row.resume_url || undefined,
    customDomain: row.custom_domain || undefined,

    // Public links & content (filter to active links only)
    links: Array.isArray(row.links)
      ? row.links.filter((l: any) => l.isActive !== false)
      : [],
    socials: Array.isArray(row.socials) ? row.socials : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    experience: Array.isArray(row.experience) ? row.experience : [],
    education: Array.isArray(row.education) ? row.education : [],
    achievements: Array.isArray(row.achievements) ? row.achievements : [],
    certifications: Array.isArray(row.certifications) ? row.certifications : [],
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    timelineStyle: row.timeline_style || 'roadmap',
    nowSection: row.now_section || {},
    availability: row.availability || null,
    connectedServices: Array.isArray(row.connected_services) ? row.connected_services : [],
    openSourceStats: row.open_source_stats || null,
    snapshots: Array.isArray(row.snapshots) ? row.snapshots : [],
    visibility: row.visibility || {},
    layoutConfig: row.layout_config || null,
    customTheme: row.custom_theme || null,
    customAccentColor: row.custom_accent_color || null,
    customLinkShape: row.custom_link_shape || null,
    customDesignFamilies: Array.isArray(row.custom_design_families) ? row.custom_design_families : [],
    customBackground: row.custom_background || null,
    motionConfig: row.motion_config || null,
    elementOverrides: row.element_overrides || {},
    decorativeObjects: Array.isArray(row.decorative_objects) ? row.decorative_objects : [],
    categoriesMeta: Array.isArray(row.categories_meta) ? row.categories_meta : [],
    newsletterEnabled: row.newsletter_enabled ?? false,
    newsletterHeadline: row.newsletter_headline || '',
    newsletterSubtext: row.newsletter_subtext || '',
  };
}

// ----------------------------------------------------------------------------
// API Routes
// ----------------------------------------------------------------------------

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'conn-profile-server',
    supabaseConnected: Boolean(supabase),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Check username availability
 * GET /api/username/check/:username?excludeUserId=uuid
 */
app.get('/api/username/check/:username', async (req: Request, res: Response) => {
  try {
    const rawUsername = (req.params.username || '').toLowerCase().trim();
    const excludeUserId = (req.query.excludeUserId as string) || '';

    // Validate length
    if (!rawUsername || rawUsername.length < 3) {
      return res.json({
        available: false,
        username: rawUsername,
        reason: 'Username must be at least 3 characters long.',
      });
    }

    if (rawUsername.length > 30) {
      return res.json({
        available: false,
        username: rawUsername,
        reason: 'Username cannot exceed 30 characters.',
      });
    }

    // Validate characters: only lowercase letters, numbers, hyphens, and underscores
    if (!/^[a-z0-9_-]+$/.test(rawUsername)) {
      return res.json({
        available: false,
        username: rawUsername,
        reason: 'Username can only contain lowercase letters, numbers, hyphens, and underscores.',
      });
    }

    // Check reserved list
    if (RESERVED_SLUGS.includes(rawUsername)) {
      return res.json({
        available: false,
        username: rawUsername,
        reason: `"${rawUsername}" is a reserved system URL slug.`,
      });
    }

    // Check database if Supabase is connected
    if (!supabase) {
      return res.json({ available: true, username: rawUsername });
    }

    const { data, error } = await supabase
      .from('conn_profiles')
      .select('id, username')
      .ilike('username', rawUsername)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error checking username:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (data) {
      // If the matched row belongs to the current user, it is available to them
      if (excludeUserId && data.id === excludeUserId) {
        return res.json({ available: true, username: rawUsername });
      }
      return res.json({
        available: false,
        username: rawUsername,
        reason: `Username @${rawUsername} is already taken by another profile.`,
      });
    }

    return res.json({ available: true, username: rawUsername });
  } catch (err: any) {
    console.error('Error in username check:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * Fetch a user's public profile by username
 * GET /api/profile/:username
 */
app.get('/api/profile/:username', async (req: Request, res: Response) => {
  try {
    const rawUsername = (req.params.username || '').toLowerCase().trim();

    if (!rawUsername) {
      return res.status(400).json({ error: 'Username parameter is required' });
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Database service is not configured' });
    }

    const { data, error } = await supabase
      .from('conn_profiles')
      .select('*')
      .ilike('username', rawUsername)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile from Supabase:', error);
      return res.status(500).json({ error: 'Failed to retrieve profile' });
    }

    if (!data) {
      return res.status(404).json({
        error: 'Profile not found',
        username: rawUsername,
      });
    }

    // Check publication status: if profile is unpublished (private), return 403 status
    if (data.is_public === false) {
      return res.status(403).json({
        error: 'This profile is currently unpublished / private.',
        isPublic: false,
        username: rawUsername,
      });
    }

    const sanitized = sanitizePublicProfile(data);
    return res.json({
      success: true,
      profile: sanitized,
    });
  } catch (err: any) {
    console.error('Error fetching public profile:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * Publish / Unpublish a profile
 * POST /api/profile/publish
 * Body: { userId: string, isPublic: boolean }
 */
app.post('/api/profile/publish', async (req: Request, res: Response) => {
  try {
    const { userId, isPublic } = req.body;

    if (!userId || typeof isPublic !== 'boolean') {
      return res.status(400).json({ error: 'userId and boolean isPublic are required' });
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Database service is not configured' });
    }

    const { data, error } = await supabase
      .from('conn_profiles')
      .update({
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, username, is_public')
      .maybeSingle();

    if (error) {
      console.error('Error updating profile publication status:', error);
      return res.status(500).json({ error: error.message || 'Failed to update publication status' });
    }

    return res.json({
      success: true,
      userId,
      isPublic,
      username: data?.username,
      message: isPublic
        ? 'Profile is now published and accessible at conn.bio/' + (data?.username || '')
        : 'Profile has been unpublished and is now private.',
    });
  } catch (err: any) {
    console.error('Error in publish endpoint:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ----------------------------------------------------------------------------
// Production Static File Serving & Wildcard SPA Routing
// ----------------------------------------------------------------------------
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// For all non-API routes, serve index.html to allow client-side SPA routing (e.g. /:username)
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Conn. - Living Identity System</title></head>
          <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
            <h2>Conn API Server is active on port ${PORT}</h2>
            <p>Run <code>npm run dev</code> for frontend development or <code>npm run build</code> for production build.</p>
          </body>
        </html>
      `);
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Conn API & Profile Server running on http://localhost:${PORT}`);
  });
}

export default app;
