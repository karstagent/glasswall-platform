/**
 * Types related to the onboarding system
 */

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  estimatedDuration: string;
}

export interface OnboardingProgress {
  userId: string;
  completedSteps: string[];
  skippedSteps: string[];
  startedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
}

export interface OnboardingPreference {
  userId: string;
  experienceLevel: ExperienceLevel;
  interests: string[];
  preferredTutorialStyle: TutorialStyle;
}

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type TutorialStyle = 'DETAILED' | 'CONCISE' | 'VISUAL' | 'INTERACTIVE';

export interface OnboardingSettings {
  enableTutorialMode: boolean;
  showTips: boolean;
  autoAdvance: boolean;
  tutorialSpeed: 'SLOW' | 'MEDIUM' | 'FAST';
}