/**
 * API Service for GlassWall Platform
 * 
 * Handles all data fetching and API interactions for the dashboard
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export class ApiService {
  private baseUrl: string;
  private authToken: string | null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.authToken = localStorage.getItem('auth_token');
  }

  /**
   * Set the authentication token for API requests
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear the authentication token
   */
  public clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error as JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      return {
        success: false,
        error: `${response.status}: ${errorMessage}`
      };
    }
    
    try {
      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (e) {
      return {
        success: false,
        error: 'Failed to parse response'
      };
    }
  }

  /**
   * Generic request method
   */
  private async request<T>(
    method: string, 
    endpoint: string, 
    data?: any, 
    customHeaders?: HeadersInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      const headers = { ...this.getHeaders(), ...customHeaders };
      
      const options: RequestInit = {
        method,
        headers,
        credentials: 'same-origin',
      };
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * GET request
   */
  public async get<T>(endpoint: string, customHeaders?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, customHeaders);
  }

  /**
   * POST request
   */
  public async post<T>(
    endpoint: string, 
    data?: any, 
    customHeaders?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, customHeaders);
  }

  /**
   * PUT request
   */
  public async put<T>(
    endpoint: string, 
    data?: any, 
    customHeaders?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, customHeaders);
  }

  /**
   * PATCH request
   */
  public async patch<T>(
    endpoint: string, 
    data?: any, 
    customHeaders?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, customHeaders);
  }

  /**
   * DELETE request
   */
  public async delete<T>(endpoint: string, customHeaders?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, customHeaders);
  }

  // Specific API endpoints for the dashboard

  /**
   * Get analytics data
   */
  public async getAnalytics(timeRange: string = 'day'): Promise<ApiResponse<any>> {
    return this.get(`analytics?timeRange=${timeRange}`);
  }

  /**
   * Get room list
   */
  public async getRooms(includeInactive: boolean = false): Promise<ApiResponse<any>> {
    return this.get(`rooms?includeInactive=${includeInactive}`);
  }

  /**
   * Get room details
   */
  public async getRoomDetails(roomId: string): Promise<ApiResponse<any>> {
    return this.get(`rooms/${roomId}`);
  }

  /**
   * Get message statistics
   */
  public async getMessageStats(timeRange: string = 'day'): Promise<ApiResponse<any>> {
    return this.get(`messages/stats?timeRange=${timeRange}`);
  }

  /**
   * Get user list
   */
  public async getUsers(includeInactive: boolean = false): Promise<ApiResponse<any>> {
    return this.get(`users?includeInactive=${includeInactive}`);
  }

  /**
   * Get system status
   */
  public async getSystemStatus(): Promise<ApiResponse<any>> {
    return this.get('system/status');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;