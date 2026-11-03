-- =============================================================================
-- CONN — Supabase Database Setup
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query -> Run
--
-- This script is ADDITIVE. It will not destroy existing data.
-- It uses CREATE TABLE IF NOT EXISTS and safely adds RLS policies.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
--    Stores each user's ConnProfile data.
--    The user's identity comes from Supabase Auth (auth.users).
--    All complex nested objects (links, socials, timeline, etc.) are stored
--    as JSONB so we don't need to change this schema when the app adds fields.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conn_profiles (
  -- Primary key is the Supabase Auth user UUID
  id               UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Unique handle used in public URLs like conn.bio/username
  username         TEXT         NOT NULL UNIQUE,

  -- Display name (can differ from username)
  name             TEXT         NOT NULL DEFAULT '',

  -- Short biography
  bio              TEXT         NOT NULL DEFAULT '',

  -- URL to avatar image (Supabase Storage or external)
  avatar_url       TEXT         NOT NULL DEFAULT '',

  -- Optional profile fields
  location         TEXT         NOT NULL DEFAULT '',
  pronouns         TEXT         NOT NULL DEFAULT '',
  status_badge     TEXT         NOT NULL DEFAULT '',
  contact_email    TEXT         NOT NULL DEFAULT '',
  resume_url       TEXT         NOT NULL DEFAULT '',
  custom_domain    TEXT         NOT NULL DEFAULT '',
  role             TEXT         NOT NULL DEFAULT '',
  organization     TEXT         NOT NULL DEFAULT '',

  -- Theme selection
  theme_id         TEXT         NOT NULL DEFAULT 'warm-paper',
  is_public        BOOLEAN      NOT NULL DEFAULT TRUE,
  is_password_protected BOOLEAN NOT NULL DEFAULT FALSE,

  -- JSONB blobs for complex nested arrays and objects
  links            JSONB        NOT NULL DEFAULT '[]',
  socials          JSONB        NOT NULL DEFAULT '[]',
  skills           JSONB        NOT NULL DEFAULT '[]',
  experience       JSONB        NOT NULL DEFAULT '[]',
  education        JSONB        NOT NULL DEFAULT '[]',
  achievements     JSONB        NOT NULL DEFAULT '[]',
  certifications   JSONB        NOT NULL DEFAULT '[]',
  timeline         JSONB        NOT NULL DEFAULT '[]',
  timeline_style   TEXT         NOT NULL DEFAULT 'roadmap',
  now_section      JSONB        NOT NULL DEFAULT '{}',
  availability     JSONB,
  connected_services JSONB      NOT NULL DEFAULT '[]',
  open_source_stats  JSONB,
  snapshots        JSONB        NOT NULL DEFAULT '[]',
  visibility       JSONB        NOT NULL DEFAULT '{}',
  layout_config    JSONB,
  custom_theme     JSONB,
  custom_accent_color TEXT,
  custom_link_shape   TEXT,
  saved_custom_themes JSONB     NOT NULL DEFAULT '[]',
  custom_design_families JSONB  NOT NULL DEFAULT '[]',
  custom_background  JSONB,
  motion_config    JSONB,
  element_overrides  JSONB      NOT NULL DEFAULT '{}',
  decorative_objects JSONB      NOT NULL DEFAULT '[]',
  categories_meta  JSONB        NOT NULL DEFAULT '[]',
  newsletter_enabled BOOLEAN    NOT NULL DEFAULT FALSE,
  newsletter_headline TEXT      NOT NULL DEFAULT '',
  newsletter_subtext  TEXT      NOT NULL DEFAULT '',

  -- Onboarding flag
  onboarding_complete BOOLEAN   NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for fast username lookups (public profile URLs)
CREATE UNIQUE INDEX IF NOT EXISTS conn_profiles_username_idx ON public.conn_profiles (username);
-- Index for fast public profile listing
CREATE INDEX IF NOT EXISTS conn_profiles_is_public_idx ON public.conn_profiles (is_public);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.update_conn_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conn_profiles_updated_at ON public.conn_profiles;
CREATE TRIGGER trg_conn_profiles_updated_at
  BEFORE UPDATE ON public.conn_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_conn_profiles_updated_at();


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ANALYTICS TABLE
--    Per-user analytics: click logs and view logs stored as JSONB arrays.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conn_analytics (
  user_id          UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_views      INTEGER      NOT NULL DEFAULT 0,
  total_clicks     INTEGER      NOT NULL DEFAULT 0,
  ctr_percentage   NUMERIC(5,1) NOT NULL DEFAULT 0,
  daily_views      JSONB        NOT NULL DEFAULT '[]',
  traffic_sources  JSONB        NOT NULL DEFAULT '[]',
  device_breakdown JSONB        NOT NULL DEFAULT '[]',
  click_logs       JSONB        NOT NULL DEFAULT '[]',
  view_logs        JSONB        NOT NULL DEFAULT '[]',
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.conn_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conn_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles: owner can do everything
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conn_profiles' AND policyname = 'conn_profiles_owner_all'
  ) THEN
    CREATE POLICY conn_profiles_owner_all ON public.conn_profiles
      FOR ALL
      USING  (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Profiles: anyone can SELECT public profiles (for public profile pages)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conn_profiles' AND policyname = 'conn_profiles_public_read'
  ) THEN
    CREATE POLICY conn_profiles_public_read ON public.conn_profiles
      FOR SELECT
      USING (is_public = TRUE);
  END IF;
END $$;

-- Analytics: owner only
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conn_analytics' AND policyname = 'conn_analytics_owner_all'
  ) THEN
    CREATE POLICY conn_analytics_owner_all ON public.conn_analytics
      FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. AUTO-CREATE PROFILE ON SIGNUP
--    When a new user signs up via Supabase Auth, automatically insert a
--    skeleton profile row. Username defaults to the email prefix;
--    the user sets it properly in the profile editor.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  raw_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  -- Derive username from email prefix, allow only safe chars.
  raw_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9_\-]', '', 'g'));
  IF length(raw_username) < 3 THEN raw_username := 'user' || raw_username; END IF;

  -- If the signup call passed a username in raw_user_meta_data, prefer it.
  IF NEW.raw_user_meta_data ->> 'username' IS NOT NULL THEN
    raw_username := lower(regexp_replace(NEW.raw_user_meta_data ->> 'username', '[^a-z0-9_\-]', '', 'g'));
  END IF;

  -- Ensure uniqueness by appending an incrementing suffix.
  final_username := raw_username;
  WHILE EXISTS (SELECT 1 FROM public.conn_profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := raw_username || suffix::TEXT;
  END LOOP;

  INSERT INTO public.conn_profiles (
    id,
    username,
    name,
    contact_email,
    onboarding_complete
  ) VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data ->> 'name', final_username),
    NEW.email,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  -- Initialise an empty analytics row for the user.
  INSERT INTO public.conn_analytics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SANITY CHECK (uncomment to run after setup)
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('conn_profiles','conn_analytics');
-- SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('conn_profiles','conn_analytics');
