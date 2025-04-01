
// Import the Firebase authentication functions from 'firebase/auth'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';

// Import the Firebase authentication instance from the Firebase configuration
import { auth } from '../config/firebase';

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
      
      return { user, token };
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
        // Create a mock user object that mimics Firebase User
        const mockUser = {
          uid: 'mock-user-id',
          email: email,
          displayName: 'Moin Arian',
          emailVerified: true,
          isAnonymous: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          },
          providerData: [],
          refreshToken: 'mock-refresh-token',
          phoneNumber: null,
          photoURL: null,
          tenantId: null,
          providerId: 'password',
          getIdToken: () => Promise.resolve('mock-token'),
        } as unknown as User;

        return {
          user: mockUser,
          token: 'mock-token-for-test-account'
        };
      }

      // Normal authentication flow
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      const token = await user.getIdToken();
      
      return { user, token };
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
      
      return { user, token };
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
};
