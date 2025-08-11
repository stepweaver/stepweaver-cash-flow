'use client';

import Navigation from './Navigation';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function PageLayout({ children, currentPage }) {
  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-terminal-dark'>
        <Navigation currentPage={currentPage} />

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
