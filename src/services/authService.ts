
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken,
  User as FirebaseUser,
  AuthError
} from "firebase/auth";
import { auth } from "../config/firebase";
import { toast } from "sonner";

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

// Handle Firebase auth errors with readable messages
const handleAuthError = (error: AuthError) => {
  console.error("Auth error:", error);
  
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many sign-in attempts. Please try again later',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completing',
    'auth/network-request-failed': 'Network error. Please check your connection'
  };
  
  const message = errorMessages[error.code] || error.message || 'An authentication error occurred';
  toast.error(message);
  
  return Promise.reject(new Error(message));
};

const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || "User",
    email: firebaseUser.email || "",
    avatar: firebaseUser.photoURL || undefined,
  };
};

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      const { email, password } = credentials;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await getIdToken(userCredential.user);
      
      const user = mapFirebaseUserToUser(userCredential.user);
      
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_info", JSON.stringify(user));
      
      return {
        token,
        user
      };
    } catch (error) {
      return handleAuthError(error as AuthError);
    }
  },
  
  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const token = await getIdToken(userCredential.user);
      
      const user = mapFirebaseUserToUser(userCredential.user);
      
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_info", JSON.stringify(user));
      
      return {
        token,
        user
      };
    } catch (error) {
      return handleAuthError(error as AuthError);
    }
  },
  
  logout: async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");
      return Promise.resolve();
    } catch (error) {
      console.error("Logout error:", error);
      return Promise.reject(error);
    }
  },
  
  register: async (userData: LoginCredentials & { name: string }) => {
    try {
      const { email, password, name } = userData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile with the name
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      
      const token = await getIdToken(userCredential.user);
      
      const user = {
        id: userCredential.user.uid,
        name,
        email: userCredential.user.email || "",
        avatar: userCredential.user.photoURL || undefined,
      };
      
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_info", JSON.stringify(user));
      
      return {
        token,
        user
      };
    } catch (error) {
      return handleAuthError(error as AuthError);
    }
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        unsubscribe();
        
        if (firebaseUser) {
          try {
            const user = mapFirebaseUserToUser(firebaseUser);
            localStorage.setItem("user_info", JSON.stringify(user));
            resolve(user);
          } catch (error) {
            console.error("Error mapping user:", error);
            localStorage.removeItem("user_info");
            resolve(null);
          }
        } else {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_info");
          resolve(null);
        }
      });
    });
  },
  
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error("No authenticated user found");
      }
      
      await updateProfile(currentUser, {
        displayName: userData.name || currentUser.displayName,
        photoURL: userData.avatar || currentUser.photoURL,
      });
      
      const updatedUser = mapFirebaseUserToUser(currentUser);
      localStorage.setItem("user_info", JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  },
};
