import { NextRequest, NextResponse } from 'next/server';
import { mintScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { getAuthRateLimiter } from '@/lib/rate-limit-helper.js';
import { isFirebaseAdminInitialized } from '@/lib/firebase-admin.js';

// Rate limiting: Configurable based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const requestsPerMinute = isDevelopment ? 100 : 50; // Higher limit in development

export async function POST(request) {
  try {
    console.log('=== TOKEN REQUEST START ===');

    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimiter = await getAuthRateLimiter();
    const { success } = await rateLimiter.check(requestsPerMinute, ip);

    if (!success) {
      console.log('Rate limit exceeded');
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { firebaseIdToken, scope, resourceId, additionalClaims } = await request.json();

    console.log('Token request received:', {
      hasFirebaseToken: !!firebaseIdToken,
      scope,
      resourceId: !!resourceId,
      claims: Object.keys(additionalClaims || {}),
      firebaseAdminInitialized: isFirebaseAdminInitialized(),
      nodeEnv: process.env.NODE_ENV
    });

    // Validate required fields
    if (!firebaseIdToken) {
      console.error('Missing Firebase ID token');
      return NextResponse.json(
        { error: 'Firebase ID token is required' },
        { status: 400 }
      );
    }

    if (!scope || !Object.values(TOKEN_SCOPES).includes(scope)) {
      console.error('Invalid scope requested:', scope, 'Valid scopes:', Object.values(TOKEN_SCOPES));
      return NextResponse.json(
        { error: 'Valid scope is required' },
        { status: 400 }
      );
    }

    console.log('About to call mintScopedToken...');

    // Mint the scoped token
    const tokenData = await mintScopedToken(firebaseIdToken, scope, resourceId, additionalClaims);

    console.log('Token minted successfully! Token data:', {
      hasToken: !!tokenData.token,
      expiresIn: tokenData.expiresIn,
      scope: tokenData.scope,
      isDev: tokenData.dev
    });

    // Return the token with security headers
    return NextResponse.json(tokenData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('=== ERROR IN TOKEN ENDPOINT ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    // Don't expose internal error details to the client
    return NextResponse.json(
      { error: 'Failed to mint token' },
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  });
}
