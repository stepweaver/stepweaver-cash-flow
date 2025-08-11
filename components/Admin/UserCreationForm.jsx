'use client';

import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';

export default function UserCreationForm({
  email,
  password,
  displayName,
  showPassword,
  isLoading,
  message,
  messageType,
  onEmailChange,
  onPasswordChange,
  onDisplayNameChange,
  onShowPasswordToggle,
  onSubmit,
  onClearMessage,
}) {
  return (
    <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border p-6'>
      <div className='flex items-center space-x-3 mb-6'>
        <UserPlus className='h-6 w-6 text-terminal-blue lucide' />
        <h2 className='text-xl font-bold text-terminal-text font-ibm-custom'>
          Create New User Account
        </h2>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md border ${
            messageType === 'success'
              ? 'bg-terminal-green/20 text-terminal-green border-terminal-green/50'
              : 'bg-terminal-red/20 text-terminal-red border-terminal-red/50'
          }`}
        >
          <div className='flex justify-between items-center'>
            <span className='font-ibm'>{message}</span>
            <button
              onClick={onClearMessage}
              className='text-current hover:opacity-70 transition-opacity'
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-terminal-text font-ibm mb-2'
          >
            Email Address
          </label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={onEmailChange}
            className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text font-ibm focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:border-transparent'
            placeholder='Enter email address'
            required
          />
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-terminal-text font-ibm mb-2'
          >
            Password
          </label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              id='password'
              value={password}
              onChange={onPasswordChange}
              className='w-full px-3 py-2 pr-10 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text font-ibm focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:border-transparent'
              placeholder='Enter password (min 6 characters)'
              required
            />
            <button
              type='button'
              onClick={onShowPasswordToggle}
              className='absolute inset-y-0 right-0 pr-3 flex items-center text-terminal-muted hover:text-terminal-text transition-colors'
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4 lucide' />
              ) : (
                <Eye className='h-4 w-4 lucide' />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor='displayName'
            className='block text-sm font-medium text-terminal-text font-ibm mb-2'
          >
            Display Name (Optional)
          </label>
          <input
            type='text'
            id='displayName'
            value={displayName}
            onChange={onDisplayNameChange}
            className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text font-ibm focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:border-transparent'
            placeholder='Enter display name'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading || !email.trim() || !password.trim()}
          className='w-full bg-terminal-blue hover:bg-terminal-blue/80 disabled:bg-terminal-muted disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors font-ibm flex items-center justify-center space-x-2'
        >
          {isLoading ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin lucide' />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserPlus className='h-4 w-4 lucide' />
              <span>Create User Account</span>
            </>
          )}
        </button>
      </form>

      <div className='mt-4 p-3 bg-terminal-yellow/20 border border-terminal-yellow/50 rounded-md'>
        <p className='text-xs text-terminal-yellow font-ibm'>
          <strong>Note:</strong> After creating a user account, you will be
          automatically signed out and need to sign in again. This is a security
          feature.
        </p>
      </div>
    </div>
  );
}
