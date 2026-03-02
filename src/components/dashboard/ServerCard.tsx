import { ServerData } from "@/data/mockServers";
import { Cpu, MemoryStick, HardDrive, ArrowDown, ArrowUp, MapPin, Clock } from "lucide-react";

interface ServerCardProps {
  server: ServerData;
}

const UsageBar = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const MiniChart = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data, 100);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-full h-10" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const ServerCard = ({ server }: ServerCardProps) => {
  const statusConfig = {
    online: { label: "Hoạt động", dotClass: "bg-accent pulse-online", borderClass: "hover:border-accent/30" },
    warning: { label: "Cảnh báo", dotClass: "bg-warning", borderClass: "hover:border-warning/30" },
    offline: { label: "Ngoại tuyến", dotClass: "bg-destructive", borderClass: "hover:border-destructive/30" },
  };

  const cfg = statusConfig[server.status];

  return (
    <div className={`bg-card border border-border rounded-xl p-5 transition-all duration-300 ${cfg.borderClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm">{server.name}</h3>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{server.ip}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
          <span className="text-xs text-muted-foreground">{cfg.label}</span>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {server.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {server.uptime}
        </span>
      </div>

      {server.status !== "offline" ? (
        <>
          {/* CPU mini chart */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">CPU</span>
              <span className="text-xs font-mono text-primary ml-auto">{server.cpu}%</span>
            </div>
            <MiniChart data={server.cpuHistory} color="hsl(172, 66%, 50%)" />
          </div>

          {/* Usage bars */}
          <div className="space-y-3">
            <UsageBar
              value={server.ram.used}
              max={server.ram.total}
              label={`RAM ${server.ram.used}/${server.ram.total} GB`}
              color="bg-accent"
            />
            <UsageBar
              value={server.disk.used}
              max={server.disk.total}
              label={`Disk ${server.disk.used}/${server.disk.total} GB`}
              color="bg-primary"
            />
          </div>

          {/* Network */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-xs">
              <ArrowDown className="w-3 h-3 text-accent" />
              <span className="font-mono text-foreground">{server.networkIn}</span>
              <span className="text-muted-foreground">MB/s</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowUp className="w-3 h-3 text-primary" />
              <span className="font-mono text-foreground">{server.networkOut}</span>
              <span className="text-muted-foreground">MB/s</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-32 text-destructive/60 text-sm">
          Máy chủ không phản hồi
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{server.os}</span>
        <span className="text-[10px] text-muted-foreground">Cập nhật: {server.lastChecked}</span>
      </div>
    </div>
  );
};

export default ServerCard;
