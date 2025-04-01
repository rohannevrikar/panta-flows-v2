
import { apiRequest } from "./api";
import { User } from "./authService";

export const userService = {
  getMe: async (): Promise<User> => {
    try {
      const data = await apiRequest("/auth/me", "GET");
      return data;
    } catch (error) {
      console.error("Error getting user data:", error);
      throw error;
    }
  },
  
  updateUser: async (userData: Partial<User>): Promise<User> => {
    try {
      const data = await apiRequest("/auth/profile", "PUT", userData);
      return data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
};
