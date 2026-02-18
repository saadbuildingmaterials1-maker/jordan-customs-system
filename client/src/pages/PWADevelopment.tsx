import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Zap,
  Shield,
} from 'lucide-react';

interface PWAFeature {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'in-progress' | 'planned';
  priority: 'high' | 'medium' | 'low';
}

interface SyncStatus {
  id: string;
  feature: string;
  lastSync: string;
  status: 'synced' | 'syncing' | 'pending' | 'failed';
  itemsCount: number;
}

export default function PWADevelopment() {
  const [features, setFeatures] = useState<PWAFeature[]>([
    {
      id: '1',
      name: 'العمل بدون اتصال',
      description: 'تطبيق يعمل بدون اتصال بالإنترنت مع مزامنة تلقائية',
      status: 'implemented',
      priority: 'high',
    },
    {
      id: '2',
      name: 'التثبيت على الشاشة الرئيسية',
      description: 'إمكانية تثبيت التطبيق على الشاشة الرئيسية للهاتف',
      status: 'implemented',
      priority: 'high',
    },
    {
      id: '3',
      name: 'الإشعارات الفورية',
      description: 'إرسال إشعارات فورية حتى عند إغلاق التطبيق',
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: '4',
      name: 'مشاركة البيانات',
      description: 'مشاركة البيانات والملفات مع التطبيقات الأخرى',
      status: 'in-progress',
      priority: 'medium',
    },
    {
      id: '5',
      name: 'الكاميرا والميكروفون',
      description: 'الوصول إلى الكاميرا والميكروفون للتسجيل والتصوير',
      status: 'planned',
      priority: 'medium',
    },
    {
      id: '6',
      name: 'الموقع الجغرافي',
      description: 'الوصول إلى الموقع الجغرافي للتطبيق',
      status: 'planned',
      priority: 'low',
    },
  ]);

  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([
    {
      id: '1',
      feature: 'المعاملات',
      lastSync: '2026-02-18 14:30:00',
      status: 'synced',
      itemsCount: 245,
    },
    {
      id: '2',
      feature: 'الفواتير',
      lastSync: '2026-02-18 14:28:00',
      status: 'synced',
      itemsCount: 89,
    },
    {
      id: '3',
      feature: 'الشحنات',
      lastSync: '2026-02-18 14:32:00',
      status: 'syncing',
      itemsCount: 156,
    },
    {
      id: '4',
      feature: 'العملاء',
      lastSync: '2026-02-18 14:25:00',
      status: 'synced',
      itemsCount: 342,
    },
  ]);

  const implementedCount = features.filter(f => f.status === 'implemented').length;
  const inProgressCount = features.filter(f => f.status === 'in-progress').length;
  const plannedCount = features.filter(f => f.status === 'planned').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'planned':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'مُنفذ';
      case 'in-progress':
        return 'قيد التطوير';
      case 'planned':
        return 'مخطط';
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

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تطبيق الويب التقدمي (PWA)</h1>
        <p className="text-gray-600 dark:text-gray-400">تطبيق ويب تقدمي يعمل بدون اتصال بالإنترنت</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">الميزات المُنفذة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{implementedCount}</p>
                <p className="text-xs text-gray-500">من {features.length} ميزات</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">قيد التطوير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-xs text-gray-500">من {features.length} ميزات</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">مخطط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{plannedCount}</p>
                <p className="text-xs text-gray-500">من {features.length} ميزات</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الميزات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            ميزات تطبيق الويب التقدمي
          </CardTitle>
          <CardDescription>إدارة ميزات PWA والتطوير المستمر</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(feature.status)}
                      <h3 className="font-semibold">{feature.name}</h3>
                      <Badge className={getPriorityColor(feature.priority)}>
                        {feature.priority === 'high' ? 'عالية' : feature.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            feature.status === 'implemented'
                              ? 'bg-green-500 w-full'
                              : feature.status === 'in-progress'
                              ? 'bg-blue-500 w-2/3'
                              : 'bg-gray-400 w-1/3'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{getStatusLabel(feature.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* حالة المزامنة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            حالة المزامنة الفورية
          </CardTitle>
          <CardDescription>تتبع مزامنة البيانات بين الجهاز والخادم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {syncStatuses.map((sync) => (
              <div key={sync.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSyncStatusIcon(sync.status)}
                    <h3 className="font-semibold">{sync.feature}</h3>
                  </div>
                  <Badge variant="outline">
                    {sync.status === 'synced'
                      ? 'متزامن'
                      : sync.status === 'syncing'
                      ? 'جاري المزامنة'
                      : sync.status === 'pending'
                      ? 'قيد الانتظار'
                      : 'فشل'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <p className="text-xs text-gray-500">عدد العناصر</p>
                    <p className="font-semibold">{sync.itemsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">آخر مزامنة</p>
                    <p>{sync.lastSync}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الإعدادات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            إعدادات تطبيق الويب التقدمي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-semibold">تفعيل الإشعارات الفورية</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">استقبال إشعارات حتى عند إغلاق التطبيق</p>
            </div>
            <Button size="sm" variant="outline">تفعيل</Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-semibold">مزامنة البيانات التلقائية</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">مزامنة تلقائية للبيانات عند الاتصال</p>
            </div>
            <Button size="sm" variant="outline">مفعل</Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-semibold">التخزين المؤقت</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">تخزين البيانات محلياً للعمل بدون اتصال</p>
            </div>
            <Button size="sm" variant="outline">إدارة</Button>
          </div>
        </CardContent>
      </Card>

      {/* التنبيهات */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          تطبيق الويب التقدمي جاهز للاستخدام. يمكنك تثبيته على الشاشة الرئيسية والعمل بدون اتصال بالإنترنت.
        </AlertDescription>
      </Alert>
    </div>
  );
}
