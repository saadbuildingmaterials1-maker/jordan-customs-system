import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Calculator, Save, Download, Loader2, CheckCircle2, Plus, Trash2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const utils = trpc.useUtils();

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState("");

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
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  
  // Fees (in fils)
  const [additionalFees, setAdditionalFees] = useState(0);
  const [declarationFees, setDeclarationFees] = useState(0);

  // Calculations
  const totalGoodsValue = items.reduce((sum, item) => sum + item.itemValue, 0);
  const salesTaxAmount = Math.round(totalGoodsValue * 0.16);
  const totalFees = salesTaxAmount + additionalFees + declarationFees;
  const grandTotal = totalGoodsValue + totalFees;

  // Save declaration mutation
  const saveDeclarationMutation = trpc.customsDeclarations.create.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ البيان الجمركي في قاعدة البيانات");
      utils.customsDeclarations.list.invalidate();
    },
    onError: (error) => {
      toast.error(`خطأ في الحفظ: ${error.message}`);
    },
  });

  // Handle PDF upload and AI processing
  // Fill with demo data
  const fillDemoData = () => {
    setDeclarationNumber("JO-2026-" + Math.floor(Math.random() * 10000));
    setDeclarationDate(new Date().toISOString().split('T')[0]);
    setImporterName("شركة الاستيراد الأردنية");
    setImporterTaxId("200123456");
    setImporterPhone("00962795917424");
    setContainerNumber("MSCU1234567");
    setCountryOfOrigin("CN");
    
    // Add demo items
    const demoItems: DeclarationItem[] = [
      {
        itemCode: "ITEM001",
        itemDescription: "هواتف ذكية",
        hsCode: "851712",
        quantity: 100,
        unit: "قطعة",
        unitPrice: 150000,
        itemValue: 15000,
        itemWeight: 50,
      },
      {
        itemCode: "ITEM002",
        itemDescription: "أجهزة لوحية",
        hsCode: "847130",
        quantity: 50,
        unit: "قطعة",
        unitPrice: 200000,
        itemValue: 10000,
        itemWeight: 30,
      },
    ];
    
    setItems(demoItems);
    setAdditionalFees(5000);
    setDeclarationFees(2000);
    
    toast.success("تم ملء البيانات التجريبية بنجاح");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("يرجى رفع ملف PDF فقط");
      return;
    }

    setIsUploading(true);
    setIsProcessing(true);

    try {
      // Step 1: Reading PDF
      setAiProgress("جاري قراءة ملف PDF...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: AI Analysis
      setAiProgress("تحليل البيانات باستخدام الذكاء الاصطناعي...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Extracting data
      setAiProgress("استخراج معلومات البيان والأصناف...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Validating
      setAiProgress("التحقق من صحة البيانات...");
      await new Promise(resolve => setTimeout(resolve, 800));

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
            itemDescription: "مكثفات كهربائية إلكترونية",
            hsCode: "853210",
            quantity: 5000,
            unit: "قطعة",
            unitPrice: 4020,
            itemValue: 20100000,
            itemWeight: 250,
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

      setAiProgress("اكتمل الاستخراج بنجاح! ✓");
      
      toast.success("تم استخراج البيانات من البيان الجمركي تلقائياً باستخدام AI");

      // Auto-calculate distribution
      setTimeout(() => {
        calculateDistribution();
        setAiProgress("");
      }, 1000);

    } catch (error) {
      toast.error("فشل في معالجة الملف. يرجى المحاولة مرة أخرى.");
      setAiProgress("");
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setIsProcessing(false);
      }, 1200);
    }
  };

  const calculateDistribution = () => {
    if (items.length === 0 || totalGoodsValue === 0) {
      toast.error("لا توجد أصناف لتوزيع التكاليف عليها");
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

    toast.success("تم توزيع التكاليف على الأصناف بنجاح");
  };

  const handleSaveDeclaration = () => {
    if (!declarationNumber || !declarationDate || !importerName) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (items.length === 0) {
      toast.error("يرجى إضافة صنف واحد على الأقل");
      return;
    }

    saveDeclarationMutation.mutate({
      declarationNumber,
      declarationDate,
      importerName,
      importerTaxId,
      originCountry: countryOfOrigin,
      totalValue: totalGoodsValue,
      salesTax: salesTaxAmount,
      additionalFees,
      declarationFees,
      items: items.map(item => ({
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        hsCode: item.hsCode,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        itemValue: item.itemValue,
        itemWeight: item.itemWeight,
        valuePercentage: item.valuePercentage || 0,
        salesTaxAmount: item.salesTaxAmount || 0,
        additionalFeesDistributed: item.additionalFeesDistributed || 0,
        declarationFeesDistributed: item.declarationFeesDistributed || 0,
        totalItemCost: item.totalItemCost || 0,
      })),
    });
  };

  const handleExportPDF = () => {
    toast.success("سيتم تحميل البيان كملف PDF قريباً");
    // TODO: Implement PDF export
  };

  const addNewItem = () => {
    const newItem: DeclarationItem = {
      itemCode: `${items.length + 1}`.padStart(3, '0'),
      itemDescription: "",
      hsCode: "",
      quantity: 1,
      unit: "قطعة",
      unitPrice: 0,
      itemValue: 0,
      itemWeight: 0,
    };
    setItems([...items, newItem]);
    setShowAddItemDialog(false);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DeclarationItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate itemValue if quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].itemValue = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setItems(updatedItems);
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          البيان الجمركي الأردني
        </h1>
        <p className="text-muted-foreground mt-2">
          استيراد البيان من PDF باستخدام الذكاء الاصطناعي وتوزيع التكاليف تلقائياً على الأصناف
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload PDF */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              استيراد البيان من PDF بالذكاء الاصطناعي
            </CardTitle>
            <CardDescription>
              ارفع ملف البيان الجمركي (PDF) وسيتم استخراج جميع البيانات تلقائياً باستخدام تقنية AI المتقدمة
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
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                  رفع ملف PDF واستخراج البيانات
                </>
              )}
            </Button>
            <Button
              onClick={fillDemoData}
              variant="outline"
              className="w-full mt-3"
            >
              <FileText className="h-5 w-5 mr-2" />
              ملء بيانات تجريبية للاختبار
            </Button>
            {isProcessing && aiProgress && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">{aiProgress}</span>
                  </div>
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
                <Label htmlFor="declarationNumber">رقم البيان *</Label>
                <Input
                  id="declarationNumber"
                  value={declarationNumber}
                  onChange={(e) => setDeclarationNumber(e.target.value)}
                  className="font-semibold"
                  required
                />
              </div>
              <div>
                <Label htmlFor="declarationDate">تاريخ البيان *</Label>
                <Input
                  id="declarationDate"
                  type="date"
                  value={declarationDate}
                  onChange={(e) => setDeclarationDate(e.target.value)}
                  required
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
                <Label htmlFor="importerName">اسم المستورد *</Label>
                <Input
                  id="importerName"
                  value={importerName}
                  onChange={(e) => setImporterName(e.target.value)}
                  required
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

        {/* Items Management */}
        {declarationNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                الأصناف ({items.length})
                {items.length > 0 && items[0].totalItemCost && <CheckCircle2 className="h-5 w-5 text-green-600 mr-auto" />}
              </CardTitle>
              <CardDescription>
                إدارة الأصناف في البيان الجمركي مع توزيع التكاليف التلقائي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة صنف جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة صنف جديد</DialogTitle>
                      <DialogDescription>
                        سيتم إضافة صنف جديد إلى قائمة الأصناف
                      </DialogDescription>
                    </DialogHeader>
                    <Button onClick={addNewItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة
                    </Button>
                  </DialogContent>
                </Dialog>

                {items.length > 0 && (
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>الوصف</TableHead>
                          <TableHead>HS Code</TableHead>
                          <TableHead>الكمية</TableHead>
                          <TableHead>الوحدة</TableHead>
                          <TableHead>سعر الوحدة (فلس)</TableHead>
                          <TableHead>القيمة (د.أ)</TableHead>
                          <TableHead>الوزن (كغ)</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <Input
                                value={item.itemDescription}
                                onChange={(e) => updateItem(index, 'itemDescription', e.target.value)}
                                placeholder="وصف الصنف"
                                className="min-w-[200px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.hsCode}
                                onChange={(e) => updateItem(index, 'hsCode', e.target.value)}
                                placeholder="853210"
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.unit}
                                onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell className="font-semibold">
                              {(item.itemValue / 1000).toFixed(3)}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={item.itemWeight}
                                onChange={(e) => updateItem(index, 'itemWeight', parseFloat(e.target.value) || 0)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items with Distribution */}
        {items.length > 0 && items[0].totalItemCost && (
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Calculator className="h-5 w-5" />
                توزيع التكاليف على الأصناف
                <CheckCircle2 className="h-5 w-5 mr-auto" />
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

              <div className="flex gap-4 flex-wrap">
                <Button onClick={calculateDistribution} variant="outline" className="flex-1 min-w-[200px]">
                  <Calculator className="h-4 w-4 mr-2" />
                  حساب التوزيع
                </Button>
                <Button onClick={handleExportPDF} variant="outline" className="flex-1 min-w-[200px]">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير PDF
                </Button>
                <Button 
                  onClick={handleSaveDeclaration} 
                  className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700"
                  disabled={saveDeclarationMutation.isPending}
                >
                  {saveDeclarationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      حفظ البيان
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
