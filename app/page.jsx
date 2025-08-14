'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { useAuth } from '@/lib/authContext';
import { LogOut, TrendingUp, User, Settings, ArrowRight } from 'lucide-react';

export default function Home() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const navigationCards = [
    {
      title: 'λstepweaver',
      description: 'Business transaction tracking and management',
      href: '/stepweaver',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Personal',
      description: 'Personal finance tracking and management',
      href: '/personal',
      icon: User,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Admin',
      description: 'User management and system administration',
      href: '/admin',
      icon: Settings,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-terminal-dark'>
        test
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
          </div>
        </header>

        {/* Main Content */}
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold text-terminal-text font-ibm mb-4'>
              Welcome to Your Financial Dashboard
            </h2>
            <p className='text-terminal-muted text-lg font-ibm max-w-2xl mx-auto'>
              Choose a section to manage your business finances, personal
              expenses, or system administration.
            </p>
          </div>

          {/* Navigation Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
            {navigationCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`group block p-6 rounded-lg border transition-all duration-300 hover:scale-105 ${card.bgColor} ${card.borderColor} hover:shadow-lg`}
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}
                    >
                      <IconComponent className='w-6 h-6 text-white' />
                    </div>
                    <ArrowRight className='w-5 h-5 text-terminal-muted group-hover:text-terminal-text transition-colors' />
                  </div>
                  <h3 className='text-xl font-bold text-terminal-text font-ibm mb-2'>
                    {card.title}
                  </h3>
                  <p className='text-terminal-muted font-ibm'>
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats or Additional Info */}
          <div className='bg-terminal-light rounded-lg p-6 border border-terminal-border'>
            <h3 className='text-lg font-semibold text-terminal-text font-ibm mb-4'>
              Quick Access
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-terminal-green font-ibm'>
                  3
                </div>
                <div className='text-sm text-terminal-muted font-ibm'>
                  Active Modules
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-terminal-green font-ibm'>
                  24/7
                </div>
                <div className='text-sm text-terminal-muted font-ibm'>
                  Access
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-terminal-green font-ibm'>
                  Secure
                </div>
                <div className='text-sm text-terminal-muted font-ibm'>
                  Authentication
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
