/**
 * Dynamic SQL Migration & Security Policy Generator for Supabase / PostgreSQL.
 * Dynamically binds to the administrator's authorized email address.
 */

export function sanitizeEmailForSql(email: string): string {
  if (!email) return 'admin@portfolio.local';
  // Strip dangerous characters to prevent SQL injection in pasted script
  return email.trim().replace(/'/g, "''").toLowerCase();
}

/**
 * Complete PostgreSQL / Supabase DDL schema, dynamic RLS policies, and seed data.
 */
export function generateFullSchemaSql(email: string): string {
  const adminEmail = sanitizeEmailForSql(email);

  return `-- ==============================================================================
-- AETHELGARD PORTFOLIO & CMS: COMPLETE SUPABASE / POSTGRESQL SCHEMA
-- Generated Dynamically for Authorized Admin: ${adminEmail}
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Clean helper function: dynamically evaluates if current JWT belongs to authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    -- Check 1: User's Supabase Auth JWT email matches the authorized admin email
    (auth.jwt() ->> 'email') = '${adminEmail}'
    -- Check 2: Direct service_role access (e.g. CLI migrations, backend admin scripts)
    OR (auth.jwt() ->> 'role') = 'service_role'
    OR current_user = 'postgres',
    false
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Security barrier checking if current session is ${adminEmail}';

-- ------------------------------------------------------------------------------
-- 3. CORE APPLICATION TABLES
-- ------------------------------------------------------------------------------

-- Profile & Bio Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    name TEXT NOT NULL DEFAULT 'Mico Sydney',
    title TEXT NOT NULL DEFAULT 'Full Stack Software Developer',
    "shortBio" TEXT,
    "fullBio" TEXT,
    "profileImage" TEXT,
    location TEXT DEFAULT 'San Francisco, CA',
    "availabilityStatus" TEXT DEFAULT 'available',
    email TEXT DEFAULT '${adminEmail}',
    "resumeUrl" TEXT,
    "resumeEnabled" BOOLEAN DEFAULT true,
    "heroHeading" TEXT,
    "heroSubheading" TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "coverImage" TEXT,
    "additionalImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
    category TEXT DEFAULT 'General',
    date TEXT,
    "liveUrl" TEXT,
    "githubUrl" TEXT,
    featured BOOLEAN DEFAULT false,
    "displayOrder" INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Categories
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "displayOrder" INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true
);

-- Skills
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY,
    "categoryId" TEXT REFERENCES public.skill_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 80,
    "displayOrder" INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true
);

-- Experience / Career Timeline
CREATE TABLE IF NOT EXISTS public.experiences (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    period TEXT,
    current BOOLEAN DEFAULT false,
    description TEXT,
    "bulletPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayOrder" INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT true
);

-- Education & Credentials
CREATE TABLE IF NOT EXISTS public.education (
    id TEXT PRIMARY KEY,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    location TEXT,
    year TEXT,
    description TEXT,
    "credentialUrl" TEXT,
    "displayOrder" INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT true
);

-- Services & Capabilities
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayOrder" INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true
);

-- Contact Inquiries (Honeypot-protected)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Links
CREATE TABLE IF NOT EXISTS public.social_links (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT 'globe',
    "displayOrder" INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true
);

-- Global Website Settings
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    "contactFormEnabled" BOOLEAN DEFAULT true,
    "resumeDownloadEnabled" BOOLEAN DEFAULT true,
    "maintenanceMode" BOOLEAN DEFAULT false,
    "maintenanceMessage" TEXT,
    "customDomain" TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to prevent conflicts on repeated execution
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "projects_select_published" ON public.projects;
DROP POLICY IF EXISTS "projects_admin_all" ON public.projects;
DROP POLICY IF EXISTS "categories_select_public" ON public.skill_categories;
DROP POLICY IF EXISTS "categories_admin_all" ON public.skill_categories;
DROP POLICY IF EXISTS "skills_select_public" ON public.skills;
DROP POLICY IF EXISTS "skills_admin_all" ON public.skills;
DROP POLICY IF EXISTS "experiences_select_public" ON public.experiences;
DROP POLICY IF EXISTS "experiences_admin_all" ON public.experiences;
DROP POLICY IF EXISTS "education_select_public" ON public.education;
DROP POLICY IF EXISTS "education_admin_all" ON public.education;
DROP POLICY IF EXISTS "services_select_public" ON public.services;
DROP POLICY IF EXISTS "services_admin_all" ON public.services;
DROP POLICY IF EXISTS "messages_insert_public" ON public.contact_messages;
DROP POLICY IF EXISTS "messages_admin_all" ON public.contact_messages;
DROP POLICY IF EXISTS "socials_select_public" ON public.social_links;
DROP POLICY IF EXISTS "socials_admin_all" ON public.social_links;
DROP POLICY IF EXISTS "settings_select_public" ON public.website_settings;
DROP POLICY IF EXISTS "settings_admin_all" ON public.website_settings;

-- PROFILES
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PROJECTS: Public can only see published projects; ${adminEmail} sees drafts + full access
CREATE POLICY "projects_select_published" ON public.projects FOR SELECT USING (status = 'published');
CREATE POLICY "projects_admin_all" ON public.projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SKILL CATEGORIES & SKILLS
CREATE POLICY "categories_select_public" ON public.skill_categories FOR SELECT USING (visible = true);
CREATE POLICY "categories_admin_all" ON public.skill_categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "skills_select_public" ON public.skills FOR SELECT USING (visible = true);
CREATE POLICY "skills_admin_all" ON public.skills FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- EXPERIENCES & EDUCATION
CREATE POLICY "experiences_select_public" ON public.experiences FOR SELECT USING (published = true);
CREATE POLICY "experiences_admin_all" ON public.experiences FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "education_select_public" ON public.education FOR SELECT USING (published = true);
CREATE POLICY "education_admin_all" ON public.education FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SERVICES & SOCIAL LINKS
CREATE POLICY "services_select_public" ON public.services FOR SELECT USING (enabled = true);
CREATE POLICY "services_admin_all" ON public.services FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "socials_select_public" ON public.social_links FOR SELECT USING (visible = true);
CREATE POLICY "socials_admin_all" ON public.social_links FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CONTACT MESSAGES: Public can insert messages; Only ${adminEmail} can read/archive/delete
CREATE POLICY "messages_insert_public" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_admin_all" ON public.contact_messages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- WEBSITE SETTINGS
CREATE POLICY "settings_select_public" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_all" ON public.website_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. SEED / UPSERT PRIMARY PROFILE (Bound to ${adminEmail})
-- ------------------------------------------------------------------------------

INSERT INTO public.profiles (
    id,
    name,
    title,
    email,
    location,
    "availabilityStatus",
    "shortBio",
    "resumeEnabled",
    "heroHeading",
    "heroSubheading"
) VALUES (
    'primary',
    'Mico Sydney',
    'Full Stack Software Developer',
    '${adminEmail}',
    'Remote & Hybrid (Worldwide)',
    'available',
    'Building scalable web applications, robust REST/GraphQL APIs, and high-performance digital experiences.',
    true,
    'Building scalable web applications, robust APIs, and refined user experiences.',
    'Full stack developer proficient in React, TypeScript, Node.js, Python, PostgreSQL, and cloud infrastructure.'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 6. STORAGE BUCKET (For Portfolio Image Uploads)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage bucket security policies
DROP POLICY IF EXISTS "Public can view portfolio assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload portfolio assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete portfolio assets" ON storage.objects;

CREATE POLICY "Public can view portfolio assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Admin can upload portfolio assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());

CREATE POLICY "Admin can delete portfolio assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio' AND public.is_admin());
`;
}

/**
 * Lightweight SQL to update authorized administrator email without touching existing database rows.
 */
export function generateRlsUpdateSql(email: string): string {
  const adminEmail = sanitizeEmailForSql(email);

  return `-- ==============================================================================
-- DYNAMIC AUTHORIZATION UPDATE: CHANGE ADMIN EMAIL TO: ${adminEmail}
-- Run this in Supabase SQL Editor to switch admin clearance to ${adminEmail}
-- ==============================================================================

-- 1. Redefine security validator function to authorize ${adminEmail}
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = '${adminEmail}'
    OR (auth.jwt() ->> 'role') = 'service_role'
    OR current_user = 'postgres',
    false
  );
$$;

-- 2. Update email in primary profile record
UPDATE public.profiles
SET email = '${adminEmail}', updated_at = NOW()
WHERE id = 'primary';

-- Verification Query (Run this to confirm)
SELECT 
    '${adminEmail}' AS authorized_email, 
    public.is_admin() AS is_current_caller_admin,
    NOW() AS updated_timestamp;
`;
}

/**
 * SQL snippet to create or ensure the auth user exists in Supabase.
 */
export function generateSupabaseAuthUserSql(email: string): string {
  const adminEmail = sanitizeEmailForSql(email);

  return `-- ==============================================================================
-- SUPABASE AUTH USER PROVISIONING SCRIPT FOR: ${adminEmail}
-- Run this in Supabase SQL Editor if you prefer to seed your admin account via SQL
-- ==============================================================================

-- Note: You can also simply invite or create the user in Supabase Dashboard
-- at Authentication -> Users -> Add User -> Create User with ${adminEmail}

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- Only create if user does not already exist in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = '${adminEmail}') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      '${adminEmail}',
      crypt('AdminPassword123!', gen_salt('bf')), -- Change this default password
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrator"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      new_user_id,
      format('{"sub":"%s","email":"%s"}', new_user_id, '${adminEmail}')::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Admin user created for % with default password AdminPassword123!', '${adminEmail}';
  ELSE
    -- If user already exists, ensure email is confirmed
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE email = '${adminEmail}';
    
    RAISE NOTICE 'Admin user % already exists. Ensured email confirmation is active.', '${adminEmail}';
  END IF;
END $$;
`;
}
