import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Profile, SocialLink, WebsiteSetting } from '../../types';
import { saveContactMessage } from '../../lib/storage';

interface ContactSectionProps {
  profile: Profile;
  socialLinks: SocialLink[];
  settings: WebsiteSetting;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile, socialLinks, settings }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    // Honeypot field for bot protection (should stay empty)
    honeypot: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Please provide your name or organization.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject line is required.';
    if (!formData.message.trim()) {
      errs.message = 'Please enter your message or proposal.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Bot detection check: if honeypot is populated, silently pretend success
    if (formData.honeypot) {
      setSubmittedSuccess(true);
      return;
    }

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await saveContactMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      setSubmittedSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
      setErrors({});
    } catch (err) {
      console.error('Failed to submit message:', err);
      setSubmitError('Unable to send your inquiry at this moment. Please email directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleSocials = socialLinks.filter((s) => s.visible);

  return (
    <section id="contact" className="py-24 md:py-32 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Direct Info & Social Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 tracking-tight">
                Get In Touch
              </h2>
              <div className="w-12 h-0.5 bg-black" />
              <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
                Available for full-time software developer opportunities, contract engineering projects, and technical collaborations.
              </p>
            </div>

            {/* Direct Email Card */}
            <div className="p-6 border border-neutral-200 bg-neutral-50/60 space-y-2">
              <span className="text-[11px] font-mono-code uppercase text-neutral-400 tracking-wider">
                Direct Electronic Mail
              </span>
              <a
                href={`mailto:${profile.email}`}
                className="text-base sm:text-lg font-mono-code font-medium text-neutral-950 hover:underline block break-all"
              >
                {profile.email}
              </a>
              <p className="text-xs text-neutral-500 pt-1">
                Typical reply turnaround is within 24 to 48 hours.
              </p>
            </div>

            {/* Social Network Channels */}
            {visibleSocials.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono-code uppercase text-neutral-400 tracking-wider block">
                  Public Networks & Profiles
                </span>
                <div className="space-y-2">
                  {visibleSocials.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 border border-neutral-200 hover:border-black bg-white transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-code font-medium text-neutral-800">
                          {link.platform}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono-code">
                          {link.label}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-neutral-200 p-8 sm:p-10 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h3 className="font-display font-semibold text-lg text-neutral-950">
                  Transmit Secure Message
                </h3>
                <span className="flex items-center gap-1 text-[11px] font-mono-code text-neutral-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                  Encrypted Ingestion
                </span>
              </div>

              {!settings.contactFormEnabled ? (
                <div className="p-6 bg-neutral-50 border border-neutral-200 text-center space-y-2">
                  <p className="text-sm font-medium text-neutral-900">
                    The online inquiry form is temporarily paused.
                  </p>
                  <p className="text-xs text-neutral-600">
                    Please email directly at{' '}
                    <a href={`mailto:${profile.email}`} className="font-mono-code underline font-semibold">
                      {profile.email}
                    </a>
                  </p>
                </div>
              ) : submittedSuccess ? (
                <div className="p-8 border border-neutral-300 bg-neutral-50 space-y-4 animate-in fade-in">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-display font-semibold text-neutral-950">
                    Inquiry Received Successfully
                  </h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Thank you for reaching out. Your message has been encrypted and stored in the database. I will review it shortly.
                  </p>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="mt-2 px-5 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Honeypot anti-spam trap */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="honeypot"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.honeypot}
                      onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    />
                  </div>

                  {submitError && (
                    <div className="p-4 bg-neutral-100 border border-neutral-300 flex items-center gap-3 text-xs text-neutral-800">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                        Full Name / Org <span className="text-neutral-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Jane Doe or Acquired Corp"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-3.5 py-2.5 text-sm border focus:outline-none transition-colors ${
                          errors.name
                            ? 'border-neutral-900 bg-neutral-50 ring-1 ring-black'
                            : 'border-neutral-300 focus:border-black'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-[11px] font-mono-code text-neutral-800">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                        Email Address <span className="text-neutral-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="jane@organization.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3.5 py-2.5 text-sm border focus:outline-none transition-colors ${
                          errors.email
                            ? 'border-neutral-900 bg-neutral-50 ring-1 ring-black'
                            : 'border-neutral-300 focus:border-black'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] font-mono-code text-neutral-800">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                      Inquiry Subject <span className="text-neutral-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Infrastructure Consulting / Keynote"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full px-3.5 py-2.5 text-sm border focus:outline-none transition-colors ${
                        errors.subject
                          ? 'border-neutral-900 bg-neutral-50 ring-1 ring-black'
                          : 'border-neutral-300 focus:border-black'
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-[11px] font-mono-code text-neutral-800">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                      Message Content <span className="text-neutral-400">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Provide context regarding your timeframe, architectural goals, or requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full px-3.5 py-2.5 text-sm border focus:outline-none transition-colors resize-y ${
                        errors.message
                          ? 'border-neutral-900 bg-neutral-50 ring-1 ring-black'
                          : 'border-neutral-300 focus:border-black'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-[11px] font-mono-code text-neutral-800">{errors.message}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Transmit Inquiry</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
