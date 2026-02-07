/**
 * Alert Service for GlassWall Platform
 * 
 * Handles system monitoring and alert management
 */

import apiService, { ApiResponse } from '@/services/ApiService';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export type MetricType = 
  | 'system.cpu' 
  | 'system.memory' 
  | 'system.disk' 
  | 'api.latency' 
  | 'api.errors' 
  | 'db.queries' 
  | 'db.latency'
  | 'queue.size'
  | 'queue.latency'
  | 'users.active'
  | 'messages.rate'
  | 'custom';

export type ComparisonOperator = '>' | '>=' | '<' | '<=' | '==' | '!=';

export type NotificationChannel = 'email' | 'sms' | 'webhook' | 'in-app';

export interface AlertThreshold {
  id: string;
  name: string;
  description: string;
  metricType: MetricType;
  customMetricName?: string;
  comparisonOperator: ComparisonOperator;
  thresholdValue: number;
  duration: number; // seconds the condition must persist before alerting
  severity: AlertSeverity;
  enabled: boolean;
  notifications: {
    channels: NotificationChannel[];
    recipients?: string[]; // emails, phone numbers, or webhook URLs
  };
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  thresholdId: string;
  timestamp: string;
  metricType: MetricType;
  customMetricName?: string;
  metricValue: number;
  thresholdValue: number;
  comparisonOperator: ComparisonOperator;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  context?: {
    values: Record<string, any>;
    links?: Array<{
      name: string;
      url: string;
    }>;
  };
}

export interface MetricDefinition {
  type: MetricType;
  name: string;
  description: string;
  unit: string;
  supportsCustomName?: boolean;
  defaultThresholds?: {
    warning?: number;
    error?: number;
    critical?: number;
  };
}

class AlertService {
  /**
   * Available metric types for monitoring
   */
  private metricDefinitions: MetricDefinition[] = [
    {
      type: 'system.cpu',
      name: 'CPU Usage',
      description: 'Percentage of CPU utilization',
      unit: '%',
      defaultThresholds: {
        warning: 70,
        error: 85,
        critical: 95
      }
    },
    {
      type: 'system.memory',
      name: 'Memory Usage',
      description: 'Percentage of memory utilization',
      unit: '%',
      defaultThresholds: {
        warning: 75,
        error: 90,
        critical: 95
      }
    },
    {
      type: 'system.disk',
      name: 'Disk Usage',
      description: 'Percentage of disk space utilization',
      unit: '%',
      defaultThresholds: {
        warning: 80,
        error: 90,
        critical: 95
      }
    },
    {
      type: 'api.latency',
      name: 'API Latency',
      description: 'Average response time for API requests',
      unit: 'ms',
      defaultThresholds: {
        warning: 500,
        error: 1000,
        critical: 2000
      }
    },
    {
      type: 'api.errors',
      name: 'API Error Rate',
      description: 'Percentage of API requests resulting in errors',
      unit: '%',
      defaultThresholds: {
        warning: 5,
        error: 10,
        critical: 20
      }
    },
    {
      type: 'db.queries',
      name: 'Database Query Rate',
      description: 'Number of database queries per second',
      unit: 'queries/s',
      defaultThresholds: {
        warning: 100,
        error: 500,
        critical: 1000
      }
    },
    {
      type: 'db.latency',
      name: 'Database Latency',
      description: 'Average response time for database queries',
      unit: 'ms',
      defaultThresholds: {
        warning: 100,
        error: 250,
        critical: 500
      }
    },
    {
      type: 'queue.size',
      name: 'Queue Size',
      description: 'Number of messages in the queue',
      unit: 'messages',
      defaultThresholds: {
        warning: 1000,
        error: 5000,
        critical: 10000
      }
    },
    {
      type: 'queue.latency',
      name: 'Queue Processing Time',
      description: 'Average time to process a message in the queue',
      unit: 'ms',
      defaultThresholds: {
        warning: 1000,
        error: 5000,
        critical: 10000
      }
    },
    {
      type: 'users.active',
      name: 'Active Users',
      description: 'Number of active users in the system',
      unit: 'users',
      defaultThresholds: {
        warning: 500,
        error: 1000,
        critical: 2000
      }
    },
    {
      type: 'messages.rate',
      name: 'Message Rate',
      description: 'Number of messages per minute',
      unit: 'messages/min',
      defaultThresholds: {
        warning: 1000,
        error: 5000,
        critical: 10000
      }
    },
    {
      type: 'custom',
      name: 'Custom Metric',
      description: 'User-defined custom metric',
      unit: 'value',
      supportsCustomName: true
    }
  ];
  
  /**
   * Get available metric definitions
   */
  public getMetricDefinitions(): MetricDefinition[] {
    return this.metricDefinitions;
  }
  
  /**
   * Get alert thresholds
   */
  public async getAlertThresholds(): Promise<ApiResponse<AlertThreshold[]>> {
    return apiService.get<AlertThreshold[]>('alerts/thresholds');
  }
  
  /**
   * Get alert threshold by ID
   */
  public async getAlertThresholdById(id: string): Promise<ApiResponse<AlertThreshold>> {
    return apiService.get<AlertThreshold>(`alerts/thresholds/${id}`);
  }
  
