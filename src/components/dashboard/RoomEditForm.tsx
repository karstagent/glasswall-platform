import React, { useState, useEffect } from 'react';
import apiService from '@/services/ApiService';

interface RoomFormProps {
  roomId?: string; // If provided, we're editing an existing room
  onCancel: () => void;
  onSave: () => void;
}

interface RoomFormData {
  id?: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct';
  status: 'active' | 'archived';
}

export default function RoomEditForm({ roomId, onCancel, onSave }: RoomFormProps) {
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    description: '',
    type: 'public',
    status: 'active'
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Fetch room data if editing an existing room
  useEffect(() => {
    if (roomId) {
      fetchRoom(roomId);
    }
  }, [roomId]);
  
  const fetchRoom = async (id: string) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const response = await apiService.get(`rooms/${id}`);
      
      if (response.success && response.data) {
        setFormData(response.data);
      } else {
        setApiError(response.error || 'Failed to fetch room');
      }
    } catch (err) {
      console.error('Error fetching room:', err);
      setApiError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
      newErrors.name = 'Room name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Room name must be less than 50 characters';
    }
    
    // Description validation
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
      let response;
      if (roomId) {
        // Update existing room
        response = await apiService.put(`rooms/${roomId}`, formData);
      } else {
        // Create new room
        response = await apiService.post('rooms', formData);
      }
      
      if (response.success) {
        onSave();
      } else {
        setApiError(response.error || 'Failed to save room');
      }
    } catch (err) {
      console.error('Error saving room:', err);
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
        {roomId ? 'Edit Room' : 'Create New Room'}
      </h2>
      
      {apiError && (
        <div className="bg-red-800/30 border border-red-600 rounded-lg p-4 mb-6 text-white">
          {apiError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block mb-2 text-sm text-gray-300">
            Room Name*
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
            placeholder="Enter room name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block mb-2 text-sm text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full p-3 bg-gray-900 border ${
              errors.description ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white`}
            placeholder="Enter room description (optional)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>
        
        <div>
          <label htmlFor="type" className="block mb-2 text-sm text-gray-300">
            Room Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
          >
            <option value="public">Public (Visible to everyone)</option>
            <option value="private">Private (Invite only)</option>
            {!roomId && <option value="direct">Direct Message</option>}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {formData.type === 'public'
              ? 'Anyone can join and view messages'
              : formData.type === 'private'
              ? 'Only invited members can join and view messages'
              : 'Private conversation between specific users'}
          </p>
        </div>
        
        {roomId && (
          <div>
            <label htmlFor="status" className="block mb-2 text-sm text-gray-300">
              Room Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.status === 'active'
                ? 'Room is active and available for messaging'
                : 'Room is archived and read-only'}
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
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
            {isSaving ? 'Saving...' : roomId ? 'Update Room' : 'Create Room'}
          </button>
        </div>
      </form>
    </div>
  );
}