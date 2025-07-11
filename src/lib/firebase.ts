
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
}

// Call the function to ensure Firebase is initialized
initializeFirebase();

export function getFirebaseAuth() {
    if (!auth) {
        initializeFirebase();
    }
    return auth;
}

export function getFirestoreDb() {
    if (!db) {
        initializeFirebase();
    }
    return db;
}
