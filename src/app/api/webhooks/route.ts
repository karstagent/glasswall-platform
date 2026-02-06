import { NextRequest, NextResponse } from 'next/server';
import { webhookService } from '@/lib/services/webhookService';
import { agentService } from '@/lib/services/agentService';
import { WebhookEventType } from '@/types';

/**
 * GET /api/webhooks - List webhooks for an agent
 */
export async function GET(request: NextRequest) {
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
    
    // Get webhooks for agent
    const webhooks = webhookService.getAgentWebhooks(agent.id);
    
    return NextResponse.json({ success: true, data: webhooks });
  } catch (error) {
    console.error('Error getting webhooks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get webhooks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks - Create a new webhook
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
    
    // Parse request body
    const { url, events, secret } = await request.json();
    
    // Validate request
    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URL and events array are required' },
        { status: 400 }
      );
    }
    
    // Validate events
    const validEvents = events.every(event => 
      Object.values(WebhookEventType).includes(event as WebhookEventType)
    );
    
    if (!validEvents) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Valid event types are: ${Object.values(WebhookEventType).join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Create webhook
    const webhook = webhookService.createWebhook(
      agent.id,
      url,
      events as WebhookEventType[],
      secret
    );
    
    // Remove secret from response for security
    const { secret: _, ...safeWebhook } = webhook;
    
    return NextResponse.json(
      { success: true, data: safeWebhook },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}