import React, { useState, useRef, useEffect } from 'react';
import { BannerAdState, AdSizeDefinition } from '../types';
import { calculateCtrScore, FORMAT_CTR_MULTIPLIERS } from '../utils/ctrScoring';
import {
  TrendingUp,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Target,
  BarChart2,
  Zap,
} from 'lucide-react';

interface CtrIndicatorWidgetProps {
  state: BannerAdState;
  selectedSize?: AdSizeDefinition | null;
  className?: string;
  isCompact?: boolean;
}

export const CtrIndicatorWidget: React.FC<CtrIndicatorWidgetProps> = ({
  state,
  selectedSize,
  className = '',
  isCompact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const multiplier = selectedSize
    ? FORMAT_CTR_MULTIPLIERS[selectedSize.id] || 1.0
    : 1.0;
  const metrics = calculateCtrScore(state, multiplier);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Persistent Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer select-none text-left ${
          metrics.engagementScore >= 85
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15'
            : metrics.engagementScore >= 70
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15'
        }`}
        title="View simulated CTR and engagement potential breakdown"
      >
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
            <span className="text-xs font-black font-mono tracking-tight">
              {metrics.estimatedCtr}% Est. CTR
            </span>
            {!isCompact && (
              <span className="text-[10px] font-semibold opacity-85 hidden md:inline">
                ({metrics.vsBenchmarkMultiplier})
              </span>
            )}
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
            metrics.engagementScore >= 85
              ? 'bg-emerald-600 text-white'
              : metrics.engagementScore >= 70
              ? 'bg-blue-600 text-white'
              : 'bg-amber-600 text-white'
          }`}
        >
          {metrics.engagementScore}/100
        </span>

        <HelpCircle className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
      </button>

      {/* Floating Rich Tooltip / Popover */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 z-50 w-[340px] sm:w-[380px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">
                  Simulated CTR & Engagement Engine
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time algorithmic scoring calibrated on display ad datasets
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Metric Hero */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Predicted Click-Through Rate
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {metrics.estimatedCtr}%
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {metrics.vsBenchmarkMultiplier}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                vs. 0.55% Google Display Network industry benchmark
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Index Score
              </span>
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {metrics.engagementScore}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {metrics.tierLabel}
              </span>
            </div>
          </div>

          {/* Ad Size context if provided */}
          {selectedSize && (
            <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-800 dark:text-indigo-300 flex items-center justify-between">
              <span>Layout: <strong>{selectedSize.name}</strong> ({selectedSize.width}x{selectedSize.height})</span>
              <span className="font-mono font-bold">{(multiplier * 100).toFixed(0)}% format weight</span>
            </div>
          )}

          {/* Sub-Score Breakdown Bars */}
          <div className="mt-4 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
              Scoring Diagnostics
            </span>

            {/* Copy Clarity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Headline Clarity & Punch
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {metrics.breakdown.copyClarity}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.breakdown.copyClarity}%` }}
                />
              </div>
            </div>

            {/* CTA Drive */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  CTA Action Orientation
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {metrics.breakdown.ctaDrive}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.breakdown.ctaDrive}%` }}
                />
              </div>
            </div>

            {/* Visual Contrast */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Button & Canvas Saliency
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {metrics.breakdown.visualContrast}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.breakdown.visualContrast}%` }}
                />
              </div>
            </div>

            {/* Value Offer */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Value Badge Pre-qualification
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {metrics.breakdown.valueOffer}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.breakdown.valueOffer}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Strengths & Suggestions */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="space-y-1">
              {metrics.strengths.slice(0, 2).map((strength, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>

            {metrics.suggestions.length > 0 && (
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Tip: {metrics.suggestions[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
