/**
 * Onboarding Service
 * 
 * Manages the onboarding process, user progress, and personalization
 */

import { OnboardingProgress, OnboardingPreference, ExperienceLevel, TutorialStyle } from '@/types/onboarding';
import { ApiService } from './ApiService';

export class OnboardingService {
  /**
   * Get the onboarding progress for a user
   */
  static async getUserProgress(userId: string): Promise<OnboardingProgress> {
    try {
      const response = await ApiService.get<OnboardingProgress>(`/api/onboarding/progress/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      throw error;
    }
  }

  /**
   * Get the onboarding preferences for a user
   */
  static async getUserPreferences(userId: string): Promise<OnboardingPreference> {
    try {
      const response = await ApiService.get<OnboardingPreference>(`/api/onboarding/preferences/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting onboarding preferences:', error);
      throw error;
    }
  }

  /**
   * Mark a step as completed
   */
  static async markStepCompleted(stepId: string): Promise<void> {
    try {
      await ApiService.post('/api/onboarding/steps/completed', { stepId });
    } catch (error) {
      console.error('Error marking step as completed:', error);
      throw error;
    }
  }

  /**
   * Mark a step as skipped
   */
  static async markStepSkipped(stepId: string): Promise<void> {
    try {
      await ApiService.post('/api/onboarding/steps/skipped', { stepId });
    } catch (error) {
      console.error('Error marking step as skipped:', error);
      throw error;
    }
  }

  /**
   * Set user experience level
   */
  static async setExperienceLevel(userId: string, level: ExperienceLevel): Promise<void> {
    try {
      await ApiService.post('/api/onboarding/preferences/experience-level', { userId, level });
    } catch (error) {
      console.error('Error setting experience level:', error);
      throw error;
    }
  }

  /**
   * Set user interests
   */
  static async setInterests(userId: string, interests: string[]): Promise<void> {
    try {
      await ApiService.post('/api/onboarding/preferences/interests', { userId, interests });
    } catch (error) {
      console.error('Error setting interests:', error);
      throw error;
    }
  }

  /**
   * Set preferred tutorial style
   */
  static async setTutorialStyle(userId: string, style: TutorialStyle): Promise<void> {
    try {
      await ApiService.post('/api/onboarding/preferences/tutorial-style', { userId, style });
    } catch (error) {
      console.error('Error setting tutorial style:', error);
      throw error;
    }
  }

  /**
   * Reset onboarding progress for a user (e.g., for testing)
   */
  static async resetProgress(userId: string): Promise<void> {
    try {
      await ApiService.delete(`/api/onboarding/progress/${userId}`);
    } catch (error) {
      console.error('Error resetting onboarding progress:', error);
      throw error;
    }
  }

  /**
   * Get personalized content based on user role and preferences
   */
  static async getPersonalizedContent(contentId: string): Promise<any> {
    try {
      const response = await ApiService.get(`/api/onboarding/content/${contentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting personalized content:', error);
      throw error;
    }
  }

  /**
   * Get role-specific tips and guidance
   */
  static async getRoleTips(role: string): Promise<string[]> {
    try {
      const response = await ApiService.get<string[]>(`/api/onboarding/tips/${role}`);
      return response.data;
    } catch (error) {
      console.error('Error getting role tips:', error);
      throw error;
    }
  }
  
  /**
   * Track a tutorial interaction (view, click, complete)
   */
  static async trackInteraction(stepId: string, action: 'view' | 'click' | 'complete', metadata?: any): Promise<void> {
    try {
      await ApiService.post('/api/onboarding/interaction', { 
        stepId, 
        action, 
        timestamp: new Date().toISOString(),
        metadata
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
      // Fail silently for analytics
    }
  }
}