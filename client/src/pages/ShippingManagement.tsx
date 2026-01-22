import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ship, Package, MapPin, Calendar, Plus, Edit2, Trash2, Eye, Download, Truck } from 'lucide-react';

export default function ShippingManagement() {
  const [activeTab, setActiveTab] = useState('shipments');
  const [searchContainer, setSearchContainer] = useState('');

  const [shipments, setShipments] = useState([
    {
      id: 1,
      containerNumber: 'CONT-001',
      shippingCompany: 'Maersk',
      vesselName: 'MSC Gulsun',
      voyage: 'VY-2026-001',
      departureDate: '2026-01-15',
      arrivalDate: '2026-02-10',
      status: 'في البحر',
      origin: 'Shanghai',
      destination: 'Aqaba',
      weight: 25000,
      cbm: 1250,
    },
    {
      id: 2,
      containerNumber: 'CONT-002',
      shippingCompany: 'CMA CGM',
      vesselName: 'CMA CGM Antoine',
      voyage: 'VY-2026-002',
      departureDate: '2026-01-20',
      arrivalDate: '2026-02-15',
      status: 'وصلت',
      origin: 'Rotterdam',
      destination: 'Aqaba',
      weight: 18000,
      cbm: 900,
    },
    {
      id: 3,
      containerNumber: 'CONT-003',
      shippingCompany: 'Evergreen',
      vesselName: 'Ever Given',
      voyage: 'VY-2026-003',
      departureDate: '2026-01-10',
      arrivalDate: '2026-02-05',
      status: 'في الميناء',
      origin: 'Singapore',
      destination: 'Aqaba',
      weight: 22000,
      cbm: 1100,
    },
  ]);

  const [shippingCompanies] = useState([
    { id: 1, name: 'Maersk', country: 'Denmark', contact: '+45 33 63 33 33' },
    { id: 2, name: 'CMA CGM', country: 'France', contact: '+33 4 88 66 92 00' },
    { id: 3, name: 'Evergreen', country: 'Taiwan', contact: '+886 2 2162 8888' },
    { id: 4, name: 'MSC', country: 'Switzerland', contact: '+41 43 211 6666' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'في البحر':
        return 'bg-blue-100 text-blue-800';
      case 'وصلت':
        return 'bg-green-100 text-green-800';
      case 'في الميناء':
        return 'bg-yellow-100 text-yellow-800';
      case 'قيد المعالجة':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Ship className="w-8 h-8" />
              إدارة الشحن والتتبع
            </h1>
            <p className="text-gray-600 mt-2">
              تتبع الشحنات والحاويات وإدارة شركات الشحن
            </p>
          </div>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shipments" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">الشحنات</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">التتبع</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">الشركات</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب الشحنات */}
          <TabsContent value="shipments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">قائمة الشحنات</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                شحنة جديدة
              </Button>
            </div>

            {/* إحصائيات الشحنات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    إجمالي الشحنات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{shipments.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    في البحر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {shipments.filter(s => s.status === 'في البحر').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    وصلت
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {shipments.filter(s => s.status === 'وصلت').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    الوزن الإجمالي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(shipments.reduce((sum, s) => sum + s.weight, 0) / 1000).toFixed(1)} طن
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* جدول الشحنات */}
            <Card>
              <CardHeader>
                <CardTitle>الشحنات</CardTitle>
                <CardDescription>جميع الشحنات المسجلة في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 font-medium">رقم الحاوية</th>
                        <th className="text-right py-3 px-4 font-medium">شركة الشحن</th>
                        <th className="text-right py-3 px-4 font-medium">الباخرة</th>
                        <th className="text-right py-3 px-4 font-medium">تاريخ المغادرة</th>
                        <th className="text-right py-3 px-4 font-medium">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium">الوزن</th>
                        <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map((shipment) => (
                        <tr key={shipment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{shipment.containerNumber}</td>
                          <td className="py-3 px-4">{shipment.shippingCompany}</td>
                          <td className="py-3 px-4">{shipment.vesselName}</td>
                          <td className="py-3 px-4">{shipment.departureDate}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(shipment.status)}>
                              {shipment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{shipment.weight.toLocaleString('ar-JO')} كغ</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التتبع */}
          <TabsContent value="tracking" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البحث برقم الحاوية
              </label>
              <Input
                placeholder="أدخل رقم الحاوية (مثل: CONT-001)"
                value={searchContainer}
                onChange={(e) => setSearchContainer(e.target.value)}
              />
            </div>

            {shipments
              .filter(s => s.containerNumber.includes(searchContainer))
              .map(shipment => (
                <Card key={shipment.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      {shipment.containerNumber}
                    </CardTitle>
                    <CardDescription>
                      {shipment.origin} → {shipment.destination}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">الباخرة</p>
                        <p className="font-medium">{shipment.vesselName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">الرحلة</p>
                        <p className="font-medium">{shipment.voyage}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">تاريخ المغادرة</p>
                        <p className="font-medium">{shipment.departureDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">تاريخ الوصول المتوقع</p>
                        <p className="font-medium">{shipment.arrivalDate}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-3">حالة الشحنة</p>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(shipment.status)}>
                          {shipment.status}
                        </Badge>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              shipment.status === 'وصلت'
                                ? 'bg-green-600 w-full'
                                : shipment.status === 'في البحر'
                                ? 'bg-blue-600 w-2/3'
                                : 'bg-yellow-600 w-1/3'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">التفاصيل</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">الوزن:</span>
                          <span className="font-medium ml-2">{shipment.weight.toLocaleString('ar-JO')} كغ</span>
                        </div>
                        <div>
                          <span className="text-gray-600">الحجم:</span>
                          <span className="font-medium ml-2">{shipment.cbm} CBM</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      تحميل وثائق الشحن
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* تبويب شركات الشحن */}
          <TabsContent value="companies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">شركات الشحن</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                إضافة شركة
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shippingCompanies.map(company => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-blue-600" />
                          {company.name}
                        </CardTitle>
                        <CardDescription>{company.country}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">رقم الاتصال</p>
                      <p className="font-medium">{company.contact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">عدد الشحنات</p>
                      <p className="font-medium">
                        {shipments.filter(s => s.shippingCompany === company.name).length} شحنة
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
