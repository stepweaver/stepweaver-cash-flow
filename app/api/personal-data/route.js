import { NextRequest, NextResponse } from 'next/server';
import { verifyScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { adminDb } from '@/lib/firebase-admin.js';
import { getStandardRateLimiter } from '@/lib/rate-limit-helper.js';

// Rate limiting: Configurable based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const requestsPerMinute = isDevelopment ? 100 : 30; // Higher limit in development

// GET: Retrieve personal data for a specific month
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
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the scoped token
    let decodedToken;
    try {
      decodedToken = verifyScopedToken(token, TOKEN_SCOPES.READ_PERSONAL_DATA);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month parameters are required' },
        { status: 400 }
      );
    }

    const monthStr = String(month).padStart(2, '0');
    const yearMonth = `${year}-${monthStr}`;

    // Get income for the month
    const incomeQuery = adminDb
      .collection('personalIncome')
      .where('userId', '==', decodedToken.sub)
      .where('date', '>=', `${yearMonth}-01`)
      .where('date', '<=', `${yearMonth}-31`);

    const incomeSnapshot = await incomeQuery.get();
    const income = incomeSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get bills for the month
    const billsQuery = adminDb
      .collection('personalBills')
      .where('userId', '==', decodedToken.sub)
      .where('dueDate', '>=', `${yearMonth}-01`)
      .where('dueDate', '<=', `${yearMonth}-31`);

    const billsSnapshot = await billsQuery.get();
    let bills = billsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Also get bills that were generated for this month but don't have dueDate set
    const generatedBillsQuery = adminDb
      .collection('personalBills')
      .where('userId', '==', decodedToken.sub)
      .where('month', '==', parseInt(month))
      .where('year', '==', parseInt(year));

    const generatedBillsSnapshot = await generatedBillsQuery.get();
    const generatedBills = generatedBillsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter out generated bills that already have dueDate set
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

    return NextResponse.json({ income, bills: allBills });

  } catch (error) {
    console.error('Error getting personal data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve personal data' },
      { status: 500 }
    );
  }
}

// POST: Create new personal income or bill
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
      decodedToken = verifyScopedToken(token, TOKEN_SCOPES.WRITE_PERSONAL_DATA);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    let newItem;
    let collectionName;

    if (type === 'income') {
      collectionName = 'personalIncome';
      newItem = {
        ...data,
        userId: decodedToken.sub,
        createdAt: new Date().toISOString()
      };
    } else if (type === 'bill') {
      collectionName = 'personalBills';
      newItem = {
        ...data,
        userId: decodedToken.sub,
        createdAt: new Date().toISOString()
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "income" or "bill"' },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection(collectionName).add(newItem);

    return NextResponse.json(
      {
        id: docRef.id,
        ...newItem
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating personal data:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
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
