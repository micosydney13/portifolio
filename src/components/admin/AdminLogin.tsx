import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react';
import { loginAdmin, getAuthorizedAdminEmail, updateAdminPassword, finalizeAdminLogin } from '../../lib/storage';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const configuredEmail = getAuthorizedAdminEmail();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forced password reset state
  const [step, setStep] = useState<'login' | 'force_reset'>('login');
  const [authenticatedEmail, setAuthenticatedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email address and administrator password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await loginAdmin(email, password);
      if (res.success) {
        if (res.requirePasswordReset) {
          // Default credentials detected: force password change immediately
          setAuthenticatedEmail(res.email || email.trim());
          setStep('force_reset');
        } else {
          navigate('/admin');
        }
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('Network or server error during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (trimmedNew.length < 4) {
      setResetError('New password must contain at least 4 characters.');
      return;
    }

    if (trimmedNew.toLowerCase() === 'admin' || trimmedNew.toLowerCase() === 'admin123') {
      setResetError('You cannot reuse the default password. Please choose a secure custom password.');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setResetError('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      // Save the new password for future logins
      updateAdminPassword(trimmedNew);
      // Finalize session
      finalizeAdminLogin(authenticatedEmail || configuredEmail);
      // Navigate to admin
      navigate('/admin');
    } catch {
      setResetError('Failed to record new password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 selection:bg-black selection:text-white">
      {/* Background Architectural Grid Lines */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        
        {/* Brand Monogram */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 bg-black text-white items-center justify-center font-display font-bold text-lg tracking-widest mx-auto">
            MS
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-950 tracking-tight">
            Administrator Gateway
          </h1>
          <p className="text-xs font-mono-code text-neutral-500 uppercase tracking-widest">
            Aethelgard Core CMS // Restricted Access
          </p>
        </div>

        {/* Content Box */}
        <div className="border border-neutral-300 p-8 sm:p-10 bg-white shadow-xl space-y-6">
          {step === 'login' ? (
            <>
              {errorMessage && (
                <div className="p-3.5 bg-neutral-100 border border-neutral-300 flex items-start gap-2.5 text-xs text-neutral-800">
                  <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    Administrator Identifier
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder={configuredEmail}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black font-mono-code transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                      Access Key / Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black font-mono-code transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Forced New Password Setup Screen */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 bg-neutral-100 border border-neutral-300 space-y-2">
                <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase font-mono-code">
                  <ShieldAlert className="w-4 h-4 text-black shrink-0" />
                  <span>Mandatory Security Update</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Default credentials detected. Set and confirm a new administrator password before continuing. This password will be required for all future logins.
                </p>
              </div>

              {resetError && (
                <div className="p-3.5 bg-neutral-100 border border-neutral-300 flex items-start gap-2.5 text-xs text-neutral-800">
                  <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleForceResetSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    New Administrator Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new secure password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black font-mono-code transition-colors"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black font-mono-code transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Confirm Password & Enter CMS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Return to Public Site */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs font-mono-code text-neutral-500 hover:text-black transition-colors underline"
          >
            ← Return to Public Portfolio
          </a>
        </div>

      </div>
    </div>
  );
};
