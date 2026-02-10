import React, { useEffect, useState } from 'react';
import { UserService } from '@/services/UserService';
import { OnboardingService } from '@/services/OnboardingService';
import { User, UserRole } from '@/types/user';
import { ExperienceLevel } from '@/types/onboarding';

interface WelcomeStepProps {
  onComplete: () => void;
}

export default function WelcomeStep({ onComplete }: WelcomeStepProps) {
  const [user, setUser] = useState<User | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('BEGINNER');
  const [loading, setLoading] = useState(true);
  const [roleTips, setRoleTips] = useState<string[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userData = await UserService.getCurrentUser();
        setUser(userData);
        
        if (userData) {
          // Get role-specific tips
          const tips = await OnboardingService.getRoleTips(userData.role);
          setRoleTips(tips);
          
          // Track step view
          await OnboardingService.trackInteraction('welcome', 'view');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading welcome data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleExperienceLevelChange = async (level: ExperienceLevel) => {
    setExperienceLevel(level);
    
    if (user) {
      try {
        await OnboardingService.setExperienceLevel(user.id, level);
      } catch (error) {
        console.error('Error saving experience level:', error);
      }
    }
  };
  
  const handleContinue = async () => {
    if (user) {
      try {
        // Track completion
        await OnboardingService.trackInteraction('welcome', 'complete', {
          experienceLevel
        });
      } catch (error) {
        console.error('Error tracking completion:', error);
      }
    }
    
    onComplete();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center text-destructive">
        Error loading user data. Please refresh the page.
      </div>
    );
  }
  
  const roleDisplayName = {
    USER: 'User',
    AGENT: 'Agent',
    ADMIN: 'Administrator',
    VERIFIED_USER: 'Verified User',
  }[user.role];
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">Welcome to GlassWall, {user.displayName}!</h3>
        <p>
          You're set up with a <span className="font-medium">{roleDisplayName}</span> account.
          Let's get you started with a personalized experience.
        </p>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium">What's your experience level with AI platforms?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className={`p-4 rounded-lg border transition-colors ${
              experienceLevel === 'BEGINNER'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-glass-background border-glass-border hover:border-primary'
            }`}
            onClick={() => handleExperienceLevelChange('BEGINNER')}
          >
            <div className="font-medium">Beginner</div>
            <div className="text-sm mt-1">I'm new to AI platforms</div>
          </button>
          
          <button
            className={`p-4 rounded-lg border transition-colors ${
              experienceLevel === 'INTERMEDIATE'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-glass-background border-glass-border hover:border-primary'
            }`}
            onClick={() => handleExperienceLevelChange('INTERMEDIATE')}
          >
            <div className="font-medium">Intermediate</div>
            <div className="text-sm mt-1">I've used AI platforms before</div>
          </button>
          
          <button
            className={`p-4 rounded-lg border transition-colors ${
              experienceLevel === 'ADVANCED'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-glass-background border-glass-border hover:border-primary'
            }`}
            onClick={() => handleExperienceLevelChange('ADVANCED')}
          >
            <div className="font-medium">Advanced</div>
            <div className="text-sm mt-1">I'm experienced with AI platforms</div>
          </button>
        </div>
      </div>
      
      {roleTips.length > 0 && (
        <div className="mt-8">
          <h4 className="font-medium mb-2">Tips for {roleDisplayName}s:</h4>
          <ul className="space-y-2">
            {roleTips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-5 h-5 bg-info text-info-foreground rounded-full flex-shrink-0 flex items-center justify-center text-xs mr-2">
                  {index + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <button
          className="glass-button px-6 py-3"
          onClick={handleContinue}
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
}