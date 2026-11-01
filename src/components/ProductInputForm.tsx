import React, { useState } from 'react';
import {
  ProductInput,
  ImageModelType,
  ImageSizeType,
  AspectRatioType,
  BrandColorConfig,
} from '../types';
import { PRESET_EXAMPLES } from '../data/presets';
import { BrandConsistencySection } from './BrandConsistencySection';
import {
  Sparkles,
  Link,
  Layers,
  Settings2,
  Cpu,
  ChevronDown,
  ChevronUp,
  Wand2,
  FileText,
  Target,
  Palette,
} from 'lucide-react';

interface ProductInputFormProps {
  input: ProductInput;
  onChange: (updated: Partial<ProductInput>) => void;
  onGenerateAll: () => Promise<void>;
  isGenerating: boolean;
  generationStep: string;
  onLoadPreset: (presetId: string) => void;
  logoUrl?: string;
  onLogoChange: (logoUrl: string | undefined) => void;
  brandColors: BrandColorConfig;
  onBrandColorsChange: (colors: Partial<BrandColorConfig>) => void;
  brandName: string;
}

const ASPECT_RATIOS: { value: AspectRatioType; label: string; icon: string; desc: string }[] = [
  { value: '16:9', label: '16:9', icon: '▬', desc: 'Landscape / Banners' },
  { value: '1:1', label: '1:1', icon: '■', desc: 'Square / Social' },
  { value: '4:3', label: '4:3', icon: '▭', desc: 'Rectangle' },
  { value: '3:2', label: '3:2', icon: '▭', desc: 'Classic Landscape' },
  { value: '3:4', label: '3:4', icon: '▯', desc: 'Portrait' },
  { value: '2:3', label: '2:3', icon: '▯', desc: 'Tall Portrait' },
  { value: '9:16', label: '9:16', icon: '❚', desc: 'Stories & Reels' },
  { value: '21:9', label: '21:9', icon: '━', desc: 'Ultrawide Billboard' },
];

const IMAGE_SIZES: { value: ImageSizeType; label: string; sub: string }[] = [
  { value: '1K', label: '1K Standard', sub: 'Fastest generation' },
  { value: '2K', label: '2K High-Res', sub: 'Optimal clarity & detail' },
  { value: '4K', label: '4K Ultra-HD', sub: 'Studio production print grade' },
];

const MODELS: { value: ImageModelType; name: string; tag: string; desc: string }[] = [
  {
    value: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image',
    tag: 'Studio Quality (Recommended)',
    desc: 'Deep reasoning, rich typography awareness, photorealistic commercial textures',
  },
  {
    value: 'gemini-3.1-flash-image-preview',
    name: 'Gemini 3.1 Flash Image',
    tag: 'Ultra-Fast',
    desc: 'High throughput, responsive iteration and rapid banner experimentation',
  },
];

