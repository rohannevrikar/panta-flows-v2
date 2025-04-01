
import { User } from "./authService";

// In a real application, this service would make API calls to manage users
export const userService = {
  getCurrentUser: async (): Promise<User | null> => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user_info");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },
  
  updateUser: async (userData: Partial<User>): Promise<User> => {
    // In a real app, we'd update the user via API
    // For now, we'll simulate by updating local storage
    const userStr = localStorage.getItem("user_info");
    const user = userStr ? JSON.parse(userStr) : {};
    const updatedUser = { ...user, ...userData };
    
    localStorage.setItem("user_info", JSON.stringify(updatedUser));
    return updatedUser as User;
  }
};
