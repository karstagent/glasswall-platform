import { ApiService } from './ApiService';

export interface QueueMetrics {
  queueName: string;
  messageCount: number;
  processingRate: number;
  averageProcessingTime: number;
  errorRate: number;
  oldestMessage: number; // Age in seconds
  status: 'healthy' | 'warning' | 'critical';
}

export interface QueueHistoryPoint {
  timestamp: string;
  messageCount: number;
  processingRate: number;
  errorRate: number;
}

export interface ErrorTypeDistribution {
  name: string;
  value: number;
}

export interface MessageTypeDistribution {
  name: string;
  value: number;
}

export interface QueueConfig {
  name: string;
  type: 'standard' | 'priority' | 'fifo';
  replicas: number;
  consumerGroups: number;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    initialDelayMs: number;
    maxDelayMs: number;
  };
  throttling: {
    enabled: boolean;
    rate: number;
    burstLimit: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class QueueServiceClass {
  private apiService: ApiService;
  
  constructor() {
    this.apiService = new ApiService();
  }
  
  /**
   * Get metrics for all queues
   */
  async getAllQueueMetrics(): Promise<ApiResponse<QueueMetrics[]>> {
    try {
      const response = await this.apiService.get('/api/queues/metrics');
      return response;
    } catch (error) {
      console.error('Error fetching queue metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get metrics for a specific queue
   */
  async getQueueMetrics(queueName: string): Promise<ApiResponse<QueueMetrics>> {
    try {
      const response = await this.apiService.get(`/api/queues/${queueName}/metrics`);
      return response;
    } catch (error) {
      console.error(`Error fetching metrics for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get historical metrics for a queue
   */
  async getQueueHistory(
    queueName: string, 
    timeframe: 'hour' | 'day' | 'week'
  ): Promise<ApiResponse<QueueHistoryPoint[]>> {
    try {
      const response = await this.apiService.get(
        `/api/queues/${queueName}/history?timeframe=${timeframe}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching history for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get error type distribution for a queue
   */
  async getQueueErrorTypes(queueName: string): Promise<ApiResponse<ErrorTypeDistribution[]>> {
    try {
      const response = await this.apiService.get(`/api/queues/${queueName}/errors`);
      return response;
    } catch (error) {
      console.error(`Error fetching error types for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get message type distribution for a queue
   */
  async getQueueMessageTypes(queueName: string): Promise<ApiResponse<MessageTypeDistribution[]>> {
    try {
      const response = await this.apiService.get(`/api/queues/${queueName}/messages/types`);
      return response;
    } catch (error) {
      console.error(`Error fetching message types for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get configuration for a queue
   */
  async getQueueConfig(queueName: string): Promise<ApiResponse<QueueConfig>> {
    try {
      const response = await this.apiService.get(`/api/queues/${queueName}/config`);
      return response;
    } catch (error) {
      console.error(`Error fetching configuration for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Update configuration for a queue
   */
  async updateQueueConfig(queueName: string, config: Partial<QueueConfig>): Promise<ApiResponse<QueueConfig>> {
    try {
      const response = await this.apiService.patch(`/api/queues/${queueName}/config`, config);
      return response;
    } catch (error) {
      console.error(`Error updating configuration for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Purge messages from a queue
   */
  async purgeQueue(queueName: string): Promise<ApiResponse<{ purgedCount: number }>> {
    try {
      const response = await this.apiService.post(`/api/queues/${queueName}/purge`);
      return response;
    } catch (error) {
      console.error(`Error purging queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Pause processing for a queue
   */
  async pauseQueue(queueName: string): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await this.apiService.post(`/api/queues/${queueName}/pause`);
      return response;
    } catch (error) {
      console.error(`Error pausing queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Resume processing for a queue
   */
  async resumeQueue(queueName: string): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await this.apiService.post(`/api/queues/${queueName}/resume`);
      return response;
    } catch (error) {
      console.error(`Error resuming queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Send a test message to a queue
   */
  async sendTestMessage(
    queueName: string, 
    messageType: 'standard' | 'priority' | 'delayed',
    payload?: any
  ): Promise<ApiResponse<{ messageId: string }>> {
    try {
      const response = await this.apiService.post(`/api/queues/${queueName}/test`, {
        messageType,
        payload: payload || { testMessage: true, timestamp: new Date().toISOString() }
      });
      return response;
    } catch (error) {
      console.error(`Error sending test message to queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get batch processing status for a queue
   */
  async getBatchProcessingStatus(queueName: string): Promise<ApiResponse<{
    enabled: boolean;
    batchSize: number;
    batchInterval: number;
    currentBatchProgress: number;
    lastBatchCompleted: string;
    averageBatchDuration: number;
  }>> {
    try {
      const response = await this.apiService.get(`/api/queues/${queueName}/batch`);
      return response;
    } catch (error) {
      console.error(`Error fetching batch processing status for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Update batch processing configuration
   */
  async updateBatchProcessingConfig(
    queueName: string,
    config: {
      enabled: boolean;
      batchSize?: number;
      batchInterval?: number;
    }
  ): Promise<ApiResponse<{
    enabled: boolean;
    batchSize: number;
    batchInterval: number;
  }>> {
    try {
      const response = await this.apiService.patch(`/api/queues/${queueName}/batch`, config);
      return response;
    } catch (error) {
      console.error(`Error updating batch processing config for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
}

// Create a singleton instance
const QueueService = new QueueServiceClass();

export default QueueService;