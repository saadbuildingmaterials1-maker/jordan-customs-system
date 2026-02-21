import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Package, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CalculatorPage() {
  const [productValue, setProductValue] = useState("");
  const [weight, setWeight] = useState("");
  const [country, setCountry] = useState("");
  const [productType, setProductType] = useState("");
  const [results, setResults] = useState<{
    customsDuty: number;
    salesTax: number;
    shippingCost: number;
    total: number;
  } | null>(null);

  const calculateCosts = () => {
    const value = parseFloat(productValue);
    const weightKg = parseFloat(weight);

    if (!value || !weightKg || !country || !productType) {
      return;
    }

    // معدلات الرسوم الجمركية حسب نوع المنتج (نسب تقريبية)
    const customsRates: Record<string, number> = {
      electronics: 0.05, // 5%
      clothing: 0.10, // 10%
      food: 0.15, // 15%
      cosmetics: 0.20, // 20%
      other: 0.10, // 10%
    };

    // تكلفة الشحن حسب الوزن (دينار أردني لكل كيلو)
    const shippingRatePerKg = 3.5;

    // حساب الرسوم الجمركية
    const customsDuty = value * (customsRates[productType] || 0.10);

    // حساب ضريبة المبيعات (16% على القيمة + الرسوم الجمركية)
    const salesTax = (value + customsDuty) * 0.16;

    // حساب تكلفة الشحن
    const shippingCost = weightKg * shippingRatePerKg;

    // الإجمالي
    const total = value + customsDuty + salesTax + shippingCost;

    setResults({
      customsDuty: parseFloat(customsDuty.toFixed(2)),
      salesTax: parseFloat(salesTax.toFixed(2)),
      shippingCost: parseFloat(shippingCost.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Calculator className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              حاسبة تكاليف الشحن والجمارك
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              احسب التكاليف المتوقعة لاستيرادك بدقة وسهولة
            </p>
          </div>

          {/* Alert */}
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              التقديرات المقدمة هي تقريبية وقد تختلف حسب التصنيف الجمركي الدقيق للمنتج والاتفاقيات التجارية.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>بيانات الشحنة</CardTitle>
                <CardDescription>أدخل معلومات البضاعة التي تريد استيرادها</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="productValue">قيمة البضاعة (دينار أردني)</Label>
                  <Input
                    id="productValue"
                    type="number"
                    placeholder="مثال: 500"
                    value={productValue}
                    onChange={(e) => setProductValue(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">الوزن (كيلوغرام)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="مثال: 2.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">بلد المنشأ</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="اختر بلد المنشأ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="china">الصين</SelectItem>
                      <SelectItem value="usa">الولايات المتحدة</SelectItem>
                      <SelectItem value="turkey">تركيا</SelectItem>
                      <SelectItem value="germany">ألمانيا</SelectItem>
                      <SelectItem value="uae">الإمارات</SelectItem>
                      <SelectItem value="other">دولة أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">نوع المنتج</Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger id="productType">
                      <SelectValue placeholder="اختر نوع المنتج" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">إلكترونيات (5%)</SelectItem>
                      <SelectItem value="clothing">ملابس وأحذية (10%)</SelectItem>
                      <SelectItem value="food">مواد غذائية (15%)</SelectItem>
                      <SelectItem value="cosmetics">مستحضرات تجميل (20%)</SelectItem>
                      <SelectItem value="other">أخرى (10%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={calculateCosts} 
                  className="w-full" 
                  size="lg"
                  disabled={!productValue || !weight || !country || !productType}
                >
                  <Calculator className="w-5 h-5 ml-2" />
                  احسب التكاليف
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>النتائج</CardTitle>
                  <CardDescription>تفصيل التكاليف المتوقعة</CardDescription>
                </CardHeader>
                <CardContent>
                  {results ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium">الرسوم الجمركية</span>
                        </div>
                        <span className="text-lg font-bold">{results.customsDuty} د.أ</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="font-medium">ضريبة المبيعات (16%)</span>
                        </div>
                        <span className="text-lg font-bold">{results.salesTax} د.أ</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium">تكلفة الشحن</span>
                        </div>
                        <span className="text-lg font-bold">{results.shippingCost} د.أ</span>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg text-white">
                        <span className="text-lg font-bold">الإجمالي المتوقع</span>
                        <span className="text-2xl font-bold">{results.total} د.أ</span>
                      </div>

                      <div className="text-sm text-slate-600 dark:text-slate-400 text-center pt-4">
                        * التكاليف تقديرية وقد تختلف حسب التصنيف الجمركي الفعلي
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>أدخل بيانات الشحنة للحصول على التقدير</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
