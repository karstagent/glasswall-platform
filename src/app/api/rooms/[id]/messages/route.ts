import { NextRequest, NextResponse } from 'next/server';
import { messageQueueService } from '@/lib/services/messageQueueService';
import { roomService } from '@/lib/services/roomService';
import { agentService } from '@/lib/services/agentService';
import { MessageTier } from '@/types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/rooms/[id]/messages - Get messages for a room
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    // Validate that room exists
    if (!roomService.roomExists(id)) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get messages for user in room
    const messages = messageQueueService.getUserMessages(id, userId);
    
    // Get queue status
    const freeQueueStatus = messageQueueService.getQueueStatus(id, MessageTier.FREE);
    const paidQueueStatus = messageQueueService.getQueueStatus(id, MessageTier.PAID);
    
    return NextResponse.json({
      success: true,
      data: {
        messages,
        queueStatus: {
          free: freeQueueStatus,
          paid: paidQueueStatus
        }
      }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rooms/[id]/messages - Send a message to a room
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    // Validate that room exists
    const room = roomService.getRoom(id);
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const { userId, content, tier = MessageTier.FREE } = await request.json();
    
    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'User ID and content are required' },
        { status: 400 }
      );
    }
    
    // Validate tier
    if (tier !== MessageTier.FREE && tier !== MessageTier.PAID) {
      return NextResponse.json(
        { success: false, error: 'Invalid message tier' },
        { status: 400 }
      );
    }
    
    // Check if user has access to room
    if (!roomService.userHasAccess(userId, id)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Add message to queue
    const message = await messageQueueService.addMessage(
      id,
      userId,
      content,
      tier as MessageTier
    );
    
    // Get queue status
    const queueStatus = messageQueueService.getQueueStatus(id, tier as MessageTier);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          message,
          queueStatus
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}