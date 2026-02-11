/**
 * Message Service
 * 
 * Handles core message processing functionality for the GlassWall Platform
 */

import { Message, MessageBatch, MessagePriority, UserTier } from './types';

/**
 * MessageService class for handling message operations
 */
export class MessageService {
  /**
   * Create a new message
   */
  async createMessage(
    roomId: string,
    senderId: string,
    senderType: 'user' | 'agent',
    content: string,
    userTier: UserTier
  ): Promise<Message> {
    // Determine message priority based on user tier
    let priority = MessagePriority.LOW;
    if (userTier === UserTier.PRIORITY) {
      priority = MessagePriority.MEDIUM;
    } else if (userTier === UserTier.UNLIMITED) {
      priority = MessagePriority.HIGH;
    }

    // Create message object
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      roomId,
      senderId,
      senderType,
      content,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata: {
        tier: userTier,
        priority: userTier !== UserTier.FREE,
        batch: '',
      }
    };

    // In a real implementation, this would save to database
    console.log('Message created:', message);

    return message;
  }

  /**
   * Get messages for a room with pagination
   */
  async getRoomMessages(
    roomId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ messages: Message[], total: number, page: number, pages: number }> {
    // This would fetch from database in a real implementation
    const mockMessages: Message[] = [];
    
    // Return mock pagination result
    return {
      messages: mockMessages,
      total: mockMessages.length,
      page,
      pages: Math.ceil(mockMessages.length / limit)
    };
  }

  /**
   * Create a batch of messages for processing
   */
  async createMessageBatch(
    agentId: string,
    roomId: string,
    priorityOnly: boolean = false
  ): Promise<MessageBatch> {
    // This would query pending messages from database in real implementation
    const pendingMessages: Message[] = [];
    
    // Filter by priority if needed
    const batchMessages = priorityOnly 
      ? pendingMessages.filter(msg => msg.priority !== MessagePriority.LOW)
      : pendingMessages;

    // Create batch object
    const batch: MessageBatch = {
      id: `batch-${Date.now()}`,
      agentId,
      messages: batchMessages,
      createdAt: new Date().toISOString(),
      status: 'pending',
      stats: {
        messageCount: batchMessages.length,
        priorityCount: batchMessages.filter(m => m.priority !== MessagePriority.LOW).length
      }
    };

    // In a real implementation, this would save to database
    console.log('Batch created:', batch);

    return batch;
  }

  /**
   * Process a message batch
   */
  async processBatch(
    batchId: string,
    responses: Map<string, string>
  ): Promise<MessageBatch> {
    // This would update message status in database in real implementation
    console.log('Processing batch:', batchId, 'with responses for', responses.size, 'messages');
    
    // Mock batch with processing completed
    const batch: MessageBatch = {
      id: batchId,
      agentId: 'agent-123',
      messages: [],
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      processedAt: new Date().toISOString(),
      status: 'completed',
      stats: {
        messageCount: responses.size,
        priorityCount: 0,
        processingTime: 2500 // milliseconds
      }
    };
    
    return batch;
  }

  /**
   * Check if a user has reached their rate limit
   */
  async checkRateLimit(
    userId: string,
    userTier: UserTier
  ): Promise<{ allowed: boolean, remaining: number, resetAt: string }> {
    // Define rate limits based on user tier
    const hourlyLimits = {
      [UserTier.FREE]: 3,
      [UserTier.PRIORITY]: 10,
      [UserTier.UNLIMITED]: 100
    };

    // This would check database for user's recent message count
    const mockHourlyUsage = 1;
    const remaining = hourlyLimits[userTier] - mockHourlyUsage;
    
    // Calculate rate limit reset time
    const now = new Date();
    const resetAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours() + 1,
      0, 0, 0
    ).toISOString();
    
    return {
      allowed: remaining > 0,
      remaining,
      resetAt
    };
  }
}