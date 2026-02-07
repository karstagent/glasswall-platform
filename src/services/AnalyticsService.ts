/**
 * Analytics Service for GlassWall Platform
 * 
 * Handles fetching and processing analytics data
 */

import apiService, { ApiResponse } from './ApiService';

export interface MessageStats {
  total: number;
  byTier: {
    free: number;
    paid: number;
  };
  byStatus: {
    queued: number;
    processing: number;
    delivered: number;
    failed: number;
  };
}

export interface RoomStats {
  totalRooms: number;
  activeRooms: number;
  messagesByRoom: Array<{
    roomId: string;
    roomName: string;
    messageCount: number;
  }>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
}

export interface TimeSeriesData {
  timestamp: string;
  messageCount: number;
  activeUsers: number;
  averageProcessingTime: number;
}

export interface PerformanceMetrics {
  averageQueueTime: number;
  averageProcessingTime: number;
  systemLoad: number;
}

export interface Analytics {
  messageStats: MessageStats;
  roomStats: RoomStats;
  userStats: UserStats;
  timeSeriesData: TimeSeriesData[];
  performanceMetrics: PerformanceMetrics;
}

class AnalyticsService {
  /**
   * Get complete analytics data
   */
  public async getAnalytics(timeRange: 'day' | 'week' | 'month' = 'day'): Promise<ApiResponse<Analytics>> {
    return apiService.getAnalytics(timeRange);
  }
  
  /**
   * Get message statistics
   */
  public async getMessageStats(timeRange: 'day' | 'week' | 'month' = 'day'): Promise<ApiResponse<MessageStats>> {
    return apiService.getMessageStats(timeRange);
  }
  
  /**
   * Get time series data for charts
   */
  public async getTimeSeriesData(
    timeRange: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<TimeSeriesData[]>> {
    return apiService.get<TimeSeriesData[]>(`analytics/timeseries?timeRange=${timeRange}`);
  }
  
  /**
   * Get performance metrics
   */
  public async getPerformanceMetrics(): Promise<ApiResponse<PerformanceMetrics>> {
    return apiService.get<PerformanceMetrics>('analytics/performance');
  }
  
  /**
   * Get room statistics
   */
  public async getRoomStats(): Promise<ApiResponse<RoomStats>> {
    return apiService.get<RoomStats>('analytics/rooms');
  }
  
  /**
   * Get user statistics
   */
  public async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiService.get<UserStats>('analytics/users');
  }
  
  /**
   * Format time values (seconds) to readable string
   */
  public formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs.toFixed(0)}s`;
    }
  }
  
  /**
   * Process time series data to ensure consistent intervals
   * and fill in any gaps in the data
   */
  public processTimeSeriesData(
    data: TimeSeriesData[],
    timeRange: 'day' | 'week' | 'month' = 'day'
  ): TimeSeriesData[] {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Sort by timestamp
    const sortedData = [...data].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    // For demo purposes, return the sorted data
    // In a real implementation, we would fill gaps and normalize intervals
    return sortedData;
  }
}

// Create and export a singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;