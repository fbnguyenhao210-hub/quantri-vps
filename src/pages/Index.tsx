import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import ServerCard from "@/components/dashboard/ServerCard";
import WorldMap from "@/components/dashboard/WorldMap";
import VPSManagement from "@/components/dashboard/VPSManagement";
import { mockServers, ServerData } from "@/data/mockServers";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [servers, setServers] = useState<ServerData[]>(mockServers);

  // Auto-refresh every 5 seconds
  const refreshData = useCallback(() => {
    setServers((prev) =>
      prev.map((server) => {
        if (server.status === "offline") return server;
        const newCpu = Math.max(5, Math.min(95, server.cpu + (Math.random() - 0.5) * 15));
        const newHistory = [...server.cpuHistory.slice(1), Math.round(newCpu)];
        const ramDelta = (Math.random() - 0.5) * 0.3;
        const newRamUsed = Math.max(0.5, Math.min(server.ram.total - 0.2, server.ram.used + ramDelta));
        return {
          ...server,
          cpu: Math.round(newCpu),
          cpuHistory: newHistory,
          ram: { ...server.ram, used: Math.round(newRamUsed * 10) / 10 },
          networkIn: Math.round((server.networkIn + (Math.random() - 0.5) * 20) * 10) / 10,
          networkOut: Math.round((server.networkOut + (Math.random() - 0.5) * 15) * 10) / 10,
          lastChecked: "vừa xong",
        };
      })
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      {/* Network cable light effect */}
      <div className="network-bg" />

      <div className="max-w-7xl mx-auto relative z-10">
        <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "dashboard" && (
          <>
            <StatsOverview servers={servers} />
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Danh sách máy chủ</h2>
                <span className="text-xs text-muted-foreground font-mono">{servers.length} servers • cập nhật mỗi 5s</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map((server) => (
                  <ServerCard key={server.id} server={server} />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "worldmap" && <WorldMap servers={servers} />}
        {activeTab === "manage" && <VPSManagement servers={servers} />}

        <footer className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground font-mono">
            VPS Monitor Dashboard v2.0 — Cập nhật tự động mỗi 5 giây
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
