import React, { useState } from 'react';
import { AdSizeDefinition, BannerAdState, BannerAdCopy, BannerAdStyle } from '../types';
import { X, Check, RefreshCw, Palette, Type, Sliders, Sparkles } from 'lucide-react';

interface BannerCustomizerModalProps {
  adSize: AdSizeDefinition | null;
  state: BannerAdState;
  onSave: (updatedState: BannerAdState, applyToAll: boolean) => void;
  onClose: () => void;
}

const COLOR_PALETTES = [
  {
    name: 'CloudVault Blue',
    primary: '#2563EB',
    secondary: '#06B6D4',
    accent: '#38BDF8',
    bg: '#0A0F1D',
  },
  {
    name: 'Electric Neon',
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#F43F5E',
    bg: '#0F091F',
  },
  {
    name: 'Emerald FinTech',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#34D399',
    bg: '#061712',
  },
  {
    name: 'Amber Gold',
    primary: '#D97706',
    secondary: '#B45309',
    accent: '#FBBF24',
    bg: '#17120A',
  },
  {
    name: 'Obsidian Minimal',
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#F8FAFC',
    bg: '#020617',
  },
];

export const BannerCustomizerModal: React.FC<BannerCustomizerModalProps> = ({
  adSize,
  state,
  onSave,
  onClose,
}) => {
  const [copy, setCopy] = useState<BannerAdCopy>({ ...state.copy });
  const [style, setStyle] = useState<BannerAdStyle>({ ...state.style });
  const [applyToAll, setApplyToAll] = useState(true);
  const [activeTab, setActiveTab] = useState<'copy' | 'style'>('copy');

  const handleApplyPalette = (palette: typeof COLOR_PALETTES[0]) => {
    setStyle((prev) => ({
      ...prev,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
      backgroundColor: palette.bg,
    }));
  };

  const handleSave = () => {
    onSave(
      {
        ...state,
        copy,
        style,
      },
      applyToAll
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Customize Banner Creative
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {adSize ? `Editing for ${adSize.name} (${adSize.width}×${adSize.height})` : 'Global Banner Customizer'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/40 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('copy')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'copy'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Type className="w-4 h-4" />
            Ad Copy & Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('style')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'style'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Palette className="w-4 h-4" />
            Colors & Overlays
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'copy' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={copy.brandName}
                    onChange={(e) => setCopy({ ...copy, brandName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Incentive / Badge Text
                  </label>
                  <input
                    type="text"
                    value={copy.badgeText}
                    onChange={(e) => setCopy({ ...copy, badgeText: e.target.value })}
                    placeholder="e.g. 15GB Free Forever"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Main Headline (Medium & Large Banners)
                </label>
                <input
                  type="text"
                  value={copy.headline}
                  onChange={(e) => setCopy({ ...copy, headline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Short Headline (Mobile 320×50 & Thin Skyscraper)
                </label>
                <input
                  type="text"
                  value={copy.shortHeadline}
                  onChange={(e) => setCopy({ ...copy, shortHeadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Subheadline / Benefit Statement
                </label>
                <textarea
                  rows={2}
                  value={copy.subheadline}
                  onChange={(e) => setCopy({ ...copy, subheadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Call To Action (CTA Button)
                  </label>
                  <input
                    type="text"
                    value={copy.ctaText}
                    onChange={(e) => setCopy({ ...copy, ctaText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Display Domain
                  </label>
                  <input
                    type="text"
                    value={copy.urlDisplay}
                    onChange={(e) => setCopy({ ...copy, urlDisplay: e.target.value })}
                    placeholder="cloudvault.app"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Palette presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Quick Color Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COLOR_PALETTES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPalette(p)}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-left transition-all cursor-pointer flex flex-col gap-1.5 shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: p.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: p.accent }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: p.bg }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual color pickers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Primary Brand
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.primaryColor}
                      onChange={(e) => setStyle({ ...style, primaryColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={style.primaryColor}
                      onChange={(e) => setStyle({ ...style, primaryColor: e.target.value })}
                      className="w-20 px-2 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    CTA / Accent
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.accentColor}
                      onChange={(e) => setStyle({ ...style, accentColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={style.accentColor}
                      onChange={(e) => setStyle({ ...style, accentColor: e.target.value })}
                      className="w-20 px-2 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.backgroundColor}
                      onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={style.backgroundColor}
                      onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                      className="w-20 px-2 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.textColor}
                      onChange={(e) => setStyle({ ...style, textColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={style.textColor}
                      onChange={(e) => setStyle({ ...style, textColor: e.target.value })}
                      className="w-20 px-2 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Overlay darkness */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  <span>Image Darkness Overlay (Contrast Guard)</span>
                  <span className="font-mono text-indigo-600 font-bold">
                    {Math.round(style.overlayOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.9"
                  step="0.05"
                  value={style.overlayOpacity}
                  onChange={(e) => setStyle({ ...style, overlayOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Brighter Image (Less contrast)</span>
                  <span>Darker (Maximum text readability)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>Apply updates across all 11 standard banner sizes</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
