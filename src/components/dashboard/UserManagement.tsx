import React, { useState, useEffect } from 'react';
import apiService from '@/services/ApiService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive: string;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter, roleFilter]);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<User[]>('users');
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterUsers = () => {
    let filtered = [...users];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading users...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-800/30 border border-red-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-2">Error Loading Users</h3>
        <p>{error}</p>
        <button 
          onClick={fetchUsers}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Simulated user data for development
  const simulatedUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      lastActive: '2026-02-07T07:45:12Z',
      createdAt: '2026-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'user',
      status: 'active',
      lastActive: '2026-02-07T06:12:45Z',
      createdAt: '2026-01-20T14:15:00Z'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      role: 'moderator',
      status: 'inactive',
      lastActive: '2026-02-04T11:30:22Z',
      createdAt: '2026-01-18T09:45:00Z'
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'user',
      status: 'active',
      lastActive: '2026-02-07T08:05:32Z',
      createdAt: '2026-01-25T16:20:00Z'
    },
    {
      id: '5',
      name: 'David Lee',
      email: 'david.lee@example.com',
      role: 'admin',
      status: 'active',
      lastActive: '2026-02-06T22:15:10Z',
      createdAt: '2026-01-10T08:30:00Z'
    }
  ];
  
  // Use simulated data if no real data is available
  const displayUsers = users.length > 0 ? filteredUsers : simulatedUsers;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white w-full"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
          
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl overflow-hidden">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Last Active</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin'
                      ? 'bg-purple-600/20 text-purple-400'
                      : user.role === 'moderator'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'active'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">{formatDate(user.lastActive)}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="text-blue-400 hover:text-blue-300 mr-3"
                    onClick={() => alert(`Edit user: ${user.name}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => alert(`Delete user: ${user.name}`)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}