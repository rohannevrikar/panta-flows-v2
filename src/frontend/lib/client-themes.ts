
import { ThemeConfig } from "../contexts/ThemeContext";

// Define clients and their themes
const clientThemes: Record<string, ThemeConfig> = {
  "panta": {
    primaryColor: "#191919",
    secondaryColor: "#FFFFFF",
    accentColor: "#629FE7",
    clientName: "PANTA",
    tagline: "discover designInspiration"
  },
  "zettaVal": {
    primaryColor: "#2D2D64",
    secondaryColor: "#F2F2F2",
    accentColor: "#F26430",
    clientName: "ZettaVal",
    tagline: "Powering the future of AI"
  },
  "cloudVision": {
    primaryColor: "#075E54",
    secondaryColor: "#FFFFFF",
    accentColor: "#25D366",
    clientName: "CloudVision",
    tagline: "Smart data for smart decisions"
  },
  "neuroCraft": {
    primaryColor: "#4A1D96",
    secondaryColor: "#F2F2F2",
    accentColor: "#D946EF",
    clientName: "NeuroCraft",
    tagline: "Crafting intelligent solutions"
  },
  "default": {
    primaryColor: "#191919",
    secondaryColor: "#FFFFFF",
    accentColor: "#3B82F6",
    clientName: "AI Platform",
    tagline: "Empowering with AI"
  }
};

/**
 * Get a client's theme configuration
 * @param clientId - The client identifier
 * @returns The theme configuration for the specified client
 */
export const getClientTheme = (clientId: string): ThemeConfig => {
  return clientThemes[clientId] || clientThemes.default;
};

/**
 * Get client configuration information
 * @param clientId - The client identifier
 * @returns Additional client configuration
 */
export const getClientConfig = (clientId: string) => {
  const configs: Record<string, any> = {
    "panta": {
      landingPageText: "Unleash your creativity with AI-powered workflows designed for modern teams",
      maxWorkflows: 50,
      features: ["premium-models", "custom-workflows", "team-sharing"]
    },
    "zettaVal": {
      landingPageText: "Enterprise AI solutions for data-driven companies",
      maxWorkflows: 100,
      features: ["premium-models", "custom-workflows", "team-sharing", "enterprise-support"]
    },
    "cloudVision": {
      landingPageText: "Simplify complex data with AI-powered analysis",
      maxWorkflows: 25,
      features: ["premium-models", "basic-workflows"]
    },
    "neuroCraft": {
      landingPageText: "Creative AI solutions for innovative companies",
      maxWorkflows: 40,
      features: ["premium-models", "custom-workflows", "creative-tools"]
    },
    "default": {
      landingPageText: "AI-powered workflows for every need",
      maxWorkflows: 10,
      features: ["basic-workflows"]
    }
  };

  return configs[clientId] || configs.default;
};
