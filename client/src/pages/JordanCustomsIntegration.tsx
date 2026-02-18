import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  Link2,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Database,
  Shield,
  TrendingUp,
  Activity,
  FileText,
  Lock,
} from 'lucide-react';

interface CustomsPermit {
  id: string;
  number: string;
  status: 'approved' | 'pending' | 'rejected' | 'processing';
  shipper: string;
  goods: string;
  value: string;
  taxes: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'failed' | 'pending';
  details: string;
  recordsAffected: number;
}

interface IntegrationStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  nextSync: string;
  recordsSync: number;
  errorCount: number;
}

export default function JordanCustomsIntegration() {
  const [permits] = useState<CustomsPermit[]>([
    {
      id: '1',
      number: 'PERMIT-2026-0001',
      status: 'approved',
      shipper: 'شركة الشرق الأوسط للشحن',
      goods: 'معدات إلكترونية',
      value: '50,000 JOD',
      taxes: '7,500 JOD',
      createdAt: '2026-02-18 10:00',
      updatedAt: '2026-02-18 14:30',
    },
    {
      id: '2',
      number: 'PERMIT-2026-0002',
      status: 'processing',
      shipper: 'شركة النقل الدولية',
      goods: 'قطع غيار سيارات',
      value: '35,000 JOD',
      taxes: '5,250 JOD',
      createdAt: '2026-02-18 11:00',
      updatedAt: '2026-02-18 13:00',
    },
    {
      id: '3',
      number: 'PERMIT-2026-0003',
      status: 'pending',
      shipper: 'شركة الخليج للتجارة',
      goods: 'منتجات غذائية',
      value: '25,000 JOD',
      taxes: '3,750 JOD',
      createdAt: '2026-02-18 09:00',
      updatedAt: '2026-02-18 09:00',
    },
  ]);

  const [syncLogs] = useState<SyncLog[]>([
    {
      id: '1',
      timestamp: '2026-02-18 15:00',
      action: 'مزامنة التصاريح الجمركية',
      status: 'success',
      details: 'تم مزامنة 15 تصريح جديد بنجاح',
      recordsAffected: 15,
    },
    {
      id: '2',
      timestamp: '2026-02-18 14:00',
      action: 'تحديث حالات الموافقات',
      status: 'success',
      details: 'تم تحديث حالة 8 تصاريح',
      recordsAffected: 8,
    },
    {
      id: '3',
      timestamp: '2026-02-18 13:00',
      action: 'تحميل بيانات الضرائب',
      status: 'failed',
      details: 'فشل الاتصال بخادم الضرائب',
      recordsAffected: 0,
    },
  ]);

  const [integrationStatus] = useState<IntegrationStatus[]>([
    {
      name: 'نظام الجمارك الأردني',
      status: 'connected',
      lastSync: '2026-02-18 15:00',
      nextSync: '2026-02-18 16:00',
      recordsSync: 125,
      errorCount: 0,
    },
    {
      name: 'نظام الضرائب والرسوم',
      status: 'connected',
      lastSync: '2026-02-18 14:30',
      nextSync: '2026-02-18 15:30',
      recordsSync: 89,
      errorCount: 0,
    },
    {
      name: 'نظام الموافقات الإلكترونية',
      status: 'error',
      lastSync: '2026-02-18 13:00',
      nextSync: '2026-02-18 14:00',
      recordsSync: 0,
      errorCount: 2,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'success':
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'rejected':
      case 'failed':
      case 'error':
      case 'disconnected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      approved: '✓ موافق عليه',
      pending: '⏳ قيد الانتظار',
      processing: '⚙ قيد المعالجة',
      rejected: '✕ مرفوض',
      success: '✓ نجح',
      failed: '✕ فشل',
      connected: '✓ متصل',
      disconnected: '✕ غير متصل',
      error: '⚠ خطأ',
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
              <Globe className="w-10 h-10 text-blue-600" />
              نظام التكامل مع الجمارك الأردنية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تكامل فوري مع نظام الجمارك الأردني الرسمي
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2">
              <RefreshCw className="w-4 h-4" />
              مزامنة الآن
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </Button>
          </div>
        </div>

        {/* حالة التكامل */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              حالة التكامل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {integrationStatus.map((status, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{status.name}</h3>
                    <Badge className={getStatusColor(status.status)}>
                      {getStatusLabel(status.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">آخر مزامنة:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{status.lastSync}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">التالية:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{status.nextSync}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">السجلات المزامنة:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{status.recordsSync}</span>
                    </div>
                    {status.errorCount > 0 && (
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>الأخطاء:</span>
                        <span className="font-semibold">{status.errorCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* التصاريح الجمركية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              التصاريح الجمركية المتزامنة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">رقم التصريح</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المُرسل</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">البضائع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">القيمة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الضرائب</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">آخر تحديث</th>
                  </tr>
                </thead>
                <tbody>
                  {permits.map(permit => (
                    <tr key={permit.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{permit.number}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(permit.status)}>
                          {getStatusLabel(permit.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{permit.shipper}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{permit.goods}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{permit.value}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{permit.taxes}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{permit.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* سجل المزامنة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              سجل المزامنة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {syncLogs.map(log => (
              <div key={log.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{log.action}</h3>
                      <Badge className={getStatusColor(log.status)}>
                        {getStatusLabel(log.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{log.timestamp}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {log.recordsAffected} سجل
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            🌍 نصيحة: تأكد من اتصال الإنترنت المستقر. المزامنة تتم تلقائياً كل ساعة. يمكنك تشغيل المزامنة اليدوية في أي وقت. راقب سجل المزامنة للتأكد من عدم وجود أخطاء.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
