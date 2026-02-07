import { ApiService } from './ApiService';
import { QueueService } from './QueueService';

export interface BatchProcessingConfig {
  queueName: string;
  enabled: boolean;
  batchSize: number;
  batchInterval: number; // in milliseconds
  priority: 'fifo' | 'priority-first' | 'time-sensitive-first';
  maxConcurrentBatches: number;
}

export interface BatchStatus {
  queueName: string;
  enabled: boolean;
  batchSize: number;
  batchInterval: number;
  priority: 'fifo' | 'priority-first' | 'time-sensitive-first';
  maxConcurrentBatches: number;
  currentBatchProgress: number;
  lastBatchCompleted: string;
  averageBatchDuration: number;
  activeBatches: number;
}

export interface BatchJob {
  id: string;
  queueName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  messageCount: number;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  errorCount: number;
}

export interface RetryPolicy {
  enabled: boolean;
  maxRetries: number;
  strategy: 'linear' | 'exponential' | 'fixed';
  initialDelayMs: number;
  maxDelayMs: number;
}

export interface RetryStats {
  queueName: string;
  totalRetries: number;
  successAfterRetry: number;
  failedAfterMaxRetries: number;
  averageRetriesBeforeSuccess: number;
  retryDistribution: {
    attempt: number;
    count: number;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class BatchProcessingServiceClass {
  private apiService: ApiService;
  
  constructor() {
    this.apiService = new ApiService();
  }
  
  /**
   * Get batch processing configurations for all queues
   */
  async getAllBatchConfigurations(): Promise<ApiResponse<BatchProcessingConfig[]>> {
    try {
      const response = await this.apiService.get('/api/batch/configs');
      return response;
    } catch (error) {
      console.error('Error fetching batch configurations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get batch processing configuration for a specific queue
   */
  async getBatchConfiguration(queueName: string): Promise<ApiResponse<BatchProcessingConfig>> {
    try {
      const response = await this.apiService.get(`/api/batch/configs/${queueName}`);
      return response;
    } catch (error) {
      console.error(`Error fetching batch configuration for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Update batch processing configuration
   */
  async updateBatchConfiguration(
    queueName: string, 
    config: Partial<BatchProcessingConfig>
  ): Promise<ApiResponse<BatchProcessingConfig>> {
    try {
      const response = await this.apiService.patch(`/api/batch/configs/${queueName}`, config);
      return response;
    } catch (error) {
      console.error(`Error updating batch configuration for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get batch processing status for all queues
   */
  async getAllBatchStatuses(): Promise<ApiResponse<BatchStatus[]>> {
    try {
      const response = await this.apiService.get('/api/batch/status');
      return response;
    } catch (error) {
      console.error('Error fetching batch statuses:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get batch processing status for a specific queue
   */
  async getBatchStatus(queueName: string): Promise<ApiResponse<BatchStatus>> {
    try {
      const response = await this.apiService.get(`/api/batch/status/${queueName}`);
      return response;
    } catch (error) {
      console.error(`Error fetching batch status for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get batch jobs for a queue
   */
  async getBatchJobs(
    queueName: string,
    status?: 'pending' | 'processing' | 'completed' | 'failed',
    limit: number = 10,
    offset: number = 0
  ): Promise<ApiResponse<{
    jobs: BatchJob[];
    total: number;
  }>> {
    try {
      let url = `/api/batch/jobs/${queueName}?limit=${limit}&offset=${offset}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await this.apiService.get(url);
      return response;
    } catch (error) {
      console.error(`Error fetching batch jobs for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Start a batch job immediately
   */
  async startBatchJob(queueName: string): Promise<ApiResponse<BatchJob>> {
    try {
      const response = await this.apiService.post(`/api/batch/jobs/${queueName}`);
      return response;
    } catch (error) {
      console.error(`Error starting batch job for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Cancel a batch job
   */
  async cancelBatchJob(jobId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.apiService.delete(`/api/batch/jobs/${jobId}`);
      return response;
    } catch (error) {
      console.error(`Error canceling batch job ${jobId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get retry policy for a queue
   */
  async getRetryPolicy(queueName: string): Promise<ApiResponse<RetryPolicy>> {
    try {
      const response = await this.apiService.get(`/api/batch/retry-policy/${queueName}`);
      return response;
    } catch (error) {
      console.error(`Error fetching retry policy for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Update retry policy for a queue
   */
  async updateRetryPolicy(
    queueName: string,
    policy: Partial<RetryPolicy>
  ): Promise<ApiResponse<RetryPolicy>> {
    try {
      const response = await this.apiService.patch(`/api/batch/retry-policy/${queueName}`, policy);
      return response;
    } catch (error) {
      console.error(`Error updating retry policy for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get retry statistics for a queue
   */
  async getRetryStats(
    queueName: string, 
    timeframe: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<RetryStats>> {
    try {
      const response = await this.apiService.get(`/api/batch/retry-stats/${queueName}?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      console.error(`Error fetching retry stats for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Reset retry counters for a message
   */
  async resetMessageRetries(
    queueName: string,
    messageId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.apiService.post(`/api/batch/reset-retries/${queueName}/${messageId}`);
      return response;
    } catch (error) {
      console.error(`Error resetting retries for message ${messageId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get messages that have failed after max retries
   */
  async getFailedMessages(
    queueName: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ApiResponse<{
    messages: Array<{
      id: string;
      queueName: string;
      retries: number;
      lastErrorMessage: string;
      lastErrorTimestamp: string;
      payload: any;
    }>;
    total: number;
  }>> {
    try {
      const response = await this.apiService.get(
        `/api/batch/failed-messages/${queueName}?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching failed messages for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Requeue a failed message
   */
  async requeueFailedMessage(
    queueName: string,
    messageId: string,
    resetRetries: boolean = true
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.apiService.post(`/api/batch/requeue/${queueName}/${messageId}`, {
        resetRetries
      });
      return response;
    } catch (error) {
      console.error(`Error requeuing failed message ${messageId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  
  /**
   * Get batch processing performance metrics
   */
  async getBatchPerformance(
    queueName: string,
    timeframe: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<{
    averageBatchSize: number;
    averageBatchDuration: number;
    messagesPerSecond: number;
    batchesPerHour: number;
    errorRate: number;
    history: Array<{
      timestamp: string;
      batchSize: number;
      duration: number;
      errorCount: number;
    }>;
  }>> {
    try {
      const response = await this.apiService.get(
        `/api/batch/performance/${queueName}?timeframe=${timeframe}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching batch performance for queue ${queueName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
}

// Create a singleton instance
const BatchProcessingService = new BatchProcessingServiceClass();

export default BatchProcessingService;