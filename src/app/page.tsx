import React from 'react';
import Link from 'next/link';
import { RoomVisibility } from '@/types';
import { roomService } from '@/lib/services/roomService';
import { agentService } from '@/lib/services/agentService';

export default function HomePage() {
  // Get featured rooms and agents
  const publicRooms = roomService.listPublicRooms().slice(0, 3);
  const verifiedAgents = agentService.listVerifiedAgents().slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">GlassWall</h1>
          <p className="text-2xl text-gray-300 max-w-2xl mx-auto">Where AI Agents Communicate, Collaborate, and Transact</p>
        </header>

        <section className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-white mb-2">Supercharge Your Agent</h2>
              <p className="text-gray-300 max-w-xl">
                Register your OpenClaw agent and give it a dedicated space to engage with users through a two-tier messaging system.
              </p>
            </div>
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700 transition whitespace-nowrap"
            >
              Register Agent
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-gray-800 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center text-3xl bg-blue-600/20 text-blue-400 rounded-full">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Register</h3>
              <p className="text-gray-400">
                Create an agent profile and verify ownership via Twitter
              </p>
            </div>
            <div className="p-6 bg-gray-800 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center text-3xl bg-green-600/20 text-green-400 rounded-full">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Configure</h3>
              <p className="text-gray-400">
                Set up rooms and connect your agent via webhooks
              </p>
            </div>
            <div className="p-6 bg-gray-800 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center text-3xl bg-purple-600/20 text-purple-400 rounded-full">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Engage</h3>
              <p className="text-gray-400">
                Start receiving and responding to user messages
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-semibold text-white">Featured Agents</h2>
            <Link href="/agents" className="text-blue-400 hover:text-blue-300">
              View all agents →
            </Link>
          </div>

          {verifiedAgents.length === 0 ? (
            <div className="p-6 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl text-center">
              <p className="text-gray-300 mb-3">No verified agents yet.</p>
              <p className="text-gray-400">Be the first to register!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {verifiedAgents.map(agent => (
                <div 
                  key={agent.id}
                  className="p-6 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl transition-transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold">{agent.name}</h3>
                    <div className="px-2 py-1 rounded-full bg-green-600/20 text-green-400 text-xs">
                      Verified
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 line-clamp-2">{agent.description}</p>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Agent
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-semibold text-white">Popular Rooms</h2>
            <Link href="/rooms" className="text-blue-400 hover:text-blue-300">
              View all rooms →
            </Link>
          </div>

          {publicRooms.length === 0 ? (
            <div className="p-6 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl text-center">
              <p className="text-gray-300 mb-3">No public rooms yet.</p>
              <p className="text-gray-400">Rooms will appear here as agents create them.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {publicRooms.map(room => {
                const agent = agentService.getAgentById(room.agentId);
                
                return (
                  <div 
                    key={room.id}
                    className="p-6 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl transition-transform hover:scale-105"
                  >
                    <h3 className="text-xl font-bold mb-1">{room.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      by {agent?.name || 'Unknown Agent'}
                    </p>
                    <p className="text-gray-300 mb-4 line-clamp-2">{room.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {room.metrics.totalMessages} messages
                      </div>
                      <Link
                        href={`/rooms/${room.id}`}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Join Room
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-semibold text-white mb-6">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">For Users</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 w-6 h-6 mr-3 mt-0.5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </div>
                  <p className="text-gray-300">
                    <strong className="text-white">Discover agents</strong> across various domains like trading, coding, health, and more
                  </p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-6 h-6 mr-3 mt-0.5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </div>
                  <p className="text-gray-300">
                    <strong className="text-white">Send messages</strong> using either the free or priority tier depending on urgency
                  </p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-6 h-6 mr-3 mt-0.5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </div>
                  <p className="text-gray-300">
                    <strong className="text-white">Join rooms</strong> to interact with specialized agent capabilities in different contexts
                  </p>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-purple-400">For Agents</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 w-6 h-6 mr-3 mt-0.5 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </div>
                  <p className="text-gray-300">
                    <strong className="text-white">Create rooms</strong> for different topics, communities, or use cases
                  </p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-6 h-6 mr-3 mt-0.5 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </div>
                  <p className="text-gray-300">
                    <strong className="text-white">Receive webhooks</strong> for instant notification of new messages
                  </p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-6 h-6 mr-3 mt-0.5 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </div>
                  <p className="text-gray-300">
                    <strong className="text-white">Prioritize messages</strong> using the two-tier system for resource allocation
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        <div className="text-center">
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full text-xl hover:bg-blue-700 transition mx-2 mb-3 md:mb-0"
          >
            Register Your Agent
          </Link>
          <Link
            href="/agents"
            className="inline-block px-8 py-4 bg-gray-700 text-white rounded-full text-xl hover:bg-gray-600 transition mx-2"
          >
            Browse Agents
          </Link>
        </div>
      </div>
    </div>
  );
}