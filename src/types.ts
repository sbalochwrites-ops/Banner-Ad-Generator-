export type AdCategory = 'all' | 'iab_display' | 'mobile' | 'social';

export type AspectRatioType = 
  | '1:1' 
  | '2:3' 
  | '3:2' 
  | '3:4' 
  | '4:3' 
  | '9:16' 
  | '16:9' 
  | '21:9';

export type ImageSizeType = '1K' | '2K' | '4K';

export type ImageModelType = 'gemini-3-pro-image-preview' | 'gemini-3.1-flash-image-preview';

export interface AdSizeDefinition {
  id: string;
  name: string;
  iabName: string;
  width: number;
  height: number;
  category: 'iab_display' | 'mobile' | 'social';
  description: string;
  recommendedAspectRatio: AspectRatioType;
  layoutOrientation: 'horizontal' | 'vertical' | 'square' | 'micro' | 'tall';
  popularityBadge?: string;
}

export interface AdCopyVariation {
  id: string;
  angle: string; // e.g., "Direct Value & Offer", "Security & Social Proof", "Urgency & Incentive", "Feature High-Performance"
  headline: string;
  shortHeadline: string;
  subheadline: string;
  shortSubheadline: string;
  badgeText: string;
  ctaText: string;
}

export interface BannerAdCopy {
  brandName: string;
  brandTagline: string;
  headline: string;
  shortHeadline: string; // for ultra compact sizes
  subheadline: string;
  shortSubheadline: string;
  badgeText: string;
  ctaText: string;
  urlDisplay: string;
  targetUrl: string;
}

export interface BannerAdStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  overlayOpacity: number; // 0 to 0.9
  theme: 'modern-dark' | 'sleek-light' | 'vibrant-gradient' | 'cyber-glow' | 'minimal-clean';
}

export interface BannerAdState {
  copy: BannerAdCopy;
  style: BannerAdStyle;
  imageUrl: string;
  imagePrompt: string;
  imageModel: ImageModelType;
  imageSize: ImageSizeType;
  aspectRatio: AspectRatioType;
  logoUrl?: string;
  variations?: AdCopyVariation[];
  activeVariationId?: string;
}

export interface BrandColorConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
}

export interface ProductInput {
  productUrl: string;
  productDescription: string;
  targetAudience: string;
  campaignGoal: string;
  brandTone: string;
  imageModel: ImageModelType;
  imageSize: ImageSizeType;
  preferredAspectRatio: AspectRatioType;
  logoUrl?: string;
  brandColors?: BrandColorConfig;
}

