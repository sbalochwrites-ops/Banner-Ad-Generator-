import React, { useState, useRef } from 'react';
import { BrandColorConfig } from '../types';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Check,
  Palette,
  Sparkles,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

interface BrandConsistencySectionProps {
  logoUrl?: string;
  onLogoChange: (logoUrl: string | undefined) => void;
  brandColors: BrandColorConfig;
  onBrandColorsChange: (colors: Partial<BrandColorConfig>) => void;
  brandName: string;
}

const PRESET_PALETTES = [
  {
    name: 'CloudVault Blue',
    primary: '#2563EB',
    secondary: '#06B6D4',
    accent: '#38BDF8',
    bg: '#0A0F1D',
  },
  {
    name: 'Lumina Purple',
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#F43F5E',
    bg: '#0F091F',
  },
  {
    name: 'Emerald Trust',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#34D399',
    bg: '#061712',
  },
  {
    name: 'Warm Amber',
    primary: '#D97706',
    secondary: '#B45309',
    accent: '#FBBF24',
    bg: '#17120A',
  },
  {
    name: 'Crimson Pulse',
    primary: '#E11D48',
    secondary: '#FB7185',
    accent: '#F43F5E',
    bg: '#180B10',
  },
  {
    name: 'Midnight Sleek',
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#F8FAFC',
    bg: '#020617',
  },
];

