import React, { useState, useRef, useEffect } from 'react';
import { AdSizeDefinition, BannerAdState } from '../types';
import { AdDisplayRenderer } from './AdDisplayRenderer';
import { downloadBannerPng, generateEmbedSnippet } from '../utils/canvasExport';
import { calculateCtrScore, FORMAT_CTR_MULTIPLIERS } from '../utils/ctrScoring';
import {
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Sliders,
  Eye,
  TrendingUp,
} from 'lucide-react';

interface BannerCardProps {
  adSize: AdSizeDefinition;
  state: BannerAdState;
  onOpenCustomizer: (adSize: AdSizeDefinition) => void;
  onOpenMockup: (adSize: AdSizeDefinition) => void;
  onOpenImageGen: (adSize: AdSizeDefinition) => void;
}

export const BannerCard: React.FC<BannerCardProps> = ({
  adSize,
  state,
  onOpenCustomizer,
  onOpenMockup,
  onOpenImageGen,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullScale, setIsFullScale] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(340);

  // Measure container width to auto-scale large ads like 970x250, 728x90, 1200x628, 1080x1920
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadBannerPng(adSize, state);
    } catch (err) {
      console.error('Failed to download banner PNG:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyHtml = () => {
    const html = generateEmbedSnippet(adSize, state);
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate simulated format CTR
  const multiplier = FORMAT_CTR_MULTIPLIERS[adSize.id] || 1.0;
  const ctrMetrics = calculateCtrScore(state, multiplier);

  // Calculate auto-fit scale
  const paddingBuffer = 32;
  const availableW = Math.max(100, containerWidth - paddingBuffer);
  // Cap max preview height so ultra tall banners (1080x1920 or 160x600) don't dominate excessively
  const maxCardHeight = adSize.layoutOrientation === 'tall' ? 440 : (adSize.height > 400 ? 380 : 300);

  const scaleByW = availableW / adSize.width;
  const scaleByH = maxCardHeight / adSize.height;
  const autoScale = Math.min(1, Math.min(scaleByW, scaleByH));
  const effectiveScale = isFullScale ? 1 : autoScale;

  const displayWidth = adSize.width * effectiveScale;
  const displayHeight = adSize.height * effectiveScale;

  return (
    <div
      ref={containerRef}
      id={`banner-card-${adSize.id}`}
      className="group relative flex flex-col rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300 shadow-md overflow-hidden"
    >
      {/* Card Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                {adSize.name}
              </h3>
              {adSize.popularityBadge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold uppercase tracking-tight">
                  {adSize.popularityBadge}
                </span>
              )}
              <span
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-0.5"
                title={`Estimated CTR for ${adSize.name}: ${ctrMetrics.estimatedCtr}% (${ctrMetrics.vsBenchmarkMultiplier} vs GDN benchmark)`}
              >
                <TrendingUp className="w-2.5 h-2.5" />
                {ctrMetrics.estimatedCtr}% Est. CTR
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {adSize.width} × {adSize.height}
              </span>
              <span>•</span>
              <span className="text-[11px] text-slate-400 capitalize">
                Aspect: {adSize.recommendedAspectRatio}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Zoom / Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => setIsFullScale(!isFullScale)}
          title={isFullScale ? 'Fit to card' : 'View 100% native size'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isFullScale ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Ad Display Canvas Area */}
      <div
        className={`flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-950/90 min-h-[160px] overflow-auto relative ${
          isFullScale ? 'max-h-[500px]' : ''
        }`}
        style={{
          backgroundImage: 'radial-gradient(#6366f1 0.75px, transparent 0.75px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
          className="relative transition-all duration-300 shadow-xl rounded-sm overflow-hidden shrink-0 ring-1 ring-slate-900/10 dark:ring-white/10"
        >
          <AdDisplayRenderer
            adSize={adSize}
            state={state}
            scale={effectiveScale}
          />
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-auto px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Mockup Preview button */}
          <button
            type="button"
            onClick={() => onOpenMockup(adSize)}
            title="Preview this banner in real webpage / mobile context"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Mockup</span>
          </button>

          {/* Customize Copy / Colors */}
          <button
            type="button"
            onClick={() => onOpenCustomizer(adSize)}
            title="Tweak headline, CTA, and styling"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Generate Custom Image */}
          <button
            type="button"
            onClick={() => onOpenImageGen(adSize)}
            title="Regenerate background image using Gemini with custom aspect ratio and size"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">AI Image</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Copy HTML Snippet */}
          <button
            type="button"
            onClick={handleCopyHtml}
            title="Copy HTML5 banner snippet"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Download PNG */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download high-resolution PNG"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

