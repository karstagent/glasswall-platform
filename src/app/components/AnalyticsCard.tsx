import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  data?: DataPoint[];
  timeRange?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray';
  loading?: boolean;
}

export default function AnalyticsCard({
  title,
  value,
  trend,
  data,
  timeRange = 'Last 30 days',
  icon,
  color = 'blue',
  loading = false,
}: AnalyticsCardProps) {
  // Color mapping for different card styles
  const colorClasses = {
    blue: {
      bg: 'bg-blue-600/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      fill: 'from-blue-500/20 to-transparent',
    },
    green: {
      bg: 'bg-green-600/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      fill: 'from-green-500/20 to-transparent',
    },
    purple: {
      bg: 'bg-purple-600/20',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      fill: 'from-purple-500/20 to-transparent',
    },
    amber: {
      bg: 'bg-amber-600/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      fill: 'from-amber-500/20 to-transparent',
    },
    red: {
      bg: 'bg-red-600/20',
      border: 'border-red-500/30',
      text: 'text-red-400',
      fill: 'from-red-500/20 to-transparent',
    },
    gray: {
      bg: 'bg-gray-600/20',
      border: 'border-gray-500/30',
      text: 'text-gray-400',
      fill: 'from-gray-500/20 to-transparent',
    },
  };
  
  // Get color classes based on color prop
  const { bg, border, text, fill } = colorClasses[color];
  
  // Calculate the maximum value for the chart scaling
  const maxValue = data ? Math.max(...data.map(point => point.value)) : 0;
  
  return (
    <div className={`rounded-xl p-6 ${bg} backdrop-blur-lg border ${border}`}>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-gray-700 rounded mb-4"></div>
          <div className="h-8 w-20 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-700 rounded mb-6"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            
            {icon && (
              <div className={`p-2 rounded-full ${bg} ${text}`}>
                {icon}
              </div>
            )}
          </div>
          
          <div className="mb-1">
            <span className="text-3xl font-bold text-white">{value}</span>
            
            {trend && (
              <span 
                className={`ml-2 text-sm ${
                  trend.isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                {trend.label && <span className="ml-1 text-gray-500">{trend.label}</span>}
              </span>
            )}
          </div>
          
          <div className="mb-6">
            <span className="text-xs text-gray-500">{timeRange}</span>
          </div>
          
          {data && data.length > 0 && (
            <div className="relative h-24">
              {/* Gradient background for the chart */}
              <div 
                className={`absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t ${fill} rounded`}
                style={{ opacity: 0.5 }}
              ></div>
              
              <div className="relative h-full flex items-end justify-between">
                {data.map((point, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-end h-full"
                    style={{ width: `${100 / data.length}%` }}
                  >
                    {/* Bar */}
                    <div 
                      className={`w-2/3 ${text} rounded-t`}
                      style={{ 
                        height: `${maxValue ? (point.value / maxValue) * 100 : 0}%`,
                        minHeight: '4px',
                      }}
                    ></div>
                    
                    {/* Label (only show every 3rd label on mobile) */}
                    <div className="text-xs text-gray-500 mt-2 hidden sm:block">
                      {point.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 sm:hidden">
                      {index % 3 === 0 ? point.label : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}