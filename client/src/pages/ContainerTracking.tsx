import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, MapPin, Clock, Package, Truck, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { MapView } from '@/components/Map';
import { trpc } from '@/lib/trpc';

export default function ContainerTracking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  // const { showToast } = useToast();

  // جلب بيانات الحاويات من tRPC
  const { data: containers = [], isLoading: containersLoading } = trpc.tracking.getContainers.useQuery();
  
  // جلب سجل التتبع للحاوية المختارة
  const { data: trackingHistory = [] } = trpc.tracking.getTrackingHistory.useQuery(
    { containerId: selectedContainer || 0 },
    { enabled: !!selectedContainer }
  );

  // حساب إحصائيات الحاويات
  const stats = useMemo(() => {
    const total = containers.length;
    const inTransit = containers.filter(c => c.status === 'in_transit').length;
    const arrived = containers.filter(c => c.status === 'arrived').length;
    const cleared = containers.filter(c => c.status === 'cleared').length;
    const delayed = containers.filter(c => c.status === 'delayed').length;

    return { total, inTransit, arrived, cleared, delayed };
  }, [containers]);

  // فلترة الحاويات بناءً على البحث والحالة
  const filteredContainers = useMemo(() => {
    let filtered = containers;

    // فلترة حسب الحالة
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // فلترة حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(container =>
        container.containerNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        container.billOfLadingNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [containers, filterStatus, searchQuery]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: 'قيد الانتظار', color: 'bg-gray-500', icon: <Clock className="w-3 h-3" /> },
      in_transit: { label: 'قيد النقل', color: 'bg-blue-500', icon: <Truck className="w-3 h-3" /> },
      arrived: { label: 'وصل', color: 'bg-green-500', icon: <Package className="w-3 h-3" /> },
      cleared: { label: 'مخلص', color: 'bg-emerald-500', icon: <CheckCircle className="w-3 h-3" /> },
      delivered: { label: 'تم التسليم', color: 'bg-teal-500', icon: <CheckCircle className="w-3 h-3" /> },
      delayed: { label: 'متأخر', color: 'bg-red-500', icon: <AlertCircle className="w-3 h-3" /> },
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-500', icon: null };
    return (
      <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const handleAddContainer = () => {
    // showToast('سيتم إضافة حاوية جديدة قريباً', 'info');
  };

  const handleViewDetails = (containerId: number) => {
    setSelectedContainer(containerId);
    // showToast('تم تحميل تفاصيل الحاوية', 'success');
  };

  if (containersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">جاري تحميل الحاويات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">تتبع الحاويات</h1>
          <p className="text-slate-600 mt-2">تتبع حالة الشحنات والحاويات في الوقت الفعلي</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddContainer}>
          <Plus className="w-4 h-4 ml-2" />
          حاوية جديدة
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-slate-600 mt-2">إجمالي الحاويات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.inTransit}</p>
              <p className="text-sm text-slate-600 mt-2">قيد النقل</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.arrived}</p>
              <p className="text-sm text-slate-600 mt-2">وصلت</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.cleared}</p>
              <p className="text-sm text-slate-600 mt-2">مخلصة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.delayed}</p>
              <p className="text-sm text-slate-600 mt-2">متأخرة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث والفلترة */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
          <CardDescription>ابحث برقم الحاوية أو بوليصة الشحن</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="ابحث برقم الحاوية أو بوليصة الشحن..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الحاويات */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
        <TabsList>
          <TabsTrigger value="all">جميع الحاويات ({stats.total})</TabsTrigger>
          <TabsTrigger value="in_transit">قيد النقل ({stats.inTransit})</TabsTrigger>
          <TabsTrigger value="arrived">وصلت ({stats.arrived})</TabsTrigger>
          <TabsTrigger value="cleared">مخلصة ({stats.cleared})</TabsTrigger>
          <TabsTrigger value="delayed">متأخرة ({stats.delayed})</TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="space-y-4">
          {filteredContainers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">لا توجد حاويات بهذه الحالة</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContainers.map((container) => (
                <Card key={container.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{container.containerNumber}</CardTitle>
                        <CardDescription>بوليصة الشحن: {container.billOfLadingNumber}</CardDescription>
                      </div>
                      {getStatusBadge(container.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* شريط التقدم */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">تقدم الشحنة</span>
                        <span className="text-sm text-slate-600">{container.status === 'delivered' ? 100 : container.status === 'arrived' ? 75 : container.status === 'in_transit' ? 50 : 25}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${container.status === 'delivered' ? 100 : container.status === 'arrived' ? 75 : container.status === 'in_transit' ? 50 : 25}%` }}
                        />
                      </div>
                    </div>

                    {/* معلومات الحاوية */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">نوع الحاوية</p>
                        <p className="font-semibold">{container.containerType}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">شركة الشحن</p>
                        <p className="font-semibold">{container.shippingCompany || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">ميناء الشحن</p>
                        <p className="font-semibold">{container.portOfLoading || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">ميناء التفريغ</p>
                        <p className="font-semibold">{container.portOfDischarge || 'غير محدد'}</p>
                      </div>
                    </div>

                    {/* التواريخ */}
                    <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span>تاريخ الشحن: {container.loadingDate ? new Date(container.loadingDate).toLocaleDateString('ar-JO') : 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-600" />
                        <span>الوصول المتوقع: {container.estimatedArrivalDate ? new Date(container.estimatedArrivalDate).toLocaleDateString('ar-JO') : 'غير محدد'}</span>
                      </div>
                      {container.actualArrivalDate && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-green-600" />
                          <span>الوصول الفعلي: {new Date(container.actualArrivalDate).toLocaleDateString('ar-JO')}</span>
                        </div>
                      )}
                    </div>

                    {/* الأزرار */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewDetails(container.id)}
                      >
                        عرض التفاصيل
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewDetails(container.id)}
                      >
                        سجل التتبع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* سجل التتبع */}
      {selectedContainer && trackingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>سجل التتبع</CardTitle>
            <CardDescription>آخر أحداث التتبع للحاوية المختارة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingHistory.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  {/* خط زمني */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2" />
                    {index < trackingHistory.length - 1 && (
                      <div className="w-0.5 h-16 bg-slate-200 my-2" />
                    )}
                  </div>

                  {/* معلومات الحدث */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{event.eventType}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          <MapPin className="w-4 h-4 inline ml-1" />
                          {event.eventLocation || 'غير محدد'}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{new Date(event.eventDateTime).toLocaleDateString('ar-JO')}</p>
                        <p className="text-slate-600">{new Date(event.eventDateTime).toLocaleTimeString('ar-JO')}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{event.eventDescription || 'بدون وصف'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* خريطة Google لتتبع الشحنة */}
      {selectedContainer && (
        <Card>
          <CardHeader>
            <CardTitle>خريطة تتبع الشحنة</CardTitle>
            <CardDescription>موقع الشحنة الحالي على الخريطة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 rounded-lg overflow-hidden border border-slate-200">
              <MapView
                onMapReady={(map) => {
                  // إضافة علامة على الخريطة
                  const marker = new (window as any).google.maps.Marker({
                    position: { lat: 29.3759, lng: 47.9774 }, // موقع ميناء العقبة
                    map: map,
                    title: 'موقع الشحنة الحالي',
                  });
                  
                  // توسيط الخريطة على العلامة
                  map.setCenter({ lat: 29.3759, lng: 47.9774 });
                  map.setZoom(10);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
