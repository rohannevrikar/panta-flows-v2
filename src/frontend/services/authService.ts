
import { apiRequest } from "./api";
import { auth, googleProvider } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";

export type UserRole = "super_admin" | "client_admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: UserRole;
  clientId?: string;
  preferences?: Record<string, any>;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  /**
   * Login a user with email and password
   * @param params - Login parameters
   * @returns Auth response with user and token
   */
  login: async (params: LoginParams): Promise<AuthResponse> => {
    try {
      // Special test user case for Arian
      if (params.email === "arian@panta-rh.ai") {
        console.log("Using test user account");
        
        // Mock user data for testing
        const userData: User = {
          id: "test-user-id-123",
          name: "Arian Test",
          email: params.email,
          avatar: "https://avatar.iran.liara.run/public/boy",
          role: "client_admin", // Give admin role for testing
          clientId: "panta",
        };

        // Save user data to localStorage
        localStorage.setItem("user_info", JSON.stringify(userData));
        const mockToken = "test-token-" + Date.now();
        localStorage.setItem("auth_token", mockToken);
        
        return {
          user: userData,
          token: mockToken,
        };
      }
      
      // Regular login flow
      const credential = await signInWithEmailAndPassword(
        auth,
        params.email,
        params.password
      );

      // In a real implementation, we would fetch user data from our backend
      // const userData = await apiRequest("/auth/me", "GET");
      
      // But for development, we'll create mock user data
      const userData: User = {
        id: credential.user.uid,
        name: credential.user.displayName || "User",
        email: credential.user.email!,
        avatar: credential.user.photoURL || undefined,
        // Mock role and client ID - would come from backend in real implementation
        role: params.email.includes("admin") ? "client_admin" : "user",
        clientId: "panta",
      };

      // Save user data to localStorage
      localStorage.setItem("user_info", JSON.stringify(userData));
      localStorage.setItem("auth_token", await credential.user.getIdToken());
      
      return {
        user: userData,
        token: await credential.user.getIdToken(),
      };
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Failed to login");
    }
  },

  /**
   * Register a new user
   * @param params - Registration parameters
   * @returns Auth response with user and token
   */
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    try {
      // Create user with Firebase
      const credential = await createUserWithEmailAndPassword(
        auth,
        params.email,
        params.password
      );

      // Update profile with name
      await updateFirebaseProfile(credential.user, {
        displayName: params.name,
      });

      // In a real implementation, we would create user in our backend
      // const userData = await apiRequest("/auth/register", "POST", params);
      
      // But for development, we'll create mock user data
      const userData: User = {
        id: credential.user.uid,
        name: params.name,
        email: params.email,
        role: "user",
        clientId: "panta",
      };

      // Save user data to localStorage
      localStorage.setItem("user_info", JSON.stringify(userData));
      localStorage.setItem("auth_token", await credential.user.getIdToken());
      
      return {
        user: userData,
        token: await credential.user.getIdToken(),
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Failed to register");
    }
  },

  /**
   * Login with Google
   * @returns Auth response with user and token
   */
  loginWithGoogle: async (): Promise<AuthResponse> => {
    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);

      // In a real implementation, we would verify and get user data from our backend
      // const userData = await apiRequest("/auth/google", "POST", {
      //   idToken: await result.user.getIdToken(),
      // });
      
      // But for development, we'll create mock user data
      const userData: User = {
        id: result.user.uid,
        name: result.user.displayName || "Google User",
        email: result.user.email!,
        avatar: result.user.photoURL || undefined,
        role: "user",
        clientId: "panta",
      };

      // Save user data to localStorage
      localStorage.setItem("user_info", JSON.stringify(userData));
      localStorage.setItem("auth_token", await result.user.getIdToken());
      
      return {
        user: userData,
        token: await result.user.getIdToken(),
      };
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(error.message || "Failed to login with Google");
    }
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
      localStorage.removeItem("user_info");
      localStorage.removeItem("auth_token");
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Failed to logout");
    }
  },

  /**
   * Update user profile
   * @param userData - Updated user data
   * @returns Updated user
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      // In a real implementation, we would update the backend
      // const updatedUser = await apiRequest("/auth/profile", "PUT", userData);
      
      // But for development, we'll update localStorage
      const userStr = localStorage.getItem("user_info");
      if (!userStr) {
        throw new Error("User not found");
      }
      
      const user = JSON.parse(userStr);
      const updatedUser = { ...user, ...userData };
      localStorage.setItem("user_info", JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error: any) {
      console.error("Profile update error:", error);
      throw new Error(error.message || "Failed to update profile");
    }
  },
};
