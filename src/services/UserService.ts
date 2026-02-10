/**
 * User Service
 * 
 * Manages user data, authentication, and profile information
 */

import { User, UserRole, UserPreferences } from '@/types/user';
import { ApiService } from './ApiService';

export class UserService {
  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await ApiService.get<User>('/api/users/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User> {
    try {
      const response = await ApiService.get<User>(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    try {
      const response = await ApiService.patch<User>(`/api/users/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await ApiService.patch<UserPreferences>(`/api/users/${userId}/preferences`, preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Change user role
   * (Admin only)
   */
  static async changeUserRole(userId: string, newRole: UserRole): Promise<User> {
    try {
      const response = await ApiService.post<User>(`/api/users/${userId}/role`, { role: newRole });
      return response.data;
    } catch (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
  }

  /**
   * Get user activity summary
   */
  static async getUserActivity(userId: string): Promise<any> {
    try {
      const response = await ApiService.get(`/api/users/${userId}/activity`);
      return response.data;
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  }

  /**
   * Verify a user account
   * (Admin only)
   */
  static async verifyUser(userId: string): Promise<User> {
    try {
      const response = await ApiService.post<User>(`/api/users/${userId}/verify`, {});
      return response.data;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  /**
   * Request account verification
   */
  static async requestVerification(): Promise<{ requestId: string }> {
    try {
      const response = await ApiService.post<{ requestId: string }>('/api/users/verification-request', {});
      return response.data;
    } catch (error) {
      console.error('Error requesting verification:', error);
      throw error;
    }
  }

  /**
   * Get verification status
   */
  static async getVerificationStatus(requestId: string): Promise<{ status: string, message: string }> {
    try {
      const response = await ApiService.get<{ status: string, message: string }>(`/api/users/verification-status/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw error;
    }
  }

  /**
   * Upload profile image
   */
  static async uploadProfileImage(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await ApiService.post<{ url: string }>('/api/users/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
}