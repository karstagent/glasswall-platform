import React from 'react';

type ActivityStatus = 'success' | 'warning' | 'error' | 'pending';

interface Activity {
  id: string;
  type: 'message' | 'registration' | 'room' | 'system' | 'payment';
  title: string;
  description: string;
  time: string;
  agent?: {
    name: string;
    avatar: string;
  };
  status: ActivityStatus;
}

interface ActivityStreamProps {
  activities: Activity[];
}

const ActivityStatusBadge: React.FC<{ status: ActivityStatus }> = ({ status }) => {
  const statusClasses = {
    success: 'bg-green-600/20 text-green-400',
    warning: 'bg-yellow-600/20 text-yellow-400',
    error: 'bg-red-600/20 text-red-400',
    pending: 'bg-blue-600/20 text-blue-400',
  };

  const statusIcons = {
    success: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
    pending: (
      <svg className="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
      </svg>
    ),
  };

  return (
    <div className={`flex items-center px-2 py-1 rounded-full ${statusClasses[status]}`}>
      {statusIcons[status]}
    </div>
  );
};

const ActivityTypeIcon: React.FC<{ type: Activity['type'] }> = ({ type }) => {
  const typeIcons = {
    message: (
      <div className="p-2 bg-blue-600/20 text-blue-400 rounded-full">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      </div>
    ),
    registration: (
      <div className="p-2 bg-green-600/20 text-green-400 rounded-full">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    ),
    room: (
      <div className="p-2 bg-purple-600/20 text-purple-400 rounded-full">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      </div>
    ),
    system: (
      <div className="p-2 bg-gray-600/20 text-gray-400 rounded-full">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z" />
        </svg>
      </div>
    ),
    payment: (
      <div className="p-2 bg-amber-600/20 text-amber-400 rounded-full">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
        </svg>
      </div>
    ),
  };

  return typeIcons[type] || null;
};

const ActivityStream: React.FC<ActivityStreamProps> = ({ activities }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white">Activity Timeline</h3>
      </div>
      
      <div className="divide-y divide-gray-700">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-700/30 transition">
            <div className="flex items-start">
              <ActivityTypeIcon type={activity.type} />
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                  <div className="flex items-center space-x-2">
                    <ActivityStatusBadge status={activity.status} />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-gray-400">{activity.description}</p>
                
                {activity.agent && (
                  <div className="mt-2 flex items-center">
                    <img 
                      src={activity.agent.avatar} 
                      alt={activity.agent.name}
                      className="w-6 h-6 rounded-full border border-gray-600"
                    />
                    <span className="ml-2 text-xs text-gray-500">{activity.agent.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-6 py-3 border-t border-gray-700 bg-gray-800/70">
        <button className="text-sm text-blue-400 hover:text-blue-300 transition">
          View all activity →
        </button>
      </div>
    </div>
  );
};

export default ActivityStream;