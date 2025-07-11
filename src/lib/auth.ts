import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth as firebaseAuth } from './firebase'; // Import the initialized instance

export async function signUp(email: string, password: string, displayName: string) {
  if (!firebaseAuth) throw new Error("Firebase is not initialized.");

  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing up: ", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  if (!firebaseAuth) throw new Error("Firebase is not initialized.");

  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing in: ", error);
    throw error;
  }
}

export async function logOut() {
  if (!firebaseAuth) throw new Error("Firebase is not initialized.");
  
  try {
    return await signOut(firebaseAuth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
}
