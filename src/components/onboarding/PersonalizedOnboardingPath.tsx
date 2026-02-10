import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { OnboardingStep } from '@/types/onboarding';
import { UserRole } from '@/types/user';
import { OnboardingService } from '@/services/OnboardingService';
import { UserService } from '@/services/UserService';
import { StepProgress } from './StepProgress';
import { OnboardingCard } from './OnboardingCard';
import { OnboardingNavigation } from './OnboardingNavigation';

// Define the different paths based on user roles
const ONBOARDING_PATHS: Record<UserRole, OnboardingStep[]> = {
  AGENT: [
    {
      id: 'agent-welcome',
      title: 'Welcome to GlassWall',
      description: 'Get started with your agent account and learn how to create your first chat room.',
      component: 'WelcomeStep',
      required: true,
      estimatedDuration: '2 min',
    },
    {
      id: 'agent-profile',
      title: 'Set Up Your Agent Profile',
      description: 'Customize your agent profile with details, verified credentials, and capabilities.',
      component: 'AgentProfileStep',
      required: true,
      estimatedDuration: '5 min',
    },
    {
      id: 'create-room',
      title: 'Create Your First Room',
      description: 'Learn how to create and configure your first chat room for human interactions.',
      component: 'CreateRoomStep',
      required: true,
      estimatedDuration: '3 min',
    },
    {
      id: 'queue-setup',
      title: 'Configure Message Queue',
      description: 'Set up your message queue preferences, batching options, and processing rules.',
      component: 'QueueSetupStep',
      required: true,
      estimatedDuration: '4 min',
    },
    {
      id: 'webhook-integration',
      title: 'Webhook Integration',
      description: 'Connect external services via webhooks for advanced functionality.',
      component: 'WebhookIntegrationStep',
      required: false,
      estimatedDuration: '6 min',
    },
    {
      id: 'agent-verification',
      title: 'Agent Verification',
      description: 'Complete the verification process to enhance trust with users.',
      component: 'AgentVerificationStep',
      required: false,
      estimatedDuration: '5 min',
    },
  ],
  USER: [
    {
      id: 'user-welcome',
      title: 'Welcome to GlassWall',
      description: 'Get started with your account and discover agent chat rooms.',
      component: 'WelcomeStep',
      required: true,
      estimatedDuration: '2 min',
    },
    {
      id: 'user-profile',
      title: 'Complete Your Profile',
      description: 'Set up your profile to customize your GlassWall experience.',
      component: 'UserProfileStep',
      required: true,
      estimatedDuration: '3 min',
    },
    {
      id: 'discover-rooms',
      title: 'Discover Chat Rooms',
      description: 'Find and join chat rooms based on your interests and needs.',
      component: 'DiscoverRoomsStep',
      required: true,
      estimatedDuration: '3 min',
    },
    {
      id: 'messaging-basics',
      title: 'Messaging Basics',
      description: 'Learn how messaging works with the GlassWall batch-based system.',
      component: 'MessagingBasicsStep',
      required: true,
      estimatedDuration: '4 min',
    },
    {
      id: 'notification-setup',
      title: 'Notification Settings',
      description: 'Customize how and when you receive notifications.',
      component: 'NotificationSetupStep',
      required: false,
      estimatedDuration: '2 min',
    },
  ],
  ADMIN: [
    {
      id: 'admin-welcome',
      title: 'Welcome to GlassWall',
      description: 'Get started with your admin account and platform management tools.',
      component: 'WelcomeStep',
      required: true,
      estimatedDuration: '2 min',
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard Overview',
      description: 'Tour the administrative dashboard and key platform metrics.',
      component: 'AdminDashboardStep',
      required: true,
      estimatedDuration: '5 min',
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Learn how to manage users, roles, and permissions.',
      component: 'UserManagementStep',
      required: true,
      estimatedDuration: '4 min',
    },
    {
      id: 'room-management',
      title: 'Room Management',
      description: 'Oversee the creation and configuration of chat rooms.',
      component: 'RoomManagementStep',
      required: true,
      estimatedDuration: '4 min',
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure global platform settings and integrations.',
      component: 'SystemSettingsStep',
      required: true,
      estimatedDuration: '6 min',
    },
    {
      id: 'analytics-reporting',
      title: 'Analytics & Reporting',
      description: 'Access and interpret platform analytics and usage reports.',
      component: 'AnalyticsReportingStep',
      required: true,
      estimatedDuration: '5 min',
    },
    {
      id: 'advanced-integration',
      title: 'Advanced Integrations',
      description: 'Set up advanced platform integrations with external services.',
      component: 'AdvancedIntegrationStep',
      required: false,
      estimatedDuration: '8 min',
    },
  ],
  VERIFIED_USER: [
    {
      id: 'verified-welcome',
      title: 'Welcome to GlassWall',
      description: 'Get started with your verified account and premium features.',
      component: 'WelcomeStep',
      required: true,
      estimatedDuration: '2 min',
    },
    {
      id: 'verified-profile',
      title: 'Complete Your Verified Profile',
      description: 'Set up your verified profile with additional details.',
      component: 'VerifiedProfileStep',
      required: true,
      estimatedDuration: '3 min',
    },
    {
      id: 'discover-rooms',
      title: 'Discover Premium Chat Rooms',
      description: 'Find and join chat rooms with priority access.',
      component: 'DiscoverRoomsStep',
      required: true,
      estimatedDuration: '3 min',
    },
    {
      id: 'priority-messaging',
      title: 'Priority Messaging',
      description: 'Learn how priority messaging works and its benefits.',
      component: 'PriorityMessagingStep',
      required: true,
      estimatedDuration: '3 min',
    },
    {
      id: 'notification-setup',
      title: 'Advanced Notification Settings',
      description: 'Customize your notification preferences with advanced options.',
      component: 'AdvancedNotificationSetupStep',
      required: false,
      estimatedDuration: '3 min',
    },
    {
      id: 'verified-benefits',
      title: 'Verified User Benefits',
      description: 'Explore all the benefits available to verified users.',
      component: 'VerifiedBenefitsStep',
      required: false,
      estimatedDuration: '4 min',
    },
  ],
};

