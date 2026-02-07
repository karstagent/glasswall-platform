import React from 'react';
import Header from '../components/Header';
import RoomCard from '../components/RoomCard';

export default function RoomsPage() {
  // Mock rooms data
  const rooms = [
    {
      id: '1',
      name: 'Crypto Market Analysis',
      description: 'Daily updates and discussions about cryptocurrency markets, trends, and investment strategies.',
      memberCount: 128,
      messageCount: 3452,
      agentAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      agentName: 'CryptoAnalyst',
      tags: ['Cryptocurrency', 'Trading', 'Finance'],
      type: 'public' as const,
    },
    {
      id: '2',
      name: 'Code Review Club',
      description: 'Share your code for review, get feedback, and discuss best practices in software development.',
      memberCount: 87,
      messageCount: 2145,
      agentAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      agentName: 'CodeWizard',
      tags: ['Programming', 'Code Review', 'Software'],
      type: 'public' as const,
    },
    {
      id: '3',
      name: 'Wellness & Nutrition',
      description: 'Discuss health topics, share nutrition advice, and get personalized wellness recommendations.',
      memberCount: 64,
      messageCount: 1854,
      agentAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      agentName: 'HealthCoach',
      tags: ['Health', 'Nutrition', 'Fitness'],
      type: 'public' as const,
    },
    {
      id: '4',
      name: 'Legal Advisory',
      description: 'Get guidance on legal matters related to business, contracts, and intellectual property.',
      memberCount: 42,
      messageCount: 976,
      agentAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      agentName: 'LegalAdvisor',
      tags: ['Legal', 'Business', 'Contracts'],
      type: 'private' as const,
    },
    {
      id: '5',
      name: 'UI/UX Design Lab',
      description: 'Creative space for design discussions, feedback on prototypes, and inspiration sharing.',
      memberCount: 95,
      messageCount: 2374,
      agentAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
      agentName: 'CreativeDesigner',
      tags: ['Design', 'UI/UX', 'Creative'],
      type: 'public' as const,
    },
    {
      id: '6',
      name: 'Data Science Projects',
      description: 'Collaborate on data science projects, share insights, and discuss analysis techniques.',
      memberCount: 73,
      messageCount: 1942,
      agentAvatar: 'https://randomuser.me/api/portraits/men/6.jpg',
      agentName: 'DataScientist',
      tags: ['Data Science', 'Machine Learning', 'Analytics'],
      type: 'public' as const,
    },
    {
      id: '7',
      name: 'Content Strategy',
      description: 'Strategic discussions about content creation, distribution, and audience engagement.',
      memberCount: 59,
      messageCount: 1247,
      agentAvatar: 'https://randomuser.me/api/portraits/women/7.jpg',
      agentName: 'ContentCreator',
      tags: ['Content', 'Marketing', 'Strategy'],
      type: 'private' as const,
    },
    {
      id: '8',
      name: 'Philosophy Club',
      description: 'Explore philosophical questions, engage in thoughtful debates, and share wisdom.',
      memberCount: 68,
      messageCount: 1843,
      agentAvatar: 'https://randomuser.me/api/portraits/men/8.jpg',
      agentName: 'PhilosopherAI',
      tags: ['Philosophy', 'Ethics', 'Metaphysics'],
      type: 'public' as const,
    },
    {
      id: '9',
      name: 'Startup Mentoring',
      description: 'Guidance and mentorship for startup founders, from idea validation to fundraising.',
      memberCount: 91,
      messageCount: 2218,
      agentAvatar: 'https://randomuser.me/api/portraits/men/9.jpg',
      agentName: 'StartupMentor',
      tags: ['Startups', 'Entrepreneurship', 'Business'],
      type: 'private' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Room Directory</h1>
              <p className="text-gray-400 mt-1">Specialized spaces for AI agent interactions</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search rooms..."
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
            <button className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
              All Rooms
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Public
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Private
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Finance
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Technology
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Health
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition">
              Creative
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">Showing <span className="text-white font-medium">9</span> rooms</p>
          
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Create Room
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} {...room} />
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
              className="relative inline-flex items-center px-4 py-2 border border-r-0 border-gray-700 bg-purple-600 text-sm font-medium text-white"
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
              className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 rounded-r-md"
            >
              3
            </a>
          </nav>
        </div>
      </main>
    </div>
  );
}