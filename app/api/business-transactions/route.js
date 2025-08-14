import { NextRequest, NextResponse } from 'next/server';
import { verifyScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { adminDb, adminStorage } from '@/lib/firebase-admin.js';
import { getStandardRateLimiter } from '@/lib/rate-limit-helper.js';

// Rate limiting: Configurable based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const requestsPerMinute = isDevelopment ? 100 : 30; // Higher limit in development

// GET: Retrieve business transactions
export async function GET(request) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimiter = await getStandardRateLimiter();
    const { success } = await rateLimiter.check(requestsPerMinute, ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header:', authHeader);
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Received token for business transactions request');

    // Verify the scoped token
    let decodedToken;
    try {
      decodedToken = verifyScopedToken(token, TOKEN_SCOPES.READ_BUSINESS_TRANSACTIONS);
      console.log('Token verified successfully for user:', decodedToken.sub);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get transactions for the authenticated user
    const transactionsSnapshot = await adminDb
      .collection('businessTransactions')
      .where('userId', '==', decodedToken.sub)
      .orderBy('date', 'desc')
      .get();

    // Map transactions and fetch receipts for each
    const transactions = [];
    for (const doc of transactionsSnapshot.docs) {
      const transactionData = {
        id: doc.id,
        ...doc.data(),
        date: doc.data().date ? new Date(doc.data().date).toISOString() : null
      };

      // Fetch receipts if transaction has receiptIds
      if (transactionData.receiptIds && transactionData.receiptIds.length > 0) {
        try {
          const receipts = [];
          for (const receiptId of transactionData.receiptIds) {
            const receiptDoc = await adminDb.collection('receipts').doc(receiptId).get();
            if (receiptDoc.exists) {
              const receiptData = receiptDoc.data();

              // Handle different storage types
              let receiptInfo;
              if (receiptData.storageType === 'firebase-storage') {
                // Receipt stored in Firebase Storage
                receiptInfo = {
                  id: receiptDoc.id,
                  name: receiptData.name,
                  size: receiptData.size,
                  type: receiptData.type,
                  mimeType: receiptData.mimeType,
                  uploadDate: receiptData.uploadDate,
                  data: receiptData.downloadURL,
                  url: receiptData.downloadURL,
                  storagePath: receiptData.storagePath,
                  storageType: 'firebase-storage'
                };
              } else {
                // Receipt stored in Firestore (legacy or small files)
                receiptInfo = {
                  id: receiptDoc.id,
                  name: receiptData.name,
                  size: receiptData.size,
                  type: receiptData.type,
                  mimeType: receiptData.mimeType,
                  uploadDate: receiptData.uploadDate,
                  data: receiptData.data,
                  url: receiptData.data,
                  storageType: 'firestore'
                };
              }

              receipts.push(receiptInfo);
            }
          }
          transactionData.receipts = receipts;
        } catch (receiptError) {
          console.error(`Error fetching receipts for transaction ${doc.id}:`, receiptError);
          transactionData.receipts = [];
        }
      } else {
        transactionData.receipts = [];
      }

      transactions.push(transactionData);
    }

    console.log(`Retrieved ${transactions.length} transactions for user ${decodedToken.sub}`);

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error('Error getting business transactions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transactions' },
      { status: 500 }
    );
  }
}

