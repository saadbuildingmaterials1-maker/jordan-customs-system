import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Lightbulb,
  Cpu,
  Activity,
  Download,
  RefreshCw,
} from 'lucide-react';

interface Prediction {
  id: string;
  title: string;
  category: string;
  prediction: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  recommendation: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'challenge' | 'trend';
  impact: string;
  actionItems: string[];
}

interface Metric {
  id: string;
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  forecast: string;
}

export default function SmartAnalyticsAdvanced() {
  const [predictions] = useState<Prediction[]>([
    {
      id: '1',
      title: 'زيادة الطلب على خدمات الشحن',
      category: 'Demand',
      prediction: 'من المتوقع زيادة الطلب بنسبة 35% في الربع القادم',
      confidence: 87,
      impact: 'high',
      timeframe: 'الربع القادم',
      recommendation: 'زيادة السعة والموارد البشرية',
    },
    {
      id: '2',
      title: 'تحسن كفاءة التسليم',
      category: 'Efficiency',
      prediction: 'تحسن متوقع بنسبة 18% في سرعة التسليم',
      confidence: 79,
      impact: 'medium',
      timeframe: 'الشهر القادم',
      recommendation: 'تحسين المسارات اللوجستية',
    },
    {
      id: '3',
      title: 'انخفاض محتمل في التكاليف',
      category: 'Cost',
      prediction: 'انخفاض متوقع بنسبة 12% في تكاليف التشغيل',
      confidence: 72,
      impact: 'medium',
      timeframe: '6 أشهر',
      recommendation: 'تحسين إدارة المخزون',
    },
  ]);

  const [insights] = useState<Insight[]>([
    {
      id: '1',
      title: 'فرصة توسع السوق',
      description: 'هناك فرصة قوية للتوسع في أسواق جديدة بناءً على البيانات الحالية',
      type: 'opportunity',
      impact: 'عالي جداً',
      actionItems: [
        'دراسة السوق المستهدفة',
        'تطوير استراتيجية تسويق',
        'تخصيص موارد إضافية',
      ],
    },
    {
      id: '2',
      title: 'تحدي في إدارة الموارد',
      description: 'ارتفاع معدل دوران الموظفين قد يؤثر على الإنتاجية',
      type: 'challenge',
      impact: 'متوسط',
      actionItems: [
        'تحسين بيئة العمل',
        'زيادة المزايا والحوافز',
        'برامج تطوير الموظفين',
      ],
    },
    {
      id: '3',
      title: 'اتجاه نحو الرقمنة',
      description: 'زيادة الطلب على الحلول الرقمية والأتمتة في القطاع',
      type: 'trend',
      impact: 'عالي',
      actionItems: [
        'استثمار في التكنولوجيا',
        'تدريب الموظفين',
        'تطوير منصات رقمية',
      ],
    },
  ]);

  const [metrics] = useState<Metric[]>([
    {
      id: '1',
      name: 'الإيرادات',
      value: '2.5M JOD',
      change: 15.3,
      trend: 'up',
      forecast: 'متوقع: 2.9M JOD (الشهر القادم)',
    },
    {
      id: '2',
      name: 'رضا العملاء',
      value: '4.7/5.0',
      change: 8.2,
      trend: 'up',
      forecast: 'متوقع: 4.8/5.0 (الشهر القادم)',
    },
    {
      id: '3',
      name: 'كفاءة التسليم',
      value: '94.2%',
      change: -2.1,
      trend: 'down',
      forecast: 'متوقع: 96.0% (الشهر القادم)',
    },
    {
      id: '4',
      name: 'تكاليف التشغيل',
      value: '450K JOD',
      change: -5.8,
      trend: 'down',
      forecast: 'متوقع: 425K JOD (الشهر القادم)',
    },
  ]);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'challenge':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'trend':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return '';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      opportunity: '💡 فرصة',
      challenge: '⚠ تحدي',
      trend: '📈 اتجاه',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-10 h-10 text-purple-600" />
              نظام التحليلات الذكية المتقدم
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تحليلات مدعومة بالذكاء الاصطناعي مع تنبؤات ورؤى ذكية
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        {/* المقاييس الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metrics.map(metric => (
            <Card key={metric.id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                  <div className="flex items-center gap-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : metric.trend === 'down' ? (
                      <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-600" />
                    )}
                    <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{metric.forecast}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التنبؤات الذكية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              التنبؤات الذكية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map(prediction => (
                <div key={prediction.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{prediction.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getImpactColor(prediction.impact)}>
                          {prediction.impact === 'high' ? 'تأثير عالي' : prediction.impact === 'medium' ? 'تأثير متوسط' : 'تأثير منخفض'}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{prediction.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">ثقة: {prediction.confidence}%</p>
                      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-2">{prediction.prediction}</p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded mb-2">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>التوصية:</strong> {prediction.recommendation}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">الإطار الزمني: {prediction.timeframe}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الرؤى الذكية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              الرؤى الذكية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map(insight => (
                <div key={insight.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                    <Badge className={getTypeColor(insight.type)}>
                      {getTypeLabel(insight.type)}
                    </Badge>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">التأثير: {insight.impact}</p>
                    <div className="space-y-1">
                      {insight.actionItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="text-purple-700 dark:text-purple-300">
            🧠 نصيحة: هذه التنبؤات والرؤى مدعومة بالذكاء الاصطناعي وتحليل البيانات التاريخية. استخدمها لاتخاذ قرارات استراتيجية مستنيرة. تحديث البيانات يتم تلقائياً كل ساعة.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
