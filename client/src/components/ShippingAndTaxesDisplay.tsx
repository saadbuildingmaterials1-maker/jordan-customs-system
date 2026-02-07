/**
 * مكون عرض أسعار الشحن والجمارك
 * Shipping and Taxes Display Component
 * 
 * يعرض أسعار الشحن الحالية والجمارك مع حاسبة تفاعلية
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Package, Globe, Calculator, TrendingUp } from 'lucide-react';

interface ShippingRate {
  country: string;
  shippingCost: number;
  customsRate: number;
  taxRate: number;
}

const SHIPPING_RATES: Record<string, ShippingRate> = {
  // دول الخليج
  'SA': { country: 'المملكة العربية السعودية', shippingCost: 25, customsRate: 0.05, taxRate: 0.15 },
  'AE': { country: 'الإمارات العربية المتحدة', shippingCost: 20, customsRate: 0.05, taxRate: 0.05 },
  'KW': { country: 'دولة الكويت', shippingCost: 22, customsRate: 0.04, taxRate: 0.00 },
  'QA': { country: 'دولة قطر', shippingCost: 23, customsRate: 0.05, taxRate: 0.00 },
  'BH': { country: 'مملكة البحرين', shippingCost: 21, customsRate: 0.05, taxRate: 0.00 },
  'OM': { country: 'سلطنة عمان', shippingCost: 24, customsRate: 0.05, taxRate: 0.00 },
  // دول آسيوية
  'CN': { country: 'الصين', shippingCost: 50, customsRate: 0.05, taxRate: 0.16 },
  'IN': { country: 'الهند', shippingCost: 45, customsRate: 0.08, taxRate: 0.16 },
  'TH': { country: 'تايلاند', shippingCost: 40, customsRate: 0.06, taxRate: 0.16 },
  'VN': { country: 'فيتنام', shippingCost: 35, customsRate: 0.07, taxRate: 0.16 },
  'MY': { country: 'ماليزيا', shippingCost: 38, customsRate: 0.05, taxRate: 0.16 },
  'SG': { country: 'سنغافورة', shippingCost: 55, customsRate: 0.04, taxRate: 0.16 },
  'JP': { country: 'اليابان', shippingCost: 70, customsRate: 0.03, taxRate: 0.16 },
  'KR': { country: 'كوريا الجنوبية', shippingCost: 65, customsRate: 0.04, taxRate: 0.16 },
  'TR': { country: 'تركيا', shippingCost: 30, customsRate: 0.10, taxRate: 0.16 },
};

const CURRENCIES = {
  'JOD': { name: 'دينار أردني', symbol: 'د.ا', rate: 1 },
  'USD': { name: 'دولار أمريكي', symbol: '$', rate: 0.71 },
  'EUR': { name: 'يورو', symbol: '€', rate: 0.77 },
};

export default function ShippingAndTaxesDisplay() {
  const [weight, setWeight] = useState('1');
  const [value, setValue] = useState('1000');
  const [country, setCountry] = useState('SA');
  const [currency, setCurrency] = useState('JOD');

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

  const currencySymbol = CURRENCIES[currency as keyof typeof CURRENCIES].symbol;

  return (
    <div className="w-full space-y-6 py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-slate-900 via-blue-900/50 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md mb-6">
            <Calculator className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-blue-200">حاسبة أسعار الشحن والجمارك</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            احسب تكاليف الشحن والجمارك
          </h2>
          <p className="text-xl text-blue-100/70 max-w-2xl mx-auto">
            احصل على أسعار فورية لجميع الدول مع حساب الضرائب والجمارك
          </p>
        </div>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>حاسبة أسعار الشحن والجمارك</CardTitle>
                <CardDescription>احسب التكاليف الإجمالية لشحنتك بسهولة</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Weight Input */}
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

              {/* Value Input */}
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

              {/* Country Select */}
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

              {/* Currency Select */}
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
                {/* Shipping Cost */}
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">تكلفة الشحن</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currencySymbol} {calculation.shippingCost.toFixed(2)}
                  </p>
                </div>

                {/* Customs Duty */}
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">الرسوم الجمركية</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {currencySymbol} {calculation.customsDuty.toFixed(2)}
                  </p>
                </div>

                {/* Tax */}
                <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">الضريبة ({(SHIPPING_RATES[country].taxRate * 100).toFixed(0)}%)</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {currencySymbol} {calculation.tax.toFixed(2)}
                  </p>
                </div>

                {/* Subtotal */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">المجموع قبل الضريبة</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {currencySymbol} {calculation.subtotal.toFixed(2)}
                  </p>
                </div>

                {/* Total */}
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border-2 border-green-500 dark:border-green-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">المجموع النهائي</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {currencySymbol} {calculation.total.toFixed(2)}
                  </p>
                </div>

                {/* Unit Cost */}
                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">تكلفة الوحدة</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {currencySymbol} {calculation.unitCost.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button size="lg" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                احسب التكاليف الكاملة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
