import { NextRequest, NextResponse } from 'next/server';
import { messageQueueService } from '@/lib/services/messageQueueService';
import { roomService } from '@/lib/services/roomService';
import { MessageTier } from '@/types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/rooms/[id]/queue - Get queue status for a room
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
    
    // Get queue status for both tiers
    const freeQueueStatus = messageQueueService.getQueueStatus(id, MessageTier.FREE);
    const paidQueueStatus = messageQueueService.getQueueStatus(id, MessageTier.PAID);
    
    return NextResponse.json({
      success: true,
      data: {
        free: freeQueueStatus,
        paid: paidQueueStatus
      }
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}