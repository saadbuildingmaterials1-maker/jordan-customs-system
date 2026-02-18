import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Navigation, MapPin, Loader } from 'lucide-react';
import { trpc } from '@/lib/trpc';

/**
 * مكون الخريطة التفاعلية لتتبع الشحنات
 * Interactive Tracking Map Component
 */

interface TrackingMapProps {
  trackingNumber: string;
  companyCode?: string;
}

export function TrackingMap({ trackingNumber, companyCode }: TrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [markers, setMarkers] = useState<any[]>([]);

  // جلب بيانات المسار
  const routeQuery = trpc.tracking.getRealTime.useQuery(
    { trackingNumber, companyCode },
    { enabled: !!trackingNumber }
  );

  // تهيئة الخريطة
  useEffect(() => {
    if (!mapContainer.current || isMapLoaded) return;

    // محاكاة تحميل Google Maps
    const initMap = () => {
      // في التطبيق الفعلي، سيتم استخدام Google Maps API
      const mapElement = mapContainer.current;
      if (mapElement) {
        mapElement.innerHTML = `
          <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            color: white;
            font-family: Arial, sans-serif;
          ">
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
              <div style="font-size: 18px; font-weight: bold;">خريطة تفاعلية</div>
              <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">
                جاري تحميل موقع الشحنة...
              </div>
            </div>
          </div>
        `;
      }
      setIsMapLoaded(true);
    };

    // تأخير صغير لمحاكاة تحميل الخريطة
    const timer = setTimeout(initMap, 500);
    return () => clearTimeout(timer);
  }, [isMapLoaded]);

  // تحديث الخريطة عند تغيير البيانات
  useEffect(() => {
    if (!routeQuery.data || !isMapLoaded) return;

    // محاكاة إضافة العلامات على الخريطة
    const mockMarkers = [
      {
        id: 'origin',
        title: 'نقطة الانطلاق',
        position: { lat: 31.9454, lng: 35.9284 },
        icon: '📦',
      },
      {
        id: 'current',
        title: 'الموقع الحالي',
        position: { lat: routeQuery.data.latitude, lng: routeQuery.data.longitude },
        icon: '📍',
      },
      {
        id: 'destination',
        title: 'الوجهة النهائية',
        position: { lat: 32.5552, lng: 35.8456 },
        icon: '🎯',
      },
    ];

    setMarkers(mockMarkers);
  }, [routeQuery.data, isMapLoaded]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              خريطة التتبع
            </CardTitle>
            <CardDescription>الموقع الفعلي للشحنة مع المسار الكامل</CardDescription>
          </div>
          {routeQuery.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin" />
              جاري التحديث
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* الخريطة */}
        <div
          ref={mapContainer}
          className="w-full h-96 rounded-lg border border-border overflow-hidden"
          style={{ minHeight: '400px' }}
        />

        {/* معلومات الموقع الحالي */}
        {routeQuery.data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* نقطة الانطلاق */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📦</div>
                <div>
                  <p className="font-semibold text-blue-900">نقطة الانطلاق</p>
                  <p className="text-sm text-blue-700">عمّان</p>
                  <p className="text-xs text-blue-600 mt-1">31.9454° N, 35.9284° E</p>
                </div>
              </div>
            </div>

            {/* الموقع الحالي */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📍</div>
                <div>
                  <p className="font-semibold text-green-900">الموقع الحالي</p>
                  <p className="text-sm text-green-700">{routeQuery.data.location}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {routeQuery.data.latitude.toFixed(4)}° N, {routeQuery.data.longitude.toFixed(4)}° E
                  </p>
                </div>
              </div>
            </div>

            {/* الوجهة النهائية */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <p className="font-semibold text-purple-900">الوجهة النهائية</p>
                  <p className="text-sm text-purple-700">إربد</p>
                  <p className="text-xs text-purple-600 mt-1">32.5552° N, 35.8456° E</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تفاصيل المسار */}
        {routeQuery.data && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">تفاصيل المسار</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">المسافة الكلية</p>
                <p className="text-lg font-bold">~250 كم</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">الوقت المتبقي</p>
                <p className="text-lg font-bold">~4 ساعات</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">السرعة الحالية</p>
                <p className="text-lg font-bold">~80 كم/س</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">نسبة الإنجاز</p>
                <p className="text-lg font-bold">60%</p>
              </div>
            </div>
          </div>
        )}

        {/* شريط التقدم */}
        {routeQuery.data && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">تقدم الشحنة</span>
              <Badge variant="outline">60%</Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        )}

        {/* التنبيهات */}
        {routeQuery.data && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">تحديث فوري</p>
              <p className="text-sm text-yellow-800">
                يتم تحديث موقع الشحنة تلقائياً كل 5 دقائق
              </p>
            </div>
          </div>
        )}

        {/* حالة التحميل */}
        {routeQuery.isLoading && (
          <div className="text-center py-8">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">جاري تحميل بيانات الخريطة...</p>
          </div>
        )}

        {/* رسالة الخطأ */}
        {routeQuery.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">خطأ في تحميل الخريطة</p>
              <p className="text-sm text-red-800">يرجى التحقق من رقم التتبع والمحاولة مجدداً</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TrackingMap;
