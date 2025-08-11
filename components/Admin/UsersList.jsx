'use client';

import { Users, Trash2, Loader2 } from 'lucide-react';

export default function UsersList({
  users,
  loadingUsers,
  onRemoveUser,
  onRoleChange,
  getStatusColor,
  getRoleColor,
}) {
  return (
    <div className='bg-terminal-light border border-terminal-border rounded-lg shadow-lg'>
      <div className='px-6 py-4 border-b border-terminal-border'>
        <h3 className='text-lg font-semibold text-terminal-text font-ibm-custom'>
          Current Users
        </h3>
      </div>

      {loadingUsers ? (
        <div className='p-6 text-center'>
          <Loader2 className='animate-spin h-8 w-8 text-terminal-muted mx-auto mb-4' />
          <p className='text-terminal-muted font-ibm'>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className='p-6 text-center'>
          <Users className='h-12 w-12 text-terminal-muted mx-auto mb-4' />
          <p className='text-terminal-muted font-ibm-custom mb-2'>
            No users found
          </p>
          <p className='text-sm text-terminal-muted font-ibm'>
            Create your first user account using the form above
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-terminal-dark/50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                  Role
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
                  Created
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase tracking-wider font-ibm'>
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
                    <div className='text-xs text-terminal-muted font-ibm'>
                      {user.email}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <select
                      value={user.role}
                      onChange={(e) => onRoleChange(user.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full font-ibm border-0 bg-transparent ${getRoleColor(
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
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-ibm ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-terminal-muted font-ibm'>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    {user.role !== 'Admin' && (
                      <button
                        onClick={() => onRemoveUser(user.id, user.email)}
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
  );
}
