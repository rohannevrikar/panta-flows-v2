
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../config/firebase";

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
  },
  
  loginWithGoogle: async () => {
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
  },
  
  logout: async () => {
    await signOut(auth);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    return Promise.resolve();
  },
  
  register: async (userData: LoginCredentials & { name: string }) => {
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
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        unsubscribe();
        
        if (firebaseUser) {
          const user = mapFirebaseUserToUser(firebaseUser);
          localStorage.setItem("user_info", JSON.stringify(user));
          resolve(user);
        } else {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_info");
          resolve(null);
        }
      });
    });
  },
  
  updateProfile: async (userData: Partial<User>): Promise<User> => {
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
  },
};
