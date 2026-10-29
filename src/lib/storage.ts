import {
  AppDatabase,
  Profile,
  Project,
  SkillCategory,
  Skill,
  Experience,
  Education,
  Service,
  ContactMessage,
  SocialLink,
  SectionSetting,
  BrandingSetting,
  SeoSetting,
  WebsiteSetting,
} from '../types';
import { initialDatabase } from './defaultData';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const DB_STORAGE_KEY = 'aethelgard_portfolio_database_v3';
const EVENT_NAME = 'aethelgard_data_change';

function sanitizeDatabase(data: any): AppDatabase {
  try {
    let json = JSON.stringify(data);
    if (json.includes('Alexander Vance') || json.includes('Sydney Mico')) {
      json = json
        .replaceAll('Alexander Vance — Software Architect & Interface Engineer', 'Mico Sydney — Full Stack Software Developer')
        .replaceAll('Alexander Vance — Portfolio & Engineering Archive', 'Mico Sydney — Full Stack Software Developer')
        .replaceAll('Alexander Vance', 'Mico Sydney')
        .replaceAll('Sydney Mico', 'Mico Sydney')
        .replaceAll('alexander.vance@studio-vance.io', 'MicoSydney13@gmail.com');
      return JSON.parse(json);
    }
  } catch (e) {
    console.error('Failed to sanitize database:', e);
  }
  return data;
}

// Initialize or read localStorage
function getLocalDB(): AppDatabase {
  try {
    // Clean legacy storage versions if lingering
    ['aethelgard_portfolio_database_v2', 'aethelgard_portfolio_database'].forEach((oldKey) => {
      try {
        const oldRaw = localStorage.getItem(oldKey);
        if (oldRaw && (oldRaw.includes('Alexander Vance') || oldRaw.includes('Sydney Mico'))) {
          localStorage.removeItem(oldKey);
        }
      } catch {
        // ignore
      }
    });

    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialDatabase));
      return initialDatabase;
    }
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeDatabase(parsed);
    const merged: AppDatabase = {
      ...initialDatabase,
      ...sanitized,
      profile: { ...initialDatabase.profile, ...(sanitized.profile || {}) },
      branding: { ...initialDatabase.branding, ...(sanitized.branding || {}) },
      seo: { ...initialDatabase.seo, ...(sanitized.seo || {}) },
      settings: { ...initialDatabase.settings, ...(sanitized.settings || {}) },
    };

    if (JSON.stringify(parsed) !== JSON.stringify(merged)) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch (err) {
    console.error('Failed to parse local database:', err);
    return initialDatabase;
  }
}

function saveLocalDB(data: AppDatabase) {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (err) {
    console.error('Failed to save to local database:', err);
  }
}

export function subscribeToDataChanges(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

// ---------------- PROFILE ----------------
export async function getProfile(): Promise<Profile> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
      if (!error && data) return data as Profile;
    } catch {
      // fallback to local
    }
  }
  return getLocalDB().profile;
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  const supabase = getSupabaseClient();
  const current = getLocalDB().profile;
  const updated: Profile = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from('profiles').upsert(updated);
    } catch (err) {
      console.warn('Supabase updateProfile failed, falling back to local:', err);
    }
  }

  const db = getLocalDB();
  db.profile = updated;
  saveLocalDB(db);
  return updated;
}

// ---------------- PROJECTS ----------------
export async function getProjects(includeDrafts = false): Promise<Project[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('projects').select('*').order('displayOrder', { ascending: true });
      if (!includeDrafts) {
        query = query.eq('status', 'published');
      }
      const { data, error } = await query;
      if (!error && data) return data as Project[];
    } catch {
      // fallback
    }
  }

  const db = getLocalDB();
  const list = db.projects || [];
  const filtered = includeDrafts ? list : list.filter((p) => p.status === 'published');
  return [...filtered].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export async function getProjectById(id: string): Promise<Project | null> {
  const all = await getProjects(true);
  return all.find((p) => p.id === id) || null;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getProjects(true);
  return all.find((p) => p.slug === slug) || null;
}

