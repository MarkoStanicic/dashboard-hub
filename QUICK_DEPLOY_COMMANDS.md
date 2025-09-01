# ⚡ Quick Deploy Commands

**Essential commands for Dashboard Hub deployment**

---

## 🏗️ **Server Setup Commands**

### **Install EasyPanel on Hetzner**
```bash
# SSH into your server
ssh root@your-server-ip

# Install EasyPanel
curl -sSL https://get.easypanel.io | sh

# Access EasyPanel
# Navigate to: http://your-server-ip:3001
```

---

## 📦 **Application Deployment**

### **Upload Project to Server**
```bash
# Compress project (run locally)
tar -czf dashboard-hub.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .

# Upload to server
scp dashboard-hub.tar.gz root@your-server-ip:/opt/

# Extract on server
ssh root@your-server-ip
cd /opt
tar -xzf dashboard-hub.tar.gz
mv dashboard-hub dashboard-hub-app
```

### **Or Use Git (Alternative)**
```bash
# On server
cd /opt
git clone https://github.com/yourusername/dashboard-hub.git
cd dashboard-hub
```

---

## ⚙️ **Environment Configuration**

### **Create Production Environment**
```bash
# On server, in project directory
cp .env.production.template .env.production

# Edit with your values
nano .env.production
```

**Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://igocndtvggqhjlpqvzfk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://dashboard.your-domain.com
NODE_ENV=production
```

---

## 🐳 **Docker Deployment**

### **Build and Run with Docker Compose**
```bash
# Build and start
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Check health
curl http://localhost:3000/api/health
```

### **Individual Docker Commands**
```bash
# Build image
docker build -t dashboard-hub .

# Run container
docker run -d \
  --name dashboard-hub-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  dashboard-hub

# Check container
docker ps
docker logs dashboard-hub-app -f
```

---

## 🌐 **EasyPanel Configuration**

### **Create Service in EasyPanel**
1. **Dashboard** → **Services** → **Create Service**
2. **Type**: "App" or "Compose"
3. **Name**: `dashboard-hub`
4. **Source**: Upload or Git repository

### **Environment Variables in EasyPanel**
```
NEXT_PUBLIC_SUPABASE_URL=https://igocndtvggqhjlpqvzfk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://dashboard.your-domain.com
NODE_ENV=production
PORT=3000
```

### **Domain Configuration**
1. **Service** → **Domains** → **Add Domain**
2. **Domain**: `dashboard.your-domain.com`
3. **SSL**: Enable (Let's Encrypt)
4. **Force HTTPS**: Enable

---

## 🧪 **Testing Commands**

### **Health Checks**
```bash
# Local health check
curl http://localhost:3000/api/health

# Production health check
curl https://dashboard.your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### **Integration Testing**
```bash
# Test Supabase connection
curl -X POST https://dashboard.your-domain.com/api/integrations/test \
  -H "Content-Type: application/json" \
  -d '{"platform": "supabase"}'

# Test each integration through the UI:
# 1. Register/login user
# 2. Add Salesforce integration
# 3. Add Tableau integration  
# 4. Add Power BI integration
# 5. Sync dashboards
# 6. View embedded dashboards
```

---

## 🔧 **Troubleshooting Commands**

### **Container Management**
```bash
# Restart application
docker restart dashboard-hub-app

# Stop application
docker stop dashboard-hub-app

# Remove and recreate
docker rm dashboard-hub-app
docker-compose up -d --build

# Check resource usage
docker stats dashboard-hub-app
```

### **Log Analysis**
```bash
# View recent logs
docker logs dashboard-hub-app --tail=100

# Follow logs in real-time
docker logs dashboard-hub-app -f

# Filter for errors
docker logs dashboard-hub-app 2>&1 | grep -i error

# Check system resources
df -h
free -h
top
```

### **Debug Network Issues**
```bash
# Test internal connectivity
docker exec dashboard-hub-app curl http://localhost:3000/api/health

# Check port binding
netstat -tlnp | grep 3000

# Test external access
curl -I https://dashboard.your-domain.com
```

---

## 🚀 **Update/Redeploy Commands**

### **Update Application**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Verify deployment
curl https://dashboard.your-domain.com/api/health
```

### **Rollback Commands**
```bash
# Stop current version
docker-compose down

# Restore from backup
cp docker-compose.yml.backup docker-compose.yml

# Start previous version
docker-compose up -d
```

---

## 📊 **Monitoring Commands**

### **System Monitoring**
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check Docker resources
docker system df
```

### **Application Monitoring**
```bash
# Check application status
curl -s https://dashboard.your-domain.com/api/health | jq .

# Monitor response times
time curl -s https://dashboard.your-domain.com/api/health

# Check SSL certificate
openssl s_client -connect dashboard.your-domain.com:443 -servername dashboard.your-domain.com
```

---

## 🆘 **Emergency Commands**

### **Quick Restart**
```bash
# Full restart
docker-compose restart

# Force restart
docker-compose down && docker-compose up -d
```

### **Emergency Rollback**
```bash
# Stop all services
docker-compose down

# Start with previous configuration
docker-compose -f docker-compose.yml.backup up -d
```

### **Clean Slate Rebuild**
```bash
# Stop and remove everything
docker-compose down -v
docker system prune -a -f

# Rebuild from scratch
docker-compose up -d --build
```

---

**🎯 Keep this reference handy during deployment!**
