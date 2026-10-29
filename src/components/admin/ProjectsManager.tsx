import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ExternalLink,
  Github,
  ArrowUpDown,
  Check,
  X,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Project } from '../../types';
import { saveProject, deleteProject, reorderProjects } from '../../lib/storage';
import { ImageUploadField } from '../ui/ImageUploadField';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface ProjectsManagerProps {
  projects: Project[];
  onSaved: (msg: string) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, onSaved }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal editor states
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project>>({});
  const [techInput, setTechInput] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Delete confirmation
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q));

        return matchesStatus && matchesCat && matchesSearch;
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [projects, statusFilter, categoryFilter, searchQuery]);

  // Open modal for new project
  const handleOpenCreate = () => {
    setEditingProject({
      title: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      additionalImages: [],
      technologies: ['TypeScript', 'React', 'Tailwind CSS'],
      category: 'Systems & Architecture',
      date: new Date().getFullYear().toString(),
      liveUrl: '',
      githubUrl: '',
      featured: false,
      displayOrder: projects.length + 1,
      status: 'published',
    });
    setTechInput('TypeScript, React, Tailwind CSS');
    setIsEditing(true);
  };

  // Open modal for editing
  const handleOpenEdit = (project: Project) => {
    setEditingProject({ ...project });
    setTechInput(project.technologies.join(', '));
    setIsEditing(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject.title?.trim()) {
      alert('Project title is required.');
      return;
    }

    const techs = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await saveProject({
        ...editingProject,
        technologies: techs,
      });
      setIsEditing(false);
      onSaved(`Project "${editingProject.title}" saved successfully.`);
    } catch (err) {
      console.error(err);
      alert('Failed to save project.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      onSaved(`Project "${projectToDelete.title}" deleted.`);
      setProjectToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
    }
  };

  const handleToggleStatus = async (project: Project) => {
    const nextStatus = project.status === 'published' ? 'draft' : 'published';
    await saveProject({ ...project, status: nextStatus });
    onSaved(`Project "${project.title}" changed to ${nextStatus}.`);
  };

  const handleToggleFeatured = async (project: Project) => {
    await saveProject({ ...project, featured: !project.featured });
    onSaved(`Updated featured status for "${project.title}".`);
  };

  const handleMoveOrder = async (project: Project, direction: 'up' | 'down') => {
    const currentIndex = projects.findIndex((p) => p.id === project.id);
    if (currentIndex < 0) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newOrderList = [...projects];
    const temp = newOrderList[currentIndex];
    newOrderList[currentIndex] = newOrderList[targetIndex];
    newOrderList[targetIndex] = temp;

    await reorderProjects(newOrderList.map((p) => p.id));
    onSaved('Projects order rearranged.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Projects & Case Studies Management
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Create, edit, publish, reorder, and curate architectural projects and portfolio works.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-neutral-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex border border-neutral-200 p-0.5 bg-neutral-50 text-xs font-mono-code">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 uppercase ${statusFilter === 'all' ? 'bg-black text-white font-semibold' : 'text-neutral-600 hover:text-black'}`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 uppercase ${statusFilter === 'published' ? 'bg-black text-white font-semibold' : 'text-neutral-600 hover:text-black'}`}
            >
              Published ({projects.filter((p) => p.status === 'published').length})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 uppercase ${statusFilter === 'draft' ? 'bg-black text-white font-semibold' : 'text-neutral-600 hover:text-black'}`}
            >
              Drafts ({projects.filter((p) => p.status === 'draft').length})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono-code border border-neutral-200 bg-white focus:outline-none focus:border-black uppercase"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono-code border border-neutral-200 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Projects Table / Card List */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-300 bg-white">
          <p className="text-xs font-mono-code text-neutral-500">
            No projects match the current filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 font-mono-code text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4 w-20">Preview</th>
                <th className="py-3 px-4">Title & Slug</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Technologies</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProjects.map((project, idx) => (
                <tr key={project.id} className="hover:bg-neutral-50/70 transition-colors">
                  {/* Order / Move */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center gap-1 font-mono-code text-neutral-400">
                      <button
                        onClick={() => handleMoveOrder(project, 'up')}
                        disabled={idx === 0}
                        className="hover:text-black disabled:opacity-20 text-[10px]"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <span>{project.displayOrder}</span>
                      <button
                        onClick={() => handleMoveOrder(project, 'down')}
                        disabled={idx === filteredProjects.length - 1}
                        className="hover:text-black disabled:opacity-20 text-[10px]"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  {/* Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="w-16 h-11 bg-neutral-100 border border-neutral-200 overflow-hidden">
                      <img
                        src={project.coverImage}
                        alt=""
                        className="w-full h-full object-cover filter grayscale"
                      />
                    </div>
                  </td>

                  {/* Title & Slug */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-semibold text-neutral-900 truncate">{project.title}</div>
                    <div className="text-[11px] font-mono-code text-neutral-400 truncate">
                      /{project.slug}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono-code text-neutral-600">
                    {project.category}
                  </td>

                  {/* Tech stack */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-neutral-100 text-[10px] font-mono-code text-neutral-700">
                          {t}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[10px] font-mono-code text-neutral-400">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Featured */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(project)}
                      className={`p-1 transition-colors ${
                        project.featured ? 'text-black' : 'text-neutral-300 hover:text-neutral-500'
                      }`}
                      title={project.featured ? 'Featured on home' : 'Set as featured'}
                    >
                      <Star className={`w-4 h-4 ${project.featured ? 'fill-black' : ''}`} />
                    </button>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(project)}
                      className={`px-2.5 py-1 text-[10px] font-mono-code uppercase font-semibold transition-colors ${
                        project.status === 'published'
                          ? 'bg-black text-white hover:bg-neutral-800'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                      }`}
                    >
                      {project.status}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(project)}
                        className="p-1.5 text-neutral-600 hover:text-black border border-transparent hover:border-neutral-300"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProjectToDelete(project)}
                        className="p-1.5 text-neutral-400 hover:text-black border border-transparent hover:border-neutral-300"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-neutral-300 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <h3 className="font-display font-bold text-lg text-neutral-950">
                {editingProject.id ? 'Edit Case Study / Project' : 'Create New Project Record'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-neutral-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setEditingProject((p) => ({ ...p, title, slug: p.slug || slug }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug || ''}
                    onChange={(e) => setEditingProject((p) => ({ ...p, slug: e.target.value }))}
                    className="w-full px-3 py-2 text-sm font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingProject.category || ''}
                    onChange={(e) => setEditingProject((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Systems, Frontend, etc."
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    Date / Year
                  </label>
                  <input
                    type="text"
                    value={editingProject.date || ''}
                    onChange={(e) => setEditingProject((p) => ({ ...p, date: e.target.value }))}
                    placeholder="2025"
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingProject.displayOrder || 1}
                    onChange={(e) => setEditingProject((p) => ({ ...p, displayOrder: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Status and Featured checkboxes */}
              <div className="flex flex-wrap items-center gap-6 p-3 bg-neutral-50 border border-neutral-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono-code text-neutral-800">
                  <input
                    type="checkbox"
                    checked={editingProject.status === 'published'}
                    onChange={(e) =>
                      setEditingProject((p) => ({ ...p, status: e.target.checked ? 'published' : 'draft' }))
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <span>Published on public site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono-code text-neutral-800">
                  <input
                    type="checkbox"
                    checked={editingProject.featured || false}
                    onChange={(e) => setEditingProject((p) => ({ ...p, featured: e.target.checked }))}
                    className="w-4 h-4 accent-black"
                  />
                  <span>Featured Case Study</span>
                </label>
              </div>

              {/* Cover Image Upload */}
              <ImageUploadField
                label="Primary Cover Image"
                value={editingProject.coverImage || ''}
                onChange={(url) => setEditingProject((p) => ({ ...p, coverImage: url }))}
                helperText="Upload project visual from computer or enter URL."
                aspectRatio="video"
              />

              {/* Short & Full Description */}
              <div className="space-y-1">
                <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                  Short Description (Card preview)
                </label>
                <textarea
                  rows={2}
                  value={editingProject.shortDescription || ''}
                  onChange={(e) => setEditingProject((p) => ({ ...p, shortDescription: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                  Full Architectural Narrative / Deep Dive
                </label>
                <textarea
                  rows={5}
                  value={editingProject.fullDescription || ''}
                  onChange={(e) => setEditingProject((p) => ({ ...p, fullDescription: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black resize-y font-normal"
                />
              </div>

              {/* Technologies */}
              <div className="space-y-1">
                <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                  Technologies (Comma separated)
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="TypeScript, Rust, WebAssembly, Tailwind CSS"
                  className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                />
              </div>

              {/* External URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    Live Demo Link
                  </label>
                  <input
                    type="url"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject((p) => ({ ...p, liveUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-neutral-700">
                    GitHub / Source Code Link
                  </label>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject((p) => ({ ...p, githubUrl: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-neutral-300 text-xs uppercase tracking-wider font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800"
                >
                  Save Project Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationModal
        isOpen={Boolean(projectToDelete)}
        title="Delete Project Entry"
        message={`Are you certain you want to permanently delete "${projectToDelete?.title}"? This operation cannot be reversed.`}
        confirmLabel="Permanently Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />

    </div>
  );
};
