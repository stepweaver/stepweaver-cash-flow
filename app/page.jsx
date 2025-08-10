'use client';

import { useState } from 'react';
import BusinessTracker from '@/components/BusinessTracker.jsx';
import PersonalTracker from '@/components/PersonalTracker.jsx';
import UserManagement from '@/components/Admin/UserManagement.jsx';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { useAuth } from '@/lib/authContext';
import { LogOut, Menu, X } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('business');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    closeMobileMenu();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'business':
        return <BusinessTracker />;
      case 'personal':
        return <PersonalTracker />;
      case 'admin':
        return <UserManagement />;
      default:
        return <BusinessTracker />;
    }
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-terminal-dark'>
        {/* Header */}
        <header className='bg-terminal-light shadow-sm border-b border-terminal-border'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-between py-6'>
              {/* Logo */}
              <div className='text-center sm:text-left'>
                <h1 className='text-2xl sm:text-4xl font-bold text-terminal-green font-ibm-custom'>
                  λstepweaver Cash Flow
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className='hidden md:flex space-x-8'>
                <button
                  onClick={() => setActiveTab('business')}
                  className={`text-sm font-medium transition-colors font-ocr-custom cursor-pointer uppercase tracking-wider ${
                    activeTab === 'business'
                      ? 'text-terminal-green'
                      : 'text-terminal-muted hover:text-terminal-text'
                  }`}
                >
                  λstepweaver
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`text-sm font-medium transition-colors font-ocr-custom cursor-pointer uppercase tracking-wider ${
                    activeTab === 'personal'
                      ? 'text-terminal-green'
                      : 'text-terminal-muted hover:text-terminal-text'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`text-sm font-medium transition-colors font-ocr-custom cursor-pointer uppercase tracking-wider ${
                    activeTab === 'admin'
                      ? 'text-terminal-green'
                      : 'text-terminal-muted hover:text-terminal-text'
                  }`}
                >
                  Admin
                </button>
              </nav>

              {/* Desktop Logout */}
              <div className='hidden md:flex items-center'>
                <button
                  onClick={handleLogout}
                  className='flex items-center space-x-2 text-terminal-muted hover:text-terminal-text transition-colors font-ocr-custom uppercase tracking-wider text-sm'
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className='md:hidden flex items-center space-x-4'>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className='text-terminal-muted hover:text-terminal-text transition-colors'
                >
                  {isMobileMenuOpen ? (
                    <X size={24} className='text-terminal-text' />
                  ) : (
                    <Menu size={24} />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className='md:hidden border-t border-terminal-border py-4'>
                <nav className='flex flex-col space-y-4'>
                  <button
                    onClick={() => handleTabChange('business')}
                    className={`text-left text-sm font-medium transition-colors font-ocr-custom cursor-pointer uppercase tracking-wider py-2 px-4 rounded ${
                      activeTab === 'business'
                        ? 'text-terminal-green bg-terminal-green/10'
                        : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-dark'
                    }`}
                  >
                    λstepweaver
                  </button>
                  <button
                    onClick={() => handleTabChange('personal')}
                    className={`text-left text-sm font-medium transition-colors font-ocr-custom cursor-pointer uppercase tracking-wider py-2 px-4 rounded ${
                      activeTab === 'personal'
                        ? 'text-terminal-green bg-terminal-green/10'
                        : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-dark'
                    }`}
                  >
                    Personal
                  </button>
                  <button
                    onClick={() => handleTabChange('admin')}
                    className={`text-left text-sm font-medium transition-colors font-ocr-custom cursor-pointer uppercase tracking-wider py-2 px-4 rounded ${
                      activeTab === 'admin'
                        ? 'text-terminal-green bg-terminal-green/10'
                        : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-dark'
                    }`}
                  >
                    Admin
                  </button>
                  <div className='border-t border-terminal-border pt-4 mt-2'>
                    <button
                      onClick={handleLogout}
                      className='flex items-center space-x-2 text-terminal-muted hover:text-terminal-text transition-colors font-ocr-custom uppercase tracking-wider text-sm py-2 px-4 rounded hover:bg-terminal-dark w-full text-left'
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
          <div className='space-y-8'>{renderContent()}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
