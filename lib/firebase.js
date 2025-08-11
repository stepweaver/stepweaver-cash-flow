import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { FIREBASE_COLLECTIONS } from './constants';

// Debug: Log environment variables to help troubleshoot (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Environment Variables:');
  console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing');
  console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing');
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
  console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing');
  console.log('Messaging Sender ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing');
  console.log('App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing');
}

// Your Firebase configuration
// Using the actual Firebase config values provided by the user
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if all required environment variables are set
const missingVars = [];
if (!firebaseConfig.apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!firebaseConfig.storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!firebaseConfig.messagingSenderId) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseConfig.appId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars);
  console.error('Please check your .env.local file and ensure all Firebase configuration values are set.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Business Transactions Functions
export const addBusinessTransaction = async (transaction) => {
  try {
    const docRef = await addDoc(collection(db, 'businessTransactions'), {
      ...transaction,
      date: transaction.date.toISOString(),
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...transaction };
  } catch (error) {
    console.error('Error adding business transaction:', error);
    throw error;
  }
};

export const getBusinessTransactions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'businessTransactions'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: new Date(doc.data().date)
    }));
  } catch (error) {
    console.error('Error getting business transactions:', error);
    throw error;
  }
};

export const deleteBusinessTransaction = async (id) => {
  try {
    await deleteDoc(doc(db, 'businessTransactions', id));
  } catch (error) {
    console.error('Error deleting business transaction:', error);
    throw error;
  }
};

