import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Ship, MapPin, Calendar, CheckCircle2, Clock, Bell, AlertCircle, TrendingUp, Anchor } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function ContainerTracking() {
  const { toast } = useToast();
  const [containerNumber, setContainerNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);

  const handleSearch = () => {
    if (!containerNumber.trim()) {
      toast.error("يرجى إدخال رقم الحاوية");
      return;
    }

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingData({
        containerNumber: containerNumber.toUpperCase(),
        status: "customs_clearance",
        vessel: "TIANJIN YINGXINTAI",
        voyage: "195288",
        portOfLoading: "الصين - تيانجين",
        portOfDischarge: "الأردن - العقبة",
        estimatedArrival: "2025-12-14",
        actualArrival: "2025-12-14",
        currentLocation: {
          lat: 29.5267,
          lng: 35.0081,
          name: "جمرك العقبة، الأردن"
        },
        progress: 85, // 85% complete
        daysInTransit: 19,
        daysRemaining: 2,
        events: [
          {
            date: "2025-11-25",
            time: "10:30",
            location: "الصين - تيانجين",
            status: "تم التحميل",
            description: "تم تحميل الحاوية على السفينة TIANJIN YINGXINTAI",
            icon: "loaded",
          },
          {
            date: "2025-11-26",
            time: "08:00",
            location: "الصين - تيانجين",
            status: "غادرت الميناء",
            description: "غادرت السفينة ميناء تيانجين متجهة إلى العقبة",
            icon: "departed",
          },
          {
            date: "2025-12-05",
            time: "14:20",
            location: "في البحر - المحيط الهندي",
            status: "في الطريق",
            description: "الحاوية في طريقها إلى ميناء العقبة - المسافة المتبقية 2,450 كم",
            icon: "in_transit",
          },
          {
            date: "2025-12-14",
            time: "06:45",
            location: "الأردن - العقبة",
            status: "وصلت",
            description: "وصلت الحاوية إلى ميناء العقبة بنجاح",
            icon: "arrived",
          },
          {
            date: "2025-12-14",
            time: "11:00",
            location: "ميناء العقبة",
            status: "تفريغ الحاوية",
            description: "تم تفريغ الحاوية من السفينة ونقلها إلى ساحة الحاويات",
            icon: "unloaded",
          },
          {
            date: "2025-12-15",
            time: "09:15",
            location: "جمرك العقبة",
            status: "التخليص الجمركي",
            description: "جاري التخليص الجمركي - البيان رقم 89430 - المتوقع الانتهاء خلال 48 ساعة",
            icon: "customs",
          },
        ],
        alerts: [
          {
            type: "info",
            message: "التخليص الجمركي قيد المعالجة",
            time: "منذ ساعتين"
          },
          {
            type: "warning",
            message: "يرجى تجهيز المستندات المطلوبة للإفراج",
            time: "منذ 5 ساعات"
          }
        ],
        customsDeclaration: {
          number: "89430",
          date: "2025-12-14",
          goodsValue: 20100000,
          totalFees: 3928350,
          totalCost: 24028350,
          status: "under_review",
          estimatedClearance: "2025-12-17"
        }
      });
      setIsSearching(false);
      
      toast.success(`تم تحميل معلومات الحاوية ${containerNumber.toUpperCase()}`);
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

  const toggleNotifications = () => {
    setNotifications(!notifications);
    toast.success(notifications 
      ? "لن تتلقى إشعارات عند تحديث حالة الحاوية" 
      : "ستتلقى إشعارات فورية عند تحديث حالة الحاوية");
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Ship className="h-8 w-8" />
          تتبع الحاويات
        </h1>
        <p className="text-muted-foreground mt-2">
          تتبع حاوياتك في الوقت الفعلي من الميناء إلى الوصول مع تحديثات فورية
        </p>
      </div>

      {/* Search Box */}
      <Card className="mb-8 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث عن حاوية
          </CardTitle>
          <CardDescription>
            أدخل رقم الحاوية للحصول على معلومات التتبع الكاملة والتحديثات الفورية
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
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
                disabled={!containerNumber || isSearching}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
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
          {/* Progress Overview */}
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  حالة الشحنة
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleNotifications}
                  className={notifications ? "bg-green-50 border-green-300" : ""}
                >
                  <Bell className={`h-4 w-4 mr-2 ${notifications ? "text-green-600" : ""}`} />
                  {notifications ? "الإشعارات مفعلة" : "تفعيل الإشعارات"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">التقدم الإجمالي</p>
                    <p className="text-2xl font-bold">{trackingData.progress}%</p>
                  </div>
                  <Badge className={`${getStatusColor(trackingData.status)} text-white text-lg px-4 py-2`}>
                    {getStatusText(trackingData.status)}
                  </Badge>
                </div>
                <Progress value={trackingData.progress} className="h-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">أيام العبور</p>
                    <p className="text-lg font-semibold">{trackingData.daysInTransit}</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">أيام متبقية</p>
                    <p className="text-lg font-semibold">{trackingData.daysRemaining}</p>
                  </div>
                  <div className="text-center">
                    <MapPin className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">الموقع الحالي</p>
                    <p className="text-sm font-semibold">{trackingData.currentLocation.name}</p>
                  </div>
                  <div className="text-center">
                    <Anchor className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">الوصول المتوقع</p>
                    <p className="text-sm font-semibold">{trackingData.estimatedArrival}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {trackingData.alerts && trackingData.alerts.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertCircle className="h-5 w-5" />
                  التنبيهات والإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trackingData.alerts.map((alert: any, index: number) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        alert.type === 'warning' 
                          ? 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800' 
                          : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`h-5 w-5 mt-0.5 ${
                          alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">معلومات الحاوية</TabsTrigger>
              <TabsTrigger value="timeline">سجل التتبع</TabsTrigger>
              <TabsTrigger value="customs">البيان الجمركي</TabsTrigger>
            </TabsList>

            {/* Container Info Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    معلومات الحاوية التفصيلية
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted">
                    <Label className="text-muted-foreground text-sm">رقم الحاوية</Label>
                    <p className="text-lg font-bold mt-1">{trackingData.containerNumber}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <Label className="text-muted-foreground text-sm">الحالة</Label>
                    <div className="mt-1">
                      <Badge className={`${getStatusColor(trackingData.status)} text-white`}>
                        {getStatusText(trackingData.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <Label className="text-muted-foreground text-sm">السفينة</Label>
                    <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                      <Ship className="h-4 w-4" />
                      {trackingData.vessel}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <Label className="text-muted-foreground text-sm">رقم الرحلة</Label>
                    <p className="text-lg font-semibold mt-1">{trackingData.voyage}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <Label className="text-muted-foreground text-sm">ميناء التحميل</Label>
                    <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {trackingData.portOfLoading}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <Label className="text-muted-foreground text-sm">ميناء الوصول</Label>
                    <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {trackingData.portOfDischarge}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <Label className="text-muted-foreground text-sm">الوصول المتوقع</Label>
                    <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {trackingData.estimatedArrival}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <Label className="text-muted-foreground text-sm">الوصول الفعلي</Label>
                    <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-green-600" />
                      {trackingData.actualArrival || "لم تصل بعد"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>سجل التتبع التفصيلي</CardTitle>
                  <CardDescription>
                    تاريخ حركة الحاوية من التحميل إلى الوصول مع جميع التحديثات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500" />

                    {/* Timeline Events */}
                    <div className="space-y-6">
                      {trackingData.events.map((event: any, index: number) => (
                        <div key={index} className="relative flex gap-4">
                          {/* Timeline Dot */}
                          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>

                          {/* Event Content */}
                          <div className="flex-1 pb-6">
                            <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">{event.status}</h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{event.date}</Badge>
                                  <Badge variant="secondary">{event.time}</Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                              <p className="text-sm">{event.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customs Declaration Tab */}
            <TabsContent value="customs">
              <Card>
                <CardHeader>
                  <CardTitle>البيان الجمركي</CardTitle>
                  <CardDescription>
                    معلومات البيان الجمركي المرتبط بهذه الحاوية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg bg-muted">
                        <Label className="text-muted-foreground text-sm">رقم البيان</Label>
                        <p className="text-xl font-bold mt-1">{trackingData.customsDeclaration.number}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <Label className="text-muted-foreground text-sm">تاريخ البيان</Label>
                        <p className="text-xl font-bold mt-1">{trackingData.customsDeclaration.date}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <Label className="text-muted-foreground text-sm">قيمة البضاعة</Label>
                        <p className="text-xl font-bold mt-1">
                          {(trackingData.customsDeclaration.goodsValue / 1000).toFixed(3)} د.أ
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <Label className="text-muted-foreground text-sm">مجموع الرسوم</Label>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                          {(trackingData.customsDeclaration.totalFees / 1000).toFixed(3)} د.أ
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 md:col-span-2 border-2 border-green-200 dark:border-green-800">
                        <Label className="text-muted-foreground text-sm">التكلفة النهائية الإجمالية</Label>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                          {(trackingData.customsDeclaration.totalCost / 1000).toFixed(3)} د.أ
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <Label className="text-muted-foreground text-sm">حالة البيان</Label>
                        <Badge className="mt-2 bg-orange-500">قيد المراجعة</Badge>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <Label className="text-muted-foreground text-sm">التخليص المتوقع</Label>
                        <p className="text-lg font-semibold mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {trackingData.customsDeclaration.estimatedClearance}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline" size="lg">
                      عرض تفاصيل البيان الكاملة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Empty State */}
      {!trackingData && !isSearching && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-blue-50 dark:bg-blue-950 p-6 mb-4">
              <Package className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">ابدأ بتتبع حاويتك</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              أدخل رقم الحاوية في الحقل أعلاه للحصول على معلومات التتبع الكاملة
              بما في ذلك الموقع الحالي، تاريخ الحركة، البيانات الجمركية، والإشعارات الفورية
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="rounded-full bg-green-50 dark:bg-green-950 p-3 mb-2 mx-auto w-fit">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">تتبع فوري</p>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-purple-50 dark:bg-purple-950 p-3 mb-2 mx-auto w-fit">
                  <Bell className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium">إشعارات تلقائية</p>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-orange-50 dark:bg-orange-950 p-3 mb-2 mx-auto w-fit">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-sm font-medium">موقع دقيق</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
