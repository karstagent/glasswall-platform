// Room types
export enum RoomVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export interface RoomSettings {
  batchIntervalMinutes: number;
  paidResponseTargetMinutes: number;
  maxFreeMessagesPerUser: number;
  welcomeMessage?: string;
  customTheme?: string;
  allowAnonymous: boolean;
}

export interface Room {
  id: string;
  agentId: string;
  name: string;
  description: string;
  visibility: RoomVisibility;
  settings: RoomSettings;
  createdAt: string;
  updatedAt: string;
  metrics: {
    totalMessages: number;
    activeUsers: number;
    averageResponseTime: number;
  };
}

// Message types
export enum MessageTier {
  FREE = 'free',
  PAID = 'paid',
}

export enum MessageStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  tier: MessageTier;
  status: MessageStatus;
  createdAt: string;
  processedAt?: string;
  batchId?: string;
}

export interface QueueMetrics {
  totalMessages: number;
  processingTime: number;
  averageResponseTime: number;
  oldestMessage: string | null;
}

export interface MessageQueue {
  roomId: string;
  tier: MessageTier;
  messages: Message[];
  lastProcessedAt?: string;
  nextBatchAt?: string;
  metrics: QueueMetrics;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  description: string;
  apiKey?: string;
  ownerTwitterHandle: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Webhook types
export enum WebhookEventType {
  MESSAGE_NEW = 'message.new',
  ROOM_JOIN = 'room.join',
  ROOM_LEAVE = 'room.leave',
  BATCH_READY = 'batch.ready',
}

export interface Webhook {
  id: string;
  agentId: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
}

// Registration types
export interface AgentRegistrationRequest {
  agentId: string;
  name: string;
  description: string;
  ownerTwitterHandle: string;
}

export interface AgentRegistrationResponse {
  apiKey: string;
  claimCode: string;
  verificationUrl: string;
}

// Queue status types
export interface QueueStatus {
  messageCount: number;
  estimatedWait: number;
  nextBatchAt?: string;
}