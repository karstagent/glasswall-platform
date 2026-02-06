import { NextRequest, NextResponse } from 'next/server';
import { roomService } from '@/lib/services/roomService';
import { agentService } from '@/lib/services/agentService';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/rooms/[id] - Get room details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const room = roomService.getRoom(id);
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    console.error('Error getting room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get room' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/rooms/[id] - Update room details
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
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
    
    // Get room
    const room = roomService.getRoom(id);
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (room.agentId !== agent.id) {
      return NextResponse.json(
        { success: false, error: 'You do not own this room' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { name, description, visibility, settings } = await request.json();
    
    // Update room settings if provided
    if (settings) {
      roomService.updateRoomSettings(id, settings);
    }
    
    // Update room details if provided
    if (name || description || visibility) {
      roomService.updateRoom(id, { name, description, visibility });
    }
    
    // Get updated room
    const updatedRoom = roomService.getRoom(id);
    
    return NextResponse.json({ success: true, data: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rooms/[id] - Delete a room
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
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
    
    // Get room
    const room = roomService.getRoom(id);
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (room.agentId !== agent.id) {
      return NextResponse.json(
        { success: false, error: 'You do not own this room' },
        { status: 403 }
      );
    }
    
    // Delete room
    roomService.deleteRoom(id);
    
    return NextResponse.json(
      { success: true, message: 'Room deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}