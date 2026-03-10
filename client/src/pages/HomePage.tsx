import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES, type Pin } from "@shared/schema";
import PinDetailPanel from "@/components/PinDetailPanel";
import Header from "@/components/Header";
import { useAppConfig } from "@/hooks/use-app-config";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_ZOOM = 12;

const mapContainerStyle = { width: "100%", height: "100%" };

const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

function getCategoryColor(category: string) {
  return CATEGORIES.find(c => c.value === category)?.color ?? "#6B7280";
}

function createMarkerIcon(category: string, selected = false) {
  const color = getCategoryColor(category);
  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#fff",
    strokeWeight: selected ? 2 : 1.5,
    scale: selected ? 1.8 : 1.4,
    anchor: new window.google.maps.Point(12, 22),
  };
}

function MapView({ googleMapsApiKey }: { googleMapsApiKey: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const isDark = document.documentElement.classList.contains("dark");

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    id: "google-map-script",
  });

  const { data: pins = [], isLoading: pinsLoading } = useQuery<Pin[]>({
    queryKey: ["/api/pins"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("pins")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (pinId: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("pins").delete().eq("id", pinId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pins"] });
      setSelectedPin(null);
      toast({ title: "핀이 삭제되었습니다." });
    },
    onError: () => {
      toast({ title: "삭제 실패", description: "핀 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  const onMapClick = useCallback(() => setSelectedPin(null), []);

  if (loadError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <MapPin className="w-10 h-10 text-destructive mx-auto" />
          <p className="font-medium">지도를 불러올 수 없습니다</p>
          <p className="text-sm text-muted-foreground">Google Maps API 키를 확인해주세요.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={SEOUL_CENTER}
        zoom={DEFAULT_ZOOM}
        options={{
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          styles: isDark ? darkMapStyles : undefined,
        }}
        onClick={onMapClick}
      >
        {pins.map(pin => (
          <Marker
            key={pin.id}
            position={{ lat: Number(pin.lat), lng: Number(pin.lng) }}
            icon={createMarkerIcon(pin.category ?? "general", selectedPin?.id === pin.id)}
            onClick={() => setSelectedPin(pin)}
            title={pin.name}
          />
        ))}
      </GoogleMap>

      {pinsLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card border border-card-border rounded-full px-3 py-1.5 flex items-center gap-2 shadow-md text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          핀 로딩 중...
        </div>
      )}

      {/* Category legend */}
      <div className="absolute bottom-6 left-4 bg-card/90 backdrop-blur-sm border border-card-border rounded-xl px-3 py-2.5 shadow-lg space-y-1.5">
        {CATEGORIES.map(cat => (
          <div key={cat.value} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="text-[11px] text-foreground/80">{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Pin count badge */}
      {pins.length > 0 && (
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-card-border rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
          <MapPin className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium" data-testid="text-pin-count">{pins.length}개의 핀</span>
        </div>
      )}

      {/* Side panel */}
      {selectedPin && (
        <div className="absolute inset-y-0 right-0 w-full max-w-sm pointer-events-auto">
          <PinDetailPanel
            pin={selectedPin}
            isAdmin={user?.isAdmin ?? false}
            onClose={() => setSelectedPin(null)}
            onDelete={(id) => deleteMutation.mutate(id)}
            deleting={deleteMutation.isPending}
          />
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  const { config } = useAppConfig();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 relative mt-14">
        {config?.googleMapsApiKey ? (
          <MapView googleMapsApiKey={config.googleMapsApiKey} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
