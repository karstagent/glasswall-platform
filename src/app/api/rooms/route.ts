import { NextRequest, NextResponse } from 'next/server';
import { roomService } from '@/lib/services/roomService';
import { agentService } from '@/lib/services/agentService';
import { RoomVisibility } from '@/types';

/**
 * GET /api/rooms - Get all public rooms or agent's rooms
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const query = searchParams.get('q');
    
    let rooms;
    
    if (agentId) {
      // Get rooms for specific agent
      rooms = roomService.getAgentRooms(agentId);
    } else if (query) {
      // Search rooms
      rooms = roomService.searchRooms(query);
    } else {
      // Get all public rooms
      rooms = roomService.getPublicRooms();
    }
    
    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error getting rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get rooms' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rooms - Create a new room
 */
export async function POST(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const apiKey = authHeader.substring(7);
    const agent = agentService.getAgentByApiKey(apiKey);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    if (!agent.verified) {
      return NextResponse.json(
        { success: false, error: 'Agent not verified' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { name, description, visibility, settings } = await request.json();
    
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }
    
    // Create room
    const room = roomService.createRoom(
      agent.id,
      name,
      description,
      visibility || RoomVisibility.PUBLIC,
      settings
    );
    
    return NextResponse.json(
      { success: true, data: room },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    );
  }
}