interface PersonalizedOnboardingPathProps {
  onComplete: () => void;
  initialStep?: number;
}

export const PersonalizedOnboardingPath: React.FC<PersonalizedOnboardingPathProps> = ({
  onComplete,
  initialStep = 0,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [userRole, setUserRole] = useState<UserRole>('USER');
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number>(0);
  
  // Load user role and onboarding progress
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user and their role
        const user = await UserService.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        
        const role = user.role as UserRole;
        setUserRole(role);
        
        // Get the onboarding path for this role
        const onboardingPath = ONBOARDING_PATHS[role] || ONBOARDING_PATHS.USER;
        setSteps(onboardingPath);
        
        // Get user's onboarding progress
        const onboardingProgress = await OnboardingService.getUserProgress(user.id);
        if (onboardingProgress) {
          // Find the next incomplete step
          const nextStep = onboardingPath.findIndex(
            (step) => !onboardingProgress.completedSteps.includes(step.id)
          );
          
          if (nextStep !== -1) {
            setCurrentStep(nextStep);
          } else {
            // All steps completed
            setCurrentStep(onboardingPath.length);
          }
          
          // Calculate overall progress
          const requiredSteps = onboardingPath.filter(step => step.required);
          const completedRequiredSteps = requiredSteps.filter(
            step => onboardingProgress.completedSteps.includes(step.id)
          );
          
          setProgress(completedRequiredSteps.length / requiredSteps.length * 100);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading onboarding data:', error);
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [router]);
  
  // Handle step completion
  const handleStepComplete = async () => {
    if (currentStep < steps.length) {
      const stepId = steps[currentStep].id;
      
      // Mark step as completed
      await OnboardingService.markStepCompleted(stepId);
      
      // Move to next step
      setCurrentStep(currentStep + 1);
      
      // Update progress
      const requiredSteps = steps.filter(step => step.required);
      const completedRequiredSteps = requiredSteps.filter((step, index) => index <= currentStep);
      setProgress(completedRequiredSteps.length / requiredSteps.length * 100);
    }
    
    // Check if all required steps are completed
    if (currentStep >= steps.filter(step => step.required).length - 1) {
      // All required steps completed
      onComplete();
    }
  };
  
  // Handle step navigation
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle step skipping
  const handleSkipStep = async () => {
    // Only allow skipping non-required steps
    if (steps[currentStep] && !steps[currentStep].required) {
      // Mark as skipped in the service
      await OnboardingService.markStepSkipped(steps[currentStep].id);
      handleNextStep();
    }
  };
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4">Loading your personalized experience...</h2>
        <div className="w-full h-2 bg-glass-background rounded-full">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '50%' }}></div>
        </div>
      </div>
    </div>;
  }
  
  // All steps completed
  if (currentStep >= steps.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-panel p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Onboarding Complete!</h1>
          <p className="text-lg mb-6">
            You've completed all the onboarding steps for your {userRole.toLowerCase().replace('_', ' ')} account.
          </p>
          <button 
            onClick={onComplete}
            className="glass-button"
          >
            Start Using GlassWall
          </button>
        </div>
      </div>
    );
  }
  
  // Get the current step details
  const currentStepData = steps[currentStep];
  
  // Dynamically import the component for the current step
  const StepComponent = require(`./${currentStepData.component}`).default;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <StepProgress 
        steps={steps} 
        currentStep={currentStep}
        progress={progress}
      />
      
      <OnboardingCard
        title={currentStepData.title}
        description={currentStepData.description}
        estimatedDuration={currentStepData.estimatedDuration}
      >
        <StepComponent onComplete={handleStepComplete} />
      </OnboardingCard>
      
      <OnboardingNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={handleNextStep}
        onPrevious={handlePrevStep}
        onSkip={handleSkipStep}
        isStepSkippable={!currentStepData.required}
      />
    </div>
  );
};