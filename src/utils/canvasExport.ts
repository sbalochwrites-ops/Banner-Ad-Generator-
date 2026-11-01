import JSZip from 'jszip';
import { AdSizeDefinition, BannerAdState } from '../types';

/**
 * Draws a banner ad onto an HTMLCanvasElement with crisp typography,
 * background image, gradient overlays, and vectors.
 */
export async function renderBannerToCanvas(
  adSize: AdSizeDefinition,
  state: BannerAdState,
  scale: number = 2 // 2x for crisp Retina export
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = adSize.width * scale;
  canvas.height = adSize.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.scale(scale, scale);
  const w = adSize.width;
  const h = adSize.height;

  // 1. Draw Background
  ctx.fillStyle = state.style.backgroundColor;
  ctx.fillRect(0, 0, w, h);

  // 2. Draw Image if available
  if (state.imageUrl) {
    try {
      const img = await loadImage(state.imageUrl);
      // Cover fit
      const imgAspect = img.width / img.height;
      const canvasAspect = w / h;
      let drawW = w;
      let drawH = h;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > canvasAspect) {
        drawH = h;
        drawW = h * imgAspect;
        offsetX = (w - drawW) / 2;
      } else {
        drawW = w;
        drawH = w / imgAspect;
        offsetY = (h - drawH) / 2;
      }

      ctx.save();
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    } catch (e) {
      console.warn('Could not load image for canvas export, using gradient background', e);
    }
  }

  // 3. Draw Gradient Overlay for text contrast
  ctx.save();
  let overlayGradient: CanvasGradient;
  const opacity = Math.min(0.9, Math.max(0.3, state.style.overlayOpacity));

  if (adSize.layoutOrientation === 'horizontal' || adSize.layoutOrientation === 'micro') {
    // Horizontal left-to-right fade
    overlayGradient = ctx.createLinearGradient(0, 0, w, 0);
    overlayGradient.addColorStop(0, hexToRgba(state.style.backgroundColor, opacity + 0.15));
    overlayGradient.addColorStop(0.55, hexToRgba(state.style.backgroundColor, opacity));
    overlayGradient.addColorStop(1, hexToRgba(state.style.backgroundColor, Math.max(0.1, opacity - 0.2)));
  } else if (adSize.layoutOrientation === 'vertical' || adSize.layoutOrientation === 'tall') {
    // Vertical top-to-bottom fade
    overlayGradient = ctx.createLinearGradient(0, 0, 0, h);
    overlayGradient.addColorStop(0, hexToRgba(state.style.backgroundColor, opacity + 0.1));
    overlayGradient.addColorStop(0.5, hexToRgba(state.style.backgroundColor, opacity));
    overlayGradient.addColorStop(1, hexToRgba(state.style.backgroundColor, opacity + 0.15));
  } else {
    // Square/Radial
    overlayGradient = ctx.createLinearGradient(0, 0, 0, h);
    overlayGradient.addColorStop(0, hexToRgba(state.style.backgroundColor, opacity + 0.1));
    overlayGradient.addColorStop(0.65, hexToRgba(state.style.backgroundColor, opacity));
    overlayGradient.addColorStop(1, hexToRgba(state.style.backgroundColor, opacity + 0.15));
  }

  ctx.fillStyle = overlayGradient;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

  // 4. Load Logo if available
  let logoImg: HTMLImageElement | null = null;
  if (state.logoUrl) {
    try {
      logoImg = await loadImage(state.logoUrl);
    } catch (e) {
      console.warn('Could not load logo for canvas export:', e);
    }
  }

  // 5. Draw Typography & UI based on dimensions
  drawAdContent(ctx, adSize, state, w, h, logoImg);

  return canvas;
}

