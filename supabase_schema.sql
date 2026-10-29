-- ==============================================================================
-- AETHELGARD PORTFOLIO & CMS: SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- to create all required tables, constraints, storage buckets, and RLS policies.
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    "shortBio" TEXT,
    "fullBio" TEXT,
    "profileImage" TEXT,
    location TEXT,
    "availabilityStatus" TEXT DEFAULT 'available',
    email TEXT,
    "resumeUrl" TEXT,
    "resumeEnabled" BOOLEAN DEFAULT true,
    "heroHeading" TEXT,
    "heroSubheading" TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Projects Table
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

-- 4. Skill Categories Table
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "displayOrder" INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true
);

-- 5. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY,
    "categoryId" TEXT REFERENCES public.skill_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 80,
    "displayOrder" INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true
);

-- 6. Experiences Table
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

-- 7. Education Table
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

-- 8. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayOrder" INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true
);

-- 9. Contact Messages Table (Admin Read Only)
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

-- 10. Social Links Table
CREATE TABLE IF NOT EXISTS public.social_links (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT 'globe',
    "displayOrder" INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Anyone can read, only authenticated admin can mutate
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Admin can modify profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'authenticated');

-- 2. Projects: Public can only view published projects. Admin can view and mutate all.
CREATE POLICY "Public can view published projects" ON public.projects
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admin can view all projects" ON public.projects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert projects" ON public.projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update projects" ON public.projects
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete projects" ON public.projects
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Skills & Categories: Public can view visible entries, Admin has full access
CREATE POLICY "Public can view visible categories" ON public.skill_categories
    FOR SELECT USING (visible = true);
CREATE POLICY "Admin full access skill_categories" ON public.skill_categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view visible skills" ON public.skills
    FOR SELECT USING (visible = true);
CREATE POLICY "Admin full access skills" ON public.skills
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Experiences: Public can view published, Admin full access
CREATE POLICY "Public can view published experiences" ON public.experiences
    FOR SELECT USING (published = true);
CREATE POLICY "Admin full access experiences" ON public.experiences
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Education: Public can view published, Admin full access
CREATE POLICY "Public can view published education" ON public.education
    FOR SELECT USING (published = true);
CREATE POLICY "Admin full access education" ON public.education
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. Services: Public can view enabled, Admin full access
CREATE POLICY "Public can view enabled services" ON public.services
    FOR SELECT USING (enabled = true);
CREATE POLICY "Admin full access services" ON public.services
    FOR ALL USING (auth.role() = 'authenticated');

-- 7. Contact Messages: Public can INSERT only (submit message). ONLY authenticated admin can SELECT, UPDATE, DELETE!
CREATE POLICY "Anyone can submit a contact message" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read contact messages" ON public.contact_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can update contact messages" ON public.contact_messages
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete contact messages" ON public.contact_messages
    FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Social Links: Public can view visible, Admin full access
CREATE POLICY "Public can view visible social links" ON public.social_links
    FOR SELECT USING (visible = true);
CREATE POLICY "Admin full access social links" ON public.social_links
    FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION
-- ==============================================================================
-- In Supabase Storage, create a bucket named 'portfolio'.
-- Allow public download, and allow authenticated uploads:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public portfolio bucket read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Admin portfolio bucket upload access" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

CREATE POLICY "Admin portfolio bucket delete access" ON storage.objects
    FOR DELETE USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
