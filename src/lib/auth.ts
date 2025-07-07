import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { getFirebase } from './firebase'

export async function signUp(email: string, password: string, displayName: string) {
  const firebase = getFirebase();
  if (!firebase) throw new Error("Firebase is not configured. Please check your .env file.");

  try {
    const userCredential = await createUserWithEmailAndPassword(firebase.auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up: ", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const firebase = getFirebase();
  if (!firebase) throw new Error("Firebase is not configured. Please check your .env file.");

  try {
    const userCredential = await signInWithEmailAndPassword(firebase.auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in: ", error);
    throw error;
  }
}

export async function logOut() {
  const firebase = getFirebase();
  if (!firebase) throw new Error("Firebase is not configured. Please check your .env file.");
  
  try {
    return await signOut(firebase.auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
}
