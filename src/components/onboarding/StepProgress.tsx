import React from 'react';
import { OnboardingStep } from '@/types/onboarding';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleOutlineIcon } from '@heroicons/react/24/outline';

interface StepProgressProps {
  steps: OnboardingStep[];
  currentStep: number;
  progress: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  progress,
}) => {
  // Only show required steps in the progress bar
  const requiredSteps = steps.filter(step => step.required);
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Your Progress</h3>
        <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-glass-background rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="mt-6 space-y-3 max-w-2xl mx-auto">
        {requiredSteps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div 
              key={step.id} 
              className={`flex items-center p-2 rounded-lg transition-colors ${
                isCurrent ? 'bg-glass-background' : ''
              }`}
            >
              {isCompleted ? (
                <CheckCircleIcon className="w-6 h-6 text-primary flex-shrink-0" />
              ) : (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCurrent ? 'bg-primary text-white' : 'border border-glass-border text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
              )}
              <div className="ml-3 flex-grow">
                <span className={`font-medium ${
                  isCompleted ? 'text-muted-foreground' : 
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </div>
              {isCompleted && (
                <span className="text-xs text-success flex-shrink-0">Completed</span>
              )}
              {isCurrent && (
                <span className="text-xs text-info flex-shrink-0">In Progress</span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Optional steps section */}
      {steps.some(step => !step.required) && (
        <div className="mt-8">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Optional Steps</h4>
          <div className="space-y-2">
            {steps
              .filter(step => !step.required)
              .map((step, index) => {
                const stepIndex = steps.findIndex(s => s.id === step.id);
                const isCompleted = stepIndex < currentStep;
                const isCurrent = stepIndex === currentStep;
                
                return (
                  <div 
                    key={step.id} 
                    className="flex items-center text-sm"
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <CheckCircleOutlineIcon className={`w-4 h-4 flex-shrink-0 ${
                        isCurrent ? 'text-info' : 'text-muted-foreground'
                      }`} />
                    )}
                    <span className={`ml-2 ${
                      isCompleted ? 'text-muted-foreground' : 
                      isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};