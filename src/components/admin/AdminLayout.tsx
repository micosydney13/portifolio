import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Sparkles,
  Briefcase,
  GraduationCap,
  Wrench,
  Inbox,
  Share2,
  Navigation,
  Palette,
  Globe,
  Settings,
  Shield,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { AppDatabase } from '../../types';
import {
  getAdminSession,
  logoutAdmin,
} from '../../lib/storage';
import { NotificationToast, ToastMessage } from '../ui/NotificationToast';

// Manager sub-views
import { AdminDashboard } from './AdminDashboard';
import { ProfileManager } from './ProfileManager';
import { ProjectsManager } from './ProjectsManager';
import { SkillsManager } from './SkillsManager';
import { ExperienceManager } from './ExperienceManager';
import { EducationManager } from './EducationManager';
import { ServicesManager } from './ServicesManager';
import { ContactMessagesManager } from './ContactMessagesManager';
import { SocialLinksManager } from './SocialLinksManager';
import { NavigationManager } from './NavigationManager';
import { AppearanceManager } from './AppearanceManager';
import { SeoManager } from './SeoManager';
import { WebsiteSettingsManager } from './WebsiteSettingsManager';
import { AccountSecurityManager } from './AccountSecurityManager';

interface AdminLayoutProps {
  data: AppDatabase;
  onRefreshData: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ data, onRefreshData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
    onRefreshData();
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const unreadMessagesCount = data.contactMessages.filter((m) => !m.read && !m.archived).length;
  const draftProjectsCount = data.projects.filter((p) => p.status === 'draft').length;

  const navMenuItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: '2. Profile Management', icon: User },
    {
      id: 'projects',
      label: '3. Projects Management',
      icon: FolderKanban,
      badge: draftProjectsCount > 0 ? `${draftProjectsCount} Drafts` : undefined,
    },
    { id: 'skills', label: '4. Skills Management', icon: Sparkles },
    { id: 'experience', label: '5. Experience Management', icon: Briefcase },
    { id: 'education', label: '6. Education & Certs', icon: GraduationCap },
    { id: 'services', label: '7. Services Management', icon: Wrench },
    {
      id: 'messages',
      label: '8. Contact Messages',
      icon: Inbox,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} Unread` : undefined,
    },
    { id: 'socials', label: '9. Social Links', icon: Share2 },
    { id: 'navigation', label: '10. Navigation & Sections', icon: Navigation },
    { id: 'appearance', label: '11. Appearance & Branding', icon: Palette },
    { id: 'seo', label: '12. SEO Settings', icon: Globe },
    { id: 'settings', label: '13. Website Settings', icon: Settings },
    { id: 'security', label: '14. Account & Security', icon: Shield },
  ];

  const currentTabItem = navMenuItems.find((item) => item.id === activeTab);

  return (
    <div className="min-h-screen bg-neutral-100 flex selection:bg-black selection:text-white">
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-neutral-200 flex-col shrink-0 fixed inset-y-0 z-30">
        
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-display font-bold text-xs tracking-wider">
              {data.branding.monogram || 'AV'}
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-neutral-900 block leading-none">
                Aethelgard CMS
              </span>
              <span className="text-[10px] font-mono-code text-neutral-400 uppercase tracking-wider block mt-1">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono-code uppercase tracking-wider text-neutral-400">
            System Modules
          </div>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono-code transition-colors text-left ${
                  isActive
                    ? 'bg-black text-white font-semibold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-none font-semibold ${
                      isActive ? 'bg-white text-black' : 'bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-neutral-200 space-y-2 bg-neutral-50/50">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 border border-neutral-300 bg-white text-xs font-mono-code text-neutral-800 hover:border-black flex items-center justify-between group transition-colors"
          >
            <span>15. View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black" />
          </a>

          <button
            onClick={() => logoutAdmin()}
            className="w-full py-2 px-3 text-xs font-mono-code text-neutral-600 hover:text-black hover:bg-neutral-200/50 flex items-center justify-between transition-colors"
          >
            <span>16. Logout Session</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-white h-full flex flex-col z-10 shadow-2xl">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <span className="font-display font-bold text-sm text-neutral-900">
                Aethelgard Core CMS
              </span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono-code transition-colors text-left ${
                      isActive
                        ? 'bg-black text-white font-semibold'
                        : 'text-neutral-700 hover:text-black hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 ${
                          isActive ? 'bg-white text-black' : 'bg-neutral-200 text-neutral-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-neutral-200 space-y-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 border border-neutral-300 text-xs font-mono-code flex items-center justify-between"
              >
                <span>View Live Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => logoutAdmin()}
                className="w-full py-2 px-3 text-xs font-mono-code text-neutral-600 hover:text-black flex items-center justify-between"
              >
                <span>Logout Session</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-neutral-600 hover:text-black border border-neutral-200"
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-neutral-950">
                {currentTabItem?.label || 'Administration'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 hover:border-black text-xs font-mono-code text-neutral-800 transition-colors"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>

            <div className="flex items-center gap-2 text-xs font-mono-code border-l border-neutral-200 pl-4">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              <span className="hidden sm:inline text-neutral-600 truncate max-w-[150px]">
                {data.profile.email}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard data={data} onNavigateTab={(tab: string) => setActiveTab(tab)} />
          )}
          {activeTab === 'profile' && (
            <ProfileManager initialProfile={data.profile} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'projects' && (
            <ProjectsManager projects={data.projects} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'skills' && (
            <SkillsManager
              categories={data.skillCategories}
              skills={data.skills}
              onSaved={(msg: string) => addToast(msg)}
            />
          )}
          {activeTab === 'experience' && (
            <ExperienceManager experiences={data.experiences} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'education' && (
            <EducationManager education={data.education} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'services' && (
            <ServicesManager services={data.services} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'messages' && (
            <ContactMessagesManager messages={data.contactMessages} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'socials' && (
            <SocialLinksManager socialLinks={data.socialLinks} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'navigation' && (
            <NavigationManager
              sectionSettings={data.sectionSettings}
              onSaved={(msg: string) => addToast(msg)}
            />
          )}
          {activeTab === 'appearance' && (
            <AppearanceManager branding={data.branding} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'seo' && (
            <SeoManager seo={data.seo} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'settings' && (
            <WebsiteSettingsManager settings={data.settings} onSaved={(msg: string) => addToast(msg)} />
          )}
          {activeTab === 'security' && (
            <AccountSecurityManager onSaved={(msg: string) => addToast(msg)} />
          )}
        </main>

      </div>

      <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />

    </div>
  );
};
