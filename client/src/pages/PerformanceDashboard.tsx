import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Zap,
  HardDrive,
  Network,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'استخدام المعالج',
      value: 35,
      unit: '%',
      status: 'good',
      trend: 'stable',
      icon: <Zap className="w-6 h-6" />,
    },
    {
      name: 'استخدام الذاكرة',
      value: 62,
      unit: '%',
      status: 'warning',
      trend: 'up',
      icon: <HardDrive className="w-6 h-6" />,
    },
    {
      name: 'سرعة الاستجابة',
      value: 145,
      unit: 'ms',
      status: 'good',
      trend: 'down',
      icon: <Network className="w-6 h-6" />,
    },
    {
      name: 'معدل الأخطاء',
      value: 0.8,
      unit: '%',
      status: 'good',
      trend: 'down',
      icon: <AlertCircle className="w-6 h-6" />,
    },
  ]);

  const [activeProcesses, setActiveProcesses] = useState([
    { id: 1, name: 'معالجة الفواتير', progress: 85, status: 'running' },
    { id: 2, name: 'مزامنة قاعدة البيانات', progress: 100, status: 'completed' },
    { id: 3, name: 'تصدير التقارير', progress: 45, status: 'running' },
    { id: 4, name: 'نسخ احتياطي', progress: 0, status: 'pending' },
  ]);

  const [systemHealth, setSystemHealth] = useState('good');
  const [uptime, setUptime] = useState('45 يوم 12 ساعة');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('ar-JO'));

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString('ar-JO'));
      
      // تحديث المقاييس بشكل عشوائي
      setMetrics(prev => prev.map(metric => {
        const newValue = metric.value + (Math.random() - 0.5) * 10;
        const clampedValue = Math.max(0, Math.min(100, newValue));
        
        let status: 'good' | 'warning' | 'critical' = 'good';
        if (clampedValue > 80) status = 'critical';
        else if (clampedValue > 60) status = 'warning';
        
        return {
          ...metric,
          value: clampedValue,
          status,
          trend: Math.random() > 0.5 ? 'up' : 'down',
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              لوحة تحكم الأداء الفعلية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              مراقبة أداء النظام والموارد في الوقت الفعلي
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              آخر تحديث: {lastUpdate}
            </p>
            <button className="mt-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* حالة النظام */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={getStatusBg(systemHealth)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">حالة النظام</p>
                  <p className={`text-2xl font-bold mt-2 ${getStatusColor(systemHealth)}`}>
                    {systemHealth === 'good' ? 'ممتازة' :
                     systemHealth === 'warning' ? 'تحذير' :
                     'حرجة'}
                  </p>
                </div>
                {getStatusIcon(systemHealth)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">وقت التشغيل</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {uptime}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">المعاملات اليومية</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  1,250
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* المقاييس الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index} className={getStatusBg(metric.status)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={getStatusColor(metric.status)}>
                    {metric.icon}
                  </div>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-red-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {metric.name}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {metric.value.toFixed(1)}{metric.unit}
                </p>
                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full ${
                      metric.status === 'good' ? 'bg-green-600' :
                      metric.status === 'warning' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(100, metric.value)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمليات النشطة */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  العمليات النشطة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeProcesses.map(process => (
                  <div key={process.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {process.name}
                      </p>
                      <Badge
                        variant={
                          process.status === 'completed' ? 'default' :
                          process.status === 'running' ? 'outline' :
                          'secondary'
                        }
                      >
                        {process.status === 'completed' ? 'مكتمل' :
                         process.status === 'running' ? 'جاري' :
                         'قيد الانتظار'}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${process.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {process.progress}% مكتمل
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* التنبيهات الأخيرة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                التنبيهات الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: 'warning', message: 'استخدام الذاكرة مرتفع' },
                { type: 'info', message: 'تم إكمال النسخة الاحتياطية' },
                { type: 'good', message: 'معدل الأخطاء منخفض' },
              ].map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${getStatusBg(alert.type)}`}
                >
                  <div className="flex items-start gap-2">
                    {getStatusIcon(alert.type)}
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: راقب مقاييس الأداء بانتظام. إذا وصلت أي مقياس إلى حالة حرجة، تأكد من اتخاذ الإجراءات اللازمة فوراً.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
