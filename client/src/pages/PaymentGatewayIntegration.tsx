import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Settings,
  CheckCircle,
  AlertCircle,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  TestTube,
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react';

interface Gateway {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  apiKey: string;
  apiSecret: string;
  mode: 'test' | 'live';
  transactions: number;
  volume: number;
  lastSync: string;
  supportedCurrencies: string[];
}

interface Transaction {
  id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
  reference: string;
}

export default function PaymentGatewayIntegration() {
  const [gateways, setGateways] = useState<Gateway[]>([
    {
      id: '1',
      name: 'HyperPay',
      status: 'connected',
      apiKey: 'pk_live_1234567890abcdef',
      apiSecret: 'sk_live_abcdef1234567890',
      mode: 'live',
      transactions: 1245,
      volume: 125400,
      lastSync: '2026-02-18T08:30:00',
      supportedCurrencies: ['JOD', 'USD', 'EUR', 'AED'],
    },
    {
      id: '2',
      name: 'Telr',
      status: 'connected',
      apiKey: 'telr_live_xyz789',
      apiSecret: 'telr_secret_xyz789',
      mode: 'live',
      transactions: 856,
      volume: 85600,
      lastSync: '2026-02-18T08:25:00',
      supportedCurrencies: ['JOD', 'USD', 'AED'],
    },
    {
      id: '3',
      name: 'Stripe',
      status: 'disconnected',
      apiKey: '',
      apiSecret: '',
      mode: 'test',
      transactions: 0,
      volume: 0,
      lastSync: '',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      gateway: 'HyperPay',
      amount: 500,
      currency: 'JOD',
      status: 'success',
      timestamp: '2026-02-18T08:15:00',
      reference: 'INV-2026-001',
    },
    {
      id: 'TXN002',
      gateway: 'Telr',
      amount: 320,
      currency: 'JOD',
      status: 'success',
      timestamp: '2026-02-18T08:10:00',
      reference: 'INV-2026-002',
    },
    {
      id: 'TXN003',
      gateway: 'HyperPay',
      amount: 750,
      currency: 'USD',
      status: 'pending',
      timestamp: '2026-02-18T08:05:00',
      reference: 'INV-2026-003',
    },
    {
      id: 'TXN004',
      gateway: 'Telr',
      amount: 210,
      currency: 'JOD',
      status: 'failed',
      timestamp: '2026-02-18T07:50:00',
      reference: 'INV-2026-004',
    },
  ]);

  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
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

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const totalVolume = gateways.reduce((sum, g) => sum + g.volume, 0);
  const totalTransactions = gateways.reduce((sum, g) => sum + g.transactions, 0);
  const connectedGateways = gateways.filter(g => g.status === 'connected').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              التكامل مع بوابات الدفع
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة وتكوين بوابات الدفع الحقيقية
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة بوابة جديدة
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">بوابات متصلة</p>
                <p className="text-3xl font-bold text-green-600">{connectedGateways}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الحجم</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${totalVolume.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي المعاملات</p>
                <p className="text-3xl font-bold text-purple-600">{totalTransactions}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">معدل النجاح</p>
                <p className="text-3xl font-bold text-yellow-600">98.5%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة البوابات */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  بوابات الدفع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gateways.map(gateway => (
                  <div
                    key={gateway.id}
                    onClick={() => setSelectedGateway(gateway)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(gateway.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {gateway.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {gateway.supportedCurrencies.join(', ')}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getStatusColor(gateway.status)}>
                              {getStatusLabel(gateway.status)}
                            </Badge>
                            <Badge variant="outline">
                              {gateway.mode === 'live' ? '🔴 حقيقي' : '🟡 اختبار'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ${gateway.volume.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {gateway.transactions} معاملة
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل البوابة */}
          <div>
            {selectedGateway ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(selectedGateway.status)}
                    {selectedGateway.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الوضع</p>
                    <Badge variant={selectedGateway.mode === 'live' ? 'default' : 'outline'}>
                      {selectedGateway.mode === 'live' ? '🔴 حقيقي' : '🟡 اختبار'}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      مفتاح API
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type={showSecrets[`key-${selectedGateway.id}`] ? 'text' : 'password'}
                        value={selectedGateway.apiKey}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSecrets({
                          ...showSecrets,
                          [`key-${selectedGateway.id}`]: !showSecrets[`key-${selectedGateway.id}`]
                        })}
                      >
                        {showSecrets[`key-${selectedGateway.id}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      مفتاح سري
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type={showSecrets[`secret-${selectedGateway.id}`] ? 'text' : 'password'}
                        value={selectedGateway.apiSecret}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSecrets({
                          ...showSecrets,
                          [`secret-${selectedGateway.id}`]: !showSecrets[`secret-${selectedGateway.id}`]
                        })}
                      >
                        {showSecrets[`secret-${selectedGateway.id}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">آخر مزامنة</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedGateway.lastSync}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <Button className="w-full gap-2">
                      <TestTube className="w-4 h-4" />
                      اختبار الاتصال
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <RefreshCw className="w-4 h-4" />
                      مزامنة الآن
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر بوابة لعرض التفاصيل
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* المعاملات الأخيرة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              المعاملات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map(txn => (
                <div
                  key={txn.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {txn.reference}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {txn.gateway} • {txn.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {txn.amount} {txn.currency}
                    </p>
                    <Badge className={getTransactionStatusColor(txn.status)}>
                      {txn.status === 'success' ? 'نجح' :
                       txn.status === 'pending' ? 'قيد الانتظار' :
                       'فشل'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: تأكد من استخدام مفاتيح API الحقيقية في الوضع الحقيقي فقط. استخدم مفاتيح الاختبار للتطوير والاختبار. راقب معدلات النجاح والفشل بانتظام.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

import { Plus } from 'lucide-react';
