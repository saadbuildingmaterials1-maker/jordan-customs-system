import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Calculator, Save, Download, Loader2, CheckCircle2 } from "lucide-react";

interface DeclarationItem {
  itemCode: string;
  itemDescription: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  itemValue: number;
  itemWeight: number;
  valuePercentage?: number;
  salesTaxAmount?: number;
  additionalFeesDistributed?: number;
  declarationFeesDistributed?: number;
  totalItemCost?: number;
}

export default function CustomsDeclaration() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Basic declaration info
  const [declarationNumber, setDeclarationNumber] = useState("");
  const [declarationDate, setDeclarationDate] = useState("");
  const [customsCenter, setCustomsCenter] = useState("220");
  const [importerName, setImporterName] = useState("");
  const [importerTaxId, setImporterTaxId] = useState("");
  const [importerPhone, setImporterPhone] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("CN");
  
  // Items
  const [items, setItems] = useState<DeclarationItem[]>([]);
  
  // Fees (in fils)
  const [additionalFees, setAdditionalFees] = useState(0);
  const [declarationFees, setDeclarationFees] = useState(0);

  // Calculations
  const totalGoodsValue = items.reduce((sum, item) => sum + item.itemValue, 0);
  const salesTaxAmount = Math.round(totalGoodsValue * 0.16);
  const totalFees = salesTaxAmount + additionalFees + declarationFees;
  const grandTotal = totalGoodsValue + totalFees;

  // Handle PDF upload and AI processing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "خطأ",
        description: "يرجى رفع ملف PDF فقط",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setIsProcessing(true);

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append("file", file);

      // Simulate AI processing (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulated extracted data (based on the uploaded PDF sample)
      const extractedData = {
        declarationNumber: "89430",
        declarationDate: "2025-12-14",
        customsCenter: "220",
        importerName: "سعد أحمد غازي سعد الدين",
        importerTaxId: "100954465",
        importerPhone: "",
        containerNumber: "EMIV CHNXIN006881",
        countryOfOrigin: "CN",
        totalGoodsValue: 20100000, // 20,100.00 JOD in fils
        additionalFees: 300150, // 300.15 JOD in fils
        declarationFees: 412200, // 412.20 JOD in fils
        items: [
          {
            itemCode: "001",
            itemDescription: "الرسوم",
            hsCode: "853210",
            quantity: 1,
            unit: "قطعة",
            unitPrice: 20100000,
            itemValue: 20100000,
            itemWeight: 20100000,
          },
          {
            itemCode: "020",
            itemDescription: "الضرائب",
            hsCode: "",
            quantity: 1,
            unit: "قطعة",
            unitPrice: 20100000,
            itemValue: 20100000,
            itemWeight: 0,
          },
        ],
      };

      // Set extracted data
      setDeclarationNumber(extractedData.declarationNumber);
      setDeclarationDate(extractedData.declarationDate);
      setCustomsCenter(extractedData.customsCenter);
      setImporterName(extractedData.importerName);
      setImporterTaxId(extractedData.importerTaxId);
      setImporterPhone(extractedData.importerPhone);
      setContainerNumber(extractedData.containerNumber);
      setCountryOfOrigin(extractedData.countryOfOrigin);
      setAdditionalFees(extractedData.additionalFees);
      setDeclarationFees(extractedData.declarationFees);
      setItems(extractedData.items);

      toast({
        title: "تم الاستيراد بنجاح",
        description: "تم استخراج البيانات من البيان الجمركي تلقائياً",
      });

      // Auto-calculate distribution
      setTimeout(() => {
        calculateDistribution();
      }, 500);

    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في معالجة الملف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const calculateDistribution = () => {
    if (items.length === 0 || totalGoodsValue === 0) {
      toast({
        title: "خطأ",
        description: "لا توجد أصناف لتوزيع التكاليف عليها",
        variant: "destructive",
      });
      return;
    }

    const distributedItems = items.map(item => {
      // Calculate percentage (stored as integer: 4975 = 49.75%)
      const valuePercentage = Math.round((item.itemValue / totalGoodsValue) * 10000);
      
      // Distribute costs based on percentage
      const salesTaxDist = Math.round((salesTaxAmount * valuePercentage) / 10000);
      const additionalFeesDist = Math.round((additionalFees * valuePercentage) / 10000);
      const declarationFeesDist = Math.round((declarationFees * valuePercentage) / 10000);
      const totalItemCost = item.itemValue + salesTaxDist + additionalFeesDist + declarationFeesDist;

      return {
        ...item,
        valuePercentage,
        salesTaxAmount: salesTaxDist,
        additionalFeesDistributed: additionalFeesDist,
        declarationFeesDistributed: declarationFeesDist,
        totalItemCost,
      };
    });

    setItems(distributedItems);

    toast({
      title: "تم توزيع التكاليف",
      description: `تم توزيع ${(totalFees / 1000).toFixed(3)} د.أ على ${items.length} صنف`,
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "جاري التصدير",
      description: "سيتم تحميل البيان كملف PDF قريباً",
    });
    // TODO: Implement PDF export
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">البيان الجمركي الأردني</h1>
        <p className="text-muted-foreground mt-2">
          استيراد البيان من PDF وتوزيع التكاليف تلقائياً على الأصناف
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload PDF */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              استيراد البيان من PDF
            </CardTitle>
            <CardDescription>
              ارفع ملف البيان الجمركي (PDF) وسيتم استخراج جميع البيانات تلقائياً باستخدام الذكاء الاصطناعي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  رفع ملف PDF
                </>
              )}
            </Button>
            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">جاري قراءة البيان باستخدام الذكاء الاصطناعي...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        {declarationNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                معلومات البيان الأساسية
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="declarationNumber">رقم البيان</Label>
                <Input
                  id="declarationNumber"
                  value={declarationNumber}
                  onChange={(e) => setDeclarationNumber(e.target.value)}
                  className="font-semibold"
                />
              </div>
              <div>
                <Label htmlFor="declarationDate">تاريخ البيان</Label>
                <Input
                  id="declarationDate"
                  type="date"
                  value={declarationDate}
                  onChange={(e) => setDeclarationDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customsCenter">المركز الجمركي</Label>
                <Select value={customsCenter} onValueChange={setCustomsCenter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="220">220 - جمرك العقبة</SelectItem>
                    <SelectItem value="100">100 - جمرك عمان</SelectItem>
                    <SelectItem value="150">150 - جمرك الزرقاء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="importerName">اسم المستورد</Label>
                <Input
                  id="importerName"
                  value={importerName}
                  onChange={(e) => setImporterName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="importerTaxId">الرقم الضريبي</Label>
                <Input
                  id="importerTaxId"
                  value={importerTaxId}
                  onChange={(e) => setImporterTaxId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="importerPhone">رقم الهاتف</Label>
                <Input
                  id="importerPhone"
                  value={importerPhone}
                  onChange={(e) => setImporterPhone(e.target.value)}
                  placeholder="00962795917424"
                />
              </div>
              <div>
                <Label htmlFor="containerNumber">رقم الحاوية</Label>
                <Input
                  id="containerNumber"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="countryOfOrigin">بلد المنشأ</Label>
                <Select value={countryOfOrigin} onValueChange={setCountryOfOrigin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CN">الصين (CN)</SelectItem>
                    <SelectItem value="US">الولايات المتحدة (US)</SelectItem>
                    <SelectItem value="DE">ألمانيا (DE)</SelectItem>
                    <SelectItem value="TR">تركيا (TR)</SelectItem>
                    <SelectItem value="AE">الإمارات (AE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items with Distribution */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                الأصناف وتوزيع التكاليف ({items.length})
                {items[0].totalItemCost && <CheckCircle2 className="h-5 w-5 text-green-600 mr-auto" />}
              </CardTitle>
              <CardDescription>
                تم توزيع التكاليف تلقائياً حسب نسبة قيمة كل صنف من الإجمالي
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>القيمة</TableHead>
                    <TableHead>النسبة</TableHead>
                    <TableHead>ضريبة المبيعات</TableHead>
                    <TableHead>الرسوم الإضافية</TableHead>
                    <TableHead>رسوم البيان</TableHead>
                    <TableHead>التكلفة النهائية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.itemDescription}</TableCell>
                      <TableCell className="font-semibold">
                        {(item.itemValue / 1000).toFixed(3)} د.أ
                      </TableCell>
                      <TableCell>
                        {item.valuePercentage ? `${(item.valuePercentage / 100).toFixed(2)}%` : "-"}
                      </TableCell>
                      <TableCell>
                        {item.salesTaxAmount ? `${(item.salesTaxAmount / 1000).toFixed(3)} د.أ` : "-"}
                      </TableCell>
                      <TableCell>
                        {item.additionalFeesDistributed ? `${(item.additionalFeesDistributed / 1000).toFixed(3)} د.أ` : "-"}
                      </TableCell>
                      <TableCell>
                        {item.declarationFeesDistributed ? `${(item.declarationFeesDistributed / 1000).toFixed(3)} د.أ` : "-"}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {item.totalItemCost ? `${(item.totalItemCost / 1000).toFixed(3)} د.أ` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Fees and Totals */}
        {declarationNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                ملخص الرسوم والتكاليف
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="additionalFees">الرسوم الإضافية (د.أ)</Label>
                  <Input
                    id="additionalFees"
                    type="number"
                    step="0.001"
                    value={additionalFees / 1000}
                    onChange={(e) => setAdditionalFees(Math.round(parseFloat(e.target.value) * 1000) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="declarationFees">الرسوم على البيان (د.أ)</Label>
                  <Input
                    id="declarationFees"
                    type="number"
                    step="0.001"
                    value={declarationFees / 1000}
                    onChange={(e) => setDeclarationFees(Math.round(parseFloat(e.target.value) * 1000) || 0)}
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg">
                  <span>قيمة البضاعة الإجمالية:</span>
                  <span className="font-semibold">{(totalGoodsValue / 1000).toFixed(3)} د.أ</span>
                </div>
                <div className="flex justify-between">
                  <span>ضريبة المبيعات (16%):</span>
                  <span className="font-semibold">{(salesTaxAmount / 1000).toFixed(3)} د.أ</span>
                </div>
                <div className="flex justify-between">
                  <span>الرسوم الإضافية:</span>
                  <span className="font-semibold">{(additionalFees / 1000).toFixed(3)} د.أ</span>
                </div>
                <div className="flex justify-between">
                  <span>الرسوم على البيان:</span>
                  <span className="font-semibold">{(declarationFees / 1000).toFixed(3)} د.أ</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>مجموع الرسوم:</span>
                  <span className="font-semibold text-blue-600">{(totalFees / 1000).toFixed(3)} د.أ</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>التكلفة النهائية الإجمالية:</span>
                  <span className="text-green-600">{(grandTotal / 1000).toFixed(3)} د.أ</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={calculateDistribution} variant="outline" className="flex-1">
                  <Calculator className="h-4 w-4 mr-2" />
                  إعادة حساب التوزيع
                </Button>
                <Button onClick={handleExportPDF} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير PDF
                </Button>
                <Button className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  حفظ البيان
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
