
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// NOTE: The configuration is hardcoded here to bypass persistent
// issues with the development server loading .env files.
// For production, it's recommended to move these back to environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyBYwzcemnqD8_9UMONfg0jOURWQV-ivd8M",
  authDomain: "tharawat99998.firebaseapp.com",
  projectId: "tharawat99998",
  storageBucket: "tharawat99998.appspot.com",
  messagingSenderId: "747914451905",
  appId: "1:747914451905:web:755da00811b7d7fe156d40",
  measurementId: "G-N60HHTHR21"
};

function initialize() {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
}

// Ensure initialization runs on module load
initialize();

export function getFirebaseAuth() {
    // The auth object is now guaranteed to be initialized.
    return auth;
}

export function getFirestoreDb() {
    // The db object is now guaranteed to be initialized.
    return db;
}
