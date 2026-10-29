import React from 'react';
import { Download, CheckCircle2, Award, Terminal } from 'lucide-react';
import { Profile } from '../../types';

interface AboutProps {
  profile: Profile;
}

export const About: React.FC<AboutProps> = ({ profile }) => {
  return (
    <section id="about" className="py-24 md:py-32 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 tracking-tight">
              About & Engineering Approach
            </h2>
            <div className="w-12 h-0.5 bg-black" />
            <p className="text-sm text-neutral-500 font-mono-code leading-relaxed pt-2">
              Writing clean, tested, and scalable code across frontend web applications and backend systems with modern developer tooling.
            </p>

            {profile.resumeEnabled && profile.resumeUrl && profile.resumeUrl !== '#' && (
              <div className="pt-4">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Curriculum Vitae</span>
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="prose prose-neutral max-w-none">
              <div className="text-lg md:text-xl text-neutral-800 font-normal leading-relaxed whitespace-pre-line border-l-2 border-black pl-6 my-2">
                {profile.fullBio || profile.shortBio}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-200">
              <div className="p-6 border border-neutral-200 bg-neutral-50/50 space-y-3">
                <div className="flex items-center gap-2 text-black">
                  <Terminal className="w-4 h-4" />
                  <span className="text-xs font-mono-code uppercase tracking-wider font-semibold">Full Stack Craft</span>
                </div>
                <h4 className="text-sm font-semibold text-neutral-900">End-to-End Reliability</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Delivering complete features from responsive, accessible React interfaces down to relational PostgreSQL schemas, secure REST APIs, and automated CI/CD pipelines.
                </p>
              </div>

              <div className="p-6 border border-neutral-200 bg-neutral-50/50 space-y-3">
                <div className="flex items-center gap-2 text-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-mono-code uppercase tracking-wider font-semibold">Clean Code</span>
                </div>
                <h4 className="text-sm font-semibold text-neutral-900">Maintainable & Tested</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Prioritizing readable code, comprehensive unit and integration tests, and modular architecture that enables teams to ship software with speed and confidence.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="border border-neutral-200 p-4">
                <span className="block text-2xl font-display font-bold text-neutral-950">5+</span>
                <span className="text-[11px] font-mono-code text-neutral-500 uppercase">Years Coding</span>
              </div>
              <div className="border border-neutral-200 p-4">
                <span className="block text-2xl font-display font-bold text-neutral-950">30+</span>
                <span className="text-[11px] font-mono-code text-neutral-500 uppercase">Shipped Projects</span>
              </div>
              <div className="border border-neutral-200 p-4">
                <span className="block text-2xl font-display font-bold text-neutral-950">99.9%</span>
                <span className="text-[11px] font-mono-code text-neutral-500 uppercase">Uptime & Reliability</span>
              </div>
              <div className="border border-neutral-200 p-4">
                <span className="block text-2xl font-display font-bold text-neutral-950">100%</span>
                <span className="text-[11px] font-mono-code text-neutral-500 uppercase">Modern Best Practices</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
