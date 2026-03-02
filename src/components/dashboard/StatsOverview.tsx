import { Server, Cpu, HardDrive, Activity, AlertTriangle, XCircle } from "lucide-react";
import { mockServers } from "@/data/mockServers";

const StatsOverview = () => {
  const online = mockServers.filter((s) => s.status === "online").length;
  const warning = mockServers.filter((s) => s.status === "warning").length;
  const offline = mockServers.filter((s) => s.status === "offline").length;
  const avgCpu = Math.round(
    mockServers.filter((s) => s.status !== "offline").reduce((a, s) => a + s.cpu, 0) /
      mockServers.filter((s) => s.status !== "offline").length
  );

  const stats = [
    {
      label: "Tổng máy chủ",
      value: mockServers.length,
      icon: Server,
      color: "text-primary",
    },
    {
      label: "Đang hoạt động",
      value: online,
      icon: Activity,
      color: "text-accent",
    },
    {
      label: "Cảnh báo",
      value: warning,
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      label: "Ngoại tuyến",
      value: offline,
      icon: XCircle,
      color: "text-destructive",
    },
    {
      label: "CPU trung bình",
      value: `${avgCpu}%`,
      icon: Cpu,
      color: "text-primary",
    },
    {
      label: "Dung lượng tổng",
      value: "860 GB",
      icon: HardDrive,
      color: "text-secondary-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <span className={`text-2xl font-bold font-mono ${stat.color}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
