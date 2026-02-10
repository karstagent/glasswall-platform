/**
 * Types for the alerts and notifications system
 */

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CLOSED' | 'IGNORED';

export type AlertCategory = 'SYSTEM' | 'SECURITY' | 'PERFORMANCE' | 'QUEUE' | 'USER' | 'INTEGRATION';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'WEBHOOK';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  source: string;
  timestamp: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  metadata: Record<string, any>;
  relatedAlertIds?: string[];
}

export interface NotificationPreference {
  severity: AlertSeverity;
  enabled: boolean;
  channels: NotificationChannel[];
  minInterval: number; // minutes between notifications
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM
  quietHoursEnd: string; // HH:MM
  categories: AlertCategory[];
}

export interface DeliverySchedule {
  type: 'IMMEDIATE' | 'SCHEDULED' | 'DIGEST';
  interval?: number; // minutes, for SCHEDULED
  time?: string; // HH:MM, for DIGEST
  days?: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
}

export interface AlertFilterCriteria {
  severities?: AlertSeverity[];
  statuses?: AlertStatus[];
  categories?: AlertCategory[];
  sources?: string[];
  startDate?: string;
  endDate?: string;
  searchText?: string;
}

export interface AlertGroup {
  id: string;
  title: string;
  count: number;
  mostRecentAlert: Alert;
  severity: AlertSeverity;
  category: AlertCategory;
  isExpanded: boolean;
  alerts: Alert[];
}