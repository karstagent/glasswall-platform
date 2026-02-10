/**
 * Types related to users in the system
 */

export type UserRole = 'USER' | 'AGENT' | 'ADMIN' | 'VERIFIED_USER';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastActiveAt: string;
  profileImage?: string;
  isVerified: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  notificationsEnabled: boolean;
  messagePreview: boolean;
  soundEffects: boolean;
  language: string;
}

export interface UserSession {
  userId: string;
  token: string;
  expiresAt: string;
  role: UserRole;
  deviceInfo: {
    deviceId: string;
    userAgent: string;
    ipAddress: string;
    lastActive: string;
  };
}