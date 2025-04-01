
import { IconName } from '@/frontend/utils/iconMap';

export interface ClientTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  tagline?: string;
  landingPageText?: string;
}

export interface ClientConfig {
  id: string;
  name: string;
  logo?: string;
  landingPageText?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tagline?: string;
}

const defaultConfig: ClientConfig = {
  id: 'default',
  name: 'Default Theme',
  primaryColor: '#0f172a',
  secondaryColor: '#f8fafc',
  accentColor: '#3b82f6',
  tagline: 'Discover new possibilities',
  landingPageText: 'AI-powered workflows designed for the modern workspace.'
};

const clientConfigs: Record<string, ClientConfig> = {
  default: defaultConfig,
  panta: {
    id: 'panta',
    name: 'Panta',
    logo: '/panta-logo.png',
    primaryColor: '#4f46e5',
    secondaryColor: '#ffffff',
    accentColor: '#818cf8',
    tagline: 'discover designInspiration',
    landingPageText: 'Unleash your creativity with AI-powered workflows designed for modern teams.'
  },
  acme: {
    id: 'acme',
    name: 'ACME Corp',
    logo: '/acme-logo.png',
    primaryColor: '#10b981',
    secondaryColor: '#f0fdfa',
    accentColor: '#34d399',
    tagline: 'Work smarter, not harder',
    landingPageText: 'Streamline your workflow with our AI-powered tools designed for productivity.'
  }
};

export const getClientConfig = (clientId?: string): ClientConfig => {
  if (!clientId) return defaultConfig;
  return clientConfigs[clientId] || defaultConfig;
};

// Function that returns ThemeConfig for use in ThemeContext
export const getClientTheme = (clientId: string): ThemeConfig => {
  const config = getClientConfig(clientId);
  return {
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    accentColor: config.accentColor,
    logo: config.logo,
    clientName: config.name,
    tagline: config.tagline
  };
};

// Helper type for importing into ThemeContext
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  clientName: string;
  tagline?: string;
}
