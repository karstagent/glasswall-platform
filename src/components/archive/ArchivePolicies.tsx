import React, { useState, useEffect } from 'react';
import archiveService, { ArchivePolicy } from './ArchiveService';

export default function ArchivePolicies() {
  const [policies, setPolicies] = useState<ArchivePolicy[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<ArchivePolicy | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for creating/editing
  const [formData, setFormData] = useState<Partial<ArchivePolicy>>({
    name: '',
    description: '',
    enabled: true,
    retention: {
      duration: 90,
      permanent: false
    },
    filters: {
      roomIds: [],
      messageTypes: [],
      userIds: []
    }
  });
  
  // Available message types for filtering
  const messageTypes = [
    { id: 'text', label: 'Text Messages' },
    { id: 'image', label: 'Images' },
    { id: 'file', label: 'Files' },
    { id: 'system', label: 'System Messages' }
  ];
  
  // Available rooms for filtering
  const availableRooms = [
    { id: 'general', name: 'General' },
    { id: 'development', name: 'Development' },
    { id: 'marketing', name: 'Marketing' }
  ];
  
  // Available users for filtering
  const availableUsers = [
    { id: 'user1', name: 'John Doe' },
    { id: 'user2', name: 'Jane Smith' },
    { id: 'user3', name: 'Michael Brown' }
  ];
  
  useEffect(() => {
    fetchPolicies();
  }, []);
  
  const fetchPolicies = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await archiveService.getPolicies();
      
      if (response.success && response.data) {
        setPolicies(response.data);
      } else {
        setError(response.error || 'Failed to fetch archive policies');
      }
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSavePolicy = async () => {
    try {
      let response;
      
      if (editingPolicy) {
        // Update existing policy
        response = await archiveService.updatePolicy(editingPolicy.id, formData);
      } else {
        // Create new policy
        response = await archiveService.createPolicy(formData as any);
      }
      
      if (response.success) {
        // Refresh policies list
        fetchPolicies();
        
        // Reset form
        setEditingPolicy(null);
        setIsCreating(false);
        setFormData({
          name: '',
          description: '',
          enabled: true,
          retention: {
            duration: 90,
            permanent: false
          },
          filters: {
            roomIds: [],
            messageTypes: [],
            userIds: []
          }
        });
      } else {
        setError(response.error || 'Failed to save policy');
      }
    } catch (err) {
      console.error('Error saving policy:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this archive policy?')) {
      return;
    }
    
    try {
      const response = await archiveService.deletePolicy(policyId);
      
      if (response.success) {
        // Refresh policies list
        fetchPolicies();
      } else {
        setError(response.error || 'Failed to delete policy');
      }
    } catch (err) {
      console.error('Error deleting policy:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleTogglePolicy = async (policyId: string, enabled: boolean) => {
    try {
      const response = await archiveService.updatePolicy(policyId, { enabled });
      
      if (response.success) {
        // Update policy in state
        setPolicies(prevPolicies =>
          prevPolicies.map(policy =>
            policy.id === policyId
              ? { ...policy, enabled }
              : policy
          )
        );
      } else {
        setError(response.error || `Failed to ${enabled ? 'enable' : 'disable'} policy`);
      }
    } catch (err) {
      console.error(`Error ${enabled ? 'enabling' : 'disabling'} policy:`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        // Handle nested fields
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        };
      } else {
        // Handle top-level fields
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };
  
  const formatRetention = (policy: ArchivePolicy) => {
    if (policy.retention.permanent) {
      return 'Permanent';
    } else {
      return `${policy.retention.duration} days`;
    }
  };
  
  // Demo data for development
  const demoPolicies: ArchivePolicy[] = [
    {
      id: '1',
      name: 'Standard Retention',
      description: 'Keep all messages for 90 days',
      enabled: true,
      retention: {
        duration: 90,
        permanent: false
      },
      filters: {},
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-01-10T08:00:00Z'
    },
    {
      id: '2',
      name: 'Legal Hold - Development Room',
      description: 'Permanent retention for the Development room',
      enabled: true,
      retention: {
        duration: 0,
        permanent: true
      },
      filters: {
        roomIds: ['development']
      },
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z'
    },
    {
      id: '3',
      name: 'Extended Media Retention',
      description: 'Keep images and files for 1 year',
      enabled: false,
      retention: {
        duration: 365,
        permanent: false
      },
      filters: {
        messageTypes: ['image', 'file']
      },
      createdAt: '2026-01-20T14:00:00Z',
      updatedAt: '2026-01-20T14:00:00Z'
    }
  ];
  
  // Use demo data if no real data is available
  const displayPolicies = policies.length > 0 ? policies : demoPolicies;
  
  if (isCreating || editingPolicy) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <button
            onClick={() => {
              setEditingPolicy(null);
              setIsCreating(false);
            }}
            className="flex items-center text-blue-400 hover:text-blue-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Policies
          </button>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingPolicy ? 'Edit Archive Policy' : 'Create Archive Policy'}
          </h2>
          
          {error && (
            <div className="bg-red-800/30 border border-red-600 rounded-lg p-4 mb-6 text-white">
              {error}
            </div>
          )}
          
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm text-gray-300">
                Policy Name*
              </label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="E.g., Standard Retention"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block mb-2 text-sm text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                rows={3}
                placeholder="Describe the purpose of this policy"
              />
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Retention Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="retention-temporary"
                    type="radio"
                    checked={!formData.retention?.permanent}
                    onChange={() => handleFormChange('retention.permanent', false)}
                    className="h-4 w-4 bg-gray-900 border-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="retention-temporary" className="ml-2 text-white">
                    Temporary Retention
                  </label>
                </div>
                
                {!formData.retention?.permanent && (
                  <div className="ml-6">
                    <label htmlFor="retention-days" className="block mb-2 text-sm text-gray-300">
                      Days to retain
                    </label>
                    <input
                      id="retention-days"
                      type="number"
                      min="1"
                      max="3650"
                      value={formData.retention?.duration}
                      onChange={(e) => handleFormChange('retention.duration', parseInt(e.target.value))}
                      className="w-24 p-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    id="retention-permanent"
                    type="radio"
                    checked={formData.retention?.permanent}
                    onChange={() => handleFormChange('retention.permanent', true)}
                    className="h-4 w-4 bg-gray-900 border-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="retention-permanent" className="ml-2 text-white">
                    Permanent Retention (never delete)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Filters (Optional)</h3>
              <p className="text-gray-400 text-sm mb-4">
                If no filters are selected, the policy applies to all messages.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Message Types
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {messageTypes.map(type => (
                      <div key={type.id} className="flex items-center">
                        <input
                          id={`type-${type.id}`}
                          type="checkbox"
                          checked={formData.filters?.messageTypes?.includes(type.id)}
                          onChange={(e) => {
                            const current = formData.filters?.messageTypes || [];
                            const updated = e.target.checked
                              ? [...current, type.id]
                              : current.filter(t => t !== type.id);
                            handleFormChange('filters.messageTypes', updated);
                          }}
                          className="h-4 w-4 bg-gray-900 border-gray-700 rounded text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor={`type-${type.id}`} className="ml-2 text-sm text-gray-300">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Rooms
                  </label>
                  <select
                    multiple
                    size={3}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    value={formData.filters?.roomIds || []}
                    onChange={(e) => {
                      const selected = Array.from(
                        e.target.selectedOptions,
                        option => option.value
                      );
                      handleFormChange('filters.roomIds', selected);
                    }}
                  >
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Hold Ctrl (or Cmd) to select multiple rooms
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center pt-4">
              <input
                id="policy-enabled"
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => handleFormChange('enabled', e.target.checked)}
                className="h-5 w-5 bg-gray-900 border-gray-700 rounded text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="policy-enabled" className="ml-3">
                <span className="block text-sm font-medium text-white">Policy Enabled</span>
                <span className="block text-xs text-gray-400">
                  You can disable policies temporarily without deleting them
                </span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setEditingPolicy(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 border border-gray-600 rounded-lg text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePolicy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                {editingPolicy ? 'Update Policy' : 'Create Policy'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  if (isLoading && policies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading archive policies...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Archive Policies</h2>
        
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Create Policy
        </button>
      </div>
      
      {error && (
        <div className="bg-red-800/30 border border-red-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      <div>
        {displayPolicies.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Archive Policies</h3>
            <p className="text-gray-400 mb-4">
              Create your first archive policy to manage message retention.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              Create Your First Policy
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {displayPolicies.map(policy => (
              <div
                key={policy.id}
                className={`bg-gray-800/50 backdrop-blur-lg border 
                  ${policy.enabled ? 'border-gray-700' : 'border-gray-700/50'} 
                  rounded-2xl p-6 transition-opacity 
                  ${policy.enabled ? 'opacity-100' : 'opacity-60'}`
                }
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-xl font-semibold ${
                      policy.enabled ? 'text-white' : 'text-gray-400'
                    }`}>
                      {policy.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {policy.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={policy.enabled}
                          onChange={(e) => handleTogglePolicy(policy.id, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingPolicy(policy)}
                        className="p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-gray-700"
                        title="Edit policy"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-gray-700"
                        title="Delete policy"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm text-gray-400 mb-1">Retention Period</h4>
                    <p className="text-white">{formatRetention(policy)}</p>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm text-gray-400 mb-1">Filters</h4>
                    <div className="space-y-1">
                      {(!policy.filters || Object.keys(policy.filters).length === 0) && (
                        <p className="text-white">All messages</p>
                      )}
                      
                      {policy.filters?.roomIds && policy.filters.roomIds.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-gray-400 text-sm">Rooms:</span>
                          {policy.filters.roomIds.map(roomId => {
                            const room = availableRooms.find(r => r.id === roomId);
                            return (
                              <span key={roomId} className="px-2 py-0.5 text-xs rounded bg-blue-600/20 text-blue-400">
                                {room ? room.name : roomId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
                      {policy.filters?.messageTypes && policy.filters.messageTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-gray-400 text-sm">Types:</span>
                          {policy.filters.messageTypes.map(type => (
                            <span key={type} className="px-2 py-0.5 text-xs rounded bg-purple-600/20 text-purple-400">
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {policy.filters?.userIds && policy.filters.userIds.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-gray-400 text-sm">Users:</span>
                          {policy.filters.userIds.map(userId => {
                            const user = availableUsers.find(u => u.id === userId);
                            return (
                              <span key={userId} className="px-2 py-0.5 text-xs rounded bg-green-600/20 text-green-400">
                                {user ? user.name : userId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-4">
                  Created: {new Date(policy.createdAt).toLocaleDateString()} | Last Updated: {new Date(policy.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}