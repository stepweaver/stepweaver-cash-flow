import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';

// Debug: Log environment variables to help troubleshoot
console.log('Firebase Environment Variables:');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing');
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing');
console.log('Messaging Sender ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing');
console.log('App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing');

// Your Firebase configuration
// Using the actual Firebase config values provided by the user
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDIIYViqAPX9gvuOJNMyOKpAPAwIEKD63I",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "stepweaver-cash-flow-87032.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "stepweaver-cash-flow-87032",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stepweaver-cash-flow-87032.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "760369548906",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:760369548906:web:d05096ca9fcd2c012b8413",
  measurementId: "G-PXZQ8PZFJW"
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

    // Get bills for the month
    const billsQuery = query(
      collection(db, 'personalBills'),
      where('dueDate', '>=', `${yearMonth}-01`),
      where('dueDate', '<=', `${yearMonth}-31`)
    );
    const billsSnapshot = await getDocs(billsQuery);
    const bills = billsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { income, bills };
  } catch (error) {
    console.error('Error getting personal data:', error);
    throw error;
  }
};

export const updatePersonalBill = async (id, updates) => {
  try {
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

export { db };
