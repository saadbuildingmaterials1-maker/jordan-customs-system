import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  TrendingUp,
  Lock,
  Unlock,
  DollarSign,
  Activity,
  BarChart3,
  Wifi,
  WifiOff,
  Send,
  Download,
} from 'lucide-react';

interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  mode: 'live' | 'test';
  transactions: number;
  volume: number;
  lastSync: string;
  apiKey: string;
  apiSecret: string;
}

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  gateway: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
  customer: string;
}

interface GatewayStatistics {
  gateway: string;
  successRate: number;
  totalTransactions: number;
  totalVolume: number;
  averageTime: number;
  lastError?: string;
}

export default function RealPaymentIntegration() {
  const [gateways] = useState<PaymentGateway[]>([
    {
      id: '1',
      name: 'HyperPay',
      provider: 'HyperPay Arabia',
      status: 'connected',
      mode: 'live',
      transactions: 1250,
      volume: 125000,
      lastSync: '2026-02-18 14:30',
      apiKey: 'hpk_live_***************************',
      apiSecret: 'hps_live_***************************',
    },
    {
      id: '2',
      name: 'Telr',
      provider: 'Telr Payment Gateway',
      status: 'connected',
      mode: 'live',
      transactions: 856,
      volume: 85600,
      lastSync: '2026-02-18 14:28',
      apiKey: 'telr_live_***************************',
      apiSecret: 'telr_secret_***************************',
    },
    {
      id: '3',
      name: 'Stripe',
      provider: 'Stripe Inc',
      status: 'disconnected',
      mode: 'test',
      transactions: 0,
      volume: 0,
      lastSync: 'لم يتم التوصيل',
      apiKey: 'sk_test_***************************',
      apiSecret: 'pk_test_***************************',
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      reference: 'TXN-2026-001250',
      amount: 250.50,
      currency: 'JOD',
      gateway: 'HyperPay',
      status: 'success',
      timestamp: '2026-02-18 14:35',
      customer: 'أحمد محمد',
    },
    {
      id: '2',
      reference: 'TXN-2026-000856',
      amount: 150.00,
      currency: 'JOD',
      gateway: 'Telr',
      status: 'success',
      timestamp: '2026-02-18 14:30',
      customer: 'فاطمة علي',
    },
    {
      id: '3',
      reference: 'TXN-2026-001251',
      amount: 500.00,
      currency: 'JOD',
      gateway: 'HyperPay',
      status: 'pending',
      timestamp: '2026-02-18 14:25',
      customer: 'محمد سالم',
    },
    {
      id: '4',
      reference: 'TXN-2026-000857',
      amount: 75.25,
      currency: 'JOD',
      gateway: 'Telr',
      status: 'failed',
      timestamp: '2026-02-18 14:20',
      customer: 'سارة إبراهيم',
    },
  ]);

  const [statistics] = useState<GatewayStatistics[]>([
    {
      gateway: 'HyperPay',
      successRate: 98.5,
      totalTransactions: 1250,
      totalVolume: 125000,
      averageTime: 2.3,
    },
    {
      gateway: 'Telr',
      successRate: 97.2,
      totalTransactions: 856,
      totalVolume: 85600,
      averageTime: 1.8,
    },
    {
      gateway: 'Stripe',
      successRate: 0,
      totalTransactions: 0,
      totalVolume: 0,
      averageTime: 0,
      lastError: 'لم يتم التوصيل',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'disconnected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'error':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Activity className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      connected: 'متصل',
      disconnected: 'غير متصل',
      error: 'خطأ',
      success: 'نجح',
      pending: 'قيد الانتظار',
      failed: 'فشل',
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
              <CreditCard className="w-10 h-10 text-green-600" />
              تكامل نظام الدفع الحقيقي
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة بوابات الدفع والمعاملات الفعلية
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            بوابة جديدة
          </Button>
        </div>

        {/* بوابات الدفع */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              بوابات الدفع المتكاملة
            </CardTitle>
            <CardDescription>
              إدارة اتصالات بوابات الدفع الحقيقية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gateways.map(gateway => (
              <div key={gateway.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {gateway.name}
                      </h3>
                      <Badge className={getStatusColor(gateway.status)}>
                        {getStatusIcon(gateway.status)}
                        <span className="ml-1">{getStatusLabel(gateway.status)}</span>
                      </Badge>
                      <Badge variant="outline">
                        {gateway.mode === 'live' ? '🔴 حقيقي' : '🟡 اختبار'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      المزود: {gateway.provider}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">المعاملات</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{gateway.transactions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الحجم</p>
                    <p className="font-semibold text-green-600">{gateway.volume.toLocaleString()} JOD</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">آخر مزامنة</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{gateway.lastSync}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">حالة الاتصال</p>
                    <p className="font-semibold">
                      {gateway.status === 'connected' ? (
                        <span className="text-green-600">✅ متصل</span>
                      ) : (
                        <span className="text-red-600">❌ غير متصل</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">مفتاح API:</p>
                  <p className="text-gray-900 dark:text-white break-all">{gateway.apiKey}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="gap-1">
                    <RefreshCw className="w-4 h-4" />
                    مزامنة الآن
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    اختبار
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* إحصائيات البوابات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              إحصائيات الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">البوابة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">معدل النجاح</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المعاملات</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحجم الإجمالي</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">متوسط الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.map((stat, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">{stat.gateway}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${stat.successRate}%` }}
                            />
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">{stat.successRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{stat.totalTransactions}</td>
                      <td className="py-3 px-4 text-green-600">{stat.totalVolume.toLocaleString()} JOD</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{stat.averageTime}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* المعاملات الأخيرة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              المعاملات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المرجع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المبلغ</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">البوابة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الوقت</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">العميل</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-xs">{transaction.reference}</td>
                      <td className="py-3 px-4 text-green-600 font-semibold">{transaction.amount.toFixed(2)} {transaction.currency}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{transaction.gateway}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(transaction.status)}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{getStatusLabel(transaction.status)}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{transaction.timestamp}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{transaction.customer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            🔒 أمان: تأكد من حماية مفاتيح API الخاصة بك. استخدم بيئة الاختبار أولاً قبل الانتقال إلى الوضع الحقيقي. راقب المعاملات بانتظام للكشف عن أي نشاط غير عادي.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
