
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  // IMPORTANT: Replace this with your actual Firebase web app's API key
  // You can find this in your Firebase project settings -> General
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_BROWSER_API_KEY", 
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

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);


// Export the initialized instances directly
export { app, auth, db };
