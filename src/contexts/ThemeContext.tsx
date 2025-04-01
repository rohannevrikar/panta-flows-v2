
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getClientTheme } from "@/lib/client-themes";
import { applyThemeColors } from "@/lib/theme-utils";
import { toast } from "sonner";

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  clientName: string;
  tagline?: string;
}

interface ThemeContextType {
  theme: ThemeConfig;
  clientId: string;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
  setClientId: (clientId: string) => void;
}

// Default client is PANTA
const DEFAULT_CLIENT_ID = "panta";

// Get default theme based on default client
const defaultTheme = getClientTheme(DEFAULT_CLIENT_ID);

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  clientId: DEFAULT_CLIENT_ID,
  updateTheme: () => {},
  setClientId: () => {}
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [clientId, setClientId] = useState<string>(
    localStorage.getItem("client_id") || DEFAULT_CLIENT_ID
  );
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  // Update theme when clientId changes
  useEffect(() => {
    try {
      const clientTheme = getClientTheme(clientId);
      setTheme(clientTheme);
      
      // Save clientId to localStorage for persistence
      localStorage.setItem("client_id", clientId);
    } catch (error) {
      console.error("Error setting theme:", error);
      // Fallback to default theme if there's an error
      setTheme(defaultTheme);
      toast.error("Failed to apply theme. Using default.");
    }
  }, [clientId]);

  // Apply theme colors when theme changes
  useEffect(() => {
    try {
      applyThemeColors(theme);
    } catch (error) {
      console.error("Error applying theme colors:", error);
      toast.error("Failed to apply theme colors");
    }
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    try {
      setTheme(prev => ({ ...prev, ...newTheme }));
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error("Failed to update theme");
    }
  };

  const handleSetClientId = (id: string) => {
    try {
      setClientId(id);
    } catch (error) {
      console.error("Error setting client ID:", error);
      toast.error("Failed to switch client theme");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, clientId, updateTheme, setClientId: handleSetClientId }}>
      {children}
    </ThemeContext.Provider>
  );
};
