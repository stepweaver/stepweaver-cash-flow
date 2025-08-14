import { NextRequest, NextResponse } from 'next/server';
import { verifyScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { adminDb, adminStorage } from '@/lib/firebase-admin.js';
import { rateLimit } from '@/lib/rate-limit.js';

// Rate limiting: Configurable based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const requestsPerMinute = isDevelopment ? 100 : 20; // Higher limit in development

// Initialize rate limiter (async)
let limiter = null;
async function getRateLimiter() {
  if (!limiter) {
    limiter = await rateLimit({
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 500
    });
  }
  return limiter;
}

// PUT: Update business transaction
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimiter = await getRateLimiter();
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

    const updateData = await request.json();

    // Get the existing transaction to verify ownership
    const transactionRef = adminDb.collection('businessTransactions').doc(id);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const existingTransaction = transactionDoc.data();

    // Verify the user owns this transaction
    if (existingTransaction.userId !== decodedToken.sub) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Handle receipt updates separately
    let updatedReceiptIds = existingTransaction.receiptIds || [];

    if (updateData.receipts !== undefined) {
      // If receipts are being updated, handle them properly
      try {
        // Delete old receipts if they exist
        if (existingTransaction.receiptIds && existingTransaction.receiptIds.length > 0) {
          const bucket = adminStorage?.bucket();
          for (const receiptId of existingTransaction.receiptIds) {
            const receiptDoc = await adminDb.collection('receipts').doc(receiptId).get();
            if (receiptDoc.exists) {
              const receiptData = receiptDoc.data();
              // Delete from Storage if path exists
              if (bucket && receiptData.storagePath) {
                try {
                  await bucket.file(receiptData.storagePath).delete();
                } catch (storageError) {
                  console.error(`Error deleting receipt from storage: ${receiptData.storagePath}`, storageError);
                }
              }
              // Delete from Firestore
              await adminDb.collection('receipts').doc(receiptId).delete();
            }
          }
        }

        // Store new receipts using Firebase Storage
        updatedReceiptIds = [];
        if (updateData.receipts && updateData.receipts.length > 0) {
          if (!adminStorage) {
            throw new Error('Storage service not available');
          }

          const bucket = adminStorage.bucket();

          for (const receipt of updateData.receipts) {
            if (!receipt.data) continue;

            // Extract base64 data (remove data URL prefix if present)
            const base64Data = receipt.data.includes(',')
              ? receipt.data.split(',')[1]
              : receipt.data;

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

            // Store receipt metadata in Firestore
            const receiptDoc = {
              userId: decodedToken.sub,
              name: receipt.name,
              size: receipt.size,
              type: receipt.type,
              mimeType: receipt.mimeType || receipt.type,
              uploadDate: receipt.uploadDate || new Date().toISOString(),
              storagePath: fileName,
              downloadURL: downloadURL,
              createdAt: new Date().toISOString()
            };

            const receiptRef = await adminDb.collection('receipts').add(receiptDoc);
            updatedReceiptIds.push(receiptRef.id);
          }
        }
      } catch (receiptError) {
        console.error('Error updating receipts:', receiptError);
        return NextResponse.json(
          { error: 'Failed to update receipts' },
          { status: 500 }
        );
      }
    }

    // Update the transaction (exclude receipts data, use receiptIds instead)
    const { receipts, ...updateDataWithoutReceipts } = updateData;
    const updatedTransaction = {
      ...existingTransaction,
      ...updateDataWithoutReceipts,
      receiptIds: updatedReceiptIds,
      updatedAt: new Date().toISOString()
    };

    await transactionRef.update(updatedTransaction);

    return NextResponse.json({
      id,
      ...updatedTransaction
    });

  } catch (error) {
    console.error('Error updating business transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE: Delete business transaction
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimiter = await getRateLimiter();
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

    // Get the existing transaction to verify ownership
    const transactionRef = adminDb.collection('businessTransactions').doc(id);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const existingTransaction = transactionDoc.data();

    // Verify the user owns this transaction
    if (existingTransaction.userId !== decodedToken.sub) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete associated receipts first
    if (existingTransaction.receiptIds && existingTransaction.receiptIds.length > 0) {
      try {
        const bucket = adminStorage?.bucket();
        for (const receiptId of existingTransaction.receiptIds) {
          const receiptDoc = await adminDb.collection('receipts').doc(receiptId).get();
          if (receiptDoc.exists) {
            const receiptData = receiptDoc.data();
            // Delete from Storage if path exists
            if (bucket && receiptData.storagePath) {
              try {
                await bucket.file(receiptData.storagePath).delete();
              } catch (storageError) {
                console.error(`Error deleting receipt from storage: ${receiptData.storagePath}`, storageError);
              }
            }
            // Delete from Firestore
            await adminDb.collection('receipts').doc(receiptId).delete();
          }
        }
      } catch (receiptError) {
        console.error('Error deleting receipts:', receiptError);
        // Continue with transaction deletion even if receipt deletion fails
      }
    }

    // Delete the transaction
    await transactionRef.delete();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting business transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
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
      'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  });
}
