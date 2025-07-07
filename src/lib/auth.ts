import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './firebase'

export async function signUp(email: string, password: string, displayName: string) {
  if (!auth) throw new Error("Firebase is not configured. Please check your .env file.");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase configuration is incorrect. Please ensure you have enabled Email/Password sign-in in the Firebase console.');
    }
    console.error("Error signing up: ", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
    if (!auth) throw new Error("Firebase is not configured. Please check your .env file.");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
     if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase configuration is incorrect. Please ensure you have enabled Email/Password sign-in in the Firebase console.');
    }
    console.error("Error signing in: ", error);
    throw error;
  }
}

export async function logOut() {
    if (!auth) throw new Error("Firebase is not configured. Please check your .env file.");
  
  try {
    return await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
}