export async function saveProject(project: Partial<Project> & { id?: string }): Promise<Project> {
  const db = getLocalDB();
  const id = project.id || `proj-${Date.now()}`;
  const now = new Date().toISOString();

  const existingIndex = db.projects.findIndex((p) => p.id === id);
  const fullProject: Project = {
    id,
    title: project.title || 'Untitled Project',
    slug: project.slug || (project.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    shortDescription: project.shortDescription || '',
    fullDescription: project.fullDescription || '',
    coverImage: project.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    additionalImages: project.additionalImages || [],
    technologies: project.technologies || [],
    category: project.category || 'General',
    date: project.date || new Date().getFullYear().toString(),
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    featured: Boolean(project.featured),
    displayOrder: typeof project.displayOrder === 'number' ? project.displayOrder : db.projects.length + 1,
    status: project.status || 'published',
    created_at: existingIndex >= 0 ? db.projects[existingIndex].created_at : now,
    updated_at: now,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('projects').upsert(fullProject);
    } catch (err) {
      console.warn('Supabase saveProject error:', err);
    }
  }

  if (existingIndex >= 0) {
    db.projects[existingIndex] = fullProject;
  } else {
    db.projects.push(fullProject);
  }
  saveLocalDB(db);
  return fullProject;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteProject error:', err);
    }
  }

  const db = getLocalDB();
  db.projects = db.projects.filter((p) => p.id !== id);
  saveLocalDB(db);
}

export async function reorderProjects(ids: string[]): Promise<void> {
  const db = getLocalDB();
  const idMap = new Map(ids.map((id, index) => [id, index + 1]));
  db.projects = db.projects.map((p) => {
    if (idMap.has(p.id)) {
      return { ...p, displayOrder: idMap.get(p.id)! };
    }
    return p;
  });
  saveLocalDB(db);
}

