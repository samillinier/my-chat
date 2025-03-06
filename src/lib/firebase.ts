'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Ensure HTTPS for auth domain
const ensureHttps = (domain: string | undefined) => {
  if (!domain) return domain;
  if (domain.startsWith('http://')) {
    return domain.replace('http://', 'https://');
  }
  if (!domain.startsWith('https://') && !domain.includes('localhost')) {
    return `https://${domain}`;
  }
  return domain;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

let auth: Auth;
let storage: FirebaseStorage;

// Initialize Firebase
export const initFirebase = () => {
  // Log current domain for debugging
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const fullDomain = `${protocol}//${hostname}`;
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('Firebase initialization:', {
      currentDomain: fullDomain,
      environment: process.env.NODE_ENV,
      authDomain: firebaseConfig.authDomain,
      isProduction,
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV
    });
  }

  try {
    let app;
    if (getApps().length) {
      console.log('Firebase app already exists, retrieving existing app...');
      app = getApp();
    } else {
      console.log('Initializing new Firebase app...');
      app = initializeApp(firebaseConfig);
    }

    if (!auth) {
      console.log('Initializing Firebase Auth...');
      auth = getAuth(app);
      auth.useDeviceLanguage();
      
      // Only enable this in development
      if (process.env.NODE_ENV === 'development') {
        const auth2 = getAuth();
        auth2.settings.appVerificationDisabledForTesting = true;
      }
    }

    if (!storage) {
      console.log('Initializing Firebase Storage...');
      storage = getStorage(app);
    }

    console.log('Firebase initialization completed successfully');
    return { app, auth, storage };
  } catch (error) {
    console.error('Error during Firebase initialization:', error);
    throw error;
  }
};

// Export initialized instances
export { auth, storage };
export default firebaseConfig; 