'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import EmailInvite from './EmailInvite';

export default function AuthContainer() {
  const [authMode, setAuthMode] = useState('login');

  const renderAuthForm = () => {
    switch (authMode) {
      case 'invite':
        return <EmailInvite onBackToLogin={() => setAuthMode('login')} />;
      default:
        return <LoginForm onSwitchToInvite={() => setAuthMode('invite')} />;
    }
  };

  return (
    <div className='min-h-screen bg-terminal-dark flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {/* Logo/Brand */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-terminal-green font-ibm-custom mb-2'>
            <span className='text-5xl'>λ</span>stepweaver
          </h1>
          <p className='text-terminal-muted font-ocr-custom'>
            Cash Flow Management System
          </p>
        </div>

        {/* Auth Form */}
        {renderAuthForm()}

        {/* Footer */}
        <div className='text-center mt-8'>
          <p className='text-terminal-dimmed text-xs font-ocr-custom'>
            Secure authentication powered by Firebase
          </p>
        </div>
      </div>
    </div>
  );
}
