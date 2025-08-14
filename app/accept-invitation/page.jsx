'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationExpired, setInvitationExpired] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateInvitation(tokenParam);
    }
  }, [searchParams]);

  const validateInvitation = async (invitationToken) => {
    try {
      const response = await fetch(
        `/api/invitations/validate?token=${invitationToken}`
      );
      const data = await response.json();

      if (response.ok) {
        setEmail(data.invitation.email);
        setInvitationValid(true);

        if (new Date() > new Date(data.invitation.expiresAt)) {
          setInvitationExpired(true);
          setMessage(
            'This invitation has expired. Please contact your administrator for a new invitation.'
          );
          setMessageType('error');
        }
      } else {
        setMessage(data.error || 'Invalid invitation token');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to validate invitation. Please try again.');
      setMessageType('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // First, create the user account
      const createResponse = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.error || 'Failed to create account');
      }

      // Then sign in the user
      const signInResult = await signIn(email, password);

      if (signInResult.success) {
        setMessage('Account created successfully! Redirecting to dashboard...');
        setMessageType('success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setMessage(
          'Account created but sign-in failed. Please try signing in manually.'
        );
        setMessageType('warning');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setMessage(error.message || 'Failed to accept invitation');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className='min-h-screen bg-terminal-dark flex items-center justify-center p-4'>
        <div className='bg-terminal-light border border-terminal-border rounded-lg p-8 shadow-lg max-w-md w-full'>
          <div className='text-center'>
            <XCircle className='h-16 w-16 text-terminal-red mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-terminal-text font-ibm-custom mb-2'>
              Invalid Invitation
            </h1>
            <p className='text-terminal-muted font-ibm'>
              This invitation link is invalid or missing the required token.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (invitationExpired) {
    return (
      <div className='min-h-screen bg-terminal-dark flex items-center justify-center p-4'>
        <div className='bg-terminal-light border border-terminal-border rounded-lg p-8 shadow-lg max-w-md w-full'>
          <div className='text-center'>
            <XCircle className='h-16 w-16 text-terminal-red mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-terminal-text font-ibm-custom mb-2'>
              Invitation Expired
            </h1>
            <p className='text-terminal-muted font-ibm mb-4'>
              This invitation has expired. Please contact your administrator for
              a new invitation.
            </p>
            <button
              onClick={() => router.push('/')}
              className='px-4 py-2 bg-terminal-blue text-white rounded-md hover:bg-terminal-blue/80 transition-colors font-ibm'
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-terminal-dark flex items-center justify-center p-4'>
      <div className='bg-terminal-light border border-terminal-border rounded-lg p-8 shadow-lg max-w-md w-full'>
        <div className='text-center mb-6'>
          <CheckCircle className='h-16 w-16 text-terminal-green mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-terminal-text font-ibm-custom mb-2'>
            Accept Invitation
          </h1>
          <p className='text-terminal-muted font-ibm'>
            Complete your account setup to join StepWeaver Cash Flow
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-md border ${
              messageType === 'success'
                ? 'bg-green-900/20 border-green-500/50 text-terminal-green'
                : messageType === 'error'
                ? 'bg-red-900/20 border-red-500/50 text-terminal-red'
                : 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400'
            }`}
          >
            <div className='flex items-center space-x-2'>
              {messageType === 'success' && <CheckCircle className='h-4 w-4' />}
              {messageType === 'error' && <XCircle className='h-4 w-4' />}
              {messageType === 'warning' && <AlertCircle className='h-4 w-4' />}
              <span className='text-sm font-ibm'>{message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Email Address
            </label>
            <input
              type='email'
              value={email}
              disabled
              className='w-full px-3 py-2 bg-terminal-dark/50 border border-terminal-border rounded-md text-terminal-muted font-ibm cursor-not-allowed'
            />
            <p className='text-xs text-terminal-muted mt-1 font-ibm'>
              This email was used for your invitation
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Password
            </label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm pr-10'
                placeholder='Enter your password'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 text-terminal-muted hover:text-terminal-text'
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
            <p className='text-xs text-terminal-muted mt-1 font-ibm'>
              Minimum 6 characters
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium text-terminal-text mb-2 font-ibm'>
              Confirm Password
            </label>
            <div className='relative'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent font-ibm pr-10'
                placeholder='Confirm your password'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 text-terminal-muted hover:text-terminal-text'
              >
                {showConfirmPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading || !invitationValid}
            className='w-full py-2 px-4 bg-terminal-green text-terminal-dark font-semibold rounded-md hover:bg-terminal-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ibm flex items-center justify-center space-x-2'
          >
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account & Sign In</span>
            )}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-xs text-terminal-muted font-ibm'>
            By accepting this invitation, you agree to our terms of service and
            privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className='min-h-screen bg-terminal-dark flex items-center justify-center p-4'>
      <div className='bg-terminal-light border border-terminal-border rounded-lg p-8 shadow-lg max-w-md w-full'>
        <div className='text-center'>
          <Loader2 className='h-16 w-16 text-terminal-green mx-auto mb-4 animate-spin' />
          <h1 className='text-2xl font-bold text-terminal-text font-ibm-custom mb-2'>
            Loading Invitation
          </h1>
          <p className='text-terminal-muted font-ibm'>
            Please wait while we validate your invitation...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
