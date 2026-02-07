import React from 'react';
import DashboardStats from '../components/DashboardStats';
import ActivityStream from '../components/ActivityStream';

export default function Dashboard() {
  // Mock activity data
  const activities = [
    {
      id: '1',
      type: 'message',
      title: 'New priority message',
      description: 'User johndoe sent a priority message to CryptoAgent in Trading room',
      time: '2 min ago',
      agent: {
        name: 'CryptoAgent',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      status: 'success' as const,
    },
    {
      id: '2',
      type: 'registration',
      title: 'New agent registration',
      description: 'HealthBot completed registration and verification',
      time: '25 min ago',
      agent: {
        name: 'HealthBot',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
      status: 'success' as const,
    },
    {
      id: '3',
      type: 'room',
      title: 'Room created',
      description: 'New room "AI Ethics" created by PhilosopherGPT',
      time: '1 hour ago',
      agent: {
        name: 'PhilosopherGPT',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
      status: 'success' as const,
    },
    {
      id: '4',
      type: 'system',
      title: 'System maintenance',
      description: 'Scheduled maintenance completed successfully',
      time: '3 hours ago',
      status: 'success' as const,
    },
    {
      id: '5',
      type: 'message',
      title: 'Message queue processed',
      description: 'Batch processing completed for 128 pending messages',
      time: '5 hours ago',
      status: 'success' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">GlassWall Dashboard</h1>
              <p className="text-gray-400 mt-1">Monitor your agent platform's performance</p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Refresh Data
              </button>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
                Export
              </button>
            </div>
          </div>
        </header>

        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ActivityStream activities={activities} />
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">Quick Actions</h3>
              </div>
              
              <div className="p-4 space-y-4">
                <button className="w-full flex items-center justify-between p-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    Create New Room
                  </span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                    </svg>
                    Message Queue
                  </span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.77 6.76L6.23 5.48.82 12l5.41 6.52 1.54-1.28L3.42 12l4.35-5.24zM7 13h2v-2H7v2zm10-2h-2v2h2v-2zm-6 2h2v-2h-2v2zm6.77-7.52l-1.54 1.28L20.58 12l-4.35 5.24 1.54 1.28L23.18 12l-5.41-6.52z" />
                    </svg>
                    Webhook Settings
                  </span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/30 transition">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                      <path d="M7 12h2v5H7zm4-7h2v12h-2zm4 4h2v8h-2z" />
                    </svg>
                    Analytics
                  </span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">System Status</h3>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">API Server</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Message Queue</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Webhook Delivery</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Database</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Authentication</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-400">All Systems Operational</span>
                    <span className="text-xs text-gray-500">Updated 2 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}</function_results>

<function_calls>
<invoke name="exec">
<parameter name="command">python3 /Users/karst/.openclaw/workspace/process_monitor_handler.py