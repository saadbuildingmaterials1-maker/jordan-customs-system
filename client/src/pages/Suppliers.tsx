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
  AlertCircle,
  Search,
  Download,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";

interface Supplier {
  id: number;
  name: string;
  companyName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "active" | "inactive" | "blocked";
}

export default function Suppliers() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  
  // Fetch suppliers
  const { data: suppliers = [], isLoading } = trpc.suppliers.list.useQuery();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // New supplier form
  const [newSupplier, setNewSupplier] = useState<{
    name: string;
    companyName: string;
    phone: string;
    email: string;
    address: string;
    totalAmount: number;
    status: "active" | "inactive" | "blocked";
  }>({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    totalAmount: 0,
    status: "active"
  });

  // New payment form
  const [newPayment, setNewPayment] = useState({
    supplierId: 0,
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "cash",
    referenceNumber: "",
    notes: ""
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

  // Mutations
  const createSupplier = trpc.suppliers.create.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      setShowAddSupplierDialog(false);
      setNewSupplier({
        name: "",
        companyName: "",
        phone: "",
        email: "",
        address: "",
        totalAmount: 0,
        status: "active"
      });
      toast.success("تم إضافة المورد بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    }
  });

  const updateSupplier = trpc.suppliers.update.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      setSelectedSupplier(null);
      toast.success("تم تحديث المورد بنجاح");
    }
  });

  const deleteSupplier = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      toast.success("تم حذف المورد بنجاح");
    }
  });

  const addPayment = trpc.suppliers.addPayment.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      setShowAddPaymentDialog(false);
      setNewPayment({
        supplierId: 0,
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: "cash",
        referenceNumber: "",
        notes: ""
      });
      toast.success("تم تسجيل الدفعة بنجاح");
    }
  });

  const addItem = trpc.suppliers.addItem.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
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
      toast.success("تم إضافة الصنف بنجاح");
    }
  });

  // Handlers
  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.companyName || !newSupplier.phone) {
      toast.error("خطأ: الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    createSupplier.mutate({
      ...newSupplier,
      totalAmount: Math.round(newSupplier.totalAmount * 100), // Convert to fils
    });
  };

  const handleAddPayment = () => {
    if (!newPayment.supplierId || newPayment.amount <= 0) {
      toast.error("خطأ: الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    addPayment.mutate({
      ...newPayment,
      amount: Math.round(newPayment.amount * 100), // Convert to fils
    });
  };

  const handleAddItem = () => {
    if (!newItem.supplierId || !newItem.itemName || newItem.unitPrice <= 0) {
      toast.error("خطأ: الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    addItem.mutate({
      ...newItem,
      unitPrice: Math.round(newItem.unitPrice * 100), // Convert to fils
    });
  };

  const handleDeleteSupplier = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المورد؟")) {
      deleteSupplier.mutate({ id });
    }
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === "active").length;
  const totalAmount = suppliers.reduce((sum, s) => sum + s.totalAmount, 0);
  const paidAmount = suppliers.reduce((sum, s) => sum + s.paidAmount, 0);
  const remainingAmount = suppliers.reduce((sum, s) => sum + s.remainingAmount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-JO', {
      style: 'currency',
      currency: 'JOD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 ml-1" />نشط</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500"><AlertCircle className="h-3 w-3 ml-1" />غير نشط</Badge>;
      case "blocked":
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 ml-1" />محظور</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-purple-600" />
            إدارة الموردين
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة شاملة للموردين والدفعات والأصناف
          </p>
        </div>
        <Dialog open={showAddSupplierDialog} onOpenChange={setShowAddSupplierDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
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
                  <Label htmlFor="companyName">اسم الشركة *</Label>
                  <Input
                    id="companyName"
                    value={newSupplier.companyName}
                    onChange={(e) => setNewSupplier({...newSupplier, companyName: e.target.value})}
                    placeholder="شركة التجارة"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalAmount">المبلغ الإجمالي (دينار)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={newSupplier.totalAmount}
                    onChange={(e) => setNewSupplier({...newSupplier, totalAmount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select 
                    value={newSupplier.status} 
                    onValueChange={(value) => setNewSupplier({...newSupplier, status: value as "active" | "inactive" | "blocked"})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="blocked">محظور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddSupplierDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddSupplier} disabled={createSupplier.isPending}>
                {createSupplier.isPending ? "جاري الإضافة..." : "إضافة المورد"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الموردين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSuppliers} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المبلغ الإجمالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 ml-1" />
              إجمالي المستحقات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المبلغ المدفوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المبلغ المتبقي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(remainingAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              مستحق الدفع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              نسبة السداد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن مورد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="blocked">محظور</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suppliers">
            <Users className="h-4 w-4 mr-2" />
            الموردين
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            الدفعات
          </TabsTrigger>
          <TabsTrigger value="items">
            <Package className="h-4 w-4 mr-2" />
            الأصناف
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الموردين</CardTitle>
              <CardDescription>
                {filteredSuppliers.length} مورد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المورد</TableHead>
                    <TableHead>الشركة</TableHead>
                    <TableHead>التواصل</TableHead>
                    <TableHead>المبلغ الإجمالي</TableHead>
                    <TableHead>المدفوع</TableHead>
                    <TableHead>المتبقي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.companyName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </div>
                          {supplier.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(supplier.totalAmount)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(supplier.paidAmount)}</TableCell>
                      <TableCell className="text-orange-600">{formatCurrency(supplier.remainingAmount)}</TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewPayment({...newPayment, supplierId: supplier.id});
                              setShowAddPaymentDialog(true);
                            }}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            disabled={deleteSupplier.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>سجل الدفعات</CardTitle>
                  <CardDescription>جميع الدفعات المسجلة</CardDescription>
                </div>
                <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      تسجيل دفعة
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
                        <Label htmlFor="paymentSupplierId">المورد *</Label>
                        <Select 
                          value={newPayment.supplierId.toString()} 
                          onValueChange={(value) => setNewPayment({...newPayment, supplierId: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المورد" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name} - {supplier.companyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="paymentAmount">المبلغ (دينار) *</Label>
                          <Input
                            id="paymentAmount"
                            type="number"
                            value={newPayment.amount}
                            onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value) || 0})}
                            placeholder="0.00"
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
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
                              <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
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
                            placeholder="TRX-001"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="paymentNotes">ملاحظات</Label>
                        <Textarea
                          id="paymentNotes"
                          value={newPayment.notes}
                          onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                          placeholder="ملاحظات إضافية..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleAddPayment} disabled={addPayment.isPending}>
                        {addPayment.isPending ? "جاري التسجيل..." : "تسجيل الدفعة"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                لا توجد دفعات مسجلة حالياً
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name} - {supplier.companyName}
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
                          <Label htmlFor="itemCode">رمز الصنف</Label>
                          <Input
                            id="itemCode"
                            value={newItem.itemCode}
                            onChange={(e) => setNewItem({...newItem, itemCode: e.target.value})}
                            placeholder="CAP-001"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="unitPrice">سعر الوحدة (دينار) *</Label>
                          <Input
                            id="unitPrice"
                            type="number"
                            value={newItem.unitPrice}
                            onChange={(e) => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quantity">الكمية *</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit">الوحدة *</Label>
                          <Input
                            id="unit"
                            value={newItem.unit}
                            onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                            placeholder="قطعة"
                          />
                        </div>
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
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleAddItem} disabled={addItem.isPending}>
                        {addItem.isPending ? "جاري الإضافة..." : "إضافة الصنف"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                لا توجد أصناف مسجلة حالياً
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
