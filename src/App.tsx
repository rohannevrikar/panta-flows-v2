
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ChatInterface from "./components/ChatInterface";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { applyThemeColors } from "./lib/theme-utils";
import VersionNumber from "./components/VersionNumber";

// Theme wrapper to apply colors on mount and theme changes
const ThemeApplier = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  
  useEffect(() => {
    applyThemeColors(theme);
  }, [theme]);
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ThemeApplier>
            <Toaster />
            <Sonner />
            <VersionNumber />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/chat" element={<ChatInterface />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ThemeApplier>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
