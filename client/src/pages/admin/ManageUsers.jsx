import { useState, useEffect } from 'react';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // Simulating API call with mock data
      setTimeout(() => {
        const mockUsers = [
          {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            createdAt: '2024-01-15T10:30:00Z',
            lastLogin: '2024-01-20T14:22:00Z'
          },
          {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'admin',
            createdAt: '2024-01-10T09:15:00Z',
            lastLogin: '2024-01-21T11:45:00Z'
          },
          {
            _id: '3',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
            createdAt: '2024-01-21T16:30:00Z',
            lastLogin: '2024-01-21T16:35:00Z'
          }
        ];
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again later.');
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // TODO: Implement actual API call to update user role
      console.log(`Updating user ${userId} role to ${newRole}`);
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      
      // Show success message (you might want to use a toast library)
      alert(`User role updated to ${newRole} successfully!`);
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // TODO: Implement actual API call to delete user
        console.log(`Deleting user ${userId}`);
        
        // Update local state
        setUsers(users.filter(user => user._id !== userId));
        
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600">View and manage user accounts and roles</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                        title={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1 
                          ? 'Cannot delete the last admin user' 
                          : 'Delete user'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || roleFilter !== 'all' 
                      ? 'No users match your search criteria.' 
                      : 'No users found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'user').length}
            </div>
            <div className="text-sm text-gray-600">Regular Users</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Administrators</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;