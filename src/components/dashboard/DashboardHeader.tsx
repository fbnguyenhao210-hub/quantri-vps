import { Bell, RefreshCw, Search, Terminal } from "lucide-react";
import { useState } from "react";

const DashboardHeader = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Terminal className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">VPS Monitor</h1>
          <p className="text-xs text-muted-foreground">Quản lý & giám sát máy chủ</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm máy chủ..."
            className="bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
          />
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
        <button className="p-2 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-colors relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-card" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
