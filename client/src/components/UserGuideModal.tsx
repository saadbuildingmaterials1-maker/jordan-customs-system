/**
 * UserGuideModal Component
 * 
 * مكون React
 * 
 * @module ./client/src/components/UserGuideModal
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, ChevronRight, ChevronLeft, BookOpen, Clock, Zap, 
  CheckCircle, Circle, Search 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * مكون دليل المستخدم التفاعلي
 */

interface GuideStep {
  number: number;
  title: string;
  description: string;
  tips?: string[];
  warnings?: string[];
}

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  steps?: GuideStep[];
  content: string;
}

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guides?: Guide[];
}

export default function UserGuideModal({
  isOpen,
  onClose,
  guides = [
    {
      id: 'getting-started',
      title: 'البدء السريع',
      description: 'تعرف على أساسيات النظام',
      icon: '🚀',
      difficulty: 'beginner',
      estimatedTime: 5,
      content: 'مرحباً بك في النظام...',
      steps: [
        {
          number: 1,
          title: 'تسجيل الدخول',
          description: 'استخدم بيانات اعتمادك',
          tips: ['تأكد من كتابة البريد الإلكتروني بشكل صحيح'],
        },
      ],
    },
  ],
}: UserGuideModalProps) {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedGuides, setCompletedGuides] = useState<string[]>([]);

  if (!isOpen) return null;

  const filteredGuides = guides.filter(
    guide =>
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400 bg-green-900/20';
      case 'intermediate':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'advanced':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return 'عام';
    }
  };

  const handleCompleteGuide = () => {
    if (selectedGuide && !completedGuides.includes(selectedGuide.id)) {
      setCompletedGuides([...completedGuides, selectedGuide.id]);
    }
  };

  const handleNextStep = () => {
    if (selectedGuide?.steps && currentStep < selectedGuide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* رأس النافذة */}
        <CardHeader className="border-b border-slate-700 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              دليل المستخدم التفاعلي
            </CardTitle>
            <CardDescription>
              تعلم كيفية استخدام النظام بكفاءة
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </CardHeader>

        {/* المحتوى */}
        <CardContent className="flex-1 overflow-y-auto p-6">
          {!selectedGuide ? (
            // قائمة الأدلة
            <div className="space-y-4">
              {/* البحث */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث عن دليل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                />
              </div>

              {/* الأدلة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGuides.map(guide => (
                  <div
                    key={guide.id}
                    onClick={() => {
                      setSelectedGuide(guide);
                      setCurrentStep(0);
                    }}
                    className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors border border-slate-600 hover:border-cyan-500"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">{guide.icon}</span>
                      {completedGuides.includes(guide.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded ${getDifficultyColor(guide.difficulty)}`}>
                        {getDifficultyLabel(guide.difficulty)}
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {guide.estimatedTime} دقيقة
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredGuides.length === 0 && (
                <Alert className="bg-blue-900/20 border-blue-700">
                  <AlertDescription className="text-blue-400">
                    لم يتم العثور على أدلة مطابقة
                  </AlertDescription>
                </Alert>
              )}

              {/* الإحصائيات */}
              <div className="mt-8 p-4 bg-slate-700 rounded-lg border border-slate-600">
                <h4 className="text-white font-semibold mb-3">إحصائيات التعلم</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">الأدلة المكتملة</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {completedGuides.length}/{guides.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">نسبة الإنجاز</p>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round((completedGuides.length / guides.length) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">الوقت المتبقي</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {guides.reduce((sum, g) => sum + g.estimatedTime, 0) -
                        guides
                          .filter(g => completedGuides.includes(g.id))
                          .reduce((sum, g) => sum + g.estimatedTime, 0)}{' '}
                      دقيقة
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">المستوى</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {completedGuides.length === 0
                        ? 'مبتدئ'
                        : completedGuides.length < guides.length * 0.5
                        ? 'متوسط'
                        : 'متقدم'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // عرض الدليل المحدد
            <div className="space-y-6">
              {/* معلومات الدليل */}
              <div>
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  العودة للقائمة
                </button>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span>{selectedGuide.icon}</span>
                      {selectedGuide.title}
                    </h2>
                    <p className="text-gray-400 mt-1">
                      {selectedGuide.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`px-3 py-1 rounded inline-block ${getDifficultyColor(selectedGuide.difficulty)}`}>
                      {getDifficultyLabel(selectedGuide.difficulty)}
                    </p>
                  </div>
                </div>
              </div>

              {/* محتوى الدليل */}
              {selectedGuide.steps && selectedGuide.steps.length > 0 ? (
                <div className="space-y-6">
                  {/* الخطوة الحالية */}
                  <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">
                        الخطوة {currentStep + 1} من {selectedGuide.steps.length}
                      </h3>
                      <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all"
                          style={{
                            width: `${((currentStep + 1) / selectedGuide.steps.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {selectedGuide.steps[currentStep].title}
                        </h4>
                        <p className="text-gray-300">
                          {selectedGuide.steps[currentStep].description}
                        </p>
                      </div>

                      {/* النصائح */}
                      {selectedGuide.steps[currentStep].tips &&
                        selectedGuide.steps[currentStep].tips!.length > 0 && (
                          <Alert className="bg-green-900/20 border-green-700">
                            <Zap className="w-4 h-4 text-green-400" />
                            <AlertDescription className="text-green-400">
                              <strong>نصائح:</strong>
                              <ul className="list-disc list-inside mt-2">
                                {selectedGuide.steps[currentStep].tips!.map(
                                  (tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                  )
                                )}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                      {/* التحذيرات */}
                      {selectedGuide.steps[currentStep].warnings &&
                        selectedGuide.steps[currentStep].warnings!.length > 0 && (
                          <Alert className="bg-red-900/20 border-red-700">
                            <AlertDescription className="text-red-400">
                              <strong>تحذير:</strong>
                              <ul className="list-disc list-inside mt-2">
                                {selectedGuide.steps[currentStep].warnings!.map(
                                  (warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                  )
                                )}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}
                    </div>
                  </div>

                  {/* أزرار التنقل */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={handlePrevStep}
                      disabled={currentStep === 0}
                      variant="outline"
                      className="border-slate-600 text-gray-300 hover:bg-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      السابق
                    </Button>

                    <div className="flex gap-2">
                      {selectedGuide.steps.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentStep(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentStep ? 'bg-cyan-400 w-6' : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={
                        currentStep === selectedGuide.steps.length - 1
                          ? handleCompleteGuide
                          : handleNextStep
                      }
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      {currentStep === selectedGuide.steps.length - 1 ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          إكمال الدليل
                        </>
                      ) : (
                        <>
                          التالي
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-700 rounded-lg">
                  <p className="text-gray-300">{selectedGuide.content}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
