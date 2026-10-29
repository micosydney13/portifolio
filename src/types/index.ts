export interface Profile {
  id?: string;
  name: string;
  title: string;
  shortBio: string;
  fullBio: string;
  profileImage: string;
  location: string;
  availabilityStatus: 'available' | 'busy' | 'selective' | 'not-available';
  email: string;
  resumeUrl: string;
  resumeEnabled: boolean;
  heroHeading: string;
  heroSubheading: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  additionalImages: string[];
  technologies: string[];
  category: string;
  date: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  displayOrder: number;
  status: 'published' | 'draft';
  created_at?: string;
  updated_at?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  displayOrder: number;
  visible: boolean;
}

export interface Skill {
  id: string;
  categoryId: string;
  name: string;
  level: number;
  displayOrder: number;
  visible: boolean;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  current: boolean;
  description: string;
  bulletPoints: string[];
  displayOrder: number;
  published: boolean;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  description?: string;
  credentialUrl?: string;
  displayOrder: number;
  published: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  displayOrder: number;
  enabled: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  archived: boolean;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  displayOrder: number;
  visible: boolean;
}

export interface SectionSetting {
  id: string;
  sectionKey: 'hero' | 'about' | 'projects' | 'skills' | 'experience' | 'education' | 'services' | 'contact';
  label: string;
  enabled: boolean;
  displayOrder: number;
}

export interface BrandingSetting {
  monogram: string;
  logoUrl?: string;
  siteTitle: string;
  tagline: string;
  typography: 'jakarta' | 'space' | 'mono' | 'classic';
  themeContrast: 'pure' | 'soft';
  footerText: string;
}

export type AppearanceSetting = BrandingSetting;

export interface SeoSetting {
  pageTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
}

export interface WebsiteSetting {
  contactFormEnabled: boolean;
  resumeDownloadEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  customDomain: string;
  supabaseConfigured: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface AppDatabase {
  profile: Profile;
  projects: Project[];
  skillCategories: SkillCategory[];
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
  services: Service[];
  contactMessages: ContactMessage[];
  socialLinks: SocialLink[];
  sectionSettings: SectionSetting[];
  branding: BrandingSetting;
  seo: SeoSetting;
  settings: WebsiteSetting;
}
