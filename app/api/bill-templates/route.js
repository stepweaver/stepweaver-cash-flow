import { NextRequest, NextResponse } from 'next/server';
import { verifyScopedToken, TOKEN_SCOPES } from '@/lib/session-tokens.js';
import { adminDb } from '@/lib/firebase-admin.js';
import { getStandardRateLimiter } from '@/lib/rate-limit-helper.js';

// Rate limiting: Configurable based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const requestsPerMinute = isDevelopment ? 100 : 30; // Higher limit in development

// GET: Retrieve all bill templates for the authenticated user
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

    // Get bill templates for the user
    const templatesQuery = adminDb
      .collection('billTemplates')
      .where('userId', '==', decodedToken.sub);

    const templatesSnapshot = await templatesQuery.get();
    const templates = templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ templates });

  } catch (error) {
    console.error('Error getting bill templates:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bill templates' },
      { status: 500 }
    );
  }
}

// POST: Create a new bill template
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

    const templateData = await request.json();

    if (!templateData.name || !templateData.name.trim()) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    // Create new template with user ID
    const newTemplate = {
      ...templateData,
      userId: decodedToken.sub,
      createdAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('billTemplates').add(newTemplate);

    return NextResponse.json(
      {
        id: docRef.id,
        ...newTemplate
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating bill template:', error);
    return NextResponse.json(
      { error: 'Failed to create bill template' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing bill template
export async function PUT(request) {
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

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Update template
    const templateRef = adminDb.collection('billTemplates').doc(id);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify user owns this template
    if (templateDoc.data().userId !== decodedToken.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await templateRef.update(updatedData);

    // Return the complete updated template
    const updatedDoc = await templateRef.get();
    const updatedTemplate = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };

    return NextResponse.json(updatedTemplate);

  } catch (error) {
    console.error('Error updating bill template:', error);
    return NextResponse.json(
      { error: 'Failed to update bill template' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a bill template
export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Delete template
    const templateRef = adminDb.collection('billTemplates').doc(id);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify user owns this template
    if (templateDoc.data().userId !== decodedToken.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await templateRef.delete();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting bill template:', error);
    return NextResponse.json(
      { error: 'Failed to delete bill template' },
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  });
}
