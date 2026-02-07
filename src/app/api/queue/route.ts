import { NextResponse } from 'next/server';

// Define queue interfaces
interface QueueItem {
  id: string;
  messageId: string;
  roomId: string;
  agentId: string;
  userId: string;
  isPriority: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  processedAt?: number;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
}

interface QueueCreateRequest {
  messageId: string;
  roomId: string;
  agentId: string;
  userId: string;
  isPriority?: boolean;
  maxRetries?: number;
}

// Mock database of queue items
const queueItems: QueueItem[] = [
  {
    id: 'queue_1',
    messageId: 'msg_2',
    roomId: 'room_1',
    agentId: 'agent_1',
    userId: 'user_1',
    isPriority: false,
    status: 'completed',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000, // 2 days ago + 1 second
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 5000,
    processedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 5000,
    retryCount: 0,
    maxRetries: 3,
  },
  {
    id: 'queue_2',
    messageId: 'msg_3',
    roomId: 'room_1',
    agentId: 'agent_1',
    userId: 'user_2',
    isPriority: true,
    status: 'pending',
    createdAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    updatedAt: Date.now() - 1 * 60 * 60 * 1000,
    retryCount: 0,
    maxRetries: 3,
  },
];

// GET - Retrieve queue items (with optional filtering)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters for filtering
  const roomId = searchParams.get('roomId');
  const agentId = searchParams.get('agentId');
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  const isPriority = searchParams.get('isPriority');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
  // Filter queue items based on query parameters
  let filteredItems = [...queueItems];
  
  if (roomId) {
    filteredItems = filteredItems.filter(item => 
      item.roomId === roomId
    );
  }
  
  if (agentId) {
    filteredItems = filteredItems.filter(item => 
      item.agentId === agentId
    );
  }
  
  if (userId) {
    filteredItems = filteredItems.filter(item => 
      item.userId === userId
    );
  }
  
  if (status) {
    filteredItems = filteredItems.filter(item => 
      item.status === status
    );
  }
  
  if (isPriority !== null) {
    const isPriorityBool = isPriority === 'true';
    filteredItems = filteredItems.filter(item => 
      item.isPriority === isPriorityBool
    );
  }
  
  // Sort by priority (high to low) and then by createdAt (oldest first)
  filteredItems.sort((a, b) => {
    // First sort by priority
    if (a.isPriority !== b.isPriority) {
      return a.isPriority ? -1 : 1;
    }
    
    // Then sort by createdAt
    return a.createdAt - b.createdAt;
  });
  
  // Limit the number of items
  filteredItems = filteredItems.slice(0, limit);
  
  return NextResponse.json({ items: filteredItems }, { status: 200 });
}

// POST - Create a new queue item
export async function POST(request: Request) {
  try {
    const payload: QueueCreateRequest = await request.json();
    
    // Validate required fields
    if (!payload.messageId || !payload.roomId || !payload.agentId || !payload.userId) {
      return NextResponse.json(
        { error: 'messageId, roomId, agentId, and userId are required' },
        { status: 400 }
      );
    }
    
    // Generate a new queue item ID
    const queueId = `queue_${Date.now()}`;
    
    // Create the new queue item
    const newQueueItem: QueueItem = {
      id: queueId,
      messageId: payload.messageId,
      roomId: payload.roomId,
      agentId: payload.agentId,
      userId: payload.userId,
      isPriority: payload.isPriority || false,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retryCount: 0,
      maxRetries: payload.maxRetries || 3,
    };
    
    // In a real implementation, this would save to a database
    queueItems.push(newQueueItem);
    
    // In a real implementation, this would trigger a background job to process the queue
    processQueue();
    
    return NextResponse.json({ item: newQueueItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating queue item:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get the next item from the queue
function getNextQueueItem(): QueueItem | undefined {
  // First, check for priority items that are pending
  const priorityItem = queueItems.find(item => 
    item.isPriority && item.status === 'pending'
  );
  
  if (priorityItem) {
    return priorityItem;
  }
  
  // If no priority items, get the oldest pending item
  return queueItems.find(item => 
    item.status === 'pending'
  );
}

// Process the queue (in a real implementation, this would be a background job)
async function processQueue() {
  // Get the next item from the queue
  const nextItem = getNextQueueItem();
  
  if (!nextItem) {
    // No items to process
    return;
  }
  
  try {
    // Mark the item as processing
    nextItem.status = 'processing';
    nextItem.updatedAt = Date.now();
    
    // In a real implementation, this would send a webhook to the agent
    console.log(`Processing queue item ${nextItem.id} for message ${nextItem.messageId}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark the item as completed
    nextItem.status = 'completed';
    nextItem.processedAt = Date.now();
    nextItem.updatedAt = Date.now();
    
    // Process next item in queue
    processQueue();
  } catch (error) {
    console.error(`Error processing queue item ${nextItem.id}:`, error);
    
    // Mark the item as failed
    nextItem.status = 'failed';
    nextItem.failureReason = error instanceof Error ? error.message : String(error);
    nextItem.retryCount += 1;
    nextItem.updatedAt = Date.now();
    
    // Check if we should retry
    if (nextItem.retryCount < nextItem.maxRetries) {
      // Reset to pending for retry
      nextItem.status = 'pending';
    }
    
    // Process next item in queue
    processQueue();
  }
}

// PUT - Process the next item in the queue manually
export async function PUT(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'processNext') {
      const nextItem = getNextQueueItem();
      
      if (!nextItem) {
        return NextResponse.json(
          { message: 'No items in the queue to process' },
          { status: 200 }
        );
      }
      
      // Mark the item as processing
      nextItem.status = 'processing';
      nextItem.updatedAt = Date.now();
      
      // In a real implementation, this would send a webhook to the agent
      console.log(`Processing queue item ${nextItem.id} for message ${nextItem.messageId}`);
      
      // Mark the item as completed (in a real implementation, this would wait for the agent to respond)
      nextItem.status = 'completed';
      nextItem.processedAt = Date.now();
      nextItem.updatedAt = Date.now();
      
      return NextResponse.json(
        { message: 'Queue item processed successfully', item: nextItem },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing queue:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Clear the queue
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    
    if (status) {
      // Remove items with the specified status
      const initialCount = queueItems.length;
      const newQueueItems = queueItems.filter(item => item.status !== status);
      const removedCount = initialCount - newQueueItems.length;
      
      // Update the queue
      queueItems.length = 0;
      queueItems.push(...newQueueItems);
      
      return NextResponse.json(
        { message: `Removed ${removedCount} items with status "${status}" from the queue` },
        { status: 200 }
      );
    } else {
      // Clear the entire queue
      const removedCount = queueItems.length;
      queueItems.length = 0;
      
      return NextResponse.json(
        { message: `Cleared the entire queue (${removedCount} items removed)` },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error clearing queue:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}