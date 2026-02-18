import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Eye,
  Settings,
  Download,
  Share2,
  RefreshCw,
  Crown,
} from 'lucide-react';

interface KPI {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target: string;
  icon: React.ReactNode;
  color: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  action?: string;
}

interface StrategicMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  progress: number;
  status: 'on-track' | 'at-risk' | 'off-track';
}

export default function CEODashboard() {
  const [kpis] = useState<KPI[]>([
    {
      id: '1',
      title: 'الإيرادات الشهرية',
      value: '250,000 JOD',
      change: 15.3,
      trend: 'up',
      target: '300,000 JOD',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      id: '2',
      title: 'عدد المعاملات',
      value: '1,250',
      change: 8.5,
      trend: 'up',
      target: '1,500',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      id: '3',
      title: 'رضا العملاء',
      value: '94.5%',
      change: 2.1,
      trend: 'up',
      target: '95%',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      id: '4',
      title: 'معدل الكفاءة',
      value: '92.3%',
      change: -1.2,
      trend: 'down',
      target: '95%',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ]);

  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'تأخر في الموافقات الجمركية',
      description: 'معدل الموافقات انخفض بنسبة 12% هذا الأسبوع',
      severity: 'critical',
      timestamp: '2026-02-18 14:30',
      action: 'مراجعة فورية',
    },
    {
      id: '2',
      title: 'تجاوز ميزانية الشحن',
      description: 'تم تجاوز ميزانية الشحن الشهرية بمقدار 15,000 JOD',
      severity: 'warning',
      timestamp: '2026-02-18 12:00',
      action: 'تحسين التكاليف',
    },
    {
      id: '3',
      title: 'أداء فريق المبيعات',
      description: 'فريق المبيعات حقق 105% من الهدف الشهري',
      severity: 'info',
      timestamp: '2026-02-18 10:00',
      action: 'تهنئة وتحفيز',
    },
  ]);

  const [strategicMetrics] = useState<StrategicMetric[]>([
    {
      id: '1',
      name: 'زيادة حصة السوق',
      current: 28,
      target: 35,
      progress: 80,
      status: 'on-track',
    },
    {
      id: '2',
      name: 'تحسين الربحية',
      current: 18,
      target: 22,
      progress: 82,
      status: 'on-track',
    },
    {
      id: '3',
      name: 'توسع الخدمات',
      current: 12,
      target: 15,
      progress: 80,
      status: 'on-track',
    },
    {
      id: '4',
      name: 'تطوير الموارد البشرية',
      current: 45,
      target: 60,
      progress: 75,
      status: 'at-risk',
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'off-track':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
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
              <Crown className="w-10 h-10 text-yellow-600" />
              لوحة تحكم المدير العام
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              مؤشرات الأداء الرئيسية والتنبيهات الحرجة
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </div>
        </div>

        {/* مؤشرات الأداء الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kpis.map(kpi => (
            <Card key={kpi.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {kpi.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${kpi.color}`}>
                    {kpi.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">الهدف: {kpi.target}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التنبيهات الحرجة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              التنبيهات الحرجة والعاجلة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity === 'critical' ? 'حرج' : alert.severity === 'warning' ? 'تحذير' : 'معلومة'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{alert.timestamp}</span>
                  {alert.action && (
                    <Button size="sm" className="gap-1">
                      <Zap className="w-3 h-3" />
                      {alert.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* المقاييس الاستراتيجية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              المقاييس الاستراتيجية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategicMetrics.map(metric => (
                <div key={metric.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{metric.name}</h3>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status === 'on-track' ? '✓ على المسار' : metric.status === 'at-risk' ? '⚠ مخاطر' : '✕ منحرف'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      {metric.current} / {metric.target}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {metric.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${metric.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            👑 نصيحة: راقب مؤشرات الأداء الرئيسية بانتظام. تابع التنبيهات الحرجة فوراً. استخدم المقاييس الاستراتيجية لتتبع أهداف الشركة طويلة الأجل.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
