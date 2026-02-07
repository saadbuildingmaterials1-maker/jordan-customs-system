/**
 * مكون حاسبة الشحن والجمارك المتقدم
 * Advanced Shipping and Taxes Calculator Component
 * 
 * يتضمن:
 * - حاسبة تفاعلية للأسعار
 * - خريطة Google Maps لعرض الدول
 * - نظام مقارنة متقدم للأسعار
 * - حفظ الحسابات المفضلة
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Package, Globe, Calculator, TrendingUp, Heart, Trash2, Copy, Check, Map } from 'lucide-react';
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

    return compareCountries.map(code => {
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
    }).sort((a, b) => a.total - b.total);
  }, [weight, value, currency, compareCountries]);

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
                        {Object.entries(SHIPPING_RATES).map(([code, data]) => (
                          <SelectItem key={code} value={code}>
                            {data.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">العملة</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CURRENCIES).map(([code, data]) => (
                          <SelectItem key={code} value={code}>
                            {data.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results */}
                {calculation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t-2">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">تكلفة الشحن</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {currencySymbol} {calculation.shippingCost.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">الرسوم الجمركية</p>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {currencySymbol} {calculation.customsDuty.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">الضريبة ({(SHIPPING_RATES[country].taxRate * 100).toFixed(0)}%)</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {currencySymbol} {calculation.tax.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">المجموع قبل الضريبة</p>
                      <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {currencySymbol} {calculation.subtotal.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border-2 border-green-500 dark:border-green-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400">المجموع النهائي</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {currencySymbol} {calculation.total.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">تكلفة الوحدة</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {currencySymbol} {calculation.unitCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center pt-4">
                  <Button size="lg" className="gap-2" onClick={handleSaveCalculation} disabled={!calculation}>
                    <Heart className="h-4 w-4" />
                    حفظ الحساب
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
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
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>مقارنة الأسعار بين الدول</CardTitle>
                    <CardDescription>قارن التكاليف بين دول مختلفة</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Country Selection for Comparison */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر الدول للمقارنة</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(SHIPPING_RATES).map(([code, data]) => (
                      <Button
                        key={code}
                        variant={compareCountries.includes(code) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCompareCountries(prev =>
                            prev.includes(code)
                              ? prev.filter(c => c !== code)
                              : [...prev, code]
                          );
                        }}
                      >
                        {code}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Comparison Table */}
                {comparisonData.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2">
                          <th className="text-right p-3">الدولة</th>
                          <th className="text-right p-3">تكلفة الشحن</th>
                          <th className="text-right p-3">الرسوم الجمركية</th>
                          <th className="text-right p-3">الضريبة</th>
                          <th className="text-right p-3 font-bold">المجموع النهائي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.map((item, idx) => (
                          <tr key={item.code} className={idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}>
                            <td className="p-3 font-medium">{item.country}</td>
                            <td className="p-3">{currencySymbol} {item.shippingCost.toFixed(2)}</td>
                            <td className="p-3">{currencySymbol} {item.customsDuty.toFixed(2)}</td>
                            <td className="p-3">{currencySymbol} {item.tax.toFixed(2)}</td>
                            <td className="p-3 font-bold text-green-600 dark:text-green-400">
                              {currencySymbol} {item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                  <Map className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-lg font-medium mb-2">خريطة Google Maps التفاعلية</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    سيتم عرض خريطة تفاعلية تظهر الدول والمسافات والأسعار
                  </p>
                  <Button className="gap-2">
                    <Map className="h-4 w-4" />
                    فتح الخريطة التفاعلية
                  </Button>
                </div>

                {/* Countries Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(SHIPPING_RATES).map(([code, data]) => (
                    <div key={code} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-lg">{code}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{data.country}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">الإحداثيات</p>
                          <p className="text-xs font-mono">{data.latitude.toFixed(2)}, {data.longitude.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>تكلفة الشحن: {currencySymbol} {data.shippingCost}</p>
                        <p>معدل الجمارك: {(data.customsRate * 100).toFixed(0)}%</p>
                        <p>معدل الضريبة: {(data.taxRate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Calculations Tab */}
          <TabsContent value="saved">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>الحسابات المحفوظة</CardTitle>
                    <CardDescription>الحسابات المفضلة لديك</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {savedCalculations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد حسابات محفوظة بعد</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedCalculations.map((calc) => (
                      <div key={calc.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-medium">{SHIPPING_RATES[calc.country].country}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              الوزن: {calc.weight} كغ | القيمة: {calc.value} {calc.currency}
                            </p>
                            <p className="text-sm text-gray-500">
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
