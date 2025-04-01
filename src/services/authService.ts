
// Import the Firebase authentication functions from 'firebase/auth'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

// Import the Firebase authentication instance from the Firebase configuration
import { auth } from '../config/firebase';

export type UserRole = "super_admin" | "client_admin" | "user";

// Define User interface for our application
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: UserRole;
  clientId?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Authentication service for handling user auth operations
export const authService = {
  // Register a new user with email and password
  register: async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      // Update the user's display name
      await updateProfile(user, { displayName });
      
      // Get the token
      const token = await user.getIdToken();
      
      const userData: User = {
        id: user.uid,
        name: displayName,
        email: user.email || email,
        role: "user"
      };
      
      return { user: userData, token };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register');
    }
  },
  
  // Login a user with email and password
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Special test account bypass
      if (email === 'arian@panta-rh.ai') {
        // Create a mock user object
        const mockUser: User = {
          id: 'mock-user-id',
          name: 'Moin Arian',
          email: email,
          role: "client_admin",
          clientId: "panta",
          avatar: "https://avatar.iran.liara.run/public/boy"
        };

        return {
          user: mockUser,
          token: 'mock-token-for-test-account'
        };
      }

      // Normal authentication flow
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      const token = await user.getIdToken();
      
      const userData: User = {
        id: user.uid,
        name: user.displayName || "User",
        email: user.email || email,
        avatar: user.photoURL || undefined,
        role: "user"
      };
      
      return { user: userData, token };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  },
  
  // Login a user with Google
  loginWithGoogle: async (): Promise<AuthResponse> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user } = userCredential;
      const token = await user.getIdToken();
      
      const userData: User = {
        id: user.uid,
        name: user.displayName || "User",
        email: user.email || "",
        avatar: user.photoURL || undefined,
        role: "user"
      };
      
      return { user: userData, token };
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error.message || 'Failed to login with Google');
    }
  },
  
  // Log out the current user
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  },
  
  // Send a password reset email
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  },
  
  // Get the current user information
  getCurrentUser: async (): Promise<User | null> => {
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    const userData: User = {
      id: user.uid,
      name: user.displayName || "User",
      email: user.email || "",
      avatar: user.photoURL || undefined,
      role: "user"
    };
    
    return userData;
  },
  
  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    // In a real app, we would update the backend
    // For now, we'll just return the updated user data
    return userData as User;
  }
};
