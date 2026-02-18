import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Lightbulb,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Target,
  Star,
  Clock,
  Users,
  DollarSign,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  targetAudience: string;
  estimatedBenefit: string;
  status: 'active' | 'implemented' | 'rejected';
  feedback: number;
  views: number;
}

interface CustomerRecommendation {
  id: string;
  customerName: string;
  recommendedService: string;
  reason: string;
  confidence: number;
  estimatedValue: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      title: 'زيادة الشحن السريع',
      description: 'توسيع خدمة الشحن السريع بناءً على الطلب المتزايد',
      category: 'Service Expansion',
      confidence: 92,
      impact: 'high',
      targetAudience: 'جميع العملاء',
      estimatedBenefit: '+$50,000 شهرياً',
      status: 'active',
      feedback: 45,
      views: 234,
    },
    {
      id: '2',
      title: 'تحسين تجربة العملاء',
      description: 'إضافة خيارات دفع جديدة لتحسين تجربة الشراء',
      category: 'Customer Experience',
      confidence: 85,
      impact: 'high',
      targetAudience: 'العملاء الجدد',
      estimatedBenefit: '+15% معدل التحويل',
      status: 'active',
      feedback: 32,
      views: 156,
    },
    {
      id: '3',
      title: 'برنامج الولاء للعملاء',
      description: 'إطلاق برنامج نقاط وحوافز للعملاء المخلصين',
      category: 'Customer Retention',
      confidence: 88,
      impact: 'medium',
      targetAudience: 'العملاء الحاليين',
      estimatedBenefit: '+20% الاحتفاظ',
      status: 'implemented',
      feedback: 67,
      views: 345,
    },
    {
      id: '4',
      title: 'توسيع الخدمات الدولية',
      description: 'إضافة خدمات شحن دولية جديدة',
      category: 'Market Expansion',
      confidence: 78,
      impact: 'high',
      targetAudience: 'العملاء الدوليين',
      estimatedBenefit: '+$75,000 شهرياً',
      status: 'active',
      feedback: 28,
      views: 189,
    },
  ]);

  const [customerRecommendations, setCustomerRecommendations] = useState<CustomerRecommendation[]>([
    {
      id: '1',
      customerName: 'أحمد محمد',
      recommendedService: 'الشحن السريع المتقدم',
      reason: 'بناءً على نمط الشحن المتكرر والسريع',
      confidence: 94,
      estimatedValue: 450,
      status: 'accepted',
    },
    {
      id: '2',
      customerName: 'فاطمة علي',
      recommendedService: 'خدمة التخزين المؤقت',
      reason: 'بناءً على حجم الشحنات المتكررة',
      confidence: 87,
      estimatedValue: 280,
      status: 'pending',
    },
    {
      id: '3',
      customerName: 'محمود حسن',
      recommendedService: 'الشحن الدولي المتقدم',
      reason: 'بناءً على الشحنات الدولية السابقة',
      confidence: 91,
      estimatedValue: 620,
      status: 'accepted',
    },
    {
      id: '4',
      customerName: 'سارة أحمد',
      recommendedService: 'خدمة الجمارك المتخصصة',
      reason: 'بناءً على نوع المنتجات المشحونة',
      confidence: 82,
      estimatedValue: 350,
      status: 'rejected',
    },
  ]);

  const recommendationImpactData = [
    { category: 'Service Expansion', impact: 85 },
    { category: 'Customer Experience', impact: 72 },
    { category: 'Customer Retention', impact: 68 },
    { category: 'Market Expansion', impact: 78 },
  ];

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

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'عالي';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'منخفض';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'implemented':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'implemented':
        return 'منفذ';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'قيد الانتظار';
      case 'accepted':
        return 'مقبول';
      default:
        return '';
    }
  };

  const totalRecommendations = recommendations.length;
  const activeRecommendations = recommendations.filter(r => r.status === 'active').length;
  const implementedRecommendations = recommendations.filter(r => r.status === 'implemented').length;
  const averageConfidence = (recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام التوصيات الذكية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              توصيات ذكية لتحسين الخدمات والإيرادات
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            توصية جديدة
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Lightbulb className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي التوصيات</p>
                <p className="text-3xl font-bold text-yellow-600">{totalRecommendations}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">منفذة</p>
                <p className="text-3xl font-bold text-green-600">{implementedRecommendations}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">نشطة</p>
                <p className="text-3xl font-bold text-blue-600">{activeRecommendations}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">متوسط الثقة</p>
                <p className="text-3xl font-bold text-purple-600">{averageConfidence}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تأثير التوصيات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              تأثير التوصيات حسب الفئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={recommendationImpactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="impact" fill="#3b82f6" name="درجة التأثير" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* التوصيات العامة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              التوصيات العامة للنظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(rec.impact)}>
                      {getImpactLabel(rec.impact)}
                    </Badge>
                    <Badge className={getStatusColor(rec.status)}>
                      {getStatusLabel(rec.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">الثقة</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{rec.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">الفئة</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{rec.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">الفائدة المتوقعة</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{rec.estimatedBenefit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">المشاهدات</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{rec.views}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    عرض التفاصيل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    موافق ({rec.feedback})
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <ThumbsDown className="w-4 h-4" />
                    غير موافق
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* التوصيات للعملاء */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              التوصيات الشخصية للعملاء
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customerRecommendations.map(rec => (
              <div
                key={rec.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {rec.customerName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      الخدمة المقترحة: {rec.recommendedService}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      السبب: {rec.reason}
                    </p>
                  </div>
                  <Badge className={getStatusColor(rec.status)}>
                    {getStatusLabel(rec.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">الثقة</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{rec.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">القيمة المتوقعة</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${rec.estimatedValue}</p>
                  </div>
                  <div className="flex items-end">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="gap-1">
                    <CheckCircle className="w-4 h-4" />
                    موافقة
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <ThumbsDown className="w-4 h-4" />
                    رفض
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم التوصيات الذكية لاتخاذ قرارات استراتيجية. راجع درجات الثقة والتأثير المتوقع قبل تنفيذ أي توصية.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
