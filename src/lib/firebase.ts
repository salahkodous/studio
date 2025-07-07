import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function initialize() {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_")) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    }
}

export function getFirebaseAuth() {
    if (!auth) {
        initialize();
    }
    return auth;
}

export function getFirestoreDb() {
    if (!db) {
        initialize();
    }
    return db;
}

export const isFirebaseConfigured =
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith("YOUR_") &&
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;