import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, 
  Cell, BarChart, Bar
} from 'recharts';

type Analytics = {
  messageStats: {
    total: number;
    byTier: {
      free: number;
      paid: number;
    };
    byStatus: {
      queued: number;
      processing: number;
      delivered: number;
      failed: number;
    };
  };
  roomStats: {
    totalRooms: number;
    activeRooms: number;
    messagesByRoom: Array<{
      roomId: string;
      roomName: string;
      messageCount: number;
    }>;
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
  };
  timeSeriesData: Array<{
    timestamp: string;
    messageCount: number;
    activeUsers: number;
    averageProcessingTime: number;
  }>;
  performanceMetrics: {
    averageQueueTime: number;
    averageProcessingTime: number;
    systemLoad: number;
  };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAnalytics();
    
    // Set up polling for regular updates
    const intervalId = setInterval(fetchAnalytics, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [timeRange]);
  
  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simulated data for development
  const simulatedData = {
    messageStats: {
      total: 1243,
      byTier: {
        free: 876,
        paid: 367,
      },
      byStatus: {
        queued: 45,
        processing: 12,
        delivered: 1156,
        failed: 30,
      },
    },
    roomStats: {
      totalRooms: 28,
      activeRooms: 16,
      messagesByRoom: [
        { roomId: '1', roomName: 'General', messageCount: 345 },
        { roomId: '2', roomName: 'Support', messageCount: 289 },
        { roomId: '3', roomName: 'Development', messageCount: 214 },
        { roomId: '4', roomName: 'Marketing', messageCount: 178 },
        { roomId: '5', roomName: 'Sales', messageCount: 124 },
      ],
    },
    userStats: {
      totalUsers: 218,
      activeUsers: 76,
      newUsersToday: 12,
    },
    timeSeriesData: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      messageCount: Math.floor(Math.random() * 50) + 20,
      activeUsers: Math.floor(Math.random() * 25) + 10,
      averageProcessingTime: Math.random() * 2 + 0.5,
    })),
    performanceMetrics: {
      averageQueueTime: 2.3,
      averageProcessingTime: 1.2,
      systemLoad: 0.42,
    },
  };
  
  const data = analytics || simulatedData;
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return timestamp;
  };
  
  // Format time values (seconds)
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs.toFixed(0)}s`;
    }
  };
  
  // Prepare data for pie chart
  const statusData = [
    { name: 'Queued', value: data.messageStats.byStatus.queued },
    { name: 'Processing', value: data.messageStats.byStatus.processing },
    { name: 'Delivered', value: data.messageStats.byStatus.delivered },
    { name: 'Failed', value: data.messageStats.byStatus.failed },
  ];
  
  const tierData = [
    { name: 'Free', value: data.messageStats.byTier.free },
    { name: 'Paid', value: data.messageStats.byTier.paid },
  ];
  
  if (isLoading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-800/30 border border-red-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-2">Error Loading Analytics</h3>
        <p>{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
        
        <div className="flex rounded-lg overflow-hidden">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-4 py-2 ${
              timeRange === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Month
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
          <h3 className="text-gray-400 mb-2">Total Messages</h3>
          <div className="text-3xl font-bold text-white">{data.messageStats.total.toLocaleString()}</div>
          <div className="mt-2 text-sm flex justify-between">
            <span className="text-blue-400">{data.messageStats.byTier.free} Free</span>
            <span className="text-purple-400">{data.messageStats.byTier.paid} Priority</span>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
          <h3 className="text-gray-400 mb-2">Active Users</h3>
          <div className="text-3xl font-bold text-white">{data.userStats.activeUsers}</div>
          <div className="mt-2 text-sm text-green-400">+{data.userStats.newUsersToday} today</div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
          <h3 className="text-gray-400 mb-2">Average Processing</h3>
          <div className="text-3xl font-bold text-white">
            {formatTime(data.performanceMetrics.averageProcessingTime)}
          </div>
          <div className="mt-2 text-sm text-gray-400">
            System Load: {(data.performanceMetrics.systemLoad * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Message Activity Chart */}
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Message Activity</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.timeSeriesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fill: '#aaa' }}
                tickFormatter={formatTimestamp}
              />
              <YAxis tick={{ fill: '#aaa' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#222', 
                  borderColor: '#555',
                  color: '#fff'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="messageCount" 
                name="Messages" 
                stroke="#0088FE" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                name="Active Users" 
                stroke="#00C49F" 
              />
              <Line 
                type="monotone" 
                dataKey="averageProcessingTime" 
                name="Avg. Processing Time (s)" 
                stroke="#FFBB28" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Status Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Message Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#222', 
                    borderColor: '#555',
                    color: '#fff'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top Rooms */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Rooms</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.roomStats.messagesByRoom}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="roomName" 
                  tick={{ fill: '#aaa' }}
                />
                <YAxis tick={{ fill: '#aaa' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#222', 
                    borderColor: '#555',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="messageCount" name="Messages" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-400">
              {formatTime(data.performanceMetrics.averageQueueTime)}
            </div>
            <div className="mt-2 text-gray-300">Average Queue Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400">
              {formatTime(data.performanceMetrics.averageProcessingTime)}
            </div>
            <div className="mt-2 text-gray-300">Average Processing Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-400">
              {(data.performanceMetrics.systemLoad * 100).toFixed(1)}%
            </div>
            <div className="mt-2 text-gray-300">System Load</div>
          </div>
        </div>
      </div>
    </div>
  );
}