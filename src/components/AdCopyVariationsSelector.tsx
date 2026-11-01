import React from 'react';
import { AdCopyVariation } from '../types';
import { Sparkles, CheckCircle2, ArrowRight, Layers, Tag } from 'lucide-react';

interface AdCopyVariationsSelectorProps {
  variations?: AdCopyVariation[];
  activeVariationId?: string;
  onSelectVariation: (variation: AdCopyVariation) => void;
  accentColor?: string;
}

export const AdCopyVariationsSelector: React.FC<AdCopyVariationsSelectorProps> = ({
  variations = [],
  activeVariationId,
  onSelectVariation,
  accentColor = '#38BDF8',
}) => {
  if (!variations || variations.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {variations.length} Persuasive Variations Generated
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Optimized for distinct audience psychological triggers & CTAs
            </span>
          </div>
          <h3 className="font-bold text-base md:text-lg text-slate-900">
            Ad Copy & Angle Variations
          </h3>
          <p className="text-xs text-slate-500">
            Click any variation to instantly apply its headlines, body copy, and CTA across all 11 banner formats below.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0 self-start sm:self-auto">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Real-Time Ad Synchronization</span>
        </div>
      </div>

      {/* Variations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {variations.map((v, index) => {
          const isActive = activeVariationId === v.id || (!activeVariationId && index === 0);
          return (
            <div
              key={v.id}
              onClick={() => onSelectVariation(v)}
              className={`rounded-xl border p-4 transition-all cursor-pointer flex flex-col justify-between relative group ${
                isActive
                  ? 'bg-indigo-50/40 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div>
                {/* Variation Top Bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Var {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate" title={v.angle}>
                      {v.angle}
                    </span>
                  </div>
                  {isActive ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">
                      Apply &rarr;
                    </span>
                  )}
                </div>

                {/* Main Headline */}
                <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1.5">
                  &ldquo;{v.headline}&rdquo;
                </h4>

                {/* Subheadline / Body Copy */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                  {v.subheadline}
                </p>
              </div>

              {/* Badges and CTA snippet */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 mt-auto">
                <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[130px] flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                  {v.badgeText}
                </span>

                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 shadow-2xs"
                  style={{
                    backgroundColor: accentColor,
                    color: '#0F172A',
                  }}
                >
                  {v.ctaText}
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
