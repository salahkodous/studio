import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'

export async function signUp(email: string, password: string, displayName: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Failed to initialize Firebase. Please check your .env configuration.");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing up: ", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Failed to initialize Firebase. Please check your .env configuration.");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing in: ", error);
    throw error;
  }
}

export async function logOut() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Failed to initialize Firebase. Please check your .env configuration.");
  
  try {
    return await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
}