function drawAdContent(
  ctx: CanvasRenderingContext2D,
  adSize: AdSizeDefinition,
  state: BannerAdState,
  w: number,
  h: number,
  logoImg: HTMLImageElement | null = null
) {
  const { copy, style } = state;
  const padding = Math.max(8, Math.min(24, Math.min(w, h) * 0.08));

  // Handle micro banner (320x50)
  if (adSize.id === 'mobile_leaderboard') {
    // Logo / Brand
    if (logoImg) {
      const logoH = 18;
      const aspect = logoImg.width / logoImg.height;
      const logoW = Math.min(65, logoH * aspect);
      ctx.drawImage(logoImg, padding, (h - logoH) / 2 - 8, logoW, logoH);
    } else {
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.fillStyle = style.textColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(copy.brandName, padding, h / 2 - 8);
    }

    // Headline
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(copy.shortHeadline || copy.headline, padding, h / 2 + 9);

    // CTA Button on right
    const ctaW = 84;
    const ctaH = 30;
    const ctaX = w - ctaW - padding;
    const ctaY = (h - ctaH) / 2;

    roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 6);
    ctx.fillStyle = style.accentColor;
    ctx.fill();

    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(copy.ctaText, ctaX + ctaW / 2, ctaY + ctaH / 2);
    return;
  }

  // Handle Leaderboard (728x90) and Billboard (970x250)
  if (adSize.layoutOrientation === 'horizontal') {
    const isSlim = h <= 100;
    const brandFontSize = isSlim ? 13 : 18;
    const headlineFontSize = isSlim ? 16 : 26;
    const subFontSize = isSlim ? 11 : 14;

    let brandEndOffset = padding;

    // Logo / Brand + Badge
    if (logoImg) {
      const targetH = isSlim ? 22 : 32;
      const aspect = logoImg.width / logoImg.height;
      const targetW = Math.min(isSlim ? 110 : 150, targetH * aspect);
      ctx.drawImage(logoImg, padding, padding, targetW, targetH);
      brandEndOffset = padding + targetW;
    } else {
      ctx.font = `bold ${brandFontSize}px "Outfit", sans-serif`;
      ctx.fillStyle = style.accentColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(copy.brandName.toUpperCase(), padding, padding);
      brandEndOffset = padding + ctx.measureText(copy.brandName.toUpperCase()).width;
    }

    // Badge Pill next to brand if billboard
    if (!isSlim && copy.badgeText) {
      const badgeText = copy.badgeText;
      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      const badgeW = ctx.measureText(badgeText).width + 16;
      const badgeX = brandEndOffset + 12;
      roundRect(ctx, badgeX, padding, badgeW, 20, 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(badgeText, badgeX + 8, padding + 4);
    }

    // Headline
    const headlineY = isSlim ? padding + 22 : padding + 38;
    ctx.font = `bold ${headlineFontSize}px "Outfit", sans-serif`;
    ctx.fillStyle = style.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const headlineText = isSlim ? (copy.shortHeadline || copy.headline) : copy.headline;
    ctx.fillText(truncateText(ctx, headlineText, w * 0.6), padding, headlineY);

    // Subheadline
    if (!isSlim) {
      ctx.font = `400 ${subFontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(truncateText(ctx, copy.subheadline, w * 0.6), padding, headlineY + headlineFontSize + 10);
    }

    // CTA Button
    const ctaW = isSlim ? 110 : 150;
    const ctaH = isSlim ? 38 : 46;
    const ctaX = w - ctaW - padding * 1.2;
    const ctaY = (h - ctaH) / 2;

    roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 8);
    ctx.fillStyle = style.accentColor;
    ctx.fill();

    ctx.font = `bold ${isSlim ? 12 : 14}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(copy.ctaText, ctaX + ctaW / 2, ctaY + ctaH / 2);

    // Domain display below CTA
    ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(copy.urlDisplay, ctaX + ctaW / 2, ctaY + ctaH + 12);
    return;
  }

  // Handle Tall Vertical Ads (160x600, 300x600, 1080x1920)
  if (adSize.layoutOrientation === 'vertical' || adSize.layoutOrientation === 'tall') {
    const isNarrow = w <= 180;
    let currentY = padding;

    // Brand Name or Logo
    if (logoImg) {
      const maxH = isNarrow ? 26 : 38;
      const aspect = logoImg.width / logoImg.height;
      const maxW = Math.min(w - padding * 2, isNarrow ? 100 : 150);
      const drawW = Math.min(maxW, maxH * aspect);
      const drawH = drawW / aspect;
      ctx.drawImage(logoImg, (w - drawW) / 2, currentY, drawW, drawH);
      currentY += drawH + 10;
    } else {
      ctx.font = `bold ${isNarrow ? 12 : 16}px "Outfit", sans-serif`;
      ctx.fillStyle = style.accentColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(copy.brandName.toUpperCase(), w / 2, currentY);
      currentY += isNarrow ? 22 : 30;
    }

    // Badge
    if (copy.badgeText) {
      const badgeW = Math.min(w - padding * 2, isNarrow ? 130 : 180);
      const badgeH = 22;
      roundRect(ctx, (w - badgeW) / 2, currentY, badgeW, badgeH, 11);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();

      ctx.font = `600 ${isNarrow ? 9 : 11}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(copy.badgeText, w / 2, currentY + badgeH / 2);
      currentY += badgeH + (isNarrow ? 16 : 28);
    }

    // Headline
    const headlineFontSize = isNarrow ? 16 : (adSize.id === 'story_vertical' ? 42 : 24);
    ctx.font = `bold ${headlineFontSize}px "Outfit", sans-serif`;
    ctx.fillStyle = style.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const words = (isNarrow ? (copy.shortHeadline || copy.headline) : copy.headline).split(' ');
    let line = '';
    const maxLineW = w - padding * 2;
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      if (ctx.measureText(testLine).width > maxLineW) {
        ctx.fillText(line, w / 2, currentY);
        currentY += headlineFontSize * 1.25;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, w / 2, currentY);
      currentY += headlineFontSize * 1.35;
    }

    // Subheadline (if not too cramped)
    if (!isNarrow && h >= 400) {
      ctx.font = `400 ${adSize.id === 'story_vertical' ? 22 : 13}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      const subWords = copy.subheadline.split(' ');
      let subLine = '';
      for (const word of subWords) {
        const testLine = subLine + (subLine ? ' ' : '') + word;
        if (ctx.measureText(testLine).width > maxLineW) {
          ctx.fillText(subLine, w / 2, currentY);
          currentY += 18;
          subLine = word;
        } else {
          subLine = testLine;
        }
      }
      if (subLine) {
        ctx.fillText(subLine, w / 2, currentY);
      }
    }

    // CTA Button near bottom
    const ctaW = Math.min(w - padding * 2, isNarrow ? 130 : 200);
    const ctaH = isNarrow ? 36 : (adSize.id === 'story_vertical' ? 64 : 44);
    const ctaX = (w - ctaW) / 2;
    const ctaY = h - ctaH - padding * 2;

    roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 8);
    ctx.fillStyle = style.accentColor;
    ctx.fill();

    ctx.font = `bold ${isNarrow ? 11 : (adSize.id === 'story_vertical' ? 20 : 13)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(copy.ctaText, w / 2, ctaY + ctaH / 2);

    // URL below CTA
    ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillText(copy.urlDisplay, w / 2, ctaY + ctaH + 14);
    return;
  }

  // Standard Rectangles and Squares (300x250, 336x280, 250x250, 1200x628)
  let curY = padding;

  // Header Row: Brand Logo/Name + Badge
  if (logoImg) {
    const logoH = 24;
    const aspect = logoImg.width / logoImg.height;
    const logoW = Math.min(110, logoH * aspect);
    ctx.drawImage(logoImg, padding, curY, logoW, logoH);
  } else {
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillStyle = style.accentColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(copy.brandName.toUpperCase(), padding, curY);
  }

  if (copy.badgeText) {
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    const badgeW = ctx.measureText(copy.badgeText).width + 14;
    const badgeX = w - padding - badgeW;
    roundRect(ctx, badgeX, curY - 2, badgeW, 20, 10);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(copy.badgeText, badgeX + badgeW / 2, curY + 8);
  }

  curY += 28;

  // Headline
  const headlineSize = w > 600 ? 32 : (w <= 260 ? 16 : 19);
  ctx.font = `bold ${headlineSize}px "Outfit", sans-serif`;
  ctx.fillStyle = style.textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const maxTextW = w - padding * 2;
  const headlineWords = copy.headline.split(' ');
  let currentLine = '';
  let lineCount = 0;
  for (const word of headlineWords) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (ctx.measureText(testLine).width > maxTextW) {
      ctx.fillText(currentLine, padding, curY);
      curY += headlineSize * 1.25;
      currentLine = word;
      lineCount++;
      if (lineCount >= 3) break;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lineCount < 3) {
    ctx.fillText(currentLine, padding, curY);
    curY += headlineSize * 1.25;
  }

  curY += 6;

  // Subheadline
  if (h >= 240) {
    ctx.font = '400 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(truncateText(ctx, copy.subheadline, maxTextW), padding, curY);
  }

  // Footer: CTA Button & URL
  const ctaW = Math.min(150, w - padding * 2);
  const ctaH = 38;
  const ctaY = h - ctaH - padding;

  roundRect(ctx, padding, ctaY, ctaW, ctaH, 8);
  ctx.fillStyle = style.accentColor;
  ctx.fill();

  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(copy.ctaText, padding + ctaW / 2, ctaY + ctaH / 2);

  // URL Display to right of CTA
  ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.textAlign = 'right';
  ctx.fillText(copy.urlDisplay, w - padding, ctaY + ctaH / 2);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 3 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(15, 23, 42, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Downloads a single banner as PNG
 */
export async function downloadBannerPng(adSize: AdSizeDefinition, state: BannerAdState) {
  const canvas = await renderBannerToCanvas(adSize, state, 2);
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  const safeBrand = (state.copy.brandName || 'ad').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `${safeBrand}_banner_${adSize.width}x${adSize.height}_${adSize.id}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Packages all banner sizes into a ZIP archive and triggers download
 */
export async function downloadAllBannersZip(
  adSizes: AdSizeDefinition[],
  state: BannerAdState,
  onProgress?: (current: number, total: number) => void
) {
  const zip = new JSZip();
  const folder = zip.folder('banner-ads');
  const safeBrand = (state.copy.brandName || 'ad').toLowerCase().replace(/[^a-z0-9]/g, '_');

  for (let i = 0; i < adSizes.length; i++) {
    const size = adSizes[i];
    if (onProgress) onProgress(i + 1, adSizes.length);
    const canvas = await renderBannerToCanvas(size, state, 2);
    const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    folder?.file(`${safeBrand}_${size.width}x${size.height}_${size.id}.png`, base64Data, { base64: true });
  }

  // Include metadata readme
  folder?.file(
    'README.txt',
    `High-Quality Display Banner Ad Campaign
Brand: ${state.copy.brandName}
Target URL: ${state.copy.targetUrl}
Generated with Gemini Models (Image: ${state.imageModel} @ ${state.imageSize})
Ad Sizes Included:
${adSizes.map((s) => `- ${s.name} (${s.width}x${s.height}) [${s.category}]`).join('\n')}
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = `${safeBrand}_all_banners_pack.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Generates an embeddable HTML/CSS code snippet for standard IAB display ad networks
 */
export function generateEmbedSnippet(adSize: AdSizeDefinition, state: BannerAdState): string {
  const { copy, style } = state;
  return `<!-- ${adSize.name} Banner Ad (${adSize.width}x${adSize.height}) -->
<div class="ad-container" style="position: relative; width: ${adSize.width}px; height: ${adSize.height}px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${style.backgroundColor}; border: 1px solid rgba(255,255,255,0.1); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 16px;">
  <!-- Background Visual -->
  <div style="position: absolute; inset: 0; background-image: url('${state.imageUrl}'); background-size: cover; background-position: center; opacity: 0.45; z-index: 1;"></div>
  <!-- Content -->
  <div style="position: relative; z-index: 2;">
    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${style.accentColor};">${copy.brandName}</span>
    <h3 style="margin: 6px 0; font-size: 18px; font-weight: 800; color: ${style.textColor}; line-height: 1.2;">${copy.headline}</h3>
    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.85);">${copy.subheadline}</p>
  </div>
  <div style="position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between;">
    <a href="${copy.targetUrl}" target="_blank" rel="noopener" style="background: ${style.accentColor}; color: #0f172a; padding: 8px 18px; font-size: 12px; font-weight: 700; text-decoration: none; border-radius: 6px;">${copy.ctaText} &rarr;</a>
    <span style="font-size: 10px; color: rgba(255,255,255,0.6);">${copy.urlDisplay}</span>
  </div>
</div>`;
}
