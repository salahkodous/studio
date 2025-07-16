/**
 * @fileoverview Initializes the Firebase Admin SDK for backend operations.
 * This file should only be imported in server-side code (e.g., Server Components, API routes).
 */

import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// IMPORTANT: In a real production environment, you would use a more secure way
// to load credentials, such as environment variables or Google Cloud's built-in service account discovery.
// For this project, we'll assume the service account key is available.
// If you have a serviceAccountKey.json, you would use:
// import serviceAccount from './serviceAccountKey.json';
// const serviceAccountCredential = credential.cert(serviceAccount);

/**
 * Ensures that the Firebase Admin app is initialized, but only once.
 * This singleton pattern prevents re-initialization errors in Next.js hot-reloading environments.
 * @returns The initialized Firebase Admin App instance.
 */
export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  // When deploying to Firebase or Google Cloud, the SDK can often auto-discover credentials.
  // When running locally, you might need to set the GOOGLE_APPLICATION_CREDENTIALS
  // environment variable pointing to your service account key file.
  const app = initializeApp({
    // If you were using a cert file:
    // credential: serviceAccountCredential,
    // projectId: 'your-project-id'
  });

  return app;
}

// Initialize the app immediately so the exports are ready to use.
const adminApp = getFirebaseAdminApp();

// Export initialized services for use in other server-side files.
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
