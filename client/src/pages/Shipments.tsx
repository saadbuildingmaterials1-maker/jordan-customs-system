import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Shipments() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: shipments, isLoading } = trpc.shipments.list.useQuery();

  const createMutation = trpc.shipments.create.useMutation({
    onSuccess: () => {
      toast({
        title: "تم إنشاء الشحنة بنجاح",
        description: "تم إضافة الشحنة إلى النظام",
      });
      setOpen(false);
      utils.shipments.list.invalidate();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createMutation.mutate({
      senderName: formData.get("senderName") as string,
      senderCountry: formData.get("senderCountry") as string,
      recipientName: formData.get("recipientName") as string,
      recipientAddress: formData.get("recipientAddress") as string,
      recipientPhone: formData.get("recipientPhone") as string,
      productType: formData.get("productType") as string,
      productValue: Number(formData.get("productValue")) * 100, // Convert to fils
      weight: Number(formData.get("weight")) * 1000, // Convert to grams
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "قيد الانتظار", variant: "secondary" },
      in_transit: { label: "في الطريق", variant: "default" },
      customs_clearance: { label: "التخليص الجمركي", variant: "outline" },
      out_for_delivery: { label: "خارج للتسليم", variant: "default" },
      delivered: { label: "تم التسليم", variant: "default" },
      cancelled: { label: "ملغي", variant: "destructive" },
    };

    const { label, variant } = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const filteredShipments = shipments?.filter((shipment) =>
    shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">إدارة الشحنات</h1>
          <p className="text-muted-foreground mt-2">عرض وإدارة جميع الشحنات</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              إضافة شحنة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة شحنة جديدة</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الشحنة الجديدة
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">اسم المرسل</Label>
                  <Input id="senderName" name="senderName" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderCountry">بلد المرسل</Label>
                  <Select name="senderCountry" required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر البلد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الصين">الصين</SelectItem>
                      <SelectItem value="الولايات المتحدة">الولايات المتحدة</SelectItem>
                      <SelectItem value="المملكة المتحدة">المملكة المتحدة</SelectItem>
                      <SelectItem value="ألمانيا">ألمانيا</SelectItem>
                      <SelectItem value="تركيا">تركيا</SelectItem>
                      <SelectItem value="الإمارات">الإمارات</SelectItem>
                      <SelectItem value="السعودية">السعودية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientName">اسم المستلم</Label>
                  <Input id="recipientName" name="recipientName" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">رقم هاتف المستلم</Label>
                  <Input id="recipientPhone" name="recipientPhone" type="tel" required />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="recipientAddress">عنوان المستلم</Label>
                  <Input id="recipientAddress" name="recipientAddress" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">نوع المنتج</Label>
                  <Select name="productType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="إلكترونيات">إلكترونيات (5%)</SelectItem>
                      <SelectItem value="ملابس">ملابس (15%)</SelectItem>
                      <SelectItem value="أحذية">أحذية (20%)</SelectItem>
                      <SelectItem value="مجوهرات">مجوهرات (25%)</SelectItem>
                      <SelectItem value="كتب">كتب (0%)</SelectItem>
                      <SelectItem value="أخرى">أخرى (10%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productValue">قيمة البضاعة (دينار)</Label>
                  <Input
                    id="productValue"
                    name="productValue"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">الوزن (كغ)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "جاري الإضافة..." : "إضافة الشحنة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            قائمة الشحنات
          </CardTitle>
          <CardDescription>
            {shipments?.length || 0} شحنة في النظام
          </CardDescription>

          <div className="relative mt-4">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم التتبع أو اسم المستلم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredShipments && filteredShipments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم التتبع</TableHead>
                  <TableHead>المستلم</TableHead>
                  <TableHead>بلد المرسل</TableHead>
                  <TableHead>نوع المنتج</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التكلفة الإجمالية</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono">{shipment.trackingNumber}</TableCell>
                    <TableCell>{shipment.recipientName}</TableCell>
                    <TableCell>{shipment.senderCountry}</TableCell>
                    <TableCell>{shipment.productType}</TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell>
                      {shipment.totalCost ? (shipment.totalCost / 100).toFixed(2) : "0.00"} د.أ
                    </TableCell>
                    <TableCell>
                      {new Date(shipment.createdAt).toLocaleDateString("ar-JO")}
                    </TableCell>
                    <TableCell>
                      <Link href={`/tracking?number=${shipment.trackingNumber}`}>
                        <Button variant="outline" size="sm">
                          تتبع
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد شحنات حالياً"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
