import React, { useState, useEffect } from 'react';
import archiveService, { ArchivedMessage, ArchiveOptions } from './ArchiveService';
import { formatDistanceToNow } from 'date-fns';

export default function ArchiveSearch() {
  const [searchOptions, setSearchOptions] = useState<ArchiveOptions>({
    limit: 25,
    offset: 0
  });
  
  const [messages, setMessages] = useState<ArchivedMessage[]>([]);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Date range filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [roomFilter, setRoomFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  
  // Available message types
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
  
  // Search archives based on current filters
  const searchArchives = async () => {
    setIsLoading(true);
    setError(null);
    
    // Prepare search options
    const options: ArchiveOptions = {
      ...searchOptions
    };
    
    if (roomFilter) options.roomId = roomFilter;
    if (userFilter) options.userId = userFilter;
    if (typeFilters.length > 0) options.messageTypes = typeFilters;
    if (startDate) options.after = new Date(startDate).toISOString();
    if (endDate) options.before = new Date(endDate).toISOString();
    
    try {
      const response = await archiveService.searchArchive(options);
      
      if (response.success && response.data) {
        setMessages(response.data);
        setTotalMessages(response.data.length); // In real implementation, this would come from metadata
      } else {
        setError(response.error || 'Failed to search archives');
      }
    } catch (err) {
      console.error('Error searching archives:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchArchives();
  };
  
  // Handle message type checkbox change
  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setTypeFilters(prev => [...prev, type]);
    } else {
      setTypeFilters(prev => prev.filter(t => t !== type));
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  // Get content preview based on type
  const getContentPreview = (message: ArchivedMessage) => {
    switch (message.contentType) {
      case 'text':
        return (
          <div className="text-white">
            {message.content.length > 100 
              ? `${message.content.substring(0, 100)}...` 
              : message.content}
          </div>
        );
        
      case 'image':
        return (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-blue-400">Image attachment</span>
          </div>
        );
        
      case 'file':
        return (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-400">File attachment: {message.content}</span>
          </div>
        );
        
      case 'system':
        return (
          <div className="text-gray-400 italic">
            {message.content}
          </div>
        );
        
      default:
        return (
          <div className="text-white">{message.content}</div>
        );
    }
  };
  
  // Get user name from ID
  const getUserName = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    return user ? user.name : userId;
  };
  
  // Get room name from ID
  const getRoomName = (roomId: string) => {
    const room = availableRooms.find(r => r.id === roomId);
    return room ? room.name : roomId;
  };
  
  // Demo data for development
  const demoMessages: ArchivedMessage[] = [
    {
      id: '1',
      roomId: 'general',
      userId: 'user1',
      content: 'This is an example archived message that was stored for compliance reasons.',
      contentType: 'text',
      createdAt: '2026-01-15T10:30:00Z',
      archivedAt: '2026-01-25T12:00:00Z'
    },
    {
      id: '2',
      roomId: 'development',
      userId: 'user2',
      content: 'meeting_notes.pdf',
      contentType: 'file',
      createdAt: '2026-01-16T14:45:00Z',
      archivedAt: '2026-01-25T12:00:00Z',
      metadata: {
        size: 1240000,
        type: 'application/pdf'
      }
    },
    {
      id: '3',
      roomId: 'marketing',
      userId: 'user3',
      content: 'product_image.jpg',
      contentType: 'image',
      createdAt: '2026-01-18T09:15:00Z',
      archivedAt: '2026-01-25T12:00:00Z',
      metadata: {
        size: 450000,
        dimensions: {
          width: 1200,
          height: 800
        }
      }
    },
    {
      id: '4',
      roomId: 'general',
      userId: 'system',
      content: 'User John Doe joined the room',
      contentType: 'system',
      createdAt: '2026-01-20T11:30:00Z',
      archivedAt: '2026-01-25T12:00:00Z'
    }
  ];
  
  // Use demo data if API call hasn't completed yet
  const displayMessages = messages.length > 0 ? messages : demoMessages;
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Archive Search</h2>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block mb-2 text-sm text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block mb-2 text-sm text-gray-300">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="roomFilter" className="block mb-2 text-sm text-gray-300">
                Room
              </label>
              <select
                id="roomFilter"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="">All Rooms</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="userFilter" className="block mb-2 text-sm text-gray-300">
                User
              </label>
              <select
                id="userFilter"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="">All Users</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
          
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
                    checked={typeFilters.includes(type.id)}
                    onChange={(e) => handleTypeChange(type.id, e.target.checked)}
                    className="h-4 w-4 bg-gray-900 border-gray-700 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor={`type-${type.id}`} className="ml-2 text-sm text-gray-300">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search Archives'}
            </button>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-800/30 border border-red-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">
            Search Results 
            <span className="text-sm text-gray-400 ml-2">
              ({displayMessages.length} messages)
            </span>
          </h3>
        </div>
        
        {displayMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No archived messages found matching your search criteria.
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {displayMessages.map(message => (
              <div key={message.id} className="p-4 hover:bg-gray-800">
                <div className="flex justify-between mb-2">
                  <div className="font-medium text-white">
                    {getUserName(message.userId)} 
                    <span className="text-gray-500 ml-2">
                      in {getRoomName(message.roomId)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatTimestamp(message.createdAt)}
                  </div>
                </div>
                
                <div className="mb-2">
                  {getContentPreview(message)}
                </div>
                
                <div className="flex justify-between items-center mt-2 text-xs">
                  <div className="text-gray-500">
                    Archived: {new Date(message.archivedAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      View
                    </button>
                    <button className="text-blue-400 hover:text-blue-300">
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}