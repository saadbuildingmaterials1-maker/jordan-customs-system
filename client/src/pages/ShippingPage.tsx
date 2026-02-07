/**
 * ShippingPage Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/ShippingPage
 */
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Search, Filter, Download, Truck, Calendar, MapPin, DollarSign, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ShippingCompany {
  id: string;
  name: string;
  code: string;
  contact: string;
  email: string;
  phone: string;
}

interface Shipment {
  id: string;
  shipmentNumber: string;
  companyId: string;
  origin: string;
  destination: string;
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  containerNumber: string;
  billOfLading: string;
  shippingCost: number;
  insurance: number;
  status: 'pending' | 'in-transit' | 'arrived' | 'delivered' | 'delayed';
  weight: number;
  cbm: number;
  items: number;
  notes: string;
}

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState('shipments');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isAddingShipment, setIsAddingShipment] = useState(false);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editingShipmentId, setEditingShipmentId] = useState<string | null>(null);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);

  const [companies, setCompanies] = useState<ShippingCompany[]>([
    {
      id: '1',
      name: 'شركة الخليج للشحن',
      code: 'GSC',
      contact: 'أحمد محمد',
      email: 'info@gulfshipping.com',
      phone: '+962796123456',
    },
  ]);

  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: '1',
      shipmentNumber: 'SHP-2026-001',
      companyId: '1',
      origin: 'Shanghai',
      destination: 'Aqaba',
      departureDate: '2026-01-10',
      estimatedArrival: '2026-02-15',
      containerNumber: 'CONT-001',
      billOfLading: 'BL-2026-001',
      shippingCost: 5000,
      insurance: 500,
      status: 'in-transit',
      weight: 25000,
      cbm: 1250,
      items: 2,
      notes: 'شحنة إلكترونيات',
    },
  ]);

  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
    shipmentNumber: '',
    companyId: '',
    origin: '',
    destination: '',
    departureDate: '',
    estimatedArrival: '',
    containerNumber: '',
    billOfLading: '',
    shippingCost: 0,
    insurance: 0,
    status: 'pending',
    weight: 0,
    cbm: 0,
    items: 0,
    notes: '',
  });

  const [newCompany, setNewCompany] = useState<Partial<ShippingCompany>>({
    name: '',
    code: '',
    contact: '',
    email: '',
    phone: '',
  });

  // تصفية الشحنات
  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      const matchesSearch = shipment.shipmentNumber.includes(searchQuery) ||
                           shipment.origin.includes(searchQuery) ||
                           shipment.destination.includes(searchQuery) ||
                           shipment.containerNumber.includes(searchQuery);
      const matchesStatus = filterStatus === null || shipment.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchQuery, filterStatus]);

  // حسابات
  const statistics = useMemo(() => {
    const total = shipments.length;
    const inTransit = shipments.filter(s => s.status === 'in-transit').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const delayed = shipments.filter(s => s.status === 'delayed').length;
    const totalCost = shipments.reduce((sum, s) => sum + s.shippingCost + s.insurance, 0);
    const totalWeight = shipments.reduce((sum, s) => sum + s.weight, 0);
    const totalCBM = shipments.reduce((sum, s) => sum + s.cbm, 0);

    return { total, inTransit, delivered, delayed, totalCost, totalWeight, totalCBM };
  }, [shipments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'arrived': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in-transit': return 'قيد النقل';
      case 'arrived': return 'وصلت';
      case 'delivered': return 'تم التسليم';
      case 'delayed': return 'متأخرة';
      default: return status;
    }
  };

  const handleAddShipment = () => {
    if (!newShipment.shipmentNumber || !newShipment.companyId) {
      toast.error('الرجاء ملء الحقول المطلوبة');
      return;
    }

    const shipment: Shipment = {
      id: editingShipmentId || Date.now().toString(),
      shipmentNumber: newShipment.shipmentNumber || '',
      companyId: newShipment.companyId || '',
      origin: newShipment.origin || '',
      destination: newShipment.destination || '',
      departureDate: newShipment.departureDate || '',
      estimatedArrival: newShipment.estimatedArrival || '',
      containerNumber: newShipment.containerNumber || '',
      billOfLading: newShipment.billOfLading || '',
      shippingCost: newShipment.shippingCost || 0,
      insurance: newShipment.insurance || 0,
      status: (newShipment.status || 'pending') as Shipment['status'],
      weight: newShipment.weight || 0,
      cbm: newShipment.cbm || 0,
      items: newShipment.items || 0,
      notes: newShipment.notes || '',
    };

    if (editingShipmentId) {
      setShipments(shipments.map(s => s.id === editingShipmentId ? shipment : s));
      setEditingShipmentId(null);
      toast.success('تم تحديث الشحنة بنجاح');
    } else {
      setShipments([...shipments, shipment]);
      toast.success('تم إضافة الشحنة بنجاح');
    }

    setNewShipment({
      shipmentNumber: '',
      companyId: '',
      origin: '',
      destination: '',
      departureDate: '',
      estimatedArrival: '',
      containerNumber: '',
      billOfLading: '',
      shippingCost: 0,
      insurance: 0,
      status: 'pending',
      weight: 0,
      cbm: 0,
      items: 0,
      notes: '',
    });
    setIsAddingShipment(false);
  };

  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.code) {
      toast.error('الرجاء ملء الحقول المطلوبة');
      return;
    }

    const company: ShippingCompany = {
      id: editingCompanyId || Date.now().toString(),
      name: newCompany.name || '',
      code: newCompany.code || '',
      contact: newCompany.contact || '',
      email: newCompany.email || '',
      phone: newCompany.phone || '',
    };

    if (editingCompanyId) {
      setCompanies(companies.map(c => c.id === editingCompanyId ? company : c));
      setEditingCompanyId(null);
      toast.success('تم تحديث الشركة بنجاح');
    } else {
      setCompanies([...companies, company]);
      toast.success('تم إضافة الشركة بنجاح');
    }

    setNewCompany({ name: '', code: '', contact: '', email: '', phone: '' });
    setIsAddingCompany(false);
  };

  const handleDeleteShipment = (id: string) => {
    setShipments(shipments.filter(s => s.id !== id));
    toast.success('تم حذف الشحنة بنجاح');
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(companies.filter(c => c.id !== id));
    toast.success('تم حذف الشركة بنجاح');
  };

  const handleEditShipment = (shipment: Shipment) => {
    setNewShipment(shipment);
    setEditingShipmentId(shipment.id);
    setIsAddingShipment(true);
  };

  const handleEditCompany = (company: ShippingCompany) => {
    setNewCompany(company);
    setEditingCompanyId(company.id);
    setIsAddingCompany(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-8 h-8" />
              إدارة الشحن
            </h1>
            <p className="text-gray-600 mt-2">
              تتبع الشحنات وإدارة شركات الشحن والتكاليف
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </Button>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">إجمالي الشحنات</p>
                <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">قيد النقل</p>
                <p className="text-3xl font-bold text-yellow-600">{statistics.inTransit}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">تم التسليم</p>
                <p className="text-3xl font-bold text-green-600">{statistics.delivered}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">متأخرة</p>
                <p className="text-3xl font-bold text-red-600">{statistics.delayed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shipments">الشحنات ({shipments.length})</TabsTrigger>
            <TabsTrigger value="companies">شركات الشحن ({companies.length})</TabsTrigger>
          </TabsList>

          {/* تبويب الشحنات */}
          <TabsContent value="shipments" className="space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="flex gap-2 flex-1 min-w-64">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن شحنة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  تصفية
                </Button>
              </div>
              <Button className="flex items-center gap-2" onClick={() => setIsAddingShipment(true)}>
                <Plus className="w-4 h-4" />
                شحنة جديدة
              </Button>
            </div>

            {/* جدول الشحنات */}
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 font-medium">رقم الشحنة</th>
                        <th className="text-right py-3 px-4 font-medium">من</th>
                        <th className="text-right py-3 px-4 font-medium">إلى</th>
                        <th className="text-right py-3 px-4 font-medium">التاريخ</th>
                        <th className="text-right py-3 px-4 font-medium">التكلفة</th>
                        <th className="text-right py-3 px-4 font-medium">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShipments.map(shipment => (
                        <tr key={shipment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{shipment.shipmentNumber}</td>
                          <td className="py-3 px-4">{shipment.origin}</td>
                          <td className="py-3 px-4">{shipment.destination}</td>
                          <td className="py-3 px-4 text-sm">{shipment.departureDate}</td>
                          <td className="py-3 px-4 font-medium">${(shipment.shippingCost + shipment.insurance).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(shipment.status)}`}>
                              {getStatusLabel(shipment.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditShipment(shipment)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteShipment(shipment.id)}>
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

            {/* نموذج إضافة شحنة */}
            {isAddingShipment && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingShipmentId ? 'تعديل الشحنة' : 'إضافة شحنة جديدة'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="رقم الشحنة"
                      value={newShipment.shipmentNumber || ''}
                      onChange={(e) => setNewShipment({ ...newShipment, shipmentNumber: e.target.value })}
                    />
                    <Input
                      placeholder="من"
                      value={newShipment.origin || ''}
                      onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                    />
                    <Input
                      placeholder="إلى"
                      value={newShipment.destination || ''}
                      onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={newShipment.departureDate || ''}
                      onChange={(e) => setNewShipment({ ...newShipment, departureDate: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="تكلفة الشحن"
                      value={newShipment.shippingCost || 0}
                      onChange={(e) => setNewShipment({ ...newShipment, shippingCost: parseFloat(e.target.value) || 0 })}
                    />
                    <select
                      className="border rounded-md px-3 py-2"
                      value={newShipment.status || 'pending'}
                      onChange={(e) => setNewShipment({ ...newShipment, status: e.target.value as Shipment['status'] })}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="in-transit">قيد النقل</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="delayed">متأخرة</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddShipment} className="flex-1">
                      {editingShipmentId ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsAddingShipment(false);
                      setEditingShipmentId(null);
                    }} className="flex-1">
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* تبويب شركات الشحن */}
          <TabsContent value="companies" className="space-y-6">
            <div className="flex justify-end">
              <Button className="flex items-center gap-2" onClick={() => setIsAddingCompany(true)}>
                <Plus className="w-4 h-4" />
                شركة جديدة
              </Button>
            </div>

            {/* جدول الشركات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companies.map(company => (
                <Card key={company.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">اسم الشركة</p>
                        <p className="font-medium text-lg">{company.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">الكود</p>
                          <p className="font-medium">{company.code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">جهة الاتصال</p>
                          <p className="font-medium">{company.contact}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                        <p className="font-medium text-blue-600">{company.email}</p>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm" onClick={() => handleEditCompany(company)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* نموذج إضافة شركة */}
            {isAddingCompany && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingCompanyId ? 'تعديل الشركة' : 'إضافة شركة جديدة'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="اسم الشركة"
                      value={newCompany.name || ''}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    />
                    <Input
                      placeholder="الكود"
                      value={newCompany.code || ''}
                      onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value })}
                    />
                    <Input
                      placeholder="جهة الاتصال"
                      value={newCompany.contact || ''}
                      onChange={(e) => setNewCompany({ ...newCompany, contact: e.target.value })}
                    />
                    <Input
                      placeholder="البريد الإلكتروني"
                      value={newCompany.email || ''}
                      onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddCompany} className="flex-1">
                      {editingCompanyId ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsAddingCompany(false);
                      setEditingCompanyId(null);
                    }} className="flex-1">
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
