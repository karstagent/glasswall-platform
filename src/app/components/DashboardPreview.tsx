import React from 'react';

const DashboardPreview = () => {
  return (
    <div className="glass p-6 rounded-xl w-full max-w-6xl mx-auto mb-12 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 bg-gray-900/30 rounded-lg p-4">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Agent Dashboard</p>
              <p className="text-xs text-gray-400">@YourAgentName</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {['Overview', 'Messages', 'Stats', 'Settings'].map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center px-3 py-2 text-sm rounded-md ${i === 0 
                  ? 'bg-indigo-500/30 text-white' 
                  : 'text-gray-300 hover:bg-indigo-500/20'}`}
              >
                {item}
              </div>
            ))}
          </nav>
          
          <div className="mt-6 pt-6 border-t border-gray-700/30">
            <p className="text-xs text-gray-400 mb-2">Resource Usage</p>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Messages</span>
                <span className="text-gray-300">78% (234/300)</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">API Calls</span>
                <span className="text-gray-300">42% (126/300)</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Messages', value: '1,234', change: '+12%' },
              { label: 'Active Users', value: '287', change: '+5%' },
              { label: 'Response Rate', value: '98.7%', change: '+0.5%' }
            ].map((stat, i) => (
              <div key={i} className="bg-gray-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-emerald-400">{stat.change} from last week</p>
              </div>
            ))}
          </div>
          
          {/* Message Queue */}
          <div className="bg-gray-900/20 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Message Queue</h3>
              <div className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full">
                12 pending messages
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { user: 'Sarah K.', msg: 'Can you help me with...', time: '2m ago', priority: 'high' },
                { user: 'John D.', msg: 'Thanks for the analysis!', time: '15m ago', priority: 'medium' },
                { user: 'Alex M.', msg: 'When will the report be...', time: '32m ago', priority: 'low' }
              ].map((msg, i) => (
                <div key={i} className="bg-gray-800/30 rounded-md p-3 flex justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-600"></div>
                      <p className="ml-2 text-sm font-medium text-white">{msg.user}</p>
                      <span className="ml-2 text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 truncate">{msg.msg}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full self-start ${
                    msg.priority === 'high' 
                      ? 'bg-red-500/20 text-red-300' 
                      : msg.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {msg.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Analytics Chart (mockup) */}
          <div className="bg-gray-900/20 rounded-lg p-4 h-64 flex flex-col">
            <h3 className="text-lg font-medium text-white mb-4">Usage Analytics</h3>
            
            <div className="flex-1 relative">
              {/* Mock chart bars */}
              <div className="absolute bottom-0 inset-x-0 flex items-end justify-between h-40 px-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="w-1/8">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-sm"
                      style={{ 
                        height: `${(Math.sin(i / 2) * 0.3 + 0.5) * 100}%`,
                        opacity: 0.7
                      }}
                    ></div>
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 py-2">
                <div>100</div>
                <div>75</div>
                <div>50</div>
                <div>25</div>
                <div>0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;