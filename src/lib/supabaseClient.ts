import { createClient, SupabaseClient } from '@supabase/supabase-js';

const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Stored overrides in localStorage if configured via Admin UI
const getStoredConfig = () => {
  try {
    const storedUrl = localStorage.getItem('applet_supabase_url');
    const storedKey = localStorage.getItem('applet_supabase_anon_key');
    return {
      url: storedUrl || ENV_SUPABASE_URL,
      key: storedKey || ENV_SUPABASE_ANON_KEY,
    };
  } catch {
    return { url: ENV_SUPABASE_URL, key: ENV_SUPABASE_ANON_KEY };
  }
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredConfig();

  if (!url || !key || !url.startsWith('http') || key.length < 20) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getStoredConfig();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url) localStorage.setItem('applet_supabase_url', url.trim());
  else localStorage.removeItem('applet_supabase_url');

  if (key) localStorage.setItem('applet_supabase_anon_key', key.trim());
  else localStorage.removeItem('applet_supabase_anon_key');

  cachedClient = null;
}

export function getEffectiveSupabaseConfig() {
  return getStoredConfig();
}
