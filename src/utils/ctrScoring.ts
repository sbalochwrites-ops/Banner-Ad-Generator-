import { BannerAdState, AdCopyVariation } from '../types';

export interface CtrMetricResult {
  estimatedCtr: number; // e.g. 2.85 (%)
  benchmarkAverage: number; // e.g. 0.55 (%)
  vsBenchmarkMultiplier: string; // e.g. "+418%"
  engagementScore: number; // 0 - 100
  tierLabel: 'Exceptional' | 'High Impact' | 'Solid' | 'Moderate';
  tierColor: string;
  breakdown: {
    copyClarity: number; // 0 - 100
    ctaDrive: number; // 0 - 100
    visualContrast: number; // 0 - 100
    valueOffer: number; // 0 - 100
  };
  strengths: string[];
  suggestions: string[];
}

/**
 * Calculates a simulated relative luminance of a hex color
 */
function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.length === 3 ? clean[0] + clean[0] : clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.length === 3 ? clean[1] + clean[1] : clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.length === 3 ? clean[2] + clean[2] : clean.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates contrast ratio between two hex colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 4.5;
  }
}

const ACTION_VERBS = [
  'get',
  'start',
  'try',
  'claim',
  'explore',
  'discover',
  'upgrade',
  'download',
  'join',
  'save',
  'unlock',
  'switch',
  'build',
  'launch',
];

const POWER_WORDS = [
  'free',
  'instant',
  'zero',
  'forever',
  'unlimited',
  'guaranteed',
  'exclusive',
  'new',
  'save',
  'secure',
  'private',
  'fast',
  'now',
  'today',
  'proven',
  'smart',
  'ai',
];

/**
 * Evaluates the banner copy and styling using simulated ad performance heuristics
 */
