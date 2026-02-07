/**
 * Tracking Page
 * صفحة تتبع الشحنات
 * 
 * @module ./client/src/pages/Tracking
 */
import { Button } from "@/components/ui/button";
import { Search, MapPin, Truck, Package, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ShipmentEvent {
  time: string;
  event: string;
  icon: string;
}

interface Shipment {
  id: string;
  container: string;
  origin: string;
  destination: string;
  status: string;
  statusColor: string;
  progress: number;
  lastUpdate: string;
  events: ShipmentEvent[];
}

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const shipments = [
    {
      id: "SHIP-001",
      container: "CONT-2024-001",
      origin: "ميناء عمّان",
      destination: "ميناء العقبة",
      status: "في الطريق",
      statusColor: "bg-blue-500/20 text-blue-300",
      progress: 65,
      lastUpdate: "2026-02-07 14:30",
      events: [
        { time: "2026-02-07 14:30", event: "غادر ميناء عمّان", icon: "Truck" },
        { time: "2026-02-07 10:00", event: "تم التحميل", icon: "Package" },
        { time: "2026-02-07 08:00", event: "وصول الحاوية", icon: "MapPin" }
      ]
    },
    {
      id: "SHIP-002",
      container: "CONT-2024-002",
      origin: "ميناء عمّان",
      destination: "ميناء العقبة",
      status: "وصل",
      statusColor: "bg-green-500/20 text-green-300",
      progress: 100,
      lastUpdate: "2026-02-06 18:45",
      events: [
        { time: "2026-02-06 18:45", event: "وصول إلى الوجهة", icon: "CheckCircle" },
        { time: "2026-02-06 12:00", event: "في الطريق", icon: "Truck" },
        { time: "2026-02-06 08:00", event: "تم التحميل", icon: "Package" }
      ]
    },
    {
      id: "SHIP-003",
      container: "CONT-2024-003",
      origin: "ميناء عمّان",
      destination: "ميناء العقبة",
      status: "معلق",
      statusColor: "bg-red-500/20 text-red-300",
      progress: 30,
      lastUpdate: "2026-02-05 16:20",
      events: [
        { time: "2026-02-05 16:20", event: "تأخير في الجمارك", icon: "AlertCircle" },
        { time: "2026-02-05 10:00", event: "فحص جمركي", icon: "Package" },
        { time: "2026-02-05 08:00", event: "وصول الحاوية", icon: "MapPin" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
              تتبع الشحنات
            </h1>
            <p className="text-blue-200/60 mt-2">تتبع فوري للحاويات والشحنات مع خريطة تفاعلية</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="ابحث برقم الشحنة أو الحاوية..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 text-lg"
            />
          </div>
        </div>

        {/* Shipments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipments List */}
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <button
                key={shipment.id}
                onClick={() => setSelectedShipment(shipment)}
                className={`w-full text-left p-6 rounded-2xl border transition-all ${
                  selectedShipment?.id === shipment.id
                    ? "bg-white/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{shipment.id}</h3>
                    <p className="text-white/60 text-sm">{shipment.container}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${shipment.statusColor}`}>
                    {shipment.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <MapPin className="w-4 h-4" />
                    من: {shipment.origin}
                  </div>
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Truck className="w-4 h-4" />
                    إلى: {shipment.destination}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-xs">التقدم</span>
                    <span className="text-white text-xs font-medium">{shipment.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                      style={{ width: `${shipment.progress}%` }}
                    />
                  </div>
                </div>

                <p className="text-white/50 text-xs">آخر تحديث: {shipment.lastUpdate}</p>
              </button>
            ))}
          </div>

          {/* Details Panel */}
          <div>
            {selectedShipment ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md sticky top-24">
                <h3 className="text-2xl font-bold text-white mb-6">تفاصيل الشحنة</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-white/60 text-sm mb-1">رقم الشحنة</p>
                    <p className="text-white font-medium">{selectedShipment.id}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">رقم الحاوية</p>
                    <p className="text-white font-medium">{selectedShipment.container}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">الحالة</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${selectedShipment.statusColor}`}>
                      {selectedShipment.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h4 className="text-lg font-bold text-white mb-4">سجل التحديثات</h4>
                  <div className="space-y-4">
                    {selectedShipment.events.map((event, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                          {idx < selectedShipment.events.length - 1 && (
                            <div className="w-0.5 h-12 bg-blue-500/30 mt-2"></div>
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-white/60 text-xs">{event.time}</p>
                          <p className="text-white text-sm font-medium">{event.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex items-center justify-center h-96">
                <p className="text-white/60 text-center">اختر شحنة لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
