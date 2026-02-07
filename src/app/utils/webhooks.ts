import crypto from 'crypto';

// Interface for webhook payload
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: number;
  agentId: string;
  roomId: string;
}

// Interface for webhook configuration
export interface WebhookConfig {
  url: string;
  secret?: string;
  events: string[];
  enabled: boolean;
  retryCount: number;
  timeoutMs: number;
  createdAt: number;
  updatedAt: number;
}

// Interface for webhook delivery attempt
export interface WebhookDelivery {
  id: string;
  webhookUrl: string;
  agentId: string;
  payload: WebhookPayload;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  updatedAt: number;
  nextRetryAt?: number;
}

/**
 * Generate a signature for a webhook payload using the secret
 * @param payload The webhook payload to sign
 * @param secret The secret key to use for signing
 * @returns The signature as a hexadecimal string
 */
export function generateSignature(payload: WebhookPayload, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(JSON.stringify(payload)).digest('hex');
  return signature;
}

/**
 * Verify the signature of a webhook payload
 * @param payload The webhook payload to verify
 * @param signature The signature to verify against
 * @param secret The secret key used for signing
 * @returns True if the signature is valid, false otherwise
 */
export function verifySignature(payload: WebhookPayload, signature: string, secret: string): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Send a webhook payload to the specified URL with retry logic
 * @param webhookUrl The URL to send the webhook to
 * @param payload The webhook payload to send
 * @param secret Optional secret for signing the payload
 * @param retryCount Current retry attempt (starts at 0)
 * @param maxRetries Maximum number of retry attempts
 * @returns The webhook delivery result
 */
export async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  secret?: string,
  retryCount = 0,
  maxRetries = 3
): Promise<WebhookDelivery> {
  const deliveryId = `delivery_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Create the webhook delivery record
  const delivery: WebhookDelivery = {
    id: deliveryId,
    webhookUrl,
    agentId: payload.agentId,
    payload,
    status: 'pending',
    retryCount,
    maxRetries,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  try {
    // Prepare the request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'GlassWall-Webhook/1.0',
      'X-GlassWall-Delivery': deliveryId,
      'X-GlassWall-Event': payload.event,
    };
    
    // Add signature if secret is provided
    if (secret) {
      const signature = generateSignature(payload, secret);
      headers['X-GlassWall-Signature'] = signature;
    }
    
    // Set timeout to 10 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Send the webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Get the response body as text
    const responseBody = await response.text();
    
    // Update the delivery with response details
    delivery.statusCode = response.status;
    delivery.responseBody = responseBody;
    
    if (response.ok) {
      // Webhook delivered successfully
      delivery.status = 'success';
      delivery.updatedAt = Date.now();
      return delivery;
    } else {
      // Webhook delivery failed with HTTP error status
      delivery.status = 'failed';
      delivery.errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      delivery.updatedAt = Date.now();
      
      // Retry if we haven't exceeded the maximum retries
      if (retryCount < maxRetries) {
        // Exponential backoff: 2^retryCount * 1000ms
        const backoffMs = Math.pow(2, retryCount) * 1000;
        delivery.nextRetryAt = Date.now() + backoffMs;
        
        // Wait for the backoff period
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        
        // Retry the webhook delivery
        return await sendWebhook(webhookUrl, payload, secret, retryCount + 1, maxRetries);
      }
      
      return delivery;
    }
  } catch (error) {
    // Webhook delivery failed with an exception
    delivery.status = 'failed';
    delivery.errorMessage = error instanceof Error ? error.message : String(error);
    delivery.updatedAt = Date.now();
    
    // Retry if we haven't exceeded the maximum retries
    if (retryCount < maxRetries) {
      // Exponential backoff: 2^retryCount * 1000ms
      const backoffMs = Math.pow(2, retryCount) * 1000;
      delivery.nextRetryAt = Date.now() + backoffMs;
      
      // Wait for the backoff period
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      
      // Retry the webhook delivery
      return await sendWebhook(webhookUrl, payload, secret, retryCount + 1, maxRetries);
    }
    
    return delivery;
  }
}

/**
 * Queue a webhook for delivery in the background
 * @param webhookUrl The URL to send the webhook to
 * @param payload The webhook payload to send
 * @param secret Optional secret for signing the payload
 * @param maxRetries Maximum number of retry attempts
 * @returns The webhook delivery ID
 */
export function queueWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  secret?: string,
  maxRetries = 3
): string {
  const deliveryId = `delivery_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // In a real implementation, this would queue the webhook in a database or message queue
  // For now, we'll just call sendWebhook asynchronously and log the result
  sendWebhook(webhookUrl, payload, secret, 0, maxRetries)
    .then(delivery => {
      if (delivery.status === 'success') {
        console.log(`Webhook delivery ${deliveryId} succeeded:`, delivery);
      } else {
        console.error(`Webhook delivery ${deliveryId} failed:`, delivery);
      }
    })
    .catch(error => {
      console.error(`Error in webhook delivery ${deliveryId}:`, error);
    });
  
  return deliveryId;
}

/**
 * Get mock webhook configurations for an agent
 * @param agentId The ID of the agent
 * @returns Array of webhook configurations for the agent
 */
export function getMockWebhookConfigs(agentId: string): WebhookConfig[] {
  // In a real implementation, this would fetch from a database
  return [
    {
      url: 'https://api.example.com/webhooks/agent1',
      secret: 'webhook-secret-1',
      events: ['message', 'reaction', 'join', 'leave'],
      enabled: true,
      retryCount: 0,
      timeoutMs: 10000,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    },
  ];
}

/**
 * Send webhooks for an event to all configured endpoints for an agent
 * @param agentId The ID of the agent
 * @param roomId The ID of the room
 * @param event The event type
 * @param data The event data
 * @returns Array of webhook delivery IDs
 */
export function sendAgentWebhooks(
  agentId: string,
  roomId: string,
  event: string,
  data: any
): string[] {
  // Get the webhook configurations for the agent
  const webhookConfigs = getMockWebhookConfigs(agentId);
  
  // Filter webhooks that are enabled and subscribed to this event
  const eligibleWebhooks = webhookConfigs.filter(
    config => config.enabled && config.events.includes(event)
  );
  
  if (eligibleWebhooks.length === 0) {
    console.log(`No webhooks configured for agent ${agentId} and event ${event}`);
    return [];
  }
  
  // Create the webhook payload
  const payload: WebhookPayload = {
    event,
    data,
    timestamp: Date.now(),
    agentId,
    roomId,
  };
  
  // Queue webhooks for delivery
  return eligibleWebhooks.map(config => 
    queueWebhook(config.url, payload, config.secret)
  );
}