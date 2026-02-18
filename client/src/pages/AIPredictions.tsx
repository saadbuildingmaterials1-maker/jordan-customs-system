import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  BarChart3,
  LineChart,
  AlertCircle,
  CheckCircle,
  Zap,
  Settings,
  Download,
  RefreshCw,
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Prediction {
  id: string;
  category: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  timeframe: string;
  recommendation: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  status: 'new' | 'acknowledged' | 'implemented';
}

export default function AIPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: '1',
      category: 'الطلب على الشحنات',
      metric: 'عدد الشحنات الشهرية',
      currentValue: 450,
      predictedValue:520,
      trend: 'up',
      confidence: 92,
      timeframe: 'الشهر القادم',
      recommendation: 'زيادة الموارد البشرية والمستودعات بنسبة 15%',
    },
    {
      id: '2',
      category: 'استهلاك المواد',
      metric: 'صناديق الشحن',
      currentValue: 450,
      predictedValue: 380,
      trend: 'down',
      confidence: 85,
      timeframe: 'الشهر القادم',
      recommendation: 'تقليل طلبيات المواد بنسبة 20%',
    },
    {
      id: '3',
      category: 'تكاليف التشغيل',
      metric: 'التكاليف الشهرية',
      currentValue: 15000,
      predictedValue: 17500,
      trend: 'up',
      confidence: 88,
      timeframe: 'الربع القادم',
      recommendation: 'مراجعة العقود والبحث عن موردين بديلين',
    },
    {
      id: '4',
      category: 'معدل الأخطاء',
      metric: 'نسبة الأخطاء',
      currentValue: 2.5,
      predictedValue: 1.8,
      trend: 'down',
      confidence: 79,
      timeframe: 'الشهر القادم',
      recommendation: 'الاستمرار في برامج التدريب الحالية',
    },
  ]);

  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: '1',
      title: 'فرصة تحسين الكفاءة',
      description: 'يمكن تقليل وقت معالجة الشحنات بنسبة 25% باستخدام الأتمتة',
      impact: 'high',
      action: 'تنفيذ نظام الأتمتة',
      status: 'new',
    },
    {
      id: '2',
      title: 'تحذير من زيادة التكاليف',
      description: 'تكاليف الشحن الدولي ستزداد بنسبة 18% في الربع القادم',
      impact: 'high',
      action: 'مراجعة أسعار الشحن والتفاوض مع الناقلين',
      status: 'acknowledged',
    },
    {
      id: '3',
      title: 'توصية بتحسين الخدمة',
      description: 'العملاء الذين يتلقون تحديثات فورية يزيد رضاهم بنسبة 35%',
      impact: 'medium',
      action: 'تفعيل نظام التنبيهات الفورية',
      status: 'implemented',
    },
  ]);

  const [chartData] = useState([
    { month: 'يناير', predicted: 400, actual: 380 },
    { month: 'فبراير', predicted: 420, actual: 410 },
    { month: 'مارس', predicted: 450, actual: 460 },
    { month: 'أبريل', predicted: 480, actual: 470 },
    { month: 'مايو', predicted: 520, actual: null },
    { month: 'يونيو', predicted: 550, actual: null },
  ]);

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <TrendingUp className="w-5 h-5 text-red-500" />;
    } else if (trend === 'down') {
      return <TrendingUp className="w-5 h-5 text-green-500 rotate-180" />;
    } else {
      return <BarChart3 className="w-5 h-5 text-gray-500" />;
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'acknowledged':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'implemented':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام الذكاء الاصطناعي والتنبؤات
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تنبؤات ذكية وتوصيات مبنية على تحليل البيانات
            </p>
          </div>
          <Button className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث التنبؤات
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Brain className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">التنبؤات النشطة</p>
                <p className="text-3xl font-bold text-purple-600">{predictions.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">الرؤى الذكية</p>
                <p className="text-3xl font-bold text-yellow-600">{insights.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">متوسط الثقة</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الرسم البياني */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              التنبؤات مقابل القيم الفعلية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" name="التنبؤات" />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="القيم الفعلية" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* التنبؤات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                التنبؤات الرئيسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {predictions.map(prediction => (
                <div
                  key={prediction.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      {getTrendIcon(prediction.trend)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {prediction.category}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {prediction.metric}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {prediction.confidence}% ثقة
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">القيمة الحالية</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {prediction.currentValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">التنبؤ</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {prediction.predictedValue}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {prediction.timeframe}
                  </p>

                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                      {prediction.recommendation}
                    </AlertDescription>
                  </Alert>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* الرؤى الذكية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                الرؤى الذكية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map(insight => (
                <div
                  key={insight.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      {getStatusIcon(insight.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {insight.title}
                        </h3>
                      </div>
                    </div>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact === 'high' ? 'عالي' :
                       insight.impact === 'medium' ? 'متوسط' :
                       'منخفض'}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {insight.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {insight.status === 'new' ? 'جديد' :
                       insight.status === 'acknowledged' ? 'تم الإقرار' :
                       'تم التنفيذ'}
                    </Badge>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {insight.action}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم التنبؤات والرؤى الذكية لاتخاذ قرارات استراتيجية. تذكر أن الثقة العالية لا تعني دقة 100%، لذا تحقق دائماً من البيانات الفعلية.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
