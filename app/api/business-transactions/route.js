import { NextRequest, NextResponse } from 'next/server';
import { verifyScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { adminDb } from '@/lib/firebase-admin.js';
import { rateLimit } from '@/lib/rate-limit.js';

// Rate limiting: Configurable based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const requestsPerMinute = isDevelopment ? 100 : 30; // Higher limit in development

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

// GET: Retrieve business transactions
export async function GET(request) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.check(requestsPerMinute, ip);

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

    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date ? new Date(doc.data().date).toISOString() : null
    }));

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
    const { success } = await limiter.check(requestsPerMinute, ip);

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

    // Create the transaction with user ID from token
    const newTransaction = {
      ...transactionData,
      userId: decodedToken.sub,
      date: new Date(transactionData.date).toISOString(),
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
