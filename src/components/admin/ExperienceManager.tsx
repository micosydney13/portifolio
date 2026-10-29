import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Briefcase } from 'lucide-react';
import { Experience } from '../../types';
import { saveExperience, deleteExperience } from '../../lib/storage';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface ExperienceManagerProps {
  experiences: Experience[];
  onSaved: (msg: string) => void;
}

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({ experiences, onSaved }) => {
  const [editingExp, setEditingExp] = useState<Partial<Experience> | null>(null);
  const [bulletsText, setBulletsText] = useState('');
  const [toDelete, setToDelete] = useState<Experience | null>(null);

  const handleOpenCreate = () => {
    setEditingExp({
      role: '',
      company: '',
      location: '',
      period: '2024 — Present',
      current: true,
      description: '',
      bulletPoints: [],
      displayOrder: experiences.length + 1,
      published: true,
    });
    setBulletsText('');
  };

  const handleOpenEdit = (exp: Experience) => {
    setEditingExp({ ...exp });
    setBulletsText((exp.bulletPoints || []).join('\n'));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp?.role?.trim() || !editingExp?.company?.trim()) {
      alert('Role and company are required.');
      return;
    }

    const bullets = bulletsText
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);

    await saveExperience({
      ...editingExp,
      bulletPoints: bullets,
    });

    setEditingExp(null);
    onSaved(`Experience at "${editingExp.company}" saved.`);
  };

  const handleTogglePublish = async (exp: Experience) => {
    await saveExperience({ ...exp, published: !exp.published });
    onSaved(`Experience visibility toggled.`);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await deleteExperience(toDelete.id);
    setToDelete(null);
    onSaved(`Experience record deleted.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Work Experience & Career Trajectory
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Manage principal roles, engineering leadership, contract achievements, and chronological timelines.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-mono-code flex items-center gap-2 hover:bg-neutral-800 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Experience</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className={`p-6 border bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${
              exp.published ? 'border-neutral-200 hover:border-black' : 'border-neutral-200 bg-neutral-50/70 opacity-75'
            }`}
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-code px-2 py-0.5 bg-neutral-100 text-neutral-800">
                  {exp.period}
                </span>
                {exp.current && (
                  <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 bg-black text-white">
                    Current
                  </span>
                )}
                {!exp.published && (
                  <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 bg-neutral-300 text-neutral-800">
                    Draft (Unpublished)
                  </span>
                )}
              </div>

              <h3 className="font-display font-bold text-base text-neutral-950">
                {exp.role} <span className="font-normal text-neutral-500">at {exp.company}</span>
              </h3>

              <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                {exp.description}
              </p>

              {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                <div className="text-[11px] font-mono-code text-neutral-400">
                  {exp.bulletPoints.length} Key Achievements specified
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleTogglePublish(exp)}
                className="p-2 border border-neutral-200 hover:border-black text-neutral-600"
                title={exp.published ? 'Unpublish' : 'Publish'}
              >
                {exp.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-neutral-400" />}
              </button>
              <button
                onClick={() => handleOpenEdit(exp)}
                className="p-2 border border-neutral-200 hover:border-black text-neutral-600"
                title="Edit entry"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setToDelete(exp)}
                className="p-2 border border-neutral-200 hover:border-black text-neutral-400 hover:text-black"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-neutral-300 p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <h3 className="font-display font-bold text-base text-neutral-950">
                {editingExp.id ? 'Edit Experience Record' : 'Create Experience Record'}
              </h3>
              <button onClick={() => setEditingExp(null)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Staff Architect"
                    value={editingExp.role || ''}
                    onChange={(e) => setEditingExp((p) => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="Helios Core Labs"
                    value={editingExp.company || ''}
                    onChange={(e) => setEditingExp((p) => ({ ...p, company: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Timeframe / Period</label>
                  <input
                    type="text"
                    placeholder="2023 — Present"
                    value={editingExp.period || ''}
                    onChange={(e) => setEditingExp((p) => ({ ...p, period: e.target.value }))}
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Location</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    value={editingExp.location || ''}
                    onChange={(e) => setEditingExp((p) => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Display Order</label>
                  <input
                    type="number"
                    value={editingExp.displayOrder || 1}
                    onChange={(e) => setEditingExp((p) => ({ ...p, displayOrder: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex gap-4 p-3 bg-neutral-50 border border-neutral-200">
                <label className="flex items-center gap-2 text-xs font-mono-code cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingExp.current || false}
                    onChange={(e) => setEditingExp((p) => ({ ...p, current: e.target.checked }))}
                    className="accent-black"
                  />
                  <span>Currently Active Role</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-mono-code cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingExp.published !== false}
                    onChange={(e) => setEditingExp((p) => ({ ...p, published: e.target.checked }))}
                    className="accent-black"
                  />
                  <span>Published on Public Timeline</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Role Overview / Summary</label>
                <textarea
                  rows={3}
                  value={editingExp.description || ''}
                  onChange={(e) => setEditingExp((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">
                  Key Achievements / Deliverables (One per line)
                </label>
                <textarea
                  rows={4}
                  value={bulletsText}
                  onChange={(e) => setBulletsText(e.target.value)}
                  placeholder="Architected real-time streaming infrastructure&#10;Spearheaded monorepo migration&#10;Mentored senior engineering squads"
                  className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 border border-neutral-300 text-xs font-mono-code"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-black text-white text-xs font-mono-code">
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(toDelete)}
        title="Delete Experience Record"
        message={`Delete career entry for "${toDelete?.role} at ${toDelete?.company}"?`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />

    </div>
  );
};
