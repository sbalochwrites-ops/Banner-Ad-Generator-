import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy GoogleGenAI initialization helper
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Endpoint: Analyze product & generate ad copy variants and style
app.post('/api/analyze-product', async (req, res) => {
  try {
    const {
      productUrl,
      productDescription,
      targetAudience,
      campaignGoal,
      brandTone,
    } = req.body;

    if (!productDescription && !productUrl) {
      return res.status(400).json({ error: 'Please provide at least a product description or URL.' });
    }

    const ai = getGenAIClient();

    const prompt = `You are an elite digital advertising creative director specializing in high-converting Google Display Network and programmatic banner ads.
Analyze the provided product details and craft 3 to 5 distinct variations of concise, persuasive ad headlines and body copy suitable for banner ads, optimized for a clear call-to-action and aligned with the target audience.

PRODUCT URL: ${productUrl || 'N/A'}
PRODUCT DESCRIPTION / PITCH:
${productDescription || 'N/A'}
TARGET AUDIENCE: ${targetAudience || 'General commercial audience'}
CAMPAIGN GOAL: ${campaignGoal || 'High conversions and brand trust'}
DESIRED BRAND TONE: ${brandTone || 'Modern, high trust, clear value'}

CRITICAL REQUIREMENTS:
Generate 3 to 5 distinct variations of copy. Each variation should target a distinct persuasive angle suitable for banner ads:
- Variation 1: Direct Value & Primary Offer (crystal-clear value proposition, e.g. "Free 15GB Forever", highest utility)
- Variation 2: Urgency & Conversion / Incentive (compelling hook, fear of missing out, immediate action)
- Variation 3: Problem vs. Solution / Frustration Relief (highlighting the customer pain point and your effortless fix)
- Variation 4: Feature Focus & Social Proof / Trust (highlighting key technical superiority, zero-trust, privacy, or reliability)
- (Optional Variation 5): Competitive Edge / Dual Roles / Team Benefit

Each variation must include:
- id: unique string e.g. "var-1", "var-2", etc.
- angle: short strategy title, e.g. "Direct Value & Offer", "Urgency & Incentive", "Pain Point & Solution", "Privacy & Social Proof"
- headline: punchy headline for medium/large banners (under 7 words, compelling hook)
- shortHeadline: ultra-compact headline for small banners & mobile sticky sizes (under 4 words)
- subheadline: persuasive secondary body copy (8-14 words)
- shortSubheadline: condensed body copy (4-7 words)
- badgeText: urgency or trust badge, e.g., "15GB Free Forever", "Save 50%", "Zero-Knowledge", "No Credit Card Required" (2-4 words)
- ctaText: high-converting action button text, e.g., "Get 15GB Free", "Start Free Trial", "Claim Offer", "Try Now" (2-4 words)

Also provide the global metadata:
- brandName: Crisp brand or product name (1-3 words)
- brandTagline: Short sub-brand or category descriptor (2-5 words)
- headline: Default primary headline (matching variation 1)
- shortHeadline: Default short headline (matching variation 1)
- subheadline: Default body copy (matching variation 1)
- shortSubheadline: Default short body copy (matching variation 1)
- badgeText: Default badge (matching variation 1)
- ctaText: Default CTA (matching variation 1)
- urlDisplay: Clean domain string to show in ad footer, e.g. "cloudvault.app"
- targetUrl: Web address
- primaryColor: Dominant brand hex color (e.g., #2563EB or #7C3AED)
- secondaryColor: Supporting gradient/accent hex color (e.g., #06B6D4)
- accentColor: High-contrast button/badge accent hex color (e.g., #F59E0B or #38BDF8)
- backgroundColor: Dark/rich background hex color for optimal text readability (e.g., #0A0F1D)
- textColor: Light text hex color (e.g., #FFFFFF)
- theme: One of 'modern-dark', 'sleek-light', 'vibrant-gradient', 'cyber-glow', 'minimal-clean'
- imagePrompt: A detailed, commercial advertising background image prompt tailored for AI image generation (e.g., modern datacenter with glowing cyan servers, or sleek lifestyle product photography, 8k cinematic lighting, minimal background noise allowing text overlay).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            brandTagline: { type: Type.STRING },
            headline: { type: Type.STRING },
            shortHeadline: { type: Type.STRING },
            subheadline: { type: Type.STRING },
            shortSubheadline: { type: Type.STRING },
            badgeText: { type: Type.STRING },
            ctaText: { type: Type.STRING },
            urlDisplay: { type: Type.STRING },
            targetUrl: { type: Type.STRING },
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            accentColor: { type: Type.STRING },
            backgroundColor: { type: Type.STRING },
            textColor: { type: Type.STRING },
            theme: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  angle: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  shortHeadline: { type: Type.STRING },
                  subheadline: { type: Type.STRING },
                  shortSubheadline: { type: Type.STRING },
                  badgeText: { type: Type.STRING },
                  ctaText: { type: Type.STRING },
                },
                required: [
                  'id',
                  'angle',
                  'headline',
                  'shortHeadline',
                  'subheadline',
                  'shortSubheadline',
                  'badgeText',
                  'ctaText',
                ],
              },
            },
          },
          required: [
            'brandName',
            'brandTagline',
            'headline',
            'shortHeadline',
            'subheadline',
            'shortSubheadline',
            'badgeText',
            'ctaText',
            'urlDisplay',
            'targetUrl',
            'primaryColor',
            'secondaryColor',
            'accentColor',
            'backgroundColor',
            'textColor',
            'theme',
            'imagePrompt',
            'variations',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const parsedData = JSON.parse(text);
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error analyzing product:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze product and generate banner copy.',
    });
  }
});

// Endpoint: Generate high-quality image with user-specified size & aspect ratio
// Supported models: 'gemini-3-pro-image-preview' (studio quality) or 'gemini-3.1-flash-image-preview' (fast)
// Image sizes: '1K', '2K', '4K'
// Aspect ratios: '1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      model = 'gemini-3-pro-image-preview',
      imageSize = '1K',
      aspectRatio = '16:9',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Image prompt is required.' });
    }

    const ai = getGenAIClient();

    // Model selection validation
    const targetModel =
      model === 'gemini-3.1-flash-image-preview'
        ? 'gemini-3.1-flash-image-preview'
        : 'gemini-3-pro-image-preview';

    console.log(`Generating image with model: ${targetModel}, size: ${imageSize}, aspect: ${aspectRatio}`);

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: {
        parts: [
          {
            text: `Commercial advertising background imagery: ${prompt}. High aesthetic advertising visual, clean composition with negative space for typography overlay, cinematic soft lighting, 8k commercial quality.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    let imageUrl: string | null = null;
    let fallbackText: string | null = null;

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          fallbackText = part.text;
        }
      }
    }

    if (!imageUrl) {
      throw new Error(fallbackText || 'Model did not return image data.');
    }

    res.json({
      success: true,
      imageUrl,
      model: targetModel,
      imageSize,
      aspectRatio,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-image:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate image via Gemini.',
    });
  }
});

// Vite Middleware & Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // In Express v4, wildcard is '*'
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Banner Ad Generator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
