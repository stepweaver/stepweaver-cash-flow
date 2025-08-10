'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-terminal-light border border-terminal-border rounded-lg p-6 shadow-lg'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='bg-red-900/20 border border-red-500/50 rounded-md p-3'>
              <p className='text-terminal-red text-sm font-ibm'>
                {error}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-terminal-text mb-2 font-ibm'
            >
              Email Address
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm'
              placeholder='Enter your email'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-terminal-text mb-2 font-ibm'
            >
              Password
            </label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full px-3 py-2 pr-10 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm'
                placeholder='Enter your password'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-terminal-muted hover:text-terminal-text'
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-terminal-green text-black py-2 px-4 rounded-md font-medium hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 focus:ring-offset-terminal-dark disabled:opacity-50 disabled:cursor-not-allowed font-ibm transition-colors'
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <Loader2 className='animate-spin -ml-1 mr-2' size={18} />{' '}
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
