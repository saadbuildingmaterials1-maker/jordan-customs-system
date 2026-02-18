/**
 * Interactive Tutorial Component
 * مكون التعليمات التفاعلية
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, Play, X } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action: string;
  videoUrl?: string;
  tips?: string[];
}

interface InteractiveTutorialProps {
  steps: TutorialStep[];
  onComplete?: () => void;
  autoPlay?: boolean;
}

export function InteractiveTutorial({
  steps,
  onComplete,
  autoPlay = false,
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = () => {
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id]);
    }
    handleNext();
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">
            Step {currentStep + 1} of {steps.length}
          </h3>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tutorial Content */}
      <Card className="p-6">
        {/* Video */}
        {step.videoUrl && (
          <div className="mb-6 relative bg-black rounded-lg overflow-hidden">
            <video
              src={step.videoUrl}
              controls
              autoPlay={isPlaying}
              className="w-full h-auto max-h-96"
            />
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full"
            >
              <Play className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Title and Description */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
          <p className="text-gray-600 text-lg">{step.description}</p>
        </div>

        {/* Action */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-blue-900 mb-2">👉 Action:</p>
          <p className="text-blue-800">{step.action}</p>
        </div>

        {/* Tips */}
        {step.tips && step.tips.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">💡 Tips:</p>
            <ul className="space-y-1">
              {step.tips.map((tip, index) => (
                <li key={index} className="text-sm text-amber-800">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Step Indicators */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((s, index) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(index)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              index === currentStep
                ? 'bg-blue-600 text-white'
                : completedSteps.includes(s.id)
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={handleStepComplete}
          className="flex-1"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Completion Summary */}
      {completedSteps.length === steps.length && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-900 mb-2">
              🎉 Tutorial Complete!
            </h3>
            <p className="text-green-800">
              You've successfully completed all {steps.length} steps.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default InteractiveTutorial;
