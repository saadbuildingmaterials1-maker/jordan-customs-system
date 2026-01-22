import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Calendar, Package, Truck } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function ShippingPage() {
  const [formData, setFormData] = useState({
    shippingCompanyName: '',
    containerNumber: '',
    shippingCost: 0,
    shippingCompanyProvider: 'DHL',
    departureDate: '',
    estimatedArrivalDate: '',
    notes: '',
    pdfFile: null as File | null,
  });

  const [uploadedPdf, setUploadedPdf] = useState<{ name: string; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const shippingProviders = [
    { value: 'DHL', label: 'DHL' },
    { value: 'FedEx', label: 'FedEx' },
    { value: 'UPS', label: 'UPS' },
    { value: 'Aramex', label: 'Aramex' },
    { value: 'SMSA', label: 'SMSA' },
    { value: 'Local', label: 'شركة محلية' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, pdfFile: file }));
      // محاكاة تحميل الملف
      setUploadedPdf({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    } else {
      alert('يرجى اختيار ملف PDF');
    }
  };

  const calculateEstimatedArrival = () => {
    if (formData.departureDate) {
      const departure = new Date(formData.departureDate);
      const arrival = new Date(departure);
      arrival.setDate(arrival.getDate() + 15); // إضافة 15 يوم كمتوسط
      setFormData(prev => ({
        ...prev,
        estimatedArrivalDate: arrival.toISOString().split('T')[0],
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.shippingCompanyName || !formData.containerNumber || !formData.departureDate) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);
    try {
      // محاكاة حفظ البيانات
      console.log('Shipping data:', formData);
      alert('تم حفظ بيانات الشحن بنجاح!');
      // إعادة تعيين النموذج
      setFormData({
        shippingCompanyName: '',
        containerNumber: '',
        shippingCost: 0,
        shippingCompanyProvider: 'DHL',
        departureDate: '',
        estimatedArrivalDate: '',
        notes: '',
        pdfFile: null,
      });
      setUploadedPdf(null);
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة الشحن</h1>
        <p className="text-gray-600 mt-2">تتبع الشحنات وإدارة بيانات الشحن</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نموذج الشحن */}
        <div className="lg:col-span-2 space-y-6">
          {/* معلومات الشركة */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                معلومات الشحن
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم شركة الشحن
                  </label>
                  <Input
                    value={formData.shippingCompanyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingCompanyName: e.target.value }))}
                    placeholder="مثال: شركة الشحن الدولية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الحاوية
                  </label>
                  <Input
                    value={formData.containerNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, containerNumber: e.target.value }))}
                    placeholder="مثال: CONT123456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قيمة الشحن
                  </label>
                  <Input
                    type="number"
                    value={formData.shippingCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingCost: parseFloat(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شركة الحاويات
                  </label>
                  <Select value={formData.shippingCompanyProvider} onValueChange={(value) => setFormData(prev => ({ ...prev, shippingCompanyProvider: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingProviders.map(provider => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* التواريخ */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                التواريخ والجدول الزمني
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ المغادرة
                  </label>
                  <Input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الوصول المتوقع
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={formData.estimatedArrivalDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedArrivalDate: e.target.value }))}
                    />
                    <Button
                      variant="outline"
                      onClick={calculateEstimatedArrival}
                      className="whitespace-nowrap"
                    >
                      حساب تلقائي
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 يمكنك استخدام الزر "حساب تلقائي" لحساب تاريخ الوصول المتوقع بناءً على تاريخ المغادرة
                </p>
              </div>
            </CardContent>
          </Card>

          {/* رفع ملف PDF */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع المستندات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      انقر هنا لرفع ملف PDF
                    </p>
                    <p className="text-xs text-gray-500">
                      أو اسحب الملف وأفلته هنا
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedPdf && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-red-600 font-bold text-xs">PDF</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{uploadedPdf.name}</p>
                      <p className="text-xs text-gray-500">تم التحميل بنجاح</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedPdf(null)}
                      className="text-red-600"
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* الملاحظات */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gray-100 rounded-t-lg">
              <CardTitle>ملاحظات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="أضف أي ملاحظات إضافية حول الشحنة..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* زر الحفظ */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg"
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ بيانات الشحن'}
          </Button>
        </div>

        {/* ملخص الشحن */}
        <div className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-purple-700">ملخص الشحن</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">شركة الشحن</p>
                <p className="text-lg font-bold text-gray-900">
                  {formData.shippingCompanyName || 'لم يتم تحديده'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">رقم الحاوية</p>
                <p className="text-lg font-bold text-gray-900">
                  {formData.containerNumber || 'لم يتم تحديده'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">قيمة الشحن</p>
                <p className="text-lg font-bold text-green-600">
                  {formData.shippingCost.toFixed(2)}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">شركة الحاويات</p>
                <p className="text-lg font-bold text-gray-900">
                  {shippingProviders.find(p => p.value === formData.shippingCompanyProvider)?.label}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">تاريخ المغادرة</p>
                <p className="text-lg font-bold text-gray-900">
                  {formData.departureDate || 'لم يتم تحديده'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">تاريخ الوصول المتوقع</p>
                <p className="text-lg font-bold text-blue-600">
                  {formData.estimatedArrivalDate || 'لم يتم تحديده'}
                </p>
              </div>

              {uploadedPdf && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-gray-600 text-sm">المستند المرفوع</p>
                  <p className="text-sm font-bold text-green-600">✓ {uploadedPdf.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
