
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEExcIxQkQ9-nP3qSm02M8HH8E_4kXD_o",
  authDomain: "tharawat99998.firebaseapp.com",
  projectId: "tharawat99998",
  storageBucket: "tharawat99998.appspot.com",
  messagingSenderId: "747914451905",
  appId: "1:747914451905:web:755da00811b7d7fe156d40",
  measurementId: "G-N60HHTHR21"
};

// Singleton pattern to ensure single instance
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Export the initialized instances directly
export { app, auth, db };

// Kept for backward compatibility in case any file still uses them, but direct imports are preferred.
export function getFirebaseAuth() {
    return auth;
}

export function getFirestoreDb() {
    return db;
}
