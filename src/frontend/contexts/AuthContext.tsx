
import { createContext, useContext, useEffect, useState } from "react";
import { authService, User, UserRole } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { useTheme } from "./ThemeContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { clientId, setClientId } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          // Get user data from localStorage first (with role and clientId)
          const storedUserStr = localStorage.getItem("user_info");
          const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
          
          const currentUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "User",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || undefined,
            role: storedUser?.role || "user",
            clientId: storedUser?.clientId || clientId,
          };
          
          setUser(currentUser);
          
          // If the user has a clientId and it's different from the current theme,
          // update the theme to match the user's client
          if (currentUser.clientId && currentUser.clientId !== clientId) {
            setClientId(currentUser.clientId);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [clientId, setClientId]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      // Update client theme if user has a specific clientId
      if (response.user.clientId && response.user.clientId !== clientId) {
        setClientId(response.user.clientId);
      }
      
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const response = await authService.loginWithGoogle();
      setUser(response.user);
      
      // Update client theme if user has a specific clientId
      if (response.user.clientId && response.user.clientId !== clientId) {
        setClientId(response.user.clientId);
      }
      
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error.message || "Google login failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.register({ name, email, password });
      setUser(response.user);
      
      // Update client theme if user has a specific clientId
      if (response.user.clientId && response.user.clientId !== clientId) {
        setClientId(response.user.clientId);
      }
      
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
      
      // Update client theme if clientId has changed
      if (updatedUser.clientId && updatedUser.clientId !== clientId) {
        setClientId(updatedUser.clientId);
      }
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to check if user has required role
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    
    const userRole = user.role || "user";
    
    switch (requiredRole) {
      case "super_admin":
        return userRole === "super_admin";
      
      case "client_admin":
        // Super admins can do anything client admins can
        return userRole === "super_admin" || userRole === "client_admin";
      
      case "user":
        // Any authenticated user passes this check
        return true;
      
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        register,
        updateProfile,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
