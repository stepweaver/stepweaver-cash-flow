import { NextRequest, NextResponse } from 'next/server';
import { verifyScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { adminDb } from '@/lib/firebase-admin.js';
import { rateLimit } from '@/lib/rate-limit.js';

// Rate limiting: 20 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

// PUT: Update business transaction
export async function PUT(request, { params }) {
  try {
    const { id } = params;

    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.check(20, ip);

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

    // Update the transaction
    const updatedTransaction = {
      ...existingTransaction,
      ...updateData,
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
    const { id } = params;

    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.check(20, ip);

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
