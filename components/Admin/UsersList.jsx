'use client';

import { Users, Trash2, Edit3 } from 'lucide-react';

export default function UsersList({
  users,
  loadingUsers,
  onRemoveUser,
  onRoleChange,
  getStatusColor,
  getRoleColor,
}) {
  if (loadingUsers) {
    return (
      <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border p-6'>
        <div className='flex items-center space-x-3 mb-6'>
          <Users className='h-6 w-6 text-terminal-blue lucide' />
          <h2 className='text-xl font-bold text-terminal-text font-ibm-custom'>
            User Management
          </h2>
        </div>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-terminal-blue mx-auto'></div>
          <p className='text-terminal-muted font-ibm mt-2'>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-terminal-light rounded-lg shadow-sm border border-terminal-border overflow-hidden'>
      <div className='px-6 py-4 border-b border-terminal-border'>
        <div className='flex items-center space-x-3'>
          <Users className='h-6 w-6 text-terminal-blue lucide' />
          <h2 className='text-xl font-bold text-terminal-text font-ibm-custom'>
            User Management
          </h2>
        </div>
      </div>

      {users.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-terminal-border'>
              <thead className='bg-terminal-dark'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    User
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Email
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Role
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-terminal-light divide-y divide-terminal-border'>
                {users.map((user) => (
                  <tr key={user.uid} className='hover:bg-terminal-dark'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <div className='h-10 w-10 rounded-full bg-terminal-blue/20 flex items-center justify-center'>
                            <span className='text-sm font-medium text-terminal-blue font-ibm'>
                              {user.displayName
                                ? user.displayName.charAt(0).toUpperCase()
                                : user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-terminal-text font-ibm'>
                            {user.displayName || 'No display name'}
                          </div>
                          <div className='text-sm text-terminal-muted font-ibm'>
                            UID: {user.uid.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-text font-ibm'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <select
                        value={user.role || 'User'}
                        onChange={(e) => onRoleChange(user.uid, e.target.value)}
                        className={`px-3 py-1 rounded-md text-sm font-medium font-ibm bg-terminal-dark border border-terminal-border focus:outline-none focus:ring-2 focus:ring-terminal-blue ${getRoleColor(
                          e.target.value
                        )}`}
                      >
                        <option value='User'>User</option>
                        <option value='Admin'>Admin</option>
                      </select>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-ibm ${getStatusColor(
                          user.status || 'Active'
                        )}`}
                      >
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex justify-center space-x-2'>
                        <button
                          onClick={() => onRemoveUser(user.uid, user.email)}
                          className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                          title='Remove user'
                        >
                          <Trash2 className='h-4 w-4 lucide' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-3 p-4'>
            {users.map((user) => (
              <div
                key={user.uid}
                className='bg-terminal-dark p-4 rounded border border-terminal-border'
              >
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='h-10 w-10 rounded-full bg-terminal-blue/20 flex items-center justify-center'>
                      <span className='text-sm font-medium text-terminal-blue font-ibm'>
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className='text-sm font-medium text-terminal-text font-ibm'>
                        {user.displayName || 'No display name'}
                      </div>
                      <div className='text-xs text-terminal-muted font-ibm'>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveUser(user.uid, user.email)}
                    className='text-terminal-red hover:text-terminal-red/80 transition-colors cursor-pointer'
                    title='Remove user'
                  >
                    <Trash2 className='h-4 w-4 lucide' />
                  </button>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-xs text-terminal-muted font-ibm'>
                      Role:
                    </span>
                    <select
                      value={user.role || 'User'}
                      onChange={(e) => onRoleChange(user.uid, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium font-ibm bg-terminal-light border border-terminal-border focus:outline-none focus:ring-1 focus:ring-terminal-blue ${getRoleColor(
                        e.target.value
                      )}`}
                    >
                      <option value='User'>User</option>
                      <option value='Admin'>Admin</option>
                    </select>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-ibm ${getStatusColor(
                      user.status || 'Active'
                    )}`}
                  >
                    {user.status || 'Active'}
                  </span>
                </div>

                <div className='mt-2 text-xs text-terminal-muted font-ibm'>
                  UID: {user.uid.slice(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className='px-6 py-12 text-center'>
          <Users className='h-12 w-12 text-terminal-muted mx-auto mb-3 lucide' />
          <p className='text-terminal-muted font-ibm'>No users found.</p>
        </div>
      )}
    </div>
  );
}
