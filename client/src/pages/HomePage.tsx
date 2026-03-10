import { useState, useCallback, useRef, Component, type ReactNode, type ErrorInfo } from "react";
import { NavermapsProvider, Container as MapDiv, NaverMap, Marker, useNavermaps } from "react-naver-maps";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES, type Pin } from "@shared/schema";
import { getCategoryColor } from "@/components/CategoryMarker";
import PinDetailPanel from "@/components/PinDetailPanel";
import Header from "@/components/Header";
import { useAppConfig } from "@/hooks/use-app-config";
import { MapPin, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

class MapErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Naver Maps load error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
            <p className="text-sm font-medium text-foreground">지도를 불러올 수 없습니다</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {this.state.error.message}
            </p>
            <button
              className="mt-2 text-xs text-primary underline"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_ZOOM = 12;

function createMarkerHtmlIcon(category: string, selected = false) {
  const color = getCategoryColor(category);
  const size = selected ? 32 : 24;
  const borderWidth = selected ? 3 : 2;
  return `<div style="
    width:${size}px;height:${size}px;
    background:${color};
    border:${borderWidth}px solid #fff;
    border-radius:50%;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
    cursor:pointer;
    transform:translate(-50%,-50%);
  "></div>`;
}

function MapView() {
  const navermaps = useNavermaps();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);

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

  return (
    <>
      <NaverMap
        defaultCenter={new navermaps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng)}
        defaultZoom={DEFAULT_ZOOM}
        ref={mapRef}
        onClick={onMapClick}
        zoomControl
        zoomControlOptions={{
          position: navermaps.Position.TOP_LEFT,
        }}
        mapDataControl={false}
        scaleControl={false}
        logoControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        {pins.map(pin => (
          <Marker
            key={pin.id}
            position={new navermaps.LatLng(Number(pin.lat), Number(pin.lng))}
            onClick={() => setSelectedPin(pin)}
            title={pin.name}
            icon={{
              content: createMarkerHtmlIcon(pin.category ?? "general", selectedPin?.id === pin.id),
              anchor: new navermaps.Point(0, 0),
            }}
          />
        ))}
      </NaverMap>

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
        {config?.naverMapsClientId ? (
          <NavermapsProvider ncpClientId={config.naverMapsClientId}>
            <MapErrorBoundary>
              <MapDiv style={{ width: "100%", height: "100%" }}>
                <MapView />
              </MapDiv>
            </MapErrorBoundary>
          </NavermapsProvider>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
