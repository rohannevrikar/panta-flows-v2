
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, User } from "@/services/authService";
import { UserRole } from "@/services/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserSettings {
  notifications: boolean;
  theme: string;
}

// Update User interface to include settings
interface ExtendedUser extends User {
  settings?: UserSettings;
}

interface AuthContextType {
  user: ExtendedUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (userData: Partial<ExtendedUser>) => Promise<void>;
}

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
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        setLoading(true);
        try {
          const response = await authService.getCurrentUser();
          
          if (response) {
            const extendedUser: ExtendedUser = {
              ...response,
              avatar: response.avatar || DEFAULT_USER_AVATAR,
              role: response.role || "user",
              clientId: response.clientId || DEFAULT_CLIENT_ID,
              settings: {
                notifications: true,
                theme: "light",
              },
            };

            setUser(extendedUser);
            setToken(storedToken);
          }
        } catch (error) {
          console.error("Error loading user from token:", error);
          // Clear invalid token
          localStorage.removeItem("auth_token");
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
      const response = await authService.login(email, password);

      const extendedUser: ExtendedUser = {
        ...response.user,
        avatar: response.user.avatar || DEFAULT_USER_AVATAR,
        role: response.user.role || "user",
        clientId: response.user.clientId || DEFAULT_CLIENT_ID,
        settings: {
          notifications: true,
          theme: "light",
        },
      };

      setUser(extendedUser);
      setToken(response.token);
      localStorage.setItem("auth_token", response.token);
      toast.success(`Welcome ${extendedUser.name}!`);
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
      const response = await authService.loginWithGoogle();

      const extendedUser: ExtendedUser = {
        ...response.user,
        avatar: response.user.avatar || DEFAULT_USER_AVATAR,
        role: response.user.role || "user",
        clientId: response.user.clientId || DEFAULT_CLIENT_ID,
        settings: {
          notifications: true,
          theme: "light",
        },
      };

      setUser(extendedUser);
      setToken(response.token);
      localStorage.setItem("auth_token", response.token);
      toast.success(`Welcome ${extendedUser.name}!`);
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
    localStorage.removeItem("auth_token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.register(email, password, name);

      const extendedUser: ExtendedUser = {
        ...response.user,
        avatar: response.user.avatar || DEFAULT_USER_AVATAR,
        role: response.user.role || "user",
        clientId: response.user.clientId || DEFAULT_CLIENT_ID,
        settings: {
          notifications: true,
          theme: "light",
        },
      };

      setUser(extendedUser);
      setToken(response.token);
      localStorage.setItem("auth_token", response.token);
      toast.success(`Welcome ${extendedUser.name}!`);
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
  const updateUser = async (userData: Partial<ExtendedUser>) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await authService.updateProfile(userData);

      const updatedUser: ExtendedUser = {
        ...user,
        ...response,
        clientId: response.clientId || user.clientId || DEFAULT_CLIENT_ID,
        settings: {
          ...(user.settings || {}),
          ...(userData.settings || {}),
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
