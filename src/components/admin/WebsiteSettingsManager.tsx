import React, { useState } from 'react';
import {
  Settings,
  Save,
  Database,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Server,
  Code2,
  Terminal,
} from 'lucide-react';
import { WebsiteSetting } from '../../types';
import { updateWebsiteSettings, getAuthorizedAdminEmail } from '../../lib/storage';
import {
  saveSupabaseConfig,
  getEffectiveSupabaseConfig,
  isSupabaseConfigured,
} from '../../lib/supabaseClient';
import {
  generateFullSchemaSql,
  generateRlsUpdateSql,
  generateSupabaseAuthUserSql,
} from '../../lib/sqlGenerator';

interface WebsiteSettingsManagerProps {
  settings: WebsiteSetting;
  onSaved: (msg: string) => void;
}

export const WebsiteSettingsManager: React.FC<WebsiteSettingsManagerProps> = ({ settings, onSaved }) => {
  const [form, setForm] = useState<WebsiteSetting>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'supabase'>('general');
  const [activeSqlTab, setActiveSqlTab] = useState<'full' | 'rls-only' | 'auth-user'>('full');
  const [copiedSql, setCopiedSql] = useState(false);
  const authorizedEmail = getAuthorizedAdminEmail();

  // Supabase dynamic config
  const effectiveConfig = getEffectiveSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(effectiveConfig.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(effectiveConfig.key || '');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const activeSqlCode =
    activeSqlTab === 'full'
      ? generateFullSchemaSql(authorizedEmail)
      : activeSqlTab === 'rls-only'
      ? generateRlsUpdateSql(authorizedEmail)
      : generateSupabaseAuthUserSql(authorizedEmail);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateWebsiteSettings(form);
    onSaved('General website settings and availability flags updated.');
  };

  const handleSaveSupabase = async () => {
    setIsTesting(true);
    setConnectionStatus(null);
    try {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      await updateWebsiteSettings({
        supabaseUrl,
        supabaseAnonKey,
        supabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
      });

      if (supabaseUrl && supabaseAnonKey) {
        setConnectionStatus('Credentials saved. Supabase client will connect upon reload.');
      } else {
        setConnectionStatus('Supabase configuration cleared. Reverted to local persistent storage.');
      }
      onSaved('Supabase configuration updated.');
    } catch {
      setConnectionStatus('Failed to update Supabase configuration.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(activeSqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            System & Database Infrastructure
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Global switches, maintenance state, and Supabase PostgreSQL linkage.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border border-neutral-200 p-0.5 bg-neutral-50 text-xs font-mono-code">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 uppercase ${activeTab === 'general' ? 'bg-black text-white font-semibold' : 'text-neutral-600 hover:text-black'}`}
          >
            General Controls
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 uppercase ${activeTab === 'supabase' ? 'bg-black text-white font-semibold' : 'text-neutral-600 hover:text-black'}`}
          >
            Database & Supabase
          </button>
        </div>
      </div>

      {activeTab === 'general' ? (
        <form onSubmit={handleSaveGeneral} className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
          
          {/* Maintenance Mode */}
          <div className="space-y-3 p-4 border border-neutral-200 bg-neutral-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-mono-code font-bold uppercase text-neutral-900">
                  Maintenance Mode Gate
                </span>
                <p className="text-xs text-neutral-500">
                  When enabled, all public visitors will see a clean structural update banner instead of the portfolio.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.maintenanceMode}
                  onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            {form.maintenanceMode && (
              <div className="pt-2 space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">
                  Visitor Maintenance Message
                </label>
                <textarea
                  rows={2}
                  value={form.maintenanceMessage}
                  onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white focus:outline-none focus:border-black"
                />
              </div>
            )}
          </div>

          {/* Form and CV availability toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-neutral-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.contactFormEnabled}
                  onChange={(e) => setForm({ ...form, contactFormEnabled: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-xs font-semibold text-neutral-900 font-mono-code">
                  Public Contact Form Active
                </span>
              </label>
              <p className="text-xs text-neutral-500">
                Allow visitors to transmit inquiries into the contact database.
              </p>
            </div>

            <div className="p-4 border border-neutral-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.resumeDownloadEnabled}
                  onChange={(e) => setForm({ ...form, resumeDownloadEnabled: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-xs font-semibold text-neutral-900 font-mono-code">
                  Résumé Download Button Active
                </span>
              </label>
              <p className="text-xs text-neutral-500">
                Display the CV download link on the header and about section.
              </p>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Configured Custom Domain
            </label>
            <input
              type="text"
              placeholder="alexandervance.io"
              value={form.customDomain || ''}
              onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
              className="w-full px-3.5 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
            />
            <p className="text-[11px] text-neutral-400">Used for canonical header generation and documentation.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Save General Settings
            </button>
          </div>
        </form>
      ) : (
        /* Supabase Database Settings Tab */
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 border border-neutral-200">
                  <Database className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-neutral-950">
                    Supabase PostgreSQL Connection Status
                  </h3>
                  <span className="text-xs font-mono-code text-neutral-500">
                    {configured ? 'Connected to Remote Cloud Database' : 'Active Local Persistent Storage'}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-mono-code uppercase px-3 py-1 font-semibold ${
                  configured ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                }`}
              >
                {configured ? '● Live Supabase' : '○ Standalone Local'}
              </span>
            </div>

            {/* Inputs for Supabase credentials */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">
                  Supabase Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">
                  Supabase Anonymous Public Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                />
              </div>

              {connectionStatus && (
                <div className="p-3 bg-neutral-100 border border-neutral-300 text-xs font-mono-code text-neutral-800">
                  {connectionStatus}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleSaveSupabase}
                  className="px-5 py-2.5 bg-black text-white text-xs uppercase font-mono-code font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isTesting ? 'Testing Connection...' : 'Save & Link Supabase'}
                </button>
                {configured && (
                  <button
                    type="button"
                    onClick={() => {
                      setSupabaseUrl('');
                      setSupabaseAnonKey('');
                      saveSupabaseConfig('', '');
                      setConnectionStatus('Reverted to Standalone Local Engine.');
                    }}
                    className="px-4 py-2.5 border border-neutral-300 text-xs uppercase font-mono-code text-neutral-700 hover:bg-neutral-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Copy PostgreSQL Schema Script with Dynamic Email Binding */}
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-black" />
                  <h4 className="font-display font-bold text-sm text-neutral-950">
                    PostgreSQL DDL Migration & RLS Security Script
                  </h4>
                </div>
                <p className="text-xs text-neutral-500">
                  Paste this into your Supabase Dashboard SQL Editor to bootstrap all tables, policies, and permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-mono-code flex items-center gap-1.5 hover:bg-black self-start sm:self-auto shrink-0 shadow-xs"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Dynamic SQL Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Dynamic Email Binding Indicator */}
            <div className="p-2.5 bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs font-mono-code">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-neutral-600">Configured for saved admin email:</span>
                <span className="font-bold text-neutral-900 bg-neutral-200 px-2 py-0.5">
                  {authorizedEmail}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 hidden sm:inline">
                (Edit email in Account & Security tab to update)
              </span>
            </div>

            {/* SQL Variant Switcher */}
            <div className="flex flex-wrap border border-neutral-200 p-0.5 bg-neutral-50 text-xs font-mono-code">
              <button
                type="button"
                onClick={() => setActiveSqlTab('full')}
                className={`px-3 py-1.5 uppercase font-medium ${
                  activeSqlTab === 'full' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
                }`}
              >
                1. Full PostgreSQL Schema & Policies
              </button>
              <button
                type="button"
                onClick={() => setActiveSqlTab('rls-only')}
                className={`px-3 py-1.5 uppercase font-medium ${
                  activeSqlTab === 'rls-only' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
                }`}
              >
                2. Email / RLS Update Only
              </button>
              <button
                type="button"
                onClick={() => setActiveSqlTab('auth-user')}
                className={`px-3 py-1.5 uppercase font-medium ${
                  activeSqlTab === 'auth-user' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
                }`}
              >
                3. Supabase Auth User Seed
              </button>
            </div>

            {/* Live SQL Preview Box */}
            <div className="relative">
              <div className="flex items-center justify-between bg-neutral-800 text-neutral-300 px-4 py-2 text-[11px] font-mono-code border-b border-neutral-700">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                  <span>
                    {activeSqlTab === 'full'
                      ? 'supabase_portfolio_schema.sql'
                      : activeSqlTab === 'rls-only'
                      ? 'update_admin_email_rls.sql'
                      : 'seed_supabase_auth_user.sql'}
                  </span>
                </div>
                <span className="text-neutral-400 text-[10px]">
                  Click Copy button above to paste
                </span>
              </div>

              <pre className="p-4 bg-neutral-900 text-neutral-200 text-xs font-mono-code overflow-x-auto max-h-72 leading-relaxed select-all">
                {activeSqlCode}
              </pre>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs font-mono-code text-neutral-700 space-y-2">
              <div className="font-semibold text-neutral-900">How to create your first Supabase administrator:</div>
              <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                <li>Log in to your Supabase project dashboard at supabase.com.</li>
                <li>Go to <strong>Authentication &gt; Users</strong>.</li>
                <li>Click <strong>Add User &gt; Create User</strong> and supply <code>{authorizedEmail}</code> and a password.</li>
                <li>Now sign in at <code>/admin/login</code> with that email and password!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
