// import 'server-only'; // Temporarily removed for debugging
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Server-only Firebase Admin configuration
// These environment variables are NEVER exposed to the client
const firebaseAdminConfig = {
  type: 'service_account',
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
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_CLIENT_ID',
  'FIREBASE_ADMIN_CLIENT_X509_CERT_URL'
];

console.log('🔍 Checking Firebase Admin environment variables...');
console.log('🔍 Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
  hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  hasClientId: !!process.env.FIREBASE_ADMIN_CLIENT_ID,
  hasCertUrl: !!process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL
});

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required Firebase Admin environment variables: ${missingVars.join(', ')}`);
  } else {
    console.warn(`⚠️  Missing Firebase Admin environment variables in development: ${missingVars.join(', ')}`);
    console.warn('⚠️  Firebase Admin features will not work without these variables');
  }
}

// Initialize Firebase Admin if not already initialized
let adminApp;
let adminDb;
let adminStorage;
let adminAuth;
let initializationError = null;

if (getApps().length === 0) {
  try {
    // Check if we have the minimum required credentials for initialization
    const hasMinimalCredentials = process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

    console.log('🔧 Firebase Admin initialization attempt:', {
      hasMinimalCredentials,
      projectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      clientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      nodeEnv: process.env.NODE_ENV
    });

    if (hasMinimalCredentials) {
      try {
        // Validate private key format
        if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
          throw new Error('Invalid private key format - must be a valid PEM format private key');
        }

        adminApp = initializeApp({
          credential: cert(firebaseAdminConfig),
          storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET || `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`
        });

        // Initialize services only if app was created successfully
        adminDb = getFirestore(adminApp);
        adminStorage = getStorage(adminApp);
        adminAuth = getAuth(adminApp);

        console.log('✅ Firebase Admin initialized successfully');
      } catch (initError) {
        console.error('❌ Firebase Admin initialization failed:', {
          message: initError.message,
          code: initError.code,
          stack: initError.stack
        });
        initializationError = initError;

        // In production, we need Firebase Admin to work
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Firebase Admin initialization failed in production: ${initError.message}`);
        }
      }
    } else {
      const errorMsg = 'Insufficient Firebase Admin credentials for initialization';
      console.warn('⚠️ ', errorMsg);
      initializationError = new Error(errorMsg);

      if (process.env.NODE_ENV === 'production') {
        throw initializationError;
      }
    }
  } catch (error) {
    console.error('❌ Critical Firebase Admin error:', error.message);
    initializationError = error;

    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      console.warn('⚠️  Firebase Admin initialization failed in development:', error.message);
      console.warn('⚠️  Admin features will not work without proper Firebase credentials');
    }
  }
} else {
  adminApp = getApps()[0];
  try {
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
    adminAuth = getAuth(adminApp);
    console.log('✅ Using existing Firebase Admin app');
  } catch (error) {
    console.error('❌ Failed to get Firebase Admin services from existing app:', error.message);
    initializationError = error;
  }
}

// Export admin services (may be undefined if initialization failed)
export { adminDb, adminStorage, adminAuth, initializationError };

// Helper function to verify user session
export async function verifyUserSession(sessionToken) {
  try {
    if (!adminAuth) {
      console.warn('⚠️  Firebase Admin not initialized, cannot verify session token');
      return null;
    }
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
    if (!adminDb) {
      console.warn('⚠️  Firebase Admin not initialized, cannot get user data');
      return null;
    }
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

// Check if Firebase Admin is properly initialized
export function isFirebaseAdminInitialized() {
  const isInitialized = !!(adminApp && adminAuth && adminDb);
  console.log('🔧 Firebase Admin initialization check:', {
    hasApp: !!adminApp,
    hasAuth: !!adminAuth,
    hasDb: !!adminDb,
    hasInitError: !!initializationError,
    isInitialized
  });
  return isInitialized;
}

// Get initialization status and error details
export function getFirebaseAdminStatus() {
  return {
    isInitialized: isFirebaseAdminInitialized(),
    error: initializationError,
    hasApp: !!adminApp,
    hasAuth: !!adminAuth,
    hasDb: !!adminDb,
    hasStorage: !!adminStorage
  };
}

// Helper function to check if Firebase Admin is ready and throw meaningful error if not
export function ensureFirebaseAdminReady() {
  if (!isFirebaseAdminInitialized()) {
    const status = getFirebaseAdminStatus();
    const errorMessage = initializationError
      ? `Firebase Admin not initialized: ${initializationError.message}`
      : 'Firebase Admin not initialized: Unknown error';

    console.error('🔥 Firebase Admin not ready:', status);
    throw new Error(errorMessage);
  }
}
