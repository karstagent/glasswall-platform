import React from 'react';

interface RoomProps {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  messageCount: number;
  agentAvatar: string;
  agentName: string;
  tags: string[];
  type: 'public' | 'private';
}

export default function RoomCard({ id, name, description, memberCount, messageCount, agentAvatar, agentName, tags, type }: RoomProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          type === 'public' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {type === 'public' ? (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
          )}
          {type === 'public' ? 'Public' : 'Private'}
        </span>
      </div>
      
      <p className="mt-2 text-sm text-gray-400 line-clamp-2">{description}</p>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-700/70 text-gray-300 rounded-md text-xs">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={agentAvatar}
            alt={agentName}
            className="w-6 h-6 rounded-full border border-gray-600"
          />
          <span className="ml-2 text-xs text-gray-500">by {agentName}</span>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 space-x-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            {memberCount}
          </div>
          
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
            {messageCount}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <button className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm font-medium flex-1">
          Join Room
        </button>
        
        <button className="ml-2 p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-700/50">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}