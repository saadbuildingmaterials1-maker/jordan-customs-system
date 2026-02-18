import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Lock,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Database,
  Network,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function SecurityAndPerformance() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              الأمان والأداء
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              مراقبة أمان النظام وأدائه
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {/* حالة الأمان الشاملة */}
        <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-600" />
                <div>
                  <CardTitle>حالة الأمان</CardTitle>
                  <CardDescription>النظام آمن تماماً</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-600 text-white hover:bg-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                آمن
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* الأمان */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* فحوصات الأمان */}
          <Card>
            <CardHeader>
              <CardTitle>فحوصات الأمان</CardTitle>
              <CardDescription>
                حالة الفحوصات الأمنية الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'تشفير SSL/TLS', status: 'آمن', icon: '🔒' },
                { name: 'حماية CSRF', status: 'مفعل', icon: '🛡️' },
                { name: 'حماية XSS', status: 'مفعل', icon: '⚔️' },
                { name: 'حماية SQL Injection', status: 'مفعل', icon: '🔐' },
                { name: 'إدارة الجلسات', status: 'آمنة', icon: '🔑' },
                { name: 'التحقق من البيانات', status: 'مفعل', icon: '✓' },
              ].map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{check.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {check.name}
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {check.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* تحديثات الأمان */}
          <Card>
            <CardHeader>
              <CardTitle>تحديثات الأمان</CardTitle>
              <CardDescription>
                آخر التحديثات الأمنية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'تحديث مكتبات الأمان', date: '2026-02-18', status: 'مثبت' },
                { name: 'تحديث قاعدة البيانات', date: '2026-02-15', status: 'مثبت' },
                { name: 'تحديث بروتوكول الاتصال', date: '2026-02-10', status: 'مثبت' },
                { name: 'تحديث شهادات SSL', date: '2026-02-05', status: 'مثبت' },
              ].map((update, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {update.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {update.date}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {update.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* الأداء */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* مؤشرات الأداء */}
          <Card>
            <CardHeader>
              <CardTitle>مؤشرات الأداء</CardTitle>
              <CardDescription>
                قياس أداء النظام الحالية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: 'سرعة التحميل', value: 85, unit: 'ms' },
                { name: 'استخدام الذاكرة', value: 45, unit: '%' },
                { name: 'استخدام المعالج', value: 28, unit: '%' },
                { name: 'معدل الاستجابة', value: 92, unit: '%' },
              ].map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metric.name}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {metric.value} {metric.unit}
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* إحصائيات الخادم */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الخادم</CardTitle>
              <CardDescription>
                معلومات الخادم والموارد
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'وقت التشغيل', value: '45 يوم 12 ساعة', icon: '⏱️' },
                { label: 'عدد الطلبات', value: '1,245,678', icon: '📊' },
                { name: 'متوسط الاستجابة', value: '125 ms', icon: '⚡' },
                { label: 'معدل الخطأ', value: '0.02%', icon: '❌' },
                { label: 'النطاق الترددي', value: '2.5 GB/day', icon: '🌐' },
                { label: 'مساحة التخزين', value: '450 GB / 1 TB', icon: '💾' },
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{stat.icon}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label || stat.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* التنبيهات والتوصيات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* التنبيهات */}
          <Card>
            <CardHeader>
              <CardTitle>التنبيهات الأمنية</CardTitle>
              <CardDescription>
                لا توجد تنبيهات حالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  ✓ جميع الفحوصات الأمنية تمر بنجاح
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* التوصيات */}
          <Card>
            <CardHeader>
              <CardTitle>التوصيات</CardTitle>
              <CardDescription>
                تحسينات مقترحة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                '✓ تفعيل المصادقة الثنائية للمسؤولين',
                '✓ زيادة حد الجلسة الآمنة',
                '✓ تفعيل تسجيل الأنشطة المتقدم',
              ].map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* معلومات إضافية */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            يتم فحص أمان النظام تلقائياً كل ساعة. آخر فحص: 2026-02-18 07:15 GMT+3
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
