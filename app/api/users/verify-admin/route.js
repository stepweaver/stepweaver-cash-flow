import { NextResponse } from 'next/server';
import { verifyUserSession } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the session token
    const decodedToken = await verifyUserSession(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Check if the user has admin role in the database
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    if (userData.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 });
    }

    // Return success with user info (without sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: userData.role,
        displayName: userData.displayName
      }
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

