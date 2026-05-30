import { useEffect } from 'react';
import { getMediaUrl } from '../api';

// Utilities for color manipulation
export const hexToRgb = (hex) => {
  let r = 0, g = 0, b = 0;
  if (!hex) return { r, g, b };
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return { r, g, b };
};

export const getLuminance = (r, g, b) => {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getContrastColor = (hexColor) => {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  const { r, g, b } = hexToRgb(hexColor);
  const luminance = getLuminance(r, g, b);
  // WCAG recommendation: use dark text if luminance is high, else white.
  return luminance > 0.5 ? '#18181b' : '#ffffff';
};

// amount is typically negative for darkening (-20) and positive for lightening (20)
export const adjustBrightness = (hexColor, amount) => {
  if (!hexColor || !hexColor.startsWith('#')) return hexColor;
  let usePound = false;
  if (hexColor[0] == "#") {
    hexColor = hexColor.slice(1);
    usePound = true;
  }
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  if (hexColor.length === 3) {
    hexColor = hexColor.split('').map(c => c + c).join('');
  }
  
  let R = parseInt(hexColor.substring(0,2),16);
  let G = parseInt(hexColor.substring(2,4),16);
  let B = parseInt(hexColor.substring(4,6),16);

  R = R + amount;
  G = G + amount;
  B = B + amount;

  if (R > 255) R = 255;
  else if (R < 0) R = 0;

  if (G > 255) G = 255;
  else if (G < 0) G = 0;

  if (B > 255) B = 255;
  else if (B < 0) B = 0;

  const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return (usePound?"#":"") + RR + GG + BB;
}

export const extractDominantColor = (imageUrl, callback) => {
  if (!imageUrl) return;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = getMediaUrl(imageUrl);

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const size = 50; // downscale to 50x50 for speed
      canvas.width = size;
      canvas.height = size;
      
      context.drawImage(img, 0, 0, size, size);
      const data = context.getImageData(0, 0, size, size).data;
      
      const colorCounts = {};

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];

        // Skip fully transparent pixels
        if (a < 128) continue;

        // Skip white/light grey background pixels
        if (r > 230 && g > 230 && b > 230) continue;

        // Skip black/dark grey pixels
        if (r < 25 && g < 25 && b < 25) continue;

        // Quantize colors (group colors within 16 units range) to find true clusters
        const qr = Math.round(r / 16) * 16;
        const qg = Math.round(g / 16) * 16;
        const qb = Math.round(b / 16) * 16;
        const key = `${qr},${qg},${qb}`;

        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }

      const sortedColors = Object.entries(colorCounts)
        .map(([key, count]) => {
          const [r, g, b] = key.split(',').map(Number);
          return { r, g, b, count };
        })
        .sort((a, b) => b.count - a.count);

      let primaryHex = null;
      let secondaryHex = null;

      if (sortedColors.length > 0) {
        const primary = sortedColors[0];
        
        // Convert helper
        const toHex = (c) => {
          const hex = Math.min(255, Math.max(0, c)).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };

        primaryHex = '#' + toHex(primary.r) + toHex(primary.g) + toHex(primary.b);

        // Find a secondary color that is visually distinct from primary
        let secondary = null;
        for (let i = 1; i < sortedColors.length; i++) {
          const c = sortedColors[i];
          const distance = Math.sqrt(
            Math.pow(c.r - primary.r, 2) +
            Math.pow(c.g - primary.g, 2) +
            Math.pow(c.b - primary.b, 2)
          );
          if (distance > 80) { // distinct color
            secondary = c;
            break;
          }
        }
        
        // Fallback if no distinct color found: make it a shifted shade
        if (!secondary) {
          secondary = {
            r: Math.max(0, Math.min(255, primary.r + 40)),
            g: Math.max(0, Math.min(255, primary.g - 40)),
            b: Math.max(0, Math.min(255, primary.b - 40))
          };
        }
        
        secondaryHex = '#' + toHex(secondary.r) + toHex(secondary.g) + toHex(secondary.b);
        callback({ primary: primaryHex, secondary: secondaryHex });
      }
    } catch (e) {
      console.warn("Failed to extract dominant colors from image:", e);
    }
  };

  img.onerror = (err) => {
    console.warn("Failed to load image for dominant color extraction", err);
  };
};

export const useDynamicTheme = (eventColor, logoUrl) => {
  useEffect(() => {
    const applyTheme = (pColor, sColor) => {
      const root = document.documentElement;
      
      const primaryColor = pColor || '#18181b';
      const secondaryColor = sColor || '#f1785b';
      
      // Derivatives for primary
      const primaryHover = adjustBrightness(primaryColor, -20);
      const primaryLight = adjustBrightness(primaryColor, 40);
      const foreground = getContrastColor(primaryColor);

      // Derivatives for secondary
      const secondaryHover = adjustBrightness(secondaryColor, -20);
      const secondaryForeground = getContrastColor(secondaryColor);

      // Soft tinted background color (premium feel)
      const { r, g, b } = hexToRgb(primaryColor);
      const sRgb = hexToRgb(secondaryColor);
      
      // Create a very light tint background e.g. 5% opacity primary color blended with white
      const tr = Math.round(0.97 * 255 + 0.03 * r);
      const tg = Math.round(0.97 * 255 + 0.03 * g);
      const tb = Math.round(0.97 * 255 + 0.03 * b);
      const toHex = (c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      const bgLight = '#' + toHex(tr) + toHex(tg) + toHex(tb);
      
      root.style.setProperty('--theme-primary', primaryColor);
      root.style.setProperty('--theme-primary-hover', primaryHover);
      root.style.setProperty('--theme-primary-light', primaryLight);
      root.style.setProperty('--theme-foreground', foreground);

      root.style.setProperty('--theme-secondary', secondaryColor);
      root.style.setProperty('--theme-secondary-hover', secondaryHover);
      root.style.setProperty('--theme-secondary-foreground', secondaryForeground);
      root.style.setProperty('--theme-bg-light', bgLight);
      
      root.style.setProperty('--theme-primary-rgb', `${r}, ${g}, ${b}`);
      root.style.setProperty('--theme-secondary-rgb', `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`);
    };

    applyTheme(eventColor, '#f1785b');

    if (logoUrl) {
      extractDominantColor(logoUrl, ({ primary, secondary }) => {
        applyTheme(primary, secondary);
      });
    }
  }, [eventColor, logoUrl]);
};

