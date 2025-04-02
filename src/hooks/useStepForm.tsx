
import { useState } from "react";
import { toast } from "sonner";

export interface Step {
  id: string;
  name: string;
  fields: string[];
}

interface UseStepFormProps<T> {
  steps: Step[];
  onComplete: (data: T) => Promise<void>;
  validateStep: (stepFields: string[]) => Promise<boolean>;
  getFormValues: () => T;
}

export function useStepForm<T>({
  steps,
  onComplete,
  validateStep,
  getFormValues,
}: UseStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const activeStep = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  const handleNext = async () => {
    const isValid = await validateStep(activeStep.fields);
    
    if (isValid) {
      if (isLastStep) {
        try {
          setLoading(true);
          const data = getFormValues();
          await onComplete(data);
        } catch (error) {
          console.error("Error completing form:", error);
          toast.error("An error occurred. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      toast.error("Please fix the errors before continuing");
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  return {
    currentStep,
    setCurrentStep,
    activeStep,
    isLastStep,
    progressPercentage,
    handleNext,
    handleBack,
    loading
  };
}
