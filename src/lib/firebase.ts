import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Helper to check if a value is a valid (non-placeholder) key.
const isValidKey = (key: string | undefined): key is string => {
    return !!key && !key.startsWith("YOUR_");
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = isValidKey(firebaseConfig.apiKey) && isValidKey(firebaseConfig.projectId);

function initialize() {
    if (isFirebaseConfigured && getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else if (getApps().length > 0) {
        app = getApp();
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
