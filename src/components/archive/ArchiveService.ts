/**
 * Archive Service for GlassWall Platform
 * 
 * Handles message archiving and retrieval operations
 */

import apiService, { ApiResponse } from '../services/ApiService';

export interface ArchiveOptions {
  roomId?: string;
  before?: string; // ISO date string
  after?: string; // ISO date string
  userId?: string;
  messageTypes?: string[]; // e.g., ['text', 'image', 'file']
  limit?: number;
  offset?: number;
}

export interface ArchivedMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  contentType: string;
  createdAt: string;
  archivedAt: string;
  metadata?: Record<string, any>;
}

export interface ArchiveStats {
  totalMessages: number;
  totalStorage: number; // in bytes
  messagesByType: Record<string, number>;
  messagesByRoom: Record<string, number>;
  oldestMessage: string; // ISO date string
  newestMessage: string; // ISO date string
}

export interface ArchiveExportOptions {
  format: 'json' | 'csv' | 'html' | 'pdf';
  includeMetadata: boolean;
  dateRange?: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
  roomIds?: string[];
  userIds?: string[];
}

export interface ArchiveExportResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string; // Download URL for completed exports
  format: 'json' | 'csv' | 'html' | 'pdf';
  createdAt: string;
  completedAt?: string;
  error?: string;
  messageCount?: number;
  fileSize?: number; // in bytes
}

export interface ArchivePolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  retention: {
    duration: number; // in days
    permanent: boolean; // if true, duration is ignored
  };
  filters: {
    roomIds?: string[];
    messageTypes?: string[];
    userIds?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

class ArchiveService {
  /**
   * Search archived messages
   */
  public async searchArchive(options: ArchiveOptions): Promise<ApiResponse<ArchivedMessage[]>> {
    const queryParams = new URLSearchParams();
    
    if (options.roomId) queryParams.append('roomId', options.roomId);
    if (options.before) queryParams.append('before', options.before);
    if (options.after) queryParams.append('after', options.after);
    if (options.userId) queryParams.append('userId', options.userId);
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.offset) queryParams.append('offset', options.offset.toString());
    if (options.messageTypes?.length) {
      options.messageTypes.forEach(type => {
        queryParams.append('messageType', type);
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `archive/messages${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<ArchivedMessage[]>(endpoint);
  }
  
  /**
   * Get archive statistics
   */
  public async getArchiveStats(): Promise<ApiResponse<ArchiveStats>> {
    return apiService.get<ArchiveStats>('archive/stats');
  }
  
  /**
   * Export archived messages
   */
  public async exportArchive(options: ArchiveExportOptions): Promise<ApiResponse<ArchiveExportResult>> {
    return apiService.post<ArchiveExportResult>('archive/export', options);
  }
  
  /**
   * Get export status
   */
  public async getExportStatus(exportId: string): Promise<ApiResponse<ArchiveExportResult>> {
    return apiService.get<ArchiveExportResult>(`archive/export/${exportId}`);
  }
  
  /**
   * Get all exports
   */
  public async getExports(): Promise<ApiResponse<ArchiveExportResult[]>> {
    return apiService.get<ArchiveExportResult[]>('archive/exports');
  }
  
  /**
   * Get archive policies
   */
  public async getPolicies(): Promise<ApiResponse<ArchivePolicy[]>> {
    return apiService.get<ArchivePolicy[]>('archive/policies');
  }
  
  /**
   * Create archive policy
   */
  public async createPolicy(policy: Omit<ArchivePolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ArchivePolicy>> {
    return apiService.post<ArchivePolicy>('archive/policies', policy);
  }
  
  /**
   * Update archive policy
   */
  public async updatePolicy(policyId: string, policy: Partial<ArchivePolicy>): Promise<ApiResponse<ArchivePolicy>> {
    return apiService.put<ArchivePolicy>(`archive/policies/${policyId}`, policy);
  }
  
  /**
   * Delete archive policy
   */
  public async deletePolicy(policyId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`archive/policies/${policyId}`);
  }
  
  /**
   * Manually archive messages
   */
  public async archiveMessages(messageIds: string[]): Promise<ApiResponse<{ success: boolean; count: number }>> {
    return apiService.post<{ success: boolean; count: number }>('archive/messages', { messageIds });
  }
  
  /**
   * Format storage size for display
   */
  public formatStorageSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create and export a singleton instance
const archiveService = new ArchiveService();
export default archiveService;