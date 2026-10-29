import React from 'react';
import { ArrowDown, ArrowUpRight, Download, Mail, MapPin } from 'lucide-react';
import { Profile, BrandingSetting } from '../../types';

interface HeroProps {
  profile: Profile;
  branding: BrandingSetting;
}

export const Hero: React.FC<HeroProps> = ({ profile }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            <div className="inline-flex items-center gap-3 px-3 py-1.5 border border-neutral-200 bg-neutral-50/70 text-xs font-mono-code text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span>{profile.title}</span>
              {profile.location && (
                <>
                  <span className="text-neutral-300">/</span>
                  <span className="flex items-center gap-1 text-neutral-500">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </span>
                </>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-neutral-950 leading-[1.08]">
                {profile.name}
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-neutral-600 font-normal leading-snug tracking-tight max-w-3xl">
                {profile.heroHeading || profile.shortBio}
              </p>
            </div>

            <p className="text-base text-neutral-600 font-normal leading-relaxed max-w-2xl">
              {profile.heroSubheading || profile.shortBio}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#projects"
                className="px-6 py-3.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-all flex items-center gap-2 group shadow-sm"
              >
                <span>View Projects</span>
                <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href="#contact"
                className="px-6 py-3.5 bg-white text-black border border-neutral-300 text-xs uppercase tracking-widest font-medium hover:bg-neutral-50 hover:border-black transition-all flex items-center gap-2 group"
              >
                <span>Get in touch</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {profile.resumeEnabled && profile.resumeUrl && profile.resumeUrl !== '#' && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3.5 text-neutral-700 hover:text-black border border-transparent hover:border-neutral-200 text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Curriculum Vitae</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="relative w-full max-w-xs md:max-w-sm group">
              <div className="absolute -inset-2 border border-neutral-200 pointer-events-none group-hover:border-neutral-400 transition-colors duration-500" />
              
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 border border-neutral-300">
                <img
                  src={profile.profileImage}
                  alt={profile.name}
                  className="w-full h-full object-cover filter grayscale contrast-110 group-hover:scale-[1.03] transition-transform duration-700"
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono-code text-neutral-500 px-1">
                <span>FULL STACK DEVELOPER</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-neutral-400" />
                  {profile.email}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
