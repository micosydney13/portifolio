import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, ExternalLink, Globe } from 'lucide-react';
import { SocialLink } from '../../types';
import { saveSocialLink, deleteSocialLink } from '../../lib/storage';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface SocialLinksManagerProps {
  socialLinks: SocialLink[];
  onSaved: (msg: string) => void;
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ socialLinks, onSaved }) => {
  const [editingLink, setEditingLink] = useState<Partial<SocialLink> | null>(null);
  const [toDelete, setToDelete] = useState<SocialLink | null>(null);

  const handleOpenCreate = () => {
    setEditingLink({
      platform: 'GitHub',
      label: 'github.com/...',
      url: 'https://github.com/',
      icon: 'github',
      displayOrder: socialLinks.length + 1,
      visible: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink?.platform?.trim() || !editingLink?.url?.trim()) {
      alert('Platform and URL are required.');
      return;
    }

    await saveSocialLink(editingLink);
    setEditingLink(null);
    onSaved(`Social link "${editingLink.platform}" updated.`);
  };

  const handleToggleVisibility = async (link: SocialLink) => {
    await saveSocialLink({ ...link, visible: !link.visible });
    onSaved('Social link visibility updated.');
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await deleteSocialLink(toDelete.id);
    setToDelete(null);
    onSaved('Social link removed.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Social Networks & External Channels
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Configure links displayed in the public hero, footer, and contact section.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-mono-code flex items-center gap-2 hover:bg-neutral-800 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Social Channel</span>
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-neutral-200 divide-y divide-neutral-100 shadow-xs">
        {socialLinks.map((link) => (
          <div
            key={link.id}
            className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
              link.visible ? 'hover:bg-neutral-50/70' : 'bg-neutral-50/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-4 truncate">
              <div className="w-8 h-8 bg-neutral-100 flex items-center justify-center border border-neutral-200 shrink-0">
                <Globe className="w-4 h-4 text-neutral-700" />
              </div>
              <div className="truncate space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-neutral-900">{link.platform}</span>
                  <span className="text-[10px] font-mono-code text-neutral-400">Order: {link.displayOrder}</span>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono-code text-neutral-500 hover:text-black flex items-center gap-1 underline truncate"
                >
                  <span className="truncate">{link.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleToggleVisibility(link)}
                className="p-1.5 border border-neutral-200 hover:border-black text-neutral-600"
                title={link.visible ? 'Hide link' : 'Show link'}
              >
                {link.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-400" />}
              </button>
              <button
                onClick={() => setEditingLink(link)}
                className="p-1.5 border border-neutral-200 hover:border-black text-neutral-600"
                title="Edit link"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setToDelete(link)}
                className="p-1.5 border border-neutral-200 hover:border-black text-neutral-400 hover:text-black"
                title="Delete link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-white border border-neutral-300 p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <h3 className="font-display font-bold text-sm text-neutral-950">
                {editingLink.id ? 'Edit Social Link' : 'Add Social Link'}
              </h3>
              <button onClick={() => setEditingLink(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Platform Name *</label>
                <input
                  type="text"
                  required
                  placeholder="GitHub, LinkedIn, Bluesky, X, Substack"
                  value={editingLink.platform || ''}
                  onChange={(e) => setEditingLink((l) => ({ ...l, platform: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Display Label</label>
                <input
                  type="text"
                  placeholder="e.g. @alexandervance"
                  value={editingLink.label || ''}
                  onChange={(e) => setEditingLink((l) => ({ ...l, label: e.target.value }))}
                  className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Destination URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={editingLink.url || ''}
                  onChange={(e) => setEditingLink((l) => ({ ...l, url: e.target.value }))}
                  className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Display Order</label>
                  <input
                    type="number"
                    value={editingLink.displayOrder || 1}
                    onChange={(e) => setEditingLink((l) => ({ ...l, displayOrder: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-mono-code cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLink.visible !== false}
                      onChange={(e) => setEditingLink((l) => ({ ...l, visible: e.target.checked }))}
                      className="accent-black"
                    />
                    <span>Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-3 py-1.5 border border-neutral-300 text-xs font-mono-code"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-black text-white text-xs font-mono-code">
                  Save Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(toDelete)}
        title="Delete Social Channel"
        message={`Delete social channel "${toDelete?.platform}"?`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />

    </div>
  );
};
