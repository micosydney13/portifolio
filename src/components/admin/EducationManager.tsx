import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, GraduationCap, X } from 'lucide-react';
import { Education } from '../../types';
import { saveEducation, deleteEducation } from '../../lib/storage';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface EducationManagerProps {
  education: Education[];
  onSaved: (msg: string) => void;
}

export const EducationManager: React.FC<EducationManagerProps> = ({ education, onSaved }) => {
  const [editingEdu, setEditingEdu] = useState<Partial<Education> | null>(null);
  const [toDelete, setToDelete] = useState<Education | null>(null);

  const handleOpenCreate = () => {
    setEditingEdu({
      degree: '',
      institution: '',
      location: '',
      year: '2024',
      description: '',
      credentialUrl: '',
      displayOrder: education.length + 1,
      published: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu?.degree?.trim() || !editingEdu?.institution?.trim()) {
      alert('Degree and institution are required.');
      return;
    }

    await saveEducation(editingEdu);
    setEditingEdu(null);
    onSaved(`Education record saved.`);
  };

  const handleTogglePublish = async (edu: Education) => {
    await saveEducation({ ...edu, published: !edu.published });
    onSaved('Education visibility updated.');
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await deleteEducation(toDelete.id);
    setToDelete(null);
    onSaved('Education record deleted.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Education, Degrees & Certifications
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Manage academic diplomas, verified cloud certifications, and technical credentials.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-mono-code flex items-center gap-2 hover:bg-neutral-800 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Credential</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {education.map((edu) => (
          <div
            key={edu.id}
            className={`p-6 border bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${
              edu.published ? 'border-neutral-200 hover:border-black' : 'border-neutral-200 bg-neutral-50/70 opacity-75'
            }`}
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-code px-2 py-0.5 bg-neutral-100 text-neutral-800">
                  {edu.year}
                </span>
                {!edu.published && (
                  <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 bg-neutral-200 text-neutral-800">
                    Draft
                  </span>
                )}
              </div>

              <h3 className="font-display font-bold text-base text-neutral-950">
                {edu.degree}
              </h3>

              <div className="text-xs font-mono-code text-neutral-600">
                {edu.institution} {edu.location ? `— ${edu.location}` : ''}
              </div>

              {edu.description && (
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {edu.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleTogglePublish(edu)}
                className="p-2 border border-neutral-200 hover:border-black text-neutral-600"
                title={edu.published ? 'Unpublish' : 'Publish'}
              >
                {edu.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-neutral-400" />}
              </button>
              <button
                onClick={() => setEditingEdu(edu)}
                className="p-2 border border-neutral-200 hover:border-black text-neutral-600"
                title="Edit entry"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setToDelete(edu)}
                className="p-2 border border-neutral-200 hover:border-black text-neutral-400 hover:text-black"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingEdu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-neutral-300 p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <h3 className="font-display font-bold text-base text-neutral-950">
                {editingEdu.id ? 'Edit Credential' : 'Create Credential'}
              </h3>
              <button onClick={() => setEditingEdu(null)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Degree / Certification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Master of Science in Computer Science"
                  value={editingEdu.degree || ''}
                  onChange={(e) => setEditingEdu((p) => ({ ...p, degree: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Institution / Authority *</label>
                  <input
                    type="text"
                    required
                    placeholder="ETH Zürich"
                    value={editingEdu.institution || ''}
                    onChange={(e) => setEditingEdu((p) => ({ ...p, institution: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Year / Date Span</label>
                  <input
                    type="text"
                    placeholder="2016 — 2018"
                    value={editingEdu.year || ''}
                    onChange={(e) => setEditingEdu((p) => ({ ...p, year: e.target.value }))}
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Location</label>
                  <input
                    type="text"
                    placeholder="Zurich, Switzerland"
                    value={editingEdu.location || ''}
                    onChange={(e) => setEditingEdu((p) => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono-code uppercase text-neutral-700">Display Order</label>
                  <input
                    type="number"
                    value={editingEdu.displayOrder || 1}
                    onChange={(e) => setEditingEdu((p) => ({ ...p, displayOrder: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Verification URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingEdu.credentialUrl || ''}
                  onChange={(e) => setEditingEdu((p) => ({ ...p, credentialUrl: e.target.value }))}
                  className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Description / Focus</label>
                <textarea
                  rows={3}
                  value={editingEdu.description || ''}
                  onChange={(e) => setEditingEdu((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingEdu(null)}
                  className="px-4 py-2 border border-neutral-300 text-xs font-mono-code"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-black text-white text-xs font-mono-code">
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(toDelete)}
        title="Delete Credential"
        message={`Delete "${toDelete?.degree}" from ${toDelete?.institution}?`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />

    </div>
  );
};
