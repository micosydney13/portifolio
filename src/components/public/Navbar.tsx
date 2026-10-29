import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Profile, BrandingSetting, SectionSetting } from '../../types';

interface NavbarProps {
  profile: Profile;
  branding: BrandingSetting;
  sectionSettings: SectionSetting[];
}

export const Navbar: React.FC<NavbarProps> = ({ profile, branding, sectionSettings }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isEnabled = (key: string) => {
    const s = sectionSettings.find((sec) => sec.sectionKey === key);
    return s ? s.enabled : true;
  };

  const hasSkills = isEnabled('skills');
  const hasExp = isEnabled('experience') || isEnabled('education');
  const hasExpSkills = hasExp || hasSkills;

  const navLinks = [
    { name: 'Projects', href: '#projects', show: isEnabled('projects') },
    { name: 'Experience & Skills', href: '#experience', show: hasExpSkills },
    { name: 'About', href: '#about', show: isEnabled('about') },
    { name: 'Contact', href: '#contact', show: isEnabled('contact') },
  ].filter((item) => item.show);

  const getStatusDisplay = () => {
    switch (profile.availabilityStatus) {
      case 'available':
        return { text: 'Available for hire / projects', dot: 'bg-black' };
      case 'selective':
        return { text: 'Selectively available', dot: 'bg-neutral-600' };
      case 'busy':
        return { text: 'Currently booked', dot: 'bg-neutral-300' };
      default:
        return null;
    }
  };

  const status = getStatusDisplay();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-neutral-200 py-3 shadow-xs'
          : 'bg-white/80 backdrop-blur-xs border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-display font-semibold text-sm tracking-widest border border-black group-hover:bg-neutral-800 transition-colors">
            {branding.monogram || 'SM'}
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-medium text-sm tracking-tight text-neutral-900 block leading-none">
              {profile.name}
            </span>
            <span className="text-[11px] font-mono-code text-neutral-500 tracking-wider uppercase block mt-1">
              Portfolio
            </span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-widest font-medium text-neutral-600 hover:text-black transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {status && (
            <div className="flex items-center gap-2 px-3 py-1 border border-neutral-200 text-[11px] font-mono-code text-neutral-700 bg-neutral-50/50">
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span>{status.text}</span>
            </div>
          )}

          {isEnabled('contact') && (
            <a
              href="#contact"
              className="px-4 py-2 bg-black text-white text-xs font-medium tracking-wide hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <span>Get in touch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {status && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 border border-neutral-200 text-[10px] font-mono-code text-neutral-600">
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className="truncate max-w-[100px]">{profile.availabilityStatus}</span>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-neutral-800 hover:text-black py-1.5 border-b border-neutral-100 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <span className="text-xs text-neutral-400 font-mono-code">→</span>
              </a>
            ))}
          </nav>

          {isEnabled('contact') && (
            <div className="pt-2">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-black text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-neutral-800"
              >
                <span>Initiate Inquiry</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
