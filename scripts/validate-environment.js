#!/usr/bin/env node

/**
 * Environment validation script for StepWeaver Cash Flow
 * Run this to check if all required environment variables are properly configured
 */

const requiredVars = {
  'SESSION_TOKEN_SECRET': 'Required for JWT token signing',
  'FIREBASE_ADMIN_PROJECT_ID': 'Firebase project ID',
  'FIREBASE_ADMIN_PRIVATE_KEY': 'Firebase service account private key',
  'FIREBASE_ADMIN_CLIENT_EMAIL': 'Firebase service account client email',
  'FIREBASE_ADMIN_CLIENT_ID': 'Firebase service account client ID',
  'FIREBASE_ADMIN_CLIENT_X509_CERT_URL': 'Firebase service account certificate URL'
};

const optionalVars = {
  'FIREBASE_ADMIN_STORAGE_BUCKET': 'Firebase Storage bucket (defaults to project_id.appspot.com)',
  'REDIS_URL': 'Redis URL for rate limiting (falls back to in-memory)',
  'SESSION_TOKEN_SECRET_PREVIOUS': 'Previous JWT secret for key rotation',
  'ALLOWED_ORIGIN': 'CORS allowed origin (defaults to localhost:3000)'
};

console.log('🔍 StepWeaver Cash Flow - Environment Validation');
console.log('='.repeat(50));

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('\n📋 Required Environment Variables:');
for (const [varName, description] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING - ${description}`);
    hasErrors = true;
  } else {
    // Special validation for private key
    if (varName === 'FIREBASE_ADMIN_PRIVATE_KEY') {
      if (!value.includes('BEGIN PRIVATE KEY')) {
        console.log(`❌ ${varName}: INVALID FORMAT - Must be a valid PEM format private key`);
        hasErrors = true;
      } else {
        console.log(`✅ ${varName}: OK`);
      }
    } else {
      console.log(`✅ ${varName}: OK`);
    }
  }
}

// Check optional variables
console.log('\n📋 Optional Environment Variables:');
for (const [varName, description] of Object.entries(optionalVars)) {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: NOT SET - ${description}`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: OK`);
  }
}

// Environment-specific checks
console.log('\n🌍 Environment-specific Checks:');
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`Current environment: ${nodeEnv}`);

if (nodeEnv === 'production') {
  if (!process.env.SESSION_TOKEN_SECRET || process.env.SESSION_TOKEN_SECRET === 'dev-secret-key-for-development-only-change-in-production') {
    console.log('❌ Production environment detected but using development JWT secret!');
    hasErrors = true;
  }

  if (!process.env.REDIS_URL) {
    console.log('⚠️  Production environment without Redis - rate limiting will use in-memory storage');
    hasWarnings = true;
  }
} else {
  console.log('✅ Development environment detected');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VALIDATION FAILED - Fix the errors above before deploying');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VALIDATION PASSED WITH WARNINGS - Consider addressing the warnings above');
  process.exit(0);
} else {
  console.log('✅ VALIDATION PASSED - All required environment variables are configured');
  process.exit(0);
}