  /**
   * Create alert threshold
   */
  public async createAlertThreshold(
    threshold: Omit<AlertThreshold, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<AlertThreshold>> {
    return apiService.post<AlertThreshold>('alerts/thresholds', threshold);
  }
  
  /**
   * Update alert threshold
   */
  public async updateAlertThreshold(
    id: string,
    threshold: Partial<AlertThreshold>
  ): Promise<ApiResponse<AlertThreshold>> {
    return apiService.put<AlertThreshold>(`alerts/thresholds/${id}`, threshold);
  }
  
  /**
   * Delete alert threshold
   */
  public async deleteAlertThreshold(id: string): Promise<ApiResponse<void>> {
    return apiService.delete(`alerts/thresholds/${id}`);
  }
  
  /**
   * Enable/disable alert threshold
   */
  public async toggleAlertThreshold(id: string, enabled: boolean): Promise<ApiResponse<AlertThreshold>> {
    return apiService.patch<AlertThreshold>(`alerts/thresholds/${id}`, { enabled });
  }
  
  /**
   * Get active alerts
   */
  public async getActiveAlerts(): Promise<ApiResponse<Alert[]>> {
    return apiService.get<Alert[]>('alerts?status=active');
  }
  
  /**
   * Get all alerts
   */
  public async getAllAlerts(
    limit: number = 100,
    offset: number = 0,
    status?: AlertStatus,
    severity?: AlertSeverity,
    thresholdId?: string
  ): Promise<ApiResponse<Alert[]>> {
    let url = `alerts?limit=${limit}&offset=${offset}`;
    
    if (status) url += `&status=${status}`;
    if (severity) url += `&severity=${severity}`;
    if (thresholdId) url += `&thresholdId=${thresholdId}`;
    
    return apiService.get<Alert[]>(url);
  }
  
  /**
   * Get alert by ID
   */
  public async getAlertById(id: string): Promise<ApiResponse<Alert>> {
    return apiService.get<Alert>(`alerts/${id}`);
  }
  
  /**
   * Acknowledge alert
   */
  public async acknowledgeAlert(id: string): Promise<ApiResponse<Alert>> {
    return apiService.post<Alert>(`alerts/${id}/acknowledge`, {});
  }
  
  /**
   * Resolve alert
   */
  public async resolveAlert(id: string): Promise<ApiResponse<Alert>> {
    return apiService.post<Alert>(`alerts/${id}/resolve`, {});
  }
  
  /**
   * Test alert threshold
   * This simulates an alert being triggered for the given threshold
   */
  public async testAlertThreshold(id: string): Promise<ApiResponse<Alert>> {
    return apiService.post<Alert>(`alerts/thresholds/${id}/test`, {});
  }
  
  /**
   * Get current metric value
   */
  public async getMetricValue(
    metricType: MetricType,
    customMetricName?: string
  ): Promise<ApiResponse<{ value: number; timestamp: string }>> {
    let url = `metrics/${metricType}`;
    if (customMetricName && metricType === 'custom') {
      url += `?name=${encodeURIComponent(customMetricName)}`;
    }
    
    return apiService.get<{ value: number; timestamp: string }>(url);
  }
  
  /**
   * Get metric history
   */
  public async getMetricHistory(
    metricType: MetricType,
    timeRange: 'hour' | 'day' | 'week' = 'hour',
    customMetricName?: string
  ): Promise<ApiResponse<Array<{ value: number; timestamp: string }>>> {
    let url = `metrics/${metricType}/history?timeRange=${timeRange}`;
    if (customMetricName && metricType === 'custom') {
      url += `&name=${encodeURIComponent(customMetricName)}`;
    }
    
    return apiService.get<Array<{ value: number; timestamp: string }>>(url);
  }
  
  /**
   * Get alert severity color class
   */
  public getSeverityColorClass(severity: AlertSeverity): string {
    switch (severity) {
      case 'info':
        return 'bg-blue-600/20 text-blue-400';
      case 'warning':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'error':
        return 'bg-red-600/20 text-red-400';
      case 'critical':
        return 'bg-purple-600/20 text-purple-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  }
  
  /**
   * Get formatted comparison operator
   */
  public getFormattedOperator(operator: ComparisonOperator): string {
    switch (operator) {
      case '>': return 'greater than';
      case '>=': return 'greater than or equal to';
      case '<': return 'less than';
      case '<=': return 'less than or equal to';
      case '==': return 'equal to';
      case '!=': return 'not equal to';
      default: return operator;
    }
  }
  
  /**
   * Format alert message
   */
  public formatAlertMessage(alert: Alert): string {
    const metricDefinition = this.metricDefinitions.find(m => m.type === alert.metricType);
    const metricName = alert.customMetricName || metricDefinition?.name || alert.metricType;
    const operatorText = this.getFormattedOperator(alert.comparisonOperator);
    
    return `${metricName} is ${operatorText} ${alert.thresholdValue} (current value: ${alert.metricValue})`;
  }
}

// Create and export a singleton instance
const alertService = new AlertService();
export default alertService;