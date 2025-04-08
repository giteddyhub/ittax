'use client';

import { FormStep } from './MultiStepForm';

interface ProgressBarProps {
  currentStep: FormStep;
  steps: FormStep[];
}

const ProgressBar = ({ currentStep, steps }: ProgressBarProps) => {
  const getStepName = (step: FormStep): string => {
    switch (step) {
      case 'welcome':
        return 'Welcome';
      case 'owners':
        return 'Owner Details';
      case 'properties':
        return 'Properties';
      case 'assignments':
        return 'Assignments';
      case 'review':
        return 'Review';
      default:
        return '';
    }
  };

  const getCurrentStepIndex = () => {
    return steps.indexOf(currentStep);
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    // Now returns 0 for the first step (welcome)
    return currentIndex * (100 / (steps.length - 1));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 relative">
      <div className="relative mb-8">
        {/* Progress Bar Container */}
        <div className="h-1.5 bg-gray-200 rounded-full">
          {/* Progress Bar Fill */}
          <div
            className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-in-out relative"
            style={{ width: `${getProgressPercentage()}%` }}
          >
            {/* Percentage Indicator */}
            <div 
              className="absolute -right-4 top-1/2 transform translate-y-[-50%] bg-white rounded-full shadow-sm px-3 py-1 border border-gray-200"
              style={{
                fontSize: '12px',
                color: '#6B7280', // text-gray-500
                whiteSpace: 'nowrap',
              }}
            >
              {`${Math.round(getProgressPercentage())}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Step Labels */}
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => {
          const isActive = getCurrentStepIndex() >= index;
          return (
            <div
              key={step}
              className={`text-sm ${
                isActive ? 'text-purple-600' : 'text-gray-400'
              }`}
              style={{ 
                flex: '1',
                textAlign: index === 0 ? 'left' : index === steps.length - 1 ? 'right' : 'center'
              }}
            >
              {getStepName(step)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar; 