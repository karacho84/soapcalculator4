import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseService } from './FirebaseService';
import { auth } from '../firebase';
import { StorageService } from './StorageService';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';

// Mocks
vi.mock('../firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  Timestamp: { now: vi.fn(() => 'now') }
}));

vi.mock('./StorageService', () => ({
  StorageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    getOils: vi.fn(() => []),
    getRecipes: vi.fn(() => []),
    importBackup: vi.fn()
  }
}));

describe('FirebaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create an account and return a magic key', async () => {
      (createUserWithEmailAndPassword as any).mockResolvedValue({});
      
      const key = await FirebaseService.createAccount();
      
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(key).toMatch(/^[A-Z0-9]{8}-[a-z0-9]+$/); // Approximate format check
    });
  });

  describe('loginWithKey', () => {
    it('should login with a valid key', async () => {
      (signInWithEmailAndPassword as any).mockResolvedValue({});
      
      const key = "MYID1234-somepassword";
      await FirebaseService.loginWithKey(key);
      
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "MYID1234@seifenrechner-app.internal", "somepassword");
      expect(StorageService.setItem).toHaveBeenCalledWith('seifenrechner_recovery_key', key);
    });

    it('should fail with invalid key format', async () => {
      await expect(FirebaseService.loginWithKey("invalidkey")).rejects.toThrow("Invalid Key Format");
    });
  });

  describe('pushData', () => {
    it('should push data if user is logged in', async () => {
      // Mock user logged in
      (auth as any).currentUser = { uid: '123' };
      
      await FirebaseService.pushData();
      
      expect(setDoc).toHaveBeenCalled();
    });

    it('should not push data if user is not logged in', async () => {
      (auth as any).currentUser = null;
      await FirebaseService.pushData();
      expect(setDoc).not.toHaveBeenCalled();
    });
  });
});
