
import { ThemeConfig } from "../contexts/ThemeContext";

/**
 * Applies theme colors to CSS variables and document elements
 * @param theme - The theme configuration to apply
 */
export const applyThemeColors = (theme: ThemeConfig) => {
  // Apply theme colors as CSS variables
  document.documentElement.style.setProperty('--primary', theme.primaryColor);
  document.documentElement.style.setProperty('--secondary', theme.secondaryColor);
  document.documentElement.style.setProperty('--accent', theme.accentColor);
  
  // Set primary color for meta theme-color (mobile browser UI)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.primaryColor);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = theme.primaryColor;
    document.head.appendChild(meta);
  }
  
  // Update favicon color if we're using an emoji favicon
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && favicon.getAttribute('href')?.startsWith('data:image/svg+xml')) {
    // If using an SVG favicon, we could update its colors here
    // This would require more complex SVG manipulation
  }
  
  // Set title based on client name if needed
  if (theme.clientName) {
    document.title = `${theme.clientName} AI Platform`;
  }
};

/**
 * Generates a contrasting text color based on background
 * @param backgroundColor - The background color to check against
 * @returns A suitable text color (white or black)
 */
export const getContrastingTextColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.slice(1);
    
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }
  
  // Calculate perceived brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Use white text on dark backgrounds and black text on light backgrounds
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * Generate a lighter or darker shade of a color
 * @param color - The base color in hex format
 * @param percent - Percentage to lighten or darken (-100 to 100)
 * @returns The adjusted color
 */
export const adjustColor = (color: string, percent: number): string => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = R * (100 + percent) / 100;
  G = G * (100 + percent) / 100;
  B = B * (100 + percent) / 100;

  R = R < 255 ? R : 255;  
  G = G < 255 ? G : 255;  
  B = B < 255 ? B : 255;  

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
};
