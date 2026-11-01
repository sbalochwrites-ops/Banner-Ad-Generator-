import React, { useState } from 'react';
import { BannerAdState, ProductInput } from '../types';
import { saveCustomTemplate, CustomTemplate } from '../utils/templateStorage';
import { Bookmark, X, Check, Sparkles, Palette, Image as ImageIcon } from 'lucide-react';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: BannerAdState;
  input: ProductInput;
  onSaved: (template: CustomTemplate) => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  state,
  input,
  onSaved,
}) => {
  const [name, setName] = useState<string>(
    `${state.copy.brandName || 'My Campaign'} Template`
  );
  const [badge, setBadge] = useState<string>('Custom');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved = saveCustomTemplate(name, badge, input, state);
    onSaved(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Save as Custom Preset Template
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save logo, brand colors, copy, prompt, and layout configs to reuse anytime.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q4 Growth Campaign Template"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Badge Label (Optional)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Custom, Q4 Promo, Retargeting"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Snapshot Summary of what is being saved */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-2.5 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Template Snapshot Contents
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="truncate">
                  Brand: <strong>{state.copy.brandName || 'Untitled'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">
                  Logo: <strong>{state.logoUrl ? 'Included (SVG/Image)' : 'None'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">
                  Colors: <strong>4 custom hex values</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                <span className="truncate">
                  Variations: <strong>{state.variations?.length || 1} copy angles</strong>
                </span>
              </div>
            </div>

            {/* Color Swatch Preview */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400">Palette:</span>
              <div className="flex items-center -space-x-1">
                <div
                  className="w-4 h-4 rounded-full border border-white dark:border-slate-900"
                  style={{ backgroundColor: state.style.primaryColor }}
                  title="Primary"
                />
                <div
                  className="w-4 h-4 rounded-full border border-white dark:border-slate-900"
                  style={{ backgroundColor: state.style.secondaryColor }}
                  title="Secondary"
                />
                <div
                  className="w-4 h-4 rounded-full border border-white dark:border-slate-900"
                  style={{ backgroundColor: state.style.accentColor }}
                  title="Accent"
                />
                <div
                  className="w-4 h-4 rounded-full border border-white dark:border-slate-900"
                  style={{ backgroundColor: state.style.backgroundColor }}
                  title="Background"
                />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-auto truncate max-w-[170px]">
                {state.style.accentColor} / {state.style.backgroundColor}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Preset Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
