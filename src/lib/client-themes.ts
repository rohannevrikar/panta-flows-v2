
import { ThemeConfig } from "../contexts/ThemeContext";

interface ClientTheme {
  [clientId: string]: ThemeConfig;
}

// Pre-defined workflows for each client
export interface ClientWorkflow {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color?: string;
}

// Complete client configuration schema
export interface ClientConfig {
  theme: ThemeConfig;
  workflows: ClientWorkflow[];
  landingPageText?: string;
  dashboardColor?: string;
}

// Sample client configurations
export const clientConfigs: Record<string, ClientConfig> = {
  panta: {
    theme: {
      primaryColor: "#1CB5E0",
      secondaryColor: "#FF8C00",
      accentColor: "#26A69A",
      logo: "/panta-logo.png",
      clientName: "PANTA",
      tagline: "discover designInspiration"
    },
    workflows: [
      {
        id: "workflow-1",
        title: "Design Inspiration",
        description: "Find design inspiration using AI",
        iconName: "Image"
      },
      {
        id: "workflow-2",
        title: "Brand Identity",
        description: "Create consistent brand identity",
        iconName: "Palette"
      }
    ],
    landingPageText: "Unleash your creativity with AI-powered workflows designed for modern teams",
    dashboardColor: "#f0f9ff"
  },
  acme: {
    theme: {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      accentColor: "#8B5CF6",
      logo: "https://placehold.co/200x200?text=ACME",
      clientName: "ACME Corp",
      tagline: "Build better, faster"
    },
    workflows: [
      {
        id: "workflow-1",
        title: "Project Management",
        description: "Streamline your project workflow",
        iconName: "ListTodo"
      },
      {
        id: "workflow-2",
        title: "Document Analysis",
        description: "Analyze documents with AI",
        iconName: "FileText"
      }
    ],
    landingPageText: "Enterprise solutions built to scale with your business needs",
    dashboardColor: "#f0f7ff"
  },
  globex: {
    theme: {
      primaryColor: "#EC4899",
      secondaryColor: "#8B5CF6",
      accentColor: "#F59E0B",
      logo: "https://placehold.co/200x200?text=GLOBEX",
      clientName: "Globex",
      tagline: "Future-ready solutions"
    },
    workflows: [
      {
        id: "workflow-1",
        title: "Market Analysis",
        description: "AI-powered market trend analysis",
        iconName: "TrendingUp"
      },
      {
        id: "workflow-2",
        title: "Content Creation",
        description: "Generate marketing content with AI",
        iconName: "FileEdit"
      }
    ],
    landingPageText: "Data-driven insights to power your next business decision",
    dashboardColor: "#fdf2f8"
  }
};

// Get the full client configuration
export const getClientConfig = (clientId: string): ClientConfig => {
  return clientConfigs[clientId] || clientConfigs.panta;
};

// Get just the theme portion of a client config
export const getClientTheme = (clientId: string): ThemeConfig => {
  return getClientConfig(clientId).theme;
};

// Get just the workflows for a client
export const getClientWorkflows = (clientId: string): ClientWorkflow[] => {
  return getClientConfig(clientId).workflows;
};
