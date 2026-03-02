export interface ServerData {
  id: string;
  name: string;
  ip: string;
  location: string;
  status: "online" | "offline" | "warning";
  os: string;
  uptime: string;
  cpu: number;
  ram: { used: number; total: number };
  disk: { used: number; total: number };
  networkIn: number;
  networkOut: number;
  cpuHistory: number[];
  ramHistory: number[];
  lastChecked: string;
}

export const mockServers: ServerData[] = [
  {
    id: "vps-01",
    name: "Web Server - Production",
    ip: "103.45.67.12",
    location: "Singapore",
    status: "online",
    os: "Ubuntu 22.04 LTS",
    uptime: "45 ngày 12 giờ",
    cpu: 34,
    ram: { used: 2.8, total: 4 },
    disk: { used: 42, total: 80 },
    networkIn: 125.4,
    networkOut: 89.2,
    cpuHistory: [22, 28, 35, 42, 38, 30, 25, 34, 40, 36, 32, 34],
    ramHistory: [60, 62, 65, 68, 70, 72, 68, 65, 70, 72, 69, 70],
    lastChecked: "10 giây trước",
  },
  {
    id: "vps-02",
    name: "Database Server",
    ip: "103.45.67.15",
    location: "Tokyo",
    status: "online",
    os: "CentOS 8",
    uptime: "120 ngày 5 giờ",
    cpu: 67,
    ram: { used: 7.2, total: 8 },
    disk: { used: 156, total: 200 },
    networkIn: 45.8,
    networkOut: 234.1,
    cpuHistory: [55, 60, 65, 70, 68, 72, 65, 60, 58, 62, 65, 67],
    ramHistory: [85, 87, 88, 90, 88, 86, 89, 90, 91, 88, 89, 90],
    lastChecked: "5 giây trước",
  },
  {
    id: "vps-03",
    name: "API Gateway",
    ip: "185.22.33.44",
    location: "Hà Nội",
    status: "warning",
    os: "Debian 11",
    uptime: "8 ngày 22 giờ",
    cpu: 89,
    ram: { used: 3.5, total: 4 },
    disk: { used: 35, total: 40 },
    networkIn: 340.5,
    networkOut: 128.9,
    cpuHistory: [70, 75, 80, 85, 88, 92, 95, 90, 88, 85, 87, 89],
    ramHistory: [80, 82, 85, 87, 88, 86, 84, 85, 87, 88, 86, 87],
    lastChecked: "3 giây trước",
  },
  {
    id: "vps-04",
    name: "Mail Server",
    ip: "45.77.88.99",
    location: "TP.HCM",
    status: "offline",
    os: "Ubuntu 20.04 LTS",
    uptime: "—",
    cpu: 0,
    ram: { used: 0, total: 2 },
    disk: { used: 12, total: 40 },
    networkIn: 0,
    networkOut: 0,
    cpuHistory: [30, 28, 25, 20, 15, 10, 5, 0, 0, 0, 0, 0],
    ramHistory: [40, 38, 35, 30, 25, 20, 10, 0, 0, 0, 0, 0],
    lastChecked: "2 phút trước",
  },
  {
    id: "vps-05",
    name: "Backup Server",
    ip: "172.16.0.100",
    location: "Đà Nẵng",
    status: "online",
    os: "Rocky Linux 9",
    uptime: "200 ngày 3 giờ",
    cpu: 12,
    ram: { used: 1.2, total: 4 },
    disk: { used: 320, total: 500 },
    networkIn: 5.2,
    networkOut: 2.1,
    cpuHistory: [8, 10, 12, 15, 10, 8, 12, 14, 10, 8, 11, 12],
    ramHistory: [28, 30, 29, 31, 30, 28, 29, 30, 31, 29, 30, 30],
    lastChecked: "8 giây trước",
  },
  {
    id: "vps-06",
    name: "Staging Server",
    ip: "192.168.1.50",
    location: "Singapore",
    status: "online",
    os: "Ubuntu 22.04 LTS",
    uptime: "15 ngày 8 giờ",
    cpu: 45,
    ram: { used: 3.1, total: 8 },
    disk: { used: 55, total: 100 },
    networkIn: 78.3,
    networkOut: 45.6,
    cpuHistory: [35, 40, 45, 50, 48, 42, 38, 40, 45, 48, 43, 45],
    ramHistory: [35, 37, 38, 40, 39, 37, 38, 39, 40, 38, 38, 39],
    lastChecked: "12 giây trước",
  },
];
