import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Search,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  status: 'active' | 'inactive' | 'vip';
  totalSpent: number;
  lastOrder: string;
  rating: number;
  orders: number;
  notes: string;
}

export default function CustomerRelationship() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+962791234567',
      company: 'شركة الأردن للشحن',
      location: 'عمّان',
      status: 'vip',
      totalSpent: 45000,
      lastOrder: '2026-02-15',
      rating: 5,
      orders: 25,
      notes: 'عميل مهم جداً',
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      phone: '+962792345678',
      company: 'مؤسسة الجمارك الأردنية',
      location: 'الزرقاء',
      status: 'active',
      totalSpent: 28000,
      lastOrder: '2026-02-12',
      rating: 4.5,
      orders: 15,
      notes: 'عميل موثوق',
    },
    {
      id: '3',
      name: 'محمود حسن',
      email: 'mahmoud@example.com',
      phone: '+962793456789',
      company: 'شركة النقل الدولية',
      location: 'إربد',
      status: 'active',
      totalSpent: 15000,
      lastOrder: '2026-02-10',
      rating: 4,
      orders: 8,
      notes: 'عميل جديد',
    },
    {
      id: '4',
      name: 'سارة خالد',
      email: 'sarah@example.com',
      phone: '+962794567890',
      company: 'مستودعات عمّان',
      location: 'عمّان',
      status: 'inactive',
      totalSpent: 5000,
      lastOrder: '2025-12-20',
      rating: 3,
      orders: 2,
      notes: 'لم يتواصل مؤخراً',
    },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vip':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vip':
        return 'عميل VIP';
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return '';
    }
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status !== 'inactive').length;
  const vipCustomers = customers.filter(c => c.status === 'vip').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              إدارة العملاء والعلاقات
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تتبع وإدارة علاقات العملاء بفعالية
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            عميل جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي العملاء</p>
                <p className="text-3xl font-bold text-blue-600">{totalCustomers}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">عملاء نشطين</p>
                <p className="text-3xl font-bold text-green-600">{activeCustomers}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">عملاء VIP</p>
                <p className="text-3xl font-bold text-yellow-600">{vipCustomers}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">الإيرادات الإجمالية</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${totalRevenue.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة العملاء */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  العملاء
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* البحث */}
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="ابحث عن عميل..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {/* قائمة العملاء */}
                <div className="space-y-3">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(customer.status)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {customer.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {customer.company}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {customer.orders} طلب
                              </Badge>
                              <Badge className={getStatusColor(customer.status)}>
                                {getStatusLabel(customer.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ${customer.totalSpent.toFixed(0)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 justify-end">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {customer.rating}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل العميل */}
          <div>
            {selectedCustomer ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(selectedCustomer.status)}
                    {selectedCustomer.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      البريد الإلكتروني
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.email}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      الهاتف
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.phone}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      الموقع
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.location}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الإحصائيات</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span>الطلبات:</span>
                        <span className="font-bold">{selectedCustomer.orders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>الإجمالي المنفق:</span>
                        <span className="font-bold">${selectedCustomer.totalSpent.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>التقييم:</span>
                        <span className="font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {selectedCustomer.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      آخر طلب
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.lastOrder}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      ملاحظات
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedCustomer.notes}
                    </p>
                  </div>

                  <Button className="w-full gap-2 mt-4">
                    <Edit className="w-4 h-4" />
                    تعديل العميل
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر عميلاً لعرض التفاصيل
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
            💡 نصيحة: حافظ على علاقات جيدة مع العملاء من خلال المتابعة المنتظمة والخدمة الممتازة. استخدم بيانات العملاء لتحسين الخدمات وزيادة الإيرادات.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
