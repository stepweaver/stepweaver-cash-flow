'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation({ currentPage }) {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getNavLinkClass = (page) => {
    return `text-sm font-medium font-ibm cursor-pointer uppercase tracking-wider ${
      currentPage === page
        ? 'text-terminal-green'
        : 'text-terminal-muted hover:text-terminal-text'
    }`;
  };

  const getMobileNavLinkClass = (page) => {
    return `block px-4 py-3 text-base font-medium font-ibm uppercase tracking-wider rounded transition-colors ${
      currentPage === page
        ? 'text-terminal-green bg-terminal-light'
        : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-light'
    }`;
  };

  return (
    <header className='bg-terminal-light shadow-sm border-b border-terminal-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center py-6'>
          {/* Mobile menu button */}
          <div className='md:hidden flex-shrink-0 relative z-10'>
            <button
              onClick={toggleMobileMenu}
              className='text-terminal-muted hover:text-terminal-text p-2'
              aria-label='Toggle mobile menu'
            >
              {isMobileMenuOpen ? (
                <X size={24} className='text-terminal-text' />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>

          {/* Logo - centered on mobile, left-aligned on desktop */}
          <div className='flex-1 flex justify-center md:justify-start'>
            <h1 className='text-xl sm:text-4xl font-bold text-terminal-green font-ibm-custom text-center md:text-left'>
              λstepweaver Cash Flow
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <nav className='hidden md:flex space-x-8 mr-8'>
            <Link href='/stepweaver' className={getNavLinkClass('stepweaver')}>
              λstepweaver
            </Link>
            <Link href='/personal' className={getNavLinkClass('personal')}>
              Personal
            </Link>
            <Link href='/admin' className={getNavLinkClass('admin')}>
              Admin
            </Link>
          </nav>

          {/* Desktop Logout */}
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden'>
            <div className='px-4 py-6 space-y-3 bg-terminal-dark border-t border-terminal-border'>
              <div className='space-y-2'>
                <Link
                  href='/stepweaver'
                  className={getMobileNavLinkClass('stepweaver')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  λstepweaver
                </Link>
                <Link
                  href='/personal'
                  className={getMobileNavLinkClass('personal')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Personal
                </Link>
                <Link
                  href='/admin'
                  className={getMobileNavLinkClass('admin')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              </div>

              <div className='border-t border-terminal-border pt-4'>
                <button
                  onClick={handleLogout}
                  className='w-full text-left px-3 py-3 text-base font-medium font-ibm uppercase tracking-wider text-terminal-muted hover:text-terminal-text hover:bg-terminal-light transition-colors rounded'
                >
                  <div className='flex items-center space-x-3'>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
