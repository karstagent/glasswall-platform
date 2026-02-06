import { Room, RoomSettings, RoomVisibility } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo purposes
// In production, this would use a database
const rooms: Record<string, Room> = {};
const userRoomAccess: Record<string, string[]> = {}; // userId -> roomIds

// Default room settings
const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  batchIntervalMinutes: 30,
  paidResponseTargetMinutes: 2,
  maxFreeMessagesPerUser: 20,
  welcomeMessage: 'Welcome to this room! Please follow the community guidelines.',
  allowAnonymous: false
};

export const roomService = {
  /**
   * Create a new room
   */
  createRoom(
    agentId: string,
    name: string,
    description: string,
    visibility: RoomVisibility = RoomVisibility.PUBLIC,
    settings: Partial<RoomSettings> = {}
  ): Room {
    const roomId = uuidv4();
    const now = new Date().toISOString();
    
    const room: Room = {
      id: roomId,
      agentId,
      name,
      description,
      visibility,
      settings: {
        ...DEFAULT_ROOM_SETTINGS,
        ...settings
      },
      createdAt: now,
      updatedAt: now,
      metrics: {
        totalMessages: 0,
        activeUsers: 0,
        averageResponseTime: 0
      }
    };
    
    // Store the room
    rooms[roomId] = room;
    
    return room;
  },
  
  /**
   * Update an existing room
   */
  updateRoom(
    roomId: string,
    updates: Partial<Room>
  ): Room {
    const room = this.getRoom(roomId);
    
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }
    
    // Update the room properties
    const updatedRoom = {
      ...room,
      ...updates,
      settings: updates.settings
        ? { ...room.settings, ...updates.settings }
        : room.settings,
      updatedAt: new Date().toISOString()
    };
    
    // Store the updated room
    rooms[roomId] = updatedRoom;
    
    return updatedRoom;
  },
  
  /**
   * Delete a room
   */
  deleteRoom(roomId: string): boolean {
    const room = rooms[roomId];
    
    if (!room) {
      return false;
    }
    
    // Remove the room
    delete rooms[roomId];
    
    // Remove access entries for this room
    for (const userId in userRoomAccess) {
      userRoomAccess[userId] = userRoomAccess[userId].filter(id => id !== roomId);
    }
    
    return true;
  },
  
  /**
   * Get a room by ID
   */
  getRoom(roomId: string): Room | null {
    return rooms[roomId] || null;
  },
  
  /**
   * Check if a room exists
   */
  roomExists(roomId: string): boolean {
    return !!rooms[roomId];
  },
  
  /**
   * List all public rooms
   */
  listPublicRooms(): Room[] {
    return Object.values(rooms).filter(
      room => room.visibility === RoomVisibility.PUBLIC
    );
  },
  
  /**
   * List rooms owned by an agent
   */
  listAgentRooms(agentId: string): Room[] {
    return Object.values(rooms).filter(
      room => room.agentId === agentId
    );
  },
  
  /**
   * List rooms accessible by a user
   */
  listUserRooms(userId: string): Room[] {
    // Get room IDs the user has access to
    const roomIds = userRoomAccess[userId] || [];
    
    // Get public rooms
    const publicRooms = this.listPublicRooms();
    
    // Get private rooms the user has access to
    const privateRooms = roomIds
      .map(id => rooms[id])
      .filter(room => room && room.visibility === RoomVisibility.PRIVATE);
    
    // Combine and deduplicate
    const allRooms = [...publicRooms, ...privateRooms];
    const uniqueRooms = allRooms.reduce((acc, room) => {
      if (!acc.find(r => r.id === room.id)) {
        acc.push(room);
      }
      return acc;
    }, [] as Room[]);
    
    return uniqueRooms;
  },
  
  /**
   * Grant user access to a room
   */
  grantAccess(userId: string, roomId: string): boolean {
    const room = rooms[roomId];
    
    if (!room) {
      return false;
    }
    
    // If the room is public, no need to grant explicit access
    if (room.visibility === RoomVisibility.PUBLIC) {
      return true;
    }
    
    // Initialize user's room access array if needed
    if (!userRoomAccess[userId]) {
      userRoomAccess[userId] = [];
    }
    
    // Add room to user's access list if not already there
    if (!userRoomAccess[userId].includes(roomId)) {
      userRoomAccess[userId].push(roomId);
    }
    
    return true;
  },
  
  /**
   * Revoke user access to a room
   */
  revokeAccess(userId: string, roomId: string): boolean {
    if (!userRoomAccess[userId]) {
      return false;
    }
    
    const initialLength = userRoomAccess[userId].length;
    userRoomAccess[userId] = userRoomAccess[userId].filter(id => id !== roomId);
    
    return userRoomAccess[userId].length < initialLength;
  },
  
  /**
   * Check if a user has access to a room
   */
  userHasAccess(userId: string, roomId: string): boolean {
    const room = rooms[roomId];
    
    if (!room) {
      return false;
    }
    
    // Public rooms are accessible to all
    if (room.visibility === RoomVisibility.PUBLIC) {
      return true;
    }
    
    // For private rooms, check access list
    return userRoomAccess[userId]?.includes(roomId) || false;
  },
  
  /**
   * Update room metrics
   */
  updateRoomMetrics(
    roomId: string,
    metrics: Partial<Room['metrics']>
  ): boolean {
    const room = rooms[roomId];
    
    if (!room) {
      return false;
    }
    
    room.metrics = {
      ...room.metrics,
      ...metrics
    };
    
    room.updatedAt = new Date().toISOString();
    
    return true;
  }
};