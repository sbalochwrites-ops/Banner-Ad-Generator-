import React, { useState } from 'react';
import { AdSizeDefinition, BannerAdState } from '../types';
import { downloadAllBannersZip } from '../utils/canvasExport';
import {
  X,
  Download,
  CheckSquare,
  Square,
  FileArchive,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ExportBatchModalProps {
  adSizes: AdSizeDefinition[];
  state: BannerAdState;
  onClose: () => void;
}

export const ExportBatchModal: React.FC<ExportBatchModalProps> = ({
  adSizes,
  state,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(adSizes.map((s) => s.id));
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: adSizes.length });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(adSizes.map((s) => s.id));
  };

  const handleSelectNone = () => {
    setSelectedIds([]);
  };

  const handleExportZip = async () => {
    const targets = adSizes.filter((s) => selectedIds.includes(s.id));
    if (targets.length === 0) return;

    setIsExporting(true);
    setProgress({ current: 0, total: targets.length });

    try {
      await downloadAllBannersZip(targets, state, (current, total) => {
        setProgress({ current, total });
      });
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      console.error('Error generating banner zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Batch Production Export
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mt-0.5 flex items-center gap-2">
              <FileArchive className="w-4 h-4 text-emerald-600" />
              Download Banner Ad Campaign Pack (.ZIP)
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
          {/* Controls row */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="text-slate-600 font-medium">
              Selected: <span className="text-indigo-600 font-bold">{selectedIds.length}</span> of {adSizes.length} formats
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleSelectNone}
                className="text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Ad Size Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {adSizes.map((size) => {
              const isChecked = selectedIds.includes(size.id);
              return (
                <div
                  key={size.id}
                  onClick={() => toggleSelect(size.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-indigo-50/70 border-indigo-300 text-slate-900 ring-1 ring-indigo-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold leading-tight text-slate-900">
                        {size.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {size.width} × {size.height} • {size.category}
                      </p>
                    </div>
                  </div>
                  {size.popularityBadge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold shrink-0">
                      Popular
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Export Specifications Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
            <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <p className="text-slate-900 font-semibold">High-DPI Retina Output (2x Scale)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All banners are exported at 2x resolution with lossless PNG compression, fully compliant with Google Display Network & IAB guidelines.
              </p>
            </div>
          </div>

          {/* Progress bar if exporting */}
          {isExporting && (
            <div className="space-y-2 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
                <span>Rendering high-resolution canvas frames...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-indigo-200/60 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
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

          <button
            type="button"
            onClick={handleExportZip}
            disabled={isExporting || selectedIds.length === 0}
            className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>
              {isExporting
                ? 'Packaging ZIP Archive...'
                : `Download ${selectedIds.length} Banners (.ZIP)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
