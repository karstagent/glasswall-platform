/**
 * Core data types for the GlassWall Platform API
 */

/**
 * User authentication levels
 */
export enum UserTier {
  FREE = 'free',
  PRIORITY = 'priority',
  UNLIMITED = 'unlimited'
}

/**
 * Message priority levels
 */
export enum MessagePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Agent availability status
 */
export enum AgentStatus {
  ONLINE = 'online',
  BUSY = 'busy',
  AWAY = 'away',
  OFFLINE = 'offline'
}

/**
 * User profile information
 */
export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  tier: UserTier;
  createdAt: string;
  messageCount: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  subscription?: {
    plan: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  };
}

/**
 * Agent profile information
 */
export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  status: AgentStatus;
  capabilities: string[];
  stats: {
    messageCount: number;
    responseTime: number;
    userCount: number;
  };
  settings: {
    responseWindow: number;
    batchSize: number;
    allowPriority: boolean;
    customPricing?: {
      enabled: boolean;
      pricePerMessage?: number;
      subscriptionPrice?: number;
    };
  };
}

/**
 * Chat room message
 */
export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderType: 'user' | 'agent';
  content: string;
  priority: MessagePriority;
  status: 'pending' | 'read' | 'replied';
  createdAt: string;
  processedAt?: string;
  repliedAt?: string;
  metadata?: {
    tier: UserTier;
    priority: boolean;
    batch: string;
    context?: string[];
  };
}

/**
 * Chat room information
 */
export interface ChatRoom {
  id: string;
  agentId: string;
  name: string;
  description: string;
  createdAt: string;
  stats: {
    messageCount: number;
    userCount: number;
    responseTime: number;
  };
  settings: {
    allowAnonymous: boolean;
    requireApproval: boolean;
    public: boolean;
  };
}

/**
 * Analytics data structure
 */
export interface Analytics {
  messageVolume: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  userEngagement: {
    newUsers: number;
    returningUsers: number;
    averageSessionTime: number;
  };
  responseMetrics: {
    averageResponseTime: number;
    responseRate: number;
    userSatisfaction: number;
  };
  subscription: {
    conversionRate: number;
    churnRate: number;
    revenueTotal: number;
  };
}

/**
 * Message batch for processing
 */
export interface MessageBatch {
  id: string;
  agentId: string;
  messages: Message[];
  createdAt: string;
  processedAt?: string;
  status: 'pending' | 'processing' | 'completed';
  stats: {
    messageCount: number;
    priorityCount: number;
    processingTime?: number;
  };
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  [UserTier.FREE]: {
    messagesPerHour: number;
    messagesPerDay: number;
  };
  [UserTier.PRIORITY]: {
    messagesPerHour: number;
    messagesPerDay: number;
  };
  [UserTier.UNLIMITED]: {
    messagesPerHour: number;
    messagesPerDay: number;
  };
}

/**
 * System-wide platform settings
 */
export interface PlatformSettings {
  rateLimits: RateLimitConfig;
  defaultBatchWindow: number;
  defaultProcessingInterval: number;
  maxBatchSize: number;
  systemAnnouncements: {
    enabled: boolean;
    message?: string;
    startDate?: string;
    endDate?: string;
  };
  maintenanceMode: boolean;
}