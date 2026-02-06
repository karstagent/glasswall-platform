import { Webhook, WebhookEventType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// In-memory storage for demo purposes
// In production, this would use a database
const webhooks: Record<string, Webhook> = {};

export const webhookService = {
  /**
   * Create a webhook for an agent
   */
  createWebhook(
    agentId: string,
    url: string,
    events: WebhookEventType[] = [WebhookEventType.MESSAGE_NEW]
  ): Webhook {
    // Generate webhook ID
    const webhookId = uuidv4();
    
    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');
    
    // Get current timestamp
    const now = new Date().toISOString();
    
    // Create webhook object
    const webhook: Webhook = {
      id: webhookId,
      agentId,
      url,
      secret,
      events,
      active: true,
      createdAt: now,
      updatedAt: now
    };
    
    // Store the webhook
    webhooks[webhookId] = webhook;
    
    return webhook;
  },
  
  /**
   * Get webhook by ID
   */
  getWebhook(webhookId: string): Webhook | null {
    return webhooks[webhookId] || null;
  },
  
  /**
   * List webhooks for an agent
   */
  listAgentWebhooks(agentId: string): Webhook[] {
    return Object.values(webhooks).filter(
      webhook => webhook.agentId === agentId
    );
  },
  
  /**
   * Update webhook
   */
  updateWebhook(
    webhookId: string,
    updates: Partial<Webhook>
  ): Webhook {
    const webhook = webhooks[webhookId];
    
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }
    
    // Don't allow updating these fields
    const { id, agentId, secret, createdAt, ...allowedUpdates } = updates;
    
    // Update the webhook
    const updatedWebhook = {
      ...webhook,
      ...allowedUpdates,
      updatedAt: new Date().toISOString()
    };
    
    // Store the updated webhook
    webhooks[webhookId] = updatedWebhook;
    
    return updatedWebhook;
  },
  
  /**
   * Delete webhook
   */
  deleteWebhook(webhookId: string): boolean {
    const webhook = webhooks[webhookId];
    
    if (!webhook) {
      return false;
    }
    
    delete webhooks[webhookId];
    return true;
  },
  
  /**
   * Reset webhook secret
   */
  resetWebhookSecret(webhookId: string): string {
    const webhook = webhooks[webhookId];
    
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }
    
    // Generate new secret
    const newSecret = crypto.randomBytes(32).toString('hex');
    
    // Update webhook
    webhook.secret = newSecret;
    webhook.updatedAt = new Date().toISOString();
    
    return newSecret;
  },
  
  /**
   * Trigger webhook event
   */
  async triggerWebhook(
    agentId: string,
    eventType: WebhookEventType,
    payload: Record<string, any>
  ): Promise<boolean> {
    // Find all active webhooks for this agent that subscribe to this event
    const relevantWebhooks = Object.values(webhooks).filter(
      webhook => (
        webhook.agentId === agentId &&
        webhook.active &&
        webhook.events.includes(eventType)
      )
    );
    
    if (relevantWebhooks.length === 0) {
      console.log(`No webhooks found for agent ${agentId} and event ${eventType}`);
      return false;
    }
    
    // Timestamp for the event
    const timestamp = new Date().toISOString();
    
    // In a real implementation, we would make HTTP requests to each webhook URL
    // For this demo, we'll just log the events
    for (const webhook of relevantWebhooks) {
      // Create the full payload
      const fullPayload = {
        type: eventType,
        timestamp,
        agentId,
        data: payload
      };
      
      // Generate signature for payload
      const signature = this.generateSignature(webhook.secret, fullPayload);
      
      console.log(`Triggering webhook ${webhook.id} for event ${eventType}`);
      console.log(`  URL: ${webhook.url}`);
      console.log(`  Payload: ${JSON.stringify(fullPayload)}`);
      console.log(`  Signature: ${signature}`);
      
      // In a real implementation:
      // fetch(webhook.url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-GlassWall-Signature': signature,
      //     'X-GlassWall-Event': eventType
      //   },
      //   body: JSON.stringify(fullPayload)
      // }).catch(error => {
      //   console.error(`Error triggering webhook ${webhook.id}:`, error);
      // });
    }
    
    return true;
  },
  
  /**
   * Generate signature for webhook payload
   */
  generateSignature(secret: string, payload: Record<string, any>): string {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  },
  
  /**
   * Verify webhook signature
   */
  verifySignature(
    secret: string,
    payload: string | Record<string, any>,
    signature: string
  ): boolean {
    const payloadString = typeof payload === 'string'
      ? payload
      : JSON.stringify(payload);
      
    const expectedSignature = this.generateSignature(secret, JSON.parse(payloadString));
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
};