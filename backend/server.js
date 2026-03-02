const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const app = express();
const PORT = 3131;

// Encryption config
const ALGORITHM = 'aes-256-gcm';
const KEY_FILE = path.join(__dirname, '.encryption.key');
const DATA_FILE = path.join(__dirname, 'data/servers.enc');

// Generate or load encryption key
function getEncryptionKey() {
  if (fs.existsSync(KEY_FILE)) {
    return Buffer.from(fs.readFileSync(KEY_FILE, 'utf8'), 'hex');
  }
  const key = crypto.randomBytes(32);
  fs.writeFileSync(KEY_FILE, key.toString('hex'), { mode: 0o600 });
  console.log('🔑 Encryption key generated. Keep .encryption.key safe!');
  return key;
}

const ENCRYPTION_KEY = getEncryptionKey();

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), encrypted, authTag: authTag.toString('hex') };
}

function decrypt(data) {
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, Buffer.from(data.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function loadServers() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const encData = JSON.parse(raw);
    return JSON.parse(decrypt(encData));
  } catch (e) {
    console.error('Failed to decrypt server data:', e.message);
    return [];
  }
}

function saveServers(servers) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const encData = encrypt(JSON.stringify(servers));
  fs.writeFileSync(DATA_FILE, JSON.stringify(encData), { mode: 0o600 });
}

// SSH commands to collect server data
const COMMANDS = {
  hostname: 'hostname',
  os: 'cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d \'"\'',
  uptime: 'uptime -p',
  cpuModel: 'cat /proc/cpuinfo | grep "model name" | head -1 | cut -d: -f2 | xargs',
  cpuCores: 'nproc --all',
  cpuThreads: 'grep -c ^processor /proc/cpuinfo',
  cpuSpeed: 'lscpu | grep "MHz" | head -1 | awk \'{print $NF}\'',
  cpuCache: 'lscpu | grep "L3 cache" | awk \'{print $3, $4}\'',
  cpuArch: 'uname -m',
  cpuUsage: 'top -bn1 | grep "Cpu(s)" | awk \'{print $2}\'',
  ramTotal: 'free -g | awk \'/^Mem:/{print $2}\'',
  ramUsed: 'free -g | awk \'/^Mem:/{print $3}\'',
  diskTotal: 'df -BG / | tail -1 | awk \'{print $2}\' | tr -d G',
  diskUsed: 'df -BG / | tail -1 | awk \'{print $3}\' | tr -d G',
  networkRx: 'cat /proc/net/dev | grep -v lo | tail -n+3 | awk \'{sum+=$2} END {printf "%.1f", sum/1024/1024}\'',
  networkTx: 'cat /proc/net/dev | grep -v lo | tail -n+3 | awk \'{sum+=$10} END {printf "%.1f", sum/1024/1024}\'',
};

