/**
 * مكون خريطة الدول للشحن
 * Shipping Countries Map Component
 * 
 * يعرض الدول على خريطة Google Maps التفاعلية
 * مع عرض الأسعار والمعلومات لكل دولة
 */

import { useRef, useEffect, useState } from 'react';
import { MapView } from '@/components/Map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map as MapIcon, ZoomIn, ZoomOut } from 'lucide-react';

interface CountryData {
  code: string;
  country: string;
  latitude: number;
  longitude: number;
  shippingCost: number;
  customsRate: number;
  taxRate: number;
}

interface ShippingCountriesMapProps {
  countries: CountryData[];
  onCountrySelect?: (country: CountryData) => void;
}

export default function ShippingCountriesMap({ countries, onCountrySelect }: ShippingCountriesMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [mapZoom, setMapZoom] = useState(4);

  // Calculate map center (average of all countries)
  const calculateCenter = () => {
    if (countries.length === 0) return { lat: 20, lng: 50 };
    
    const avgLat = countries.reduce((sum, c) => sum + c.latitude, 0) / countries.length;
    const avgLng = countries.reduce((sum, c) => sum + c.longitude, 0) / countries.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    // Add markers for each country
    countries.forEach((country) => {
      // Create custom marker content
      const markerDiv = document.createElement('div');
      markerDiv.className = 'flex flex-col items-center cursor-pointer hover:scale-110 transition-transform';
      
      const markerContent = document.createElement('div');
      markerContent.className = 'bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg font-bold text-sm hover:bg-blue-700 transition-colors';
      markerContent.textContent = country.code;
      markerContent.style.cursor = 'pointer';
      
      markerDiv.appendChild(markerContent);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: country.latitude, lng: country.longitude },
        title: country.country,
        content: markerDiv,
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        setSelectedCountry(country);
        onCountrySelect?.(country);
        
        // Pan to marker
        map.panTo({ lat: country.latitude, lng: country.longitude });
        map.setZoom(6);
      });

      markersRef.current.push(marker);
    });
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || mapZoom;
      mapRef.current.setZoom(currentZoom + 1);
      setMapZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || mapZoom;
      mapRef.current.setZoom(currentZoom - 1);
      setMapZoom(currentZoom - 1);
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setCenter(calculateCenter());
      mapRef.current.setZoom(4);
      setMapZoom(4);
      setSelectedCountry(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>خريطة الدول التفاعلية</CardTitle>
              <CardDescription>انقر على أي دولة لعرض تفاصيلها</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Map Container */}
          <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
            <div style={{ height: '500px', width: '100%' }}>
              <MapView
                initialCenter={calculateCenter()}
                initialZoom={mapZoom}
                onMapReady={handleMapReady}
              />
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleZoomIn}
                className="h-10 w-10 p-0"
                title="تكبير"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleZoomOut}
                className="h-10 w-10 p-0"
                title="تصغير"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleResetView}
                className="text-xs"
                title="إعادة تعيين"
              >
                إعادة تعيين
              </Button>
            </div>
          </div>

          {/* Selected Country Details */}
          {selectedCountry && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الدولة</p>
                  <p className="text-lg font-bold">{selectedCountry.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الكود</p>
                  <p className="text-lg font-bold">{selectedCountry.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">تكلفة الشحن</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">د.ا {selectedCountry.shippingCost}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">معدل الجمارك</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{(selectedCountry.customsRate * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">معدل الضريبة</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{(selectedCountry.taxRate * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الإحداثيات</p>
                  <p className="text-sm font-mono">{selectedCountry.latitude.toFixed(2)}, {selectedCountry.longitude.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Countries Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {countries.map((country) => (
              <Button
                key={country.code}
                variant={selectedCountry?.code === country.code ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCountry(country);
                  onCountrySelect?.(country);
                  if (mapRef.current) {
                    mapRef.current.panTo({ lat: country.latitude, lng: country.longitude });
                    mapRef.current.setZoom(6);
                  }
                }}
                className="text-xs"
              >
                {country.code}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
