import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Role } from "@/models/Role";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: UserRole;
  clientId?: string; // Changed from client_id to clientId for consistency
  settings?: UserSettings;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface UserSettings {
  notifications: boolean;
  theme: string;
}

type UserRole = "admin" | "user" | "client-admin";

const DEFAULT_USER_AVATAR = "https://avatar.iran.liara.run/public/boy";
const DEFAULT_CLIENT_ID = "panta";

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
  register: async () => {},
  updateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setLoading(true);
        try {
          const response = await userService.getMe();

          const user: User = {
            id: response.id,
            email: response.email,
            name: response.name,
            avatar: response.avatar || DEFAULT_USER_AVATAR,
            role: response.role || "user",
            clientId: response.clientId || DEFAULT_CLIENT_ID,
            settings: {
              notifications: response.settings?.notifications || true,
              theme: response.settings?.theme || "light",
            },
          };

          setUser(user);
          setToken(storedToken);
        } catch (error) {
          console.error("Error loading user from token:", error);
          // Clear invalid token
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUserFromToken();
  }, []);

  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      setLoading(true);
      // For demo, simulate an API call
      const response = await authService.login(email, password);

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        avatar: response.user.avatar || DEFAULT_USER_AVATAR,
        role: response.user.role || "user",
        clientId: response.user.clientId || DEFAULT_CLIENT_ID, // Changed from client_id to clientId
        settings: {
          notifications: response.user.settings?.notifications || true,
          theme: response.user.settings?.theme || "light",
        },
      };

      setUser(user);
      setToken(response.access_token);
      localStorage.setItem("token", response.access_token);
      toast.success(`Welcome ${user.name}!`);
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Login failed");
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      // For demo, simulate an API call
      const response = await authService.loginWithGoogle();

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        avatar: response.user.avatar || DEFAULT_USER_AVATAR,
        role: response.user.role || "user",
        clientId: response.user.clientId || DEFAULT_CLIENT_ID, // Changed from client_id to clientId
        settings: {
          notifications: response.user.settings?.notifications || true,
          theme: response.user.settings?.theme || "light",
        },
      };

      setUser(user);
      setToken(response.access_token);
      localStorage.setItem("token", response.access_token);
      toast.success(`Welcome ${user.name}!`);
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Login with Google failed");
      }
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      // For demo, simulate an API call
      const response = await authService.register(name, email, password);

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        avatar: response.user.avatar || DEFAULT_USER_AVATAR,
        role: response.user.role || "user",
        clientId: response.user.clientId || DEFAULT_CLIENT_ID, // Changed from client_id to clientId
        settings: {
          notifications: response.user.settings?.notifications || true,
          theme: response.user.settings?.theme || "light",
        },
      };

      setUser(user);
      setToken(response.access_token);
      localStorage.setItem("token", response.access_token);
      toast.success(`Welcome ${user.name}!`);
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed");
      }
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update user function (for profile updates)
  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      setLoading(true);

      // For demo, simulate an API call
      const response = await authService.updateUser(userData);

      const updatedUser: User = {
        ...user,
        ...response,
        clientId: response.clientId || user.clientId || DEFAULT_CLIENT_ID, // Changed from client_id to clientId
        settings: {
          ...user.settings,
          ...response.settings,
        },
      };

      setUser(updatedUser);
      toast.success("Profile updated successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile");
      }
      console.error("Update profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    login: loginWithEmailPassword,
    loginWithGoogle,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
