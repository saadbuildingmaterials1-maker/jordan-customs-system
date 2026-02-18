import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  Plus,
  Download,
  Star,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Send,
  Filter,
  Search,
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'closed' | 'draft';
  responses: number;
  target: number;
  createdDate: string;
  endDate: string;
}

interface Rating {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

export default function SurveysAndRatings() {
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: '1',
      title: 'رضا العملاء عن خدمات الشحن',
      description: 'استطلاع شامل حول جودة خدمات الشحن والتسليم',
      status: 'active',
      responses: 245,
      target: 500,
      createdDate: '2026-02-01',
      endDate: '2026-02-28',
    },
    {
      id: '2',
      title: 'تقييم الخدمات الجمركية',
      description: 'تقييم سرعة ودقة الخدمات الجمركية',
      status: 'active',
      responses: 180,
      target: 300,
      createdDate: '2026-02-05',
      endDate: '2026-03-05',
    },
    {
      id: '3',
      title: 'جودة خدمة العملاء',
      description: 'استطلاع حول جودة الدعم والخدمة',
      status: 'closed',
      responses: 320,
      target: 400,
      createdDate: '2026-01-15',
      endDate: '2026-02-15',
    },
  ]);

  const [ratings, setRatings] = useState<Rating[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      rating: 5,
      comment: 'خدمة ممتازة وسريعة جداً',
      date: '2026-02-18',
      service: 'الشحن السريع',
    },
    {
      id: '2',
      name: 'فاطمة علي',
      rating: 4,
      comment: 'جيدة لكن يمكن تحسين سرعة الاستجابة',
      date: '2026-02-17',
      service: 'الخدمات الجمركية',
    },
    {
      id: '3',
      name: 'محمود حسن',
      rating: 5,
      comment: 'فريق احترافي وموثوق',
      date: '2026-02-16',
      service: 'خدمة العملاء',
    },
    {
      id: '4',
      name: 'سارة أحمد',
      rating: 3,
      comment: 'متوسطة، تحتاج لتحسينات',
      date: '2026-02-15',
      service: 'الشحن العادي',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const ratingData = [
    { rating: '⭐⭐⭐⭐⭐', count: 120, percentage: 45 },
    { rating: '⭐⭐⭐⭐', count: 80, percentage: 30 },
    { rating: '⭐⭐⭐', count: 40, percentage: 15 },
    { rating: '⭐⭐', count: 15, percentage: 6 },
    { rating: '⭐', count: 10, percentage: 4 },
  ];

  const surveyResponseData = [
    { name: 'رضا العملاء', responses: 245, target: 500 },
    { name: 'الخدمات الجمركية', responses: 180, target: 300 },
    { name: 'خدمة العملاء', responses: 320, target: 400 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'closed':
        return 'مغلق';
      case 'draft':
        return 'مسودة';
      default:
        return '';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const averageRating = (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1);
  const totalResponses = surveys.reduce((sum, s) => sum + s.responses, 0);
  const activeSurveys = surveys.filter(s => s.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              الاستطلاعات والتقييمات
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة استطلاعات رأي العملاء والتقييمات
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            استطلاع جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">متوسط التقييم</p>
                <p className="text-3xl font-bold text-yellow-600">{averageRating}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الردود</p>
                <p className="text-3xl font-bold text-blue-600">{totalResponses}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">استطلاعات نشطة</p>
                <p className="text-3xl font-bold text-green-600">{activeSurveys}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">المشاركون</p>
                <p className="text-3xl font-bold text-purple-600">{ratings.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* توزيع التقييمات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                توزيع التقييمات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" name="عدد التقييمات" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ردود الاستطلاعات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                ردود الاستطلاعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={surveyResponseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="responses" fill="#3b82f6" name="الردود الفعلية" />
                  <Bar dataKey="target" fill="#10b981" name="الهدف" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* الاستطلاعات النشطة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              الاستطلاعات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {surveys.map(survey => (
              <div
                key={survey.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {survey.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {survey.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(survey.status)}>
                    {getStatusLabel(survey.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">الردود</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {survey.responses}/{survey.target}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">النسبة</p>
                    <p className="text-lg font-bold text-blue-600">
                      {((survey.responses / survey.target) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">ينتهي في</p>
                    <p className="text-sm text-gray-900 dark:text-white">{survey.endDate}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(survey.responses / survey.target) * 100}%` }}
                  ></div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    عرض
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="w-4 h-4" />
                    تحميل
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* التقييمات الأخيرة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              التقييمات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ratings.map(rating => (
              <div
                key={rating.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {rating.name}
                      </p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {rating.comment}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {rating.service}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rating.date}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم الاستطلاعات والتقييمات لفهم احتياجات العملاء وتحسين الخدمات. راقب التقييمات المنخفضة واتخذ إجراءات تصحيحية فوراً.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
