import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Server-only Firebase Admin configuration
// These environment variables are NEVER exposed to the client
const firebaseAdminConfig = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
};

// Validate required environment variables
const requiredVars = [
  'FIREBASE_ADMIN_TYPE',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_CLIENT_ID',
  'FIREBASE_ADMIN_CLIENT_X509_CERT_URL'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required Firebase Admin environment variables: ${missingVars.join(', ')}`);
}

// Initialize Firebase Admin if not already initialized
let adminApp;
if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: cert(firebaseAdminConfig),
    storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET || `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`
  });
} else {
  adminApp = getApps()[0];
}

// Export admin services
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export const adminAuth = getAuth(adminApp);

// Helper function to verify user session
export async function verifyUserSession(sessionToken) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(sessionToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying session token:', error);
    return null;
  }
}

// Helper function to get user data with admin privileges
export async function getUserData(uid) {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}
