import React from 'react';
import { AlertCircle, Terminal, Mail } from 'lucide-react';
import { Profile, WebsiteSetting } from '../../types';

interface MaintenanceNoticeProps {
  profile: Profile;
  settings: WebsiteSetting;
}

export const MaintenanceNotice: React.FC<MaintenanceNoticeProps> = ({ profile, settings }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-lg space-y-6 border border-neutral-300 p-8 sm:p-12 shadow-sm">
        <div className="w-12 h-12 bg-black text-white flex items-center justify-center mx-auto">
          <Terminal className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono-code uppercase tracking-widest text-neutral-400">
            [ System Status // Maintenance ]
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-950">
            {profile.name}
          </h1>
          <p className="text-xs font-mono-code text-neutral-500">
            {profile.title}
          </p>
        </div>

        <p className="text-sm text-neutral-700 leading-relaxed pt-2 border-t border-neutral-200">
          {settings.maintenanceMessage ||
            'The portfolio is undergoing a scheduled structural update. Full availability will resume shortly.'}
        </p>

        <div className="pt-4 flex flex-col items-center gap-2">
          <span className="text-[11px] font-mono-code text-neutral-400 uppercase">Direct Inquiries</span>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono-code font-semibold text-neutral-950 hover:underline"
          >
            <Mail className="w-3.5 h-3.5" />
            {profile.email}
          </a>
        </div>
      </div>
    </div>
  );
};
