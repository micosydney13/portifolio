import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Sparkles } from 'lucide-react';
import { SkillCategory, Skill } from '../../types';
import {
  saveSkillCategory,
  deleteSkillCategory,
  saveSkill,
  deleteSkill,
} from '../../lib/storage';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface SkillsManagerProps {
  categories: SkillCategory[];
  skills: Skill[];
  onSaved: (msg: string) => void;
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({ categories, skills, onSaved }) => {
  // Category modal
  const [editingCategory, setEditingCategory] = useState<Partial<SkillCategory> | null>(null);
  const [catToDelete, setCatToDelete] = useState<SkillCategory | null>(null);

  // Skill modal
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) return;

    await saveSkillCategory(editingCategory);
    setEditingCategory(null);
    onSaved(`Skill category "${editingCategory.name}" saved.`);
  };

  // Delete Category
  const handleConfirmDeleteCat = async () => {
    if (!catToDelete) return;
    await deleteSkillCategory(catToDelete.id);
    setCatToDelete(null);
    onSaved(`Category and associated skills deleted.`);
  };

  // Save Skill
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?.name?.trim()) return;

    await saveSkill(editingSkill);
    setEditingSkill(null);
    onSaved(`Skill "${editingSkill.name}" saved.`);
  };

  // Delete Skill
  const handleConfirmDeleteSkill = async () => {
    if (!skillToDelete) return;
    await deleteSkill(skillToDelete.id);
    setSkillToDelete(null);
    onSaved(`Skill deleted.`);
  };

  const handleToggleCatVisibility = async (cat: SkillCategory) => {
    await saveSkillCategory({ ...cat, visible: !cat.visible });
    onSaved(`Category visibility updated.`);
  };

  const handleToggleSkillVisibility = async (sk: Skill) => {
    await saveSkill({ ...sk, visible: !sk.visible });
    onSaved(`Skill visibility updated.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Skills & Category Management
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Configure technical competencies, proficiency levels, and category groupings.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              setEditingCategory({
                name: '',
                displayOrder: categories.length + 1,
                visible: true,
              })
            }
            className="px-3.5 py-2 border border-neutral-300 text-xs uppercase font-mono-code text-neutral-800 hover:border-black bg-white"
          >
            + Add Category
          </button>
          <button
            onClick={() =>
              setEditingSkill({
                name: '',
                categoryId: categories[0]?.id || '',
                level: 90,
                displayOrder: skills.length + 1,
                visible: true,
              })
            }
            className="px-4 py-2 bg-black text-white text-xs uppercase font-mono-code hover:bg-neutral-800"
          >
            + Add Skill
          </button>
        </div>
      </div>

      {/* Categories & Skills breakdown */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const catSkills = skills
            .filter((s) => s.categoryId === cat.id)
            .sort((a, b) => a.displayOrder - b.displayOrder);

          return (
            <div key={cat.id} className="border border-neutral-200 bg-white p-6 space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-base text-neutral-950">
                    {cat.name}
                  </span>
                  <span className="text-[10px] font-mono-code px-2 py-0.5 bg-neutral-100 text-neutral-600">
                    {catSkills.length} Skills
                  </span>
                  {!cat.visible && (
                    <span className="text-[10px] font-mono-code px-2 py-0.5 bg-neutral-200 text-neutral-600">
                      Hidden from public
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleCatVisibility(cat)}
                    className="p-1.5 text-neutral-400 hover:text-black"
                    title={cat.visible ? 'Hide category' : 'Show category'}
                  >
                    {cat.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-neutral-300" />}
                  </button>
                  <button
                    onClick={() => setEditingCategory(cat)}
                    className="p-1.5 text-neutral-500 hover:text-black"
                    title="Edit Category Name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCatToDelete(cat)}
                    className="p-1.5 text-neutral-400 hover:text-black"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Skills in Category */}
              {catSkills.length === 0 ? (
                <p className="text-xs font-mono-code text-neutral-400 py-3">
                  No skills assigned to this category yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3 border border-neutral-200 bg-neutral-50/50 flex items-center justify-between hover:border-black transition-colors"
                    >
                      <div className="space-y-1 truncate pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono-code font-semibold text-neutral-900 truncate">
                            {skill.name}
                          </span>
                          {!skill.visible && (
                            <span className="text-[9px] font-mono-code text-neutral-400">(Hidden)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-neutral-200 overflow-hidden">
                            <div className="h-full bg-black" style={{ width: `${skill.level}%` }} />
                          </div>
                          <span className="text-[10px] font-mono-code text-neutral-500">{skill.level}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleSkillVisibility(skill)}
                          className="p-1 text-neutral-400 hover:text-black"
                          title="Toggle visibility"
                        >
                          {skill.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-300" />}
                        </button>
                        <button
                          onClick={() => setEditingSkill(skill)}
                          className="p-1 text-neutral-500 hover:text-black"
                          title="Edit skill"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSkillToDelete(skill)}
                          className="p-1 text-neutral-400 hover:text-black"
                          title="Delete skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() =>
                    setEditingSkill({
                      name: '',
                      categoryId: cat.id,
                      level: 85,
                      displayOrder: catSkills.length + 1,
                      visible: true,
                    })
                  }
                  className="text-xs font-mono-code text-neutral-600 hover:text-black underline"
                >
                  + Add skill to {cat.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-white border border-neutral-300 p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <h3 className="font-display font-bold text-sm text-neutral-950">
                {editingCategory.id ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setEditingCategory(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Category Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory((c) => ({ ...c, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Display Order</label>
                <input
                  type="number"
                  value={editingCategory.displayOrder || 1}
                  onChange={(e) => setEditingCategory((c) => ({ ...c, displayOrder: parseInt(e.target.value, 10) || 1 }))}
                  className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1.5 border border-neutral-300 text-xs font-mono-code text-neutral-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-black text-white text-xs font-mono-code">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Skill Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-white border border-neutral-300 p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <h3 className="font-display font-bold text-sm text-neutral-950">
                {editingSkill.id ? 'Edit Skill Entry' : 'Add New Skill Entry'}
              </h3>
              <button onClick={() => setEditingSkill(null)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSkill} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Skill / Tool Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rust & WebAssembly"
                  value={editingSkill.name || ''}
                  onChange={(e) => setEditingSkill((s) => ({ ...s, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase text-neutral-700">Category Assignment</label>
                <select
                  value={editingSkill.categoryId || categories[0]?.id}
                  onChange={(e) => setEditingSkill((s) => ({ ...s, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono-code">
                  <label className="uppercase text-neutral-700">Proficiency Meter</label>
                  <span>{editingSkill.level || 85}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={editingSkill.level || 85}
                  onChange={(e) => setEditingSkill((s) => ({ ...s, level: parseInt(e.target.value, 10) }))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-3 py-1.5 border border-neutral-300 text-xs font-mono-code text-neutral-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-black text-white text-xs font-mono-code">
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(catToDelete)}
        title="Delete Skill Category"
        message={`Delete category "${catToDelete?.name}"? All skills inside this category will also be deleted.`}
        confirmLabel="Delete Category & Skills"
        onConfirm={handleConfirmDeleteCat}
        onCancel={() => setCatToDelete(null)}
      />

      {/* Delete Skill Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(skillToDelete)}
        title="Delete Skill"
        message={`Delete skill "${skillToDelete?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteSkill}
        onCancel={() => setSkillToDelete(null)}
      />

    </div>
  );
};
