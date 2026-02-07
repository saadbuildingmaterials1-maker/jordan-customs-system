/**
 * GovernmentIntegration Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/GovernmentIntegration
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, RefreshCw, Send } from 'lucide-react';
import { trpc } from '@/lib/trpc';

/**
 * صفحة إدارة التكامل مع الجهات الحكومية
 */
export default function GovernmentIntegration() {
  const [activeTab, setActiveTab] = useState('status');
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // استدعاء الـ APIs
  const testConnection = (trpc as any).government?.testConnection?.useQuery();
  const getTariffCodes = (trpc as any).government?.getTariffCodes?.useQuery({ searchTerm });
  const trackShipment = (trpc as any).government?.trackShipment?.useQuery(
    { trackingNumber },
    { enabled: !!trackingNumber }
  );
  const getStats = (trpc as any).government?.getIntegrationStats?.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🌐 إدارة التكامل مع الجهات الحكومية
          </h1>
          <p className="text-slate-400">
            الربط والمزامنة مع نظام الجمارك الأردنية الرسمي
          </p>
        </div>

        {/* حالة الاتصال */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {testConnection.data?.connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                حالة الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    testConnection.data?.connected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-slate-300">
                  {testConnection.isLoading
                    ? 'جاري الفحص...'
                    : testConnection.data?.connected
                    ? 'متصل'
                    : 'غير متصل'}
                </span>
              </div>
              <Button
                onClick={() => testConnection.refetch()}
                disabled={testConnection.isLoading}
                className="mt-4 w-full"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                اختبار الاتصال
              </Button>
            </CardContent>
          </Card>

          {/* الإحصائيات */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">📊 الإحصائيات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">إجمالي البيانات:</span>
                  <span className="text-white font-semibold">
                    {getStats.data?.stats?.totalDeclarations || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">الناجحة:</span>
                  <span className="text-green-400 font-semibold">
                    {getStats.data?.stats?.successfulDeclarations || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">الفاشلة:</span>
                  <span className="text-red-400 font-semibold">
                    {getStats.data?.stats?.failedDeclarations || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* آخر مزامنة */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                آخر مزامنة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                {getStats.data?.stats?.lastSync
                  ? new Date(getStats.data.stats.lastSync).toLocaleString('ar-JO')
                  : 'لم تتم مزامنة بعد'}
              </p>
              <Button
                onClick={() => getStats.refetch()}
                disabled={getStats.isLoading}
                className="mt-4 w-full"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                تحديث
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="status" className="text-white">
              الحالة
            </TabsTrigger>
            <TabsTrigger value="codes" className="text-white">
              الرموز الجمركية
            </TabsTrigger>
            <TabsTrigger value="tracking" className="text-white">
              التتبع
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-white">
              السجلات
            </TabsTrigger>
          </TabsList>

          {/* تبويب الحالة */}
          <TabsContent value="status" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">معلومات الاتصال</CardTitle>
                <CardDescription className="text-slate-400">
                  تفاصيل الاتصال بنظام الجمارك الأردنية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {testConnection.data?.connected ? (
                  <Alert className="bg-green-900 border-green-700">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-200">
                      الاتصال بالنظام الحكومي يعمل بشكل صحيح
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-900 border-red-700">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-200">
                      فشل الاتصال بالنظام الحكومي
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="text-sm text-slate-400">حالة الخادم</label>
                    <Badge
                      className={
                        testConnection.data?.connected
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                      }
                    >
                      {testConnection.data?.connected ? 'نشط' : 'معطل'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">وقت الاستجابة</label>
                    <p className="text-white">
                      {testConnection.isLoading ? 'جاري القياس...' : '< 100ms'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الرموز الجمركية */}
          <TabsContent value="codes" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">البحث عن الرموز الجمركية</CardTitle>
                <CardDescription className="text-slate-400">
                  ابحث عن الرموز الجمركية (HS Codes) في قاعدة البيانات الحكومية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="ابحث عن رمز جمركي..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />

                <div className="space-y-2">
                  {getTariffCodes.isLoading ? (
                    <p className="text-slate-400">جاري البحث...</p>
                  ) : getTariffCodes.data?.codes?.length ? (
                    getTariffCodes.data.codes.map((code: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-700 rounded border border-slate-600"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-white">{code.code}</p>
                            <p className="text-sm text-slate-400">{code.description}</p>
                          </div>
                          <Badge className="bg-blue-600">{code.rate}%</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">لا توجد نتائج</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التتبع */}
          <TabsContent value="tracking" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">تتبع الشحنة</CardTitle>
                <CardDescription className="text-slate-400">
                  تتبع حالة الشحنة في نظام الجمارك الأردنية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="أدخل رقم التتبع..."
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button
                    onClick={() => trackShipment.refetch()}
                    disabled={trackShipment.isLoading || !trackingNumber}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    بحث
                  </Button>
                </div>

                {trackShipment.data?.shipment && (
                  <div className="p-4 bg-slate-700 rounded border border-slate-600 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">رقم الشحنة:</span>
                      <span className="text-white font-semibold">
                        {trackShipment.data.shipment.trackingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الحالة:</span>
                      <Badge className="bg-blue-600">
                        {trackShipment.data.shipment.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الموقع الحالي:</span>
                      <span className="text-white">
                        {trackShipment.data.shipment.location}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب السجلات */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">سجل العمليات</CardTitle>
                <CardDescription className="text-slate-400">
                  جميع العمليات والمزامنات مع النظام الحكومي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <p className="text-slate-400 text-center py-8">
                    لا توجد عمليات مسجلة حتى الآن
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
