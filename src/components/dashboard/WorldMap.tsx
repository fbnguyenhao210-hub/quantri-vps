import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker, Sphere, Graticule } from "react-simple-maps";
import { ServerData } from "@/data/mockServers";
import { MapPin, Globe, Map as MapIcon, Cpu, Clock, Activity } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  servers: ServerData[];
}

const countryCodeMap: Record<string, string[]> = {
  VN: ["704"], SG: ["702"], JP: ["392"], US: ["840"], DE: ["276"],
  GB: ["826"], FR: ["250"], KR: ["410"], AU: ["036"], IN: ["356"],
  CN: ["156"], TH: ["764"], MY: ["458"], ID: ["360"], NL: ["528"],
};

const WorldMap = ({ servers }: WorldMapProps) => {
  const [viewMode, setViewMode] = useState<"map" | "globe">("map");
  const [rotation, setRotation] = useState<[number, number, number]>([-105, -15, 0]);

  const countryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    servers.forEach(s => { stats[s.country] = (stats[s.country] || 0) + 1; });
    return stats;
  }, [servers]);

  const numericIds = useMemo(() => {
    const ids = new Set<string>();
    Object.keys(countryStats).forEach(cc => {
      countryCodeMap[cc]?.forEach(id => ids.add(id));
    });
    return ids;
  }, [countryStats]);

  const statusColor = (status: string) => {
    if (status === "online") return "hsl(142, 60%, 50%)";
    if (status === "warning") return "hsl(38, 92%, 55%)";
    return "hsl(0, 72%, 55%)";
  };

  const statusLabel = (status: string) => {
    if (status === "online") return "Hoạt động";
    if (status === "warning") return "Cảnh báo";
    return "Ngoại tuyến";
  };

  const handleMarkerClick = (server: ServerData) => {
    if (viewMode === "globe") {
      setRotation([-server.lng, -server.lat, 0]);
    }
  };

  const projectionConfig = viewMode === "globe"
    ? { rotate: rotation, scale: 200 }
    : { scale: 140, center: [105, 15] as [number, number] };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Map Card - Left Side */}
      <div className="bg-card border border-border rounded-xl overflow-hidden flex-1 min-w-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">
              {viewMode === "globe" ? "Giữ & kéo để xoay" : "Vị trí VPS toàn cầu"}
            </span>
            <span className="text-xs font-mono">— {servers.length} servers</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("map")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("globe")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "globe" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          className="p-4 cursor-grab active:cursor-grabbing"
          onMouseMove={(e) => {
            if (viewMode === "globe" && e.buttons === 1) {
              setRotation([rotation[0] + e.movementX * 0.5, rotation[1] - e.movementY * 0.5, rotation[2]]);
            }
          }}
        >
          <ComposableMap
            projection={viewMode === "globe" ? "geoOrthographic" : "geoMercator"}
            projectionConfig={projectionConfig}
            className="w-full"
            style={{ maxHeight: "450px" }}
          >
            {viewMode === "globe" && (
              <>
                <Sphere id="sphere" fill="hsl(220, 20%, 8%)" stroke="hsl(220, 14%, 22%)" strokeWidth={0.5} />
                <Graticule stroke="hsl(220, 14%, 15%)" strokeWidth={0.3} />
              </>
            )}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isActive = numericIds.has(geo.id);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isActive ? "hsl(0, 72%, 45%)" : "hsl(220, 16%, 16%)"}
                      stroke="hsl(220, 14%, 22%)"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: isActive ? "hsl(0, 72%, 55%)" : "hsl(220, 16%, 22%)", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {servers.map((server) => (
              <Marker key={server.id} coordinates={[server.lng, server.lat]}>
                <g onClick={() => handleMarkerClick(server)} className="cursor-pointer">
                  <circle r={4} fill={statusColor(server.status)} stroke="hsl(220, 20%, 7%)" strokeWidth={1.5} />
                  <circle r={8} fill={statusColor(server.status)} opacity={0.2}>
                    <animate attributeName="r" from="4" to="12" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
              </Marker>
            ))}
          </ComposableMap>
        </div>

        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {Object.entries(countryStats).map(([code, count]) => (
            <div key={code} className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-1.5">
              <span className="text-xs font-mono font-bold text-primary">{code}</span>
              <span className="text-[10px] text-muted-foreground">{count} VPS</span>
            </div>
          ))}
        </div>
      </div>

      {/* VPS List - Right Side */}
      <div className="lg:w-[360px] flex-shrink-0 space-y-2 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1 custom-scrollbar">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
          <MapPin className="w-4 h-4 text-primary" />
          Danh sách VPS
        </h3>
        {servers.map((server) => (
          <div
            key={server.id}
            className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-all duration-200 cursor-pointer"
            onClick={() => handleMarkerClick(server)}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold font-mono text-primary">
                #{server.index}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">{server.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{server.ip}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  server.status === "online" ? "bg-accent pulse-online" :
                  server.status === "warning" ? "bg-warning" : "bg-destructive"
                }`} />
                <span className="text-[10px] text-muted-foreground">{statusLabel(server.status)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-2.5 h-2.5" />
                <span className="truncate">{server.location}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Globe className="w-2.5 h-2.5" />
                <span>{server.country}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Cpu className="w-2.5 h-2.5" />
                <span className="font-mono">{server.status !== "offline" ? `${server.cpu}%` : "N/A"}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                <span>{server.uptime}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1 text-muted-foreground">
                <Cpu className="w-2.5 h-2.5" />
                <span className="font-mono truncate">{server.cpuCores}C/{server.cpuThreads}T • {server.os}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldMap;
