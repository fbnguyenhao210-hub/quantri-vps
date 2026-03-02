import { useState } from "react";
import { ServerData } from "@/data/mockServers";
import { Plus, Trash2, Eye, EyeOff, Server } from "lucide-react";

interface VPSManagementProps {
  servers: ServerData[];
}

interface VPSFormData {
  name: string;
  ip: string;
  port: string;
  username: string;
  password: string;
}

const VPSManagement = ({ servers }: VPSManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<VPSFormData>({ name: "", ip: "", port: "22", username: "root", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call the Node.js backend API
    alert(`Sẽ gửi đến backend API:\nPOST /api/servers\n\nTên: ${form.name}\nIP: ${form.ip}\nPort: ${form.port}\nUser: ${form.username}\n\n(Mật khẩu được mã hóa trước khi gửi)`);
    setForm({ name: "", ip: "", port: "22", username: "root", password: "" });
    setShowForm(false);
  };

  const handleDelete = (serverId: string, serverName: string) => {
    if (confirm(`Bạn có chắc muốn xóa "${serverName}" khỏi hệ thống?`)) {
      alert(`Sẽ gửi đến backend API:\nDELETE /api/servers/${serverId}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-foreground">Quản lý danh sách VPS</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm VPS mới
        </button>
      </div>

      {/* Add VPS Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-primary/20 rounded-xl p-5 mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-4">Thêm VPS mới</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tên gợi nhớ *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ví dụ: Web Server Production"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Địa chỉ IP *</label>
              <input
                required
                value={form.ip}
                onChange={(e) => setForm({ ...form, ip: e.target.value })}
                placeholder="103.45.67.12"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Port SSH *</label>
              <input
                required
                value={form.port}
                onChange={(e) => setForm({ ...form, port: e.target.value })}
                placeholder="22"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Username *</label>
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="root"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Mật khẩu *</label>
              <div className="relative">
                <input
                  required
                  type={showPasswords["form"] ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, form: !showPasswords["form"] })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords["form"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">🔒 Mật khẩu được mã hóa AES-256-GCM trước khi lưu trữ</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">
              Thêm VPS
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Server List */}
      <div className="space-y-2">
        {servers.map((server) => (
          <div key={server.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Server className="w-4 h-4 text-primary" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-primary font-bold">#{server.index}</span>
                  <span className="text-sm font-medium text-foreground">{server.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">{server.ip}</span>
                  <span>{server.location}</span>
                  <span>{server.os}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  server.status === "online" ? "bg-accent pulse-online" :
                  server.status === "warning" ? "bg-warning" : "bg-destructive"
                }`} />
                <span className="text-xs text-muted-foreground">
                  {server.status === "online" ? "Hoạt động" : server.status === "warning" ? "Cảnh báo" : "Ngoại tuyến"}
                </span>
              </div>
              <button
                onClick={() => handleDelete(server.id, server.name)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Xóa VPS"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {servers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Chưa có VPS nào. Nhấn "Thêm VPS mới" để bắt đầu.
        </div>
      )}
    </div>
  );
};

export default VPSManagement;
