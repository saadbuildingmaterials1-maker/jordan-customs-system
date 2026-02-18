import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Eye,
  ArrowUp,
  ArrowDown,
  Calendar,
} from 'lucide-react';

interface Prediction {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  recommendation: string;
}

interface Insight {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  category: string;
  actionable: boolean;
}

interface Opportunity {
  id: string;
  title: string;
  potential: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeline: string;
  description: string;
}

export default function SmartAnalyticsDashboard() {
  const [predictions] = useState<Prediction[]>([
    {
      id: '1',
      title: 'زيادة الطلب على خدمة الشحن الدولي',
      description: 'التنبؤ يشير إلى زيادة الطلب بنسبة 25% في الربع القادم',
      confidence: 87,
      impact: 'high',
      timeframe: 'الربع القادم',
      recommendation: 'زيادة الموارد والموظفين لمعالجة الطلب المتزايد',
    },
    {
      id: '2',
      title: 'تحسن في معدل الاحتفاظ بالعملاء',
      description: 'البيانات تشير إلى تحسن في معدل الاحتفاظ بنسبة 12%',
      confidence: 79,
      impact: 'medium',
      timeframe: 'الشهر الحالي',
      recommendation: 'الاستمرار في تحسين جودة الخدمة والدعم الفني',
    },
    {
      id: '3',
      title: 'انخفاض متوقع في تكاليف العمليات',
      description: 'تحسن الكفاءة قد يؤدي إلى انخفاض التكاليف بنسبة 8%',
      confidence: 72,
      impact: 'medium',
      timeframe: 'الشهرين القادمين',
      recommendation: 'تطبيق تحسينات العمليات المقترحة',
    },
  ]);

  const [insights] = useState<Insight[]>([
    {
      id: '1',
      title: 'أفضل أداء للمنتج',
      value: 'خدمة الشحن الدولي',
      change: 18.5,
      trend: 'up',
      category: 'المبيعات',
      actionable: true,
    },
    {
      id: '2',
      title: 'معدل رضا العملاء',
      value: '4.7/5',
      change: 5.2,
      trend: 'up',
      category: 'الخدمة',
      actionable: true,
    },
    {
      id: '3',
      title: 'متوسط قيمة الطلب',
      value: '367 JOD',
      change: -2.1,
      trend: 'down',
      category: 'المبيعات',
      actionable: true,
    },
    {
      id: '4',
      title: 'معدل تحويل العملاء المحتملين',
      value: '32%',
      change: 8.3,
      trend: 'up',
      category: 'التسويق',
      actionable: true,
    },
  ]);

  const [opportunities] = useState<Opportunity[]>([
    {
      id: '1',
      title: 'توسع الخدمات إلى دول جديدة',
      potential: 150000,
      difficulty: 'medium',
      timeline: '3-6 أشهر',
      description: 'فرصة لتوسيع الخدمات إلى دول الخليج والشرق الأوسط',
    },
    {
      id: '2',
      title: 'تطوير تطبيق الهاتف المحمول',
      potential: 200000,
      difficulty: 'hard',
      timeline: '6-9 أشهر',
      description: 'تطبيق محمول متقدم لتحسين تجربة المستخدم',
    },
    {
      id: '3',
      title: 'برنامج الولاء للعملاء',
      potential: 75000,
      difficulty: 'easy',
      timeline: '1-2 شهر',
      description: 'برنامج نقاط وحوافز لزيادة الاحتفاظ بالعملاء',
    },
  ]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return '';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-10 h-10 text-purple-600" />
              لوحة تحكم التحليلات الذكية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تنبؤات ذكية ورؤى متقدمة لتحسين الأداء
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              تحميل التقرير
            </Button>
          </div>
        </div>

        {/* التنبؤات الذكية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              التنبؤات الذكية
            </CardTitle>
            <CardDescription>
              تنبؤات مبنية على تحليل البيانات التاريخية والاتجاهات الحالية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {predictions.map(prediction => (
              <div key={prediction.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {prediction.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {prediction.description}
                    </p>
                  </div>
                  <Badge className={getImpactColor(prediction.impact)}>
                    {prediction.impact === 'high' ? 'تأثير عالي' : prediction.impact === 'medium' ? 'تأثير متوسط' : 'تأثير منخفض'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">درجة الثقة</p>
                    <p className={`font-semibold text-lg ${getConfidenceColor(prediction.confidence)}`}>
                      {prediction.confidence}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الإطار الزمني</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{prediction.timeframe}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">التوصية</p>
                    <p className="font-semibold text-blue-600">{prediction.recommendation.split(' ')[0]}...</p>
                  </div>
                </div>

                <p className="text-sm text-blue-600 dark:text-blue-400">
                  📌 التوصية: {prediction.recommendation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* الرؤى المتقدمة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              الرؤى المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map(insight => (
                <div key={insight.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                    <div className={`flex items-center gap-1 ${insight.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {insight.trend === 'up' ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">{Math.abs(insight.change)}%</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{insight.value}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{insight.category}</Badge>
                    {insight.actionable && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        قابل للتنفيذ
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الفرص المتاحة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              الفرص المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunities.map(opportunity => (
              <div key={opportunity.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {opportunity.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {opportunity.description}
                    </p>
                  </div>
                  <Badge className={getDifficultyColor(opportunity.difficulty)}>
                    {opportunity.difficulty === 'easy' ? 'سهل' : opportunity.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الإمكانية المالية</p>
                    <p className="font-semibold text-green-600">{opportunity.potential.toLocaleString()} JOD</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الإطار الزمني</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{opportunity.timeline}</p>
                  </div>
                </div>

                <Button size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="text-purple-700 dark:text-purple-300">
            🧠 نصيحة ذكية: استخدم هذه التنبؤات والرؤى لاتخاذ قرارات استراتيجية مستنيرة. ركز على الفرص ذات التأثير العالي والصعوبة المنخفضة أولاً.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
