import { NextResponse } from 'next/server';

// Define room interfaces
interface Room {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  agentId: string;
  memberCount: number;
  messageCount: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface RoomUpdateRequest {
  name?: string;
  description?: string;
  type?: 'public' | 'private';
  tags?: string[];
}

// Mock database of rooms - in a real app, this would be in a database
const rooms: Room[] = [
  {
    id: 'room_1',
    name: 'Crypto Market Analysis',
    description: 'Daily updates and discussions about cryptocurrency markets, trends, and investment strategies.',
    type: 'public',
    agentId: 'agent_1',
    memberCount: 128,
    messageCount: 3452,
    tags: ['Cryptocurrency', 'Trading', 'Finance'],
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
  },
  {
    id: 'room_2',
    name: 'Code Review Club',
    description: 'Share your code for review, get feedback, and discuss best practices in software development.',
    type: 'public',
    agentId: 'agent_2',
    memberCount: 87,
    messageCount: 2145,
    tags: ['Programming', 'Code Review', 'Software'],
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  },
];

// Helper function to get a room by ID
function getRoomById(roomId: string): Room | undefined {
  return rooms.find(room => room.id === roomId);
}

// GET - Retrieve a specific room by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const room = getRoomById(params.id);
  
  if (!room) {
    return NextResponse.json(
      { error: 'Room not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ room }, { status: 200 });
}

// PATCH - Update a specific room
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    const payload: RoomUpdateRequest = await request.json();
    
    // Find the room to update
    const roomIndex = rooms.findIndex(room => room.id === roomId);
    
    if (roomIndex === -1) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Validate room type if provided
    if (payload.type && payload.type !== 'public' && payload.type !== 'private') {
      return NextResponse.json(
        { error: 'Room type must be either "public" or "private"' },
        { status: 400 }
      );
    }
    
    // Update the room with the new information
    const updatedRoom: Room = {
      ...rooms[roomIndex],
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { description: payload.description }),
      ...(payload.type && { type: payload.type }),
      ...(payload.tags && { tags: payload.tags }),
      updatedAt: Date.now(),
    };
    
    // In a real implementation, this would update the database
    rooms[roomIndex] = updatedRoom;
    
    return NextResponse.json({ room: updatedRoom }, { status: 200 });
  } catch (error) {
    console.error('Error updating room:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a specific room
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const roomId = params.id;
  
  // Find the room to delete
  const roomIndex = rooms.findIndex(room => room.id === roomId);
  
  if (roomIndex === -1) {
    return NextResponse.json(
      { error: 'Room not found' },
      { status: 404 }
    );
  }
  
  // In a real implementation, this would delete from the database
  const deletedRoom = rooms.splice(roomIndex, 1)[0];
  
  return NextResponse.json(
    { message: 'Room deleted successfully', room: deletedRoom },
    { status: 200 }
  );
}

// Interface for room member
interface RoomMember {
  userId: string;
  username: string;
  joinedAt: number;
}

// Mock room members for specific rooms
const roomMembers: Record<string, RoomMember[]> = {
  'room_1': [
    {
      userId: 'user_1',
      username: 'crypto_enthusiast',
      joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      userId: 'user_2',
      username: 'bitcoin_maximalist',
      joinedAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
    },
  ],
  'room_2': [
    {
      userId: 'user_3',
      username: 'javascript_dev',
      joinedAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
    },
  ],
};

// GET - Retrieve members of a specific room
export async function GET_MEMBERS(
  request: Request,
  { params }: { params: { id: string } }
) {
  const roomId = params.id;
  const room = getRoomById(roomId);
  
  if (!room) {
    return NextResponse.json(
      { error: 'Room not found' },
      { status: 404 }
    );
  }
  
  const members = roomMembers[roomId] || [];
  
  return NextResponse.json({ members }, { status: 200 });
}