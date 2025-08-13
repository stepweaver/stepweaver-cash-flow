import 'server-only';
import jwt from 'jsonwebtoken';
import { verifyUserSession } from './firebase-admin.js';

// Token configuration
const TOKEN_TTL_SECONDS = 300; // 5 minutes
const SIGNING_SECRET = process.env.SESSION_TOKEN_SECRET;
const SIGNING_SECRET_PREVIOUS = process.env.SESSION_TOKEN_SECRET_PREVIOUS; // For rotation

if (!SIGNING_SECRET) {
  throw new Error('SESSION_TOKEN_SECRET environment variable is required');
}

// Token scopes for least-privilege access
export const TOKEN_SCOPES = {
  READ_BUSINESS_TRANSACTIONS: 'read_business_transactions',
  WRITE_BUSINESS_TRANSACTIONS: 'write_business_transactions',
  READ_PERSONAL_DATA: 'read_personal_data',
  WRITE_PERSONAL_DATA: 'write_personal_data',
  READ_USERS: 'read_users',
  WRITE_USERS: 'write_users',
  UPLOAD_FILES: 'upload_files',
  DELETE_FILES: 'delete_files'
};

// Validate scope permissions
function validateScope(scope) {
  return Object.values(TOKEN_SCOPES).includes(scope);
}

// Mint a new scoped token for a specific operation
export async function mintScopedToken(firebaseIdToken, scope, resourceId = null, additionalClaims = {}) {
  try {
    // Verify the Firebase ID token first
    const decodedToken = await verifyUserSession(firebaseIdToken);
    if (!decodedToken) {
      throw new Error('Invalid Firebase ID token');
    }

    // Validate the requested scope
    if (!validateScope(scope)) {
      throw new Error('Invalid scope requested');
    }

    // Check if user has admin privileges for user management scopes
    let isAdmin = false;
    if (scope === 'read_users' || scope === 'write_users') {
      // For now, we'll assume all authenticated users can manage users
      // In a production system, you'd check against a user roles collection
      isAdmin = true;
    }

    // Create the scoped token with minimal claims
    const tokenPayload = {
      sub: decodedToken.uid, // User ID from Firebase
      scope,
      resourceId,
      isAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
      ...additionalClaims
    };

    const token = jwt.sign(tokenPayload, SIGNING_SECRET, {
      algorithm: 'HS256',
      issuer: 'stepweaver-cash-flow',
      audience: 'stepweaver-cash-flow-client'
    });

    return {
      token,
      expiresIn: TOKEN_TTL_SECONDS,
      scope,
      resourceId
    };
  } catch (error) {
    console.error('Error minting scoped token:', error);
    throw new Error('Failed to mint scoped token');
  }
}

// Verify a scoped token
export function verifyScopedToken(token, requiredScope = null) {
  try {
    // Try primary secret first
    let decoded = jwt.verify(token, SIGNING_SECRET, {
      algorithms: ['HS256'],
      issuer: 'stepweaver-cash-flow',
      audience: 'stepweaver-cash-flow-client'
    });

    // If required scope is specified, validate it
    if (requiredScope && decoded.scope !== requiredScope) {
      console.error(`Token scope mismatch: expected ${requiredScope}, got ${decoded.scope}`);
      throw new Error('Token scope does not match required scope');
    }

    return decoded;
  } catch (error) {
    // If primary secret fails and we have a previous secret, try that (for rotation)
    if (SIGNING_SECRET_PREVIOUS && error.name === 'JsonWebTokenError') {
      try {
        let decoded = jwt.verify(token, SIGNING_SECRET_PREVIOUS, {
          algorithms: ['HS256'],
          issuer: 'stepweaver-cash-flow',
          audience: 'stepweaver-cash-flow-client'
        });

        if (requiredScope && decoded.scope !== requiredScope) {
          console.error(`Token scope mismatch (rotation): expected ${requiredScope}, got ${decoded.scope}`);
          throw new Error('Token scope does not match required scope');
        }

        return decoded;
      } catch (rotationError) {
        console.error('Token verification failed with both secrets:', error.message, rotationError.message);
        throw new Error('Invalid or expired token');
      }
    }

    // Log the specific error for debugging
    if (error.name === 'TokenExpiredError') {
      console.error('Token expired:', error.message);
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token format:', error.message);
      throw new Error('Invalid token format');
    } else {
      console.error('Token verification error:', error.message);
      throw new Error('Invalid or expired token');
    }
  }
}

// Check if a token has expired
export function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

// Get token metadata without verification (for logging/debugging)
export function getTokenMetadata(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded) return null;

    return {
      scope: decoded.scope,
      resourceId: decoded.resourceId,
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
      isExpired: decoded.exp ? Date.now() >= decoded.exp * 1000 : true
    };
  } catch {
    return null;
  }
}
