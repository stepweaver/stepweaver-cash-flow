'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import PasswordResetForm from './PasswordResetForm';
import EmailInvite from './EmailInvite';

export default function AuthContainer() {
  const [authMode, setAuthMode] = useState('login');

  const renderAuthForm = () => {
    switch (authMode) {
      case 'reset':
        return <PasswordResetForm onBackToLogin={() => setAuthMode('login')} />;
      case 'invite':
        return <EmailInvite onBackToLogin={() => setAuthMode('login')} />;
      default:
        return (
          <LoginForm
            onSwitchToReset={() => setAuthMode('reset')}
            onSwitchToInvite={() => setAuthMode('invite')}
          />
        );
    }
  };

  return (
    <div className='min-h-screen bg-terminal-dark flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {/* Logo/Brand */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-terminal-green/10 border border-terminal-green/30 mb-4'>
            <span className='text-4xl text-terminal-green font-ibm-custom'>
              λ
            </span>
          </div>
          <h1 className='text-4xl font-bold text-terminal-green font-ibm-custom mb-2'>
            stepweaver
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
