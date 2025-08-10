'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Trash2,
  UserPlus,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  createUserAccount,
  getUsers,
  deleteUserAccount,
  updateUserRole,
} from '../../lib/firebase';

export default function UserManagement() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersList = await getUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Failed to load users');
      setMessageType('error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    // Additional validation
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      return;
    }

    if (!email.includes('@')) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    // Confirm with user about the session limitation
    const confirmed = confirm(
      `Are you sure you want to create a user account for ${email}?\n\n` +
        `⚠️  IMPORTANT: After creating this account, you will be automatically signed out and need to sign in again.\n\n` +
        `This is a security feature to ensure only the intended user can access the new account.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      await createUserAccount(email, password, displayName);

      setMessage(
        `User account created successfully for ${email}. You will now be signed out and need to sign in again.`
      );
      setMessageType('success');

      // Reset form
      setEmail('');
      setPassword('');
      setDisplayName('');

      // Reload users list
      await loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage(`Failed to create user: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (userId, userEmail) => {
    if (
      confirm(
        `Are you sure you want to remove ${userEmail}? This will remove them from the system but they may still be able to sign in until manually removed from Firebase Console.`
      )
    ) {
      try {
        await deleteUserAccount(userId, userEmail);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        setMessage('User removed successfully');
        setMessageType('success');
      } catch (error) {
        setMessage('Failed to remove user');
        setMessageType('error');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      setMessage('User role updated successfully');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to update user role');
      setMessageType('error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-terminal-green';
      case 'Pending':
        return 'text-terminal-yellow';
      case 'Inactive':
        return 'text-terminal-red';
      default:
        return 'text-terminal-muted';
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
            Add and manage users directly
          </p>
        </div>
      </div>

      {/* Create User Form */}
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
            <div className='text-sm text-terminal-blue font-ocr-custom'>
              <p className='font-medium mb-1'>Important:</p>
              <p>
                After creating a user account, you will be signed out and need
                to sign in again. This is a security feature to ensure only the
                intended user can access the new account.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateUser} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label
                htmlFor='user-email'
                className='block text-sm font-medium text-terminal-text mb-2 font-ocr-custom'
              >
                Email Address
              </label>
              <input
                id='user-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:border-transparent font-ocr-custom'
                placeholder='Enter email address'
              />
            </div>

            <div>
              <label
                htmlFor='user-password'
                className='block text-sm font-medium text-terminal-text mb-2 font-ocr-custom'
              >
                Password
              </label>
              <div className='relative'>
                <input
                  id='user-password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className='w-full px-3 py-2 pr-10 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:border-transparent font-ocr-custom'
                  placeholder='Enter password (min 6 chars)'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-terminal-muted hover:text-terminal-text'
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor='user-display-name'
                className='block text-sm font-medium text-terminal-text mb-2 font-ocr-custom'
              >
                Display Name (Optional)
              </label>
              <input
                id='user-display-name'
                type='text'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className='w-full px-3 py-2 bg-terminal-dark border border-terminal-border rounded-md text-terminal-text placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:border-transparent font-ocr-custom'
                placeholder='Enter display name'
              />
            </div>
          </div>

          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={isLoading || !email.trim() || !password.trim()}
              className='px-6 py-2 bg-terminal-blue text-white rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:ring-offset-2 focus:ring-offset-terminal-dark disabled:opacity-50 disabled:cursor-not-allowed font-ocr-custom transition-colors flex items-center space-x-2'
            >
              {isLoading ? (
                <>
                  <Loader2 className='animate-spin' size={18} />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create User</span>
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
                <CheckCircle className='h-4 w-4 text-terminal-green mr-2' />
              ) : (
                <AlertCircle className='h-4 w-4 text-terminal-red mr-2' />
              )}
              <p
                className={`text-sm font-ocr-custom ${
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
            <p className='text-terminal-muted font-ocr-custom'>
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className='p-6 text-center'>
            <Users className='h-12 w-12 text-terminal-muted mx-auto mb-4' />
            <p className='text-terminal-muted font-ibm-custom mb-2'>
              No users found
            </p>
            <p className='text-sm text-terminal-muted font-ocr-custom'>
              Create your first user account using the form above
            </p>
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
                    Created
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
                      <div className='text-sm font-medium text-terminal-text font-ibm-custom'>
                        {user.displayName || user.email}
                      </div>
                      <div className='text-xs text-terminal-muted font-ocr-custom'>
                        {user.email}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`px-2 py-1 text-xs font-semibold rounded-full font-ocr-custom border-0 bg-transparent ${getRoleColor(
                          user.role
                        )} focus:outline-none focus:ring-1 focus:ring-terminal-blue`}
                        disabled={user.role === 'Admin'}
                      >
                        <option value='User'>User</option>
                        <option value='Admin'>Admin</option>
                      </select>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-ocr-custom ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-muted font-ocr-custom'>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {user.role !== 'Admin' && (
                        <button
                          onClick={() => handleRemoveUser(user.id, user.email)}
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
