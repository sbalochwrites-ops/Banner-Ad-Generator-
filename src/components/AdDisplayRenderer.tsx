import React from 'react';
import { AdSizeDefinition, BannerAdState } from '../types';
import { ArrowRight, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface AdDisplayRendererProps {
  adSize: AdSizeDefinition;
  state: BannerAdState;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

export const AdDisplayRenderer: React.FC<AdDisplayRendererProps> = ({
  adSize,
  state,
  scale = 1,
  className = '',
  onClick,
}) => {
  const { copy, style, imageUrl } = state;
  const { width, height, layoutOrientation, id } = adSize;

  // Derive gradient overlay based on orientation & style opacity
  const getGradient = () => {
    const base = style.backgroundColor;
    const op = Math.min(0.95, Math.max(0.3, style.overlayOpacity));
    if (layoutOrientation === 'horizontal' || layoutOrientation === 'micro') {
      return `linear-gradient(90deg, ${base} ${op * 100}%, ${base}e6 60%, ${base}99 100%)`;
    }
    if (layoutOrientation === 'vertical' || layoutOrientation === 'tall') {
      return `linear-gradient(180deg, ${base} ${op * 100}%, ${base}d9 50%, ${base} 100%)`;
    }
    return `linear-gradient(180deg, ${base}f2 0%, ${base}d9 50%, ${base}f2 100%)`;
  };

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
      className={`relative select-none overflow-hidden transition-shadow border border-white/10 ${className}`}
      onClick={onClick}
    >
      {/* Background Image */}
      {imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 70% 30%, ${style.primaryColor}40 0%, ${style.backgroundColor} 80%)`,
          }}
        />
      )}

      {/* Darkening / Tint Overlay for Contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: getGradient(),
        }}
      />

      {/* Ambient Accent Light */}
      <div
        className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40"
        style={{ background: style.primaryColor }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-3.5 box-border">
        {/* Render specialized layout depending on ad geometry */}
        {id === 'mobile_leaderboard' ? (
          // Ultra compact 320x50 smartphone sticky banner
          <div className="flex items-center justify-between h-full px-1">
            <div className="flex flex-col justify-center max-w-[200px] overflow-hidden pr-2">
              <div className="flex items-center gap-1.5">
                {state.logoUrl ? (
                  <img
                    src={state.logoUrl}
                    alt={copy.brandName}
                    className="h-3.5 max-w-[70px] object-contain shrink-0 filter drop-shadow-xs"
                  />
                ) : (
                  <span
                    className="font-bold text-[11px] tracking-wide uppercase truncate"
                    style={{ color: style.accentColor }}
                  >
                    {copy.brandName}
                  </span>
                )}
                {copy.badgeText && (
                  <span className="text-[9px] bg-white/15 text-white/90 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                    {copy.badgeText}
                  </span>
                )}
              </div>
              <p
                className="text-[10px] font-semibold truncate leading-tight mt-0.5"
                style={{ color: style.textColor }}
              >
                {copy.shortHeadline || copy.headline}
              </p>
            </div>

            <button
              type="button"
              className="px-2.5 py-1.5 rounded-md text-[10px] font-bold tracking-tight shadow-md flex items-center gap-1 shrink-0 transition-transform active:scale-95"
              style={{
                backgroundColor: style.accentColor,
                color: '#0F172A',
              }}
            >
              {copy.ctaText}
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        ) : layoutOrientation === 'horizontal' ? (
          // Horizontal Layouts (728x90, 970x250, 320x100, 1200x628)
          <div className="flex items-center justify-between w-full h-full px-2">
            <div className="flex flex-col justify-center max-w-[65%]">
              <div className="flex items-center gap-2 mb-1">
                {state.logoUrl ? (
                  <img
                    src={state.logoUrl}
                    alt={copy.brandName}
                    className={`object-contain shrink-0 filter drop-shadow-xs ${
                      height <= 100 ? 'h-5 max-w-[110px]' : 'h-8 max-w-[160px]'
                    }`}
                  />
                ) : (
                  <span
                    className="font-display font-extrabold uppercase tracking-wider text-xs md:text-sm"
                    style={{ color: style.accentColor }}
                  >
                    {copy.brandName}
                  </span>
                )}
                {copy.badgeText && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full font-medium backdrop-blur-xs">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    {copy.badgeText}
                  </span>
                )}
              </div>

              <h2
                className={`font-display font-bold leading-tight line-clamp-1 ${
                  height <= 100 ? 'text-sm md:text-base' : 'text-xl md:text-2xl'
                }`}
                style={{ color: style.textColor }}
              >
                {height <= 100 ? (copy.shortHeadline || copy.headline) : copy.headline}
              </h2>

              {height > 100 && (
                <p className="text-xs md:text-sm text-slate-300 line-clamp-1 mt-1 font-normal">
                  {copy.subheadline}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end justify-center shrink-0 pl-3">
              <button
                type="button"
                className={`rounded-lg font-bold shadow-lg flex items-center gap-1.5 transition-all hover:brightness-110 active:scale-95 cursor-pointer ${
                  height <= 100 ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'
                }`}
                style={{
                  backgroundColor: style.accentColor,
                  color: '#0F172A',
                }}
              >
                {copy.ctaText}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                <span>{copy.urlDisplay}</span>
              </div>
            </div>
          </div>
        ) : layoutOrientation === 'vertical' || layoutOrientation === 'tall' ? (
          // Vertical Layouts (160x600, 300x600, 1080x1920)
          <div className="flex flex-col justify-between h-full text-center py-2">
            <div>
              {/* Brand Top Header */}
              <div className="flex flex-col items-center gap-1.5 mb-2">
                {state.logoUrl ? (
                  <img
                    src={state.logoUrl}
                    alt={copy.brandName}
                    className={`object-contain mx-auto filter drop-shadow-xs ${
                      width <= 180 ? 'h-6 max-w-[110px]' : 'h-8 max-w-[150px]'
                    }`}
                  />
                ) : (
                  <span
                    className="font-display font-black tracking-widest text-xs uppercase"
                    style={{ color: style.accentColor }}
                  >
                    {copy.brandName}
                  </span>
                )}
                {copy.badgeText && (
                  <span className="text-[9px] bg-white/15 text-white px-2 py-0.5 rounded-full font-medium">
                    {copy.badgeText}
                  </span>
                )}
              </div>

              {/* Main Headline */}
              <h2
                className={`font-display font-extrabold leading-tight ${
                  width <= 180 ? 'text-sm mt-3 px-1' : (id === 'story_vertical' ? 'text-3xl mt-6 px-4' : 'text-lg mt-4 px-2')
                }`}
                style={{ color: style.textColor }}
              >
                {width <= 180 ? (copy.shortHeadline || copy.headline) : copy.headline}
              </h2>

              {/* Subheadline (if space permits) */}
              {height >= 400 && width > 180 && (
                <p className="text-xs text-slate-300 mt-3 px-2 line-clamp-4 leading-relaxed font-normal">
                  {copy.subheadline}
                </p>
              )}
            </div>

            {/* Bottom CTA block */}
            <div className="flex flex-col items-center gap-2 mt-auto pt-4">
              <button
                type="button"
                className={`w-full max-w-[90%] rounded-lg font-bold shadow-lg flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-95 ${
                  width <= 180 ? 'py-2 text-xs' : (id === 'story_vertical' ? 'py-4 text-lg' : 'py-2.5 text-sm')
                }`}
                style={{
                  backgroundColor: style.accentColor,
                  color: '#0F172A',
                }}
              >
                {copy.ctaText}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                <ExternalLink className="w-2.5 h-2.5" />
                <span>{copy.urlDisplay}</span>
              </div>
            </div>
          </div>
        ) : (
          // Square and Medium Rectangles (300x250, 336x280, 250x250)
          <div className="flex flex-col justify-between h-full">
            <div>
              {/* Top Row: Brand & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {state.logoUrl ? (
                    <img
                      src={state.logoUrl}
                      alt={copy.brandName}
                      className="h-6 max-w-[120px] object-contain shrink-0 filter drop-shadow-xs"
                    />
                  ) : (
                    <span
                      className="font-display font-black text-xs uppercase tracking-wider"
                      style={{ color: style.accentColor }}
                    >
                      {copy.brandName}
                    </span>
                  )}
                </div>
                {copy.badgeText && (
                  <span className="text-[10px] bg-white/15 text-white/95 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    {copy.badgeText}
                  </span>
                )}
              </div>

              {/* Headline */}
              <h2
                className={`font-display font-bold leading-tight mt-2 line-clamp-3 ${
                  width <= 260 ? 'text-sm' : 'text-base md:text-lg'
                }`}
                style={{ color: style.textColor }}
              >
                {copy.headline}
              </h2>

              {/* Subheadline */}
              {height >= 240 && (
                <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                  {copy.subheadline}
                </p>
              )}
            </div>

            {/* Bottom Row: CTA Button + URL */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:brightness-110 active:scale-95"
                style={{
                  backgroundColor: style.accentColor,
                  color: '#0F172A',
                }}
              >
                {copy.ctaText}
                <ArrowRight className="w-3 h-3" />
              </button>

              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {copy.urlDisplay}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle IAB Ad Corner Indicator */}
      <div className="absolute top-0 right-0 bg-black/50 text-[8px] text-white/60 px-1.5 py-0.5 rounded-bl font-mono pointer-events-none uppercase">
        Ad
      </div>
    </div>
  );
};
