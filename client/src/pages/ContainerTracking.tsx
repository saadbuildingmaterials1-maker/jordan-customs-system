import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Ship, MapPin, Calendar, CheckCircle2 } from "lucide-react";

export default function ContainerTracking() {
  const [containerNumber, setContainerNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingData({
        containerNumber: "EMIV CHNXIN006881",
        status: "customs_clearance",
        vessel: "TIANJIN YINGXINTAI",
        voyage: "195288",
        portOfLoading: "الصين - تيانجين",
        portOfDischarge: "الأردن - العقبة",
        estimatedArrival: "2025-12-14",
        actualArrival: "2025-12-14",
        events: [
          {
            date: "2025-11-25",
            location: "الصين - تيانجين",
            status: "تم التحميل",
            description: "تم تحميل الحاوية على السفينة",
          },
          {
            date: "2025-12-05",
            location: "في البحر",
            status: "في الطريق",
            description: "الحاوية في طريقها إلى ميناء العقبة",
          },
          {
            date: "2025-12-14",
            location: "الأردن - العقبة",
            status: "وصلت",
            description: "وصلت الحاوية إلى ميناء العقبة",
          },
          {
            date: "2025-12-15",
            location: "جمرك العقبة",
            status: "التخليص الجمركي",
            description: "جاري التخليص الجمركي - البيان رقم 89430",
          },
        ],
      });
      setIsSearching(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "booked": "bg-gray-500",
      "loaded": "bg-blue-500",
      "in_transit": "bg-purple-500",
      "arrived": "bg-green-500",
      "customs_clearance": "bg-orange-500",
      "released": "bg-teal-500",
      "delivered": "bg-emerald-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      "booked": "محجوز",
      "loaded": "تم التحميل",
      "in_transit": "في الطريق",
      "arrived": "وصلت",
      "customs_clearance": "التخليص الجمركي",
      "released": "تم الإفراج",
      "delivered": "تم التسليم",
    };
    return texts[status] || status;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">تتبع الحاويات</h1>
        <p className="text-muted-foreground mt-2">
          تتبع حاوياتك في الوقت الفعلي من الميناء إلى الوصول
        </p>
      </div>

      {/* Search Box */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث عن حاوية
          </CardTitle>
          <CardDescription>
            أدخل رقم الحاوية للحصول على معلومات التتبع الكاملة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="containerNumber">رقم الحاوية</Label>
              <Input
                id="containerNumber"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value)}
                placeholder="مثال: EMIV CHNXIN006881"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={!containerNumber || isSearching}>
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "جاري البحث..." : "بحث"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {trackingData && (
        <div className="grid gap-6">
          {/* Container Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                معلومات الحاوية
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">رقم الحاوية</Label>
                <p className="text-lg font-semibold">{trackingData.containerNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">الحالة</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(trackingData.status)}>
                    {getStatusText(trackingData.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">السفينة</Label>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  {trackingData.vessel}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">رقم الرحلة</Label>
                <p className="text-lg font-semibold">{trackingData.voyage}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">ميناء التحميل</Label>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {trackingData.portOfLoading}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">ميناء الوصول</Label>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {trackingData.portOfDischarge}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">الوصول المتوقع</Label>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {trackingData.estimatedArrival}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">الوصول الفعلي</Label>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {trackingData.actualArrival || "لم تصل بعد"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>سجل التتبع</CardTitle>
              <CardDescription>
                تاريخ حركة الحاوية من التحميل إلى الوصول
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-border" />

                {/* Timeline Events */}
                <div className="space-y-6">
                  {trackingData.events.map((event: any, index: number) => (
                    <div key={index} className="relative flex gap-4">
                      {/* Timeline Dot */}
                      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-primary">
                        <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                      </div>

                      {/* Event Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-lg">{event.status}</h3>
                          <Badge variant="outline">{event.date}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {event.location}
                        </p>
                        <p className="text-sm">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customs Declaration Info */}
          <Card>
            <CardHeader>
              <CardTitle>البيان الجمركي</CardTitle>
              <CardDescription>
                معلومات البيان الجمركي المرتبط بهذه الحاوية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">رقم البيان</Label>
                  <p className="text-lg font-semibold">89430</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">تاريخ البيان</Label>
                  <p className="text-lg font-semibold">2025-12-14</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">قيمة البضاعة</Label>
                  <p className="text-lg font-semibold">20,100.00 د.أ</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">مجموع الرسوم</Label>
                  <p className="text-lg font-semibold text-blue-600">3,928.35 د.أ</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">التكلفة النهائية الإجمالية</Label>
                  <p className="text-2xl font-bold text-green-600">24,028.35 د.أ</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                عرض تفاصيل البيان الكاملة
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!trackingData && !isSearching && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ابدأ بتتبع حاويتك</h3>
            <p className="text-muted-foreground text-center max-w-md">
              أدخل رقم الحاوية في الحقل أعلاه للحصول على معلومات التتبع الكاملة
              بما في ذلك الموقع الحالي، تاريخ الحركة، والبيانات الجمركية
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
