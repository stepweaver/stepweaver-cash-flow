import { NextRequest, NextResponse } from 'next/server';
import { verifyScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { adminDb } from '@/lib/firebase-admin.js';
import { rateLimit } from '@/lib/rate-limit.js';

// Rate limiting: 20 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

// PUT: Update personal data item (income or bill)
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
      decodedToken = verifyScopedToken(token, TOKEN_SCOPES.WRITE_PERSONAL_DATA);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const updateData = await request.json();

    // Get the existing item to verify ownership
    // Try to find the item in both collections
    let itemRef, itemDoc, existingItem;

    // First try personalIncome collection
    itemRef = adminDb.collection('personalIncome').doc(id);
    itemDoc = await itemRef.get();

    if (itemDoc.exists) {
      existingItem = itemDoc.data();
    } else {
      // If not found in income, try personalBills collection
      itemRef = adminDb.collection('personalBills').doc(id);
      itemDoc = await itemRef.get();

      if (itemDoc.exists) {
        existingItem = itemDoc.data();
      } else {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }
    }

    // Verify the user owns this item
    if (existingItem.userId !== decodedToken.sub) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update the item
    const updatedItem = {
      ...existingItem,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await itemRef.update(updatedItem);

    return NextResponse.json({
      id,
      ...updatedItem
    });

  } catch (error) {
    console.error('Error updating personal data item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE: Delete personal data item (income or bill)
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
      decodedToken = verifyScopedToken(token, TOKEN_SCOPES.WRITE_PERSONAL_DATA);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get the existing item to verify ownership
    // Try to find the item in both collections
    let itemRef, itemDoc, existingItem;

    // First try personalIncome collection
    itemRef = adminDb.collection('personalIncome').doc(id);
    itemDoc = await itemRef.get();

    if (itemDoc.exists) {
      existingItem = itemDoc.data();
    } else {
      // If not found in income, try personalBills collection
      itemRef = adminDb.collection('personalBills').doc(id);
      itemDoc = await itemRef.get();

      if (itemDoc.exists) {
        existingItem = itemDoc.data();
      } else {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }
    }

    // Verify the user owns this item
    if (existingItem.userId !== decodedToken.sub) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the item
    await itemRef.delete();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting personal data item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
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
