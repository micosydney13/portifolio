import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppDatabase } from './types';
import { initialDatabase } from './lib/defaultData';
import { subscribeToDataChanges, getAdminSession, logoutAdmin } from './lib/storage';

// Public Components
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { About } from './components/public/About';
import { ProjectsGrid } from './components/public/ProjectsGrid';
import { SkillsSection } from './components/public/SkillsSection';
import { ExperienceEducation } from './components/public/ExperienceEducation';
import { ServicesSection } from './components/public/ServicesSection';
import { ContactSection } from './components/public/ContactSection';
import { Footer } from './components/public/Footer';
import { MaintenanceNotice } from './components/public/MaintenanceNotice';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';

const DB_STORAGE_KEY = 'aethelgard_portfolio_database_v3';

function sanitizeDatabase(data: any): AppDatabase {
  try {
    let json = JSON.stringify(data);
    if (json.includes('Alexander Vance') || json.includes('Sydney Mico')) {
      json = json
        .replaceAll('Alexander Vance — Software Architect & Interface Engineer', 'Mico Sydney — Full Stack Software Developer')
        .replaceAll('Alexander Vance — Portfolio & Engineering Archive', 'Mico Sydney — Full Stack Software Developer')
        .replaceAll('Alexander Vance', 'Mico Sydney')
        .replaceAll('Sydney Mico', 'Mico Sydney')
        .replaceAll('alexander.vance@studio-vance.io', 'MicoSydney13@gmail.com');
      return JSON.parse(json);
    }
  } catch (e) {
    console.error('Failed to sanitize database in App:', e);
  }
  return data;
}

function loadDatabaseState(): AppDatabase {
  try {
    ['aethelgard_portfolio_database_v2', 'aethelgard_portfolio_database'].forEach((oldKey) => {
      try {
        const oldRaw = localStorage.getItem(oldKey);
        if (oldRaw && (oldRaw.includes('Alexander Vance') || oldRaw.includes('Sydney Mico'))) {
          localStorage.removeItem(oldKey);
        }
      } catch {
        // ignore
      }
    });

    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialDatabase));
      return initialDatabase;
    }
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeDatabase(parsed);
    const merged: AppDatabase = {
      ...initialDatabase,
      ...sanitized,
      profile: { ...initialDatabase.profile, ...(sanitized.profile || {}) },
      branding: { ...initialDatabase.branding, ...(sanitized.branding || {}) },
      seo: { ...initialDatabase.seo, ...(sanitized.seo || {}) },
      settings: { ...initialDatabase.settings, ...(sanitized.settings || {}) },
    };

    if (JSON.stringify(parsed) !== JSON.stringify(merged)) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return initialDatabase;
  }
}

const PublicPortfolio: React.FC<{ data: AppDatabase }> = ({ data }) => {
  const [adminSession, setAdminSession] = useState(() => getAdminSession());

  useEffect(() => {
    // Keyboard shortcut: Ctrl+Shift+A or Cmd+Shift+A to jump to Admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        window.location.href = '/admin';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (data.settings.maintenanceMode) {
    return <MaintenanceNotice profile={data.profile} settings={data.settings} />;
  }

  const sortedSections = [...data.sectionSettings].sort((a, b) => a.displayOrder - b.displayOrder);

  const renderedSections: React.ReactNode[] = [];
  let trajectoryRendered = false;

  for (const section of sortedSections) {
    if (!section.enabled) continue;

    switch (section.sectionKey) {
      case 'hero':
        renderedSections.push(
          <Hero key={section.id} profile={data.profile} branding={data.branding} />
        );
        break;
      case 'about':
        renderedSections.push(<About key={section.id} profile={data.profile} />);
        break;
      case 'projects':
        renderedSections.push(<ProjectsGrid key={section.id} projects={data.projects} />);
        break;
      case 'skills':
      case 'experience':
      case 'education': {
        if (!trajectoryRendered) {
          trajectoryRendered = true;
          const expSection = data.sectionSettings.find((s) => s.sectionKey === 'experience');
          const eduSection = data.sectionSettings.find((s) => s.sectionKey === 'education');
          const skillsSection = data.sectionSettings.find((s) => s.sectionKey === 'skills');
          const showExp = expSection ? expSection.enabled : true;
          const showEdu = eduSection ? eduSection.enabled : true;
          const showSkills = skillsSection ? skillsSection.enabled : true;

          if (showExp || showEdu || showSkills) {
            renderedSections.push(
              <div key="section-experience-skills-block" id="experience" className="scroll-mt-14">
                {(showExp || showEdu) && (
                  <ExperienceEducation
                    experiences={showExp ? data.experiences : []}
                    education={showEdu ? data.education : []}
                    unitedWithSkills={showSkills}
                  />
                )}
                {showSkills && (
                  <SkillsSection
                    categories={data.skillCategories}
                    skills={data.skills}
                    embedded={showExp || showEdu}
                  />
                )}
              </div>
            );
          }
        }
        break;
      }
      case 'services':
        renderedSections.push(<ServicesSection key={section.id} services={data.services} />);
        break;
      case 'contact':
        renderedSections.push(
          <ContactSection
            key={section.id}
            profile={data.profile}
            socialLinks={data.socialLinks}
            settings={data.settings}
          />
        );
        break;
      default:
        break;
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-black selection:text-white">
      {adminSession && (
        <div className="bg-black text-white text-xs font-mono-code px-6 py-2 flex items-center justify-between border-b border-neutral-800 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-neutral-400">ADMIN SESSION:</span>
            <span className="font-semibold">{adminSession.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="px-2.5 py-0.5 bg-white text-black font-semibold text-[11px] uppercase hover:bg-neutral-200 transition-colors"
            >
              CMS Console →
            </a>
            <button
              onClick={() => logoutAdmin()}
              className="text-neutral-400 hover:text-white underline text-[11px] uppercase transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <Navbar
        profile={data.profile}
        branding={data.branding}
        sectionSettings={data.sectionSettings}
      />

      <main>{renderedSections}</main>

      <Footer
        profile={data.profile}
        branding={data.branding}
        socialLinks={data.socialLinks}
      />
    </div>
  );
};

export default function App() {
  const [database, setDatabase] = useState<AppDatabase>(() => loadDatabaseState());

  const reloadData = () => {
    setDatabase(loadDatabaseState());
  };

  useEffect(() => {
    const unsubscribe = subscribeToDataChanges(() => {
      reloadData();
    });

    const rawTitle = database.seo?.pageTitle || '';
    const cleanTitle = rawTitle.includes('Alexander Vance') || rawTitle.includes('Sydney Mico')
      ? rawTitle
          .replaceAll('Alexander Vance — Software Architect & Interface Engineer', 'Mico Sydney — Full Stack Software Developer')
          .replaceAll('Alexander Vance', 'Mico Sydney')
          .replaceAll('Sydney Mico', 'Mico Sydney')
      : rawTitle || 'Mico Sydney — Full Stack Software Developer';

    document.title = cleanTitle;

    return () => unsubscribe();
  }, [database.seo?.pageTitle]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPortfolio data={database} />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={<AdminLayout data={database} onRefreshData={reloadData} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
