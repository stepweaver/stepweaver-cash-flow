import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';

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

// Forward persistence functions
export const deletePersonalBillFromCurrentAndFuture = async (billName, currentYear, currentMonth) => {
  try {
    const currentDate = new Date(currentYear, currentMonth - 1, 1);
    const currentDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;

    // Delete all bills with this name from current month forward
    const billsQuery = query(
      collection(db, 'personalBills'),
      where('name', '==', billName),
      where('dueDate', '>=', currentDateStr)
    );

    const billsSnapshot = await getDocs(billsQuery);
    const deletePromises = billsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Also delete the bill template
    const templatesQuery = query(
      collection(db, 'billTemplates'),
      where('name', '==', billName)
    );
    const templatesSnapshot = await getDocs(templatesQuery);
    const templateDeletePromises = templatesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(templateDeletePromises);

  } catch (error) {
    console.error('Error deleting bill from current and future months:', error);
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
      where('dueDate', '>=', `${yearMonth}-01`),
      where('dueDate', '<=', `${yearMonth}-31`)
    );
    const existingBillsSnapshot = await getDocs(existingBillsQuery);
    const existingBillNames = existingBillsSnapshot.docs.map(doc => doc.data().name);

    // Generate bills from templates that don't already exist
    const newBills = [];
    for (const template of templates) {
      if (!existingBillNames.includes(template.name)) {
        const newBill = {
          name: template.name,
          dueDate: `${year}-${monthStr}-${String(template.defaultDueDay || 1).padStart(2, '0')}`,
          amountDue: template.defaultAmount || 0,
          amountPaid: null,
          status: '',
          notes: '', // Don't persist notes forward
          url: template.url || '',
          templateId: template.id
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

export { db, storage };
