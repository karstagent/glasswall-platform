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

interface RoomCreateRequest {
  name: string;
  description: string;
  type: 'public' | 'private';
  agentId: string;
  tags?: string[];
}

interface RoomUpdateRequest {
  name?: string;
  description?: string;
  type?: 'public' | 'private';
  tags?: string[];
}

// Mock database of rooms
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

// GET - Retrieve rooms (with optional filtering)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters for filtering
  const type = searchParams.get('type');
  const agentId = searchParams.get('agentId');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  
  // Filter rooms based on query parameters
  let filteredRooms = [...rooms];
  
  if (type) {
    filteredRooms = filteredRooms.filter(room => 
      room.type === type
    );
  }
  
  if (agentId) {
    filteredRooms = filteredRooms.filter(room => 
      room.agentId === agentId
    );
  }
  
  if (tag) {
    filteredRooms = filteredRooms.filter(room => 
      room.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRooms = filteredRooms.filter(room => 
      room.name.toLowerCase().includes(searchLower) || 
      room.description.toLowerCase().includes(searchLower) ||
      room.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  return NextResponse.json({ rooms: filteredRooms }, { status: 200 });
}

// POST - Create a new room
export async function POST(request: Request) {
  try {
    const payload: RoomCreateRequest = await request.json();
    
    // Validate required fields
    if (!payload.name || !payload.description || !payload.agentId) {
      return NextResponse.json(
        { error: 'Name, description, and agentId are required' },
        { status: 400 }
      );
    }
    
    // Validate room type
    if (payload.type !== 'public' && payload.type !== 'private') {
      return NextResponse.json(
        { error: 'Room type must be either "public" or "private"' },
        { status: 400 }
      );
    }
    
    // Generate a new room ID
    const roomId = `room_${Date.now()}`;
    
    // Create the new room
    const newRoom: Room = {
      id: roomId,
      name: payload.name,
      description: payload.description,
      type: payload.type,
      agentId: payload.agentId,
      memberCount: 0,
      messageCount: 0,
      tags: payload.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // In a real implementation, this would save to a database
    rooms.push(newRoom);
    
    return NextResponse.json({ room: newRoom }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}