// ---------------- SKILLS ----------------
export async function getSkillCategories(): Promise<SkillCategory[]> {
  const db = getLocalDB();
  return [...db.skillCategories].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveSkillCategory(category: Partial<SkillCategory> & { id?: string }): Promise<SkillCategory> {
  const db = getLocalDB();
  const id = category.id || `cat-${Date.now()}`;
  const existingIdx = db.skillCategories.findIndex((c) => c.id === id);
  const full: SkillCategory = {
    id,
    name: category.name || 'New Category',
    displayOrder: typeof category.displayOrder === 'number' ? category.displayOrder : db.skillCategories.length + 1,
    visible: category.visible !== false,
  };
  if (existingIdx >= 0) {
    db.skillCategories[existingIdx] = full;
  } else {
    db.skillCategories.push(full);
  }
  saveLocalDB(db);
  return full;
}

export async function deleteSkillCategory(id: string): Promise<void> {
  const db = getLocalDB();
  db.skillCategories = db.skillCategories.filter((c) => c.id !== id);
  db.skills = db.skills.filter((s) => s.categoryId !== id);
  saveLocalDB(db);
}

export async function getSkills(): Promise<Skill[]> {
  const db = getLocalDB();
  return [...db.skills].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveSkill(skill: Partial<Skill> & { id?: string }): Promise<Skill> {
  const db = getLocalDB();
  const id = skill.id || `sk-${Date.now()}`;
  const existingIdx = db.skills.findIndex((s) => s.id === id);
  const full: Skill = {
    id,
    categoryId: skill.categoryId || db.skillCategories[0]?.id || 'cat-1',
    name: skill.name || 'New Skill',
    level: typeof skill.level === 'number' ? skill.level : 85,
    displayOrder: typeof skill.displayOrder === 'number' ? skill.displayOrder : db.skills.length + 1,
    visible: skill.visible !== false,
  };
  if (existingIdx >= 0) {
    db.skills[existingIdx] = full;
  } else {
    db.skills.push(full);
  }
  saveLocalDB(db);
  return full;
}

export async function deleteSkill(id: string): Promise<void> {
  const db = getLocalDB();
  db.skills = db.skills.filter((s) => s.id !== id);
  saveLocalDB(db);
}

// ---------------- EXPERIENCES ----------------
export async function getExperiences(onlyPublished = false): Promise<Experience[]> {
  const db = getLocalDB();
  const list = onlyPublished ? db.experiences.filter((e) => e.published) : db.experiences;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveExperience(exp: Partial<Experience> & { id?: string }): Promise<Experience> {
  const db = getLocalDB();
  const id = exp.id || `exp-${Date.now()}`;
  const existingIdx = db.experiences.findIndex((e) => e.id === id);
  const full: Experience = {
    id,
    role: exp.role || '',
    company: exp.company || '',
    location: exp.location || '',
    period: exp.period || '',
    current: Boolean(exp.current),
    description: exp.description || '',
    bulletPoints: exp.bulletPoints || [],
    displayOrder: typeof exp.displayOrder === 'number' ? exp.displayOrder : db.experiences.length + 1,
    published: exp.published !== false,
  };
  if (existingIdx >= 0) db.experiences[existingIdx] = full;
  else db.experiences.push(full);
  saveLocalDB(db);
  return full;
}

export async function deleteExperience(id: string): Promise<void> {
  const db = getLocalDB();
  db.experiences = db.experiences.filter((e) => e.id !== id);
  saveLocalDB(db);
}

// ---------------- EDUCATION ----------------
export async function getEducation(onlyPublished = false): Promise<Education[]> {
  const db = getLocalDB();
  const list = onlyPublished ? db.education.filter((e) => e.published) : db.education;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveEducation(edu: Partial<Education> & { id?: string }): Promise<Education> {
  const db = getLocalDB();
  const id = edu.id || `edu-${Date.now()}`;
  const existingIdx = db.education.findIndex((e) => e.id === id);
  const full: Education = {
    id,
    degree: edu.degree || '',
    institution: edu.institution || '',
    location: edu.location || '',
    year: edu.year || '',
    description: edu.description || '',
    credentialUrl: edu.credentialUrl,
    displayOrder: typeof edu.displayOrder === 'number' ? edu.displayOrder : db.education.length + 1,
    published: edu.published !== false,
  };
  if (existingIdx >= 0) db.education[existingIdx] = full;
  else db.education.push(full);
  saveLocalDB(db);
  return full;
}

export async function deleteEducation(id: string): Promise<void> {
  const db = getLocalDB();
  db.education = db.education.filter((e) => e.id !== id);
  saveLocalDB(db);
}

// ---------------- SERVICES ----------------
export async function getServices(onlyEnabled = false): Promise<Service[]> {
  const db = getLocalDB();
  const list = onlyEnabled ? db.services.filter((s) => s.enabled) : db.services;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveService(srv: Partial<Service> & { id?: string }): Promise<Service> {
  const db = getLocalDB();
  const id = srv.id || `srv-${Date.now()}`;
  const existingIdx = db.services.findIndex((s) => s.id === id);
  const full: Service = {
    id,
    title: srv.title || '',
    description: srv.description || '',
    features: srv.features || [],
    displayOrder: typeof srv.displayOrder === 'number' ? srv.displayOrder : db.services.length + 1,
    enabled: srv.enabled !== false,
  };
  if (existingIdx >= 0) db.services[existingIdx] = full;
  else db.services.push(full);
  saveLocalDB(db);
  return full;
}

export async function deleteService(id: string): Promise<void> {
  const db = getLocalDB();
  db.services = db.services.filter((s) => s.id !== id);
  saveLocalDB(db);
}

// ---------------- CONTACT MESSAGES ----------------
export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as ContactMessage[];
    } catch {
      // fallback
    }
  }

  const db = getLocalDB();
  return [...db.contactMessages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function saveContactMessage(msg: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  const id = `msg-${Date.now()}`;
  const now = new Date().toISOString();

  const cleanMsg: ContactMessage = {
    id,
    name: msg.name.trim(),
    email: msg.email.trim(),
    subject: msg.subject.trim(),
    message: msg.message.trim(),
    read: false,
    archived: false,
    created_at: now,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('contact_messages').insert(cleanMsg);
    } catch (err) {
      console.warn('Supabase saveContactMessage error:', err);
    }
  }

  const db = getLocalDB();
  db.contactMessages.unshift(cleanMsg);
  saveLocalDB(db);
  return cleanMsg;
}

export async function markMessageRead(id: string, read = true): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('contact_messages').update({ read }).eq('id', id);
    } catch {
      // fallback
    }
  }
  const db = getLocalDB();
  const target = db.contactMessages.find((m) => m.id === id);
  if (target) {
    target.read = read;
    saveLocalDB(db);
  }
}

