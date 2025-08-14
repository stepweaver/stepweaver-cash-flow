import { NextResponse } from 'next/server';
import { verifyScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { adminDb } from '@/lib/firebase-admin.js';

export async function GET(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the scoped token has admin access
    const decodedToken = verifyScopedToken(token, TOKEN_SCOPES.ADMIN_ACCESS);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = decodedToken.sub;

    // Get or create the user document
    let userDoc = await adminDb.collection('users').doc(userId).get();

    // If user doesn't exist, create them as admin (for initial setup)
    if (!userDoc.exists) {
      await adminDb.collection('users').doc(userId).set({
        email: 'stephen@stepweaver.dev',
        displayName: 'Stephen (StepWeaver Admin)',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      });

      userDoc = await adminDb.collection('users').doc(userId).get();
    }

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    if (userData.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 });
    }

    // Return success with user info
    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.sub,
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName
      }
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