export function calculateCtrScore(
  state: BannerAdState,
  adSizeMultiplier: number = 1.0
): CtrMetricResult {
  const { copy, style } = state;
  const headline = (copy.headline || '').trim();
  const cta = (copy.ctaText || '').trim();
  const subheadline = (copy.subheadline || '').trim();
  const badge = (copy.badgeText || '').trim();

  // 1. Copy Clarity (0-100)
  let copyScore = 70;
  const wordCount = headline.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 4 && wordCount <= 9) {
    copyScore += 14; // optimal headline length
  } else if (wordCount > 12) {
    copyScore -= 10; // too wordy
  }

  // Check power words in headline or subheadline
  const lowerText = `${headline} ${subheadline}`.toLowerCase();
  let powerWordHits = 0;
  POWER_WORDS.forEach((pw) => {
    if (lowerText.includes(pw)) powerWordHits++;
  });
  copyScore += Math.min(16, powerWordHits * 5);

  // Numbers or metrics boost CTR
  if (/\d+%|\d+gb|\$\d+|\d+x|\d+\+/i.test(lowerText)) {
    copyScore += 10;
  }
  copyScore = Math.min(100, Math.max(40, copyScore));

  // 2. CTA Drive (0-100)
  let ctaScore = 65;
  const lowerCta = cta.toLowerCase();
  const startsWithAction = ACTION_VERBS.some((v) => lowerCta.startsWith(v));
  if (startsWithAction) {
    ctaScore += 18;
  }
  if (lowerCta.includes('free') || lowerCta.includes('now') || lowerCta.includes('instant')) {
    ctaScore += 12;
  }
  const ctaWords = cta.split(/\s+/).filter(Boolean).length;
  if (ctaWords >= 2 && ctaWords <= 4) {
    ctaScore += 8;
  }
  ctaScore = Math.min(100, Math.max(45, ctaScore));

  // 3. Visual Contrast (0-100)
  let contrastScore = 60;
  const accentContrast = getContrastRatio(style.accentColor || '#38BDF8', style.backgroundColor || '#0A0F1D');
  if (accentContrast >= 7) {
    contrastScore = 95;
  } else if (accentContrast >= 4.5) {
    contrastScore = 85;
  } else if (accentContrast >= 3) {
    contrastScore = 70;
  } else {
    contrastScore = 50;
  }

  // Logo bonus
  if (state.logoUrl) {
    contrastScore = Math.min(100, contrastScore + 5);
  }

  // 4. Value Offer & Trust Badge (0-100)
  let valueScore = 60;
  if (badge) {
    valueScore += 20;
    if (/\d+|free|save/i.test(badge)) {
      valueScore += 15;
    }
  }
  if (state.copy.urlDisplay) {
    valueScore += 5;
  }
  valueScore = Math.min(100, Math.max(40, valueScore));

  // Weighted overall engagement score
  const weightedTotal =
    copyScore * 0.35 + ctaScore * 0.3 + contrastScore * 0.2 + valueScore * 0.15;
  const engagementScore = Math.round(Math.min(99, Math.max(50, weightedTotal)));

  // Simulated CTR calculation calibrated against Display Ad Benchmarks
  // Average display benchmark = 0.55%
  // Good display ads = 1.5% - 3.8%
  const baseCtr = 0.55 + (engagementScore / 100) * 2.75;
  const finalCtr = Number((baseCtr * adSizeMultiplier).toFixed(2));
  const benchmarkAverage = 0.55;
  const multiplierPct = Math.round(((finalCtr - benchmarkAverage) / benchmarkAverage) * 100);

  // Determine Tier
  let tierLabel: 'Exceptional' | 'High Impact' | 'Solid' | 'Moderate' = 'Solid';
  let tierColor = '#10B981'; // emerald
  if (engagementScore >= 88) {
    tierLabel = 'Exceptional';
    tierColor = '#10B981'; // emerald
  } else if (engagementScore >= 75) {
    tierLabel = 'High Impact';
    tierColor = '#3B82F6'; // blue
  } else if (engagementScore >= 62) {
    tierLabel = 'Solid';
    tierColor = '#F59E0B'; // amber
  } else {
    tierLabel = 'Moderate';
    tierColor = '#EF4444'; // red
  }

  // Key Strengths
  const strengths: string[] = [];
  if (startsWithAction) {
    strengths.push(`Direct action verb "${cta.split(' ')[0]}" drives click intent.`);
  }
  if (accentContrast >= 4.5) {
    strengths.push(`High CTA color contrast (${accentContrast.toFixed(1)}:1) maximizes visual saliency.`);
  }
  if (badge) {
    strengths.push(`Prominent value badge "${badge}" pre-qualifies high-intent users.`);
  }
  if (/\d+%|\d+gb|\$\d+|\d+x/i.test(lowerText)) {
    strengths.push('Concrete numerical metrics establish tangible proof.');
  }

  // Dynamic Suggestions
  const suggestions: string[] = [];
  if (!startsWithAction) {
    suggestions.push('Lead your CTA with an active verb like "Get", "Try", or "Claim".');
  }
  if (!badge) {
    suggestions.push('Add an incentive badge (e.g. "Limited Time" or "15GB Free") to lift engagement.');
  }
  if (accentContrast < 4.5) {
    suggestions.push('Increase the contrast of your CTA accent color against the dark canvas.');
  }
  if (wordCount > 10) {
    suggestions.push('Shorten the main headline to 5-8 words for faster glanceability.');
  }
  if (suggestions.length === 0) {
    suggestions.push('A/B test this winning variation against an urgency-driven discount angle.');
  }

  return {
    estimatedCtr: finalCtr,
    benchmarkAverage,
    vsBenchmarkMultiplier: `+${multiplierPct}%`,
    engagementScore,
    tierLabel,
    tierColor,
    breakdown: {
      copyClarity: copyScore,
      ctaDrive: ctaScore,
      visualContrast: contrastScore,
      valueOffer: valueScore,
    },
    strengths,
    suggestions,
  };
}

/**
 * Format multiplier mapping based on industry size benchmarks
 */
export const FORMAT_CTR_MULTIPLIERS: Record<string, number> = {
  medium_rectangle: 1.15,
  large_rectangle: 1.18,
  half_page: 1.32, // high impact portrait
  billboard: 1.25, // prominent desktop header
  leaderboard: 1.0,
  large_leaderboard: 1.12,
  mobile_leaderboard: 0.88,
  square: 0.95,
  small_square: 0.92,
  wide_skyscraper: 1.05,
  social_landscape: 1.28,
};
