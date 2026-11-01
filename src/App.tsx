import React, { useState } from 'react';
import {
  AdCategory,
  AdSizeDefinition,
  BannerAdState,
  ProductInput,
  ImageModelType,
  ImageSizeType,
  AspectRatioType,
  AdCopyVariation,
  BrandColorConfig,
} from './types';
import { STANDARD_AD_SIZES } from './data/adSizes';
import { PRESET_EXAMPLES } from './data/presets';
import { ProductInputForm } from './components/ProductInputForm';
import { AdCopyVariationsSelector } from './components/AdCopyVariationsSelector';
import { BannerCard } from './components/BannerCard';
import { BannerCustomizerModal } from './components/BannerCustomizerModal';
import { ImageGeneratorModal } from './components/ImageGeneratorModal';
import { MockupPreviewModal } from './components/MockupPreviewModal';
import { ExportBatchModal } from './components/ExportBatchModal';
import {
  Sparkles,
  Download,
  Layers,
  Sliders,
  Camera,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';

export default function App() {
  // Active Preset initialized to CloudVault (matching user's uploaded deck!)
  const initialPreset = PRESET_EXAMPLES[0];

  const [input, setInput] = useState<ProductInput>(initialPreset.input);
  const [bannerState, setBannerState] = useState<BannerAdState>(initialPreset.initialState);

  // Active Ad Copy Variation
  const [activeVariationId, setActiveVariationId] = useState<string>(
    initialPreset.initialState.variations?.[0]?.id || 'var_1'
  );

  // Category Tab
  const [activeCategory, setActiveCategory] = useState<AdCategory>('all');

  // Loading & Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [customizingAdSize, setCustomizingAdSize] = useState<AdSizeDefinition | null>(null);
  const [imageGenAdSize, setImageGenAdSize] = useState<AdSizeDefinition | null>(null);
  const [mockupAdSize, setMockupAdSize] = useState<AdSizeDefinition | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Load a preset example (e.g. CloudVault)
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_EXAMPLES.find((p) => p.id === presetId);
    if (!preset) return;
    setInput(preset.input);
    setBannerState(preset.initialState);
    if (preset.initialState.variations?.[0]) {
      setActiveVariationId(preset.initialState.variations[0].id);
    }
    setNotification({
      type: 'success',
      message: `Loaded "${preset.name}" preset with logo, brand colors, and copy variations!`,
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle selecting an ad copy variation to apply to all 11 banners
  const handleSelectVariation = (variation: AdCopyVariation) => {
    setActiveVariationId(variation.id);
    setBannerState((prev) => ({
      ...prev,
      copy: {
        ...prev.copy,
        headline: variation.headline,
        shortHeadline: variation.shortHeadline,
        subheadline: variation.subheadline,
        shortSubheadline: variation.subheadline,
        badgeText: variation.badgeText,
        ctaText: variation.ctaText,
      },
    }));

    setNotification({
      type: 'success',
      message: `Applied "${variation.angle}" copy angle across all 11 banner formats!`,
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle Logo change
  const handleLogoChange = (logoUrl: string | undefined) => {
    setBannerState((prev) => ({ ...prev, logoUrl }));
    setInput((prev) => ({ ...prev, logoUrl }));
    setNotification({
      type: 'success',
      message: logoUrl ? 'Brand logo updated across all 11 banner formats!' : 'Logo removed.',
    });
    setTimeout(() => setNotification(null), 2500);
  };

  // Handle Brand Colors change
  const handleBrandColorsChange = (colors: Partial<BrandColorConfig>) => {
    setBannerState((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        ...colors,
      },
    }));
    setInput((prev) => ({
      ...prev,
      brandColors: {
        ...(prev.brandColors || {
          primaryColor: bannerState.style.primaryColor,
          secondaryColor: bannerState.style.secondaryColor,
          accentColor: bannerState.style.accentColor,
          backgroundColor: bannerState.style.backgroundColor,
        }),
        ...colors,
      },
    }));
  };

  // Full generation workflow:
  // 1. Analyze product URL & description with Gemini 3.8 Flash -> extracts 3-5 copy variations, headlines, colors, and tailored visual prompt.
  // 2. Generate high-quality background visual with Gemini 3 Pro Image (or Flash Image) with user-configured size (1K/2K/4K) and aspect ratio.
  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setNotification(null);

    try {
      // Step 1: Analyze & Copywriting (Generating 3-5 persuasive variations & brand aesthetics)
      setGenerationStep('Analyzing product & generating 3-5 persuasive ad copy variations...');
      const copyResponse = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productUrl: input.productUrl,
          productDescription: input.productDescription,
          targetAudience: input.targetAudience,
          campaignGoal: input.campaignGoal,
          brandTone: input.brandTone,
          brandColors: input.brandColors || {
            primaryColor: bannerState.style.primaryColor,
            secondaryColor: bannerState.style.secondaryColor,
            accentColor: bannerState.style.accentColor,
            backgroundColor: bannerState.style.backgroundColor,
          },
        }),
      });

      const copyResult = await copyResponse.json();
      if (!copyResponse.ok || !copyResult.success) {
        throw new Error(copyResult.error || 'Failed to generate ad copy');
      }

      const generatedData = copyResult.data;

      // Variations
      const variationsList: AdCopyVariation[] =
        generatedData.variations && generatedData.variations.length > 0
          ? generatedData.variations
          : bannerState.variations || [];

      if (variationsList.length > 0) {
        setActiveVariationId(variationsList[0].id);
      }

      // Update Copy & Style
      const updatedCopy = {
        brandName: generatedData.brandName || bannerState.copy.brandName,
        brandTagline: generatedData.brandTagline || bannerState.copy.brandTagline,
        headline: generatedData.headline || bannerState.copy.headline,
        shortHeadline: generatedData.shortHeadline || bannerState.copy.shortHeadline,
        subheadline: generatedData.subheadline || bannerState.copy.subheadline,
        shortSubheadline: generatedData.shortSubheadline || bannerState.copy.shortSubheadline,
        badgeText: generatedData.badgeText || bannerState.copy.badgeText,
        ctaText: generatedData.ctaText || bannerState.copy.ctaText,
        urlDisplay: generatedData.urlDisplay || bannerState.copy.urlDisplay,
        targetUrl: generatedData.targetUrl || input.productUrl || bannerState.copy.targetUrl,
      };

      const updatedStyle = {
        ...bannerState.style,
        primaryColor: generatedData.primaryColor || bannerState.style.primaryColor,
        secondaryColor: generatedData.secondaryColor || bannerState.style.secondaryColor,
        accentColor: generatedData.accentColor || bannerState.style.accentColor,
        backgroundColor: generatedData.backgroundColor || bannerState.style.backgroundColor,
        textColor: generatedData.textColor || '#FFFFFF',
      };

      // Step 2: Generate Commercial Background Visual
      setGenerationStep(`Rendering ${input.imageSize} commercial visual using ${input.imageModel}...`);
      const visualPrompt = generatedData.imagePrompt || bannerState.imagePrompt;

      const imgResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: visualPrompt,
          model: input.imageModel,
          imageSize: input.imageSize,
          aspectRatio: input.preferredAspectRatio,
        }),
      });

      const imgResult = await imgResponse.json();

      let newImageUrl = bannerState.imageUrl;
      if (imgResponse.ok && imgResult.success && imgResult.imageUrl) {
        newImageUrl = imgResult.imageUrl;
      } else {
        console.warn('Image generation warning:', imgResult.error);
      }

      setBannerState({
        copy: updatedCopy,
        style: updatedStyle,
        imageUrl: newImageUrl,
        imagePrompt: visualPrompt,
        imageModel: input.imageModel,
        imageSize: input.imageSize,
        aspectRatio: input.preferredAspectRatio,
        logoUrl: bannerState.logoUrl || input.logoUrl,
        variations: variationsList,
        brandColors: {
          primaryColor: updatedStyle.primaryColor,
          secondaryColor: updatedStyle.secondaryColor,
          accentColor: updatedStyle.accentColor,
          backgroundColor: updatedStyle.backgroundColor,
        },
      });

      setNotification({
        type: 'success',
        message: `Generated 11 banner formats with ${variationsList.length} persuasive copy variations and custom brand styling!`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('Banner generation error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to complete banner generation. Please try again.',
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Filter ad sizes based on selected tab
  const filteredAdSizes = STANDARD_AD_SIZES.filter((size) => {
    if (activeCategory === 'all') return true;
    return size.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white pb-20 relative">
      {/* Sleek Interface Ambient Dot Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: 'radial-gradient(#6366f1 0.75px, transparent 0.75px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                BannerAd<span className="text-indigo-600">.Studio</span>
              </h1>
              <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                IAB & Social Suite
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Generates all standard banner ad formats from product URL & description
            </p>
          </div>
        </div>

        {/* Global Action Tools & Stage Indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-500">
            <span className="px-3 py-1 bg-indigo-50 rounded-full text-indigo-700 font-semibold border border-indigo-100">
              Brief
            </span>
            <span className="px-3 py-1">Optimization</span>
            <span className="px-3 py-1">Export</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCustomizingAdSize(null)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>Customize All</span>
            </button>

            <button
              type="button"
              onClick={() => setImageGenAdSize(null)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Imagery</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All (.ZIP)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 space-y-8 flex-1 relative z-10">
        {/* Toast / Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300 shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="font-semibold">{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs font-semibold opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Form & Brief */}
        <ProductInputForm
          input={input}
          onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
          onGenerateAll={handleGenerateAll}
          isGenerating={isGenerating}
          generationStep={generationStep}
          onLoadPreset={handleLoadPreset}
          logoUrl={bannerState.logoUrl || input.logoUrl}
          onLogoChange={handleLogoChange}
          brandColors={{
            primaryColor: bannerState.style.primaryColor,
            secondaryColor: bannerState.style.secondaryColor,
            accentColor: bannerState.style.accentColor,
            backgroundColor: bannerState.style.backgroundColor,
          }}
          onBrandColorsChange={handleBrandColorsChange}
          brandName={bannerState.copy.brandName}
        />

        {/* Campaign Bar: Status, Current Brand Colors & Quick Controls */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Current Campaign & Brand
              </span>
              <div className="flex items-center gap-2.5">
                {bannerState.logoUrl ? (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-xs">
                    <img
                      src={bannerState.logoUrl}
                      alt={bannerState.copy.brandName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {bannerState.copy.brandName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-base text-slate-900">
                      {bannerState.copy.brandName}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-mono">
                      {bannerState.copy.urlDisplay}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Active Palette Chips */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Brand Palette
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm ring-2 ring-indigo-500 cursor-pointer"
                  style={{ backgroundColor: bannerState.style.primaryColor }}
                  title={`Primary: ${bannerState.style.primaryColor}`}
                />
                <div
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: bannerState.style.secondaryColor }}
                  title={`Secondary: ${bannerState.style.secondaryColor}`}
                />
                <div
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: bannerState.style.accentColor }}
                  title={`Accent/CTA: ${bannerState.style.accentColor}`}
                />
                <div
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200"
                  style={{ backgroundColor: bannerState.style.backgroundColor }}
                  title={`Background: ${bannerState.style.backgroundColor}`}
                />
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Active Image Spec */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Visual Specs
              </span>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Resolution: <strong className="text-slate-800">{bannerState.imageSize}</strong> • Ratio: <strong className="text-slate-800">{bannerState.aspectRatio}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCustomizingAdSize(null)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>Edit Copy/Colors</span>
            </button>
            <button
              type="button"
              onClick={() => setImageGenAdSize(null)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span>Change Image</span>
            </button>
          </div>
        </div>

        {/* 3-5 Persuasive Ad Copy Variations Selector */}
        <AdCopyVariationsSelector
          variations={bannerState.variations}
          activeVariationId={activeVariationId}
          onSelectVariation={handleSelectVariation}
          accentColor={bannerState.style.accentColor}
        />

        {/* Category Filter Tabs & Gallery Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Standard Banner Ad Formats
              </h2>
              <p className="text-xs text-slate-500">
                Rendered with high-contrast typography, tailored responsive layouts, and studio background artwork.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Sizes (11)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('iab_display')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === 'iab_display'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                IAB Display (7)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('mobile')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === 'mobile'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mobile Formats (3)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('social')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === 'social'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Social & Stories (2)
              </button>
            </div>
          </div>

          {/* Banner Ads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAdSizes.map((adSize) => (
              <BannerCard
                key={adSize.id}
                adSize={adSize}
                state={bannerState}
                onOpenCustomizer={(size) => setCustomizingAdSize(size)}
                onOpenMockup={(size) => setMockupAdSize(size)}
                onOpenImageGen={(size) => setImageGenAdSize(size)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      {customizingAdSize !== null && (
        <BannerCustomizerModal
          adSize={customizingAdSize}
          state={bannerState}
          onSave={(updatedState) => setBannerState(updatedState)}
          onClose={() => setCustomizingAdSize(null)}
        />
      )}

      {imageGenAdSize !== null && (
        <ImageGeneratorModal
          adSize={imageGenAdSize}
          currentPrompt={bannerState.imagePrompt}
          currentModel={bannerState.imageModel}
          currentSize={bannerState.imageSize}
          currentAspectRatio={bannerState.aspectRatio}
          onApplyImage={(imageUrl, prompt, model, size, aspect) => {
            setBannerState((prev) => ({
              ...prev,
              imageUrl,
              imagePrompt: prompt,
              imageModel: model,
              imageSize: size,
              aspectRatio: aspect,
            }));
            setNotification({
              type: 'success',
              message: `Applied new ${size} (${aspect}) visual across banner formats!`,
            });
            setTimeout(() => setNotification(null), 3000);
          }}
          onClose={() => setImageGenAdSize(null)}
        />
      )}

      {mockupAdSize !== null && (
        <MockupPreviewModal
          adSize={mockupAdSize}
          state={bannerState}
          onClose={() => setMockupAdSize(null)}
        />
      )}

      {showExportModal && (
        <ExportBatchModal
          adSizes={STANDARD_AD_SIZES}
          state={bannerState}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
