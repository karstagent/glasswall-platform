import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { Webhook, WebhookEventType } from '@/types';

class WebhookService {
  private webhooks: Map<string, Webhook> = new Map();
  private agentWebhooks: Map<string, string[]> = new Map(); // agentId -> webhookIds

  /**
   * Create a new webhook
   */
  public createWebhook(
    agentId: string,
    url: string,
    events: WebhookEventType[],
    secret?: string
  ): Webhook {
    // Generate webhook ID
    const id = uuidv4();
    
    // Generate secret if not provided
    const webhookSecret = secret || this.generateSecret();
    
    // Create webhook
    const webhook: Webhook = {
      id,
      agentId,
      url,
      secret: webhookSecret,
      events,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store webhook
    this.webhooks.set(id, webhook);
    
    // Add to agent's webhooks
    if (!this.agentWebhooks.has(agentId)) {
      this.agentWebhooks.set(agentId, []);
    }
    this.agentWebhooks.get(agentId)!.push(id);
    
    return webhook;
  }

  /**
   * Generate a random secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get a webhook by ID
   */
  public getWebhook(id: string): Webhook | undefined {
    return this.webhooks.get(id);
  }

  /**
   * Get all webhooks for an agent
   */
  public getAgentWebhooks(agentId: string): Webhook[] {
    const webhookIds = this.agentWebhooks.get(agentId) || [];
    return webhookIds
      .map(id => this.webhooks.get(id))
      .filter(webhook => webhook !== undefined) as Webhook[];
  }

  /**
   * Update webhook
   */
  public updateWebhook(
    id: string,
    updates: Partial<Pick<Webhook, 'url' | 'events' | 'active'>>
  ): Webhook {
    const webhook = this.webhooks.get(id);
    
    if (!webhook) {
      throw new Error(`Webhook not found: ${id}`);
    }
    
    // Update fields
    if (updates.url) webhook.url = updates.url;
    if (updates.events) webhook.events = updates.events;
    if (updates.active !== undefined) webhook.active = updates.active;
    
    webhook.updatedAt = new Date().toISOString();
    
    return webhook;
  }

  /**
   * Delete a webhook
   */
  public deleteWebhook(id: string): boolean {
    const webhook = this.webhooks.get(id);
    
    if (!webhook) {
      return false;
    }
    
    // Remove from webhooks map
    this.webhooks.delete(id);
    
    // Remove from agent's webhooks
    const agentWebhooks = this.agentWebhooks.get(webhook.agentId) || [];
    this.agentWebhooks.set(
      webhook.agentId,
      agentWebhooks.filter(webhookId => webhookId !== id)
    );
    
    return true;
  }

  /**
   * Trigger webhook event
   */
  public async triggerWebhook(
    agentId: string,
    eventType: WebhookEventType,
    payload: any
  ): Promise<void> {
    const webhooks = this.getAgentWebhooks(agentId)
      .filter(webhook => webhook.active && webhook.events.includes(eventType));
    
    const timestamp = Date.now().toString();
    
    // Trigger webhooks in parallel
    await Promise.all(
      webhooks.map(async webhook => {
        try {
          // Generate signature
          const signature = this.generateSignature(webhook.secret, payload, timestamp);
          
          // Send webhook request
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-GlassWall-Signature': signature,
              'X-GlassWall-Timestamp': timestamp,
              'X-GlassWall-Event': eventType
            },
            body: JSON.stringify({
              event: eventType,
              timestamp,
              data: payload
            })
          });

          if (!response.ok) {
            console.error(`Webhook delivery failed: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error triggering webhook:', error);
        }
      })
    );
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(secret: string, payload: any, timestamp: string): string {
    const stringPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signatureData = `${timestamp}.${stringPayload}`;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signatureData);
    
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature
   */
  public verifySignature(
    secret: string,
    payload: any,
    timestamp: string,
    signature: string
  ): boolean {
    const expectedSignature = this.generateSignature(secret, payload, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  }
}

// Export a singleton instance
export const webhookService = new WebhookService();
export default webhookService;