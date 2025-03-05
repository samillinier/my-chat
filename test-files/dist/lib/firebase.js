"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = exports.auth = exports.app = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
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
let auth;
let db;
let storage;
try {
    // Initialize Firebase
    if (!(0, app_1.getApps)().length) {
        console.log('Initializing new Firebase app with config:', {
            storageBucket: firebaseConfig.storageBucket,
            projectId: firebaseConfig.projectId
        });
        exports.app = app = (0, app_1.initializeApp)(firebaseConfig);
        console.log('Firebase app initialized successfully');
    }
    else {
        exports.app = app = (0, app_1.getApp)();
        console.log('Using existing Firebase app');
    }
    // Initialize services
    exports.auth = auth = (0, auth_1.getAuth)(app);
    console.log('Firebase Auth initialized');
    exports.db = db = (0, firestore_1.getFirestore)(app);
    console.log('Firebase Firestore initialized');
    exports.storage = storage = (0, storage_1.getStorage)(app);
    if (!storage) {
        throw new Error('Failed to initialize Firebase Storage');
    }
    console.log('Firebase Storage initialized with bucket:', storage.app.options.storageBucket);
}
catch (error) {
    console.error('Detailed error initializing Firebase:', error);
    throw error;
}
