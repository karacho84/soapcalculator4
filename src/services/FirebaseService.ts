import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { StorageService } from './StorageService';
import type { Oil } from '../models/Oil';
import type { Recipe } from '../models/Recipe';

// Internal domain for fake emails
const AUTH_DOMAIN = 'seifenrechner-app.internal';

export interface SyncData {
  lastUpdated: Timestamp;
  data: {
    oils: Oil[];
    recipes: Recipe[];
  };
}

export const FirebaseService = {
  // --- Auth Helpers ---

  /**
   * Generates a random ID and password, creates a Firebase user,
   * and returns the "Magic Key" (ID-PASSWORD).
   */
  createAccount: async (): Promise<string> => {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase(); // 8 chars
    const password = Math.random().toString(36).substring(2, 18); // 16 chars
    const email = `${id}@${AUTH_DOMAIN}`;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Save credentials locally to stay logged in / recover automatically (if needed)
      // Actually, Firebase Auth handles persistence automatically.
      // But we might want to store the "Magic Key" for display in settings.
      const magicKey = `${id}-${password}`;
      StorageService.setItem('seifenrechner_recovery_key', magicKey);
      
      // Initial Sync (Push local data to cloud)
      await FirebaseService.pushData();
      
      return magicKey;
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  },

  /**
   * Logs in using the "Magic Key" (ID-PASSWORD).
   */
  loginWithKey: async (magicKey: string): Promise<void> => {
    const parts = magicKey.split('-');
    if (parts.length < 2) throw new Error("Invalid Key Format");
    
    const id = parts[0];
    const password = parts.slice(1).join('-'); // Rejoin in case password has hyphens (though our generator doesn't)
    const email = `${id}@${AUTH_DOMAIN}`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      StorageService.setItem('seifenrechner_recovery_key', magicKey);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
    localStorage.removeItem('seifenrechner_recovery_key');
  },

  getCurrentKey: (): string | null => {
    return StorageService.getItem<string | null>('seifenrechner_recovery_key', null);
  },

  // --- Data Sync ---

  /**
   * Pushes current local data to Firestore.
   */
  pushData: async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    const oils = StorageService.getOils();
    const recipes = StorageService.getRecipes();

    const payload: SyncData = {
      lastUpdated: Timestamp.now(),
      data: {
        oils,
        recipes
      }
    };

    try {
      await setDoc(doc(db, 'users', user.uid), payload);
      console.log('Data pushed to cloud successfully');
    } catch (error) {
      console.error('Error pushing data to cloud:', error);
      throw error;
    }
  },

  /**
   * Pulls data from Firestore and merges/overwrites local data.
   */
  pullData: async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as SyncData;
        const { oils, recipes } = data.data;

        // Use importBackup logic to merge safely
        // But for "Sync" usually we might want to mirror the state?
        // Let's use importBackup for now as it's safer than wiping local data
        StorageService.importBackup(oils, recipes);
        console.log('Data pulled from cloud successfully');
      } else {
        console.log('No data found in cloud');
      }
    } catch (error) {
      console.error('Error pulling data from cloud:', error);
      throw error;
    }
  }
};
