import { NextResponse } from 'next/server';
import { WebhookDelivery } from '../../../utils/webhooks';

// Mock database of webhook deliveries
const webhookDeliveries: WebhookDelivery[] = [
  {
    id: 'delivery_1675123456789_123',
    webhookUrl: 'https://api.example.com/webhooks/agent1',
    agentId: 'agent_1',
    payload: {
      event: 'message',
      data: {
        messageId: 'msg_1',
        content: 'Hello from GlassWall!',
        senderId: 'user_1',
        senderType: 'user',
      },
      timestamp: 1675123456789,
      agentId: 'agent_1',
      roomId: 'room_1',
    },
    status: 'success',
    statusCode: 200,
    responseBody: '{"success":true}',
    retryCount: 0,
    maxRetries: 3,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  },
  {
    id: 'delivery_1675123456790_456',
    webhookUrl: 'https://api.example.com/webhooks/agent1',
    agentId: 'agent_1',
    payload: {
      event: 'reaction',
      data: {
        messageId: 'msg_1',
        emoji: '👍',
        userId: 'user_2',
      },
      timestamp: 1675123456790,
      agentId: 'agent_1',
      roomId: 'room_1',
    },
    status: 'failed',
    statusCode: 500,
    responseBody: 'Internal Server Error',
    errorMessage: 'HTTP Error: 500 Internal Server Error',
    retryCount: 3,
    maxRetries: 3,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
  },
];

// GET - Retrieve webhook delivery history (with optional filtering)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters for filtering
  const agentId = searchParams.get('agentId');
  const status = searchParams.get('status');
  const event = searchParams.get('event');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
  // Filter webhook deliveries based on query parameters
  let filteredDeliveries = [...webhookDeliveries];
  
  if (agentId) {
    filteredDeliveries = filteredDeliveries.filter(delivery => 
      delivery.agentId === agentId
    );
  }
  
  if (status) {
    filteredDeliveries = filteredDeliveries.filter(delivery => 
      delivery.status === status
    );
  }
  
  if (event) {
    filteredDeliveries = filteredDeliveries.filter(delivery => 
      delivery.payload.event === event
    );
  }
  
  // Sort by createdAt (newest first) and limit the number of deliveries
  filteredDeliveries.sort((a, b) => b.createdAt - a.createdAt);
  filteredDeliveries = filteredDeliveries.slice(0, limit);
  
  return NextResponse.json({ deliveries: filteredDeliveries }, { status: 200 });
}

// POST - Manually retry a failed webhook delivery
export async function POST(request: Request) {
  try {
    const { deliveryId } = await request.json();
    
    if (!deliveryId) {
      return NextResponse.json(
        { error: 'deliveryId is required' },
        { status: 400 }
      );
    }
    
    // Find the delivery to retry
    const deliveryIndex = webhookDeliveries.findIndex(delivery => 
      delivery.id === deliveryId
    );
    
    if (deliveryIndex === -1) {
      return NextResponse.json(
        { error: 'Webhook delivery not found' },
        { status: 404 }
      );
    }
    
    const delivery = webhookDeliveries[deliveryIndex];
    
    // Check if the delivery can be retried
    if (delivery.status === 'success') {
      return NextResponse.json(
        { error: 'Cannot retry a successful webhook delivery' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would call the sendWebhook function from utils/webhooks.ts
    // For now, we'll just simulate a successful retry
    const updatedDelivery: WebhookDelivery = {
      ...delivery,
      status: 'success',
      statusCode: 200,
      responseBody: '{"success":true}',
      retryCount: delivery.retryCount + 1,
      updatedAt: Date.now(),
    };
    
    // Update the delivery in the mock database
    webhookDeliveries[deliveryIndex] = updatedDelivery;
    
    return NextResponse.json(
      { message: 'Webhook delivery retried successfully', delivery: updatedDelivery },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrying webhook delivery:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}