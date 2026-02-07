/**
 * ContainerMap Component
 * 
 * مكون React
 * 
 * @module ./client/src/components/ContainerMap
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import { MapView } from './Map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertCircle, CheckCircle, Clock, Truck, Navigation } from 'lucide-react';

interface ContainerLocation {
  id: number;
  containerNumber: string;
  latitude: number;
  longitude: number;
  status: string;
  lastUpdate: Date;
  portName?: string;
  destination?: string;
  shippingCompany?: string;
  portOfLoading?: string;
}

interface ContainerMapProps {
  containers: ContainerLocation[];
  selectedContainerId?: number;
  onContainerSelect?: (id: number) => void;
}

/**
 * مكون الخريطة التفاعلية لتتبع الحاويات
 * يعرض مواقع الحاويات على خريطة Google Maps التفاعلية
 * مع معلومات تفصيلية عن كل حاوية
 */
export function ContainerMap({
  containers,
  selectedContainerId,
  onContainerSelect,
}: ContainerMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const [mapReady, setMapReady] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(selectedContainerId || null);

  // حساب مركز الخريطة بناءً على الحاويات
  const mapCenter = useMemo(() => {
    if (containers.length === 0) {
      return { lat: 31.9454, lng: 35.9284 }; // الأردن
    }
    const avgLat = containers.reduce((sum, c) => sum + c.latitude, 0) / containers.length;
    const avgLng = containers.reduce((sum, c) => sum + c.longitude, 0) / containers.length;
    return { lat: avgLat, lng: avgLng };
  }, [containers]);

  // حساب مستوى التكبير بناءً على عدد الحاويات
  const mapZoom = useMemo(() => {
    if (containers.length === 0) return 6;
    if (containers.length === 1) return 12;
    if (containers.length <= 5) return 8;
    return 6;
  }, [containers]);

  // الحصول على لون العلامة حسب الحالة
  const getMarkerColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: '#9CA3AF',
      in_transit: '#3B82F6',
      arrived: '#10B981',
      cleared: '#059669',
      delivered: '#06B6D4',
      delayed: '#EF4444',
    };
    return colorMap[status] || '#6B7280';
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pending: <Clock className="w-4 h-4" />,
      in_transit: <Truck className="w-4 h-4" />,
      arrived: <CheckCircle className="w-4 h-4" />,
      cleared: <CheckCircle className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      delayed: <AlertCircle className="w-4 h-4" />,
    };
    return iconMap[status] || <MapPin className="w-4 h-4" />;
  };

  // الحصول على نص الحالة
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'قيد الانتظار',
      in_transit: 'قيد النقل',
      arrived: 'وصلت',
      cleared: 'مخلصة',
      delivered: 'تم التسليم',
      delayed: 'متأخرة',
    };
    return statusMap[status] || status;
  };

  // معالج تحديث الخريطة
  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  };

  // إضافة العلامات على الخريطة
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.google) return;

    // حذف العلامات القديمة
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current.clear();

    // إضافة علامات جديدة
    containers.forEach((container) => {
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current!,
        position: { lat: container.latitude, lng: container.longitude },
        title: container.containerNumber,
      });

      // إضافة محتوى مخصص للعلامة
      const content = document.createElement('div');
      content.className = 'flex items-center justify-center w-10 h-10 rounded-full font-bold text-white cursor-pointer transition-transform hover:scale-110 shadow-lg';
      content.style.backgroundColor = getMarkerColor(container.status);
      content.textContent = container.containerNumber.slice(-2);
      marker.content = content;

      // معالج النقر على العلامة
      marker.addListener('click', () => {
        setSelectedMarker(container.id);
        if (onContainerSelect) {
          onContainerSelect(container.id);
        }
        // تحريك الخريطة لتوسيط العلامة المختارة
        if (mapRef.current) {
          mapRef.current.panTo({
            lat: container.latitude,
            lng: container.longitude,
          });
          mapRef.current.setZoom(12);
        }
      });

      markersRef.current.set(container.id, marker);
    });
  }, [mapReady, containers, onContainerSelect]);

  // تحديث الخريطة عند تغيير الحاوية المختارة
  useEffect(() => {
    if (selectedContainerId !== undefined) {
      setSelectedMarker(selectedContainerId);
    }
  }, [selectedContainerId]);

  const selectedContainer = containers.find(c => c.id === selectedMarker);

  return (
    <div className="space-y-4">
      {/* الخريطة */}
      <Card className="overflow-hidden border-slate-200 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">🗺️ خريطة تتبع الحاويات</CardTitle>
          <CardDescription>عرض مواقع الحاويات على الخريطة التفاعلية بالوقت الفعلي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <div className="w-full h-96">
              <MapView
                initialCenter={mapCenter}
                initialZoom={mapZoom}
                onMapReady={handleMapReady}
                className="w-full h-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات الحاوية المختارة */}
      {selectedContainer && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  {selectedContainer.containerNumber}
                </CardTitle>
                <CardDescription className="mt-1">
                  {selectedContainer.portName || 'ميناء غير محدد'}
                </CardDescription>
              </div>
              <Badge className="bg-blue-600 text-white px-3 py-1">
                {getStatusLabel(selectedContainer.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* معلومات الموقع */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-slate-600 font-semibold">الإحداثيات</p>
                <p className="font-mono text-sm mt-1">
                  {selectedContainer.latitude.toFixed(4)}° N
                </p>
                <p className="font-mono text-sm">
                  {selectedContainer.longitude.toFixed(4)}° E
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-slate-600 font-semibold">شركة الشحن</p>
                <p className="text-sm mt-1 font-semibold">
                  {selectedContainer.shippingCompany || 'غير محدد'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-slate-600 font-semibold">ميناء الشحن</p>
                <p className="text-sm mt-1">
                  {selectedContainer.portOfLoading || 'غير محدد'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-slate-600 font-semibold">آخر تحديث</p>
                <p className="text-sm mt-1">
                  {new Date(selectedContainer.lastUpdate).toLocaleTimeString('ar-JO')}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(selectedContainer.lastUpdate).toLocaleDateString('ar-JO')}
                </p>
              </div>
            </div>

            {/* الحالة التفصيلية */}
            <div className="bg-white p-3 rounded-lg space-y-2 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: getMarkerColor(selectedContainer.status) + '20' }}>
                  {getStatusIcon(selectedContainer.status)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{getStatusLabel(selectedContainer.status)}</p>
                  <p className="text-xs text-slate-500">حالة الحاوية الحالية</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الحاويات على الخريطة */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📦 الحاويات على الخريطة</CardTitle>
          <CardDescription>{containers.length} حاوية نشطة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {containers.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">لا توجد حاويات للعرض</p>
              </div>
            ) : (
              containers.map((container) => (
                <div
                  key={container.id}
                  onClick={() => {
                    setSelectedMarker(container.id);
                    if (onContainerSelect) {
                      onContainerSelect(container.id);
                    }
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                    selectedMarker === container.id
                      ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: getMarkerColor(container.status) }}
                      />
                      <span className="font-semibold text-slate-900">{container.containerNumber}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getStatusLabel(container.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 ml-7">
                    📍 {container.portName || 'ميناء غير محدد'}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات الحاويات */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📊 إحصائيات الحاويات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { status: 'pending', label: 'قيد الانتظار', color: 'bg-gray-100 text-gray-700' },
              { status: 'in_transit', label: 'قيد النقل', color: 'bg-blue-100 text-blue-700' },
              { status: 'arrived', label: 'وصلت', color: 'bg-green-100 text-green-700' },
              { status: 'cleared', label: 'مخلصة', color: 'bg-emerald-100 text-emerald-700' },
              { status: 'delivered', label: 'تم التسليم', color: 'bg-cyan-100 text-cyan-700' },
              { status: 'delayed', label: 'متأخرة', color: 'bg-red-100 text-red-700' },
            ].map((item) => (
              <div key={item.status} className={`p-3 rounded-lg text-center ${item.color}`}>
                <p className="text-2xl font-bold">
                  {containers.filter(c => c.status === item.status).length}
                </p>
                <p className="text-xs font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
