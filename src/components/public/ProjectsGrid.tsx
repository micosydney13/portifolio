import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, Github, ArrowUpRight, Filter } from 'lucide-react';
import { Project } from '../../types';
import { ProjectModal } from './ProjectModal';

interface ProjectsGridProps {
  projects: Project[];
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  // Extract unique categories from published projects
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Filter projects by category and search
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Must be published (safety guard)
      if (project.status !== 'published') return false;

      const matchesCat = selectedCategory === 'All' || project.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.shortDescription.toLowerCase().includes(q) ||
        project.technologies.some((t) => t.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <section id="projects" className="py-24 md:py-32 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 tracking-tight">
              Featured Projects & Applications
            </h2>
            <div className="w-12 h-0.5 bg-black" />
            <p className="text-sm text-neutral-600 max-w-xl">
              Full-stack web applications, scalable backend APIs, developer tooling, and SaaS solutions.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search stack, title, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-mono-code border border-neutral-300 focus:outline-none focus:border-black bg-white transition-colors"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-neutral-100 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-mono-code uppercase tracking-wider shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-300 p-8">
            <p className="text-sm font-mono-code text-neutral-500">
              No published projects found matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 text-xs font-mono-code uppercase bg-black text-white hover:bg-neutral-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                onClick={() => setActiveModalProject(project)}
                className="group relative bg-white border border-neutral-200 hover:border-black transition-all duration-300 flex flex-col cursor-pointer overflow-hidden"
              >
                {/* Project Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 border-b border-neutral-200">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover filter grayscale contrast-105 group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-black/85 backdrop-blur-xs text-white text-[10px] font-mono-code uppercase tracking-wider">
                      {project.category}
                    </span>
                  </div>

                  {project.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 bg-white border border-black text-black text-[9px] font-mono-code uppercase font-semibold">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono-code text-neutral-400">
                      <span>{project.date}</span>
                      <span className="group-hover:text-black transition-colors flex items-center gap-1 font-medium">
                        Explore <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>

                    <h3 className="text-xl font-display font-semibold text-neutral-950 group-hover:underline underline-offset-4 decoration-1">
                      {project.title}
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                      {project.shortDescription}
                    </p>
                  </div>

                  {/* Technology Tags */}
                  <div className="pt-4 border-t border-neutral-100 flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 bg-neutral-100 text-[10px] font-mono-code text-neutral-700"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono-code text-neutral-400">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
};
