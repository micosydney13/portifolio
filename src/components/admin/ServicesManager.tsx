import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { Service } from '../../types';
import { saveService, deleteService } from '../../lib/storage';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface ServicesManagerProps {
  services: Service[];
  onSaved: (msg: string) => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({ services, onSaved }) => {
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [featuresText, setFeaturesText] = useState('');
  const [toDelete, setToDelete] = useState<Service | null>(null);

  const handleOpenCreate = () => {
    setEditingService({
      title: '',
      description: '',
      features: [],
      displayOrder: services.length + 1,
      enabled: true,
    });
    setFeaturesText('');
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService({ ...srv });
    setFeaturesText((srv.features || []).join('\n'));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title?.trim()) {
      alert('Service title is required.');
      return;
    }

    const feats = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    await saveService({
      ...editingService,
      features: feats,
    });

    setEditingService(null);
    onSaved(`Service "${editingService.title}" saved.`);
  };

  const handleToggleEnabled = async (srv: Service) => {
    await saveService({ ...srv, enabled: !srv.enabled });
    onSaved('Service availability toggled.');
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await deleteService(toDelete.id);
    setToDelete(null);
    onSaved('Service offering removed.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Advisory & Consulting Services Management
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Configure client engagement offerings, deliverable scopes, and technical consultation packages.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-mono-code flex items-center gap-2 hover:bg-neutral-800 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Offering</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className={`border p-6 bg-white flex flex-col justify-between space-y-5 transition-colors ${
              srv.enabled ? 'border-neutral-200 hover:border-black' : 'border-neutral-200 bg-neutral-50/70 opacity-70'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 bg-neutral-100 text-neutral-700">
                  Order {srv.displayOrder}
                </span>
                <button
                  onClick={() => handleToggleEnabled(srv)}
                  className={`text-[10px] font-mono-code uppercase px-2 py-0.5 font-semibold ${
                    srv.enabled ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {srv.enabled ? 'Active Offering' : 'Disabled'}
                </button>
              </div>

              <h3 className="font-display font-bold text-base text-neutral-950">
                {srv.title}
              </h3>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {srv.description}
              </p>

              {srv.features && srv.features.length > 0 && (
                <ul className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs text-neutral-700">
                  {srv.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-mono-code text-neutral-400">▪</span>
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <button
                onClick={() => handleOpenEdit(srv)}
                className="p-1.5 border border-neutral-200 hover:border-black text-neutral-600"
                title="Edit service"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setToDelete(srv)}
                className="p-1.5 border border-neutral-200 hover:border-black text-neutral-400 hover:text-black"
                title="Delete service"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-neutral-300 p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <h3 className="font-display font-bold text-base text-neutral-950">
                {editingService.id ? 'Edit Service Offering' : 'Create Service Offering'}
              </h3>
              <button onClick={() => setEditingService(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Full-Stack & Cloud Architecture"
                  value={editingService.title || ''}
                  onChange={(e) => setEditingService((s) => ({ ...s, title: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Display Order</label>
                  <input
                    type="number"
                    value={editingService.displayOrder || 1}
                    onChange={(e) => setEditingService((s) => ({ ...s, displayOrder: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 text-xs font-mono-code cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingService.enabled !== false}
                      onChange={(e) => setEditingService((s) => ({ ...s, enabled: e.target.checked }))}
                      className="accent-black"
                    />
                    <span>Active on Public Site</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Description</label>
                <textarea
                  rows={3}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService((s) => ({ ...s, description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">
                  Deliverables & Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="System design and data modeling&#10;API specifications&#10;Cloud infrastructure setup"
                  className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 border border-neutral-300 text-xs font-mono-code"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-black text-white text-xs font-mono-code">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(toDelete)}
        title="Delete Service"
        message={`Delete "${toDelete?.title}"?`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />

    </div>
  );
};