export async function archiveMessage(id: string, archived = true): Promise<void> {
  const db = getLocalDB();
  const target = db.contactMessages.find((m) => m.id === id);
  if (target) {
    target.archived = archived;
    saveLocalDB(db);
  }
}

export async function deleteMessage(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('contact_messages').delete().eq('id', id);
    } catch {
      // fallback
    }
  }
  const db = getLocalDB();
  db.contactMessages = db.contactMessages.filter((m) => m.id !== id);
  saveLocalDB(db);
}

// ---------------- SOCIAL LINKS ----------------
export async function getSocialLinks(onlyVisible = false): Promise<SocialLink[]> {
  const db = getLocalDB();
  const list = onlyVisible ? db.socialLinks.filter((s) => s.visible) : db.socialLinks;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveSocialLink(link: Partial<SocialLink> & { id?: string }): Promise<SocialLink> {
  const db = getLocalDB();
  const id = link.id || `soc-${Date.now()}`;
  const existingIdx = db.socialLinks.findIndex((s) => s.id === id);
  const full: SocialLink = {
    id,
    platform: link.platform || 'Link',
    label: link.label || '',
    url: link.url || 'https://',
    icon: link.icon || 'globe',
    displayOrder: typeof link.displayOrder === 'number' ? link.displayOrder : db.socialLinks.length + 1,
    visible: link.visible !== false,
  };
  if (existingIdx >= 0) db.socialLinks[existingIdx] = full;
  else db.socialLinks.push(full);
  saveLocalDB(db);
  return full;
}

export async function deleteSocialLink(id: string): Promise<void> {
  const db = getLocalDB();
  db.socialLinks = db.socialLinks.filter((s) => s.id !== id);
  saveLocalDB(db);
}

// ---------------- SECTION SETTINGS ----------------
export async function getSectionSettings(): Promise<SectionSetting[]> {
  const db = getLocalDB();
  return [...db.sectionSettings].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function updateSectionSettings(settings: SectionSetting[]): Promise<void> {
  const db = getLocalDB();
  db.sectionSettings = settings;
  saveLocalDB(db);
}

// ---------------- BRANDING & APPEARANCE ----------------
export async function getBranding(): Promise<BrandingSetting> {
  return getLocalDB().branding;
}

export async function updateBranding(updates: Partial<BrandingSetting>): Promise<BrandingSetting> {
  const db = getLocalDB();
  db.branding = { ...db.branding, ...updates };
  saveLocalDB(db);
  return db.branding;
}

// ---------------- SEO ----------------
export async function getSeo(): Promise<SeoSetting> {
  return getLocalDB().seo;
}

export async function updateSeo(updates: Partial<SeoSetting>): Promise<SeoSetting> {
  const db = getLocalDB();
  db.seo = { ...db.seo, ...updates };
  saveLocalDB(db);
  return db.seo;
}

// ---------------- WEBSITE SETTINGS ----------------
export async function getWebsiteSettings(): Promise<WebsiteSetting> {
  const db = getLocalDB();
  return {
    ...db.settings,
    supabaseConfigured: isSupabaseConfigured(),
  };
}

export async function updateWebsiteSettings(updates: Partial<WebsiteSetting>): Promise<WebsiteSetting> {
  const db = getLocalDB();
  db.settings = { ...db.settings, ...updates };
  saveLocalDB(db);
  return db.settings;
}

// ---------------- IMAGE UPLOAD & OPTIMIZATION ----------------
export async function uploadImage(file: File): Promise<string> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!uploadError) {
        const { data: publicData } = supabase.storage.from('portfolio').getPublicUrl(filePath);
        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload error, falling back to base64:', err);
    }
  }

  // Fallback: compress client-side and return as high-quality Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ---------------- AUTHENTICATION ----------------
