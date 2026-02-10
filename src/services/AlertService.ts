/**
 * Alert Service
 * 
 * Manages alerts, notifications, and alert preferences
 */

import { ApiService } from './ApiService';
import { 
  Alert, 
  AlertFilterCriteria, 
  AlertStatus, 
  AlertGroup,
  NotificationPreference
} from '@/types/alerts';

export class AlertService {
  /**
   * Get all alerts, optionally filtered
   */
  static async getAlerts(filters?: AlertFilterCriteria): Promise<Alert[]> {
    try {
      const response = await ApiService.get<Alert[]>('/api/alerts', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Get an alert by ID
   */
  static async getAlert(alertId: string): Promise<Alert> {
    try {
      const response = await ApiService.get<Alert>(`/api/alerts/${alertId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Get alert groups
   */
  static async getAlertGroups(filters?: AlertFilterCriteria): Promise<AlertGroup[]> {
    try {
      const response = await ApiService.get<AlertGroup[]>('/api/alerts/groups', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching alert groups:', error);
      throw error;
    }
  }

  /**
   * Get alerts by group ID
   */
  static async getAlertsByGroup(groupId: string): Promise<Alert[]> {
    try {
      const response = await ApiService.get<Alert[]>(`/api/alerts/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching alerts for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(alertId: string): Promise<Alert> {
    try {
      const response = await ApiService.post<Alert>(`/api/alerts/${alertId}/acknowledge`, {});
      return response.data;
    } catch (error) {
      console.error(`Error acknowledging alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Acknowledge multiple alerts
   */
  static async acknowledgeAlerts(alertIds: string[]): Promise<void> {
    try {
      await ApiService.post('/api/alerts/acknowledge', { alertIds });
    } catch (error) {
      console.error('Error acknowledging multiple alerts:', error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(alertId: string, resolution?: string): Promise<Alert> {
    try {
      const response = await ApiService.post<Alert>(`/api/alerts/${alertId}/resolve`, {
        resolution
      });
      return response.data;
    } catch (error) {
      console.error(`Error resolving alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Resolve multiple alerts
   */
  static async resolveAlerts(alertIds: string[], resolution?: string): Promise<void> {
    try {
      await ApiService.post('/api/alerts/resolve', {
        alertIds,
        resolution
      });
    } catch (error) {
      console.error('Error resolving multiple alerts:', error);
      throw error;
    }
  }

  /**
   * Get alert statistics
   */
  static async getAlertStats(): Promise<{
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    acknowledged: number;
    resolved: number;
  }> {
    try {
      const response = await ApiService.get('/api/alerts/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching alert stats:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences for a user
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreference[]> {
    try {
      const response = await ApiService.get<NotificationPreference[]>(`/api/users/${userId}/notification-preferences`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification preferences for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Save notification preferences for a user
   */
  static async saveNotificationPreferences(userId: string, preferences: NotificationPreference[]): Promise<void> {
    try {
      await ApiService.put(`/api/users/${userId}/notification-preferences`, preferences);
    } catch (error) {
      console.error(`Error saving notification preferences for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Test a notification channel
   */
  static async testNotificationChannel(userId: string, channel: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ApiService.post<{ success: boolean; message: string }>(
        `/api/users/${userId}/test-notification`,
        { channel }
      );
      return response.data;
    } catch (error) {
      console.error(`Error testing notification channel for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get recent notifications
   */
  static async getRecentNotifications(limit: number = 10): Promise<any[]> {
    try {
      const response = await ApiService.get<any[]>('/api/notifications/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notifications as read
   */
  static async markNotificationsAsRead(notificationIds: string[]): Promise<void> {
    try {
      await ApiService.post('/api/notifications/mark-read', { notificationIds });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  /**
   * Create a test alert (for testing purposes)
   */
  static async createTestAlert(severity: string, category: string): Promise<Alert> {
    try {
      const response = await ApiService.post<Alert>('/api/alerts/test', {
        severity,
        category
      });
      return response.data;
    } catch (error) {
      console.error('Error creating test alert:', error);
      throw error;
    }
  }
}