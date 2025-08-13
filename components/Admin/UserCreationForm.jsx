'use client';

import { UserPlus, Loader2, AlertCircle } from 'lucide-react';

export default function UserCreationForm({
  email,
  displayName,
  isLoading,
  message,
  messageType,
  onEmailChange,
  onDisplayNameChange,
  onSubmit,
  onClearMessage,
}) {
  return (
    <div className='bg-terminal-light border border-terminal-border rounded-lg p-6 shadow-lg'>
      <div className='flex items-center space-x-3 mb-4'>
        <div className='p-2 bg-terminal-blue/10 rounded-lg border border-terminal-blue/30'>
          <UserPlus className='h-5 w-5 text-terminal-blue' />
        </div>
        <h3 className='text-lg font-semibold text-terminal-text font-ibm-custom'>
          Add New User
        </h3>
      </div>

      {/* Info Note */}
      <div className='mb-4 p-3 bg-terminal-blue/10 border border-terminal-blue/30 rounded-md'>
        <div className='flex items-start space-x-2'>
          <AlertCircle className='h-4 w-4 text-terminal-blue mt-0.5 flex-shrink-0' />
          <div className='text-sm text-terminal-blue font-ibm'>
            <p className='font-medium mb-1'>Secure User Invitation:</p>
            <p>
              Users will receive an email invitation to set up their own account
              and password. This is the most secure way to add new users - you
              never see their passwords.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='user-email'
              className='block text-sm font-medium text-terminal-text mb-2 font-ibm'
            >
              Email Address
            </label>
            <input
              id='user-email'
              type='email'
              value={email}
              onChange={onEmailChange}
              required
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:border-transparent font-ibm'
              placeholder='Enter email address'
            />
          </div>

          <div>
            <label
              htmlFor='user-display-name'
              className='block text-sm font-medium text-terminal-text mb-2 font-ibm'
            >
              Display Name (Optional)
            </label>
            <input
              id='user-display-name'
              type='text'
              value={displayName}
              onChange={onDisplayNameChange}
              className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:border-transparent font-ibm'
              placeholder='Enter display name'
            />
          </div>
        </div>

        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={isLoading || !email.trim()}
            className='px-6 py-2 bg-terminal-blue text-white rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:ring-offset-2 focus:ring-offset-terminal-dark disabled:opacity-50 disabled:cursor-not-allowed font-ibm transition-colors flex items-center space-x-2'
          >
            {isLoading ? (
              <>
                <Loader2 className='animate-spin' size={18} />
                <span>Sending Invitation...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Send Invitation</span>
              </>
            )}
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md border ${
            messageType === 'success'
              ? 'bg-green-900/20 border-green-500/50'
              : 'bg-red-900/20 border-red-500/50'
          }`}
        >
          <div className='flex items-center'>
            {messageType === 'success' ? (
              <div className='h-4 w-4 text-terminal-green mr-2'>✓</div>
            ) : (
              <div className='h-4 w-4 text-terminal-red mr-2'>⚠</div>
            )}
            <p
              className={`text-sm font-ibm ${
                messageType === 'success'
                  ? 'text-terminal-green'
                  : 'text-terminal-red'
              }`}
            >
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
