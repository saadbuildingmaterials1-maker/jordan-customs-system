import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Warehouse,
  BarChart3,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  warehouse: string;
  category: string;
  price: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: string;
}

export default function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'صناديق الشحن - حجم صغير',
      sku: 'BOX-SM-001',
      quantity: 450,
      minQuantity: 100,
      maxQuantity: 1000,
      warehouse: 'المستودع الرئيسي',
      category: 'تغليف',
      price: 2.5,
      status: 'in-stock',
      lastUpdated: '2026-02-18 10:30',
    },
    {
      id: '2',
      name: 'صناديق الشحن - حجم كبير',
      sku: 'BOX-LG-001',
      quantity: 85,
      minQuantity: 100,
      maxQuantity: 500,
      warehouse: 'المستودع الرئيسي',
      category: 'تغليف',
      price: 5.0,
      status: 'low-stock',
      lastUpdated: '2026-02-18 09:15',
    },
    {
      id: '3',
      name: 'أكياس الحماية',
      sku: 'BAG-PROT-001',
      quantity: 0,
      minQuantity: 200,
      maxQuantity: 2000,
      warehouse: 'المستودع الفرعي',
      category: 'حماية',
      price: 1.2,
      status: 'out-of-stock',
      lastUpdated: '2026-02-17 14:00',
    },
    {
      id: '4',
      name: 'شريط لاصق - 50 ملم',
      sku: 'TAPE-50-001',
      quantity: 320,
      minQuantity: 100,
      maxQuantity: 500,
      warehouse: 'المستودع الرئيسي',
      category: 'مواد لاصقة',
      price: 0.8,
      status: 'in-stock',
      lastUpdated: '2026-02-18 11:45',
    },
    {
      id: '5',
      name: 'ملصقات العناوين',
      sku: 'LABEL-ADDR-001',
      quantity: 150,
      minQuantity: 500,
      maxQuantity: 5000,
      warehouse: 'المستودع الرئيسي',
      category: 'ملصقات',
      price: 0.05,
      status: 'low-stock',
      lastUpdated: '2026-02-18 08:20',
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'low-stock':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'out-of-stock':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'متوفر';
      case 'low-stock':
        return 'كمية منخفضة';
      case 'out-of-stock':
        return 'غير متوفر';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const inStockCount = items.filter(i => i.status === 'in-stock').length;
  const lowStockCount = items.filter(i => i.status === 'low-stock').length;
  const outOfStockCount = items.filter(i => i.status === 'out-of-stock').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              إدارة المخزون والمستودعات
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تتبع المخزون والمواد والتجهيزات
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة صنف جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الأصناف</p>
                <p className="text-3xl font-bold text-blue-600">{items.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">متوفرة</p>
                <p className="text-3xl font-bold text-green-600">{inStockCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">كمية منخفضة</p>
                <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">القيمة الإجمالية</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${totalValue.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة الأصناف */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5" />
                  أصناف المخزون
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* البحث */}
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="ابحث عن صنف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {/* قائمة الأصناف */}
                <div className="space-y-3">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(item.status)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              SKU: {item.sku}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{item.category}</Badge>
                              <Badge className={getStatusColor(item.status)}>
                                {getStatusLabel(item.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {item.quantity}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل الصنف */}
          <div>
            {selectedItem ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(selectedItem.status)}
                    {selectedItem.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">SKU</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">
                      {selectedItem.sku}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الكمية</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">الحالية:</span>
                        <span className="font-bold text-lg text-blue-600">
                          {selectedItem.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>الحد الأدنى:</span>
                        <span>{selectedItem.minQuantity}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>الحد الأقصى:</span>
                        <span>{selectedItem.maxQuantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">السعر</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      ${selectedItem.price.toFixed(2)} / وحدة
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      القيمة الإجمالية: ${(selectedItem.quantity * selectedItem.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">المستودع</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedItem.warehouse}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">آخر تحديث</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedItem.lastUpdated}
                    </p>
                  </div>

                  <Button className="w-full gap-2 mt-4">
                    <Edit className="w-4 h-4" />
                    تعديل الصنف
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر صنفاً لعرض التفاصيل
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
            💡 نصيحة: راقب الأصناف ذات الكمية المنخفضة وأعد ترتيبها في الوقت المناسب. استخدم التقارير لتحليل استهلاك المواد.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
