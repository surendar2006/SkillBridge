import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signInAnonymously,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { UserProfile, UserRole } from '../types';
import { seedDemoUserData } from '../lib/demoService';
import firebaseConfig from '../../firebase-applet-config.json';

export interface AuthDiagnosticError {
  code?: string;
  message: string;
  suggestedFix?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isDemoUser: boolean;
  loading: boolean;
  authError: AuthDiagnosticError | null;
  clearAuthError: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleRedirect: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = 'surendarr.cd23@bitsathy.ac.in';

export function getSuggestedFix(code?: string): string {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  switch (code) {
    case 'auth/unauthorized-domain':
      return `Domain '${currentHost}' is not authorized. In Firebase Console, navigate to Authentication → Settings → Authorized domains and add '${currentHost}' (and 'localhost' for local development).`;
    case 'auth/popup-blocked':
      return `The sign-in popup was blocked by your browser. Please allow popups for ${currentHost}, or use the 'Sign in with Google (Redirect)' option.`;
    case 'auth/popup-closed-by-user':
      return `The Google sign-in window was closed before completion. Please try signing in again.`;
    case 'auth/cancelled-popup-request':
      return `A previous sign-in attempt was in progress. Please click once and wait a moment.`;
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return `Provider is not enabled in Firebase. In Firebase Console, go to Authentication → Sign-in method, click Anonymous (or Google), toggle Enable, and click Save.`;
    case 'auth/network-request-failed':
      return `Connection to '${firebaseConfig.authDomain}' timed out or was blocked. Ensure third-party cookies/cross-site trackers are permitted, disable ad blockers on auth domains, or verify network connection.`;
    case 'auth/account-exists-with-different-credential':
      return `An account already exists with the same email under a different sign-in method. Try logging in with your password.`;
    default:
      return `Check your Firebase project settings in the Firebase Console (Project: ${firebaseConfig.projectId}).`;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<AuthDiagnosticError | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Sync or create user profile document in Firestore
  const syncProfile = async (user: User): Promise<UserProfile> => {
    const isAnonymous = user.isAnonymous === true;
    setIsDemoUser(isAnonymous);

    const userDocRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userDocRef);
      const isSystemAdmin = !isAnonymous && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        const profile: UserProfile = {
          ...data,
          // Anonymous users can never be admin
          role: isSystemAdmin ? 'admin' : isAnonymous ? 'student' : (data.role || 'student'),
        };
        setUserProfile(profile);
        setIsAdmin(profile.role === 'admin' && !isAnonymous);

        // If anonymous, ensure demo data is populated
        if (isAnonymous) {
          await seedDemoUserData(user.uid);
        }

        return profile;
      } else {
        // Create initial profile
        const initialRole: UserRole = isSystemAdmin ? 'admin' : 'student';
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || (isAnonymous ? 'demo-student@skillbridge.edu' : ''),
          displayName: isAnonymous
            ? 'Demo Student (Evaluation Mode)'
            : (user.displayName || user.email?.split('@')[0] || 'Student'),
          role: initialRole,
          targetJobRole: 'Full Stack Cloud Engineer',
          education: isAnonymous
            ? 'B.Tech in Computer Science & Engineering (Demonstration Record)'
            : 'Bachelor of Technology / Computer Science',
          bio: isAnonymous
            ? 'Evaluation student exploring the AI-powered Micro-Credential Curriculum Platform.'
            : 'Aspiring software engineer focusing on cloud, AI/ML, and full-stack systems.',
          confirmedSkills: isAnonymous
            ? ['React', 'JavaScript', 'Python', 'HTML5', 'CSS3', 'Git', 'SQL', 'REST APIs']
            : ['JavaScript', 'React', 'HTML5', 'CSS3', 'Git', 'Python'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(userDocRef, newProfile);

        // Seed comprehensive demonstration records for anonymous users
        if (isAnonymous) {
          await seedDemoUserData(user.uid);
        }

        // Only register admin doc if system admin and NOT anonymous
        if (isSystemAdmin && !isAnonymous) {
          try {
            await setDoc(doc(db, 'admins', user.uid), {
              uid: user.uid,
              email: user.email,
              grantedAt: new Date().toISOString()
            });
          } catch (adminErr) {
            console.warn('Admin record provision notice:', adminErr);
          }
        }

        setUserProfile(newProfile);
        setIsAdmin(initialRole === 'admin' && !isAnonymous);
        return newProfile;
      }
    } catch (err) {
      console.warn('Profile sync fallback:', err);
      const fallback: UserProfile = {
        uid: user.uid,
        email: user.email || (isAnonymous ? 'demo-student@skillbridge.edu' : ''),
        displayName: isAnonymous ? 'Demo Student (Evaluation Mode)' : 'Student',
        role: 'student',
        targetJobRole: 'Full Stack Cloud Engineer',
        education: 'Undergraduate Computer Science',
        confirmedSkills: ['React', 'JavaScript', 'Python', 'HTML5', 'CSS3', 'Git', 'SQL', 'REST APIs'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUserProfile(fallback);
      setIsAdmin(false);
      return fallback;
    }
  };

  // Listen for redirect results
  useEffect(() => {
    let active = true;

    getRedirectResult(auth)
      .then(async (cred) => {
        if (!active) return;
        if (cred && cred.user) {
          console.log('[Auth diagnostic] getRedirectResult resolved user:', cred.user.uid, cred.user.email);
          await syncProfile(cred.user);
        }
      })
      .catch((err: any) => {
        if (!active) return;
        console.warn('[Auth diagnostic] getRedirectResult error:', err?.code, err?.message);
        setAuthError({
          code: err?.code,
          message: err?.message || 'Google redirect sign-in failed.',
          suggestedFix: getSuggestedFix(err?.code)
        });
      });

    return () => {
      active = false;
    };
  }, []);

  // Listen for auth state transitions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsDemoUser(user.isAnonymous === true);
        await syncProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setIsDemoUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await syncProfile(cred.user);
    } catch (err: any) {
      console.warn('[Auth diagnostic] loginWithEmail error:', err?.code);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      await syncProfile(cred.user);
    } catch (err: any) {
      console.warn('[Auth diagnostic] registerWithEmail error:', err?.code);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In with Popup
  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      console.log('[Auth diagnostic] Initiating signInWithPopup for project:', firebaseConfig.projectId);
      const cred = await signInWithPopup(auth, googleProvider);
      console.log('[Auth diagnostic] signInWithPopup success:', cred.user.email);
      await syncProfile(cred.user);
    } catch (err: any) {
      const diag: AuthDiagnosticError = {
        code: err?.code,
        message: err?.message || 'Google sign-in popup encountered an issue.',
        suggestedFix: getSuggestedFix(err?.code)
      };
      console.warn('[Auth diagnostic] signInWithPopup failed:', err?.code, err?.message);
      setAuthError(diag);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In with Redirect
  const loginWithGoogleRedirect = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      console.log('[Auth diagnostic] Initiating signInWithRedirect to authDomain:', firebaseConfig.authDomain);
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      const diag: AuthDiagnosticError = {
        code: err?.code,
        message: err?.message || 'Google sign-in redirect failed.',
        suggestedFix: getSuggestedFix(err?.code)
      };
      console.warn('[Auth diagnostic] signInWithRedirect failed:', err?.code, err?.message);
      setAuthError(diag);
      setLoading(false);
      throw err;
    }
  };