const ADMIN_SESSION_KEY = 'aethelgard_admin_session';
const ADMIN_PASSWORD_KEY = 'aethelgard_admin_secret_pwd';
const ADMIN_AUTHORIZED_EMAIL_KEY = 'aethelgard_authorized_email';
const DEFAULT_ADMIN_EMAIL = 'MicoSydney13@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'admin';

export interface AdminSession {
  email: string;
  token: string;
  loggedInAt: string;
}

export function getAuthorizedAdminEmail(): string {
  try {
    const saved = localStorage.getItem(ADMIN_AUTHORIZED_EMAIL_KEY);
    if (saved && saved.trim()) return saved.trim();
    const session = getAdminSession();
    if (session?.email) return session.email;
    const db = getLocalDB();
    if (db?.profile?.email) return db.profile.email;
  } catch {
    // fallback
  }
  return DEFAULT_ADMIN_EMAIL;
}

export function updateAuthorizedAdminEmail(newEmail: string): void {
  const trimmed = newEmail.trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@')) return;

  try {
    localStorage.setItem(ADMIN_AUTHORIZED_EMAIL_KEY, trimmed);

    // Update current active session
    const session = getAdminSession();
    if (session) {
      session.email = trimmed;
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    }

    // Update profile email as well
    const db = getLocalDB();
    if (db && db.profile) {
      db.profile.email = trimmed;
      saveLocalDB(db);
    } else {
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }
  } catch (err) {
    console.error('Failed to update authorized admin email:', err);
  }
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export interface LoginResult {
  success: boolean;
  error?: string;
  requirePasswordReset?: boolean;
  email?: string;
}

export function finalizeAdminLogin(email: string): AdminSession {
  const authorizedEmail = getAuthorizedAdminEmail();
  const targetEmail = email.includes('@') ? email.toLowerCase() : authorizedEmail;
  const session: AdminSession = {
    email: targetEmail,
    token: `local-token-${Date.now()}`,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(ADMIN_AUTHORIZED_EMAIL_KEY, targetEmail);
  return session;
}

export async function loginAdmin(email: string, password: string): Promise<LoginResult> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.session) {
        const session: AdminSession = {
          email: data.user.email || email,
          token: data.session.access_token,
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(ADMIN_AUTHORIZED_EMAIL_KEY, session.email);
        return { success: true, requirePasswordReset: false, email: session.email };
      }
    } catch {
      // fallback
    }
  }

  // Local authentication check
  const customPwd = localStorage.getItem(ADMIN_PASSWORD_KEY);
  const authorizedEmail = getAuthorizedAdminEmail();

  const isEmailMatch =
    email.toLowerCase() === authorizedEmail.toLowerCase() ||
    email.toLowerCase() === DEFAULT_ADMIN_EMAIL ||
    email.toLowerCase() === 'admin' ||
    email.includes('@');

  if (!isEmailMatch) {
    return { success: false, error: 'Invalid administrator identifier or email address.' };
  }

  const hasCustomPassword = Boolean(customPwd && customPwd !== 'admin' && customPwd !== 'admin123');

  if (hasCustomPassword) {
    // Custom password is active: strict match against custom password
    if (password === customPwd) {
      finalizeAdminLogin(email);
      return { success: true, requirePasswordReset: false, email: authorizedEmail };
    }
    return { success: false, error: 'Incorrect administrator password.' };
  }

  // Default credentials: check against default admin password
  const isDefaultPassword = password === 'admin' || password === 'admin123';
  if (isDefaultPassword) {
    // Flag that user must change password immediately before accessing the dashboard
    return {
      success: true,
      requirePasswordReset: true,
      email: email.includes('@') ? email.toLowerCase() : authorizedEmail,
    };
  }

  return { success: false, error: 'Incorrect administrator password.' };
}

export async function logoutAdmin(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.href = '/admin/login';
}

export function updateAdminPassword(newPassword: string): void {
  if (newPassword && newPassword.length >= 4) {
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
  }
}


