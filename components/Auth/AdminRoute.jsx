'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

export default function AdminRoute({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        // Get user's ID token
        const idToken = await user.getIdToken();

        // Verify admin status through API
        const response = await fetch('/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseIdToken: idToken,
            scope: 'admin_access',
            resourceId: false,
            additionalClaims: [],
          }),
        });

        if (!response.ok) {
          throw new Error('Not authorized');
        }

        const { token: adminToken } = await response.json();

        // Verify the admin token has admin privileges
        const verifyResponse = await fetch('/api/users/verify-admin', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        if (!verifyResponse.ok) {
          throw new Error('Admin privileges not confirmed');
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin access denied:', error);
        setIsAdmin(false);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-terminal-blue mx-auto'></div>
          <p className='mt-4 text-terminal-muted'>
            Verifying admin privileges...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to home
  }

  return <>{children}</>;
}

