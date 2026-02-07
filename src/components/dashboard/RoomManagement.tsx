import React, { useState, useEffect } from 'react';
import apiService from '@/services/ApiService';

interface Room {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct';
  createdAt: string;
  memberCount: number;
  messageCount: number;
  status: 'active' | 'archived';
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  useEffect(() => {
    fetchRooms();
  }, []);
  
  useEffect(() => {
    filterRooms();
  }, [rooms, searchQuery, typeFilter, statusFilter]);
  
  const fetchRooms = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Room[]>('rooms');
      
      if (response.success && response.data) {
        setRooms(response.data);
      } else {
        setError(response.error || 'Failed to fetch rooms');
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterRooms = () => {
    let filtered = [...rooms];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        room =>
          room.name.toLowerCase().includes(query) ||
          room.description.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(room => room.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }
    
    setFilteredRooms(filtered);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get room type display name
  const getRoomTypeDisplay = (type: string): string => {
    switch (type) {
      case 'public': return 'Public';
      case 'private': return 'Private';
      case 'direct': return 'Direct Message';
      default: return type;
    }
  };
  
  if (isLoading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading rooms...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-800/30 border border-red-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-2">Error Loading Rooms</h3>
        <p>{error}</p>
        <button 
          onClick={fetchRooms}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Simulated room data for development
  const simulatedRooms: Room[] = [
    {
      id: '1',
      name: 'General',
      description: 'Public room for general discussions',
      type: 'public',
      createdAt: '2026-01-15T10:30:00Z',
      memberCount: 45,
      messageCount: 1203,
      status: 'active'
    },
    {
      id: '2',
      name: 'Development',
      description: 'Private room for development discussions',
      type: 'private',
      createdAt: '2026-01-16T14:15:00Z',
      memberCount: 12,
      messageCount: 876,
      status: 'active'
    },
    {
      id: '3',
      name: 'Marketing',
      description: 'Room for marketing team',
      type: 'private',
      createdAt: '2026-01-18T09:45:00Z',
      memberCount: 8,
      messageCount: 523,
      status: 'active'
    },
    {
      id: '4',
      name: 'Legacy Project',
      description: 'Old project discussions',
      type: 'public',
      createdAt: '2026-01-10T08:30:00Z',
      memberCount: 15,
      messageCount: 342,
      status: 'archived'
    },
    {
      id: '5',
      name: 'John & Sarah',
      description: 'Direct message',
      type: 'direct',
      createdAt: '2026-01-25T16:20:00Z',
      memberCount: 2,
      messageCount: 134,
      status: 'active'
    }
  ];
  
  // Use simulated data if no real data is available
  const displayRooms = rooms.length > 0 ? filteredRooms : simulatedRooms;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <input
            type="text"
            placeholder="Search rooms..."
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
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Types</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="direct">Direct Messages</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          
          <button
            onClick={fetchRooms}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Rooms</h2>
        <button
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
          onClick={() => alert('Create room functionality will be implemented here')}
        >
          Create Room
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayRooms.map(room => (
          <div 
            key={room.id}
            className={`bg-gray-800/50 backdrop-blur-lg border ${
              room.status === 'archived' ? 'border-gray-700/50' : 'border-gray-700'
            } rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-blue-900/10`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`text-xl font-bold ${
                  room.status === 'archived' ? 'text-gray-400' : 'text-white'
                }`}>
                  {room.name}
                </h3>
                <p className="text-gray-400 mt-1 text-sm line-clamp-2">{room.description}</p>
              </div>
              
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  room.type === 'public'
                    ? 'bg-green-600/20 text-green-400'
                    : room.type === 'private'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-purple-600/20 text-purple-400'
                }`}>
                  {getRoomTypeDisplay(room.type)}
                </span>
                
                {room.status === 'archived' && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-gray-600/20 text-gray-400">
                    Archived
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-gray-400">Members</div>
                <div className="text-white font-medium">{room.memberCount}</div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-gray-400">Messages</div>
                <div className="text-white font-medium">{room.messageCount}</div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Created: {formatDate(room.createdAt)}
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-3 py-1 text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded"
                onClick={() => alert(`View ${room.name}`)}
              >
                View
              </button>
              
              <button
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
                onClick={() => alert(`Edit ${room.name}`)}
              >
                Edit
              </button>
              
              <button
                className={`px-3 py-1 text-sm rounded ${
                  room.status === 'active'
                    ? 'bg-red-600/20 hover:bg-red-600/40 text-red-400'
                    : 'bg-green-600/20 hover:bg-green-600/40 text-green-400'
                }`}
                onClick={() => alert(`${room.status === 'active' ? 'Archive' : 'Activate'} ${room.name}`)}
              >
                {room.status === 'active' ? 'Archive' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}