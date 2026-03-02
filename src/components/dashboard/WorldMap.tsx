import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { ServerData } from "@/data/mockServers";
import { MapPin } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  servers: ServerData[];
}

const WorldMap = ({ servers }: WorldMapProps) => {
  const countriesWithServers = new Set(servers.map((s) => s.country));

  // Country code to numeric mapping for common ones
  const countryCodeMap: Record<string, string[]> = {
    VN: ["704"],
    SG: ["702"],
    JP: ["392"],
    US: ["840"],
    DE: ["276"],
    GB: ["826"],
    FR: ["250"],
    KR: ["410"],
    AU: ["036"],
    IN: ["356"],
    CN: ["156"],
    TH: ["764"],
    MY: ["458"],
    ID: ["360"],
    NL: ["528"],
  };

  const numericIds = new Set<string>();
  countriesWithServers.forEach((cc) => {
    countryCodeMap[cc]?.forEach((id) => numericIds.add(id));
  });

  const statusColor = (status: string) => {
    if (status === "online") return "hsl(142, 60%, 50%)";
    if (status === "warning") return "hsl(38, 92%, 55%)";
    return "hsl(0, 72%, 55%)";
  };

  return (
    <div>
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <ComposableMap
          projectionConfig={{ scale: 140, center: [105, 15] }}
          className="w-full"
          style={{ maxHeight: "450px" }}
        >
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
              <circle r={4} fill={statusColor(server.status)} stroke="hsl(220, 20%, 7%)" strokeWidth={1.5} />
              <circle r={8} fill={statusColor(server.status)} opacity={0.2}>
                <animate attributeName="r" from="4" to="12" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* Server list below map */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-3">Danh sách máy chủ theo vị trí</h3>
        {servers.map((server) => (
          <div
            key={server.id}
            className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-mono font-bold text-primary">
                #{server.index}
              </span>
              <div>
                <div className="text-sm font-medium text-foreground">{server.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{server.ip}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {server.location}
              </span>
              <span className="text-muted-foreground">Quốc gia: <span className="text-foreground font-mono">{server.country}</span></span>
              <span className="text-muted-foreground">
                Tọa độ: <span className="text-foreground font-mono">{server.lat.toFixed(2)}, {server.lng.toFixed(2)}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  server.status === "online" ? "bg-accent pulse-online" :
                  server.status === "warning" ? "bg-warning" : "bg-destructive"
                }`} />
                <span className="text-muted-foreground">
                  {server.status === "online" ? "Hoạt động" : server.status === "warning" ? "Cảnh báo" : "Ngoại tuyến"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldMap;
