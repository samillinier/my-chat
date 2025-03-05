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
    console.log('Current domain:', fullDomain);
    
    // Force HTTPS except for localhost
    if (protocol !== 'https:' && !hostname.includes('localhost')) {
      console.warn('Warning: Site is not using HTTPS. This may cause authentication issues.');
    }
  }

  // Ensure authDomain uses HTTPS
  const configWithHttps = {
    ...firebaseConfig,
    authDomain: ensureHttps(firebaseConfig.authDomain) || '',
  };

  console.log('Starting Firebase initialization with config:', {
    hasApiKey: !!configWithHttps.apiKey,
    hasAuthDomain: !!configWithHttps.authDomain,
    hasProjectId: !!configWithHttps.projectId,
    hasStorageBucket: !!configWithHttps.storageBucket,
    hasMessagingSenderId: !!configWithHttps.messagingSenderId,
    hasAppId: !!configWithHttps.appId,
    authDomain: configWithHttps.authDomain, // Log actual authDomain for debugging
  });

  // Check all required config values
  const requiredConfigs = {
    apiKey: configWithHttps.apiKey,
    authDomain: configWithHttps.authDomain,
    projectId: configWithHttps.projectId,
    storageBucket: configWithHttps.storageBucket,
    appId: configWithHttps.appId,
  };

  const missingConfigs = Object.entries(requiredConfigs)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingConfigs.length > 0) {
    throw new Error(`Missing required Firebase configuration: ${missingConfigs.join(', ')}. Please check your environment variables.`);
  }

  // Ensure authDomain matches current domain in production Vercel environment
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    const currentDomain = window.location.hostname;
    const configDomain = configWithHttps.authDomain?.replace('https://', '');
    
    if (currentDomain.includes('vercel.app') && configDomain !== currentDomain) {
      console.warn(`Warning: Current domain (${currentDomain}) doesn't match Firebase authDomain (${configDomain}). This may cause authentication issues.`);
    }
  }

  try {
    let app;
    if (getApps().length) {
      console.log('Firebase app already exists, retrieving existing app...');
      app = getApp();
    } else {
      console.log('Initializing new Firebase app...');
      app = initializeApp(configWithHttps);
    }

    if (!auth) {
      console.log('Initializing Firebase Auth...');
      auth = getAuth(app);
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