import { NextResponse } from 'next/server';

// Define interface for webhook request
interface WebhookRequest {
  agentId: string;
  roomId: string;
  event: 'message' | 'join' | 'leave' | 'reaction';
  data: any;
  timestamp: number;
  signature?: string;
}

// Mock verification function (in production, would validate signatures)
function verifyWebhookSignature(agentId: string, signature: string, payload: any): boolean {
  // This would be a proper HMAC verification in production
  // For now, we'll just return true for mock data
  return true;
}

// Function to validate the webhook payload structure
function validateWebhookPayload(payload: any): payload is WebhookRequest {
  return (
    payload &&
    typeof payload.agentId === 'string' &&
    typeof payload.roomId === 'string' &&
    ['message', 'join', 'leave', 'reaction'].includes(payload.event) &&
    payload.data !== undefined &&
    typeof payload.timestamp === 'number'
  );
}

// Webhook handler - processes incoming agent events
export async function POST(request: Request) {
  try {
    // Parse the JSON body
    const payload = await request.json();
    
    // Validate the payload structure
    if (!validateWebhookPayload(payload)) {
      return NextResponse.json(
        { error: 'Invalid webhook payload structure' },
        { status: 400 }
      );
    }
    
    // Extract webhook data
    const { agentId, roomId, event, data, timestamp, signature } = payload;
    
    // Verify signature if provided
    if (signature && !verifyWebhookSignature(agentId, signature, payload)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }
    
    // Log the webhook event (in production, would persist to database)
    console.log(`Webhook received: ${event} from agent ${agentId} in room ${roomId}`);
    
    // Process the webhook based on the event type
    switch (event) {
      case 'message':
        // Handle new message
        await processMessage(agentId, roomId, data);
        break;
      
      case 'join':
        // Handle agent joining a room
        await processJoin(agentId, roomId, data);
        break;
      
      case 'leave':
        // Handle agent leaving a room
        await processLeave(agentId, roomId, data);
        break;
      
      case 'reaction':
        // Handle reaction to a message
        await processReaction(agentId, roomId, data);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unsupported event type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(
      { success: true, message: 'Webhook processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}

// Handler for message events
async function processMessage(agentId: string, roomId: string, data: any) {
  // In production: Store message in database, trigger notifications, etc.
  console.log(`Processing message from agent ${agentId} in room ${roomId}:`, data);
  
  // Mock implementation - would interact with database in production
  return {
    success: true,
    messageId: `msg_${Date.now()}`
  };
}

// Handler for join events
async function processJoin(agentId: string, roomId: string, data: any) {
  // In production: Update room membership, broadcast join event, etc.
  console.log(`Agent ${agentId} joined room ${roomId}:`, data);
  
  return {
    success: true
  };
}

// Handler for leave events
async function processLeave(agentId: string, roomId: string, data: any) {
  // In production: Update room membership, broadcast leave event, etc.
  console.log(`Agent ${agentId} left room ${roomId}:`, data);
  
  return {
    success: true
  };
}

// Handler for reaction events
async function processReaction(agentId: string, roomId: string, data: any) {
  // In production: Store reaction, update message metrics, etc.
  console.log(`Reaction from agent ${agentId} in room ${roomId}:`, data);
  
  return {
    success: true
  };
}

// GET handler to verify webhook endpoint is functioning
export async function GET(request: Request) {
  return NextResponse.json(
    { status: 'Webhook endpoint online' },
    { status: 200 }
  );
}