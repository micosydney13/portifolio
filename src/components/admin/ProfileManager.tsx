import React, { useState } from 'react';
import { Save, RefreshCw, CheckCircle2, AlertCircle, FileText, Upload } from 'lucide-react';
import { Profile } from '../../types';
import { updateProfile } from '../../lib/storage';
import { ImageUploadField } from '../ui/ImageUploadField';

interface ProfileManagerProps {
  initialProfile: Profile;
  onSaved: (msg: string) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ initialProfile, onSaved }) => {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (field: keyof Profile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!profile.name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }
    if (!profile.email.trim()) {
      setErrorMsg('Professional email cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(profile);
      onSaved('Profile information successfully updated and published to public portfolio.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setProfile(initialProfile);
    setErrorMsg(null);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Profile & Biography Management
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Configure primary identity, availability status, credentials, and introductory copy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-neutral-300 text-xs uppercase tracking-wider font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            Cancel Changes
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xs"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-neutral-100 border border-neutral-300 text-xs text-neutral-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Identity Grid */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
        <h3 className="text-sm font-mono-code uppercase tracking-wider font-semibold text-neutral-900 border-b border-neutral-100 pb-2">
          1. Identity & Contact Coordinates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Full Legal / Professional Name *
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Professional Title / Specialty *
            </label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Professional Contact Email *
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black font-mono-code"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Geographic Location
            </label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA & Zurich"
              value={profile.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Availability Status */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
            Work / Engagement Availability Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'available', label: 'Available for Hire', dot: 'bg-emerald-500' },
              { id: 'selective', label: 'Selective Advisory', dot: 'bg-neutral-800' },
              { id: 'busy', label: 'Fully Booked', dot: 'bg-neutral-400' },
              { id: 'not-available', label: 'Not Available', dot: 'bg-neutral-300' },
            ].map((st) => (
              <label
                key={st.id}
                className={`flex items-center gap-2 p-3 border cursor-pointer transition-colors ${
                  profile.availabilityStatus === st.id
                    ? 'border-black bg-neutral-50 ring-1 ring-black'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <input
                  type="radio"
                  name="availabilityStatus"
                  value={st.id}
                  checked={profile.availabilityStatus === st.id}
                  onChange={(e) => handleChange('availabilityStatus', e.target.value)}
                  className="sr-only"
                />
                <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                <span className="text-xs font-mono-code text-neutral-900">{st.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Headline & Intro */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
        <h3 className="text-sm font-mono-code uppercase tracking-wider font-semibold text-neutral-900 border-b border-neutral-100 pb-2">
          2. Hero Typography & Short Intro
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Hero Primary Heading
            </label>
            <input
              type="text"
              value={profile.heroHeading}
              onChange={(e) => handleChange('heroHeading', e.target.value)}
              className="w-full px-3.5 py-2.5 text-base border border-neutral-300 focus:outline-none focus:border-black font-display font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Hero Supporting Subheading / Hook
            </label>
            <input
              type="text"
              value={profile.heroSubheading}
              onChange={(e) => handleChange('heroSubheading', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Short Professional Elevator Pitch
            </label>
            <textarea
              rows={2}
              value={profile.shortBio}
              onChange={(e) => handleChange('shortBio', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Full Narrative Biography (Multi-Paragraph)
            </label>
            <textarea
              rows={6}
              value={profile.fullBio}
              onChange={(e) => handleChange('fullBio', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:border-black font-normal leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>

      {/* Visual Portrait & Résumé */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
        <h3 className="text-sm font-mono-code uppercase tracking-wider font-semibold text-neutral-900 border-b border-neutral-100 pb-2">
          3. Imagery & Curriculum Vitae File
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <ImageUploadField
            label="Portrait / Profile Image"
            value={profile.profileImage}
            onChange={(url) => handleChange('profileImage', url)}
            helperText="High resolution portrait (monochrome recommended). Upload from device or provide URL."
            aspectRatio="square"
          />

          <div className="space-y-5 border border-neutral-200 p-6 bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-black" />
              <h4 className="text-xs font-mono-code uppercase tracking-wider font-semibold text-neutral-900">
                Curriculum Vitae / Résumé
              </h4>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.resumeEnabled}
                  onChange={(e) => handleChange('resumeEnabled', e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-xs font-mono-code text-neutral-800">
                  Enable CV download button on public website
                </span>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                Direct Document URL or Storage Path
              </label>
              <input
                type="text"
                placeholder="https://... or /resume.pdf"
                value={profile.resumeUrl}
                onChange={(e) => handleChange('resumeUrl', e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black bg-white"
              />
              <p className="text-[11px] text-neutral-500">
                Direct PDF or Google Drive / Cloud Storage share link.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Trigger */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 border border-neutral-300 text-xs uppercase tracking-wider font-medium text-neutral-700 bg-white hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs"
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Changes</span>
        </button>
      </div>

    </form>
  );
};