export const ProductInputForm: React.FC<ProductInputFormProps> = ({
  input,
  onChange,
  onGenerateAll,
  isGenerating,
  generationStep,
  onLoadPreset,
  logoUrl,
  onLogoChange,
  brandColors,
  onBrandColorsChange,
  brandName,
}) => {
  const [showAdvancedImageControls, setShowAdvancedImageControls] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    onGenerateAll();
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
      {/* Top Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              AI Banner Studio
            </span>
            <span className="text-xs text-slate-500 font-medium">Gemini 3 Pro Powered</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Product & Creative Brief
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Provide a product URL and description to automatically generate optimized ad copy, imagery, and standard banner formats.
          </p>
        </div>

        {/* 1-Click Quick Presets */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Try Samples:
          </span>
          {PRESET_EXAMPLES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onLoadPreset(preset.id)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* Core Product Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Product URL */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-indigo-600" />
              Product URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={input.productUrl}
                onChange={(e) => onChange({ productUrl: e.target.value })}
                placeholder="https://cloudvault.app"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Used for ad destination link & display domain.</p>
          </div>

          {/* Target Audience */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-600" />
              Target Audience
            </label>
            <input
              type="text"
              value={input.targetAudience}
              onChange={(e) => onChange({ targetAudience: e.target.value })}
              placeholder="e.g., Creators, students, remote teams"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">Tailors the persuasive tone and value props.</p>
          </div>

          {/* Campaign Goal */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Campaign Goal
            </label>
            <input
              type="text"
              value={input.campaignGoal}
              onChange={(e) => onChange({ campaignGoal: e.target.value })}
              placeholder="e.g., Free Signups, App Installs, 50% Off"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">Guides the call-to-action button and urgency badge.</p>
          </div>

          {/* Product Description */}
          <div className="md:col-span-12">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Product Description & Key Value Propositions
              </span>
              <span className="text-[11px] text-slate-400 font-normal lowercase tracking-normal">
                Paste pitch, features, or website copy
              </span>
            </label>
            <textarea
              rows={3}
              value={input.productDescription}
              onChange={(e) => onChange({ productDescription: e.target.value })}
              placeholder="Describe what your product does, its main benefits, key differentiators, pricing, or special offers..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y leading-relaxed font-sans"
              required
            />
          </div>
        </div>

        {/* Brand Consistency: Logo Upload & Brand Color Hex Codes */}
        <BrandConsistencySection
          logoUrl={logoUrl}
          onLogoChange={onLogoChange}
          brandColors={brandColors}
          onBrandColorsChange={onBrandColorsChange}
          brandName={brandName}
        />

        {/* AI Image Generation Affordances (Model, Resolution 1K/2K/4K, Aspect Ratio) */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4.5 transition-all">
          <button
            type="button"
            onClick={() => setShowAdvancedImageControls(!showAdvancedImageControls)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Settings2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-800">
                  AI Image Generation Affordances
                </span>
                <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
                  Configure Studio Model, Resolution (1K/2K/4K), and Aspect Ratio
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px] text-indigo-700 font-semibold">
                {input.imageModel === 'gemini-3-pro-image-preview' ? '3-Pro' : '3.1-Flash'} • {input.imageSize} • {input.preferredAspectRatio}
              </span>
              {showAdvancedImageControls ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>

          {showAdvancedImageControls && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
              {/* 1. Model Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  Gemini Image Generation Model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODELS.map((m) => {
                    const isSelected = input.imageModel === m.value;
                    return (
                      <div
                        key={m.value}
                        onClick={() => onChange({ imageModel: m.value })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-indigo-600 text-slate-900 shadow-sm ring-1 ring-indigo-500/30'
                            : 'bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{m.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {m.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {m.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Image Resolution Selector (1K, 2K, 4K) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-600" />
                    Image Resolution & Quality
                  </span>
                  <span className="text-[11px] text-indigo-600 font-semibold lowercase tracking-normal">
                    via imageConfig.imageSize
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {IMAGE_SIZES.map((sz) => {
                    const isSelected = input.imageSize === sz.value;
                    return (
                      <button
                        key={sz.value}
                        type="button"
                        onClick={() => onChange({ imageSize: sz.value })}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`text-sm font-bold font-mono ${isSelected ? 'text-white' : 'text-indigo-600'}`}>
                          {sz.value}
                        </div>
                        <div className={`text-[11px] mt-0.5 font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-800'}`}>
                          {sz.label}
                        </div>
                        <div className={`text-[10px] mt-0.5 hidden sm:block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {sz.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Aspect Ratio Selector (1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-500" />
                    Primary Visual Aspect Ratio
                  </span>
                  <span className="text-[11px] text-slate-400 lowercase tracking-normal">
                    controls image framing for backgrounds
                  </span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {ASPECT_RATIOS.map((ar) => {
                    const isSelected = input.preferredAspectRatio === ar.value;
                    return (
                      <button
                        key={ar.value}
                        type="button"
                        onClick={() => onChange({ preferredAspectRatio: ar.value })}
                        title={ar.desc}
                        className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        <span className={`text-sm font-mono leading-none mb-1 ${isSelected ? 'text-amber-300' : 'text-slate-700'}`}>
                          {ar.icon}
                        </span>
                        <span className="text-xs font-mono font-medium">
                          {ar.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button with animated state */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="animate-pulse font-semibold">
                  {generationStep || 'Generating high-impact banner campaign...'}
                </span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
                <span>Generate High-Quality Banner Ads in All Standard Sizes</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  11 Formats
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
