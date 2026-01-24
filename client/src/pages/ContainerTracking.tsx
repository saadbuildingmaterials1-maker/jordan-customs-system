import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, MapPin, Clock, Package, Truck } from 'lucide-react';
import { MapView } from '@/components/Map';

export default function ContainerTracking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [containers] = useState<any[]>([
    {
      id: 1,
      containerNumber: 'EMIVCHXINX006881',
      type: '40ft',
      status: 'in_transit',
      shippingCompany: 'JNSW',
      billOfLading: '1385',
      portOfLoading: 'Shanghai',
      portOfDischarge: 'Aqaba',
      loadingDate: '2026-01-15',
      estimatedArrival: '2026-02-10',
      actualArrival: null,
      progress: 65,
    },
    {
      id: 2,
      containerNumber: 'COSCO123456789',
      type: '20ft',
      status: 'arrived',
      shippingCompany: 'COSCO',
      billOfLading: '2024-001',
      portOfLoading: 'Singapore',
      portOfDischarge: 'Aqaba',
      loadingDate: '2026-01-10',
      estimatedArrival: '2026-02-05',
      actualArrival: '2026-02-04',
      progress: 100,
    },
  ]);

  const [trackingHistory] = useState<any[]>([
    {
      id: 1,
      event: 'Container Loaded',
      location: 'Shanghai Port',
      date: '2026-01-15',
      time: '14:30',
      description: 'Container loaded onto vessel',
    },
    {
      id: 2,
      event: 'Departed Port',
      location: 'Shanghai Port',
      date: '2026-01-16',
      time: '08:00',
      description: 'Vessel departed from Shanghai',
    },
    {
      id: 3,
      event: 'In Transit',
      location: 'Arabian Sea',
      date: '2026-01-20',
      time: '10:15',
      description: 'Container in transit through Arabian Sea',
    },
    {
      id: 4,
      event: 'Arrived Port',
      location: 'Aqaba Port',
      date: '2026-02-04',
      time: '16:45',
      description: 'Container arrived at Aqaba Port',
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'قيد الانتظار', color: 'bg-gray-500' },
      in_transit: { label: 'قيد النقل', color: 'bg-blue-500' },
      arrived: { label: 'وصل', color: 'bg-green-500' },
      cleared: { label: 'مخلص', color: 'bg-emerald-500' },
      delivered: { label: 'تم التسليم', color: 'bg-teal-500' },
      delayed: { label: 'متأخر', color: 'bg-red-500' },
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-500' };
    return <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>;
  };

  const filteredContainers = containers.filter(container =>
    container.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    container.billOfLading.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">تتبع الحاويات</h1>
          <p className="text-slate-600 mt-2">تتبع حالة الشحنات والحاويات في الوقت الفعلي</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-2" />
          حاوية جديدة
        </Button>
      </div>

      {/* شريط البحث */}
      <Card>
        <CardHeader>
          <CardTitle>البحث عن حاوية</CardTitle>
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
            <Button variant="outline">بحث متقدم</Button>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الحاويات */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">جميع الحاويات ({containers.length})</TabsTrigger>
          <TabsTrigger value="in_transit">قيد النقل</TabsTrigger>
          <TabsTrigger value="arrived">وصل</TabsTrigger>
          <TabsTrigger value="cleared">مخلص</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContainers.map((container) => (
              <Card key={container.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{container.containerNumber}</CardTitle>
                      <CardDescription>بوليصة الشحن: {container.billOfLading}</CardDescription>
                    </div>
                    {getStatusBadge(container.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* شريط التقدم */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">تقدم الشحنة</span>
                      <span className="text-sm text-slate-600">{container.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${container.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* معلومات الحاوية */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">نوع الحاوية</p>
                      <p className="font-semibold">{container.type}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">شركة الشحن</p>
                      <p className="font-semibold">{container.shippingCompany}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">ميناء الشحن</p>
                      <p className="font-semibold">{container.portOfLoading}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">ميناء التفريغ</p>
                      <p className="font-semibold">{container.portOfDischarge}</p>
                    </div>
                  </div>

                  {/* التواريخ */}
                  <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span>تاريخ الشحن: {container.loadingDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-600" />
                      <span>الوصول المتوقع: {container.estimatedArrival}</span>
                    </div>
                    {container.actualArrival && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-green-600" />
                        <span>الوصول الفعلي: {container.actualArrival}</span>
                      </div>
                    )}
                  </div>

                  {/* الأزرار */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">عرض التفاصيل</Button>
                    <Button variant="outline" className="flex-1">سجل التتبع</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in_transit">
          <p className="text-slate-600">الحاويات قيد النقل</p>
        </TabsContent>

        <TabsContent value="arrived">
          <p className="text-slate-600">الحاويات التي وصلت</p>
        </TabsContent>

        <TabsContent value="cleared">
          <p className="text-slate-600">الحاويات المخلصة</p>
        </TabsContent>
      </Tabs>

      {/* سجل التتبع */}
      <Card>
        <CardHeader>
          <CardTitle>سجل التتبع</CardTitle>
          <CardDescription>آخر أحداث التتبع للحاويات</CardDescription>
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
                      <h4 className="font-semibold text-slate-900">{event.event}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        <MapPin className="w-4 h-4 inline ml-1" />
                        {event.location}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{event.date}</p>
                      <p className="text-slate-600">{event.time}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
