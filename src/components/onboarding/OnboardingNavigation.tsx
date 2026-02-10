import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isStepSkippable: boolean;
}

export const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  isStepSkippable,
}) => {
  return (
    <div className="flex justify-between items-center mt-8 glass-panel p-4 rounded-lg">
      <button
        onClick={onPrevious}
        disabled={currentStep === 0}
        className={`glass-button flex items-center ${
          currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Previous
      </button>
      
      <div className="text-sm font-medium">
        Step {currentStep + 1} of {totalSteps}
      </div>
      
      <div className="flex space-x-3">
        {isStepSkippable && (
          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip this step
          </button>
        )}
        
        <button
          onClick={onNext}
          className="glass-button flex items-center"
        >
          {currentStep < totalSteps - 1 ? 'Next' : 'Finish'}
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};