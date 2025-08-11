import { NextRequest, NextResponse } from 'next/server';
import { mintScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { rateLimit } from '@/lib/rate-limit.js';

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.check(10, ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { firebaseIdToken, scope, resourceId, additionalClaims } = await request.json();

    // Validate required fields
    if (!firebaseIdToken) {
      return NextResponse.json(
        { error: 'Firebase ID token is required' },
        { status: 400 }
      );
    }

    if (!scope || !Object.values(TOKEN_SCOPES).includes(scope)) {
      return NextResponse.json(
        { error: 'Valid scope is required' },
        { status: 400 }
      );
    }

    // Mint the scoped token
    const tokenData = await mintScopedToken(firebaseIdToken, scope, resourceId, additionalClaims);

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
    console.error('Error minting token:', error);
    
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
