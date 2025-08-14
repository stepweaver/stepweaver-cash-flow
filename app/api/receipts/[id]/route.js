import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '../../../../lib/firebase-admin.js';
import { verifyScopedToken, TOKEN_SCOPES } from '../../../../lib/session-tokens.js';

// Utility function to sanitize filenames for HTTP headers
function sanitizeFilenameForHeader(filename) {
  return filename
    .replace(/[^\x00-\x7F]/g, '_') // Replace non-ASCII characters with underscore
    .replace(/[<>:"/\\|?*]/g, '_'); // Replace invalid filename characters
}

export async function GET(request, { params }) {
  const resolvedParams = await params;
  console.log('🔍 Receipt proxy request received for ID:', resolvedParams?.id);
  const { id } = resolvedParams;

  try {
    if (!id) {
      console.error('❌ No receipt ID provided');
      return NextResponse.json({ error: 'Receipt ID required' }, { status: 400 });
    }

    console.log('🔐 Verifying authentication...');

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔐 Verifying scoped token...');

    let decodedToken;
    try {
      decodedToken = verifyScopedToken(token, TOKEN_SCOPES.READ_BUSINESS_TRANSACTIONS);
    } catch (tokenError) {
      console.error('❌ Token verification failed:', tokenError.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!decodedToken) {
      console.error('❌ Token verification returned null');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Token verified for user:', decodedToken.sub);

    // Get receipt metadata from Firestore
    console.log('📄 Fetching receipt document from Firestore...');

    let receiptDoc;
    try {
      receiptDoc = await adminDb.collection('receipts').doc(id).get();
    } catch (firestoreError) {
      console.error('❌ Firestore error:', firestoreError.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!receiptDoc.exists) {
      console.error('❌ Receipt not found in database:', id);
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const receiptData = receiptDoc.data();
    console.log('📄 Receipt data retrieved:', {
      userId: receiptData.userId,
      name: receiptData.name,
      storageType: receiptData.storageType,
      hasStoragePath: !!receiptData.storagePath,
      hasData: !!receiptData.data
    });

    // Verify user owns this receipt
    if (receiptData.userId !== decodedToken.sub) {
      console.error('❌ User does not own this receipt:', {
        receiptUserId: receiptData.userId,
        tokenUserId: decodedToken.sub
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('✅ User authorization verified');

    // Handle different storage types
    console.log('💾 Processing storage type:', receiptData.storageType);

    if (receiptData.storageType === 'firebase-storage' && receiptData.storagePath) {
      // Download from Firebase Storage
      console.log('☁️  Downloading from Firebase Storage:', receiptData.storagePath);

      if (!adminStorage) {
        console.error('❌ Firebase Storage service not available');
        return NextResponse.json({ error: 'Storage service not available' }, { status: 500 });
      }

      try {
        const bucket = adminStorage.bucket();
        const file = bucket.file(receiptData.storagePath);

        console.log('📥 Checking if file exists in storage...');

        // Check if file exists first
        const [exists] = await file.exists();
        if (!exists) {
          console.error('❌ File does not exist in Firebase Storage:', receiptData.storagePath);
          throw new Error(`File not found in storage: ${receiptData.storagePath}`);
        }

        console.log('✅ File exists, downloading...');

        // Get file buffer
        const [fileBuffer] = await file.download();

        console.log('✅ File downloaded successfully, size:', fileBuffer.length);

        // Sanitize filename for Content-Disposition header
        const sanitizedFilename = sanitizeFilenameForHeader(receiptData.name);
        console.log('📄 Using sanitized filename for download:', sanitizedFilename);

        // Return file with appropriate headers
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': receiptData.mimeType || receiptData.type || 'application/octet-stream',
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
            'Content-Disposition': `attachment; filename="${sanitizedFilename}"`
          }
        });
      } catch (storageError) {
        console.error('❌ Error downloading from Firebase Storage:', {
          message: storageError.message,
          code: storageError.code,
          storagePath: receiptData.storagePath
        });

        // Check if there's fallback base64 data available
        if (receiptData.data) {
          console.log('🔄 Firebase Storage failed, trying fallback base64 data...');
          try {
            // Extract base64 data (remove data URL prefix if present)
            const base64Data = receiptData.data.includes(',')
              ? receiptData.data.split(',')[1]
              : receiptData.data;

            // Convert base64 to buffer
            const fileBuffer = Buffer.from(base64Data, 'base64');

            console.log('✅ Fallback base64 data processed successfully, size:', fileBuffer.length);

            // Sanitize filename for Content-Disposition header
            const sanitizedFilename = sanitizeFilenameForHeader(receiptData.name);
            console.log('📄 Using sanitized filename for fallback download:', sanitizedFilename);

            // Return file with appropriate headers
            return new NextResponse(fileBuffer, {
              status: 200,
              headers: {
                'Content-Type': receiptData.mimeType || receiptData.type || 'application/octet-stream',
                'Content-Length': fileBuffer.length.toString(),
                'Cache-Control': 'private, max-age=3600',
                'Content-Disposition': `attachment; filename="${sanitizedFilename}"`
              }
            });
          } catch (fallbackError) {
            console.error('❌ Fallback base64 processing also failed:', fallbackError.message);
          }
        }

        return NextResponse.json({
          error: 'Failed to download receipt',
          details: storageError.message
        }, { status: 500 });
      }
    } else if (receiptData.storageType === 'firestore' && receiptData.data) {
      // Handle base64 data from Firestore
      try {
        // Extract base64 data (remove data URL prefix if present)
        const base64Data = receiptData.data.includes(',')
          ? receiptData.data.split(',')[1]
          : receiptData.data;

        // Convert base64 to buffer
        const fileBuffer = Buffer.from(base64Data, 'base64');

        // Sanitize filename for Content-Disposition header
        const sanitizedFilename = sanitizeFilenameForHeader(receiptData.name);
        console.log('📄 Using sanitized filename for Firestore download:', sanitizedFilename);

        // Return file with appropriate headers
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': receiptData.mimeType || receiptData.type || 'application/octet-stream',
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
            'Content-Disposition': `attachment; filename="${sanitizedFilename}"`
          }
        });
      } catch (dataError) {
        console.error('Error processing base64 data:', dataError);
        return NextResponse.json({ error: 'Failed to process receipt data' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Receipt data not available' }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Unexpected error in receipt proxy:', {
      message: error.message,
      stack: error.stack,
      receiptId: id
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
