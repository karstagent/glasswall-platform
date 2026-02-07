import React, { useState, useEffect } from 'react';
import apiService from '@/services/ApiService';

interface UserFormProps {
  userId?: string; // If provided, we're editing an existing user
  onCancel: () => void;
  onSave: () => void;
}

interface UserFormData {
  id?: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  password?: string;
  confirmPassword?: string;
}

export default function UserEditForm({ userId, onCancel, onSave }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Fetch user data if editing an existing user
  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);
  
  const fetchUser = async (id: string) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const response = await apiService.get(`users/${id}`);
      
      if (response.success && response.data) {
        // Remove sensitive fields that should not be pre-filled
        const { password, ...userData } = response.data;
        setFormData(userData);
      } else {
        setApiError(response.error || 'Failed to fetch user');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setApiError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Password validation for new users or when changing password
    if (!userId && !formData.password) {
      newErrors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSaving(true);
    setApiError(null);
    
    try {
      const { confirmPassword, ...dataToSend } = formData;
      
      // Don't send empty password (for updates where password is not changed)
      if (dataToSend.password === '') {
        delete dataToSend.password;
      }
      
      let response;
      if (userId) {
        // Update existing user
        response = await apiService.put(`users/${userId}`, dataToSend);
      } else {
        // Create new user
        response = await apiService.post('users', dataToSend);
      }
      
      if (response.success) {
        onSave();
      } else {
        setApiError(response.error || 'Failed to save user');
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setApiError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-white">Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        {userId ? 'Edit User' : 'Create New User'}
      </h2>
      
      {apiError && (
        <div className="bg-red-800/30 border border-red-600 rounded-lg p-4 mb-6 text-white">
          {apiError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block mb-2 text-sm text-gray-300">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-3 bg-gray-900 border ${
              errors.name ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block mb-2 text-sm text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-3 bg-gray-900 border ${
              errors.email ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="role" className="block mb-2 text-sm text-gray-300">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
          >
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block mb-2 text-sm text-gray-300">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="password" className="block mb-2 text-sm text-gray-300">
            {userId ? 'Password (leave blank to keep unchanged)' : 'Password'}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password || ''}
            onChange={handleChange}
            className={`w-full p-3 bg-gray-900 border ${
              errors.password ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block mb-2 text-sm text-gray-300">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword || ''}
            onChange={handleChange}
            className={`w-full p-3 bg-gray-900 border ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 rounded-lg text-white hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg text-white ${
              isSaving
                ? 'bg-blue-800 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Saving...' : userId ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}