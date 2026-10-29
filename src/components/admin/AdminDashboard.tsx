import React from 'react';
import {
  FolderKanban,
  FileEdit,
  Sparkles,
  Inbox,
  ArrowUpRight,
  PlusCircle,
  User,
  Clock,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AppDatabase } from '../../types';

interface AdminDashboardProps {
  data: AppDatabase;
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onNavigateTab }) => {
  const publishedProjects = data.projects.filter((p) => p.status === 'published').length;
  const draftProjects = data.projects.filter((p) => p.status === 'draft').length;
  const totalSkills = data.skills.length;
  const totalMessages = data.contactMessages.length;
  const unreadMessages = data.contactMessages.filter((m) => !m.read).length;

  // Real recent messages
  const recentMessages = data.contactMessages.slice(0, 3);

  // Real recent project updates
  const recentProjects = [...data.projects]
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner / Welcome */}
      <div className="border border-neutral-300 p-6 sm:p-8 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            <span className="text-xs font-mono-code text-neutral-500 uppercase tracking-widest">
              Live Core CMS Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-950 tracking-tight">
            System Overview & Metrics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-mono-code">
            Authenticated administrator: <span className="font-semibold text-neutral-950">{data.profile.email}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('projects')}
            className="px-4 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Project</span>
          </button>
          <button
            onClick={() => onNavigateTab('profile')}
            className="px-4 py-2.5 bg-white text-black border border-neutral-300 text-xs uppercase tracking-wider font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => onNavigateTab('messages')}
            className="px-4 py-2.5 bg-white text-black border border-neutral-300 text-xs uppercase tracking-wider font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2"
          >
            <Inbox className="w-4 h-4" />
            <span>Read Enquiries ({unreadMessages})</span>
          </button>
        </div>
      </div>

      {/* Real Real-Time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Published Projects */}
        <div className="border border-neutral-200 bg-white p-6 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-mono-code uppercase tracking-wider">Published Projects</span>
            <FolderKanban className="w-4 h-4 text-black" />
          </div>
          <div className="text-3xl font-display font-bold text-neutral-950">{publishedProjects}</div>
          <div className="text-xs text-neutral-500 font-mono-code flex items-center justify-between">
            <span>Live on public site</span>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-black font-semibold hover:underline"
            >
              Manage →
            </button>
          </div>
        </div>

        {/* Draft Projects */}
        <div className="border border-neutral-200 bg-white p-6 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-mono-code uppercase tracking-wider">Draft Projects</span>
            <FileEdit className="w-4 h-4 text-black" />
          </div>
          <div className="text-3xl font-display font-bold text-neutral-950">{draftProjects}</div>
          <div className="text-xs text-neutral-500 font-mono-code flex items-center justify-between">
            <span>Hidden from visitors</span>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-black font-semibold hover:underline"
            >
              Review →
            </button>
          </div>
        </div>

        {/* Active Skills */}
        <div className="border border-neutral-200 bg-white p-6 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-mono-code uppercase tracking-wider">Technical Skills</span>
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div className="text-3xl font-display font-bold text-neutral-950">{totalSkills}</div>
          <div className="text-xs text-neutral-500 font-mono-code flex items-center justify-between">
            <span>Across {data.skillCategories.length} categories</span>
            <button
              onClick={() => onNavigateTab('skills')}
              className="text-black font-semibold hover:underline"
            >
              Configure →
            </button>
          </div>
        </div>

        {/* Enquiries & Unread */}
        <div className="border border-neutral-200 bg-white p-6 space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-mono-code uppercase tracking-wider">Inquiries Received</span>
            <Inbox className="w-4 h-4 text-black" />
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-display font-bold text-neutral-950">{totalMessages}</div>
            {unreadMessages > 0 && (
              <span className="text-xs font-mono-code px-2 py-0.5 bg-black text-white font-semibold">
                {unreadMessages} Unread
              </span>
            )}
          </div>
          <div className="text-xs text-neutral-500 font-mono-code flex items-center justify-between">
            <span>Stored in database</span>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-black font-semibold hover:underline"
            >
              Inbox →
            </button>
          </div>
        </div>

      </div>

      {/* Two Column Section: Recent Messages & Content Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Inquiries List */}
        <div className="border border-neutral-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-display font-semibold text-base text-neutral-950">
              Recent Visitor Enquiries
            </h3>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-mono-code text-neutral-600 hover:text-black underline uppercase"
            >
              View All ({totalMessages})
            </button>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-xs font-mono-code text-neutral-500 py-6 text-center">
              No inquiries received yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => onNavigateTab('messages')}
                  className={`p-3.5 border transition-colors cursor-pointer ${
                    !msg.read ? 'border-black bg-neutral-50/80' : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900">{msg.name}</span>
                    <span className="text-[11px] font-mono-code text-neutral-400">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-neutral-800 truncate mt-1">
                    {msg.subject}
                  </div>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Project Records */}
        <div className="border border-neutral-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-display font-semibold text-base text-neutral-950">
              Recent Projects Ledger
            </h3>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs font-mono-code text-neutral-600 hover:text-black underline uppercase"
            >
              Manage Projects ({data.projects.length})
            </button>
          </div>

          <div className="space-y-3">
            {recentProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigateTab('projects')}
                className="p-3.5 border border-neutral-200 hover:border-black transition-colors bg-white flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-8 shrink-0 bg-neutral-100 overflow-hidden border border-neutral-200">
                    <img src={proj.coverImage} alt="" className="w-full h-full object-cover filter grayscale" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-neutral-900 truncate">{proj.title}</h4>
                    <span className="text-[10px] font-mono-code text-neutral-400 uppercase">
                      {proj.category} // {proj.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono-code uppercase px-2 py-0.5 ${
                      proj.status === 'published'
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Database & Architecture Status Strip */}
      <div className="border border-neutral-200 bg-neutral-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono-code text-neutral-600">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-black" />
          <span>
            Database State: {data.settings.supabaseConfigured ? 'Supabase PostgreSQL Linked' : 'Active In-Browser Persistent Storage'}
          </span>
        </div>
        <button
          onClick={() => onNavigateTab('settings')}
          className="text-black underline uppercase tracking-wider font-medium hover:text-neutral-700 self-start sm:self-auto"
        >
          Inspect Database & SQL Configuration →
        </button>
      </div>

    </div>
  );
};
