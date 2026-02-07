/**
 * React Hook for WebSocket integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import webSocketService, { WebSocketEventType } from '../services/WebSocketService';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  url?: string;
}

interface UseWebSocketResult {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  send: (type: string, data: any) => boolean;
  lastMessage: any;
  subscribe: (eventType: WebSocketEventType, callback: (data: any) => void) => void;
  unsubscribe: (eventType: WebSocketEventType, callback?: (data: any) => void) => void;
}

export function useWebSocket(
  eventTypes: WebSocketEventType[] = [],
  options: UseWebSocketOptions = {}
): UseWebSocketResult {
  const { autoConnect = true, url = '/api/ws' } = options;
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  // Use a ref to store callbacks to avoid unnecessary re-renders
  const callbacksRef = useRef<Map<WebSocketEventType, Set<(data: any) => void>>>(new Map());
  
  // Handle connection status changes
  const handleStatusChange = useCallback((data: { status: string }) => {
    setIsConnected(data.status === 'connected');
  }, []);
  
  // Handle incoming messages
  const handleMessage = useCallback((eventType: WebSocketEventType, data: any) => {
    // Update last message state
    setLastMessage({ type: eventType, data, timestamp: Date.now() });
    
    // Call all registered callbacks for this event type
    const callbacks = callbacksRef.current.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket callback for ${eventType}:`, error);
        }
      });
    }
  }, []);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    webSocketService.connect(url);
  }, [url]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);
  
  // Send message through WebSocket
  const send = useCallback((type: string, data: any): boolean => {
    return webSocketService.send(type, data);
  }, []);
  
  // Subscribe to events
  const subscribe = useCallback((eventType: WebSocketEventType, callback: (data: any) => void) => {
    // Store callback in ref
    if (!callbacksRef.current.has(eventType)) {
      callbacksRef.current.set(eventType, new Set());
    }
    
    const callbacks = callbacksRef.current.get(eventType);
    if (callbacks) {
      callbacks.add(callback);
    }
    
    // Register service handler if this is the first callback for this event type
    const isFirstCallback = callbacks && callbacks.size === 1;
    if (isFirstCallback) {
      webSocketService.on(eventType, (data) => handleMessage(eventType, data));
    }
  }, [handleMessage]);
  
  // Unsubscribe from events
  const unsubscribe = useCallback((eventType: WebSocketEventType, callback?: (data: any) => void) => {
    if (!callbacksRef.current.has(eventType)) {
      return;
    }
    
    const callbacks = callbacksRef.current.get(eventType);
    if (!callbacks) {
      return;
    }
    
    if (callback) {
      callbacks.delete(callback);
    } else {
      callbacks.clear();
    }
    
    // If no more callbacks, unregister from service
    if (callbacks.size === 0) {
      webSocketService.off(eventType);
      callbacksRef.current.delete(eventType);
    }
  }, []);
  
  // Setup event listeners on mount
  useEffect(() => {
    // Always listen for system status events
    webSocketService.on('system_status', handleStatusChange);
    
    // Subscribe to all requested event types
    eventTypes.forEach(eventType => {
      webSocketService.on(eventType, (data) => handleMessage(eventType, data));
    });
    
    // Connect if auto-connect is enabled
    if (autoConnect) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      webSocketService.off('system_status');
      
      eventTypes.forEach(eventType => {
        webSocketService.off(eventType);
      });
      
      if (autoConnect) {
        // Don't disconnect on unmount if we didn't connect on mount
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, eventTypes, handleMessage, handleStatusChange]);
  
  return {
    isConnected,
    connect,
    disconnect,
    send,
    lastMessage,
    subscribe,
    unsubscribe
  };
}