
import React, { createContext, useContext, useState, ReactNode } from "react";

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
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
}

// Default theme based on PANTA branding
const defaultTheme: ThemeConfig = {
  primaryColor: "#1CB5E0", // PANTA blue
  secondaryColor: "#FF8C00", // PANTA orange
  accentColor: "#26A69A", // PANTA teal
  logo: "/panta-logo.png",
  clientName: "PANTA",
  tagline: "discover designInspiration"
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
