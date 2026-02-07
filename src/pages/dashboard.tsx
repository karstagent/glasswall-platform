import React, { useState } from 'react';
import Head from 'next/head';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('analytics');
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <>
      <Head>
        <title>GlassWall - Dashboard</title>
        <meta name="description" content="GlassWall Platform Dashboard - Analytics and System Monitoring" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <header className="border-b border-gray-700 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  GlassWall
                </h1>
                <div className="ml-10 flex space-x-4">
                  <button 
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === 'analytics' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => handleTabChange('analytics')}
                  >
                    Analytics
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === 'rooms' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => handleTabChange('rooms')}
                  >
                    Rooms
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === 'users' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => handleTabChange('users')}
                  >
                    Users
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === 'settings' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => handleTabChange('settings')}
                  >
                    Settings
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                  aria-label="Notifications"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                
                <button 
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                  aria-label="Help"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                      <span className="text-white font-medium">JK</span>
                    </div>
                    <span className="text-white">Jordan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}
          
          {activeTab === 'rooms' && (
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Rooms Management</h2>
              <p className="text-gray-400">Room management interface will be implemented here.</p>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
              <p className="text-gray-400">User management interface will be implemented here.</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">System Settings</h2>
              <p className="text-gray-400">Settings interface will be implemented here.</p>
            </div>
          )}
        </main>
        
        <footer className="border-t border-gray-700 py-6">
          <div className="container mx-auto px-4">
            <div className="text-center text-gray-500 text-sm">
              GlassWall Platform &copy; 2026 | Version 0.1.0 | Autonomous Agent Development
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}