/**
 * WebSocket Service for GlassWall Platform
 * 
 * Handles real-time connections and updates
 */

export type WebSocketEventType = 'message_update' | 'room_update' | 'system_status' | 'user_activity';

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
  timestamp: number;
}

export type WebSocketEventCallback = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000; // Start with 2s delay
  private eventListeners: Map<WebSocketEventType, WebSocketEventCallback[]> = new Map();
  
  /**
   * Initialize WebSocket connection
   */
  public connect(url: string = '/api/ws'): void {
    if (this.socket) {
      this.disconnect();
    }
    
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      
      console.log('WebSocket: Connecting...');
    } catch (error) {
      console.error('WebSocket: Connection error', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      console.log('WebSocket: Disconnected');
    }
  }
  
  /**
   * Send message through WebSocket
   */
  public send(type: string, data: any): boolean {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket: Cannot send message - not connected');
      return false;
    }
    
    try {
      const message: WebSocketMessage = {
        type: type as WebSocketEventType,
        payload: data,
        timestamp: Date.now()
      };
      
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('WebSocket: Send error', error);
      return false;
    }
  }
  
  /**
   * Subscribe to event type
   */
  public on(eventType: WebSocketEventType, callback: WebSocketEventCallback): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    const callbacks = this.eventListeners.get(eventType);
    if (callbacks) {
      callbacks.push(callback);
    }
  }
  
  /**
   * Unsubscribe from event type
   */
  public off(eventType: WebSocketEventType, callback?: WebSocketEventCallback): void {
    if (!this.eventListeners.has(eventType)) {
      return;
    }
    
    if (!callback) {
      // Remove all callbacks for this event type
      this.eventListeners.delete(eventType);
      return;
    }
    
    const callbacks = this.eventListeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      
      if (callbacks.length === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    console.log('WebSocket: Connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Notify subscribers about connection
    this.notifyListeners('system_status', { status: 'connected' });
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket: Closed (${event.code} - ${event.reason})`);
    this.isConnected = false;
    
    // Notify subscribers about disconnection
    this.notifyListeners('system_status', { status: 'disconnected' });
    
    // Attempt to reconnect if not a deliberate close
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }
  
  /**
   * Handle WebSocket error
   */
  private handleError(event: Event): void {
    console.error('WebSocket: Error', event);
    
    // Notify subscribers about error
    this.notifyListeners('system_status', { status: 'error', event });
  }
  
  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Validate message format
      if (!message || !message.type || !message.payload) {
        console.error('WebSocket: Invalid message format', event.data);
        return;
      }
      
      // Notify subscribers
      this.notifyListeners(message.type, message.payload);
    } catch (error) {
      console.error('WebSocket: Message parsing error', error, event.data);
    }
  }
  
  /**
   * Schedule reconnect attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`WebSocket: Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    // Exponential backoff
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    
    console.log(`WebSocket: Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`WebSocket: Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  /**
   * Notify event listeners
   */
  private notifyListeners(eventType: WebSocketEventType, data: any): void {
    const callbacks = this.eventListeners.get(eventType) || [];
    
    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error('WebSocket: Error in event callback', error);
      }
    }
  }
}

// Create and export a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;