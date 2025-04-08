'use client';

import { useState } from 'react';
import WelcomeStep from './steps/WelcomeStep';
import OwnerProfilesStep from './steps/OwnerProfilesStep';
import PropertiesStep from './steps/PropertiesStep';
import AssignmentsStep from './steps/AssignmentsStep';
import ReviewStep from './steps/ReviewStep';
import ProgressBar from './ProgressBar';
import { FormData } from '../types';
import { validateFormData, ValidationError } from '../utils/validation';
import LoadingSpinner from './LoadingSpinner';
import ErrorPage from './ErrorPage';
import SuccessPage from './SuccessPage';
import ErrorBoundary from './ErrorBoundary';

export type FormStep = 'welcome' | 'owners' | 'properties' | 'assignments' | 'review';

interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  error?: Error | string;
  validationErrors: ValidationError[];
}

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [formData, setFormData] = useState<FormData>({
    owners: [],
    properties: [],
    assignments: []
  });
  const [formState, setFormState] = useState<FormState>({
    status: 'idle',
    validationErrors: []
  });

  const steps: FormStep[] = ['welcome', 'owners', 'properties', 'assignments', 'review'];

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={handleNext} />;
      case 'owners':
        return (
          <OwnerProfilesStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'properties':
        return (
          <PropertiesStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'assignments':
        return (
          <AssignmentsStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'review':
        return (
          <ReviewStep
            formData={formData}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  const validateStep = (): boolean => {
    let errors: ValidationError[] = [];
    
    switch (currentStep) {
      case 'owners':
        formData.owners.forEach((owner, index) => {
          const ownerErrors = validateOwner(owner);
          errors = errors.concat(
            ownerErrors.map(error => ({
              ...error,
              field: `owners[${index}].${error.field}`
            }))
          );
        });
        break;
      case 'properties':
        formData.properties.forEach((property, index) => {
          const propertyErrors = validateProperty(property);
          errors = errors.concat(
            propertyErrors.map(error => ({
              ...error,
              field: `properties[${index}].${error.field}`
            }))
          );
        });
        break;
      case 'assignments':
        formData.properties.forEach(property => {
          const assignmentErrors = validateAssignments(formData.assignments, property.id);
          errors = errors.concat(
            assignmentErrors.map(error => ({
              ...error,
              field: `assignments.${property.id}.${error.field}`
            }))
          );
        });
        break;
      case 'review':
        errors = validateFormData(formData);
        break;
    }

    setFormState(prev => ({
      ...prev,
      validationErrors: errors
    }));

    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setFormState(prev => ({ ...prev, status: 'submitting' }));

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setFormState(prev => ({ ...prev, status: 'success' }));
    } catch (error) {
      console.error('Submission error:', error);
      setFormState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    }
  };

  if (formState.status === 'success') {
    return (
      <SuccessPage
        onReset={() => {
          setFormData({
            owners: [],
            properties: [],
            assignments: []
          });
          setCurrentStep('welcome');
          setFormState({ status: 'idle', validationErrors: [] });
        }}
      />
    );
  }

  if (formState.status === 'error') {
    return (
      <ErrorPage
        error={formState.error!}
        onRetry={handleSubmit}
        onReset={() => {
          setFormData({
            owners: [],
            properties: [],
            assignments: []
          });
          setCurrentStep('welcome');
          setFormState({ status: 'idle', validationErrors: [] });
        }}
      />
    );
  }

  if (formState.status === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" message="Submitting your information..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-16 pt-8">
          <ProgressBar currentStep={currentStep} steps={steps} />
        </div>
        {renderStep()}
      </div>
    </div>
  );
};

export default MultiStepForm; 