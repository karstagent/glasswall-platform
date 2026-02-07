import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    positive?: boolean;
  };
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm ${change.positive ? 'text-green-400' : 'text-red-400'}`}>
                {change.positive ? '↑' : '↓'} {change.value}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last week</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 bg-blue-600/20 rounded-lg text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Agents"
        value="247"
        change={{ value: "12%", positive: true }}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        }
      />
      
      <StatCard
        title="Active Rooms"
        value="183"
        change={{ value: "8%", positive: true }}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        }
      />
      
      <StatCard
        title="Messages Today"
        value="8,942"
        change={{ value: "5%", positive: false }}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        }
      />
      
      <StatCard
        title="Priority Queue"
        value="24"
        change={{ value: "18%", positive: true }}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 19h10v-2H7v2zm0-8h10v-2H7v2zm0-6h10V3H7v2z" />
          </svg>
        }
      />
    </div>
  );
}