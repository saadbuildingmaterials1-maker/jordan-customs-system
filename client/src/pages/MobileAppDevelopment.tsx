import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Smartphone,
  Apple,
  Download,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Star,
  Code,
  Zap,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  GitBranch,
  Layers,
  Cpu,
  Wifi,
} from 'lucide-react';

interface MobileApp {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'both';
  version: string;
  status: 'development' | 'testing' | 'published' | 'beta';
  downloads: number;
  rating: number;
  reviews: number;
  features: string[];
  lastUpdate: string;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'in-progress' | 'planned';
  estimatedTime: string;
}

interface DeviceSupport {
  device: string;
  osVersion: string;
  supported: boolean;
  coverage: number;
}

export default function MobileAppDevelopment() {
  const [apps] = useState<MobileApp[]>([
    {
      id: '1',
      name: 'تطبيق الجمارك الأردنية - iOS',
      platform: 'ios',
      version: '1.0.0',
      status: 'development',
      downloads: 0,
      rating: 0,
      reviews: 0,
      features: ['تتبع الشحنات', 'إدارة الفواتير', 'الإشعارات الفورية', 'الدفع المحلي'],
      lastUpdate: '2026-02-18',
    },
    {
      id: '2',
      name: 'تطبيق الجمارك الأردنية - Android',
      platform: 'android',
      version: '1.0.0',
      status: 'development',
      downloads: 0,
      rating: 0,
      reviews: 0,
      features: ['تتبع الشحنات', 'إدارة الفواتير', 'الإشعارات الفورية', 'الدفع المحلي'],
      lastUpdate: '2026-02-18',
    },
  ]);

  const [features] = useState<Feature[]>([
    {
      id: '1',
      name: 'تتبع الشحنات الفعلي',
      description: 'تتبع موقع الشحنات على الخريطة بالوقت الفعلي',
      category: 'الشحن',
      priority: 'high',
      status: 'in-progress',
      estimatedTime: '2 أسابيع',
    },
    {
      id: '2',
      name: 'إدارة الفواتير والمدفوعات',
      description: 'عرض وإدارة الفواتير والدفع عبر التطبيق',
      category: 'المالية',
      priority: 'high',
      status: 'in-progress',
      estimatedTime: '3 أسابيع',
    },
    {
      id: '3',
      name: 'الإشعارات الفورية المتقدمة',
      description: 'إشعارات ذكية مع تنبيهات مخصصة',
      category: 'الإشعارات',
      priority: 'medium',
      status: 'planned',
      estimatedTime: '2 أسابيع',
    },
    {
      id: '4',
      name: 'الدردشة الحية مع الدعم',
      description: 'دردشة فورية مع فريق الدعم الفني',
      category: 'الدعم',
      priority: 'medium',
      status: 'planned',
      estimatedTime: '4 أسابيع',
    },
    {
      id: '5',
      name: 'التقارير والإحصائيات',
      description: 'عرض التقارير والإحصائيات على التطبيق',
      category: 'التحليلات',
      priority: 'low',
      status: 'planned',
      estimatedTime: '3 أسابيع',
    },
  ]);

  const [devices] = useState<DeviceSupport[]>([
    { device: 'iPhone 14 Pro', osVersion: 'iOS 17+', supported: true, coverage: 95 },
    { device: 'iPhone 13', osVersion: 'iOS 16+', supported: true, coverage: 92 },
    { device: 'iPhone 12', osVersion: 'iOS 15+', supported: true, coverage: 88 },
    { device: 'Samsung Galaxy S23', osVersion: 'Android 13+', supported: true, coverage: 94 },
    { device: 'Samsung Galaxy S22', osVersion: 'Android 12+', supported: true, coverage: 90 },
    { device: 'Google Pixel 7', osVersion: 'Android 13+', supported: true, coverage: 92 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'development':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'beta':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return '';
    }
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'مكتمل',
      'in-progress': 'قيد التطوير',
      planned: 'مخطط',
      development: 'قيد التطوير',
      testing: 'الاختبار',
      published: 'منشور',
      beta: 'نسخة تجريبية',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-10 h-10 text-purple-600" />
              تطوير تطبيق الهاتف المحمول الأصلي
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تطبيقات iOS و Android متوافقة مع النظام الحالي
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            ميزة جديدة
          </Button>
        </div>

        {/* التطبيقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.map(app => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {app.platform === 'ios' ? (
                        <Apple className="w-5 h-5 text-gray-900 dark:text-white" />
                      ) : (
                        <Smartphone className="w-5 h-5 text-green-600" />
                      )}
                      {app.name}
                    </CardTitle>
                    <CardDescription>الإصدار {app.version}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(app.status)}>
                    {getStatusLabel(app.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">التحميلات</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{app.downloads}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">التقييم</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{app.rating}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">التقييمات</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{app.reviews}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الميزات المضمنة:</p>
                  <div className="flex gap-2 flex-wrap">
                    {app.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1">
                    <Download className="w-4 h-4" />
                    تحميل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400">
                  آخر تحديث: {app.lastUpdate}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* الميزات المخطط لها */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              الميزات المخطط لها والقيد التطوير
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map(feature => (
              <div key={feature.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(feature.status)}>
                    {getStatusLabel(feature.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline">{feature.category}</Badge>
                  <Badge className={getPriorityColor(feature.priority)}>
                    {feature.priority === 'high' ? 'أولوية عالية' : feature.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">
                    ⏱️ {feature.estimatedTime}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* دعم الأجهزة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              دعم الأجهزة والإصدارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الجهاز</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">إصدار النظام</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المدعوم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التغطية</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{device.device}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{device.osVersion}</td>
                      <td className="py-3 px-4">
                        {device.supported ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            مدعوم
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                            <AlertCircle className="w-3 h-3 ml-1" />
                            غير مدعوم
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${device.coverage}%` }}
                            />
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">{device.coverage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
          <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="text-purple-700 dark:text-purple-300">
            📱 نصيحة: تطبيقات الهاتف المحمول الأصلية توفر تجربة مستخدم أفضل وأداء أسرع مقارنة بالتطبيقات الويب. ركز على الميزات ذات الأولوية العالية أولاً.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
