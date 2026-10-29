import React, { useState } from 'react';
import { Briefcase, GraduationCap, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { Experience, Education } from '../../types';

interface ExperienceEducationProps {
  experiences: Experience[];
  education: Education[];
  unitedWithSkills?: boolean;
}

export const ExperienceEducation: React.FC<ExperienceEducationProps> = ({
  experiences,
  education,
  unitedWithSkills = false,
}) => {
  const publishedExp = experiences.filter((e) => e.published);
  const publishedEdu = education.filter((e) => e.published);

  const hasExp = publishedExp.length > 0;
  const hasEdu = publishedEdu.length > 0;
  const isBoth = hasExp && hasEdu;

  const [activeTab, setActiveTab] = useState<'all' | 'experience' | 'education'>('all');

  if (!hasExp && !hasEdu) return null;

  const sectionTitle = isBoth
    ? 'Experience & Credentials'
    : hasExp
    ? 'Professional Experience'
    : 'Education & Credentials';

  const sectionDesc = isBoth
    ? 'Professional career track record across full-stack development, software engineering roles, and academic credentials.'
    : hasExp
    ? 'Professional career track record across full-stack software development and feature engineering.'
    : 'Computer science degrees, technical certifications, and verified credentials.';

  return (
    <section
      id="experience"
      className={`py-24 md:py-32 ${unitedWithSkills ? '' : 'border-b border-neutral-200'}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 tracking-tight">
              {sectionTitle}
            </h2>
            <div className="w-12 h-0.5 bg-black" />
            <p className="text-sm text-neutral-600 max-w-xl">
              {sectionDesc}
            </p>
          </div>

          {/* Tab filter - only shown when both categories have data */}
          {isBoth && (
            <div className="flex items-center gap-1 border border-neutral-200 p-1 bg-neutral-50 self-start md:self-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-mono-code uppercase tracking-wider transition-colors ${
                  activeTab === 'all' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                }`}
              >
                All Records
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`px-3 py-1.5 text-xs font-mono-code uppercase tracking-wider transition-colors ${
                  activeTab === 'experience' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Experience ({publishedExp.length})
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`px-3 py-1.5 text-xs font-mono-code uppercase tracking-wider transition-colors ${
                  activeTab === 'education' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Education ({publishedEdu.length})
              </button>
            </div>
          )}
        </div>

        {/* Content Columns / Structured Timeline */}
        <div
          className={`grid grid-cols-1 ${
            isBoth && activeTab === 'all'
              ? 'lg:grid-cols-2 gap-12 lg:gap-16'
              : 'max-w-4xl'
          }`}
        >
          
          {/* Work Experience Column */}
          {hasExp && (activeTab === 'all' || activeTab === 'experience' || !isBoth) && (
            <div className="space-y-8">
              <div className="flex items-center gap-2 pb-3 border-b border-black">
                <Briefcase className="w-4 h-4 text-black" />
                <h3 className="font-display font-semibold text-lg text-neutral-950 tracking-tight">
                  Professional Experience
                </h3>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-px before:bg-neutral-200">
                {publishedExp.map((exp) => (
                  <div key={exp.id} className="relative pl-10 group">
                    {/* Minimalist Timeline Dot */}
                    <div className="absolute left-2.5 top-1.5 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-black group-hover:bg-black transition-colors" />

                    <div className="space-y-2 border border-neutral-200 p-6 bg-white hover:border-black transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono-code uppercase tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-800">
                          {exp.period}
                        </span>
                        {exp.current && (
                          <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 bg-black text-white">
                            Current
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-display font-bold text-neutral-950">
                        {exp.role}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 font-mono-code">
                        <span className="text-neutral-900 font-medium">{exp.company}</span>
                        {exp.location && (
                          <>
                            <span>/</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed pt-2">
                        {exp.description}
                      </p>

                      {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                        <ul className="pt-2 space-y-1.5 text-xs text-neutral-600 list-disc list-inside">
                          {exp.bulletPoints.map((bp, i) => (
                            <li key={i} className="leading-relaxed">
                              {bp}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education & Credentials Column */}
          {hasEdu && (activeTab === 'all' || activeTab === 'education' || !isBoth) && (
            <div className="space-y-8">
              <div className="flex items-center gap-2 pb-3 border-b border-black">
                <GraduationCap className="w-4 h-4 text-black" />
                <h3 className="font-display font-semibold text-lg text-neutral-950 tracking-tight">
                  Education & Certifications
                </h3>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-px before:bg-neutral-200">
                {publishedEdu.map((edu) => (
                  <div key={edu.id} className="relative pl-10 group">
                    {/* Timeline Dot */}
                    <div className="absolute left-2.5 top-1.5 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-black group-hover:bg-black transition-colors" />

                    <div className="space-y-2 border border-neutral-200 p-6 bg-white hover:border-black transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono-code uppercase tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-800">
                          {edu.year}
                        </span>
                        {edu.credentialUrl && (
                          <a
                            href={edu.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-mono-code text-neutral-600 hover:text-black flex items-center gap-1 underline"
                          >
                            <span>Verify</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <h4 className="text-base font-display font-bold text-neutral-950">
                        {edu.degree}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 font-mono-code">
                        <span className="text-neutral-900 font-medium">{edu.institution}</span>
                        {edu.location && (
                          <>
                            <span>/</span>
                            <span>{edu.location}</span>
                          </>
                        )}
                      </div>

                      {edu.description && (
                        <p className="text-xs text-neutral-600 leading-relaxed pt-2">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
