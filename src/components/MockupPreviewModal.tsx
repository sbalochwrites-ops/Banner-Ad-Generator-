import React, { useState } from 'react';
import { AdSizeDefinition, BannerAdState } from '../types';
import { AdDisplayRenderer } from './AdDisplayRenderer';
import {
  X,
  Smartphone,
  Layout,
  Globe,
  Instagram,
  Eye,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
} from 'lucide-react';

interface MockupPreviewModalProps {
  adSize: AdSizeDefinition;
  state: BannerAdState;
  onClose: () => void;
}

export const MockupPreviewModal: React.FC<MockupPreviewModalProps> = ({
  adSize,
  state,
  onClose,
}) => {
  const [mockupType, setMockupType] = useState<'editorial' | 'mobile' | 'social'>(() => {
    if (adSize.category === 'mobile' || adSize.id === 'story_vertical') return 'mobile';
    if (adSize.category === 'social') return 'social';
    return 'editorial';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-bold border border-cyan-200">
                In-Situ Mockup
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {adSize.name} ({adSize.width}×{adSize.height})
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mt-0.5">
              Live Environment Ad Preview
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Mockup switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setMockupType('editorial')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  mockupType === 'editorial'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                Web Editorial
              </button>
              <button
                type="button"
                onClick={() => setMockupType('mobile')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  mockupType === 'mobile'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                Mobile Screen
              </button>
              <button
                type="button"
                onClick={() => setMockupType('social')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  mockupType === 'social'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Instagram className="w-3.5 h-3.5 text-indigo-600" />
                Social Feed
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mockup Canvas Viewport */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex items-center justify-center"
          style={{
            backgroundImage: 'radial-gradient(#6366f1 0.75px, transparent 0.75px)',
            backgroundSize: '16px 16px',
          }}
        >
          {mockupType === 'editorial' && (
            // Modern Web Editorial Layout Mockup
            <div className="w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden text-slate-800">
              {/* Browser chrome header */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[11px] max-w-sm w-full">
                  <span className="text-emerald-600 font-semibold">https://</span>
                  <span>technews-daily.com/reviews/cloud-storage</span>
                </div>
              </div>

              {/* Website Navigation */}
              <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-black text-sm tracking-wider text-slate-900">
                  TECH<span className="text-indigo-600">DAILY</span>
                </span>
                <div className="flex gap-4 text-slate-500">
                  <span className="hover:text-slate-900 cursor-pointer">Enterprise</span>
                  <span className="text-indigo-600 font-bold">Cloud & Storage</span>
                  <span className="hover:text-slate-900 cursor-pointer">Cybersecurity</span>
                  <span className="hover:text-slate-900 cursor-pointer">AI</span>
                </div>
              </div>

              {/* Top Banner Slot (For Leaderboard or Billboard) */}
              {(adSize.id === 'leaderboard' || adSize.id === 'billboard') && (
                <div className="p-4 bg-slate-50/60 flex flex-col items-center justify-center border-b border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-1">
                    Advertisement
                  </span>
                  <div className="overflow-hidden shadow-lg rounded-sm ring-1 ring-slate-900/10">
                    <AdDisplayRenderer adSize={adSize} state={state} />
                  </div>
                </div>
              )}

              {/* Article Content Area */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Main Article column */}
                <div className="md:col-span-8 space-y-4">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Infrastructure & Privacy
                  </span>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                    The Modern Storage Paradigm: Why Zero-Knowledge Encryption and Fair Quotas Matter
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 pb-4 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-100">
                      TC
                    </div>
                    <span>By Tech Analyst Staff</span>
                    <span>•</span>
                    <span>4 min read</span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed font-sans">
                    With over 175 zettabytes of global data forecast by analyst firms, legacy cloud storage models are buckling under bloated subscription tiers and intrusive telemetry scanning. Modern engineering teams and independent creators demand private, zero-trust infrastructure without punitive paywalls.
                  </p>

                  {/* Inline Ad Slot for Medium Rectangle or Large Rectangle */}
                  {(adSize.id === 'medium_rectangle' || adSize.id === 'large_rectangle') && (
                    <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono mb-1.5">
                        Sponsored Placement
                      </span>
                      <div className="shadow-lg rounded-sm overflow-hidden ring-1 ring-slate-900/10">
                        <AdDisplayRenderer adSize={adSize} state={state} />
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-600 leading-relaxed font-sans">
                    Role-based access controls and granular moderation tools allow organizations to delegate administrative capabilities without compromising zero-knowledge encryption guarantees. As users push past the boundaries of traditional providers, innovative freemium models offer an enticing alternative.
                  </p>
                </div>

                {/* Sidebar Ad Column (For Skyscraper, Half Page, or Square) */}
                <div className="md:col-span-4 space-y-4 flex flex-col items-center border-l border-slate-100 pl-0 md:pl-6">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    Partner Showcase
                  </span>
                  <div className="shadow-lg rounded-sm overflow-hidden sticky top-4 ring-1 ring-slate-900/10">
                    <AdDisplayRenderer
                      adSize={adSize}
                      state={state}
                      scale={adSize.width > 340 ? 0.8 : 1}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {mockupType === 'mobile' && (
            // Mobile Smartphone Screen Mockup
            <div className="w-full max-w-sm rounded-[42px] p-3.5 bg-slate-900 border-4 border-slate-800 shadow-2xl relative">
              {/* Dynamic Island / Speaker notch */}
              <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 relative flex items-center justify-end px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
              </div>

              {/* Screen viewport */}
              <div className="rounded-[32px] bg-white border border-slate-200 overflow-hidden flex flex-col h-[580px]">
                {/* Mobile App Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-800">
                  <span className="font-bold text-slate-900">DailyFeed</span>
                  <div className="flex gap-2">
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Mobile Feed Body */}
                <div className="p-4 flex-1 overflow-y-auto space-y-4 text-slate-700 bg-slate-50/40">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">
                      Trending Now
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      Cloud Security Report: Why Zero-Knowledge Architecture Prevents Leaks
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      New benchmark tests reveal sub-2s upload times with client-side encryption.
                    </p>
                  </div>

                  {/* Mid-feed Ad Placement */}
                  <div className="py-2 flex flex-col items-center justify-center">
                    <div className="shadow-lg rounded-sm overflow-hidden ring-1 ring-slate-900/10">
                      <AdDisplayRenderer
                        adSize={adSize}
                        state={state}
                        scale={adSize.width > 300 ? 280 / adSize.width : 1}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    User surveys show 82% of freemium cloud users exhaust their free tiers within 6 months, driving immense demand for transparent 15GB permanent storage with team management features.
                  </p>
                </div>

                {/* Sticky Mobile Banner at bottom if mobile format */}
                {(adSize.id === 'mobile_leaderboard' || adSize.id === 'large_mobile_banner') && (
                  <div className="border-t border-slate-200 bg-white p-1 flex items-center justify-center">
                    <AdDisplayRenderer adSize={adSize} state={state} scale={1} />
                  </div>
                )}
              </div>
            </div>
          )}

          {mockupType === 'social' && (
            // Social Feed Post Mockup
            <div className="w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-xl p-5 space-y-4 text-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-indigo-600">
                      {state.copy.brandName.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900">
                        {state.copy.brandName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-normal">Sponsored</span>
                    </div>
                    <span className="text-xs text-slate-500">{state.copy.urlDisplay}</span>
                  </div>
                </div>
                <button type="button" className="text-slate-400 hover:text-slate-600">
                  •••
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {state.copy.subheadline} Get started with {state.copy.headline} today.
              </p>

              {/* Ad Creative Container */}
              <div className="rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50 p-2">
                <div className="shadow-md rounded-sm overflow-hidden ring-1 ring-slate-900/10">
                  <AdDisplayRenderer
                    adSize={adSize}
                    state={state}
                    scale={adSize.width > 440 ? 440 / adSize.width : 1}
                  />
                </div>
              </div>

              {/* Engagement row */}
              <div className="flex items-center justify-between text-slate-400 text-xs pt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-rose-500 font-semibold">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    1.4K
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    84
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    312
                  </span>
                </div>
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
