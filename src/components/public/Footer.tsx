import React from 'react';
import { ArrowUp, Download } from 'lucide-react';
import { Profile, BrandingSetting, SocialLink } from '../../types';

interface FooterProps {
  profile: Profile;
  branding: BrandingSetting;
  socialLinks: SocialLink[];
}

export const Footer: React.FC<FooterProps> = ({ profile, branding, socialLinks }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visibleSocials = socialLinks.filter((s) => s.visible);

  return (
    <footer className="bg-white border-t border-neutral-200 py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-neutral-100">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-display font-bold text-xs tracking-widest">
                {branding.monogram || 'SM'}
              </div>
              <span className="font-display font-bold text-neutral-950 text-base">
                {profile.name}
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-mono-code">
              {profile.title}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {visibleSocials.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono-code uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
              >
                {link.platform}
              </a>
            ))}

            {profile.resumeEnabled && profile.resumeUrl && profile.resumeUrl !== '#' && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono-code uppercase tracking-wider text-neutral-900 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Résumé</span>
              </a>
            )}

            <button
              onClick={scrollToTop}
              className="p-2 border border-neutral-200 hover:border-black text-neutral-600 hover:text-black transition-colors"
              aria-label="Scroll back to top"
              title="Return to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono-code text-neutral-400">
          <div>
            © {currentYear} {profile.name}. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
};
