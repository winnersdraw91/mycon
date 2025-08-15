# 🚀 Hosting Guide - Self-Hosted Chat Application

This guide provides step-by-step instructions for hosting your chat application on various platforms, from simple static hosting to full-stack deployment.

## 📋 Table of Contents

1. [Quick Start (Static Hosting)](#quick-start-static-hosting)
2. [VPS/Cloud Server Deployment](#vpscloud-server-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Platform-Specific Guides](#platform-specific-guides)
5. [Domain & SSL Setup](#domain--ssl-setup)
6. [Production Considerations](#production-considerations)

---

## 🚀 Quick Start (Static Hosting)

### Option 1: GitHub Pages (Free)

**Step 1: Create GitHub Repository**
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/chat-app.git
git branch -M main
git push -u origin main
```

**Step 2: Enable GitHub Pages**
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Select **Deploy from a branch**
4. Choose **main** branch and **/ (root)**
5. Click **Save**

**Step 3: Access Your App**
- Your app will be available at: `https://yourusername.github.io/chat-app/`
- Demo page: `https://yourusername.github.io/chat-app/demo.html`
- Admin dashboard: `https://yourusername.github.io/chat-app/admin.html`

### Option 2: Netlify (Free)

**Step 1: Deploy via Drag & Drop**
1. Go to [netlify.com](https://netlify.com)
2. Sign up for free account
3. Drag your `chat-app` folder to the deploy area
4. Your site will be live instantly!

**Step 2: Custom Domain (Optional)**
1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow DNS configuration instructions

### Option 3: Vercel (Free)

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Deploy**
```bash
# In your chat-app directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: chat-app
# - Directory: ./
```

**Step 3: Access Your App**
- Vercel will provide a URL like: `https://chat-app-xyz.vercel.app`

---

## 🖥️ VPS/Cloud Server Deployment

### Prerequisites
- VPS with Ubuntu 20.04+ (DigitalOcean, Linode, AWS EC2, etc.)
- Root or sudo access
- Domain name (optional but recommended)

### Step 1: Server Setup

**Connect to your server:**
```bash
ssh root@your-server-ip
```

**Update system:**
```bash
apt update && apt upgrade -y
```

**Install required packages:**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install Nginx
apt install nginx -y

# Install PM2 (Process Manager)
npm install -g pm2

# Install Git
apt install git -y
```

### Step 2: Deploy Application

**Clone your repository:**
```bash
cd /var/www
git clone https://github.com/yourusername/chat-app.git
cd chat-app
```

**Install dependencies:**
```bash
npm install
```

**Create production server file:**
```bash
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'demo.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
EOF
```

**Start with PM2:**
```bash
pm2 start server.js --name "chat-app"
pm2 startup
pm2 save
```

### Step 3: Configure Nginx

**Create Nginx configuration:**
```bash
cat > /etc/nginx/sites-available/chat-app << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

**Enable site:**
```bash
ln -s /etc/nginx/sites-available/chat-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 4: Configure Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## 🐳 Docker Deployment

### Step 1: Create Dockerfile

```bash
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
EOF
```

### Step 2: Create Docker Compose

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  chat-app:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - chat-app
    restart: unless-stopped
EOF
```

### Step 3: Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🌐 Platform-Specific Guides

### AWS EC2 + CloudFront

**Step 1: Launch EC2 Instance**
1. Choose Ubuntu 20.04 LTS
2. Select t2.micro (free tier)
3. Configure security group (ports 22, 80, 443)
4. Launch with key pair

**Step 2: Deploy Application**
- Follow VPS deployment steps above

**Step 3: Setup CloudFront**
1. Create CloudFront distribution
2. Set origin to your EC2 public IP
3. Configure caching behaviors
4. Add custom domain if needed

### DigitalOcean Droplet

**Step 1: Create Droplet**
```bash
# Using doctl CLI
doctl compute droplet create chat-app \
  --size s-1vcpu-1gb \
  --image ubuntu-20-04-x64 \
  --region nyc1 \
  --ssh-keys your-ssh-key-id
```

**Step 2: Deploy**
- Follow VPS deployment steps above

### Google Cloud Platform

**Step 1: Create VM Instance**
```bash
gcloud compute instances create chat-app \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-micro \
  --zone=us-central1-a
```

**Step 2: Deploy**
- Follow VPS deployment steps above

---

## 🔒 Domain & SSL Setup

### Step 1: Point Domain to Server

**DNS Records:**
```
Type: A
Name: @
Value: your-server-ip
TTL: 3600

Type: A
Name: www
Value: your-server-ip
TTL: 3600
```

### Step 2: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
certbot renew --dry-run
```

### Step 3: Update Nginx Configuration

Certbot will automatically update your Nginx config, but verify:

```bash
nginx -t
systemctl reload nginx
```

---

## ⚙️ Production Considerations

### Performance Optimization

**1. Enable Gzip Compression**
```nginx
# Add to Nginx config
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

**2. Browser Caching**
```nginx
# Add to Nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**3. Security Headers**
```nginx
# Add to Nginx config
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Monitoring & Logging

**1. Setup Log Rotation**
```bash
cat > /etc/logrotate.d/chat-app << 'EOF'
/var/log/chat-app/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF
```

**2. Monitor with PM2**
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart if needed
pm2 restart chat-app
```

### Backup Strategy

**1. Automated Backups**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/chat-app_$DATE"

mkdir -p $BACKUP_DIR
cp -r /var/www/chat-app $BACKUP_DIR/
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Keep only last 7 backups
find /backups -name "chat-app_*.tar.gz" -mtime +7 -delete
```

**2. Setup Cron Job**
```bash
# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /path/to/backup.sh
```

### Environment Variables

**Create .env file:**
```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DOMAIN=your-domain.com
SSL_ENABLED=true
LOG_LEVEL=info
EOF
```

### Health Checks

**Create health check endpoint:**
```javascript
// Add to server.js
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

---

## 🆘 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 PID
```

**2. Nginx Configuration Error**
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log
```

**3. PM2 Process Not Starting**
```bash
# Check PM2 logs
pm2 logs chat-app

# Restart PM2
pm2 restart chat-app
```

**4. SSL Certificate Issues**
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew --force-renewal
```

### Performance Issues

**1. High Memory Usage**
```bash
# Check memory usage
free -h
top

# Restart application
pm2 restart chat-app
```

**2. Slow Response Times**
```bash
# Check server load
uptime
htop

# Analyze Nginx logs
tail -f /var/log/nginx/access.log
```

---

## 📞 Support

If you encounter issues:

1. Check the logs: `pm2 logs` and `/var/log/nginx/error.log`
2. Verify all services are running: `systemctl status nginx` and `pm2 status`
3. Test connectivity: `curl http://localhost:3000/health`
4. Check firewall settings: `ufw status`

---

**🎉 Congratulations! Your chat application is now live and ready to serve your users!**