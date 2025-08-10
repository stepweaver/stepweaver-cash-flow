'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailInvite() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // TODO: Implement Firebase email invitation logic
      // For now, we'll simulate the invitation process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage(`Invitation sent to ${email}`);
      setMessageType('success');
      setEmail('');
    } catch (error) {
      setMessage('Failed to send invitation. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-terminal-light border border-terminal-border rounded-lg p-6 shadow-lg'>
      <div className='text-center mb-6'>
        <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-terminal-blue/10 border border-terminal-blue/30 mb-4'>
          <Mail className='h-6 w-6 text-terminal-blue' />
        </div>
        <h3 className='text-lg font-semibold text-terminal-text font-ibm-custom'>
          Invite New User
        </h3>
        <p className='text-terminal-muted text-sm font-ocr-custom mt-2'>
          Send an email invitation to add a new user to the system
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='invite-email'
            className='block text-sm font-medium text-terminal-text mb-2 font-ocr-custom'
          >
            Email Address
          </label>
          <input
            id='invite-email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:border-transparent font-ocr-custom'
            placeholder='Enter email address to invite'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading || !email.trim()}
          className='w-full bg-terminal-blue text-white py-2 px-4 rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:ring-offset-2 focus:ring-offset-terminal-dark disabled:opacity-50 disabled:cursor-not-allowed font-ocr-custom transition-colors'
        >
          {isLoading ? (
            <div className='flex items-center justify-center'>
              <Loader2 className='animate-spin -ml-1 mr-2' size={18} />
              Sending Invitation...
            </div>
          ) : (
            'Send Invitation'
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md border ${
          messageType === 'success' 
            ? 'bg-green-900/20 border-green-500/50' 
            : 'bg-red-900/20 border-red-500/50'
        }`}>
          <div className='flex items-center'>
            {messageType === 'success' ? (
              <CheckCircle className='h-4 w-4 text-terminal-green mr-2' />
            ) : (
              <AlertCircle className='h-4 w-4 text-terminal-red mr-2' />
            )}
            <p className={`text-sm font-ocr-custom ${
              messageType === 'success' ? 'text-terminal-green' : 'text-terminal-red'
            }`}>
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