export const BrandConsistencySection: React.FC<BrandConsistencySectionProps> = ({
  logoUrl,
  onLogoChange,
  brandColors,
  onBrandColorsChange,
  brandName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [logoFileName, setLogoFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hex input state helpers for typing in text fields
  const [hexInputs, setHexInputs] = useState({
    primary: brandColors.primaryColor,
    secondary: brandColors.secondaryColor,
    accent: brandColors.accentColor,
    bg: brandColors.backgroundColor,
  });

  // Keep local inputs in sync when prop changes
  React.useEffect(() => {
    setHexInputs({
      primary: brandColors.primaryColor,
      secondary: brandColors.secondaryColor,
      accent: brandColors.accentColor,
      bg: brandColors.backgroundColor,
    });
  }, [brandColors]);

  const handleFileProcess = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onLogoChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleHexChange = (
    key: 'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor',
    localKey: 'primary' | 'secondary' | 'accent' | 'bg',
    val: string
  ) => {
    setHexInputs((prev) => ({ ...prev, [localKey]: val }));
    // Normalize and validate hex
    let clean = val.trim();
    if (!clean.startsWith('#')) {
      clean = '#' + clean;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(clean) || /^#[0-9A-Fa-f]{3}$/.test(clean)) {
      onBrandColorsChange({ [key]: clean });
    }
  };

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Brand Consistency & Identity Assets
            </h3>
            <p className="text-xs text-slate-500">
              Upload your company logo and input brand hex codes to automatically brand all 11 banner formats.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-auto flex items-center gap-1">
          <FileCheck className="w-3.5 h-3.5" />
          Live Brand Sync
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: Logo Upload (Drag & Drop + Click) */}
        <div className="lg:col-span-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
              Brand Logo File (PNG, JPG, SVG)
            </span>
            {logoUrl && (
              <span className="text-[11px] text-emerald-600 font-semibold lowercase tracking-normal flex items-center gap-1">
                <Check className="w-3 h-3" /> Active
              </span>
            )}
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {logoUrl ? (
            /* Active Logo Preview Card */
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-12 rounded-lg bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={logoUrl}
                    alt={brandName || 'Brand Logo'}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {logoFileName || `${brandName || 'Brand'} Logo`}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Applied across all 11 banners
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLogoChange(undefined);
                    setLogoFileName('');
                  }}
                  title="Remove logo"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Drag and Drop Zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-indigo-400 bg-white/70 hover:bg-white'
              }`}
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Drag & drop your logo here, or <span className="text-indigo-600 underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports transparent PNG, high-res JPG, SVG, or WebP
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Specific Brand Color Hex Codes */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              Brand Color Hex Codes
            </label>
            <span className="text-[11px] text-slate-400 lowercase tracking-normal">
              Type hex code or click swatch to pick
            </span>
          </div>

          {/* 4 Hex Inputs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Primary Color */}
            <div className="rounded-lg bg-white border border-slate-200 p-2.5 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Primary
                </span>
                <input
                  type="color"
                  value={brandColors.primaryColor}
                  onChange={(e) =>
                    handleHexChange('primaryColor', 'primary', e.target.value)
                  }
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  title="Choose Primary Color"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: brandColors.primaryColor }}
                />
                <input
                  type="text"
                  maxLength={7}
                  value={hexInputs.primary}
                  onChange={(e) =>
                    handleHexChange('primaryColor', 'primary', e.target.value)
                  }
                  className="w-full text-xs font-mono font-semibold text-slate-800 bg-transparent focus:outline-none uppercase"
                  placeholder="#2563EB"
                />
              </div>
            </div>

            {/* 2. Secondary Color */}
            <div className="rounded-lg bg-white border border-slate-200 p-2.5 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Secondary
                </span>
                <input
                  type="color"
                  value={brandColors.secondaryColor}
                  onChange={(e) =>
                    handleHexChange('secondaryColor', 'secondary', e.target.value)
                  }
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  title="Choose Secondary Color"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: brandColors.secondaryColor }}
                />
                <input
                  type="text"
                  maxLength={7}
                  value={hexInputs.secondary}
                  onChange={(e) =>
                    handleHexChange('secondaryColor', 'secondary', e.target.value)
                  }
                  className="w-full text-xs font-mono font-semibold text-slate-800 bg-transparent focus:outline-none uppercase"
                  placeholder="#06B6D4"
                />
              </div>
            </div>

            {/* 3. CTA Button / Accent */}
            <div className="rounded-lg bg-white border border-slate-200 p-2.5 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  CTA / Accent
                </span>
                <input
                  type="color"
                  value={brandColors.accentColor}
                  onChange={(e) =>
                    handleHexChange('accentColor', 'accent', e.target.value)
                  }
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  title="Choose CTA Button Color"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: brandColors.accentColor }}
                />
                <input
                  type="text"
                  maxLength={7}
                  value={hexInputs.accent}
                  onChange={(e) =>
                    handleHexChange('accentColor', 'accent', e.target.value)
                  }
                  className="w-full text-xs font-mono font-semibold text-slate-800 bg-transparent focus:outline-none uppercase"
                  placeholder="#38BDF8"
                />
              </div>
            </div>

            {/* 4. Canvas Background */}
            <div className="rounded-lg bg-white border border-slate-200 p-2.5 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Background
                </span>
                <input
                  type="color"
                  value={brandColors.backgroundColor}
                  onChange={(e) =>
                    handleHexChange('backgroundColor', 'bg', e.target.value)
                  }
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  title="Choose Background Color"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: brandColors.backgroundColor }}
                />
                <input
                  type="text"
                  maxLength={7}
                  value={hexInputs.bg}
                  onChange={(e) =>
                    handleHexChange('backgroundColor', 'bg', e.target.value)
                  }
                  className="w-full text-xs font-mono font-semibold text-slate-800 bg-transparent focus:outline-none uppercase"
                  placeholder="#0A0F1D"
                />
              </div>
            </div>
          </div>

          {/* Quick Palette Chips */}
          <div className="pt-1 flex items-center flex-wrap gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
              Sample Palettes:
            </span>
            {PRESET_PALETTES.map((pal) => (
              <button
                key={pal.name}
                type="button"
                onClick={() => {
                  onBrandColorsChange({
                    primaryColor: pal.primary,
                    secondaryColor: pal.secondary,
                    accentColor: pal.accent,
                    backgroundColor: pal.bg,
                  });
                }}
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <div className="flex -space-x-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white"
                    style={{ backgroundColor: pal.primary }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white"
                    style={{ backgroundColor: pal.accent }}
                  />
                </div>
                <span>{pal.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
