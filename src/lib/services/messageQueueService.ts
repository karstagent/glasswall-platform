import { Message, MessageQueue, MessageStatus, MessageTier, QueueStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo purposes
// In production, this would use a database
const messageQueues: Record<string, MessageQueue> = {};
const messages: Record<string, Message> = {};

export const messageQueueService = {
  /**
   * Get or create a message queue for a room and tier
   */
  getOrCreateQueue(roomId: string, tier: MessageTier): MessageQueue {
    const queueId = `${roomId}_${tier}`;
    
    if (!messageQueues[queueId]) {
      messageQueues[queueId] = {
        roomId,
        tier,
        messages: [],
        metrics: {
          totalMessages: 0,
          processingTime: 0,
          averageResponseTime: 0,
          oldestMessage: null
        }
      };
    }
    
    return messageQueues[queueId];
  },
  
  /**
   * Add a message to the queue
   */
  async addMessage(
    roomId: string,
    userId: string,
    content: string,
    tier: MessageTier
  ): Promise<Message> {
    const message: Message = {
      id: uuidv4(),
      roomId,
      userId,
      content,
      tier,
      status: MessageStatus.QUEUED,
      createdAt: new Date().toISOString(),
    };
    
    // Store the message
    messages[message.id] = message;
    
    // Add to appropriate queue
    const queue = this.getOrCreateQueue(roomId, tier);
    queue.messages.push(message);
    queue.metrics.totalMessages++;
    
    if (!queue.metrics.oldestMessage) {
      queue.metrics.oldestMessage = message.createdAt;
    }
    
    // For paid messages, start processing immediately
    if (tier === MessageTier.PAID) {
      setTimeout(() => this.processMessage(message.id), 2000); // Simulate immediate processing
      return message;
    }
    
    // For free messages, they'll be processed in batch
    // We'll simulate this with a short delay for the demo
    if (!queue.nextBatchAt) {
      const batchDelay = 5 * 60 * 1000; // 5 minutes for the batch
      queue.nextBatchAt = new Date(Date.now() + batchDelay).toISOString();
      
      // Schedule the batch processing
      setTimeout(() => this.processBatch(roomId, tier), batchDelay);
    }
    
    return message;
  },
  
  /**
   * Process a single message (typically used for paid messages)
   */
  async processMessage(messageId: string): Promise<void> {
    const message = messages[messageId];
    if (!message) return;
    
    // Update status to processing
    message.status = MessageStatus.PROCESSING;
    
    // Simulate processing time
    setTimeout(() => {
      // Update status to delivered
      message.status = MessageStatus.DELIVERED;
      message.processedAt = new Date().toISOString();
      
      // Update queue metrics
      const queue = this.getOrCreateQueue(message.roomId, message.tier);
      const processingTime = new Date(message.processedAt).getTime() - 
                             new Date(message.createdAt).getTime();
      
      queue.metrics.processingTime = processingTime;
      
      // Update average response time
      const totalMessages = queue.metrics.totalMessages;
      const currentAverage = queue.metrics.averageResponseTime;
      queue.metrics.averageResponseTime = 
        (currentAverage * (totalMessages - 1) + processingTime) / totalMessages;
      
      // Update lastProcessedAt
      queue.lastProcessedAt = message.processedAt;
      
      // If using webhooks, we would notify the agent here
      console.log(`Message ${messageId} processed and delivered`);
    }, 3000); // Simulate processing time
  },
  
  /**
   * Process a batch of messages (used for free messages)
   */
  async processBatch(roomId: string, tier: MessageTier): Promise<void> {
    const queue = this.getOrCreateQueue(roomId, tier);
    
    // Find messages with QUEUED status
    const queuedMessages = queue.messages.filter(
      (msg) => msg.status === MessageStatus.QUEUED
    );
    
    if (queuedMessages.length === 0) {
      // Reset batch timer
      queue.nextBatchAt = undefined;
      return;
    }
    
    // Batch ID for tracking
    const batchId = uuidv4();
    
    // Process each message
    for (const message of queuedMessages) {
      message.status = MessageStatus.PROCESSING;
      message.batchId = batchId;
      
      // We'll simulate the processing time
      setTimeout(() => {
        message.status = MessageStatus.DELIVERED;
        message.processedAt = new Date().toISOString();
        
        // Update queue metrics
        queue.lastProcessedAt = message.processedAt;
      }, 2000); // Simulate processing time
    }
    
    // After batch processing, update metrics
    setTimeout(() => {
      // Calculate processing times for this batch
      const processingTimes = queuedMessages
        .filter((msg) => msg.processedAt)
        .map((msg) => new Date(msg.processedAt!).getTime() - new Date(msg.createdAt).getTime());
      
      if (processingTimes.length > 0) {
        const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
        
        // Update metrics
        queue.metrics.processingTime = avgProcessingTime;
        
        // Update average response time with moving average
        const totalMessages = queue.metrics.totalMessages;
        const currentAverage = queue.metrics.averageResponseTime;
        queue.metrics.averageResponseTime = 
          (currentAverage * (totalMessages - processingTimes.length) + 
           avgProcessingTime * processingTimes.length) / totalMessages;
      }
      
      // Reset the next batch time
      queue.nextBatchAt = undefined;
      queue.metrics.oldestMessage = null;
      
      // Find new oldest message if any are still queued
      const remainingQueued = queue.messages.filter(
        (msg) => msg.status === MessageStatus.QUEUED
      );
      
      if (remainingQueued.length > 0) {
        // Sort by creation time
        remainingQueued.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        queue.metrics.oldestMessage = remainingQueued[0].createdAt;
        
        // Schedule the next batch
        const batchDelay = 5 * 60 * 1000; // 5 minutes for next batch
        queue.nextBatchAt = new Date(Date.now() + batchDelay).toISOString();
        
        // Schedule the batch processing
        setTimeout(() => this.processBatch(roomId, tier), batchDelay);
      }
      
      console.log(`Batch ${batchId} processed for room ${roomId}`);
    }, 5000); // Time to process the whole batch
  },
  
  /**
   * Get all messages for a user in a room
   */
  getUserMessages(roomId: string, userId: string): Message[] {
    return Object.values(messages).filter(
      (msg) => msg.roomId === roomId && msg.userId === userId
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  /**
   * Get queue status for a room and tier
   */
  getQueueStatus(roomId: string, tier: MessageTier): QueueStatus {
    const queue = this.getOrCreateQueue(roomId, tier);
    
    // Count queued messages
    const queuedMessages = queue.messages.filter(
      (msg) => msg.status === MessageStatus.QUEUED
    ).length;
    
    // Calculate estimated wait time based on queue metrics
    let estimatedWait = 0;
    
    if (tier === MessageTier.PAID) {
      // For paid, estimate based on average processing time
      estimatedWait = queue.metrics.processingTime > 0 
        ? queue.metrics.processingTime
        : 5000; // Default to 5 seconds if no data
    } else {
      // For free, estimate based on time until next batch
      if (queue.nextBatchAt) {
        estimatedWait = new Date(queue.nextBatchAt).getTime() - Date.now();
        if (estimatedWait < 0) estimatedWait = 0;
      } else {
        estimatedWait = 5 * 60 * 1000; // Default 5 minutes
      }
    }
    
    return {
      messageCount: queuedMessages,
      estimatedWait: Math.round(estimatedWait / 1000), // Convert to seconds
      nextBatchAt: queue.nextBatchAt
    };
  }
};