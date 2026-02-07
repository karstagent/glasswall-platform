/**
 * React Hook for Analytics Data
 */

import { useState, useEffect, useCallback } from 'react';
import analyticsService, { 
  Analytics,
  MessageStats,
  RoomStats,
  UserStats,
  PerformanceMetrics,
  TimeSeriesData
} from '../services/AnalyticsService';

interface UseAnalyticsOptions {
  autoFetch?: boolean;
  refreshInterval?: number; // in ms
  timeRange?: 'day' | 'week' | 'month';
}

interface UseAnalyticsResult {
  analytics: Analytics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setTimeRange: (range: 'day' | 'week' | 'month') => void;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsResult {
  const { 
    autoFetch = true, 
    refreshInterval = 60000, // Default: 1 minute
    timeRange: initialTimeRange = 'day'
  } = options;
  
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>(initialTimeRange);
  
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyticsService.getAnalytics(timeRange);
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);
  
  // Initial fetch and refresh interval
  useEffect(() => {
    if (autoFetch) {
      fetchAnalytics();
      
      const intervalId = setInterval(fetchAnalytics, refreshInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [autoFetch, fetchAnalytics, refreshInterval]);
  
  // Handle time range changes
  useEffect(() => {
    if (autoFetch) {
      fetchAnalytics();
    }
  }, [timeRange, autoFetch, fetchAnalytics]);
  
  return {
    analytics,
    isLoading,
    error,
    refresh: fetchAnalytics,
    setTimeRange
  };
}

/**
 * Hook for message statistics only
 */
export function useMessageStats(
  options: UseAnalyticsOptions = {}
): {
  messageStats: MessageStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    autoFetch = true, 
    refreshInterval = 60000,
    timeRange = 'day'
  } = options;
  
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyticsService.getMessageStats(timeRange);
      
      if (response.success && response.data) {
        setMessageStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch message statistics');
      }
    } catch (err) {
      console.error('Error fetching message stats:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);
  
  // Initial fetch and refresh interval
  useEffect(() => {
    if (autoFetch) {
      fetchStats();
      
      const intervalId = setInterval(fetchStats, refreshInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [autoFetch, fetchStats, refreshInterval]);
  
  return {
    messageStats,
    isLoading,
    error,
    refresh: fetchStats
  };
}

/**
 * Hook for time series data only
 */
export function useTimeSeriesData(
  options: UseAnalyticsOptions = {}
): {
  timeSeriesData: TimeSeriesData[] | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    autoFetch = true, 
    refreshInterval = 60000,
    timeRange = 'day'
  } = options;
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyticsService.getTimeSeriesData(timeRange);
      
      if (response.success && response.data) {
        // Process data to ensure consistent intervals
        const processedData = analyticsService.processTimeSeriesData(response.data, timeRange);
        setTimeSeriesData(processedData);
      } else {
        setError(response.error || 'Failed to fetch time series data');
      }
    } catch (err) {
      console.error('Error fetching time series data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);
  
  // Initial fetch and refresh interval
  useEffect(() => {
    if (autoFetch) {
      fetchData();
      
      const intervalId = setInterval(fetchData, refreshInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [autoFetch, fetchData, refreshInterval]);
  
  return {
    timeSeriesData,
    isLoading,
    error,
    refresh: fetchData
  };
}