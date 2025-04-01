
import { apiRequest } from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const authService = {
  login: (credentials: LoginCredentials) => {
    return apiRequest("/auth/login", "POST", credentials);
  },
  
  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    return Promise.resolve();
  },
  
  register: (userData: LoginCredentials & { name: string }) => {
    return apiRequest("/auth/register", "POST", userData);
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    
    try {
      const response = await apiRequest("/auth/me");
      localStorage.setItem("user_info", JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      return null;
    }
  },
  
  updateProfile: (userData: Partial<User>) => {
    return apiRequest("/auth/profile", "PUT", userData);
  },
};
