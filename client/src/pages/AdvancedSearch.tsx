/**
 * AdvancedSearch Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/AdvancedSearch
 */
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Download, Eye, FileText, Package, Truck, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  type: 'declaration' | 'supplier' | 'shipping' | 'expense';
  title: string;
  description: string;
  date: string;
  amount?: number;
  status: string;
  relevance: number;
}

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  // بيانات البحث الوهمية
  const allResults: SearchResult[] = [
    {
      id: '1',
      type: 'declaration',
      title: 'بيان جمركي رقم DECL-2026-001',
      description: 'أجهزة إلكترونية من شنغهاي',
      date: '2026-01-15',
      amount: 50000,
      status: 'مكتمل',
      relevance: 95,
    },
    {
      id: '2',
      type: 'supplier',
      title: 'فاتورة مورد - شركة الواحة للتجارة',
      description: 'قطع غيار وأجهزة إلكترونية',
      date: '2026-01-10',
      amount: 25000,
      status: 'معلق',
      relevance: 85,
    },
    {
      id: '3',
      type: 'shipping',
      title: 'شحنة رقم SHIP-2026-001',
      description: 'شحنة من ميناء العقبة إلى عمّان',
      date: '2026-01-20',
      amount: 5000,
      status: 'قيد التوصيل',
      relevance: 75,
    },
    {
      id: '4',
      type: 'expense',
      title: 'مصاريف شحن - DHL Express',
      description: 'رسوم الشحن والتأمين',
      date: '2026-01-18',
      amount: 1500,
      status: 'مدفوع',
      relevance: 65,
    },
  ];

  // تصفية النتائج
  const filteredResults = useMemo(() => {
    let results = allResults.filter(result => {
      const matchesQuery = 
        result.title.includes(searchQuery) || 
        result.description.includes(searchQuery) ||
        result.id.includes(searchQuery);
      
      const matchesType = filterType === 'all' || result.type === filterType;
      const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
      
      const resultDate = new Date(result.date);
      const matchesDateFrom = !filterDateFrom || resultDate >= new Date(filterDateFrom);
      const matchesDateTo = !filterDateTo || resultDate <= new Date(filterDateTo);

      return matchesQuery && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    // ترتيب النتائج
    if (sortBy === 'relevance') {
      results.sort((a, b) => b.relevance - a.relevance);
    } else if (sortBy === 'date') {
      results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'amount') {
      results.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }

    return results;
  }, [searchQuery, filterType, filterStatus, filterDateFrom, filterDateTo, sortBy]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'declaration':
        return <FileText className="w-4 h-4" />;
      case 'supplier':
        return <Package className="w-4 h-4" />;
      case 'shipping':
        return <Truck className="w-4 h-4" />;
      case 'expense':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'declaration':
        return 'بيان جمركي';
      case 'supplier':
        return 'فاتورة مورد';
      case 'shipping':
        return 'شحنة';
      case 'expense':
        return 'مصروف';
      default:
        return 'أخرى';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'declaration':
        return 'bg-blue-100 text-blue-800';
      case 'supplier':
        return 'bg-green-100 text-green-800';
      case 'shipping':
        return 'bg-purple-100 text-purple-800';
      case 'expense':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportResults = () => {
    toast.success('تم تصدير النتائج بنجاح');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-8 h-8" />
            البحث المتقدم
          </h1>
          <p className="text-gray-600 mt-2">
            ابحث عن البيانات الجمركية والفواتير والشحنات والمصاريف بسهولة
          </p>
        </div>

        {/* شريط البحث الرئيسي */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن بيان جمركي أو فاتورة أو شحنة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-lg"
                />
              </div>
              <Button onClick={handleExportResults} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                تصدير
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* الفلاتر */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              الفلاتر المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">النوع</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">الكل</option>
                  <option value="declaration">بيان جمركي</option>
                  <option value="supplier">فاتورة مورد</option>
                  <option value="shipping">شحنة</option>
                  <option value="expense">مصروف</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الحالة</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">الكل</option>
                  <option value="مكتمل">مكتمل</option>
                  <option value="معلق">معلق</option>
                  <option value="قيد التوصيل">قيد التوصيل</option>
                  <option value="مدفوع">مدفوع</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">من التاريخ</label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">إلى التاريخ</label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الترتيب</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="relevance">الأكثر صلة</option>
                  <option value="date">الأحدث</option>
                  <option value="amount">الأعلى قيمة</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* النتائج */}
        <Card>
          <CardHeader>
            <CardTitle>
              نتائج البحث ({filteredResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">لم يتم العثور على نتائج</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map(result => (
                  <div key={result.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{result.title}</h3>
                            <Badge className={getTypeColor(result.type)}>
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {result.date}
                            </span>
                            {result.amount && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {result.amount.toLocaleString()} JOD
                              </span>
                            )}
                            <Badge variant="outline">{result.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          الصلة: {result.relevance}%
                        </div>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          عرض
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* إحصائيات البحث */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">إجمالي النتائج</p>
                <p className="text-3xl font-bold text-blue-600">{filteredResults.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">البيانات الجمركية</p>
                <p className="text-3xl font-bold text-green-600">
                  {filteredResults.filter(r => r.type === 'declaration').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">الشحنات</p>
                <p className="text-3xl font-bold text-purple-600">
                  {filteredResults.filter(r => r.type === 'shipping').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">إجمالي المبالغ</p>
                <p className="text-3xl font-bold text-orange-600">
                  {filteredResults.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString()} JOD
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
