'use client';

import { useUserManagement } from '@/hooks/useUserManagement';
import UserCreationForm from './UserCreationForm';
import UsersList from './UsersList';
import { Users } from 'lucide-react';

export default function UserManagement() {
  const {
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
  } = useUserManagement();

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center space-x-3 mt-10'>
        <div className='p-2 bg-terminal-blue/10 rounded-lg border border-terminal-blue/30'>
          <Users className='h-6 w-6 text-terminal-blue' />
        </div>
        <div>
          <h2 className='text-2xl font-bold text-terminal-text font-ibm-custom'>
            User Management
          </h2>
          <p className='text-terminal-muted font-ibm'>
            Send invitations and manage users securely
          </p>
        </div>
      </div>

      {/* Create User Form */}
      <UserCreationForm
        email={email}
        displayName={displayName}
        isLoading={isLoading}
        message={message}
        messageType={messageType}
        onEmailChange={(e) => setEmail(e.target.value)}
        onDisplayNameChange={(e) => setDisplayName(e.target.value)}
        onSubmit={handleCreateUser}
        onClearMessage={clearMessage}
      />

      {/* Users List */}
      <UsersList
        users={users}
        loadingUsers={loadingUsers}
        onRemoveUser={handleRemoveUser}
        onRoleChange={handleRoleChange}
        getStatusColor={getStatusColor}
        getRoleColor={getRoleColor}
      />
    </div>
  );
}
