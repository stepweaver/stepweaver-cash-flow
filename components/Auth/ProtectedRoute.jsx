'use client';

import { useAuth } from '@/lib/authContext';
import AuthContainer from './AuthContainer';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen bg-terminal-dark flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='animate-spin h-12 w-12 text-terminal-green mx-auto mb-4' />
          <p className='text-terminal-muted font-ibm'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthContainer />;
  }

  return children;
}
