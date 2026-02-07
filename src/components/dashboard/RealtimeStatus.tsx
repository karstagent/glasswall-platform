import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface SystemStatusProps {
  className?: string;
}

export default function RealtimeStatus({ className = '' }: SystemStatusProps) {
  const [systemStatus, setSystemStatus] = useState<{
    queueStatus: 'normal' | 'busy' | 'overloaded';
    activeUsers: number;
    messagesPerMinute: number;
    lastUpdated: Date | null;
  }>({
    queueStatus: 'normal',
    activeUsers: 0,
    messagesPerMinute: 0,
    lastUpdated: null
  });
  
  const { isConnected, lastMessage } = useWebSocket(
    ['system_status', 'user_activity', 'message_update'],
    { autoConnect: true }
  );
  
  // Update status based on WebSocket messages
  useEffect(() => {
    if (!lastMessage) {
      return;
    }
    
    const { type, data } = lastMessage;
    
    switch (type) {
      case 'system_status':
        if (data.queueStatus) {
          setSystemStatus(prev => ({
            ...prev,
            queueStatus: data.queueStatus,
            lastUpdated: new Date()
          }));
        }
        break;
        
      case 'user_activity':
        if (data.activeUsers !== undefined) {
          setSystemStatus(prev => ({
            ...prev,
            activeUsers: data.activeUsers,
            lastUpdated: new Date()
          }));
        }
        break;
        
      case 'message_update':
        if (data.messagesPerMinute !== undefined) {
          setSystemStatus(prev => ({
            ...prev,
            messagesPerMinute: data.messagesPerMinute,
            lastUpdated: new Date()
          }));
        }
        break;
    }
  }, [lastMessage]);
  
  // Format timestamp
  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Never';
    
    return date.toLocaleTimeString();
  };
  
  // Get status indicator color
  const getStatusColor = () => {
    if (!isConnected) return 'bg-gray-500';
    
    switch (systemStatus.queueStatus) {
      case 'normal': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'overloaded': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  // Get queue status text
  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    
    switch (systemStatus.queueStatus) {
      case 'normal': return 'Normal';
      case 'busy': return 'Busy';
      case 'overloaded': return 'Overloaded';
      default: return 'Unknown';
    }
  };
  
  return (
    <div className={`bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-4 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-3">Realtime System Status</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm text-white">Queue Status:</span>
          </div>
          <span className="text-sm font-medium text-white">{getStatusText()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">Active Users:</span>
          <span className="text-sm font-medium text-white">{systemStatus.activeUsers}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">Messages/min:</span>
          <span className="text-sm font-medium text-white">{systemStatus.messagesPerMinute}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Last Updated:</span>
          <span className="text-sm text-gray-400">{formatTimestamp(systemStatus.lastUpdated)}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-400">WebSocket:</span>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
}