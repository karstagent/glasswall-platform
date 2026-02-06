import { v4 as uuidv4 } from 'uuid';
import { Room, RoomSettings, RoomVisibility } from '@/types';
import messageQueueService from './messageQueueService';

class RoomService {
  private rooms: Map<string, Room> = new Map();
  private agentRooms: Map<string, string[]> = new Map();

  /**
   * Create a new room for an agent
   */
  public createRoom(
    agentId: string,
    name: string,
    description: string,
    visibility: RoomVisibility = RoomVisibility.PUBLIC,
    settings?: Partial<RoomSettings>
  ): Room {
    // Generate unique room ID
    const roomId = this.generateRoomId(name);
    
    // Default settings
    const defaultSettings: RoomSettings = {
      batchIntervalMinutes: 30,
      paidResponseTargetMinutes: 5,
      maxFreeMessagesPerUser: 50,
      allowAnonymous: false,
      ...settings
    };
    
    // Create room object
    const room: Room = {
      id: roomId,
      agentId,
      name,
      description,
      visibility,
      settings: defaultSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        totalMessages: 0,
        activeUsers: 0,
        averageResponseTime: 0
      }
    };
    
    // Store room
    this.rooms.set(roomId, room);
    
    // Add to agent's rooms
    if (!this.agentRooms.has(agentId)) {
      this.agentRooms.set(agentId, []);
    }
    this.agentRooms.get(agentId)!.push(roomId);
    
    // Initialize message queues
    messageQueueService.initializeQueue(
      roomId,
      defaultSettings.batchIntervalMinutes,
      defaultSettings.paidResponseTargetMinutes
    );
    
    return room;
  }

  /**
   * Generate a unique room ID based on name
   */
  private generateRoomId(name: string): string {
    const slug = this.generateSlug(name);
    const uniqueId = uuidv4().substring(0, 8);
    return `${slug}-${uniqueId}`;
  }

  /**
   * Generate a URL-friendly slug from room name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get a room by ID
   */
  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get all rooms for an agent
   */
  public getAgentRooms(agentId: string): Room[] {
    const roomIds = this.agentRooms.get(agentId) || [];
    return roomIds
      .map(id => this.rooms.get(id))
      .filter(room => room !== undefined) as Room[];
  }

  /**
   * Get all public rooms for discovery
   */
  public getPublicRooms(): Room[] {
    return Array.from(this.rooms.values())
      .filter(room => room.visibility === RoomVisibility.PUBLIC);
  }

  /**
   * Search rooms by name or description
   */
  public searchRooms(query: string, onlyPublic: boolean = true): Room[] {
    const normalizedQuery = query.toLowerCase();
    return Array.from(this.rooms.values())
      .filter(room => {
        // Filter by visibility if needed
        if (onlyPublic && room.visibility !== RoomVisibility.PUBLIC) {
          return false;
        }
        
        // Match name or description
        return (
          room.name.toLowerCase().includes(normalizedQuery) ||
          room.description.toLowerCase().includes(normalizedQuery)
        );
      });
  }

  /**
   * Update room settings
   */
  public updateRoomSettings(
    roomId: string,
    settings: Partial<RoomSettings>
  ): Room {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error(`Room not found: ${roomId}`);
    }
    
    // Update settings
    room.settings = {
      ...room.settings,
      ...settings
    };
    
    room.updatedAt = new Date().toISOString();
    
    // If batch interval changed, update queue service
    if (settings.batchIntervalMinutes !== undefined) {
      messageQueueService.updateBatchInterval(roomId, settings.batchIntervalMinutes);
    }
    
    return room;
  }

  /**
   * Update room details
   */
  public updateRoom(
    roomId: string,
    updates: Partial<Pick<Room, 'name' | 'description' | 'visibility'>>
  ): Room {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error(`Room not found: ${roomId}`);
    }
    
    // Update fields
    if (updates.name) room.name = updates.name;
    if (updates.description) room.description = updates.description;
    if (updates.visibility) room.visibility = updates.visibility;
    
    room.updatedAt = new Date().toISOString();
    
    return room;
  }

  /**
   * Delete a room
   */
  public deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return false;
    }
    
    // Remove from rooms map
    this.rooms.delete(roomId);
    
    // Remove from agent's rooms
    const agentRooms = this.agentRooms.get(room.agentId) || [];
    this.agentRooms.set(
      room.agentId,
      agentRooms.filter(id => id !== roomId)
    );
    
    // Clean up message queues
    messageQueueService.cleanupRoom(roomId);
    
    return true;
  }

  /**
   * Check if user has access to a room
   */
  public userHasAccess(userId: string, roomId: string): boolean {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return false;
    }
    
    // Public rooms are accessible to everyone
    if (room.visibility === RoomVisibility.PUBLIC) {
      return true;
    }
    
    // For private rooms, we would check access control list
    // This is a simplified version - in a real implementation,
    // we would check a database for access permissions
    return false;
  }

  /**
   * Update room metrics
   */
  public updateRoomMetrics(
    roomId: string,
    metrics: Partial<Room['metrics']>
  ): void {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return;
    }
    
    room.metrics = {
      ...room.metrics,
      ...metrics
    };
    
    room.updatedAt = new Date().toISOString();
  }

  /**
   * Get room URL
   */
  public getRoomUrl(roomId: string): string {
    return `https://glasswall.xyz/rooms/${roomId}`;
  }

  /**
   * Check if a room exists
   */
  public roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  /**
   * Set a webhook URL for a room
   */
  public setRoomWebhook(roomId: string, webhookUrl: string): void {
    if (!this.roomExists(roomId)) {
      throw new Error(`Room not found: ${roomId}`);
    }
    
    messageQueueService.setWebhookUrl(roomId, webhookUrl);
  }
}

// Export a singleton instance
export const roomService = new RoomService();
export default roomService;