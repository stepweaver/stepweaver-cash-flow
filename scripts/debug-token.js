#!/usr/bin/env node

/**
 * Debug script to test token flow
 * Run with: node scripts/debug-token.js
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

async function testTokenFlow() {
  console.log('🔍 Testing token flow...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthCheck = await fetch(`${API_BASE}/api/token`, {
      method: 'OPTIONS'
    });
    console.log(`   Server status: ${healthCheck.status}\n`);

    // Test 2: Test token endpoint with invalid data
    console.log('2. Testing token endpoint with invalid data...');
    try {
      const invalidResponse = await fetch(`${API_BASE}/api/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const invalidData = await invalidResponse.json();
      console.log(`   Invalid request response: ${invalidResponse.status} - ${invalidData.error}\n`);
    } catch (error) {
      console.log(`   Invalid request error: ${error.message}\n`);
    }

    // Test 3: Test business transactions endpoint without auth
    console.log('3. Testing business transactions without auth...');
    try {
      const noAuthResponse = await fetch(`${API_BASE}/api/business-transactions`);
      const noAuthData = await noAuthResponse.json();
      console.log(`   No auth response: ${noAuthResponse.status} - ${noAuthData.error}\n`);
    } catch (error) {
      console.log(`   No auth error: ${error.message}\n`);
    }

    // Test 4: Test business transactions with invalid token
    console.log('4. Testing business transactions with invalid token...');
    try {
      const invalidTokenResponse = await fetch(`${API_BASE}/api/business-transactions`, {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });
      const invalidTokenData = await invalidTokenResponse.json();
      console.log(`   Invalid token response: ${invalidTokenResponse.status} - ${invalidTokenData.error}\n`);
    } catch (error) {
      console.log(`   Invalid token error: ${error.message}\n`);
    }

    console.log('✅ Token flow tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your .env.local file has all required variables');
    console.log('2. Ensure Firebase Admin SDK is properly configured');
    console.log('3. Verify SESSION_TOKEN_SECRET is set');
    console.log('4. Check server console for detailed error logs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if required environment variables are set
function checkEnvironment() {
  console.log('🔧 Environment check...\n');

  const requiredVars = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'SESSION_TOKEN_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.log('❌ Missing environment variables:');
    missing.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n💡 Create a .env.local file with these variables');
    console.log('   See env-template.txt for reference\n');
    return false;
  } else {
    console.log('✅ All required environment variables are set\n');
    return true;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  if (checkEnvironment()) {
    testTokenFlow();
  }
}
