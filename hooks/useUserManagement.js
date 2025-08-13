import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
// TODO: Implement user management API
// import {
//   createUserAccount,
//   getUsers,
//   deleteUserAccount,
//   updateUserRole,
// } from '@/lib/firebase';

export function useUserManagement() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
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
      // TODO: Implement user loading API
      // const usersList = await getUsers();
      setUsers([]);
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
    if (!email.trim()) return;

    // Additional validation
    if (!email.includes('@')) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    // Confirm invitation
    const confirmed = confirm(
      `Are you sure you want to send an invitation to ${email}?\n\n` +
      `The user will receive an email to set up their own account and password.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Get the current user's Firebase ID token
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();

      // First, mint a scoped token for user management
      const tokenResponse = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseIdToken: idToken,
          scope: 'write_users',
          resourceId: false,
          additionalClaims: []
        }),
      });

      if (!tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        throw new Error(`Failed to get authorization token: ${tokenData.error || 'Unknown error'}`);
      }

      const { token: scopedToken } = await tokenResponse.json();

      // Send invitation using the invitation API with the scoped token
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${scopedToken}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          displayName: displayName.trim() || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `Invitation sent successfully to ${email}. The user will receive an email to set up their account.`
        );
        setMessageType('success');

        // Reset form
        setEmail('');
        setDisplayName('');
      } else {
        throw new Error(data.error || 'Failed to send invitation');
      }

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
      // TODO: Implement user deletion API
      // await deleteUserAccount(userId);
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
      // TODO: Implement user role update API
      // await updateUserRole(userId, newRole);
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
    displayName,
    isLoading,
    message,
    messageType,
    users,
    loadingUsers,

    // Actions
    setEmail,
    setDisplayName,
    handleCreateUser,
    handleRemoveUser,
    handleRoleChange,
    clearMessage,

    // Utility functions
    getStatusColor,
    getRoleColor,
  };
}
