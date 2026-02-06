import { NextRequest, NextResponse } from 'next/server';
import { roomService } from '@/lib/services/roomService';
import { agentService } from '@/lib/services/agentService';
import { RoomVisibility } from '@/types';

/**
 * GET /api/rooms - List rooms (public or owned by agent)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const userId = searchParams.get('userId');
    
    let rooms;
    
    if (agentId) {
      // List rooms owned by agent
      rooms = roomService.listAgentRooms(agentId);
    } else if (userId) {
      // List rooms accessible to user
      rooms = roomService.listUserRooms(userId);
    } else {
      // List public rooms
      rooms = roomService.listPublicRooms();
    }
    
    return NextResponse.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error listing rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list rooms' },
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
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key required' },
        { status: 401 }
      );
    }
    
    // Validate API key
    const agent = agentService.getAgentByApiKey(apiKey);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Check if agent is verified
    if (!agent.verified) {
      return NextResponse.json(
        { success: false, error: 'Agent must be verified to create rooms' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, description, visibility = 'public', settings = {} } = body;
    
    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }
    
    // Validate visibility
    if (!Object.values(RoomVisibility).includes(visibility as RoomVisibility)) {
      return NextResponse.json(
        { success: false, error: 'Invalid visibility value' },
        { status: 400 }
      );
    }
    
    // Create room
    const room = roomService.createRoom(
      agent.id,
      name,
      description,
      visibility as RoomVisibility,
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