'use client';

import { useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  GoogleAuthProvider, 
  User,
  AuthErrorCodes
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { initFirebase } from '@/lib/firebase';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (typeof window === 'undefined') return;

      try {
        console.log('Initializing Firebase Auth...');
        const { auth } = await Promise.resolve(initFirebase());

        // Handle redirect result
        console.log('Checking for redirect result...');
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            console.log('Redirect sign-in successful');
            setUser(result.user);
          }
        } catch (redirectError: unknown) {
          console.error('Error handling redirect result:', redirectError);
          if (redirectError instanceof FirebaseError) {
            setError(`Redirect error: ${redirectError.code} - ${redirectError.message}`);
          }
        }

        const unsubscribe = onAuthStateChanged(auth, 
          (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            if (mounted) {
              setUser(user);
              setLoading(false);
              setError(null);
            }
          }, 
          (error) => {
            console.error('Auth state change error:', error);
            if (mounted) {
              if (error instanceof FirebaseError) {
                setError(`${error.code}: ${error.message}`);
              } else {
                setError('Authentication error occurred');
              }
              setLoading(false);
            }
          }
        );

        return () => {
          unsubscribe();
        };
      } catch (err: unknown) {
        console.error('Firebase auth initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
          setLoading(false);
        }
      }
    };

    const cleanup = initialize();
    return () => {
      mounted = false;
      cleanup?.then(unsubscribe => unsubscribe?.());
    };
  }, []);

  const signIn = async () => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Starting sign-in process...');
      const { auth } = await Promise.resolve(initFirebase());
      const provider = new GoogleAuthProvider();
      
      // Add additional OAuth scopes
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Log auth configuration
      const currentUrl = window.location.href;
      const redirectUrl = `${window.location.origin}/__/auth/handler`;
      console.log('Sign-in configuration:', {
        currentUrl,
        redirectUrl,
        authDomain: auth.config.authDomain
      });

      // Always use popup for authentication in development
      console.log('Using popup sign-in...');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful:', result.user.email);
      setUser(result.user);
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      if (err instanceof FirebaseError) {
        console.error('Detailed error info:', {
          code: err.code,
          message: err.message,
          customData: err.customData
        });
        setError(`Sign-in failed: ${err.code} - ${err.message}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Signing out...');
      const { auth } = await Promise.resolve(initFirebase());
      await signOut(auth);
      console.log('Sign-out successful');
    } catch (err: unknown) {
      console.error('Sign out error:', err);
      if (err instanceof FirebaseError) {
        setError(`Sign-out failed: ${err.code} - ${err.message}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to sign out');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut: signOutUser
  };
} 