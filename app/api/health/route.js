import { NextResponse } from 'next/server';
import { getFirebaseAdminStatus, isFirebaseAdminInitialized } from '@/lib/firebase-admin.js';
import { getStandardRateLimiter } from '@/lib/rate-limit-helper.js';

export async function GET() {
  try {
    const firebaseStatus = getFirebaseAdminStatus();
    const isFirebaseReady = isFirebaseAdminInitialized();

    // Test rate limiter
    let rateLimiterStatus = 'unknown';
    try {
      const rateLimiter = await getStandardRateLimiter();
      const testResult = await rateLimiter.check(1, 'health-check');
      rateLimiterStatus = testResult.success ? 'healthy' : 'rate-limited';
    } catch (rateLimiterError) {
      rateLimiterStatus = `error: ${rateLimiterError.message}`;
    }

    const healthStatus = {
      status: isFirebaseReady ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        firebase: {
          status: isFirebaseReady ? 'healthy' : 'unhealthy',
          details: firebaseStatus,
          error: firebaseStatus.error?.message || null
        },
        rateLimiter: {
          status: rateLimiterStatus.includes('error') ? 'unhealthy' : 'healthy',
          details: rateLimiterStatus
        }
      },
      environment_check: {
        hasSessionTokenSecret: !!process.env.SESSION_TOKEN_SECRET,
        hasFirebaseProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        hasFirebasePrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        hasFirebaseClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        hasRedisUrl: !!process.env.REDIS_URL
      }
    };

    const httpStatus = isFirebaseReady ? 200 : 503;

    return NextResponse.json(healthStatus, { status: httpStatus });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
