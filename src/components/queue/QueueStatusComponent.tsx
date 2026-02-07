import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar 
} from 'recharts';

interface QueueMetrics {
  queueName: string;
  messageCount: number;
  processingRate: number;
  averageProcessingTime: number;
  errorRate: number;
  oldestMessage: number; // Age in seconds
  status: 'healthy' | 'warning' | 'critical';
}

interface QueueHistoryPoint {
  timestamp: string;
  messageCount: number;
  processingRate: number;
  errorRate: number;
}

interface QueueStatusComponentProps {
  selectedQueue?: string;
  refreshInterval?: number; // in ms
}

export default function QueueStatusComponent({ 
  selectedQueue,
  refreshInterval = 10000 
}: QueueStatusComponentProps) {
  const [queueMetrics, setQueueMetrics] = useState<QueueMetrics[]>([]);
  const [queueHistory, setQueueHistory] = useState<Record<string, QueueHistoryPoint[]>>({});
  const [selectedQueueName, setSelectedQueueName] = useState<string | undefined>(selectedQueue);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'hour' | 'day' | 'week'>('hour');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // WebSocket for real-time updates
  const { isConnected, lastMessage } = useWebSocket(['queue_update'], {
    autoConnect: true
  });
  
  // Fetch initial queue metrics
  useEffect(() => {
    fetchQueueMetrics();
    const interval = setInterval(fetchQueueMetrics, refreshInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [refreshInterval]);
  
  // Fetch queue history when selected queue or timeframe changes
  useEffect(() => {
    if (selectedQueueName) {
      fetchQueueHistory(selectedQueueName, selectedTimeframe);
    }
  }, [selectedQueueName, selectedTimeframe]);
  
  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'queue_update') {
      const { queueName, metrics } = lastMessage.data;
      
      // Update the metrics for this queue
      setQueueMetrics(prevMetrics => 
        prevMetrics.map(queue => 
          queue.queueName === queueName ? { ...queue, ...metrics } : queue
        )
      );
      
      // Update history data if we're tracking this queue
      if (queueHistory[queueName]) {
        const newPoint: QueueHistoryPoint = {
          timestamp: new Date().toISOString(),
          messageCount: metrics.messageCount || 0,
          processingRate: metrics.processingRate || 0,
          errorRate: metrics.errorRate || 0
        };
        
        setQueueHistory(prev => ({
          ...prev,
          [queueName]: [...(prev[queueName] || []), newPoint].slice(-60) // Keep last 60 points
        }));
      }
    }
  }, [lastMessage]);
  
  // Auto-select first queue if none selected
  useEffect(() => {
    if (queueMetrics.length > 0 && !selectedQueueName) {
      setSelectedQueueName(queueMetrics[0].queueName);
    }
  }, [queueMetrics, selectedQueueName]);
  
  const fetchQueueMetrics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For demo, use sample data
      // In production, would call API: const response = await fetch('/api/queue/metrics');
      
      setTimeout(() => {
        const sampleQueueMetrics: QueueMetrics[] = [
          {
            queueName: 'message-ingress',
            messageCount: 145,
            processingRate: 32.5,
            averageProcessingTime: 0.28,
            errorRate: 0.2,
            oldestMessage: 12,
            status: 'healthy'
          },
          {
            queueName: 'notification-delivery',
            messageCount: 78,
            processingRate: 18.7,
            averageProcessingTime: 0.42,
            errorRate: 0.8,
            oldestMessage: 45,
            status: 'healthy'
          },
          {
            queueName: 'background-tasks',
            messageCount: 1250,
            processingRate: 15.3,
            averageProcessingTime: 2.1,
            errorRate: 3.2,
            oldestMessage: 450,
            status: 'warning'
          },
          {
            queueName: 'webhook-delivery',
            messageCount: 56,
            processingRate: 8.4,
            averageProcessingTime: 1.8,
            errorRate: 5.6,
            oldestMessage: 180,
            status: 'healthy'
          }
        ];
        
        setQueueMetrics(sampleQueueMetrics);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching queue metrics:', err);
      setError('Failed to fetch queue metrics. Please try again.');
      setIsLoading(false);
    }
  };
  
  const fetchQueueHistory = async (queueName: string, timeframe: 'hour' | 'day' | 'week') => {
    try {
      // For demo, use sample data
      // In production, would call API: const response = await fetch(`/api/queue/history/${queueName}?timeframe=${timeframe}`);
      
      // Generate sample data - 60 points for the selected timeframe
      const points = 60;
      const interval = timeframe === 'hour' ? 60 : timeframe === 'day' ? 24 * 60 : 7 * 24 * 60; // in seconds
      const intervalPerPoint = interval / points;
      
      const now = new Date();
      const sampleHistory: QueueHistoryPoint[] = Array.from({ length: points }, (_, i) => {
        const timestamp = new Date(now.getTime() - (points - i) * intervalPerPoint * 1000);
        
        // Create some patterns in the data
        const baseCount = queueName === 'message-ingress' ? 120 : 
                         queueName === 'notification-delivery' ? 70 :
                         queueName === 'background-tasks' ? 1100 : 45;
                         
        const variation = Math.sin((i / points) * Math.PI * 2) * 30 + Math.random() * 20;
        
        return {
          timestamp: timestamp.toISOString(),
          messageCount: Math.max(0, Math.round(baseCount + variation)),
          processingRate: Math.max(0, queueName === 'background-tasks' ? 
                                 10 + Math.random() * 10 : 
                                 25 + Math.random() * 15),
          errorRate: Math.max(0, queueName === 'webhook-delivery' ? 
                           3 + Math.random() * 5 : 
                           0.1 + Math.random() * 1.5)
        };
      });
      
      setQueueHistory(prev => ({
        ...prev,
        [queueName]: sampleHistory
      }));
    } catch (err) {
      console.error(`Error fetching history for queue ${queueName}:`, err);
      setError(`Failed to fetch history for ${queueName}. Please try again.`);
    }
  };
  
  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 text-green-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  const formatTimestamp = (timestamp: string, timeframe: 'hour' | 'day' | 'week'): string => {
    const date = new Date(timestamp);
    
    if (timeframe === 'hour') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === 'day') {
      return `${date.getHours()}:00`;
    } else {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
  };
  
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
      return `${(seconds / 60).toFixed(1)}m`;
    } else {
      return `${(seconds / 3600).toFixed(1)}h`;
    }
  };
  
  // Get the selected queue's history data
  const selectedQueueHistoryData = selectedQueueName ? queueHistory[selectedQueueName] || [] : [];
  
  // Find the selected queue's metrics
  const selectedQueueMetric = queueMetrics.find(q => q.queueName === selectedQueueName);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Message Queue Status</h1>
        <p className="text-gray-400">
          Monitor queue performance, message counts, and processing rates.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-800/30 border border-red-600 rounded-lg p-4 text-white">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {queueMetrics.map(queue => (
          <div 
            key={queue.queueName}
            className={`bg-gray-800/50 backdrop-blur-lg border ${
              selectedQueueName === queue.queueName 
                ? 'border-blue-500' 
                : 'border-gray-700'
            } rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors`}
            onClick={() => setSelectedQueueName(queue.queueName)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-white">{queue.queueName}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(queue.status)}`}>
                {queue.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Messages</span>
                <span className="text-white font-medium">{queue.messageCount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Processing</span>
                <span className="text-white font-medium">{queue.processingRate.toFixed(1)}/sec</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Error rate</span>
                <span className={`font-medium ${
                  queue.errorRate > 5 ? 'text-red-400' :
                  queue.errorRate > 1 ? 'text-yellow-400' : 'text-green-400'
                }`}>{queue.errorRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Oldest</span>
                <span className={`font-medium ${
                  queue.oldestMessage > 300 ? 'text-red-400' :
                  queue.oldestMessage > 60 ? 'text-yellow-400' : 'text-white'
                }`}>{formatTime(queue.oldestMessage)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              {selectedQueueName ? `${selectedQueueName} Details` : 'Queue Details'}
            </h2>
            
            {selectedQueueMetric && (
              <p className="text-gray-400 mt-1">
                Processing {selectedQueueMetric.processingRate.toFixed(1)} messages/sec with {selectedQueueMetric.errorRate.toFixed(1)}% errors
              </p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${
                selectedTimeframe === 'hour' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedTimeframe('hour')}
            >
              1H
            </button>
            <button
              className={`px-3 py-1 rounded ${
                selectedTimeframe === 'day' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedTimeframe('day')}
            >
              24H
            </button>
            <button
              className={`px-3 py-1 rounded ${
                selectedTimeframe === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedTimeframe('week')}
            >
              7D
            </button>
          </div>
        </div>
        
        {selectedQueueName ? (
          <div className="space-y-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedQueueHistoryData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(timestamp) => formatTimestamp(timestamp, selectedTimeframe)}
                    tick={{ fill: '#aaa' }}
                  />
                  <YAxis tick={{ fill: '#aaa' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#222', 
                      borderColor: '#555',
                      color: '#fff'
                    }}
                    labelFormatter={timestamp => new Date(timestamp).toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="messageCount" 
                    name="Message Count" 
                    stroke="#0088FE" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="processingRate" 
                    name="Processing Rate (/sec)" 
                    stroke="#00C49F" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="errorRate" 
                    name="Error Rate (%)" 
                    stroke="#FF8042" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-2">Queue Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type</span>
                    <span className="text-white">
                      {selectedQueueName.includes('webhook') ? 'External Delivery' :
                       selectedQueueName.includes('notification') ? 'Notification' :
                       selectedQueueName.includes('background') ? 'Background Task' : 'Message Processing'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Replicas</span>
                    <span className="text-white">
                      {selectedQueueName.includes('webhook') ? '2' :
                       selectedQueueName.includes('notification') ? '2' :
                       selectedQueueName.includes('background') ? '3' : '5'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Consumer Groups</span>
                    <span className="text-white">
                      {selectedQueueName.includes('webhook') ? '1' :
                       selectedQueueName.includes('notification') ? '2' :
                       selectedQueueName.includes('background') ? '3' : '4'}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedQueueMetric && (
                <>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm text-gray-400 mb-2">Processing</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg. Time</span>
                        <span className="text-white">{selectedQueueMetric.averageProcessingTime.toFixed(2)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rate</span>
                        <span className="text-white">{selectedQueueMetric.processingRate.toFixed(1)}/sec</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Capacity</span>
                        <span className="text-white">
                          {Math.round(selectedQueueMetric.processingRate * 3600).toLocaleString()}/hour
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm text-gray-400 mb-2">Current Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Messages</span>
                        <span className="text-white">{selectedQueueMetric.messageCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Error Rate</span>
                        <span className={`${
                          selectedQueueMetric.errorRate > 5 ? 'text-red-400' :
                          selectedQueueMetric.errorRate > 1 ? 'text-yellow-400' : 'text-green-400'
                        }`}>{selectedQueueMetric.errorRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Oldest Message</span>
                        <span className={`${
                          selectedQueueMetric.oldestMessage > 300 ? 'text-red-400' :
                          selectedQueueMetric.oldestMessage > 60 ? 'text-yellow-400' : 'text-white'
                        }`}>{formatTime(selectedQueueMetric.oldestMessage)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-2">Message Distribution by Type</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Standard', value: selectedQueueName.includes('background') ? 850 : 95 },
                        { name: 'Priority', value: selectedQueueName.includes('background') ? 250 : 30 },
                        { name: 'Retry', value: selectedQueueName.includes('background') ? 120 : selectedQueueName.includes('webhook') ? 20 : 5 },
                        { name: 'Delayed', value: selectedQueueName.includes('background') ? 30 : selectedQueueName.includes('notification') ? 15 : 0 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" tick={{ fill: '#aaa' }} />
                      <YAxis tick={{ fill: '#aaa' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#222', 
                          borderColor: '#555',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="value" name="Count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-2">Error Types</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: 'Network', 
                          value: selectedQueueName.includes('webhook') ? 3.2 : 
                                selectedQueueName.includes('notification') ? 0.8 : 0.2 
                        },
                        { 
                          name: 'Timeout', 
                          value: selectedQueueName.includes('background') ? 1.8 : 0.5 
                        },
                        { 
                          name: 'Auth', 
                          value: selectedQueueName.includes('webhook') ? 0.9 : 
                                selectedQueueName.includes('notification') ? 0.3 : 0.1 
                        },
                        { 
                          name: 'Validation', 
                          value: 0.4 
                        }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" tick={{ fill: '#aaa' }} />
                      <YAxis tick={{ fill: '#aaa' }} unit="%" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#222', 
                          borderColor: '#555',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="value" name="Error Rate (%)" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={fetchQueueMetrics}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Select a queue to view detailed statistics
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">
            {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
          </span>
        </div>
        
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}