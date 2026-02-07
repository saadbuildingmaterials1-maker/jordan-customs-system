/**
 * AppTour Component
 * مكون React
 * @module ./client/src/components/AppTour
 */
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * مكون جولات التطبيق التفاعلية
 * يوجه المستخدمين الجدد عبر الميزات الرئيسية
 */

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface AppTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  autoStart?: boolean;
}

export default function AppTour({
  steps,
  onComplete,
  autoStart = false,
}: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [highlightSize, setHighlightSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const updatePosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
        });
        setHighlightSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, isActive, steps]);

  if (!isActive || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const getTooltipPosition = () => {
    const offset = 20;
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 10001,
    };

    switch (currentStepData.position) {
      case 'top':
        return {
          ...baseStyle,
          top: position.top - 150,
          left: position.left + highlightSize.width / 2 - 150,
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: position.top + highlightSize.height + offset,
          left: position.left + highlightSize.width / 2 - 150,
        };
      case 'left':
        return {
          ...baseStyle,
          top: position.top + highlightSize.height / 2 - 75,
          left: position.left - 320,
        };
      case 'right':
        return {
          ...baseStyle,
          top: position.top + highlightSize.height / 2 - 75,
          left: position.left + highlightSize.width + offset,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <>
      {/* الخلفية المظلمة */}
      <div
        className="fixed inset-0 bg-black/50 z-10000"
        onClick={() => setIsActive(false)}
      />

      {/* المنطقة المضاءة */}
      <div
        className="fixed border-2 border-cyan-400 rounded-lg shadow-lg z-10000 transition-all duration-300"
        style={{
          top: position.top - 8,
          left: position.left - 8,
          width: highlightSize.width + 16,
          height: highlightSize.height + 16,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed bg-slate-900 border border-cyan-500 rounded-lg shadow-2xl p-6 max-w-xs z-10001 transition-all duration-300"
        style={getTooltipPosition()}
      >
        {/* رأس Tooltip */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">
            {currentStepData.title}
          </h3>
          <button
            onClick={() => setIsActive(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* الوصف */}
        <p className="text-gray-300 text-sm mb-4">
          {currentStepData.description}
        </p>

        {/* شريط التقدم */}
        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* الخطوة الحالية */}
        <p className="text-xs text-gray-400 mb-4">
          الخطوة {currentStep + 1} من {steps.length}
        </p>

        {/* الأزرار */}
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={() => {
              setIsActive(false);
              onComplete?.();
            }}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            تخطي الجولة
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              variant="outline"
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={() => {
                  setIsActive(false);
                  onComplete?.();
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                إنهاء الجولة
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (currentStepData.action) {
                    currentStepData.action();
                  }
                  setCurrentStep(currentStep + 1);
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                التالي
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
