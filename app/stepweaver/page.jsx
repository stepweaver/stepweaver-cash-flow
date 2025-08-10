'use client';

import BusinessTracker from '@/components/BusinessTracker.jsx';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { LogOut } from 'lucide-react';

export default function StepweaverPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-terminal-dark'>
        {/* Navigation Header */}
        <header className='bg-terminal-light shadow-sm border-b border-terminal-border'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-between py-6'>
              {/* Logo */}
              <div className='text-center sm:text-left'>
                <h1 className='text-2xl sm:text-4xl font-bold text-terminal-green font-ibm-custom'>
                  λstepweaver Cash Flow
                </h1>
              </div>

              {/* Navigation Links */}
              <nav className='hidden md:flex space-x-8'>
                <Link
                  href='/stepweaver'
                  className='text-sm font-medium text-terminal-green font-ibm cursor-pointer uppercase tracking-wider'
                >
                  λstepweaver
                </Link>
                <Link
                  href='/personal'
                  className='text-sm font-medium text-terminal-muted hover:text-terminal-text font-ibm cursor-pointer uppercase tracking-wider'
                >
                  Personal
                </Link>
                <Link
                  href='/admin'
                  className='text-sm font-medium text-terminal-muted hover:text-terminal-text font-ibm cursor-pointer uppercase tracking-wider'
                >
                  Admin
                </Link>
              </nav>

              {/* Logout */}
              <div className='hidden md:flex items-center'>
                <button
                  onClick={handleLogout}
                  className='flex items-center space-x-2 text-terminal-muted hover:text-terminal-text transition-colors font-ibm uppercase tracking-wider text-sm'
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
          <BusinessTracker />
        </div>
      </div>
    </ProtectedRoute>
  );
}
