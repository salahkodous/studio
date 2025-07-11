import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYwzcemnqD8_9UMONfg0jOURWQV-ivd8M", 
  authDomain: "tharawat99998.firebaseapp.com",
  projectId: "tharawat99998",
  storageBucket: "tharawat99998.appspot.com",
  messagingSenderId: "747914451905",
  appId: "1:747914451905:web:755da00811b7d7fe156d40",
  measurementId: "G-N60HHTHR21"
};

// Singleton pattern to ensure only one instance of Firebase app is initialized.
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Export the initialized instances directly for use throughout the app.
export { app, auth, db };
