# VPS Monitor Backend

Backend Node.js để thu thập dữ liệu từ các VPS Linux qua SSH.

## Cài đặt

```bash
cd backend
npm install
```

## Chạy

```bash
npm start
# Server chạy trên port 3131
```

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/servers` | Lấy dữ liệu tất cả VPS (SSH vào từng server) |
| POST | `/api/servers` | Thêm VPS mới |
| DELETE | `/api/servers/:id` | Xóa VPS |
| GET | `/api/geoip/:ip` | Lấy thông tin vị trí từ IP |

### POST /api/servers Body

```json
{
  "name": "Web Server",
  "ip": "103.45.67.12",
  "port": "22",
  "username": "root",
  "password": "your_password",
  "location": "Singapore",
  "country": "SG",
  "lat": 1.3521,
  "lng": 103.8198
}
```

## Bảo mật

- Tất cả thông tin đăng nhập VPS được mã hóa **AES-256-GCM**
- File `.encryption.key` được tạo tự động lần đầu
- File dữ liệu `data/servers.enc` chỉ có thể giải mã với key
- **QUAN TRỌNG**: Giữ file `.encryption.key` an toàn, mất key = mất dữ liệu

## Cấu trúc

```
backend/
├── server.js          # Main server + API + SSH collector
├── package.json       # Dependencies
├── .encryption.key    # Auto-generated (DO NOT SHARE)
└── data/
    └── servers.enc    # Encrypted server credentials
```

## Kết nối Frontend

Trong frontend, thay đổi URL API từ mock data sang:

```javascript
const API_URL = 'http://YOUR_VPS_IP:3131';

// Fetch servers
fetch(`${API_URL}/api/servers`)
  .then(res => res.json())
  .then(data => setServers(data));
```
