import { v4 as uuidv4 } from 'uuid';
import { Message, MessageQueue, MessageStatus, MessageTier, QueueStatus } from '@/types';

class MessageQueueService {
  private queues: Map<string, MessageQueue> = new Map();
  private batchIntervals: Map<string, number> = new Map();
  private paidResponseTargets: Map<string, number> = new Map();
  private batchSchedules: Map<string, NodeJS.Timeout> = new Map();
  private webhookUrls: Map<string, string> = new Map();

  /**
   * Initialize a new queue for a room
   */
  public initializeQueue(
    roomId: string,
    batchIntervalMinutes: number = 30,
    paidResponseTargetMinutes: number = 5,
    webhookUrl?: string
  ): void {
    // Initialize free queue
    this.queues.set(`${roomId}:${MessageTier.FREE}`, {
      roomId,
      tier: MessageTier.FREE,
      messages: [],
      metrics: {
        totalMessages: 0,
        processingTime: 0,
        averageResponseTime: 0,
        oldestMessage: null
      }
    });

    // Initialize paid queue
    this.queues.set(`${roomId}:${MessageTier.PAID}`, {
      roomId,
      tier: MessageTier.PAID,
      messages: [],
      metrics: {
        totalMessages: 0,
        processingTime: 0,
        averageResponseTime: 0,
        oldestMessage: null
      }
    });

    // Store configuration
    this.batchIntervals.set(roomId, batchIntervalMinutes);
    this.paidResponseTargets.set(roomId, paidResponseTargetMinutes);
    if (webhookUrl) {
      this.webhookUrls.set(roomId, webhookUrl);
    }

    // Set up batch processing schedule
    this.scheduleBatchProcessing(roomId);
  }

  /**
   * Add a message to the appropriate queue
   */
  public async addMessage(
    roomId: string,
    userId: string,
    content: string,
    tier: MessageTier
  ): Promise<Message> {
    const queueKey = `${roomId}:${tier}`;
    
    if (!this.queues.has(queueKey)) {
      throw new Error(`Queue not found for room ${roomId} and tier ${tier}`);
    }

    const message: Message = {
      id: uuidv4(),
      roomId,
      userId,
      content,
      tier,
      status: MessageStatus.QUEUED,
      createdAt: new Date().toISOString()
    };

    const queue = this.queues.get(queueKey)!;
    queue.messages.push(message);
    
    // Update metrics
    queue.metrics.totalMessages++;
    if (!queue.metrics.oldestMessage || new Date(message.createdAt) < new Date(queue.metrics.oldestMessage)) {
      queue.metrics.oldestMessage = message.createdAt;
    }

    // For paid tier, process immediately
    if (tier === MessageTier.PAID) {
      this.processPaidMessage(message);
    }

    return message;
  }

  /**
   * Process a paid message immediately
   */
  private async processPaidMessage(message: Message): Promise<void> {
    // Update message status
    message.status = MessageStatus.PROCESSING;
    
    try {
      // Notify the agent via webhook if configured
      const webhookUrl = this.webhookUrls.get(message.roomId);
      if (webhookUrl) {
        await this.notifyAgent(message.roomId, [message]);
      }
      
      // Simulate processing time (in a real implementation, we'd wait for agent's response)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update message status to delivered
      message.status = MessageStatus.DELIVERED;
      message.processedAt = new Date().toISOString();
      
      // Update metrics
      const queueKey = `${message.roomId}:${message.tier}`;
      const queue = this.queues.get(queueKey)!;
      
      const processingTime = new Date(message.processedAt).getTime() - new Date(message.createdAt).getTime();
      queue.metrics.processingTime += processingTime;
      queue.metrics.averageResponseTime = queue.metrics.processingTime / queue.metrics.totalMessages;
      
    } catch (error) {
      message.status = MessageStatus.FAILED;
      console.error('Failed to process paid message:', error);
    }
  }

  /**
   * Schedule batch processing for free messages
   */
  private scheduleBatchProcessing(roomId: string): void {
    const batchIntervalMinutes = this.batchIntervals.get(roomId) || 30;
    const intervalMs = batchIntervalMinutes * 60 * 1000;
    
    // Clear any existing schedule
    if (this.batchSchedules.has(roomId)) {
      clearInterval(this.batchSchedules.get(roomId)!);
    }
    
    // Set up new schedule
    const batchTimer = setInterval(() => {
      this.processBatch(roomId);
    }, intervalMs);
    
    this.batchSchedules.set(roomId, batchTimer);
    
    // Calculate next batch time
    const queueKey = `${roomId}:${MessageTier.FREE}`;
    const queue = this.queues.get(queueKey);
    
    if (queue) {
      queue.nextBatchAt = new Date(Date.now() + intervalMs).toISOString();
    }
  }

