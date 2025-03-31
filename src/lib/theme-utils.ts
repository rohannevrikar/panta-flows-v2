
import { ThemeConfig } from "../contexts/ThemeContext";

export const applyThemeColors = (theme: ThemeConfig) => {
  // Convert hex to hsl for Tailwind CSS variables
  const convertHexToHSL = (hex: string) => {
    // Remove # if present
    hex = hex.replace("#", "");
    
    // Convert hex to rgb
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Find greatest and smallest channel values
    let cmin = Math.min(r, g, b);
    let cmax = Math.max(r, g, b);
    let delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;
    
    // Calculate hue
    if (delta === 0) {
      h = 0;
    } else if (cmax === r) {
      h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    
    h = Math.round(h * 60);
    
    if (h < 0) h += 360;
    
    // Calculate lightness
    l = (cmax + cmin) / 2;
    
    // Calculate saturation
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
    // Multiply by 100
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    
    return `${h} ${s}% ${l}%`;
  };

  // Apply CSS variables
  document.documentElement.style.setProperty('--primary', convertHexToHSL(theme.primaryColor));
  document.documentElement.style.setProperty('--accent', convertHexToHSL(theme.accentColor));
  document.documentElement.style.setProperty('--ring', convertHexToHSL(theme.primaryColor));
};