  // Firebase Anonymous Authentication ("Continue as Demo User")
  const loginAnonymously = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      console.log('[Auth diagnostic] Initiating signInAnonymously...');
      const cred = await signInAnonymously(auth);
      console.log('[Auth diagnostic] signInAnonymously succeeded for uid:', cred.user.uid);
      await syncProfile(cred.user);
    } catch (err: any) {
      let fix = getSuggestedFix(err?.code);
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/admin-restricted-operation') {
        fix = `Anonymous authentication is not enabled in Firebase project '${firebaseConfig.projectId}'. In Firebase Console, go to Authentication → Sign-in method → Add provider → Anonymous, toggle Enable, and click Save.`;
      }
      const diag: AuthDiagnosticError = {
        code: err?.code,
        message: err?.message || 'Anonymous demo sign-in could not be completed.',
        suggestedFix: fix
      };
      console.warn('[Auth diagnostic] signInAnonymously failed:', err?.code, err?.message);
      setAuthError(diag);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signOut(auth);
      setUserProfile(null);
      setIsAdmin(false);
      setIsDemoUser(false);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await syncProfile(currentUser);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const path = `users/${currentUser.uid}`;
    const updated = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      setUserProfile(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isDemoUser,
        loading,
        authError,
        clearAuthError,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginWithGoogleRedirect,
        loginAnonymously,
        logout,
        resetPassword,
        refreshProfile,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
