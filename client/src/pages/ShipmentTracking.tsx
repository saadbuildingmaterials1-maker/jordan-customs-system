import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Package,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Bell,
  Map,
  Truck,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

/**
 * صفحة تتبع الشحنات
 * Shipment Tracking Page
 */

export default function ShipmentTracking() {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [companyCode, setCompanyCode] = useState('aramex');
  const [searchedTracking, setSearchedTracking] = useState<string | null>(null);

  // Queries
  const companiesQuery = trpc.tracking.getAvailableCompanies.useQuery();
  const trackingQuery = trpc.tracking.getRealTime.useQuery(
    { trackingNumber: searchedTracking || '', companyCode },
    { enabled: !!searchedTracking }
  );
  const historyQuery = trpc.tracking.getHistory.useQuery(
    { trackingNumber: searchedTracking || '' },
    { enabled: !!searchedTracking }
  );
  const statisticsQuery = trpc.tracking.getStatistics.useQuery();
  const delaysQuery = trpc.tracking.checkDelays.useQuery(
    { trackingNumber: searchedTracking || '' },
    { enabled: !!searchedTracking }
  );

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال رقم التتبع',
        variant: 'destructive',
      });
      return;
    }

    setSearchedTracking(trackingNumber);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'picked_up':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case 'out_for_delivery':
        return <MapPin className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      picked_up: 'تم الاستلام',
      in_transit: 'في الطريق',
      out_for_delivery: 'جاهزة للتسليم',
      delivered: 'تم التسليم',
      failed: 'فشل التسليم',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-3xl font-bold">تتبع الشحنات</h1>
        <p className="text-muted-foreground">تتبع شحناتك في الوقت الفعلي مع شركات الشحن</p>
      </div>

      {/* شريط البحث */}
      <Card>
        <CardHeader>
          <CardTitle>البحث عن شحنة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>رقم التتبع</Label>
              <Input
                placeholder="أدخل رقم التتبع..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <Label>شركة الشحن</Label>
              <select
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {companiesQuery.data?.map((company) => (
                  <option key={company.code} value={company.code}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                بحث
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التبويبات الرئيسية */}
      {searchedTracking && (
        <Tabs defaultValue="tracking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">التتبع</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">السجل</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">التنبيهات</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">الإحصائيات</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب التتبع */}
          <TabsContent value="tracking" className="space-y-4">
            {trackingQuery.isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : trackingQuery.data ? (
              <>
                {/* معلومات الشحنة الحالية */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(trackingQuery.data.status)}
                      {getStatusLabel(trackingQuery.data.status)}
                    </CardTitle>
                    <CardDescription>رقم التتبع: {trackingQuery.data.trackingNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">الموقع الحالي</p>
                        <p className="text-lg font-semibold">{trackingQuery.data.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">التسليم المتوقع</p>
                        <p className="text-lg font-semibold">
                          {trackingQuery.data.estimatedDelivery.toLocaleDateString('ar-JO')}
                        </p>
                      </div>
                    </div>

                    {/* خريطة الموقع */}
                    <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          الموقع: {trackingQuery.data.latitude.toFixed(4)}, {trackingQuery.data.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    {/* التنبيهات */}
                    {delaysQuery.data?.isDelayed && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-900">تأخير في الشحنة</p>
                          <p className="text-sm text-yellow-800">{delaysQuery.data.message}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>

          {/* تبويب السجل */}
          <TabsContent value="history" className="space-y-4">
            {historyQuery.isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : historyQuery.data ? (
              <div className="space-y-3">
                {historyQuery.data.history.map((event, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">{getStatusIcon(event.status)}</div>
                        <div className="flex-grow">
                          <p className="font-semibold">{getStatusLabel(event.status)}</p>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                          <p className="text-sm mt-1">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {event.timestamp.toLocaleString('ar-JO')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
          </TabsContent>

          {/* تبويب التنبيهات */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  type: 'picked_up',
                  title: 'تم استلام الشحنة',
                  message: 'تم استلام شحنتك بنجاح',
                  time: '2 أيام',
                },
                {
                  type: 'in_transit',
                  title: 'الشحنة في الطريق',
                  message: 'شحنتك في طريقها إلى الوجهة',
                  time: '1 يوم',
                },
                {
                  type: 'out_for_delivery',
                  title: 'جاهزة للتسليم',
                  message: 'شحنتك مع فريق التسليم',
                  time: 'الآن',
                },
              ].map((alert, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        {getStatusIcon(alert.type)}
                        <div>
                          <p className="font-semibold">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{alert.time}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* تبويب الإحصائيات */}
          <TabsContent value="stats" className="space-y-4">
            {statisticsQuery.data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">إجمالي الشحنات</p>
                    <p className="text-3xl font-bold">{statisticsQuery.data.totalShipments}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">الشحنات المسلمة</p>
                    <p className="text-3xl font-bold text-green-600">{statisticsQuery.data.deliveredShipments}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">معدل التسليم في الموعد</p>
                    <p className="text-3xl font-bold text-blue-600">{statisticsQuery.data.onTimeDeliveryRate}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">متوسط وقت التسليم</p>
                    <p className="text-3xl font-bold">{statisticsQuery.data.averageDeliveryTime}</p>
                    <p className="text-xs text-muted-foreground">أيام</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">أكثر شركة استخداماً</p>
                    <p className="text-lg font-bold">{statisticsQuery.data.topCarrier}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">أكثر وجهة</p>
                    <p className="text-lg font-bold">{statisticsQuery.data.topDestination}</p>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