// Personal Data Functions
export const addPersonalIncome = async (income) => {
  try {
    const docRef = await addDoc(collection(db, 'personalIncome'), {
      ...income,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...income };
  } catch (error) {
    console.error('Error adding personal income:', error);
    throw error;
  }
};

export const addPersonalBill = async (bill) => {
  try {
    // Don't automatically extract month/year from dueDate
    // Let the user control which month the bill belongs to
    const docRef = await addDoc(collection(db, 'personalBills'), {
      ...bill,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...bill };
  } catch (error) {
    console.error('Error adding personal bill:', error);
    throw error;
  }
};

export const getPersonalData = async (year, month) => {
  try {
    const monthStr = String(month).padStart(2, '0');
    const yearMonth = `${year}-${monthStr}`;

    // Get income for the month
    const incomeQuery = query(
      collection(db, 'personalIncome'),
      where('date', '>=', `${yearMonth}-01`),
      where('date', '<=', `${yearMonth}-31`)
    );
    const incomeSnapshot = await getDocs(incomeQuery);
    const income = incomeSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get bills for the month using dueDate field (more reliable than month/year fields)
    // Also include bills that were generated for this month but don't have dueDate set yet
    const billsQuery = query(
      collection(db, 'personalBills'),
      where('dueDate', '>=', `${yearMonth}-01`),
      where('dueDate', '<=', `${yearMonth}-31`)
    );

    const billsSnapshot = await getDocs(billsQuery);
    let bills = billsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Also get bills that were generated for this month but don't have dueDate set
    // These are typically bills created by generateBillsForMonth
    const generatedBillsQuery = query(
      collection(db, 'personalBills'),
      where('month', '==', month),
      where('year', '==', year)
    );

    const generatedBillsSnapshot = await getDocs(generatedBillsQuery);
    const generatedBills = generatedBillsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter out generated bills that already have dueDate set (to avoid duplicates)
    const billsWithoutDueDate = generatedBills.filter(bill =>
      !bill.dueDate || bill.dueDate.trim() === ''
    );

    // Combine both sets of bills, avoiding duplicates
    const allBills = [...bills];
    billsWithoutDueDate.forEach(bill => {
      if (!allBills.find(existing => existing.id === bill.id)) {
        allBills.push(bill);
      }
    });

    return { income, bills: allBills };
  } catch (error) {
    console.error('Error getting personal data:', error);
    throw error;
  }
};

export const updatePersonalBill = async (id, updates) => {
  try {
    // Don't automatically update month/year when dueDate changes
    // Let the user control which month the bill belongs to
    await updateDoc(doc(db, 'personalBills', id), updates);
  } catch (error) {
    console.error('Error updating personal bill:', error);
    throw error;
  }
};

export const deletePersonalIncome = async (id) => {
  try {
    await deleteDoc(doc(db, 'personalIncome', id));
  } catch (error) {
    console.error('Error deleting personal income:', error);
    throw error;
  }
};

export const deletePersonalBill = async (id) => {
  try {
    await deleteDoc(doc(db, 'personalBills', id));
  } catch (error) {
    console.error('Error deleting personal bill:', error);
    throw error;
  }
};

// Bill Templates for forward persistence
export const addBillTemplate = async (template) => {
  try {
    const docRef = await addDoc(collection(db, 'billTemplates'), {
      ...template,
      createdAt: new Date()
    });
    return { id: docRef.id, ...template };
  } catch (error) {
    console.error('Error adding bill template:', error);
    throw error;
  }
};

export const getBillTemplates = async () => {
  try {
    const templatesSnapshot = await getDocs(collection(db, 'billTemplates'));
    return templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting bill templates:', error);
    throw error;
  }
};

export const updateBillTemplate = async (id, updates) => {
  try {
    await updateDoc(doc(db, 'billTemplates', id), updates);
  } catch (error) {
    console.error('Error updating bill template:', error);
    throw error;
  }
};

export const deleteBillTemplate = async (id) => {
  try {
    await deleteDoc(doc(db, 'billTemplates', id));
  } catch (error) {
    console.error('Error deleting bill template:', error);
    throw error;
  }
};

export const generateBillsForMonth = async (year, month, templates) => {
  try {
    const monthStr = String(month).padStart(2, '0');
    const yearMonth = `${year}-${monthStr}`;

    // Check if bills already exist for this month
    const existingBillsQuery = query(
      collection(db, 'personalBills'),
      where('month', '==', month),
      where('year', '==', year)
    );
    const existingBillsSnapshot = await getDocs(existingBillsQuery);
    const existingBills = existingBillsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Generate bills from templates - update existing ones and create new ones
    const newBills = [];
    for (const template of templates) {
      const existingBill = existingBills.find(bill => bill.name === template.name);

      if (existingBill) {
        // Update existing bill with blank values (no template defaults)
        const updatedBill = {
          name: template.name,
          dueDate: '', // Keep completely blank - user will set when scheduling payment
          amountDue: 0, // Start with 0 - user fills in actual amount
          amountPaid: 0, // Start with 0 - user fills in when paid
          status: null, // Start with null status - user sets when appropriate
          notes: '', // Start with empty notes - user adds as needed
          url: template.url || '',
          templateId: template.id,
          month: month, // Add month field for easier querying
          year: year // Add year field for easier querying
        };

        await updateDoc(doc(db, 'personalBills', existingBill.id), updatedBill);
        newBills.push({ id: existingBill.id, ...updatedBill });
      } else {
        // Create new bill with blank values (no template defaults)
        const newBill = {
          name: template.name,
          dueDate: '', // Keep completely blank - user will set when scheduling payment
          amountDue: 0, // Start with 0 - user fills in actual amount
          amountPaid: 0, // Start with 0 - user fills in when paid
          status: null, // Start with null status - user sets when appropriate
          notes: '', // Start with empty notes - user adds as needed
          url: template.url || '',
          templateId: template.id,
          month: month, // Add month field for easier querying
          year: year // Add year field for easier querying
        };

        const docRef = await addDoc(collection(db, 'personalBills'), newBill);
        newBills.push({ id: docRef.id, ...newBill });
      }
    }

    return newBills;
  } catch (error) {
    console.error('Error generating bills for month:', error);
    throw error;
  }
};

// Receipt/File Storage Functions
export const uploadReceiptFile = async (file, transactionId) => {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `receipts/${transactionId}/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      id: `${transactionId}_${timestamp}`,
      name: file.name,
      url: downloadURL,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString(),
      storagePath: fileName
    };
  } catch (error) {
    console.error('Error uploading receipt file:', error);
    throw error;
  }
};

export const deleteReceiptFile = async (storagePath) => {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting receipt file:', error);
    // Don't throw error for file deletion failures, as the file might already be deleted
    // Just log the error and continue
  }
};

// Updated Business Transaction Functions with Receipt Support
export const updateBusinessTransaction = async (id, updates) => {
  try {
    await updateDoc(doc(db, 'businessTransactions', id), updates);
  } catch (error) {
    console.error('Error updating business transaction:', error);
    throw error;
  }
};

// User Management Functions
export const createUserAccount = async (email, password, displayName = '') => {
  try {
    // Note: This approach creates the user and signs them in temporarily
    // In a production app, you'd typically use Firebase Admin SDK on the backend
    // For now, we'll create the user and then sign out immediately

    const auth = getAuth();

    // Store the current admin user's credentials if they're signed in
    let currentUser = null;
    if (auth.currentUser) {
      currentUser = {
        email: auth.currentUser.email,
        uid: auth.currentUser.uid
      };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user to users collection in Firestore
    await addDoc(collection(db, FIREBASE_COLLECTIONS.USERS), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || email.split('@')[0],
      role: 'User',
      status: 'Active',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.uid || 'system'
    });

    // Sign out the newly created user immediately
    // This prevents them from being automatically signed in
    await auth.signOut();

    // Note: The admin user will need to sign in again
    // This is a limitation of the client-side approach
    // In production, use Firebase Admin SDK on the backend

    return { success: true, user: { uid: user.uid, email: user.email } };
  } catch (error) {
    console.error('Error creating user account:', error);

    // Provide user-friendly error messages
    let errorMessage = 'Failed to create user account';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak (minimum 6 characters)';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'User creation is not enabled in Firebase';
        break;
      default:
        errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, FIREBASE_COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const deleteUserAccount = async (userId, userEmail) => {
  try {
    // Delete from Firestore users collection
    await deleteDoc(doc(db, FIREBASE_COLLECTIONS.USERS, userId));

    // Note: Deleting the actual Firebase Auth user requires admin privileges
    // This function only removes the user from the users collection
    // The user will still be able to sign in until manually removed from Firebase Console

    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    await updateDoc(doc(db, FIREBASE_COLLECTIONS.USERS, userId), {
      role: newRole,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const isCurrentUserAdmin = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) return false;

    const usersQuery = query(
      collection(db, FIREBASE_COLLECTIONS.USERS),
      where('uid', '==', auth.currentUser.uid)
    );
    const userSnapshot = await getDocs(usersQuery);

    if (userSnapshot.empty) return false;

    const userData = userSnapshot.docs[0].data();
    return userData.role === 'Admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};



export { db, storage, auth, app };
