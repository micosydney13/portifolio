import React from 'react';
import { SkillCategory, Skill } from '../../types';

interface SkillsSectionProps {
  categories: SkillCategory[];
  skills: Skill[];
  embedded?: boolean;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ categories, skills, embedded = false }) => {
  // Only show visible categories
  const visibleCategories = categories.filter((c) => c.visible);

  return (
    <section
      id="skills"
      className={`${
        embedded
          ? 'py-20 md:py-24 border-t border-neutral-200 bg-neutral-50/30'
          : 'py-24 md:py-32 border-b border-neutral-200 bg-neutral-50/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 tracking-tight">
            Technical Skills & Tech Stack
          </h2>
          <div className="w-12 h-0.5 bg-black" />
          <p className="text-sm text-neutral-600 max-w-xl">
            A comprehensive overview of programming languages, frontend frameworks, backend runtimes, databases, and development tooling.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {visibleCategories.map((category) => {
            const categorySkills = skills
              .filter((s) => s.categoryId === category.id && s.visible)
              .sort((a, b) => a.displayOrder - b.displayOrder);

            if (categorySkills.length === 0) return null;

            return (
              <div
                key={category.id}
                className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <h3 className="font-display font-semibold text-lg text-neutral-950 tracking-tight">
                    {category.name}
                  </h3>
                  <span className="text-[10px] font-mono-code text-neutral-400 uppercase">
                    {categorySkills.length} Units
                  </span>
                </div>

                <div className="space-y-4">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono-code font-medium text-neutral-800">{skill.name}</span>
                        <span className="font-mono-code text-neutral-400 text-[11px]">{skill.level}%</span>
                      </div>
                      
                      {/* Minimalist Progress Meter */}
                      <div className="w-full h-1.5 bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-700 ease-out"
                          style={{ width: `${Math.min(100, Math.max(0, skill.level))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
