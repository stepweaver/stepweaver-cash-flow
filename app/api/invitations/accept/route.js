import { NextRequest, NextResponse } from 'next/server';
import { acceptInvitation } from '@/lib/invitations.server.js';
import { rateLimit } from '@/lib/rate-limit.js';
import { getAuth } from 'firebase-admin/auth';

// Rate limiting: 5 requests per minute for account creation
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

// POST: Accept invitation and create user account
export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.check(5, ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get the invitation to check for displayName
    const { getInvitationByToken } = await import('@/lib/invitations.server.js');
    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    // Create the user account in Firebase Auth
    const auth = getAuth();
    let userRecord;

    try {
      const userData = {
        email: email.toLowerCase().trim(),
        password: password,
        emailVerified: true // Since they're coming from an invitation
      };

      // Add displayName if it exists in the invitation
      if (invitation.displayName) {
        userData.displayName = invitation.displayName;
      }

      userRecord = await auth.createUser(userData);
    } catch (firebaseError) {
      if (firebaseError.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      throw firebaseError;
    }

    // Accept the invitation
    await acceptInvitation(token, userRecord.uid);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);

    if (error.message.includes('Invalid invitation token')) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 400 }
      );
    }

    if (error.message.includes('already been used')) {
      return NextResponse.json(
        { error: 'This invitation has already been used' },
        { status: 410 }
      );
    }

    if (error.message.includes('expired')) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