  /**
   * Process a batch of free messages
   */
  private async processBatch(roomId: string): Promise<void> {
    const queueKey = `${roomId}:${MessageTier.FREE}`;
    const queue = this.queues.get(queueKey);
    
    if (!queue || queue.messages.length === 0) {
      return;
    }
    
    const batchId = uuidv4();
    const batchStartTime = new Date();
    
    // Get messages that are queued for processing
    const messagesToProcess = queue.messages.filter(
      msg => msg.status === MessageStatus.QUEUED
    );

    if (messagesToProcess.length === 0) {
      return;
    }
    
    // Group messages by similarity
    // In a real implementation, this would be more sophisticated
    const groupedMessages = this.groupSimilarMessages(messagesToProcess);
    
    // Notify the agent about the batch
    const webhookUrl = this.webhookUrls.get(roomId);
    if (webhookUrl) {
      await this.notifyAgent(roomId, messagesToProcess);
    }
    
    // Process each message in the batch
    for (const message of messagesToProcess) {
      try {
        message.status = MessageStatus.PROCESSING;
        message.batchId = batchId;
        
        // In a real implementation, we'd wait for the agent's response
        // Simulating processing time
        await new Promise(resolve => setTimeout(resolve, 200));
        
        message.status = MessageStatus.DELIVERED;
        message.processedAt = new Date().toISOString();
        
      } catch (error) {
        message.status = MessageStatus.FAILED;
        console.error('Failed to process message in batch:', error);
      }
    }
    
    // Update queue metrics
    const batchEndTime = new Date();
    const totalProcessingTime = batchEndTime.getTime() - batchStartTime.getTime();
    
    queue.lastProcessedAt = batchEndTime.toISOString();
    queue.nextBatchAt = new Date(Date.now() + (this.batchIntervals.get(roomId)! * 60 * 1000)).toISOString();
    
    // Update overall metrics
    const processedMessages = messagesToProcess.filter(
      msg => msg.status === MessageStatus.DELIVERED
    ).length;
    
    if (processedMessages > 0) {
      queue.metrics.processingTime += totalProcessingTime;
      queue.metrics.averageResponseTime = queue.metrics.processingTime / processedMessages;
    }
    
    // Remove processed messages from the queue
    queue.messages = queue.messages.filter(
      msg => msg.status === MessageStatus.QUEUED
    );
    
    // Recalculate oldest message
    if (queue.messages.length > 0) {
      const oldestMessage = queue.messages.reduce(
        (oldest, msg) => !oldest || new Date(msg.createdAt) < new Date(oldest) ? msg.createdAt : oldest, 
        null as string | null
      );
      queue.metrics.oldestMessage = oldestMessage;
    } else {
      queue.metrics.oldestMessage = null;
    }
  }

  /**
   * Group similar messages for batch processing
   * This is a simple implementation - in real-world, this would use more sophisticated NLP
   */
  private groupSimilarMessages(messages: Message[]): Message[][] {
    // In a real implementation, this would use semantic similarity
    // For now, just return the original array as a single group
    return [messages];
  }

  /**
   * Notify agent about new messages via webhook
   */
  private async notifyAgent(roomId: string, messages: Message[]): Promise<void> {
    const webhookUrl = this.webhookUrls.get(roomId);
    if (!webhookUrl) return;

    try {
      // In a real implementation, this would use a proper HTTP client with security
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: messages.length > 1 ? 'batch.ready' : 'message.new',
          data: {
            roomId,
            messages
          }
        })
      });

      if (!response.ok) {
        console.error('Failed to notify agent:', await response.text());
      }
    } catch (error) {
      console.error('Error notifying agent:', error);
    }
  }

  /**
   * Get queue status for a room
   */
  public getQueueStatus(roomId: string, tier: MessageTier): QueueStatus {
    const queueKey = `${roomId}:${tier}`;
    const queue = this.queues.get(queueKey);
    
    if (!queue) {
      throw new Error(`Queue not found for room ${roomId} and tier ${tier}`);
    }
    
    // For paid tier
    if (tier === MessageTier.PAID) {
      return {
        messageCount: queue.messages.length,
        estimatedWait: this.paidResponseTargets.get(roomId) || 5
      };
    }
    
    // For free tier
    return {
      messageCount: queue.messages.length,
      estimatedWait: this.batchIntervals.get(roomId) || 30,
      nextBatchAt: queue.nextBatchAt
    };
  }

  /**
   * Get all messages for a specific user in a room
   */
  public getUserMessages(roomId: string, userId: string): Message[] {
    const freeQueueKey = `${roomId}:${MessageTier.FREE}`;
    const paidQueueKey = `${roomId}:${MessageTier.PAID}`;
    
    const freeMessages = this.queues.get(freeQueueKey)?.messages || [];
    const paidMessages = this.queues.get(paidQueueKey)?.messages || [];
    
    return [...freeMessages, ...paidMessages]
      .filter(msg => msg.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  /**
   * Update batch interval for a room
   */
  public updateBatchInterval(roomId: string, newIntervalMinutes: number): void {
    this.batchIntervals.set(roomId, newIntervalMinutes);
    this.scheduleBatchProcessing(roomId);
  }

  /**
   * Set webhook URL for a room
   */
  public setWebhookUrl(roomId: string, url: string): void {
    this.webhookUrls.set(roomId, url);
  }

  /**
   * Clean up queues when room is deleted
   */
  public cleanupRoom(roomId: string): void {
    this.queues.delete(`${roomId}:${MessageTier.FREE}`);
    this.queues.delete(`${roomId}:${MessageTier.PAID}`);
    this.batchIntervals.delete(roomId);
    this.paidResponseTargets.delete(roomId);
    this.webhookUrls.delete(roomId);
    
    if (this.batchSchedules.has(roomId)) {
      clearInterval(this.batchSchedules.get(roomId)!);
      this.batchSchedules.delete(roomId);
    }
  }
}

// Export a singleton instance
export const messageQueueService = new MessageQueueService();
export default messageQueueService;