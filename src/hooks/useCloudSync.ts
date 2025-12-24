import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { FirebaseService } from '../services/FirebaseService';

export const useCloudSync = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Retrieve key from storage if available, for UI display
        setRecoveryKey(FirebaseService.getCurrentKey());
      } else {
        setRecoveryKey(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const enableSync = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const key = await FirebaseService.createAccount();
      setRecoveryKey(key);
      return key;
    } catch (err: any) {
      setError(err.message || 'Error enabling sync');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const recoverAccount = async (key: string) => {
    setIsSyncing(true);
    setError(null);
    try {
      await FirebaseService.loginWithKey(key);
      await FirebaseService.pullData();
      // Reload to reflect pulled data in UI hooks
      window.location.reload(); 
    } catch (err: any) {
      setError(err.message || 'Error recovering account');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncNow = async () => {
      if (!user) return;
      setIsSyncing(true);
      try {
          await FirebaseService.pushData();
      } catch (err: any) {
          setError(err.message || 'Sync failed');
      } finally {
          setIsSyncing(false);
      }
  };
  
  const disableSync = async () => {
      setIsSyncing(true);
      try {
          await FirebaseService.logout();
      } catch (err: any) {
          setError(err.message || 'Logout failed');
      } finally {
          setIsSyncing(false);
      }
  }

  return {
    user,
    isAuthenticated: !!user,
    isSyncing,
    error,
    recoveryKey,
    enableSync,
    recoverAccount,
    syncNow,
    disableSync
  };
};
