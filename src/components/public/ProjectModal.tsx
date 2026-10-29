import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Github, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../../types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    setActiveImageIdx(0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const allImages = [project.coverImage, ...(project.additionalImages || [])].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-neutral-300 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono-code uppercase tracking-wider px-2 py-0.5 bg-black text-white">
              {project.category}
            </span>
            <span className="text-xs font-mono-code text-neutral-400">
              // {project.date}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-black border border-transparent hover:border-neutral-300 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 space-y-8 flex-1">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-950 tracking-tight">
                {project.title}
              </h2>
              {project.featured && (
                <span className="px-2 py-0.5 border border-black text-neutral-900 text-[10px] font-mono-code uppercase font-semibold">
                  Featured Case Study
                </span>
              )}
            </div>
            <p className="text-base text-neutral-600 leading-relaxed font-normal">
              {project.shortDescription}
            </p>
          </div>

          {allImages.length > 0 && (
            <div className="space-y-3">
              <div className="relative aspect-video bg-neutral-900 overflow-hidden border border-neutral-200 group">
                <img
                  src={allImages[activeImageIdx]}
                  alt={`${project.title} preview`}
                  className="w-full h-full object-cover filter grayscale contrast-105"
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/80 text-white hover:bg-black transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/80 text-white hover:bg-black transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-14 shrink-0 overflow-hidden border-2 transition-all ${
                        activeImageIdx === idx ? 'border-black' : 'border-neutral-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover filter grayscale" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-neutral-200">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Live Demonstration</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-white text-black border border-neutral-300 text-xs uppercase tracking-widest font-medium hover:bg-neutral-50 hover:border-black transition-colors flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                <span>Source Repository</span>
              </a>
            )}

            <div className="ml-auto text-xs font-mono-code text-neutral-500 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Released {project.date}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-mono-code uppercase tracking-widest text-neutral-400">
              [ Case Study Details ]
            </h4>
            <div className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line space-y-4">
              {project.fullDescription || project.shortDescription}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono-code uppercase tracking-widest text-neutral-400">
              [ Technologies & Stack ]
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-mono-code"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-neutral-200 bg-neutral-50/80 flex items-center justify-between text-xs font-mono-code text-neutral-500">
          <span>SLUG: /{project.slug}</span>
          <button
            onClick={onClose}
            className="text-neutral-700 hover:text-black font-medium underline"
          >
            Close Esc
          </button>
        </div>
      </div>
    </div>
  );
};