function collectServerData(serverConfig) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const results = {};
    const cmdEntries = Object.entries(COMMANDS);
    let completed = 0;

    conn.on('ready', () => {
      const allCmds = cmdEntries.map(([k, v]) => `echo "###${k}###"; ${v}`).join('; ');
      conn.exec(allCmds, (err, stream) => {
        if (err) { conn.end(); return reject(err); }
        let output = '';
        stream.on('data', (data) => { output += data.toString(); });
        stream.on('close', () => {
          conn.end();
          // Parse output
          cmdEntries.forEach(([key]) => {
            const regex = new RegExp(`###${key}###\\n?([^#]*?)(?=###|$)`);
            const match = output.match(regex);
            results[key] = match ? match[1].trim() : '';
          });
          resolve({
            id: serverConfig.id,
            index: serverConfig.index,
            name: serverConfig.name,
            ip: serverConfig.ip,
            location: serverConfig.location || 'Unknown',
            country: serverConfig.country || 'XX',
            lat: serverConfig.lat || 0,
            lng: serverConfig.lng || 0,
            status: 'online',
            os: results.os || 'Unknown',
            uptime: results.uptime || 'Unknown',
            cpu: parseFloat(results.cpuUsage) || 0,
            cpuModel: results.cpuModel || 'Unknown',
            cpuCores: parseInt(results.cpuCores) || 0,
            cpuThreads: parseInt(results.cpuThreads) || 0,
            cpuSpeed: results.cpuSpeed ? `${(parseFloat(results.cpuSpeed) / 1000).toFixed(2)} GHz` : 'Unknown',
            cpuCache: results.cpuCache || 'Unknown',
            cpuArch: results.cpuArch || 'Unknown',
            ram: { used: parseFloat(results.ramUsed) || 0, total: parseFloat(results.ramTotal) || 0 },
            disk: { used: parseInt(results.diskUsed) || 0, total: parseInt(results.diskTotal) || 0 },
            networkIn: parseFloat(results.networkRx) || 0,
            networkOut: parseFloat(results.networkTx) || 0,
            cpuHistory: [],
            ramHistory: [],
            lastChecked: new Date().toLocaleString('vi-VN'),
          });
        });
      });
    });

    conn.on('error', (err) => {
      resolve({
        id: serverConfig.id,
        index: serverConfig.index,
        name: serverConfig.name,
        ip: serverConfig.ip,
        location: serverConfig.location || 'Unknown',
        country: serverConfig.country || 'XX',
        lat: serverConfig.lat || 0,
        lng: serverConfig.lng || 0,
        status: 'offline',
        os: 'N/A',
        uptime: '—',
        cpu: 0,
        cpuModel: 'N/A',
        cpuCores: 0,
        cpuThreads: 0,
        cpuSpeed: 'N/A',
        cpuCache: 'N/A',
        cpuArch: 'N/A',
        ram: { used: 0, total: 0 },
        disk: { used: 0, total: 0 },
        networkIn: 0,
        networkOut: 0,
        cpuHistory: [],
        ramHistory: [],
        lastChecked: new Date().toLocaleString('vi-VN'),
      });
    });

    conn.connect({
      host: serverConfig.ip,
      port: parseInt(serverConfig.port) || 22,
      username: serverConfig.username,
      password: serverConfig.password,
      readyTimeout: 10000,
    });
  });
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// CPU history storage (in-memory, per session)
const cpuHistoryMap = {};

// API Routes
app.get('/api/servers', async (req, res) => {
  try {
    const configs = loadServers();
    const results = await Promise.all(configs.map((c) => collectServerData(c)));

    // Update CPU history
    results.forEach((r) => {
      if (!cpuHistoryMap[r.id]) cpuHistoryMap[r.id] = [];
      cpuHistoryMap[r.id].push(r.cpu);
      if (cpuHistoryMap[r.id].length > 12) cpuHistoryMap[r.id].shift();
      r.cpuHistory = [...cpuHistoryMap[r.id]];
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/servers', (req, res) => {
  const { name, ip, port, username, password, location, country, lat, lng } = req.body;

  if (!name || !ip || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields: name, ip, username, password' });
  }

  const servers = loadServers();
  const newServer = {
    id: `vps-${Date.now()}`,
    index: servers.length + 1,
    name,
    ip,
    port: port || '22',
    username,
    password,
    location: location || '',
    country: country || '',
    lat: lat || 0,
    lng: lng || 0,
  };

  servers.push(newServer);
  saveServers(servers);

  res.json({ success: true, id: newServer.id, message: 'Server added successfully' });
});

app.delete('/api/servers/:id', (req, res) => {
  let servers = loadServers();
  const before = servers.length;
  servers = servers.filter((s) => s.id !== req.params.id);

  if (servers.length === before) {
    return res.status(404).json({ error: 'Server not found' });
  }

  // Re-index
  servers.forEach((s, i) => { s.index = i + 1; });
  saveServers(servers);
  delete cpuHistoryMap[req.params.id];

  res.json({ success: true, message: 'Server removed successfully' });
});

// IP geolocation proxy (to avoid CORS issues on frontend)
app.get('/api/geoip/:ip', async (req, res) => {
  try {
    const response = await fetch(`http://ip-api.com/json/${req.params.ip}?fields=status,country,countryCode,city,lat,lon,isp,org`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch geo data' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🖥️  VPS Monitor Backend running on port ${PORT}`);
  console.log(`📡 API: http://0.0.0.0:${PORT}/api/servers`);
  console.log(`🔒 Data encrypted with AES-256-GCM\n`);
});
