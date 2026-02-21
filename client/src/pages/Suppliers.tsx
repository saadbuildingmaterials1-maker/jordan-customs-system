import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Package, 
  CreditCard,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: number;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "active" | "inactive" | "blocked";
}

interface Payment {
  id: number;
  supplierId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  status: string;
}

interface SupplierItem {
  id: number;
  supplierId: number;
  itemName: string;
  itemCode: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  category: string;
  status: string;
}

export default function Suppliers() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: 1,
      name: "محمد أحمد الخطيب",
      companyName: "شركة الخطيب للاستيراد والتصدير",
      phone: "00962795123456",
      email: "mohammed@alkhatib.com",
      address: "عمان - الأردن",
      totalAmount: 50000000, // 50,000 JOD in fils
      paidAmount: 30000000, // 30,000 JOD
      remainingAmount: 20000000, // 20,000 JOD
      status: "active"
    },
    {
      id: 2,
      name: "سارة عبدالله النابلسي",
      companyName: "مؤسسة النابلسي التجارية",
      phone: "00962796234567",
      email: "sara@nabulsi.com",
      address: "إربد - الأردن",
      totalAmount: 35000000,
      paidAmount: 35000000,
      remainingAmount: 0,
      status: "active"
    }
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 1,
      supplierId: 1,
      amount: 15000000,
      paymentDate: "2025-12-01",
      paymentMethod: "bank_transfer",
      referenceNumber: "TRX-2025-001",
      status: "completed"
    },
    {
      id: 2,
      supplierId: 1,
      amount: 15000000,
      paymentDate: "2025-12-10",
      paymentMethod: "check",
      referenceNumber: "CHK-12345",
      status: "completed"
    }
  ]);

  const [items, setItems] = useState<SupplierItem[]>([
    {
      id: 1,
      supplierId: 1,
      itemName: "مكثفات كهربائية",
      itemCode: "CAP-001",
      unitPrice: 5000, // 5 JOD in fils
      quantity: 1000,
      unit: "قطعة",
      category: "إلكترونيات",
      status: "active"
    },
    {
      id: 2,
      supplierId: 1,
      itemName: "مقاومات كهربائية",
      itemCode: "RES-001",
      unitPrice: 2000,
      quantity: 2000,
      unit: "قطعة",
      category: "إلكترونيات",
      status: "active"
    }
  ]);

  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // New supplier form
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    totalAmount: 0
  });

  // New payment form
  const [newPayment, setNewPayment] = useState({
    supplierId: 0,
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "bank_transfer",
    referenceNumber: ""
  });

  // New item form
  const [newItem, setNewItem] = useState({
    supplierId: 0,
    itemName: "",
    itemCode: "",
    unitPrice: 0,
    quantity: 0,
    unit: "قطعة",
    category: ""
  });

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.phone) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const supplier: Supplier = {
      id: suppliers.length + 1,
      ...newSupplier,
      totalAmount: newSupplier.totalAmount * 1000, // Convert to fils
      paidAmount: 0,
      remainingAmount: newSupplier.totalAmount * 1000,
      status: "active"
    };

    setSuppliers([...suppliers, supplier]);
    setShowAddSupplierDialog(false);
    setNewSupplier({
      name: "",
      companyName: "",
      phone: "",
      email: "",
      address: "",
      totalAmount: 0
    });

    toast({
      title: "تم الإضافة بنجاح",
      description: `تم إضافة المورد ${supplier.name}`
    });
  };

  const handleAddPayment = () => {
    if (!newPayment.supplierId || !newPayment.amount) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const payment: Payment = {
      id: payments.length + 1,
      ...newPayment,
      amount: newPayment.amount * 1000, // Convert to fils
      status: "completed"
    };

    setPayments([...payments, payment]);

    // Update supplier amounts
    const updatedSuppliers = suppliers.map(s => {
      if (s.id === newPayment.supplierId) {
        return {
          ...s,
          paidAmount: s.paidAmount + payment.amount,
          remainingAmount: s.remainingAmount - payment.amount
        };
      }
      return s;
    });
    setSuppliers(updatedSuppliers);

    setShowAddPaymentDialog(false);
    setNewPayment({
      supplierId: 0,
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "bank_transfer",
      referenceNumber: ""
    });

    toast({
      title: "تم التسجيل بنجاح",
      description: `تم تسجيل دفعة بقيمة ${(payment.amount / 1000).toFixed(3)} د.أ`
    });
  };

  const handleAddItem = () => {
    if (!newItem.supplierId || !newItem.itemName || !newItem.unitPrice) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const item: SupplierItem = {
      id: items.length + 1,
      ...newItem,
      unitPrice: newItem.unitPrice * 1000, // Convert to fils
      status: "active"
    };

    setItems([...items, item]);
    setShowAddItemDialog(false);
    setNewItem({
      supplierId: 0,
      itemName: "",
      itemCode: "",
      unitPrice: 0,
      quantity: 0,
      unit: "قطعة",
      category: ""
    });

    toast({
      title: "تم الإضافة بنجاح",
      description: `تم إضافة الصنف ${item.itemName}`
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500",
      inactive: "bg-gray-500",
      blocked: "bg-red-500"
    };
    const texts: Record<string, string> = {
      active: "نشط",
      inactive: "غير نشط",
      blocked: "محظور"
    };
    return <Badge className={`${colors[status]} text-white`}>{texts[status]}</Badge>;
  };

  const getPaymentMethodText = (method: string) => {
    const texts: Record<string, string> = {
      cash: "نقداً",
      bank_transfer: "حوالة بنكية",
      check: "شيك",
      credit_card: "بطاقة ائتمان",
      other: "أخرى"
    };
    return texts[method] || method;
  };

  // Calculate totals
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === "active").length;
  const totalAmount = suppliers.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPaid = suppliers.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalRemaining = suppliers.reduce((sum, s) => sum + s.remainingAmount, 0);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          إدارة الموردين
        </h1>
        <p className="text-muted-foreground mt-2">
          إدارة شاملة للموردين مع نظام الدفعات والأصناف
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSuppliers} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبلغ الإجمالي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalAmount / 1000).toLocaleString()} د.أ</div>
            <p className="text-xs text-muted-foreground mt-1">
              جميع المعاملات
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبلغ المدفوع</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(totalPaid / 1000).toLocaleString()} د.أ</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalPaid / totalAmount) * 100).toFixed(1)}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبلغ المتبقي</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{(totalRemaining / 1000).toLocaleString()} د.أ</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalRemaining / totalAmount) * 100).toFixed(1)}% من الإجمالي
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suppliers">الموردين</TabsTrigger>
          <TabsTrigger value="payments">الدفعات</TabsTrigger>
          <TabsTrigger value="items">الأصناف</TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>قائمة الموردين</CardTitle>
                  <CardDescription>إدارة معلومات الموردين والحسابات</CardDescription>
                </div>
                <Dialog open={showAddSupplierDialog} onOpenChange={setShowAddSupplierDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة مورد جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>إضافة مورد جديد</DialogTitle>
                      <DialogDescription>
                        أدخل معلومات المورد الجديد
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">اسم المورد *</Label>
                          <Input
                            id="name"
                            value={newSupplier.name}
                            onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                            placeholder="محمد أحمد"
                          />
                        </div>
                        <div>
                          <Label htmlFor="companyName">اسم الشركة</Label>
                          <Input
                            id="companyName"
                            value={newSupplier.companyName}
                            onChange={(e) => setNewSupplier({...newSupplier, companyName: e.target.value})}
                            placeholder="شركة المورد التجارية"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">رقم الهاتف *</Label>
                          <Input
                            id="phone"
                            value={newSupplier.phone}
                            onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                            placeholder="00962795123456"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newSupplier.email}
                            onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                            placeholder="supplier@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">العنوان</Label>
                        <Textarea
                          id="address"
                          value={newSupplier.address}
                          onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                          placeholder="عمان - الأردن"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalAmount">المبلغ الإجمالي (د.أ)</Label>
                        <Input
                          id="totalAmount"
                          type="number"
                          step="0.001"
                          value={newSupplier.totalAmount}
                          onChange={(e) => setNewSupplier({...newSupplier, totalAmount: parseFloat(e.target.value) || 0})}
                          placeholder="0.000"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button variant="outline" onClick={() => setShowAddSupplierDialog(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleAddSupplier} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        حفظ
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الشركة</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>المبلغ الإجمالي</TableHead>
                      <TableHead>المدفوع</TableHead>
                      <TableHead>المتبقي</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier, index) => (
                      <TableRow key={supplier.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-semibold">{supplier.name}</TableCell>
                        <TableCell>{supplier.companyName}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell>{(supplier.totalAmount / 1000).toLocaleString()} د.أ</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {(supplier.paidAmount / 1000).toLocaleString()} د.أ
                        </TableCell>
                        <TableCell className="text-orange-600 font-semibold">
                          {(supplier.remainingAmount / 1000).toLocaleString()} د.أ
                        </TableCell>
                        <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSupplier(supplier)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>سجل الدفعات</CardTitle>
                  <CardDescription>جميع الدفعات المسجلة للموردين</CardDescription>
                </div>
                <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CreditCard className="h-4 w-4 mr-2" />
                      تسجيل دفعة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
                      <DialogDescription>
                        أدخل تفاصيل الدفعة
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="supplierId">المورد *</Label>
                        <Select 
                          value={newPayment.supplierId.toString()} 
                          onValueChange={(value) => setNewPayment({...newPayment, supplierId: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المورد" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map(s => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name} - متبقي: {(s.remainingAmount / 1000).toFixed(3)} د.أ
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="amount">المبلغ (د.أ) *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.001"
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentDate">تاريخ الدفع *</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={newPayment.paymentDate}
                          onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentMethod">طريقة الدفع *</Label>
                        <Select 
                          value={newPayment.paymentMethod} 
                          onValueChange={(value) => setNewPayment({...newPayment, paymentMethod: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">نقداً</SelectItem>
                            <SelectItem value="bank_transfer">حوالة بنكية</SelectItem>
                            <SelectItem value="check">شيك</SelectItem>
                            <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="referenceNumber">رقم المرجع</Label>
                        <Input
                          id="referenceNumber"
                          value={newPayment.referenceNumber}
                          onChange={(e) => setNewPayment({...newPayment, referenceNumber: e.target.value})}
                          placeholder="TRX-2025-001"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleAddPayment} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        حفظ
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>المورد</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead>رقم المرجع</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment, index) => {
                      const supplier = suppliers.find(s => s.id === payment.supplierId);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-semibold">{supplier?.name}</TableCell>
                          <TableCell className="text-green-600 font-bold">
                            {(payment.amount / 1000).toLocaleString()} د.أ
                          </TableCell>
                          <TableCell>{payment.paymentDate}</TableCell>
                          <TableCell>{getPaymentMethodText(payment.paymentMethod)}</TableCell>
                          <TableCell>{payment.referenceNumber}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500 text-white">مكتمل</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>أصناف الموردين</CardTitle>
                  <CardDescription>إدارة الأصناف المتوفرة لدى الموردين</CardDescription>
                </div>
                <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Package className="h-4 w-4 mr-2" />
                      إضافة صنف جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة صنف جديد</DialogTitle>
                      <DialogDescription>
                        أدخل معلومات الصنف
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="itemSupplierId">المورد *</Label>
                        <Select 
                          value={newItem.supplierId.toString()} 
                          onValueChange={(value) => setNewItem({...newItem, supplierId: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المورد" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map(s => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="itemName">اسم الصنف *</Label>
                          <Input
                            id="itemName"
                            value={newItem.itemName}
                            onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
                            placeholder="مكثفات كهربائية"
                          />
                        </div>
                        <div>
                          <Label htmlFor="itemCode">كود الصنف</Label>
                          <Input
                            id="itemCode"
                            value={newItem.itemCode}
                            onChange={(e) => setNewItem({...newItem, itemCode: e.target.value})}
                            placeholder="CAP-001"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unitPrice">سعر الوحدة (د.أ) *</Label>
                          <Input
                            id="unitPrice"
                            type="number"
                            step="0.001"
                            value={newItem.unitPrice}
                            onChange={(e) => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">الفئة</Label>
                          <Input
                            id="category"
                            value={newItem.category}
                            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                            placeholder="إلكترونيات"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quantity">الكمية</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit">الوحدة</Label>
                          <Input
                            id="unit"
                            value={newItem.unit}
                            onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                            placeholder="قطعة"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        حفظ
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>المورد</TableHead>
                      <TableHead>اسم الصنف</TableHead>
                      <TableHead>الكود</TableHead>
                      <TableHead>سعر الوحدة</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>الوحدة</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const supplier = suppliers.find(s => s.id === item.supplierId);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-semibold">{supplier?.name}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.itemCode}</TableCell>
                          <TableCell className="font-semibold">
                            {(item.unitPrice / 1000).toFixed(3)} د.أ
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500 text-white">نشط</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
