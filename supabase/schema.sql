-- ==============================================================================
-- Complete PostgreSQL Schema & Row Level Security for Black-and-White Portfolio CMS
-- Compatible with Supabase PostgreSQL and Supabase Auth
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Portfolio Profile Table
CREATE TABLE IF NOT EXISTS public.portfolio_profile (
    id TEXT PRIMARY KEY DEFAULT 'profile-primary',
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    short_intro TEXT,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    availability_status TEXT,
    is_available BOOLEAN DEFAULT true,
    email TEXT,
    phone TEXT,
    resume_url TEXT,
    hero_heading TEXT,
    hero_subtext TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    full_description TEXT,
    cover_image TEXT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
    category TEXT NOT NULL,
    date TEXT,
    live_url TEXT,
    github_url TEXT,
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    proficiency INTEGER DEFAULT 90 CHECK (proficiency >= 0 AND proficiency <= 100),
    display_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true
);

-- 4. Experiences Table
CREATE TABLE IF NOT EXISTS public.experiences (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    bullets TEXT[] DEFAULT ARRAY[]::TEXT[],
    display_order INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT true
);

-- 5. Educations Table
CREATE TABLE IF NOT EXISTS public.educations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    location TEXT,
    start_year TEXT NOT NULL,
    end_year TEXT NOT NULL,
    description TEXT,
    grade_or_honors TEXT,
    display_order INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT true
);

-- 6. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Server',
    deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
    display_order INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT true
);

-- 7. Contact Messages Table (Enquiries)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false
);

-- 8. Social Links Table
CREATE TABLE IF NOT EXISTS public.social_links (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    label TEXT,
    icon TEXT DEFAULT 'ExternalLink',
    display_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true
);

-- 9. Navigation & Section Settings Table
CREATE TABLE IF NOT EXISTS public.section_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);

-- 10. Appearance Settings Table
CREATE TABLE IF NOT EXISTS public.appearance_settings (
    id TEXT PRIMARY KEY DEFAULT 'appearance-primary',
    monogram TEXT DEFAULT 'MV',
    site_title TEXT NOT NULL,
    tagline TEXT,
    font_choice TEXT DEFAULT 'modern',
    theme_accent TEXT DEFAULT 'pure-black',
    footer_text TEXT
);

-- 11. SEO Settings Table
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id TEXT PRIMARY KEY DEFAULT 'seo-primary',
    meta_title TEXT NOT NULL,
    meta_description TEXT NOT NULL,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    keywords TEXT
);

-- 12. Website Settings Table
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'website-primary',
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT,
    contact_form_enabled BOOLEAN DEFAULT true,
    resume_download_enabled BOOLEAN DEFAULT true,
    hire_cta_enabled BOOLEAN DEFAULT true,
    recipient_email TEXT
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.portfolio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appearance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- 1. Profile: Public can read, authenticated can modify
CREATE POLICY "Public profile read" ON public.portfolio_profile FOR SELECT USING (true);
CREATE POLICY "Admin profile insert" ON public.portfolio_profile FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin profile update" ON public.portfolio_profile FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin profile delete" ON public.portfolio_profile FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Projects: Public can only read published projects. Authenticated admin can read and edit all.
CREATE POLICY "Public read published projects" ON public.projects FOR SELECT USING (published = true);
CREATE POLICY "Admin read all projects" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert projects" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update projects" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete projects" ON public.projects FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Skills: Public can read visible skills. Admin can read and edit all.
CREATE POLICY "Public read visible skills" ON public.skills FOR SELECT USING (visible = true);
CREATE POLICY "Admin read all skills" ON public.skills FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert skills" ON public.skills FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update skills" ON public.skills FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete skills" ON public.skills FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Experiences: Public can read published. Admin full control.
CREATE POLICY "Public read published experiences" ON public.experiences FOR SELECT USING (published = true);
CREATE POLICY "Admin read all experiences" ON public.experiences FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert experiences" ON public.experiences FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update experiences" ON public.experiences FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete experiences" ON public.experiences FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Educations: Public can read published. Admin full control.
CREATE POLICY "Public read published educations" ON public.educations FOR SELECT USING (published = true);
CREATE POLICY "Admin read all educations" ON public.educations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert educations" ON public.educations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update educations" ON public.educations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete educations" ON public.educations FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Services: Public can read published. Admin full control.
CREATE POLICY "Public read published services" ON public.services FOR SELECT USING (published = true);
CREATE POLICY "Admin read all services" ON public.services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert services" ON public.services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update services" ON public.services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete services" ON public.services FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Contact Messages: Public can INSERT only (submit message). ONLY authenticated admin can SELECT, UPDATE, DELETE!
CREATE POLICY "Public insert contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read contact messages" ON public.contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update contact messages" ON public.contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete contact messages" ON public.contact_messages FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Social Links
CREATE POLICY "Public read visible social links" ON public.social_links FOR SELECT USING (visible = true);
CREATE POLICY "Admin read all social links" ON public.social_links FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert social links" ON public.social_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update social links" ON public.social_links FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete social links" ON public.social_links FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Navigation & Section Settings
CREATE POLICY "Public read section settings" ON public.section_settings FOR SELECT USING (true);
CREATE POLICY "Admin all section settings" ON public.section_settings FOR ALL USING (auth.role() = 'authenticated');

-- 10. Appearance Settings
CREATE POLICY "Public read appearance" ON public.appearance_settings FOR SELECT USING (true);
CREATE POLICY "Admin all appearance" ON public.appearance_settings FOR ALL USING (auth.role() = 'authenticated');

-- 11. SEO Settings
CREATE POLICY "Public read seo" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Admin all seo" ON public.seo_settings FOR ALL USING (auth.role() = 'authenticated');

-- 12. Website Settings
CREATE POLICY "Public read website settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Admin all website settings" ON public.website_settings FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- STORAGE CONFIGURATION (for portfolio-assets bucket)
-- ==============================================================================

-- Create the storage bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket Security Policies
CREATE POLICY "Public can view assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Admin can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can update assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can delete assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-assets' AND auth.role() = 'authenticated');
