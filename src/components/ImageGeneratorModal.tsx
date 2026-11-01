import React, { useState } from 'react';
import {
  AdSizeDefinition,
  ImageModelType,
  ImageSizeType,
  AspectRatioType,
} from '../types';
import {
  X,
  Sparkles,
  Cpu,
  Layers,
  Palette,
  Check,
  RefreshCw,
  AlertCircle,
  Eye,
  Camera,
} from 'lucide-react';

interface ImageGeneratorModalProps {
  adSize: AdSizeDefinition | null;
  currentPrompt: string;
  currentModel: ImageModelType;
  currentSize: ImageSizeType;
  currentAspectRatio: AspectRatioType;
  onApplyImage: (imageUrl: string, prompt: string, model: ImageModelType, size: ImageSizeType, aspect: AspectRatioType) => void;
  onClose: () => void;
}

const ALL_ASPECT_RATIOS: { value: AspectRatioType; label: string; icon: string; desc: string }[] = [
  { value: '16:9', label: '16:9', icon: '▬', desc: 'Landscape / Banners' },
  { value: '1:1', label: '1:1', icon: '■', desc: 'Square / Social' },
  { value: '4:3', label: '4:3', icon: '▭', desc: 'Standard Rectangle' },
  { value: '3:2', label: '3:2', icon: '▭', desc: 'Classic 35mm' },
  { value: '3:4', label: '3:4', icon: '▯', desc: 'Portrait Vertical' },
  { value: '2:3', label: '2:3', icon: '▯', desc: 'Tall Portrait' },
  { value: '9:16', label: '9:16', icon: '❚', desc: 'Vertical Story / Reel' },
  { value: '21:9', label: '21:9', icon: '━', desc: 'Cinematic Ultrawide' },
];

const RESOLUTION_OPTIONS: { value: ImageSizeType; label: string; desc: string }[] = [
  { value: '1K', label: '1K Standard', desc: 'Fast turnaround, great for web' },
  { value: '2K', label: '2K High-Res', desc: 'Crisp display ads & retina screens' },
  { value: '4K', label: '4K Ultra-HD', desc: 'Maximum detail, studio grade' },
];

export const ImageGeneratorModal: React.FC<ImageGeneratorModalProps> = ({
  adSize,
  currentPrompt,
  currentModel,
  currentSize,
  currentAspectRatio,
  onApplyImage,
  onClose,
}) => {
  const [prompt, setPrompt] = useState(currentPrompt || '');
  const [model, setModel] = useState<ImageModelType>(currentModel || 'gemini-3-pro-image-preview');
  const [imageSize, setImageSize] = useState<ImageSizeType>(currentSize || '2K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(
    adSize ? adSize.recommendedAspectRatio : (currentAspectRatio || '16:9')
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          imageSize,
          aspectRatio,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to generate image');
      }

      setPreviewImageUrl(resData.imageUrl);
    } catch (err: any) {
      console.error('Image generation failed:', err);
      setErrorMsg(err.message || 'Image generation error. Please check your API key or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (previewImageUrl) {
      onApplyImage(previewImageUrl, prompt, model, imageSize, aspectRatio);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Gemini Image Studio
              </span>
              {adSize && (
                <span className="text-xs text-slate-500 font-mono">
                  {adSize.name} ({adSize.width}×{adSize.height})
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg text-slate-900 mt-0.5 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-600" />
              Generate Commercial Ad Visual
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Notice</p>
                <p className="mt-0.5 opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Model Architecture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModel('gemini-3-pro-image-preview')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  model === 'gemini-3-pro-image-preview'
                    ? 'bg-white border-indigo-600 text-slate-900 shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">gemini-3-pro-image-preview</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                    Studio Quality
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  High-fidelity photorealism, fine commercial lighting, superior advertising composition.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setModel('gemini-3.1-flash-image-preview')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  model === 'gemini-3.1-flash-image-preview'
                    ? 'bg-white border-indigo-600 text-slate-900 shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">gemini-3.1-flash-image-preview</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    Fast Generation
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  High throughput, low-latency generation for rapid iteration across concepts.
                </p>
              </button>
            </div>
          </div>

          {/* Image Size Selection (1K, 2K, 4K) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-600" />
                Image Resolution (imageConfig.imageSize)
              </span>
              <span className="text-[11px] text-slate-400 lowercase tracking-normal">
                Studio options: 1K • 2K • 4K
              </span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {RESOLUTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setImageSize(opt.value)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    imageSize === opt.value
                      ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`text-base font-bold font-mono ${imageSize === opt.value ? 'text-white' : 'text-indigo-600'}`}>
                    {opt.value}
                  </div>
                  <div className={`text-xs font-semibold mt-0.5 ${imageSize === opt.value ? 'text-indigo-100' : 'text-slate-800'}`}>
                    {opt.label}
                  </div>
                  <div className={`text-[10px] mt-0.5 hidden sm:block ${imageSize === opt.value ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selection (1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                Aspect Ratio (imageConfig.aspectRatio)
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold lowercase tracking-normal">
                {adSize ? `Recommended for ${adSize.name}: ${adSize.recommendedAspectRatio}` : 'Select Framing'}
              </span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {ALL_ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  onClick={() => setAspectRatio(ar.value)}
                  title={ar.desc}
                  className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    aspectRatio === ar.value
                      ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <span className={`text-sm font-mono leading-none mb-1 ${aspectRatio === ar.value ? 'text-amber-300' : 'text-slate-700'}`}>
                    {ar.icon}
                  </span>
                  <span className="text-xs font-mono font-medium">
                    {ar.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Visual Imagery Prompt</span>
              <span className="text-[11px] text-slate-400 font-normal lowercase tracking-normal">
                Optimized for commercial ad backgrounds
              </span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Glowing datacenter server racks, cyan and deep blue LED lighting, sleek modern tech hardware, 8k cinematic commercial ad photography..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Preview Area */}
          {previewImageUrl && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  Generated Image Preview ({imageSize} • {aspectRatio})
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Ready to apply
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden max-h-64 flex items-center justify-center bg-slate-900/5 border border-slate-200">
                <img
                  src={previewImageUrl}
                  alt="Generated visual"
                  className="max-h-64 object-contain rounded-sm shadow-md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating {imageSize} Visual...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{previewImageUrl ? 'Regenerate' : 'Generate Visual'}</span>
                </>
              )}
            </button>

            {previewImageUrl && (
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply to Banners</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
