
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getClientTheme } from "@/lib/client-themes";
import { applyThemeColors } from "@/lib/theme-utils";

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

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [clientId, setClientId] = useState<string>(DEFAULT_CLIENT_ID);
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  // Update theme when clientId changes
  useEffect(() => {
    const clientTheme = getClientTheme(clientId);
    setTheme(clientTheme);
  }, [clientId]);

  // Apply theme colors when theme changes
  useEffect(() => {
    applyThemeColors(theme);
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  return (
    <ThemeContext.Provider value={{ theme, clientId, updateTheme, setClientId }}>
      {children}
    </ThemeContext.Provider>
  );
};
