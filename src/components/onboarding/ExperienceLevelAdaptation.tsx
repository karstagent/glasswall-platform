import React, { useEffect, useState } from 'react';
import { ExperienceLevel } from '@/types/onboarding';
import { OnboardingService } from '@/services/OnboardingService';
import { UserService } from '@/services/UserService';

interface ExperienceLevelAdaptationProps {
  contentId: string;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * This component adapts content based on the user's experience level.
 * It fetches personalized content for the current user and renders it.
 */
export const ExperienceLevelAdaptation: React.FC<ExperienceLevelAdaptationProps> = ({
  contentId,
  children,
  fallback = <div className="animate-pulse">Loading personalized content...</div>,
}) => {
  const [loading, setLoading] = useState(true);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('BEGINNER');
  const [content, setContent] = useState<{
    beginner: string;
    intermediate: string;
    advanced: string;
  } | null>(null);
  
  useEffect(() => {
    const loadPersonalizedContent = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const user = await UserService.getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Get user preferences
        const preferences = await OnboardingService.getUserPreferences(user.id);
        setExperienceLevel(preferences.experienceLevel);
        
        // Get personalized content
        const personalizedContent = await OnboardingService.getPersonalizedContent(contentId);
        setContent(personalizedContent);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading personalized content:', error);
        setLoading(false);
      }
    };
    
    loadPersonalizedContent();
  }, [contentId]);
  
  if (loading) {
    return <>{fallback}</>;
  }
  
  if (!content) {
    return <>{children}</>;
  }
  
  // Render the content based on the experience level
  switch (experienceLevel) {
    case 'BEGINNER':
      return <div className="personalized-content beginner" dangerouslySetInnerHTML={{ __html: content.beginner }} />;
    case 'INTERMEDIATE':
      return <div className="personalized-content intermediate" dangerouslySetInnerHTML={{ __html: content.intermediate }} />;
    case 'ADVANCED':
      return <div className="personalized-content advanced" dangerouslySetInnerHTML={{ __html: content.advanced }} />;
    default:
      return <>{children}</>;
  }
};

interface ConditionalContentProps {
  level: ExperienceLevel | ExperienceLevel[];
  children: React.ReactNode;
}

/**
 * This component conditionally renders content based on the user's experience level.
 * It can be used to show/hide elements based on experience.
 */
export const ExperienceLevelContent: React.FC<ConditionalContentProps> = ({
  level,
  children,
}) => {
  const [userLevel, setUserLevel] = useState<ExperienceLevel | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getUserLevel = async () => {
      try {
        // Get current user
        const user = await UserService.getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Get user preferences
        const preferences = await OnboardingService.getUserPreferences(user.id);
        setUserLevel(preferences.experienceLevel);
        
        setLoading(false);
      } catch (error) {
        console.error('Error getting user experience level:', error);
        setLoading(false);
      }
    };
    
    getUserLevel();
  }, []);
  
  if (loading || !userLevel) {
    return null;
  }
  
  // Check if the user's level matches the required level
  const levels = Array.isArray(level) ? level : [level];
  if (levels.includes(userLevel)) {
    return <>{children}</>;
  }
  
  return null;
};

/**
 * Hook to get the current user's experience level
 */
export const useExperienceLevel = () => {
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('BEGINNER');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const getExperienceLevel = async () => {
      try {
        // Get current user
        const user = await UserService.getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Get user preferences
        const preferences = await OnboardingService.getUserPreferences(user.id);
        setExperienceLevel(preferences.experienceLevel);
        
        setLoading(false);
      } catch (error) {
        console.error('Error getting experience level:', error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        setLoading(false);
      }
    };
    
    getExperienceLevel();
  }, []);
  
  return { experienceLevel, loading, error };
};