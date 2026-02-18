import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Zap,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Link,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  service: string;
  status: 'connected' | 'disconnected' | 'error';
  apiKey: string;
  apiSecret: string;
  lastSync: string;
  syncFrequency: string;
  enabled: boolean;
  dataTypes: string[];
}

export default function ExternalIntegration() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'خدمة الدفع - HyperPay',
      service: 'HyperPay',
      status: 'connected',
      apiKey: 'pk_live_1234567890abcdef',
      apiSecret: '••••••••••••••••••••••••••••••••',
      lastSync: '2026-02-18 14:30:00',
      syncFrequency: 'فوري',
      enabled: true,
      dataTypes: ['المدفوعات', 'الفواتير'],
    },
    {
      id: '2',
      name: 'خدمة الشحن - DHL',
      service: 'DHL',
      status: 'connected',
      apiKey: 'dhl_api_key_12345',
      apiSecret: '••••••••••••••••••••••••••••••••',
      lastSync: '2026-02-18 14:15:00',
      syncFrequency: 'كل ساعة',
      enabled: true,
      dataTypes: ['الشحنات', 'التتبع'],
    },
    {
      id: '3',
      name: 'خدمة البريد الإلكتروني - SendGrid',
      service: 'SendGrid',
      status: 'connected',
      apiKey: 'SG.1234567890abcdef',
      apiSecret: '••••••••••••••••••••••••••••••••',
      lastSync: '2026-02-18 14:00:00',
      syncFrequency: 'فوري',
      enabled: true,
      dataTypes: ['الإشعارات', 'الفواتير'],
    },
    {
      id: '4',
      name: 'خدمة الجمارك - نظام الجمارك الأردني',
      service: 'Customs',
      status: 'error',
      apiKey: 'customs_api_key_12345',
      apiSecret: '••••••••••••••••••••••••••••••••',
      lastSync: '2026-02-17 10:00:00',
      syncFrequency: 'يومياً',
      enabled: false,
      dataTypes: ['البيانات الجمركية', 'التصاريح'],
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showSecrets, setShowSecrets] = useState<string[]>([]);

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(integrations.map(i =>
      i.id === integrationId ? { ...i, enabled: !i.enabled } : i
    ));
  };

  const handleDeleteIntegration = (integrationId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التكامل؟')) {
      setIntegrations(integrations.filter(i => i.id !== integrationId));
    }
  };

  const handleTestConnection = (integrationId: string) => {
    setIntegrations(integrations.map(i =>
      i.id === integrationId ? { ...i, status: 'connected', lastSync: new Date().toLocaleString('ar-JO') } : i
    ));
  };

  const toggleSecretVisibility = (integrationId: string) => {
    if (showSecrets.includes(integrationId)) {
      setShowSecrets(showSecrets.filter(id => id !== integrationId));
    } else {
      setShowSecrets([...showSecrets, integrationId]);
    }
  };

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

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              التكامل مع الخدمات الخارجية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة التكاملات مع الخدمات والأنظمة الخارجية
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة تكامل جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto text-blue-500 mb-2" />
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
                <Clock className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">مفعلة</p>
                <p className="text-3xl font-bold text-purple-600">
                  {integrations.filter(i => i.enabled).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة التكاملات */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  التكاملات النشطة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {integrations.map(integration => (
                  <div
                    key={integration.id}
                    onClick={() => setSelectedIntegration(integration)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(integration.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {integration.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            الخدمة: {integration.service}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {getStatusLabel(integration.status)}
                            </Badge>
                            {integration.enabled ? (
                              <Badge variant="default">مفعل</Badge>
                            ) : (
                              <Badge variant="outline">معطل</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestConnection(integration.id);
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIntegration(integration.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل التكامل */}
          <div>
            {selectedIntegration ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(selectedIntegration.status)}
                    {selectedIntegration.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الحالة</p>
                    <Badge variant="outline">
                      {getStatusLabel(selectedIntegration.status)}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">مفتاح API</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded flex-1 overflow-hidden">
                        {showSecrets.includes(selectedIntegration.id)
                          ? selectedIntegration.apiKey
                          : selectedIntegration.apiKey.substring(0, 10) + '...'}
                      </code>
                      <button
                        onClick={() => toggleSecretVisibility(selectedIntegration.id)}
                        className="p-2"
                      >
                        {showSecrets.includes(selectedIntegration.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button className="p-2">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">تكرار المزامنة</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedIntegration.syncFrequency}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">آخر مزامنة</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedIntegration.lastSync}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">أنواع البيانات</p>
                    <div className="flex gap-1 flex-wrap">
                      {selectedIntegration.dataTypes.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full gap-2 mt-4">
                    <RefreshCw className="w-4 h-4" />
                    اختبار الاتصال
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر تكاملاً لعرض التفاصيل
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: تأكد من أن جميع مفاتيح API محفوظة بأمان. اختبر الاتصالات بانتظام للتأكد من عمل التكاملات بشكل صحيح.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
