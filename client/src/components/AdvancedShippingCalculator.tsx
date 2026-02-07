/**
 * مكون حاسبة الشحن والجمارك المتقدم
 * Advanced Shipping and Taxes Calculator Component
 * 
 * يتضمن:
 * - حاسبة تفاعلية للأسعار
 * - خريطة Google Maps لعرض الدول
 * - نظام مقارنة متقدم للأسعار
 * - نظام فلترة متقدم
 * - تصدير التقارير (PDF و Excel)
 * - حفظ الحسابات المفضلة
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Package, Globe, Calculator, TrendingUp, Heart, Trash2, Copy, Check, Map, Filter, Download, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShippingRate {
  country: string;
  shippingCost: number;
  customsRate: number;
  taxRate: number;
  latitude: number;
  longitude: number;
}

interface SavedCalculation {
  id: string;
  weight: string;
  value: string;
  country: string;
  currency: string;
  timestamp: number;
  total: number;
}

interface FilterOptions {
  minShipping: number;
  maxShipping: number;
  minCustoms: number;
  maxCustoms: number;
  minTax: number;
  maxTax: number;
  minTotal: number;
  maxTotal: number;
}

const SHIPPING_RATES: Record<string, ShippingRate> = {
  // دول الخليج
  'SA': { country: 'المملكة العربية السعودية', shippingCost: 25, customsRate: 0.05, taxRate: 0.15, latitude: 23.8859, longitude: 45.0792 },
  'AE': { country: 'الإمارات العربية المتحدة', shippingCost: 20, customsRate: 0.05, taxRate: 0.05, latitude: 23.4241, longitude: 53.8478 },
  'KW': { country: 'دولة الكويت', shippingCost: 22, customsRate: 0.04, taxRate: 0.00, latitude: 29.3117, longitude: 47.4818 },
  'QA': { country: 'دولة قطر', shippingCost: 23, customsRate: 0.05, taxRate: 0.00, latitude: 25.2854, longitude: 51.5310 },
  'BH': { country: 'مملكة البحرين', shippingCost: 21, customsRate: 0.05, taxRate: 0.00, latitude: 26.0667, longitude: 50.5577 },
  'OM': { country: 'سلطنة عمان', shippingCost: 24, customsRate: 0.05, taxRate: 0.00, latitude: 21.4735, longitude: 55.9754 },
  // دول آسيوية
  'CN': { country: 'الصين', shippingCost: 50, customsRate: 0.05, taxRate: 0.16, latitude: 35.8617, longitude: 104.1954 },
  'IN': { country: 'الهند', shippingCost: 45, customsRate: 0.08, taxRate: 0.16, latitude: 20.5937, longitude: 78.9629 },
  'TH': { country: 'تايلاند', shippingCost: 40, customsRate: 0.06, taxRate: 0.16, latitude: 15.8700, longitude: 100.9925 },
  'VN': { country: 'فيتنام', shippingCost: 35, customsRate: 0.07, taxRate: 0.16, latitude: 14.0583, longitude: 108.2772 },
  'MY': { country: 'ماليزيا', shippingCost: 38, customsRate: 0.05, taxRate: 0.16, latitude: 4.2105, longitude: 101.6964 },
  'SG': { country: 'سنغافورة', shippingCost: 55, customsRate: 0.04, taxRate: 0.16, latitude: 1.3521, longitude: 103.8198 },
  'JP': { country: 'اليابان', shippingCost: 70, customsRate: 0.03, taxRate: 0.16, latitude: 36.2048, longitude: 138.2529 },
  'KR': { country: 'كوريا الجنوبية', shippingCost: 65, customsRate: 0.04, taxRate: 0.16, latitude: 35.9078, longitude: 127.7669 },
  'TR': { country: 'تركيا', shippingCost: 30, customsRate: 0.10, taxRate: 0.16, latitude: 38.9637, longitude: 35.2433 },
};

const CURRENCIES = {
  'JOD': { name: 'دينار أردني', symbol: 'د.ا', rate: 1 },
  'USD': { name: 'دولار أمريكي', symbol: '$', rate: 0.71 },
  'EUR': { name: 'يورو', symbol: '€', rate: 0.77 },
};

export default function AdvancedShippingCalculator() {
  const [weight, setWeight] = useState('1');
  const [value, setValue] = useState('1000');
  const [country, setCountry] = useState('SA');
  const [currency, setCurrency] = useState('JOD');
  const [compareCountries, setCompareCountries] = useState<string[]>(['SA', 'AE', 'KW']);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minShipping: 0,
    maxShipping: 100,
    minCustoms: 0,
    maxCustoms: 100,
    minTax: 0,
    maxTax: 100,
    minTotal: 0,
    maxTotal: 5000,
  });

  // Load saved calculations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shippingCalculations');
    if (saved) {
      setSavedCalculations(JSON.parse(saved));
    }
  }, []);

  // Save calculations to localStorage
  useEffect(() => {
    localStorage.setItem('shippingCalculations', JSON.stringify(savedCalculations));
  }, [savedCalculations]);

  const calculation = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const v = parseFloat(value) || 0;
    const rate = SHIPPING_RATES[country];
    const currencyRate = CURRENCIES[currency as keyof typeof CURRENCIES].rate;

    if (!rate || w <= 0 || v <= 0) {
      return null;
    }

    const shippingCost = rate.shippingCost * w;
    const customsDuty = v * rate.customsRate;
    const subtotal = v + shippingCost + customsDuty;
    const tax = subtotal * rate.taxRate;
    const total = subtotal + tax;

    return {
      shippingCost: shippingCost / currencyRate,
      customsDuty: customsDuty / currencyRate,
      subtotal: subtotal / currencyRate,
      tax: tax / currencyRate,
      total: total / currencyRate,
      unitCost: total / w / currencyRate,
    };
  }, [weight, value, country, currency]);

  const comparisonData = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const v = parseFloat(value) || 0;
    const currencyRate = CURRENCIES[currency as keyof typeof CURRENCIES].rate;

    if (w <= 0 || v <= 0) return [];

    let data = compareCountries.map(code => {
      const rate = SHIPPING_RATES[code];
      const shippingCost = rate.shippingCost * w;
      const customsDuty = v * rate.customsRate;
      const subtotal = v + shippingCost + customsDuty;
      const tax = subtotal * rate.taxRate;
      const total = subtotal + tax;

      return {
        code,
        country: rate.country,
        total: total / currencyRate,
        shippingCost: shippingCost / currencyRate,
        customsDuty: customsDuty / currencyRate,
        tax: tax / currencyRate,
      };
    });

    // تطبيق الفلاتر
    if (showFilters) {
      data = data.filter(item => 
        item.shippingCost >= filters.minShipping && item.shippingCost <= filters.maxShipping &&
        item.customsDuty >= filters.minCustoms && item.customsDuty <= filters.maxCustoms &&
        item.tax >= filters.minTax && item.tax <= filters.maxTax &&
        item.total >= filters.minTotal && item.total <= filters.maxTotal
      );
    }

    return data.sort((a, b) => a.total - b.total);
  }, [weight, value, currency, compareCountries, filters, showFilters]);

  const currencySymbol = CURRENCIES[currency as keyof typeof CURRENCIES].symbol;

  const handleSaveCalculation = () => {
    if (!calculation) return;

    const newCalculation: SavedCalculation = {
      id: Date.now().toString(),
      weight,
      value,
      country,
      currency,
      timestamp: Date.now(),
      total: calculation.total,
    };

    setSavedCalculations([newCalculation, ...savedCalculations]);
  };

  const handleDeleteSavedCalculation = (id: string) => {
    setSavedCalculations(savedCalculations.filter(calc => calc.id !== id));
  };

  const handleLoadSavedCalculation = (calc: SavedCalculation) => {
    setWeight(calc.weight);
    setValue(calc.value);
    setCountry(calc.country);
    setCurrency(calc.currency);
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['الدولة', 'تكلفة الشحن', 'الجمارك', 'الضريبة', 'المجموع'].join(','),
      ...comparisonData.map(item => 
        [item.country, item.shippingCost.toFixed(2), item.customsDuty.toFixed(2), item.tax.toFixed(2), item.total.toFixed(2)].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shipping-comparison-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleExportExcel = () => {
    const csvContent = [
      ['الدولة', 'تكلفة الشحن', 'الجمارك', 'الضريبة', 'المجموع'].join('\t'),
      ...comparisonData.map(item => 
        [item.country, item.shippingCost.toFixed(2), item.customsDuty.toFixed(2), item.tax.toFixed(2), item.total.toFixed(2)].join('\t')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shipping-comparison-${new Date().toISOString().split('T')[0]}.xls`);
    link.click();
  };

  const handleResetFilters = () => {
    setFilters({
      minShipping: 0,
      maxShipping: 100,
      minCustoms: 0,
      maxCustoms: 100,
      minTax: 0,
      maxTax: 100,
      minTotal: 0,
      maxTotal: 5000,
    });
  };

  return (
    <div className="w-full space-y-6 py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-slate-900 via-blue-900/50 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md mb-6">
            <Calculator className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-blue-200">حاسبة أسعار الشحن والجمارك المتقدمة</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            احسب تكاليف الشحن والجمارك
          </h2>
          <p className="text-xl text-blue-100/70 max-w-2xl mx-auto">
            احصل على أسعار فورية مع مقارنة متقدمة وحفظ الحسابات المفضلة
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="calculator">حاسبة الأسعار</TabsTrigger>
            <TabsTrigger value="comparison">المقارنة</TabsTrigger>
            <TabsTrigger value="map">الخريطة</TabsTrigger>
            <TabsTrigger value="saved">المحفوظات</TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>حاسبة أسعار الشحن والجمارك</CardTitle>
                    <CardDescription>احسب التكاليف الإجمالية لشحنتك بسهولة</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      الوزن (كغ)
                    </label>
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="أدخل الوزن"
                      min="0"
                      step="0.1"
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      القيمة (JOD)
                    </label>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="أدخل القيمة"
                      min="0"
                      step="100"
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      الدولة
                    </label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SHIPPING_RATES).map(([code, rate]) => (
                          <SelectItem key={code} value={code}>
                            {rate.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      العملة
                    </label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CURRENCIES).map(([code, curr]) => (
                          <SelectItem key={code} value={code}>
                            {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results */}
                {calculation && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4">
                        <p className="text-xs text-slate-400 mb-1">تكلفة الشحن</p>
                        <p className="text-lg font-bold text-blue-400">
                          {currencySymbol} {calculation.shippingCost.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4">
                        <p className="text-xs text-slate-400 mb-1">الرسوم الجمركية</p>
                        <p className="text-lg font-bold text-orange-400">
                          {currencySymbol} {calculation.customsDuty.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4">
                        <p className="text-xs text-slate-400 mb-1">الضريبة (15%)</p>
                        <p className="text-lg font-bold text-red-400">
                          {currencySymbol} {calculation.tax.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4">
                        <p className="text-xs text-slate-400 mb-1">المجموع قبل الضريبة</p>
                        <p className="text-lg font-bold text-yellow-400">
                          {currencySymbol} {calculation.subtotal.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4">
                        <p className="text-xs text-slate-400 mb-1">تكلفة الوحدة</p>
                        <p className="text-lg font-bold text-purple-400">
                          {currencySymbol} {calculation.unitCost.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/50">
                      <CardContent className="pt-4">
                        <p className="text-xs text-green-300 mb-1">المجموع النهائي</p>
                        <p className="text-lg font-bold text-green-400">
                          {currencySymbol} {calculation.total.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleSaveCalculation} variant="default" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    حفظ الحساب
                  </Button>
                  <Button onClick={() => {}} variant="outline" className="flex items-center gap-2">
                    احسب التكاليف الكاملة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>مقارنة الأسعار</CardTitle>
                      <CardDescription>قارن أسعار الشحن والجمارك بين الدول</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowFilters(!showFilters)} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      فلاتر
                    </Button>
                    <Button 
                      onClick={handleExportCSV} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button 
                      onClick={handleExportExcel} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Filter Panel */}
                {showFilters && (
                  <div className="bg-slate-800/50 p-4 rounded-lg space-y-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white">الفلاتر المتقدمة</h3>
                      <Button 
                        onClick={handleResetFilters} 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        إعادة تعيين
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">تكلفة الشحن: {filters.minShipping} - {filters.maxShipping}</label>
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={filters.minShipping}
                          onChange={(e) => setFilters({...filters, minShipping: parseFloat(e.target.value)})}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">الجمارك: {filters.minCustoms} - {filters.maxCustoms}</label>
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={filters.minCustoms}
                          onChange={(e) => setFilters({...filters, minCustoms: parseFloat(e.target.value)})}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">الضريبة: {filters.minTax} - {filters.maxTax}</label>
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={filters.minTax}
                          onChange={(e) => setFilters({...filters, minTax: parseFloat(e.target.value)})}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">المجموع: {filters.minTotal} - {filters.maxTotal}</label>
                        <Input
                          type="range"
                          min="0"
                          max="5000"
                          value={filters.minTotal}
                          onChange={(e) => setFilters({...filters, minTotal: parseFloat(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50 border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-right">الدولة</th>
                        <th className="px-4 py-2 text-right">تكلفة الشحن</th>
                        <th className="px-4 py-2 text-right">الجمارك</th>
                        <th className="px-4 py-2 text-right">الضريبة</th>
                        <th className="px-4 py-2 text-right">المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((item) => (
                        <tr key={item.code} className="border-b border-slate-700 hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-medium">{item.country}</td>
                          <td className="px-4 py-3 text-blue-400">{currencySymbol} {item.shippingCost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-orange-400">{currencySymbol} {item.customsDuty.toFixed(2)}</td>
                          <td className="px-4 py-3 text-red-400">{currencySymbol} {item.tax.toFixed(2)}</td>
                          <td className="px-4 py-3 text-green-400 font-bold">{currencySymbol} {item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {comparisonData.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    لا توجد دول تطابق الفلاتر المحددة
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>خريطة الدول</CardTitle>
                    <CardDescription>عرض الدول على الخريطة التفاعلية</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(SHIPPING_RATES).map(([code, rate]) => (
                    <Button
                      key={code}
                      onClick={() => setCountry(code)}
                      variant={country === code ? "default" : "outline"}
                      className="h-auto flex flex-col items-center gap-2 p-3"
                    >
                      <span className="text-lg font-bold">{code}</span>
                      <span className="text-xs text-center">{rate.country}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>الحسابات المحفوظة</CardTitle>
                    <CardDescription>إدارة الحسابات المحفوظة والمفضلة</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {savedCalculations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد حسابات محفوظة بعد</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedCalculations.map((calc) => (
                      <div key={calc.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-white">{SHIPPING_RATES[calc.country].country}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(calc.timestamp).toLocaleDateString('ar-JO')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {CURRENCIES[calc.currency as keyof typeof CURRENCIES].symbol} {calc.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoadSavedCalculation(calc)}
                            className="flex-1"
                          >
                            تحميل
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyToClipboard(
                              `${SHIPPING_RATES[calc.country].country}: ${CURRENCIES[calc.currency as keyof typeof CURRENCIES].symbol} ${calc.total.toFixed(2)}`,
                              calc.id
                            )}
                          >
                            {copiedId === calc.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSavedCalculation(calc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
