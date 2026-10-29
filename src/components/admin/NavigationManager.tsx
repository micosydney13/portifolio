import React, { useState } from 'react';
import { Layers, Eye, EyeOff, Save, ArrowUpDown } from 'lucide-react';
import { SectionSetting } from '../../types';
import { updateSectionSettings } from '../../lib/storage';

interface NavigationManagerProps {
  sectionSettings: SectionSetting[];
  onSaved: (msg: string) => void;
}

export const NavigationManager: React.FC<NavigationManagerProps> = ({ sectionSettings, onSaved }) => {
  const [sections, setSections] = useState<SectionSetting[]>(sectionSettings);

  const handleToggle = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: newLabel } : s))
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // re-assign display orders
    const updated = copy.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    setSections(updated);
  };

  const handleSaveAll = async () => {
    await updateSectionSettings(sections);
    onSaved('Navigation and public sections configuration saved successfully.');
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Navigation & Public Section Configuration
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Toggle visibility and reorder architectural sections shown on the public portfolio.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Configuration</span>
        </button>
      </div>

      <div className="bg-white border border-neutral-200 divide-y divide-neutral-100 shadow-xs">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className={`p-4 flex items-center justify-between gap-4 transition-colors ${
              section.enabled ? 'bg-white' : 'bg-neutral-50/60 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Order Controls */}
              <div className="flex flex-col items-center gap-1 font-mono-code text-neutral-400">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="hover:text-black disabled:opacity-20 text-[10px]"
                >
                  ▲
                </button>
                <span className="text-xs">{idx + 1}</span>
                <button
                  type="button"
                  disabled={idx === sections.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="hover:text-black disabled:opacity-20 text-[10px]"
                >
                  ▼
                </button>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono-code uppercase text-neutral-400">
                  KEY: #{section.sectionKey}
                </span>
                <input
                  type="text"
                  value={section.label}
                  onChange={(e) => handleLabelChange(section.id, e.target.value)}
                  className="px-2 py-1 text-xs font-medium border border-transparent hover:border-neutral-300 focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-mono-code uppercase px-2 py-0.5 ${
                  section.enabled ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {section.enabled ? 'Rendered' : 'Disabled'}
              </span>

              <button
                type="button"
                onClick={() => handleToggle(section.id)}
                className="p-1.5 border border-neutral-200 hover:border-black text-neutral-700"
                title={section.enabled ? 'Hide Section' : 'Show Section'}
              >
                {section.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-neutral-400" />}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
