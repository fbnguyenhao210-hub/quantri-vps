import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker, Sphere, Graticule } from "react-simple-maps";
import { ServerData } from "@/data/mockServers";
import { MapPin, Globe, Map as MapIcon, Cpu, MemoryStick, HardDrive, ArrowDown, ArrowUp, Clock, Microchip, Activity } from "lucide-react";

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
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

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
    setSelectedServer(prev => prev === server.id ? null : server.id);
    if (viewMode === "globe") {
      setRotation([-server.lng, -server.lat, 0]);
    }
  };

  const projectionConfig = viewMode === "globe"
    ? { rotate: rotation, scale: 200 }
    : { scale: 140, center: [105, 15] as [number, number] };

  return (
    <div className="space-y-6">
      {/* Map Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
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
              title="Bản đồ phẳng"
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("globe")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "globe" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              title="Quả cầu 3D"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map */}
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

        {/* Country Stats Bar */}
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {Object.entries(countryStats).map(([code, count]) => (
            <div key={code} className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-1.5">
              <span className="text-xs font-mono font-bold text-primary">{code}</span>
              <span className="text-[10px] text-muted-foreground">{count} VPS</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Server List */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Danh sách máy chủ theo vị trí
        </h3>
        <div className="space-y-3">
          {servers.map((server) => {
            const isExpanded = selectedServer === server.id;
            const ramPct = Math.round((server.ram.used / server.ram.total) * 100);
            const diskPct = Math.round((server.disk.used / server.disk.total) * 100);

            return (
              <div
                key={server.id}
                className={`bg-card border rounded-xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? "border-primary/40" : "border-border hover:border-border/80"
                }`}
              >
                {/* Main Row */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setSelectedServer(prev => prev === server.id ? null : server.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold font-mono text-primary">
                      #{server.index}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-foreground">{server.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{server.ip}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="hidden sm:flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {server.location}
                    </span>
                    <span className="hidden md:inline text-muted-foreground font-mono">{server.country}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        server.status === "online" ? "bg-accent pulse-online" :
                        server.status === "warning" ? "bg-warning" : "bg-destructive"
                      }`} />
                      <span className="text-muted-foreground">{statusLabel(server.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {/* Location & Uptime */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {server.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Uptime: {server.uptime}</span>
                      <span className="font-mono">Tọa độ: {server.lat.toFixed(4)}, {server.lng.toFixed(4)}</span>
                      <span className="font-mono">OS: {server.os}</span>
                    </div>

                    {/* CPU Detail */}
                    <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Microchip className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-foreground">Thông tin CPU</span>
                        {server.status !== "offline" && (
                          <span className="ml-auto text-xs font-mono text-primary">{server.cpu}%</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 text-[11px]">
                        <div>
                          <span className="text-muted-foreground">Model: </span>
                          <span className="font-mono text-foreground">{server.cpuModel}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kiến trúc: </span>
                          <span className="font-mono text-foreground">{server.cpuArch}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nhân/Luồng: </span>
                          <span className="font-mono text-primary">{server.cpuCores}C / {server.cpuThreads}T</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Xung nhịp: </span>
                          <span className="font-mono text-foreground">{server.cpuSpeed}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bộ nhớ đệm: </span>
                          <span className="font-mono text-foreground">{server.cpuCache}</span>
                        </div>
                      </div>

                      {/* Mini CPU bar chart */}
                      {server.status !== "offline" && (
                        <div className="mt-3">
                          <div className="text-[10px] text-muted-foreground mb-1">Lịch sử CPU (12 mẫu gần nhất)</div>
                          <div className="flex items-end gap-[2px] h-8">
                            {server.cpuHistory.map((v, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-t-sm bg-primary transition-all duration-500"
                                style={{ height: `${Math.max(v, 2)}%`, opacity: 0.4 + (v / 100) * 0.6 }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resource Usage */}
                    {server.status !== "offline" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* RAM */}
                        <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                          <div className="flex items-center gap-1.5 mb-2">
                            <MemoryStick className="w-3 h-3 text-accent" />
                            <span className="text-[11px] text-muted-foreground">RAM</span>
                            <span className="ml-auto text-xs font-mono text-foreground">{ramPct}%</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${ramPct}%` }} />
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-1">
                            {server.ram.used} / {server.ram.total} GB
                          </div>
                        </div>

                        {/* Disk */}
                        <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                          <div className="flex items-center gap-1.5 mb-2">
                            <HardDrive className="w-3 h-3 text-primary" />
                            <span className="text-[11px] text-muted-foreground">Disk</span>
                            <span className="ml-auto text-xs font-mono text-foreground">{diskPct}%</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${diskPct}%` }} />
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-1">
                            {server.disk.used} / {server.disk.total} GB
                          </div>
                        </div>

                        {/* Network */}
                        <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Activity className="w-3 h-3 text-primary" />
                            <span className="text-[11px] text-muted-foreground">Network</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[11px]">
                              <ArrowDown className="w-3 h-3 text-accent" />
                              <span className="font-mono text-foreground">{server.networkIn}</span>
                              <span className="text-muted-foreground">MB/s</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px]">
                              <ArrowUp className="w-3 h-3 text-primary" />
                              <span className="font-mono text-foreground">{server.networkOut}</span>
                              <span className="text-muted-foreground">MB/s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-destructive/60 py-3">
                        Máy chủ không phản hồi
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                      <span>Cập nhật: {server.lastChecked}</span>
                      <span className="font-mono">{server.os}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
