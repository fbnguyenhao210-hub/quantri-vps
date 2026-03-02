import { Server, Cpu, Activity, AlertTriangle, XCircle, ArrowDownUp } from "lucide-react";
import { ServerData } from "@/data/mockServers";

interface StatsOverviewProps {
  servers: ServerData[];
}

const StatsOverview = ({ servers }: StatsOverviewProps) => {
  const online = servers.filter((s) => s.status === "online").length;
  const warning = servers.filter((s) => s.status === "warning").length;
  const offline = servers.filter((s) => s.status === "offline").length;
  const activeServers = servers.filter((s) => s.status !== "offline");
  const avgCpu = activeServers.length
    ? Math.round(activeServers.reduce((a, s) => a + s.cpu, 0) / activeServers.length)
    : 0;
  const totalNetIn = activeServers.reduce((a, s) => a + s.networkIn, 0).toFixed(1);
  const totalNetOut = activeServers.reduce((a, s) => a + s.networkOut, 0).toFixed(1);

  const stats = [
    { label: "Tổng máy chủ", value: servers.length, icon: Server, color: "text-primary" },
    { label: "Đang hoạt động", value: online, icon: Activity, color: "text-accent" },
    { label: "Cảnh báo", value: warning, icon: AlertTriangle, color: "text-warning" },
    { label: "Ngoại tuyến", value: offline, icon: XCircle, color: "text-destructive" },
    { label: "CPU trung bình", value: `${avgCpu}%`, icon: Cpu, color: "text-primary" },
    { label: "Mạng tổng", value: `↓${totalNetIn} ↑${totalNetOut}`, icon: ArrowDownUp, color: "text-accent", sub: "MB/s" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <span className={`text-lg font-bold font-mono ${stat.color}`}>
            {stat.value}
          </span>
          {stat.sub && <span className="text-[10px] text-muted-foreground -mt-1">{stat.sub}</span>}
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
