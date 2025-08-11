import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// SECURE CLIENT-SIDE FIREBASE CONFIGURATION
// This file now only handles authentication. All other operations go through secure server-side APIs.
// The Firebase config values are public by design for client-side authentication.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
}

// Initialize Firebase for authentication only
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export only what's needed for client-side authentication
export { auth, app };

// SECURITY NOTICE:
// All database operations, file uploads, and business logic now go through secure server-side APIs
// that use scoped, short-lived tokens and server-side Firebase Admin SDK.
// 
// Client components should use the functions from lib/client-token-manager.js instead of
// direct Firebase calls to ensure proper security and access control.
