import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Smartphone,
  Apple,
  Code,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Settings,
  Download,
  GitBranch,
  BarChart3,
  Cpu,
  Wifi,
  Battery,
  Volume2,
} from 'lucide-react';

interface MobileApp {
  id: string;
  platform: 'iOS' | 'Android';
  version: string;
  status: 'development' | 'testing' | 'ready' | 'published';
  progress: number;
  features: number;
  completedFeatures: number;
  buildSize: string;
  minimumOS: string;
  targetOS: string;
}

interface Feature {
  id: string;
  name: string;
  category: string;
  status: 'planned' | 'in-progress' | 'completed' | 'testing';
  priority: 'high' | 'medium' | 'low';
  estimatedDays: number;
  completedDays: number;
}

interface Device {
  id: string;
  name: string;
  os: string;
  osVersion: string;
  screenSize: string;
  status: 'supported' | 'testing' | 'not-supported';
}

export default function MobileAppDevelopmentAdvanced() {
  const [apps] = useState<MobileApp[]>([
    {
      id: '1',
      platform: 'iOS',
      version: '1.0.0',
      status: 'development',
      progress: 75,
      features: 25,
      completedFeatures: 19,
      buildSize: '145 MB',
      minimumOS: 'iOS 14.0',
      targetOS: 'iOS 17.0',
    },
    {
      id: '2',
      platform: 'Android',
      version: '1.0.0',
      status: 'development',
      progress: 72,
      features: 25,
      completedFeatures: 18,
      buildSize: '152 MB',
      minimumOS: 'Android 10',
      targetOS: 'Android 14',
    },
  ]);

  const [features] = useState<Feature[]>([
    {
      id: '1',
      name: 'تتبع الشحنات الفوري',
      category: 'Shipping',
      status: 'completed',
      priority: 'high',
      estimatedDays: 5,
      completedDays: 5,
    },
    {
      id: '2',
      name: 'إدارة الفواتير',
      category: 'Billing',
      status: 'completed',
      priority: 'high',
      estimatedDays: 4,
      completedDays: 4,
    },
    {
      id: '3',
      name: 'نظام الإشعارات',
      category: 'Notifications',
      status: 'in-progress',
      priority: 'high',
      estimatedDays: 3,
      completedDays: 2,
    },
    {
      id: '4',
      name: 'الدردشة الحية',
      category: 'Communication',
      status: 'in-progress',
      priority: 'medium',
      estimatedDays: 6,
      completedDays: 3,
    },
    {
      id: '5',
      name: 'التقارير والتحليلات',
      category: 'Analytics',
      status: 'planned',
      priority: 'medium',
      estimatedDays: 5,
      completedDays: 0,
    },
  ]);

  const [devices] = useState<Device[]>([
    { id: '1', name: 'iPhone 14 Pro', os: 'iOS', osVersion: '17.2', screenSize: '6.1"', status: 'supported' },
    { id: '2', name: 'iPhone 13', os: 'iOS', osVersion: '17.2', screenSize: '6.1"', status: 'supported' },
    { id: '3', name: 'iPhone 12', os: 'iOS', osVersion: '17.2', screenSize: '6.1"', status: 'supported' },
    { id: '4', name: 'Samsung Galaxy S24', os: 'Android', osVersion: '14', screenSize: '6.2"', status: 'supported' },
    { id: '5', name: 'Samsung Galaxy S23', os: 'Android', osVersion: '14', screenSize: '6.1"', status: 'supported' },
    { id: '6', name: 'Google Pixel 8', os: 'Android', osVersion: '14', screenSize: '6.2"', status: 'supported' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'supported':
      case 'published':
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in-progress':
      case 'testing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'planned':
      case 'development':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'not-supported':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planned: '📋 مخطط',
      'in-progress': '⚙ قيد التطوير',
      completed: '✓ مكتمل',
      testing: '🧪 اختبار',
      development: '👨‍💻 تطوير',
      ready: '✓ جاهز',
      published: '📱 منشور',
      supported: '✓ مدعوم',
      'not-supported': '✕ غير مدعوم',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-10 h-10 text-blue-600" />
              تطوير تطبيق الهاتف المحمول الأصلي
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تطبيقات iOS و Android متوافقة مع النظام
            </p>
          </div>
        </div>

        {/* حالة التطبيقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.map(app => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {app.platform === 'iOS' ? (
                      <Apple className="w-6 h-6 text-gray-900 dark:text-white" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-green-600" />
                    )}
                    {app.platform}
                  </CardTitle>
                  <Badge className={getStatusColor(app.status)}>
                    {getStatusLabel(app.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">التقدم</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{app.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${app.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الإصدار</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{app.version}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">حجم البناء</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{app.buildSize}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الميزات</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {app.completedFeatures}/{app.features}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الحد الأدنى</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{app.minimumOS}</p>
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  تحميل البناء الأخير
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* الميزات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              الميزات والمهام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {features.map(feature => (
                <div key={feature.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{feature.name}</h3>
                        <Badge className={getStatusColor(feature.status)}>
                          {getStatusLabel(feature.status)}
                        </Badge>
                        <Badge className={getPriorityColor(feature.priority)}>
                          {feature.priority === 'high' ? 'عالية' : feature.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {feature.completedDays}/{feature.estimatedDays} أيام
                    </span>
                    <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(feature.completedDays / feature.estimatedDays) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الأجهزة المدعومة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              الأجهزة المدعومة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الجهاز</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">النظام</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الإصدار</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">حجم الشاشة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(device => (
                    <tr key={device.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{device.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{device.os}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{device.osVersion}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{device.screenSize}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(device.status)}>
                          {getStatusLabel(device.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            📱 نصيحة: التطبيقات قيد التطوير النشط. يمكنك تحميل البناء الأخير للاختبار. تتبع تقدم الميزات والأجهزة المدعومة. سيتم نشر التطبيقات قريباً على App Store و Google Play.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
