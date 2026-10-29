import React, { useState } from 'react';
import { Palette, Save, Type, LayoutTemplate } from 'lucide-react';
import { BrandingSetting } from '../../types';
import { updateBranding } from '../../lib/storage';

interface AppearanceManagerProps {
  branding: BrandingSetting;
  onSaved: (msg: string) => void;
}

export const AppearanceManager: React.FC<AppearanceManagerProps> = ({ branding, onSaved }) => {
  const [form, setForm] = useState<BrandingSetting>(branding);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBranding(form);
    onSaved('Appearance and branding settings saved.');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Appearance, Typography & Monogram
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Configure typographic voice, monogram token, and branding declarations.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Branding</span>
        </button>
      </div>

      <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Personal Monogram (2-3 Chars)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                maxLength={4}
                value={form.monogram}
                onChange={(e) => setForm({ ...form, monogram: e.target.value.toUpperCase() })}
                className="w-24 px-3 py-2 text-center text-sm font-display font-bold border border-neutral-300 focus:outline-none focus:border-black uppercase tracking-widest"
              />
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-display font-bold text-sm tracking-widest">
                {form.monogram || 'AV'}
              </div>
            </div>
            <p className="text-[11px] text-neutral-400">Used for navigation badge and favicon token.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Public Site Title
            </label>
            <input
              type="text"
              value={form.siteTitle}
              onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
            Branding Tagline
          </label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
          />
        </div>

        {/* Typography Selector */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
            Primary Headings & Display Typography
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'space', name: 'Space Grotesk & Sans', desc: 'Modern geometric architectural feel' },
              { id: 'jakarta', name: 'Plus Jakarta Sans', desc: 'Precision balanced contemporary grotesque' },
              { id: 'mono', name: 'JetBrains Technical Mono', desc: 'Terminal and high-density developer aesthetic' },
              { id: 'classic', name: 'Editorial Serif / Display', desc: 'High-contrast luxury publication mood' },
            ].map((typo) => (
              <label
                key={typo.id}
                className={`p-4 border cursor-pointer transition-colors ${
                  form.typography === typo.id
                    ? 'border-black bg-neutral-50 ring-1 ring-black'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <input
                  type="radio"
                  name="typography"
                  value={typo.id}
                  checked={form.typography === typo.id}
                  onChange={(e) => setForm({ ...form, typography: e.target.value as any })}
                  className="sr-only"
                />
                <div className="text-xs font-semibold text-neutral-900">{typo.name}</div>
                <div className="text-[11px] text-neutral-500 mt-1">{typo.desc}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <div className="space-y-1.5 pt-2 border-t border-neutral-100">
          <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
            Public Footer Attribution Statement
          </label>
          <textarea
            rows={2}
            value={form.footerText}
            onChange={(e) => setForm({ ...form, footerText: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black resize-y"
          />
        </div>

      </div>

    </form>
  );
};
