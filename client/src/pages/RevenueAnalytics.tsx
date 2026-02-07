/**
 * Revenue Analytics Page
 * 
 * صفحة تقارير الإيرادات والتحليلات
 * عرض رسوم بيانية وإحصائيات شاملة
 * 
 * @module client/src/pages/RevenueAnalytics
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Calendar, Download } from 'lucide-react';

interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
  growth: number;
}

interface PlanStats {
  name: string;
  subscribers: number;
  revenue: number;
  percentage: number;
}

export default function RevenueAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // بيانات الإيرادات الشهرية
  const revenueData: RevenueData[] = [
    { month: 'يناير', revenue: 5000, subscriptions: 15, growth: 0 },
    { month: 'فبراير', revenue: 6500, subscriptions: 20, growth: 30 },
    { month: 'مارس', revenue: 8200, subscriptions: 25, growth: 26 },
    { month: 'أبريل', revenue: 9800, subscriptions: 32, growth: 20 },
    { month: 'مايو', revenue: 12000, subscriptions: 40, growth: 22 },
    { month: 'يونيو', revenue: 14500, subscriptions: 48, growth: 21 },
  ];

  // إحصائيات الخطط
  const planStats: PlanStats[] = [
    { name: 'الخطة الأساسية', subscribers: 120, revenue: 11880, percentage: 35 },
    { name: 'الخطة المهنية', subscribers: 80, revenue: 23920, percentage: 45 },
    { name: 'الخطة المؤسسية', subscribers: 20, revenue: 19980, percentage: 20 },
  ];

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSubscriptions = revenueData.reduce((sum, item) => sum + item.subscriptions, 0);
  const avgRevenue = totalRevenue / revenueData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            تقارير الإيرادات والتحليلات
          </h1>
          <p className="text-gray-600">
            عرض شامل للإيرادات والاشتراكات والتحليلات
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                إجمالي الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {totalRevenue.toLocaleString('ar-JO')} JOD
              </p>
              <p className="text-xs text-green-600 mt-1">↑ 21% من الشهر الماضي</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                إجمالي الاشتراكات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {totalSubscriptions}
              </p>
              <p className="text-xs text-blue-600 mt-1">↑ 8 اشتراكات جديدة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                متوسط الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(avgRevenue).toLocaleString('ar-JO')} JOD
              </p>
              <p className="text-xs text-purple-600 mt-1">شهرياً</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                معدل النمو
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                21%
              </p>
              <p className="text-xs text-orange-600 mt-1">نمو شهري متوسط</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>الإيرادات الشهرية</CardTitle>
              <CardDescription>
                تطور الإيرادات خلال الستة أشهر الماضية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {item.month}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {item.revenue.toLocaleString('ar-JO')} JOD
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(item.revenue / 15000) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>الاشتراكات النشطة</CardTitle>
              <CardDescription>
                عدد الاشتراكات النشطة خلال الستة أشهر الماضية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {item.month}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {item.subscriptions} اشتراك
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(item.subscriptions / 50) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Statistics */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>إحصائيات الخطط</CardTitle>
            <CardDescription>
              توزيع الاشتراكات والإيرادات حسب الخطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {planStats.map((plan, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{plan.name}</p>
                      <p className="text-sm text-gray-600">
                        {plan.subscribers} مشترك
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {plan.revenue.toLocaleString('ar-JO')} JOD
                      </p>
                      <Badge className="mt-1">
                        {plan.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${plan.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>تصدير التقارير</CardTitle>
            <CardDescription>
              قم بتحميل التقارير بصيغ مختلفة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                تحميل PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                تحميل Excel
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                تحميل CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Period Selector */}
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
          >
            شهري
          </Button>
          <Button
            variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('quarter')}
          >
            ربع سنوي
          </Button>
          <Button
            variant={selectedPeriod === 'year' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('year')}
          >
            سنوي
          </Button>
        </div>
      </div>
    </div>
  );
}
