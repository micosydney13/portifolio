import React, { useState } from 'react';
import { Globe, Save, Search, Share2 } from 'lucide-react';
import { SeoSetting } from '../../types';
import { updateSeo } from '../../lib/storage';
import { ImageUploadField } from '../ui/ImageUploadField';

interface SeoManagerProps {
  seo: SeoSetting;
  onSaved: (msg: string) => void;
}

export const SeoManager: React.FC<SeoManagerProps> = ({ seo, onSaved }) => {
  const [form, setForm] = useState<SeoSetting>(seo);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSeo(form);
    // dynamically apply to document title
    document.title = form.pageTitle;
    onSaved('SEO metadata successfully updated and published to HTML head.');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Search Engine Optimization (SEO) & Social Graph
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Configure OpenGraph share cards, crawler indexing snippets, and search previews.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Metadata</span>
        </button>
      </div>

      <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
        
        <div className="space-y-1.5">
          <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
            HTML Document Title
          </label>
          <input
            type="text"
            value={form.pageTitle}
            onChange={(e) => setForm({ ...form, pageTitle: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
            Meta Description (Search Engines)
          </label>
          <textarea
            rows={3}
            value={form.metaDescription}
            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black resize-y"
          />
          <div className="text-[11px] font-mono-code text-neutral-400 text-right">
            {form.metaDescription.length} / 160 Recommended
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-neutral-100">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Open Graph (OG) Title
            </label>
            <input
              type="text"
              value={form.ogTitle}
              onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
              Canonical URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={form.canonicalUrl}
              onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
            Open Graph Description
          </label>
          <textarea
            rows={2}
            value={form.ogDescription}
            onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black resize-y"
          />
        </div>

        <ImageUploadField
          label="Social Share Card Image (og:image)"
          value={form.ogImage}
          onChange={(url) => setForm({ ...form, ogImage: url })}
          helperText="Recommended dimensions: 1200 x 630 pixels."
          aspectRatio="video"
        />

        {/* Live Search Engine Snippet Preview */}
        <div className="pt-4 border-t border-neutral-100 space-y-2">
          <span className="text-[10px] font-mono-code uppercase text-neutral-400 tracking-wider">
            Google Search Snippet Preview:
          </span>
          <div className="p-4 border border-neutral-200 bg-neutral-50/50 space-y-1">
            <div className="text-[11px] font-mono-code text-neutral-500 truncate">
              {form.canonicalUrl || 'https://alexandervance.io'}
            </div>
            <div className="text-base text-neutral-900 font-medium hover:underline cursor-pointer truncate">
              {form.pageTitle}
            </div>
            <div className="text-xs text-neutral-600 line-clamp-2">
              {form.metaDescription}
            </div>
          </div>
        </div>

      </div>

    </form>
  );
};
