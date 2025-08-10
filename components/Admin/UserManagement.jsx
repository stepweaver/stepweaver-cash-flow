'use client';

import { useState, useEffect } from 'react';
import { Mail, Trash2, UserPlus, Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function UserManagement() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Mock data for demonstration - replace with actual Firebase calls
  useEffect(() => {
    // Simulate loading users
    setTimeout(() => {
      setUsers([
        { id: '1', email: 'admin@stepweaver.com', role: 'Admin', status: 'Active', invitedAt: '2024-01-01' },
        { id: '2', email: 'user1@example.com', role: 'User', status: 'Pending', invitedAt: '2024-01-15' },
        { id: '3', email: 'user2@example.com', role: 'User', status: 'Active', invitedAt: '2024-01-10' }
      ]);
      setLoadingUsers(false);
    }, 1000);
  }, []);

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // TODO: Implement Firebase email invitation logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to users list as pending
      const newUser = {
        id: Date.now().toString(),
        email: email,
        role: 'User',
        status: 'Pending',
        invitedAt: new Date().toISOString().split('T')[0]
      };
      
      setUsers(prev => [...prev, newUser]);
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

  const handleRemoveUser = async (userId) => {
    if (confirm('Are you sure you want to remove this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setMessage('User removed successfully');
      setMessageType('success');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-terminal-green';
      case 'Pending': return 'text-terminal-yellow';
      case 'Inactive': return 'text-terminal-red';
      default: return 'text-terminal-muted';
    }
  };

  const getRoleColor = (role) => {
    return role === 'Admin' ? 'text-terminal-blue' : 'text-terminal-text';
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-terminal-blue/10 rounded-lg border border-terminal-blue/30'>
          <Users className='h-6 w-6 text-terminal-blue' />
        </div>
        <div>
          <h2 className='text-2xl font-bold text-terminal-text font-ibm-custom'>
            User Management
          </h2>
          <p className='text-terminal-muted font-ocr-custom'>
            Manage users and send invitations
          </p>
        </div>
      </div>

      {/* Send Invitation Form */}
      <div className='bg-terminal-light border border-terminal-border rounded-lg p-6 shadow-lg'>
        <div className='flex items-center space-x-3 mb-4'>
          <div className='p-2 bg-terminal-blue/10 rounded-lg border border-terminal-blue/30'>
            <Mail className='h-5 w-5 text-terminal-blue' />
          </div>
          <h3 className='text-lg font-semibold text-terminal-text font-ibm-custom'>
            Send Invitation
          </h3>
        </div>

        <form onSubmit={handleSendInvitation} className='space-y-4'>
          <div className='flex space-x-4'>
            <div className='flex-1'>
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
            <div className='flex items-end'>
              <button
                type='submit'
                disabled={isLoading || !email.trim()}
                className='px-6 py-2 bg-terminal-blue text-white rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:ring-offset-2 focus:ring-offset-terminal-dark disabled:opacity-50 disabled:cursor-not-allowed font-ocr-custom transition-colors flex items-center space-x-2'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='animate-spin' size={18} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Send Invitation</span>
                  </>
                )}
              </button>
            </div>
          </div>
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

      {/* Users List */}
      <div className='bg-terminal-light border border-terminal-border rounded-lg shadow-lg'>
        <div className='px-6 py-4 border-b border-terminal-border'>
          <h3 className='text-lg font-semibold text-terminal-text font-ibm-custom'>
            Current Users
          </h3>
        </div>
        
        {loadingUsers ? (
          <div className='p-6 text-center'>
            <Loader2 className='animate-spin h-8 w-8 text-terminal-muted mx-auto mb-4' />
            <p className='text-terminal-muted font-ocr-custom'>Loading users...</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-terminal-dark/50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr-custom'>
                    User
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr-custom'>
                    Role
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr-custom'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr-custom'>
                    Invited
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ocr-custom'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-terminal-border'>
                {users.map((user) => (
                  <tr key={user.id} className='hover:bg-terminal-dark/30'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-terminal-text font-ocr-custom'>
                        {user.email}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-ocr-custom ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-ocr-custom ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-muted font-ocr-custom'>
                      {user.invitedAt}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {user.role !== 'Admin' && (
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className='text-terminal-red hover:text-red-400 transition-colors p-1'
                          title='Remove user'
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
