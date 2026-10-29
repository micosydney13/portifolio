import React, { useState } from 'react';
import {
  Shield,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Mail,
  Copy,
  Check,
  Code2,
  Database,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import {
  getAdminSession,
  getAuthorizedAdminEmail,
  updateAuthorizedAdminEmail,
  updateAdminPassword,
} from '../../lib/storage';
import {
  generateFullSchemaSql,
  generateRlsUpdateSql,
  generateSupabaseAuthUserSql,
} from '../../lib/sqlGenerator';

interface AccountSecurityManagerProps {
  onSaved: (msg: string) => void;
}

export const AccountSecurityManager: React.FC<AccountSecurityManagerProps> = ({ onSaved }) => {
  const session = getAdminSession();
  const currentEmail = getAuthorizedAdminEmail();

  // Email state
  const [emailInput, setEmailInput] = useState(currentEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // SQL code generator state
  const [activeSqlTab, setActiveSqlTab] = useState<'full' | 'rls-only' | 'auth-user'>('full');
  const [copiedSql, setCopiedSql] = useState(false);

  const activeEmailForSql = emailInput.trim() || currentEmail;

  const currentSqlCode =
    activeSqlTab === 'full'
      ? generateFullSchemaSql(activeEmailForSql)
      : activeSqlTab === 'rls-only'
      ? generateRlsUpdateSql(activeEmailForSql)
      : generateSupabaseAuthUserSql(activeEmailForSql);

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);
    const trimmed = emailInput.trim().toLowerCase();

    if (!trimmed || !trimmed.includes('@')) {
      setEmailMsg('Please enter a valid email address.');
      return;
    }

    updateAuthorizedAdminEmail(trimmed);
    setIsEditingEmail(false);
    onSaved(`Authorized administrator email successfully updated to: ${trimmed}`);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    updateAdminPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    onSaved('Local administrator password successfully updated.');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(currentSqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <h2 className="text-xl font-display font-bold text-neutral-950">
          Administrator Account & Security Controls
        </h2>
        <p className="text-xs font-mono-code text-neutral-500 mt-1">
          Manage authorized administrator email, session security, password credentials, and dynamic database SQL policies.
        </p>
      </div>

      {/* Active Session Info with Dynamic Email Configuration */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-black" />
            <h3 className="font-display font-bold text-sm text-neutral-950">
              Active Administrator Session & Clearance
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-black text-white text-[10px] uppercase font-mono-code font-bold">
            Root Administrator
          </span>
        </div>

        {/* Dynamic Email Editor */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-neutral-500 uppercase text-[10px] font-mono-code tracking-wider block">
                Primary Authorized Email
              </span>
              <span className="font-mono-code font-bold text-base text-neutral-950">
                {currentEmail}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingEmail(!isEditingEmail)}
              className="px-3.5 py-1.5 bg-white border border-neutral-300 text-xs font-mono-code hover:bg-neutral-100 transition-colors self-start sm:self-auto"
            >
              {isEditingEmail ? 'Cancel' : 'Change Email'}
            </button>
          </div>

          {isEditingEmail && (
            <form onSubmit={handleSaveEmail} className="pt-3 border-t border-neutral-200 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">
                  New Authorized Administrator Email
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@portfolio.io"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 font-mono-code focus:outline-none focus:border-black bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-black text-white text-xs uppercase font-mono-code font-semibold hover:bg-neutral-800 shrink-0"
                  >
                    Save & Update Dynamic SQL
                  </button>
                </div>
                {emailMsg && <p className="text-xs text-neutral-900 font-mono-code">{emailMsg}</p>}
                <p className="text-[11px] text-neutral-500 font-mono-code">
                  Updating this automatically regenerates all SQL migration scripts, RLS policies, and admin tokens to match your email.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Session Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-code pt-1">
          <div>
            <span className="text-neutral-400 uppercase text-[10px] block">Session Token ID</span>
            <span className="text-neutral-600 truncate block">
              {session?.token ? session.token.slice(0, 24) + '...' : 'active-token'}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 uppercase text-[10px] block">Login Timestamp</span>
            <span className="text-neutral-600">
              {session?.loggedInAt ? new Date(session.loggedInAt).toLocaleString() : 'Current Session'}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 uppercase text-[10px] block">Database Row Clearance</span>
            <span className="text-neutral-800 font-semibold">
              auth.jwt() -&gt;&gt; 'email'
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic SQL Codes to Paste (Directly requested by user) */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-black" />
              <h3 className="font-display font-bold text-base text-neutral-950">
                Dynamic SQL Migration & Security Policies
              </h3>
            </div>
            <p className="text-xs text-neutral-500">
              Copy and paste directly into your <strong>Supabase SQL Editor</strong> or <strong>PostgreSQL</strong> console.
            </p>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={handleCopySql}
            className="px-4 py-2 bg-black text-white text-xs font-mono-code flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            {copiedSql ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied SQL to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Dynamic SQL Code</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Email Binding Indicator */}
        <div className="p-3 bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-code">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-neutral-600">SQL is dynamically configured for email:</span>
            <span className="font-bold text-neutral-950 bg-neutral-200 px-2 py-0.5">
              {activeEmailForSql}
            </span>
          </div>

          <span className="text-[11px] text-neutral-400">
            Re-evaluates in real-time when email changes
          </span>
        </div>

        {/* Tabs for SQL Variants */}
        <div className="flex flex-wrap border border-neutral-200 p-0.5 bg-neutral-50 text-xs font-mono-code">
          <button
            type="button"
            onClick={() => setActiveSqlTab('full')}
            className={`px-3 py-1.5 uppercase font-medium ${
              activeSqlTab === 'full' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
            }`}
          >
            1. Complete PostgreSQL DDL & Policies
          </button>
          <button
            type="button"
            onClick={() => setActiveSqlTab('rls-only')}
            className={`px-3 py-1.5 uppercase font-medium ${
              activeSqlTab === 'rls-only' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
            }`}
          >
            2. Update Email / RLS Only
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

        {/* SQL Code Preview Container */}
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
              Ready to Paste in SQL Editor
            </span>
          </div>

          <pre className="p-4 bg-neutral-900 text-neutral-200 text-xs font-mono-code overflow-x-auto max-h-96 leading-relaxed select-all">
            {currentSqlCode}
          </pre>
        </div>

        {/* Quick Execution Walkthrough */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-2 text-xs font-mono-code">
          <div className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
            How to Apply in Supabase:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-neutral-700">
            <li>Open your project at <strong>supabase.com</strong>.</li>
            <li>In the left sidebar, click <strong>SQL Editor</strong>.</li>
            <li>Click <strong>+ New Query</strong>, paste the code above, and click <strong>Run</strong> (or press Ctrl+Enter).</li>
            <li>Your tables, Row Level Security, and admin policies for <code>{activeEmailForSql}</code> are instantly active!</li>
          </ol>
        </div>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handleUpdatePassword} className="bg-white border border-neutral-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
          <Key className="w-5 h-5 text-black" />
          <h3 className="font-display font-bold text-sm text-neutral-950">
            Update Administrator Access Password
          </h3>
        </div>

        {errorMsg && (
          <div className="p-3 bg-neutral-100 border border-neutral-300 text-xs text-neutral-900 flex items-center gap-2 font-mono-code">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono-code uppercase text-neutral-700">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-mono-code"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono-code uppercase text-neutral-700">Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-mono-code"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-black text-white text-xs uppercase font-mono-code font-semibold hover:bg-neutral-800"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* Security Architecture Audit Checklist */}
      <div className="bg-white border border-neutral-200 p-6 space-y-4 shadow-xs">
        <h3 className="font-display font-bold text-sm text-neutral-950 border-b border-neutral-100 pb-3">
          Security Posture & Isolation Audit
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900 font-mono-code">Dynamic RLS Email Clearance:</span>
              <p className="text-neutral-500">
                Database policies check <code>public.is_admin()</code> which verifies <code>auth.jwt() -&gt;&gt; 'email' = '{currentEmail}'</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900 font-mono-code">Zero Secret Leakage:</span>
              <p className="text-neutral-500">Supabase service-role keys are never included in client bundle code. Only anon keys are used.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900 font-mono-code">Draft Content Isolation:</span>
              <p className="text-neutral-500">Projects with status='draft' are filtered at query-time and shielded by Supabase RLS policies.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900 font-mono-code">Enquiry Protection:</span>
              <p className="text-neutral-500">Public visitors can only write to contact_messages. Only authorized administrator can read or delete.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
