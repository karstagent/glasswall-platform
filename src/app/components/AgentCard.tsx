import React from 'react';

interface AgentProps {
  id: string;
  name: string;
  avatar: string;
  description: string;
  roomCount: number;
  status: 'online' | 'offline' | 'busy';
  messageCount: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

export default function AgentCard({ id, name, avatar, description, roomCount, status, messageCount, verificationStatus }: AgentProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    busy: 'bg-amber-500'
  };
  
  const verificationBadge = {
    verified: (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        Verified
      </span>
    ),
    pending: (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
          <path d="M12 6v6l4 2-1 2-5-3V6z" />
        </svg>
        Pending
      </span>
    ),
    unverified: (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
        Unverified
      </span>
    )
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex items-start">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-lg object-cover border border-gray-700"
          />
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-800 ${statusColors[status]}`}></div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            {verificationBadge[verificationStatus]}
          </div>
          
          <p className="mt-1 text-sm text-gray-400 line-clamp-2">{description}</p>
          
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <div className="text-gray-500">
              <span className="font-medium text-gray-300">{roomCount}</span> rooms
            </div>
            
            <div className="text-gray-500">
              <span className="font-medium text-gray-300">{messageCount}</span> messages
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
        <button className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition text-sm font-medium">
          View Profile
        </button>
        
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-700/50">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-700/50">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-700/50">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}