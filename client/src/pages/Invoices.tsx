import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Download, Send, Archive, Trash2, Eye, Edit2, DollarSign } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';

/**
 * صفحة إدارة الفواتير الإلكترونية
 * Advanced Electronic Invoicing System Page
 */

export default function InvoicesPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');

  // Fetch invoices
  const { data: invoices, isLoading, refetch } = trpc.invoice.list.useQuery({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    paymentStatus: filterPaymentStatus !== 'all' ? filterPaymentStatus : undefined,
  });

  // Mutations
  const createMutation = trpc.invoice.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم إنشاء الفاتورة بنجاح',
      });
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إنشاء الفاتورة',
        variant: 'destructive',
      });
    },
  });

  const sendMutation = trpc.invoice.send.useMutation({
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم إرسال الفاتورة بنجاح',
      });
      refetch();
    },
  });

  const archiveMutation = trpc.invoice.archive.useMutation({
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم أرشفة الفاتورة بنجاح',
      });
      refetch();
    },
  });

  const deleteMutation = trpc.invoice.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف الفاتورة بنجاح',
      });
      refetch();
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'مسودة', variant: 'secondary' },
      sent: { label: 'مرسلة', variant: 'default' },
      viewed: { label: 'مشاهدة', variant: 'default' },
      paid: { label: 'مدفوعة', variant: 'default' },
      overdue: { label: 'متأخرة', variant: 'destructive' },
      cancelled: { label: 'ملغاة', variant: 'destructive' },
    };
    const config = statusMap[status] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      unpaid: { label: 'غير مدفوعة', variant: 'destructive' },
      partial: { label: 'جزئي', variant: 'secondary' },
      paid: { label: 'مدفوعة', variant: 'default' },
      refunded: { label: 'مسترجعة', variant: 'outline' },
    };
    const config = statusMap[status] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">الفواتير الإلكترونية</h1>
          <p className="text-gray-600 mt-2">إدارة الفواتير والدفعات والأرشفة الآمنة</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
              <DialogDescription>
                ملء النموذج لإنشاء فاتورة إلكترونية جديدة
              </DialogDescription>
            </DialogHeader>
            <CreateInvoiceForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                refetch();
              }}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length || 0}</div>
            <p className="text-xs text-gray-600">فاتورة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المدفوعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter((inv: any) => inv.paymentStatus === 'paid').length || 0}
            </div>
            <p className="text-xs text-gray-600">مدفوعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter((inv: any) => inv.paymentStatus === 'unpaid').length || 0}
            </div>
            <p className="text-xs text-gray-600">غير مدفوعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الإجمالي المستحق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices
                ?.filter((inv: any) => inv.paymentStatus === 'unpaid')
                .reduce((sum: number, inv: any) => sum + parseFloat(inv.totalAmount || 0), 0)
                .toFixed(2) || '0.00'} د.ا
            </div>
            <p className="text-xs text-gray-600">دينار أردني</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>التصفية والبحث</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>حالة الفاتورة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="sent">مرسلة</SelectItem>
                  <SelectItem value="viewed">مشاهدة</SelectItem>
                  <SelectItem value="paid">مدفوعة</SelectItem>
                  <SelectItem value="overdue">متأخرة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>حالة الدفع</Label>
              <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="unpaid">غير مدفوعة</SelectItem>
                  <SelectItem value="partial">جزئي</SelectItem>
                  <SelectItem value="paid">مدفوعة</SelectItem>
                  <SelectItem value="refunded">مسترجعة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>البحث</Label>
              <Input placeholder="رقم الفاتورة أو اسم العميل..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>
            إدارة وتتبع جميع الفواتير الإلكترونية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الدفع</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.recipientName}</TableCell>
                      <TableCell>
                        {new Date(invoice.invoiceDate).toLocaleDateString('ar-JO')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {parseFloat(invoice.totalAmount).toFixed(2)} د.ا
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(invoice.paymentStatus)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendMutation.mutate({ invoiceId: invoice.id })}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => archiveMutation.mutate({ invoiceId: invoice.id })}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate({ invoiceId: invoice.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              لا توجد فواتير حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * نموذج إنشاء فاتورة جديدة
 * Create Invoice Form Component
 */
function CreateInvoiceForm({
  onSuccess,
  isLoading,
}: {
  onSuccess: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    recipientAddress: '',
    description: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      {
        description: '',
        quantity: 1,
        unit: 'عدد',
        unitPrice: 0,
        taxRate: 16,
        customsDutyRate: 0,
      },
    ],
    paymentMethod: 'bank_transfer' as const,
    shippingCost: 0,
    discountAmount: 0,
    notes: '',
  });

  const createMutation = trpc.invoice.create.useMutation({
    onSuccess,
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: '',
          quantity: 1,
          unit: 'عدد',
          unitPrice: 0,
          taxRate: 16,
          customsDutyRate: 0,
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      dueDate: new Date(formData.dueDate),
      items: formData.items.map((item) => ({
        ...item,
        quantity: parseFloat(item.quantity.toString()),
        unitPrice: parseFloat(item.unitPrice.toString()),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="recipient" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recipient">المستقبل</TabsTrigger>
          <TabsTrigger value="items">العناصر</TabsTrigger>
          <TabsTrigger value="other">أخرى</TabsTrigger>
        </TabsList>

        <TabsContent value="recipient" className="space-y-4">
          <div>
            <Label>اسم المستقبل</Label>
            <Input
              required
              value={formData.recipientName}
              onChange={(e) =>
                setFormData({ ...formData, recipientName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input
              required
              type="email"
              value={formData.recipientEmail}
              onChange={(e) =>
                setFormData({ ...formData, recipientEmail: e.target.value })
              }
            />
          </div>
          <div>
            <Label>الهاتف</Label>
            <Input
              value={formData.recipientPhone}
              onChange={(e) =>
                setFormData({ ...formData, recipientPhone: e.target.value })
              }
            />
          </div>
          <div>
            <Label>العنوان</Label>
            <Input
              value={formData.recipientAddress}
              onChange={(e) =>
                setFormData({ ...formData, recipientAddress: e.target.value })
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          {formData.items.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الوصف</Label>
                    <Input
                      required
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].description = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                    />
                  </div>
                  <div>
                    <Label>الكمية</Label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].quantity = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, items: newItems });
                      }}
                    />
                  </div>
                  <div>
                    <Label>الوحدة</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].unit = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                    />
                  </div>
                  <div>
                    <Label>السعر</Label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, items: newItems });
                      }}
                    />
                  </div>
                </div>
                {formData.items.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                  >
                    حذف العنصر
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة عنصر
          </Button>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <div>
            <Label>تاريخ الاستحقاق</Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>
          <div>
            <Label>طريقة الدفع</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value: any) =>
                setFormData({ ...formData, paymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="check">شيك</SelectItem>
                <SelectItem value="cash">نقداً</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>تكلفة الشحن</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.shippingCost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shippingCost: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div>
            <Label>الخصم</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.discountAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountAmount: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div>
            <Label>ملاحظات</Label>
            <Input
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'جاري الإنشاء...' : 'إنشاء الفاتورة'}
        </Button>
      </div>
    </form>
  );
}
