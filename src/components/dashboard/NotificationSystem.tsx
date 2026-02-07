import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  const { isConnected, lastMessage } = useWebSocket(
    ['message_update', 'user_activity', 'system_status'],
    { autoConnect: true }
  );
  
  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
    
    // Update document title if there are unread notifications
    if (count > 0) {
      document.title = `(${count}) GlassWall Dashboard`;
    } else {
      document.title = 'GlassWall Dashboard';
    }
  }, [notifications]);
  
  // Process incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    
    const { type, data } = lastMessage;
    
    // Add notification based on message type
    switch (type) {
      case 'message_update':
        if (data.status === 'delivered') {
          addNotification({
            type: 'success',
            title: 'Message Delivered',
            message: `Your message to ${data.room || 'the room'} has been delivered.`
          });
        } else if (data.status === 'failed') {
          addNotification({
            type: 'error',
            title: 'Message Failed',
            message: `Failed to deliver your message to ${data.room || 'the room'}.`,
            action: {
              label: 'Retry',
              onClick: () => console.log('Retry message', data.id)
            }
          });
        }
        break;
        
      case 'user_activity':
        if (data.action === 'join') {
          addNotification({
            type: 'info',
            title: 'User Joined',
            message: `${data.user || 'A user'} has joined ${data.room || 'the room'}.`
          });
        }
        break;
        
      case 'system_status':
        if (data.status === 'warning') {
          addNotification({
            type: 'warning',
            title: 'System Warning',
            message: data.message || 'There is a system warning.'
          });
        } else if (data.status === 'error') {
          addNotification({
            type: 'error',
            title: 'System Error',
            message: data.message || 'There is a system error.'
          });
        }
        break;
    }
  }, [lastMessage]);
  
  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    setNotifications(prevNotifications => [
      {
        id,
        timestamp: Date.now(),
        read: false,
        ...notification
      },
      ...prevNotifications
    ]);
    
    // Auto-dismiss info and success notifications after 5 seconds
    if (notification.type === 'info' || notification.type === 'success') {
      setTimeout(() => {
        dismissNotification(id);
      }, 5000);
    }
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };
  
  // Dismiss a notification (remove it from the list)
  const dismissNotification = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Format timestamp to human-readable time
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get icon for notification type
  const getNotificationIcon = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'info':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
          </div>
        );
        
      case 'success':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          </div>
        );
        
      case 'warning':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
          </div>
        );
        
      case 'error':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          </div>
        );
    }
  };
  
  // Simulate notifications for development
  useEffect(() => {
    // Add some demo notifications
    setTimeout(() => {
      addNotification({
        type: 'info',
        title: 'Welcome to GlassWall',
        message: 'You can manage your notifications from this panel.'
      });
    }, 1000);
    
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Room Created',
        message: 'Room "Development" has been created successfully.'
      });
    }, 3000);
  }, []);
  
  return (
    <div className="relative">
      {/* Notification Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-800/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Notifications</h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {notifications.map(notification => (
                  <li
                    key={notification.id}
                    className={`p-4 ${notification.read ? 'bg-transparent' : 'bg-blue-900/10'}`}
                  >
                    <div className="flex space-x-4">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {notification.message}
                        </p>
                        
                        {notification.action && (
                          <div className="mt-2">
                            <button
                              onClick={() => {
                                notification.action?.onClick();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              {notification.action.label}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 flex items-center justify-between border-t border-gray-700">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-xs text-gray-400">
                {isConnected ? 'Connected to real-time updates' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}