'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/stepweaver');
  }, [router]);

  return (
    <div className='min-h-screen bg-terminal-dark flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-terminal-green font-ibm-custom mb-4'>
          λstepweaver Cash Flow
        </h1>
        <p className='text-terminal-muted font-ibm'>
          Redirecting to business tracker...
        </p>
      </div>
    </div>
  );
}