// POST: Create new business transaction
export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimiter = await getStandardRateLimiter();
    const { success } = await rateLimiter.check(requestsPerMinute, ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the scoped token
    let decodedToken;
    try {
      decodedToken = verifyScopedToken(token, TOKEN_SCOPES.WRITE_BUSINESS_TRANSACTIONS);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const transactionData = await request.json();

    // Validate required fields
    if (!transactionData.description || !transactionData.amount || !transactionData.date) {
      return NextResponse.json(
        { error: 'Description, amount, and date are required' },
        { status: 400 }
      );
    }

    // Handle receipts with hybrid approach: try Storage first, fallback to Firestore
    let receiptIds = [];
    if (transactionData.receipts && transactionData.receipts.length > 0) {
      try {
        console.log(`Storing ${transactionData.receipts.length} receipts for user ${decodedToken.sub}`);

        // Check if Firebase Storage is available and configured
        const useFirebaseStorage = adminStorage && process.env.FIREBASE_ADMIN_STORAGE_BUCKET;
        console.log(`Firebase Storage available: ${useFirebaseStorage}`);

        for (const receipt of transactionData.receipts) {
          console.log(`Processing receipt: ${receipt.name}, size: ${receipt.size}, type: ${receipt.type}`);

          if (!receipt.data) {
            console.error('Receipt data is missing');
            continue;
          }

          // Calculate base64 data size
          const base64Data = receipt.data.includes(',')
            ? receipt.data.split(',')[1]
            : receipt.data;
          const dataSize = base64Data.length;

          console.log(`Receipt data size: ${dataSize} characters (${Math.round(dataSize / 1024)}KB)`);

          // Firestore document size limit is ~1MB, but base64 is ~33% larger than binary
          // Safe limit for base64 data in Firestore: ~700KB
          const FIRESTORE_SAFE_LIMIT = 700 * 1024; // 700KB in characters

          let receiptDoc;

          if (useFirebaseStorage && dataSize > FIRESTORE_SAFE_LIMIT) {
            // Use Firebase Storage for large files
            console.log('Using Firebase Storage for large receipt');
            try {
              const bucket = adminStorage.bucket();

              // Convert base64 to buffer
              const fileBuffer = Buffer.from(base64Data, 'base64');

              // Generate unique filename
              const timestamp = Date.now();
              const randomId = Math.random().toString(36).substr(2, 9);
              const fileExtension = receipt.name.split('.').pop() || 'bin';
              const fileName = `receipts/${decodedToken.sub}/${timestamp}_${randomId}.${fileExtension}`;

              // Upload to Firebase Storage
              const file = bucket.file(fileName);
              await file.save(fileBuffer, {
                metadata: {
                  contentType: receipt.type || 'application/octet-stream',
                  metadata: {
                    originalName: receipt.name,
                    userId: decodedToken.sub,
                    uploadDate: new Date().toISOString()
                  }
                }
              });

              // Get download URL
              const [downloadURL] = await file.getSignedUrl({
                action: 'read',
                expires: '03-01-2030'
              });

              receiptDoc = {
                userId: decodedToken.sub,
                name: receipt.name,
                size: receipt.size,
                type: receipt.type,
                mimeType: receipt.mimeType || receipt.type,
                uploadDate: receipt.uploadDate || new Date().toISOString(),
                storagePath: fileName,
                downloadURL: downloadURL,
                storageType: 'firebase-storage',
                createdAt: new Date().toISOString()
              };

              console.log(`Successfully uploaded to Storage: ${fileName}`);
            } catch (storageError) {
              console.error('Firebase Storage failed, falling back to Firestore:', storageError);
              // Fall back to Firestore if Storage fails
              if (dataSize > FIRESTORE_SAFE_LIMIT) {
                throw new Error(`Receipt "${receipt.name}" is too large (${Math.round(dataSize / 1024)}KB). Please use a smaller file (max 700KB) or configure Firebase Storage.`);
              }
              receiptDoc = {
                userId: decodedToken.sub,
                name: receipt.name,
                size: receipt.size,
                type: receipt.type,
                mimeType: receipt.mimeType || receipt.type,
                uploadDate: receipt.uploadDate || new Date().toISOString(),
                data: receipt.data,
                storageType: 'firestore',
                createdAt: new Date().toISOString()
              };
            }
          } else if (dataSize <= FIRESTORE_SAFE_LIMIT) {
            // Use Firestore for smaller files
            console.log('Using Firestore for small receipt');
            receiptDoc = {
              userId: decodedToken.sub,
              name: receipt.name,
              size: receipt.size,
              type: receipt.type,
              mimeType: receipt.mimeType || receipt.type,
              uploadDate: receipt.uploadDate || new Date().toISOString(),
              data: receipt.data,
              storageType: 'firestore',
              createdAt: new Date().toISOString()
            };
          } else {
            // File too large and no Firebase Storage available
            throw new Error(`Receipt "${receipt.name}" is too large (${Math.round(dataSize / 1024)}KB). Please use a smaller file (max 700KB) or configure Firebase Storage.`);
          }

          const receiptRef = await adminDb.collection('receipts').add(receiptDoc);
          receiptIds.push(receiptRef.id);
          console.log(`Successfully stored receipt with ID: ${receiptRef.id} using ${receiptDoc.storageType}`);
        }
      } catch (receiptError) {
        console.error('Error storing receipts:', receiptError);
        console.error('Receipt error details:', {
          message: receiptError.message,
          code: receiptError.code,
          stack: receiptError.stack
        });
        return NextResponse.json(
          { error: 'Failed to store receipts', details: receiptError.message },
          { status: 500 }
        );
      }
    }

    // Create the transaction with user ID from token (without large receipt data)
    const newTransaction = {
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      date: new Date(transactionData.date).toISOString(),
      receiptIds: receiptIds, // Store only receipt IDs, not the actual data
      userId: decodedToken.sub,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('businessTransactions').add(newTransaction);

    return NextResponse.json(
      {
        id: docRef.id,
        ...newTransaction
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating business transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  });
}
