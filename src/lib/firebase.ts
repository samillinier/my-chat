import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required configuration
const requiredConfigs = {
  apiKey: firebaseConfig.apiKey,
  storageBucket: firebaseConfig.storageBucket,
  projectId: firebaseConfig.projectId
};

Object.entries(requiredConfigs).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Firebase ${key} is not configured! Please check your .env.local file.`);
  }
});

let app;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  // Initialize Firebase
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }

  // Initialize services
  auth = getAuth(app);
  console.log('Firebase Auth initialized');

  db = getFirestore(app);
  console.log('Firebase Firestore initialized');

  storage = getStorage(app);
  if (!storage) {
    throw new Error('Failed to initialize Firebase Storage');
  }
  console.log('Firebase Storage initialized');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { app, auth, db, storage }; 