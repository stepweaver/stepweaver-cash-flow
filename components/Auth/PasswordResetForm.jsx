'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function PasswordResetForm({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const result = await resetPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className='w-full max-w-md mx-auto'>
        <div className='bg-terminal-light border border-terminal-border rounded-lg p-6 shadow-lg'>
          <div className='text-center mb-6'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900/20 mb-4'>
              <div className='h-6 w-6 text-terminal-green'>✓</div>
            </div>
            <h2 className='text-2xl font-bold text-terminal-green font-ibm-custom'>
              Check Your Email
            </h2>
            <p className='text-terminal-muted mt-2 font-ocr-custom'>
              We've sent a password reset link to {email}
            </p>
          </div>

          <div className='text-center'>
            <button
              onClick={onBackToLogin}
              className='text-terminal-blue hover:text-terminal-cyan text-sm font-ocr-custom transition-colors'
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-terminal-light border border-terminal-border rounded-lg p-6 shadow-lg'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-terminal-green font-ibm-custom'>
            Reset Password
          </h2>
          <p className='text-terminal-muted mt-2 font-ocr-custom'>
            Enter your email to receive a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='bg-red-900/20 border border-red-500/50 rounded-md p-3'>
              <p className='text-terminal-red text-sm font-ocr-custom'>
                {error}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-terminal-text mb-2 font-ocr-custom'
            >
              Email Address
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ocr-custom'
              placeholder='Enter your email'
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-terminal-green text-black py-2 px-4 rounded-md font-medium hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 focus:ring-offset-terminal-dark disabled:opacity-50 disabled:cursor-not-allowed font-ocr-custom transition-colors'
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <Loader2 className='animate-spin -ml-1 mr-2' size={18} />
                Sending Reset Link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <button
            onClick={onBackToLogin}
            className='text-terminal-blue hover:text-terminal-cyan text-sm font-ocr-custom transition-colors flex items-center justify-center mx-auto'
          >
            <ArrowLeft size={16} className='mr-1' />
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
