
import { Toaster } from "@/frontend/components/ui/toaster";
import { Toaster as Sonner } from "@/frontend/components/ui/sonner";
import { TooltipProvider } from "@/frontend/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorBoundary from "@/frontend/components/ErrorBoundary";
import { ThemeProvider } from "@/frontend/contexts/ThemeContext";
import { LanguageProvider } from "@/frontend/contexts/LanguageContext";
import { AuthProvider } from "@/frontend/contexts/AuthContext";
import ProtectedRoute from "@/frontend/components/ProtectedRoute";
import ClientWorkflowLoader from "@/frontend/components/ClientWorkflowLoader";
import VersionNumber from "@/frontend/components/VersionNumber";

// Lazy load pages for better performance - use relative paths for lazy loading
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const History = lazy(() => import("./pages/History"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const ChatInterface = lazy(() => import("../components/ChatInterface"));

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center min-h-screen flex-col p-4">
    <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
    <p className="text-gray-700 mb-4">{error.message || "An unexpected error occurred"}</p>
    <button 
      onClick={() => window.location.href = '/'}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Go to Home
    </button>
  </div>
);

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Create and configure query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ErrorBoundary fallback={<ErrorFallback error={new Error("Application failed to load")} />}>
          <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                <ClientWorkflowLoader>
                  <Toaster />
                  <Sonner />
                  <VersionNumber />
                  <Suspense fallback={<Loading />}>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      } />
                      <Route path="/history" element={
                        <ProtectedRoute>
                          <History />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="/chat" element={
                        <ProtectedRoute>
                          <ChatInterface />
                        </ProtectedRoute>
                      } />
                      <Route path="/" element={<Navigate to="/login" replace />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ClientWorkflowLoader>
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
