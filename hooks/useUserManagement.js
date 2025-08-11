import { useState, useEffect } from 'react';
import {
  createUserAccount,
  getUsers,
  deleteUserAccount,
  updateUserRole,
} from '@/lib/firebase';

export function useUserManagement() {
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
    const confirmed = confirm(
      `Are you sure you want to remove the user account for ${userEmail}?\n\n` +
      `This action cannot be undone and will permanently delete the user's data.`
    );

    if (!confirmed) return;

    try {
      await deleteUserAccount(userId);
      setMessage(`User ${userEmail} removed successfully`);
      setMessageType('success');
      await loadUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      setMessage(`Failed to remove user: ${error.message}`);
      setMessageType('error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setMessage(`User role updated to ${newRole} successfully`);
      setMessageType('success');
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      setMessage(`Failed to update user role: ${error.message}`);
      setMessageType('error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-900/20 text-terminal-green border border-green-500/50';
      case 'Inactive':
        return 'bg-red-900/20 text-terminal-red border border-red-500/50';
      default:
        return 'bg-gray-900/20 text-terminal-muted border border-gray-500/50';
    }
  };

  const getRoleColor = (role) => {
    return role === 'Admin' ? 'text-terminal-blue' : 'text-terminal-text';
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  return {
    // State
    email,
    password,
    displayName,
    showPassword,
    isLoading,
    message,
    messageType,
    users,
    loadingUsers,

    // Actions
    setEmail,
    setPassword,
    setDisplayName,
    setShowPassword,
    handleCreateUser,
    handleRemoveUser,
    handleRoleChange,
    clearMessage,

    // Utility functions
    getStatusColor,
    getRoleColor,
  };
}
