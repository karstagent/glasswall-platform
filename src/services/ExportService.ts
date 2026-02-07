/**
 * Export Service for GlassWall Platform
 * 
 * Handles exporting dashboard data in various formats
 */

import apiService, { ApiResponse } from './ApiService';

export type ExportFormat = 'json' | 'csv' | 'pdf' | 'excel';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
}

export interface ExportRequest {
  id: string;
  name: string;
  dataType: string;
  options: ExportOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  url?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  fileSize?: number;
  userId: string;
}

export interface ExportTypeDefinition {
  id: string;
  name: string;
  description: string;
  availableFormats: ExportFormat[];
  defaultFormat: ExportFormat;
  supportedFilters: string[];
}

class ExportService {
  private exportTypes: ExportTypeDefinition[] = [
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Export analytics data including message activity, user engagement, and system metrics',
      availableFormats: ['json', 'csv', 'pdf', 'excel'],
      defaultFormat: 'excel',
      supportedFilters: ['dateRange', 'rooms', 'messageTypes']
    },
    {
      id: 'messages',
      name: 'Messages',
      description: 'Export messages from rooms including content, metadata, and attachments',
      availableFormats: ['json', 'csv', 'pdf'],
      defaultFormat: 'json',
      supportedFilters: ['dateRange', 'rooms', 'users', 'messageTypes']
    },
    {
      id: 'users',
      name: 'Users',
      description: 'Export user data including profiles, activity metrics, and permissions',
      availableFormats: ['json', 'csv', 'excel'],
      defaultFormat: 'csv',
      supportedFilters: ['status', 'roles', 'activityDate']
    },
    {
      id: 'rooms',
      name: 'Rooms',
      description: 'Export room data including configurations, member lists, and activity metrics',
      availableFormats: ['json', 'csv', 'excel'],
      defaultFormat: 'json',
      supportedFilters: ['status', 'type', 'createdDate']
    },
    {
      id: 'archive',
      name: 'Archive',
      description: 'Export archived messages with retention metadata',
      availableFormats: ['json', 'pdf'],
      defaultFormat: 'json',
      supportedFilters: ['dateRange', 'rooms', 'users', 'policyIds']
    }
  ];
  
  /**
   * Get available export types
   */
  public getExportTypes(): ExportTypeDefinition[] {
    return this.exportTypes;
  }
  
  /**
   * Create export request
   */
  public async createExport(
    dataType: string,
    options: ExportOptions,
    name?: string
  ): Promise<ApiResponse<ExportRequest>> {
    const exportType = this.exportTypes.find(type => type.id === dataType);
    
    if (!exportType) {
      return {
        success: false,
        error: `Unknown export type: ${dataType}`
      };
    }
    
    // Validate format
    if (!exportType.availableFormats.includes(options.format)) {
      return {
        success: false,
        error: `Format '${options.format}' is not supported for ${exportType.name}`
      };
    }
    
    // Use default name if not provided
    const exportName = name || `${exportType.name} Export - ${new Date().toLocaleDateString()}`;
    
    return apiService.post<ExportRequest>('exports', {
      name: exportName,
      dataType,
      options
    });
  }
  
  /**
   * Get export requests
   */
  public async getExports(limit: number = 20, offset: number = 0): Promise<ApiResponse<ExportRequest[]>> {
    return apiService.get<ExportRequest[]>(`exports?limit=${limit}&offset=${offset}`);
  }
  
  /**
   * Get export request by ID
   */
  public async getExportById(id: string): Promise<ApiResponse<ExportRequest>> {
    return apiService.get<ExportRequest>(`exports/${id}`);
  }
  
  /**
   * Cancel export request
   */
  public async cancelExport(id: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`exports/${id}/cancel`, {});
  }
  
  /**
   * Delete export request
   */
  public async deleteExport(id: string): Promise<ApiResponse<void>> {
    return apiService.delete(`exports/${id}`);
  }
  
  /**
   * Schedule recurring export
   */
  public async scheduleExport(
    dataType: string,
    options: ExportOptions,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number; // 0-6, Sunday to Saturday (for weekly)
      dayOfMonth?: number; // 1-31 (for monthly)
      hour: number; // 0-23
      minute: number; // 0-59
      timeZone?: string; // IANA time zone, e.g., 'America/New_York'
    },
    name?: string
  ): Promise<ApiResponse<any>> {
    const exportName = name || `${dataType} Export - ${schedule.frequency}`;
    
    return apiService.post('exports/schedule', {
      name: exportName,
      dataType,
      options,
      schedule
    });
  }
  
  /**
   * Get scheduled exports
   */
  public async getScheduledExports(): Promise<ApiResponse<any[]>> {
    return apiService.get('exports/schedule');
  }
  
  /**
   * Delete scheduled export
   */
  public async deleteScheduledExport(id: string): Promise<ApiResponse<void>> {
    return apiService.delete(`exports/schedule/${id}`);
  }
  
  /**
   * Get export URL (direct download link)
   */
  public getExportUrl(exportRequest: ExportRequest): string | null {
    if (exportRequest.status !== 'completed' || !exportRequest.url) {
      return null;
    }
    
    return exportRequest.url;
  }
  
  /**
   * Format file size for display
   */
  public formatFileSize(bytes: number | undefined): string {
    if (bytes === undefined || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Get appropriate icon for export format
   */
  public getFormatIcon(format: ExportFormat): string {
    switch (format) {
      case 'json':
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmYjdkMiI+PHBhdGggZD0iTTE0IDJIMWEyIDIgMCAwMC0yIDJ2MTZhMiAyIDAgMDAyIDJoMTRhMiAyIDAgMDAyLTJWNCIvPjxwYXRoIGQ9Ik0xNCAybDYgNnY0TTE0IDJ2NmgyIi8+PHBhdGggZD0iTTUgMTRjMCAuNjY3LjM4NSAxIDEgMXMxLS4zMzMgMS0xYzAtLjY2Ny0uMzk0LTEtMS0xbTQgM2MuNjE1IDAgMS0uMzMzIDEtMS41VjEybS0yIDVjLjYxNSAwIDEtLjMzMyAxLTEuNVYxMiIvPjwvc3ZnPg==';
      
      case 'csv':
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmYjdkMiI+PHBhdGggZD0iTTE0IDJIMWEyIDIgMCAwMC0yIDJ2MTZhMiAyIDAgMDAyIDJoMTRhMiAyIDAgMDAyLTJWNCIvPjxwYXRoIGQ9Ik0xNCAybDYgNnY0TTE0IDJ2NmgyIi8+PHBhdGggZD0iTTQgMTNoLjAxbTE2IDBIOC4wMW01LjU0LTRIMTRtLTQgNEgxMCIvPjwvc3ZnPg==';
      
      case 'pdf':
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmNTc1MiI+PHBhdGggZD0iTTE0IDJIMWEyIDIgMCAwMC0yIDJ2MTZhMiAyIDAgMDAyIDJoMTRhMiAyIDAgMDAyLTJWNCIvPjxwYXRoIGQ9Ik0xNCAybDYgNnY0TTE0IDJ2NmgyIi8+PHBhdGggZD0iTTUgMTJjMC42MTUgMCAxLS4zMzMgMS0xcy0uMzg1LTEtMS0xbTQgNFYxMG00IDJ2LTIiLz48L3N2Zz4=';
      
      case 'excel':
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzJiODgwMCI+PHBhdGggZD0iTTE0IDJIMWEyIDIgMCAwMC0yIDJ2MTZhMiAyIDAgMDAyIDJoMTRhMiAyIDAgMDAyLTJWNCIvPjxwYXRoIGQ9Ik0xNCAybDYgNnY0TTE0IDJ2NmgyIi8+PHBhdGggZD0iTTEwIDEyTDYgMTZtMC00bDQgNG04LTRIOCIvPjwvc3ZnPg==';
      
      default:
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YTVhNSI+PHBhdGggZD0iTTE0IDJIMWEyIDIgMCAwMC0yIDJ2MTZhMiAyIDAgMDAyIDJoMTRhMiAyIDAgMDAyLTJWNCIvPjxwYXRoIGQ9Ik0xNCAybDYgNnY0TTE0IDJ2NmgyIi8+PC9zdmc+';
    }
  }
}

// Create and export a singleton instance
const exportService = new ExportService();
export default exportService;