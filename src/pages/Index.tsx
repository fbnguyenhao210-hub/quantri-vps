import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import ServerCard from "@/components/dashboard/ServerCard";
import { mockServers } from "@/data/mockServers";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        <StatsOverview />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Danh sách máy chủ
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {mockServers.length} servers
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockServers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground font-mono">
            VPS Monitor Dashboard v1.0 — Cập nhật tự động mỗi 30 giây
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
