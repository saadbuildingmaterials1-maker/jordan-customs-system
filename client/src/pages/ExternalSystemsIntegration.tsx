import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Trash2,
  Eye,
  Plus,
  Filter,
  Search,
  Activity,
  Database,
  Cloud,
  Link,
  RefreshCw,
  Edit,
  Send,
  TrendingUp,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  syncFrequency: string;
  dataFlow: 'incoming' | 'outgoing' | 'bidirectional';
  recordsSync: number;
}

interface SyncLog {
  id: string;
  integration: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  recordsSynced: number;
  duration: string;
  message: string;
}

export default function ExternalSystemsIntegration() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'نظام الشحن SMSA',
      type: 'Shipping',
      status: 'connected',
      lastSync: '2026-02-18 14:30',
      syncFrequency: 'كل ساعة',
      dataFlow: 'bidirectional',
      recordsSync: 156,
    },
    {
      id: '2',
      name: 'نظام الجمارك الأردني',
      type: 'Customs',
      status: 'connected',
      lastSync: '2026-02-18 14:15',
      syncFrequency: 'كل 30 دقيقة',
      dataFlow: 'incoming',
      recordsSync: 89,
    },
    {
      id: '3',
      name: 'نظام البنك الأهلي',
      type: 'Banking',
      status: 'connected',
      lastSync: '2026-02-18 14:00',
      syncFrequency: 'كل 15 دقيقة',
      dataFlow: 'incoming',
      recordsSync: 234,
    },
    {
      id: '4',
      name: 'نظام إدارة المخزون',
      type: 'Inventory',
      status: 'error',
      lastSync: '2026-02-18 13:00',
      syncFrequency: 'كل ساعة',
      dataFlow: 'bidirectional',
      recordsSync: 0,
    },
    {
      id: '5',
      name: 'نظام CRM العملاء',
      type: 'CRM',
      status: 'disconnected',
      lastSync: 'لم يتم المزامنة',
      syncFrequency: 'يومي',
      dataFlow: 'outgoing',
      recordsSync: 0,
    },
  ]);

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: '1',
      integration: 'نظام الشحن SMSA',
      timestamp: '2026-02-18 14:30',
      status: 'success',
      recordsSynced: 156,
      duration: '2.5 دقيقة',
      message: 'تمت المزامنة بنجاح',
    },
    {
      id: '2',
      integration: 'نظام الجمارك الأردني',
      timestamp: '2026-02-18 14:15',
      status: 'success',
      recordsSynced: 89,
      duration: '1.8 دقيقة',
      message: 'تمت المزامنة بنجاح',
    },
    {
      id: '3',
      integration: 'نظام البنك الأهلي',
      timestamp: '2026-02-18 14:00',
      status: 'partial',
      recordsSynced: 234,
      duration: '3.2 دقيقة',
      message: '234 سجل تمت مزامنتها، 5 سجلات فشلت',
    },
    {
      id: '4',
      integration: 'نظام إدارة المخزون',
      timestamp: '2026-02-18 13:00',
      status: 'failed',
      recordsSynced: 0,
      duration: '0.5 دقيقة',
      message: 'خطأ في الاتصال: انتهاء المهلة الزمنية',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'متصل';
      case 'disconnected':
        return 'غير متصل';
      case 'error':
        return 'خطأ';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected':
        return <Clock className="w-5 h-5 text-gray-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return '';
    }
  };

  const getSyncStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return 'نجح';
      case 'failed':
        return 'فشل';
      case 'partial':
        return 'جزئي';
      default:
        return '';
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;
  const totalRecords = integrations.reduce((sum, i) => sum + i.recordsSync, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              التكامل مع الأنظمة الخارجية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة التكاملات مع الخدمات الخارجية والأنظمة الأخرى
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            تكامل جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Link className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي التكاملات</p>
                <p className="text-3xl font-bold text-blue-600">{integrations.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">متصلة</p>
                <p className="text-3xl font-bold text-green-600">{connectedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-gray-600 text-sm">أخطاء</p>
                <p className="text-3xl font-bold text-red-600">{errorCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Database className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي السجلات</p>
                <p className="text-3xl font-bold text-purple-600">{totalRecords}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة التكاملات */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                التكاملات المتاحة
              </CardTitle>
              <input
                type="text"
                placeholder="ابحث عن تكامل..."
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrations.map(integration => (
              <div
                key={integration.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(integration.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {integration.name}
                        </h3>
                        <Badge className={getStatusColor(integration.status)}>
                          {getStatusLabel(integration.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        النوع: {integration.type}
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <div>
                          <p className="text-gray-500 dark:text-gray-500">آخر مزامنة</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{integration.lastSync}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-500">تكرار المزامنة</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{integration.syncFrequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-500">السجلات المزامنة</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{integration.recordsSync}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <RefreshCw className="w-4 h-4" />
                    مزامنة الآن
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Settings className="w-4 h-4" />
                    إعدادات
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    عرض السجلات
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* سجل المزامنة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              سجل المزامنة الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التكامل</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الوقت</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">السجلات</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المدة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الرسالة</th>
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.map(log => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{log.integration}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{log.timestamp}</td>
                      <td className="py-3 px-4">
                        <Badge className={getSyncStatusColor(log.status)}>
                          {getSyncStatusLabel(log.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{log.recordsSynced}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{log.duration}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white text-sm">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: تأكد من أن جميع التكاملات متصلة بشكل صحيح. إذا حدث خطأ في المزامنة، تحقق من إعدادات الاتصال ومفاتيح API.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
