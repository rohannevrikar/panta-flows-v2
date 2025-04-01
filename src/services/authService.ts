
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

export type UserRole = "super_admin" | "client_admin" | "user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: UserRole;
  client_id?: string;
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

const mapFirebaseUserToUser = (firebaseUser: FirebaseUser, additionalData?: any): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || "User",
    email: firebaseUser.email || "",
    avatar: firebaseUser.photoURL || undefined,
    role: additionalData?.role || "user",
    client_id: additionalData?.client_id,
  };
};

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      const { email, password } = credentials;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await getIdToken(userCredential.user);
      
      // In a real backend implementation, you would fetch the user's role and client_id
      // from your database. For now, we'll simulate this with some default values
      // You would replace this with an API call to your backend
      const userData = {
        role: "user",
        client_id: localStorage.getItem("client_id") || "panta",
      };
      
      const user = mapFirebaseUserToUser(userCredential.user, userData);
      
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
      
      // In a real backend implementation, you would fetch the user's role and client_id
      // You would replace this with an API call to your backend
      const userData = {
        role: "user",
        client_id: localStorage.getItem("client_id") || "panta",
      };
      
      const user = mapFirebaseUserToUser(userCredential.user, userData);
      
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
      
      // In a real implementation, you would set the user's role and client_id
      // based on your business logic or admin configurations
      const additionalData = {
        role: "user",
        client_id: localStorage.getItem("client_id") || "panta",
      };
      
      const user = mapFirebaseUserToUser(userCredential.user, additionalData);
      
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
            // In a real implementation, you would fetch the user's role and client_id
            // from your backend API
            const storedUser = localStorage.getItem("user_info");
            const additionalData = storedUser ? JSON.parse(storedUser) : {
              role: "user",
              client_id: localStorage.getItem("client_id") || "panta",
            };
            
            const user = mapFirebaseUserToUser(firebaseUser, additionalData);
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
      
      // Get existing stored user data to preserve role and client_id
      const storedUserStr = localStorage.getItem("user_info");
      const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};
      
      const updatedUser = mapFirebaseUserToUser(currentUser, {
        role: userData.role || storedUser.role || "user",
        client_id: userData.client_id || storedUser.client_id,
      });
      
      localStorage.setItem("user_info", JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  },
};
