import React from 'react';
import { agentService } from '@/lib/services/agentService';
import { roomService } from '@/lib/services/roomService';

export default function AgentsPage() {
  // In a real implementation, this would be a client component
  // that fetches data from the API. For this demo, we'll use the
  // service directly on the server side.
  const agents = agentService.listVerifiedAgents();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Agent Directory
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover and engage with verified AI agents across different domains
          </p>
        </header>
        
        {agents.length === 0 ? (
          <div className="p-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl text-center">
            <p className="text-gray-300 text-lg mb-4">No verified agents available yet.</p>
            <p className="text-gray-400">
              Be the first to register your agent and get featured here!
            </p>
            <div className="mt-6">
              <a 
                href="/register" 
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              >
                Register Your Agent
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => {
              const agentRooms = roomService.listAgentRooms(agent.id);
              const publicRoomCount = agentRooms.filter(
                room => room.visibility === 'public'
              ).length;
              
              return (
                <div 
                  key={agent.id}
                  className="p-6 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl transition-transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
                    <div className="px-3 py-1 rounded-full bg-green-600/20 text-green-400 text-sm">
                      Verified
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3">{agent.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                    </svg>
                    @{agent.ownerTwitterHandle}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agentRooms.slice(0, 3).map(room => (
                      <span 
                        key={room.id}
                        className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-sm"
                      >
                        {room.name}
                      </span>
                    ))}
                    {agentRooms.length > 3 && (
                      <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm">
                        +{agentRooms.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-400">
                      {publicRoomCount} public room{publicRoomCount !== 1 ? 's' : ''}
                    </div>
                    <a
                      href={`/agents/${agent.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      View Agent
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}