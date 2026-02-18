import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Target,
  AlertCircle,
  Download,
  Filter,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface SalesMetric {
  label: string;
  value: number;
  currency?: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface SalesTarget {
  id: string;
  name: string;
  target: number;
  achieved: number;
  percentage: number;
  status: 'on-track' | 'at-risk' | 'exceeded';
  period: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
  margin: number;
}

export default function AdvancedSalesDashboard() {
  const [metrics] = useState<SalesMetric[]>([
    {
      label: 'إجمالي المبيعات',
      value: 125500,
      currency: 'JOD',
      change: 12.5,
      trend: 'up',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'text-green-600',
    },
    {
      label: 'عدد الطلبات',
      value: 342,
      change: 8.3,
      trend: 'up',
      icon: <ShoppingCart className="w-8 h-8" />,
      color: 'text-blue-600',
    },
    {
      label: 'العملاء النشطين',
      value: 156,
      change: 5.2,
      trend: 'up',
      icon: <Users className="w-8 h-8" />,
      color: 'text-purple-600',
    },
    {
      label: 'متوسط الطلب',
      value: 367,
      currency: 'JOD',
      change: -2.1,
      trend: 'down',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'text-orange-600',
    },
  ]);

  const [targets] = useState<SalesTarget[]>([
    {
      id: '1',
      name: 'الهدف الشهري - فبراير',
      target: 150000,
      achieved: 125500,
      percentage: 83.7,
      status: 'on-track',
      period: 'فبراير 2026',
    },
    {
      id: '2',
      name: 'الهدف الربع سنوي - Q1',
      target: 400000,
      achieved: 285000,
      percentage: 71.3,
      status: 'on-track',
      period: 'Q1 2026',
    },
    {
      id: '3',
      name: 'هدف الإيرادات السنوي',
      target: 1500000,
      achieved: 650000,
      percentage: 43.3,
      status: 'at-risk',
      period: '2026',
    },
  ]);

  const [topProducts] = useState<TopProduct[]>([
    {
      id: '1',
      name: 'خدمة الشحن الدولي',
      sales: 156,
      revenue: 45600,
      growth: 18.5,
      margin: 35,
    },
    {
      id: '2',
      name: 'خدمة الجمارك',
      sales: 98,
      revenue: 32400,
      growth: 12.3,
      margin: 28,
    },
    {
      id: '3',
      name: 'خدمة التخزين',
      sales: 78,
      revenue: 28500,
      growth: 8.7,
      margin: 42,
    },
    {
      id: '4',
      name: 'خدمة التأمين',
      sales: 45,
      revenue: 19000,
      growth: -5.2,
      margin: 55,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'exceeded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'على المسار الصحيح';
      case 'at-risk':
        return 'معرض للخطر';
      case 'exceeded':
        return 'تم تجاوزه';
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              لوحة تحكم المبيعات المتقدمة
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تتبع المبيعات والأهداف والأداء مع رسوم بيانية متقدمة
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              تصفية حسب التاريخ
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        {/* مؤشرات الأداء الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${metric.color} opacity-80`}>
                    {metric.icon}
                  </div>
                  <div className={`flex items-center gap-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">{Math.abs(metric.change)}%</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metric.value.toLocaleString()}
                  {metric.currency && <span className="text-lg ml-1">{metric.currency}</span>}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* الأهداف والإنجازات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              الأهداف والإنجازات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {targets.map(target => (
              <div key={target.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{target.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{target.period}</p>
                  </div>
                  <Badge className={getStatusColor(target.status)}>
                    {getStatusLabel(target.status)}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      {target.achieved.toLocaleString()} / {target.target.toLocaleString()} JOD
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {target.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        target.status === 'exceeded'
                          ? 'bg-blue-600'
                          : target.status === 'on-track'
                          ? 'bg-green-600'
                          : 'bg-yellow-600'
                      }`}
                      style={{ width: `${Math.min(target.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* أفضل المنتجات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              أفضل المنتجات والخدمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المنتج</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المبيعات</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الإيرادات</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">النمو</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الهامش</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map(product => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{product.name}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{product.sales}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {product.revenue.toLocaleString()} JOD
                      </td>
                      <td className={`py-3 px-4 font-semibold ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.growth >= 0 ? '+' : ''}{product.growth}%
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{product.margin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* التنبيهات والتوصيات */}
        <div className="space-y-3">
          <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              ⚠️ تحذير: هدف الإيرادات السنوي معرض للخطر. يجب زيادة المبيعات بمعدل 15% شهرياً للوصول للهدف.
            </AlertDescription>
          </Alert>

          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              ✅ نقاط إيجابية: خدمة الشحن الدولي تحقق أفضل أداء بنمو 18.5% وهامش ربح 35%.
            </AlertDescription>
          </Alert>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: ركز على تحسين خدمات التأمين والتخزين لزيادة الإيرادات الإجمالية. استخدم البيانات التاريخية لتحسين التنبؤات.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
