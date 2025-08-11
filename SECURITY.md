# Security Documentation

## Overview

This document outlines the security measures implemented in the Stepweaver Cash Flow application to prevent client-side secret leaks and ensure all access is per-session, server-scoped, and least-privileged.

## Security Architecture

### 1. Client-Side Security

**No Secrets in Client Code**
- All Firebase configuration values are public by design (required for client-side authentication)
- No API keys, secrets, or sensitive configuration exposed to the browser
- Client components only handle UI and user interactions

**Secure Authentication Flow**
- Firebase Auth handles user authentication on the client
- Client obtains Firebase ID tokens for server communication
- No direct database access from client components

### 2. Server-Side Security

**Scoped Token System**
- Short-lived (5 minutes) JWT tokens for specific operations
- Least-privilege access control through token scopes
- Server-side token verification before any operation

**Token Scopes**
- `read_business_transactions` - Read business transaction data
- `write_business_transactions` - Create/update business transactions
- `read_personal_data` - Read personal financial data
- `write_personal_data` - Create/update personal data
- `read_users` - Read user information (admin only)
- `write_users` - Create/update users (admin only)
- `upload_files` - Upload receipt files
- `delete_files` - Delete receipt files

**Firebase Admin SDK**
- Server-side only Firebase operations
- Secure environment variables for admin credentials
- Row-level security through user ID filtering

### 3. API Security

**Rate Limiting**
- Token endpoint: 10 requests per minute per IP
- Data endpoints: 30 requests per minute per IP
- Write operations: 10 requests per minute per IP

**Input Validation**
- Strict validation of all input parameters
- Resource ID validation for scoped operations
- User ID enforcement from authenticated tokens

**CORS Configuration**
- Restricted to specified origins only
- Credentials required for authenticated requests
- Preflight request handling

### 4. Data Security

**Row-Level Security**
- All database queries filter by authenticated user ID
- No cross-user data access possible
- Admin operations require proper role verification

**Data Retention**
- Receipt files stored with user-specific paths
- Automatic cleanup of expired tokens
- Audit logging for sensitive operations

## Environment Variables

### Required Server Variables

```bash
# Firebase Admin SDK (NEVER expose to client)
FIREBASE_ADMIN_TYPE=service_account
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_CLIENT_ID=your-client-id
FIREBASE_ADMIN_CLIENT_X509_CERT_URL=your-cert-url

# Session Token Signing
SESSION_TOKEN_SECRET=your-32-character-secret
SESSION_TOKEN_SECRET_PREVIOUS=your-previous-secret-for-rotation

# Security
ALLOWED_ORIGIN=https://your-domain.com
```

### Client Variables (Public by Design)

```bash
# Firebase Client Config (safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Security Headers

The application implements comprehensive security headers:

- **Content Security Policy**: Restricts resource loading to trusted sources
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features
- **Strict-Transport-Security**: Enforces HTTPS

## Authentication Flow

1. **User Login**: Firebase Auth handles authentication
2. **Token Request**: Client requests scoped token with Firebase ID token
3. **Token Validation**: Server verifies Firebase ID token and mints scoped token
4. **API Calls**: Client uses scoped token for specific operations
5. **Token Expiry**: Tokens automatically expire after 5 minutes

## Secret Rotation

### Session Token Rotation

1. Generate new `SESSION_TOKEN_SECRET`
2. Set `SESSION_TOKEN_SECRET_PREVIOUS` to old secret
3. Deploy with both secrets
4. Monitor for any token verification failures
5. Remove old secret after rotation window

### Firebase Admin Rotation

1. Generate new service account key in Firebase Console
2. Update environment variables
3. Deploy new configuration
4. Remove old service account key

## Monitoring and Logging

### Security Events Logged
- Token minting and verification
- Failed authentication attempts
- Rate limit violations
- Database access patterns

### Incident Response
- Immediate token revocation capability
- User session termination
- Database access audit trails
- Automated alerting for suspicious patterns

## Compliance

### Data Protection
- User data isolated by authentication
- No cross-user data access
- Encrypted data transmission
- Secure session management

### Privacy
- Minimal data collection
- User consent for data processing
- Right to data deletion
- Transparent data handling

## Security Best Practices

### Development
- Pre-commit hooks prevent secret commits
- No secrets in client bundles
- Regular security audits
- Dependency vulnerability scanning

### Deployment
- Environment-specific configurations
- Secure secret management
- HTTPS enforcement
- Regular security updates

### Maintenance
- Regular security reviews
- Penetration testing
- Security patch management
- Incident response drills

## Contact

For security issues or questions:
- **Security Team**: security@stepweaver.com
- **Bug Reports**: security-reports@stepweaver.com
- **Emergency**: +1-XXX-XXX-XXXX

## Changelog

- **2025-01-XX**: Initial security implementation
- **2025-01-XX**: Scoped token system
- **2025-01-XX**: Rate limiting and CORS
- **2025-01-XX**: Security headers and middleware
