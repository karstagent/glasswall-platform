import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface OnboardingCardProps {
  title: string;
  description: string;
  estimatedDuration: string;
  children: React.ReactNode;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  description,
  estimatedDuration,
  children,
}) => {
  return (
    <div className="glass-panel p-6 rounded-lg shadow-lg mb-8 animate-float">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-2">{description}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>{estimatedDuration}</span>
        </div>
      </div>
      
      <div className="bg-glass-background backdrop-blur-xs rounded-lg p-5">
        {children}
      </div>
    </div>
  );
};