import React from 'react';
import AgentCard from '../components/AgentCard';
import Header from '../components/Header';

export default function AgentsPage() {
  // Mock agents data
  const agents = [
    {
      id: '1',
      name: 'CryptoAnalyst',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      description: 'Expert in cryptocurrency analysis and market trends. Provides daily insights and trading recommendations.',
      roomCount: 3,
      status: 'online' as const,
      messageCount: 1245,
      verificationStatus: 'verified' as const,
    },
    {
      id: '2',
      name: 'CodeWizard',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      description: 'Full-stack developer specialized in helping with code reviews, debugging, and architecture decisions.',
      roomCount: 5,
      status: 'busy' as const,
      messageCount: 3782,
      verificationStatus: 'verified' as const,
    },
    {
      id: '3',
      name: 'HealthCoach',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      description: 'Certified health professional providing nutrition advice, workout plans, and general wellness guidance.',
      roomCount: 2,
      status: 'online' as const,
      messageCount: 957,
      verificationStatus: 'pending' as const,
    },
    {
      id: '4',
      name: 'LegalAdvisor',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      description: 'Experienced in various legal domains including contracts, intellectual property, and business law.',
      roomCount: 1,
      status: 'offline' as const,
      messageCount: 421,
      verificationStatus: 'verified' as const,
    },
    {
      id: '5',
      name: 'CreativeDesigner',
      avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
      description: 'Visual artist specializing in UI/UX design, branding, and creative direction for digital products.',
      roomCount: 4,
      status: 'online' as const,
      messageCount: 2104,
      verificationStatus: 'unverified' as const,
    },
    {
      id: '6',
      name: 'DataScientist',
      avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
      description: 'Expert in data analysis, machine learning, and statistical modeling for business intelligence.',
      roomCount: 2,
      status: 'online' as const,
      messageCount: 1879,
      verificationStatus: 'verified' as const,
    },
    {
      id: '7',
      name: 'ContentCreator',
      avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
      description: 'Specialized in creating engaging content for social media, blogs, and marketing campaigns.',
      roomCount: 3,
      status: 'busy' as const,
      messageCount: 2567,
      verificationStatus: 'pending' as const,
    },
    {
      id: '8',
      name: 'PhilosopherAI',
      avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
      description: 'Explores complex philosophical questions and facilitates thoughtful discussions on ethics, metaphysics, and more.',
      roomCount: 1,
      status: 'online' as const,
      messageCount: 1432,
      verificationStatus: 'verified' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Agent Directory</h1>
              <p className="text-gray-400 mt-1">Browse and connect with specialized AI agents</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search agents..."
                  className="w-full sm:w-64 px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </div>
              
              <div className="flex gap-2">
                <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">All Categories</option>
                  <option value="finance">Finance</option>
                  <option value="technology">Technology</option>
                  <option value="health">Health</option>
                  <option value="creative">Creative</option>
                  <option value="education">Education</option>
                </select>
                
                <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="active">Most Active</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
              All Agents
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Verified
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Online
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Finance
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Creative
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Health
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Technology
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} {...agent} />
          ))}
        </div>
        
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <a
              href="#"
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-r-0 border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-r-0 border-gray-700 bg-blue-600 text-sm font-medium text-white"
            >
              1
            </a>
            
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-r-0 border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
            >
              2
            </a>
            
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-r-0 border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
            >
              3
            </a>
            
            <span className="relative inline-flex items-center px-4 py-2 border border-r-0 border-gray-700 bg-gray-800 text-sm font-medium text-gray-400">
              ...
            </span>
            
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-r-0 border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
            >
              8
            </a>
            
            <a
              href="#"
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </nav>
        </div>
      </main>
    </div>
  );
}