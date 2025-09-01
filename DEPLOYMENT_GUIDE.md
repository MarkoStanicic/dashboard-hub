# 🚀 Dashboard Hub - Deployment Guide

Complete guide for deploying Dashboard Hub on **Hetzner + EasyPanel**

## 📋 Prerequisites

- **Hetzner Cloud Server** (minimum 2GB RAM recommended)
- **EasyPanel** installed on your server
- **Domain/Subdomain** pointed to your server
- **Supabase** project set up
- **Integration credentials** (Salesforce, Tableau, Power BI)

---

## 🏗️ Step 1: Server Setup

### Hetzner Cloud Server
1. **Create Server**: Ubuntu 22.04 LTS (minimum 2GB RAM)
2. **Configure Firewall**: Allow ports 80, 443, 22
3. **Point Domain**: Update DNS A record to server IP

### EasyPanel Installation
```bash
# SSH into your server
ssh root@your-server-ip

# Install EasyPanel
curl -sSL https://get.easypanel.io | sh
```

---

## 🐳 Step 2: Prepare Application

### Clone Repository
```bash
git clone https://github.com/yourusername/dashboard-hub.git
cd dashboard-hub
```

### Environment Configuration
```bash
# Copy production environment template
cp .env.production.template .env.production

# Edit with your values
nano .env.production
```

**Required Environment Variables:**
```env
# Supabase (from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dashboard.your-domain.com
BYPASS_AUTH_FOR_TESTING=false
```

---

## 🚀 Step 3: Deploy with EasyPanel

### Method 1: Docker Compose (Recommended)

1. **Upload Files**: Upload your project to server
2. **In EasyPanel Dashboard**:
   - Create new **"Compose"** service
   - Name: `dashboard-hub`
   - Upload your `docker-compose.yml`
   - Set environment variables
   - Deploy

### Method 2: Single Container

1. **In EasyPanel Dashboard**:
   - Create new **"App"** service
   - **Source**: GitHub repository or Docker image
   - **Build**: Node.js application
   - **Port**: 3000
   - **Environment**: Add variables from `.env.production`

---

## 🌐 Step 4: Domain & SSL

### Configure Domain
1. **EasyPanel Dashboard** → Your App → **Domains**
2. **Add Domain**: `dashboard.your-domain.com`
3. **Enable SSL**: Auto-generated via Let's Encrypt
4. **Force HTTPS**: Enabled

### Update Supabase URLs
1. **Supabase Dashboard** → Authentication → **URL Configuration**
2. **Site URL**: `https://dashboard.your-domain.com`
3. **Redirect URLs**: Add your production domain

---

## ⚙️ Step 5: Integration Setup

### Update Integration Configurations

After deployment, you'll need to update integration callbacks:

#### Salesforce
- **Callback URL**: `https://dashboard.your-domain.com/auth/callback`
- **Trusted URLs**: Add your production domain

#### Tableau  
- **Server URL**: Your Tableau Cloud instance
- **Trusted Domains**: Add your production domain

#### Power BI
- **Redirect URIs**: `https://dashboard.your-domain.com/auth/callback`
- **Azure AD App**: Update with production domain

---

## 🔧 Step 6: Post-Deployment

### Verify Health
```bash
curl https://dashboard.your-domain.com/api/health
```

### Test Features
1. ✅ **User Registration/Login**
2. ✅ **Integration Connections**
3. ✅ **Dashboard Syncing**
4. ✅ **Dashboard Embedding**

### Monitor Logs
```bash
# In EasyPanel Dashboard
App → Logs → View real-time logs
```

---

## 🔍 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Check Node.js version compatibility
# Ensure all dependencies are installed
# Verify environment variables
```

#### 500 Errors
- Check **Supabase connection**
- Verify **environment variables**
- Check **API logs** in EasyPanel

#### Integration Errors
- Update **callback URLs** in external services
- Verify **SSL certificates**
- Check **CORS settings**

### Debug Commands
```bash
# Container logs
docker logs dashboard-hub-app

# Health check
curl -f http://localhost:3000/api/health

# Database connectivity
# Check Supabase logs
```

---

## 📊 Monitoring & Maintenance

### Health Monitoring
- **Endpoint**: `/api/health`
- **Docker healthcheck**: Configured automatically
- **EasyPanel monitoring**: Built-in

### Backup Strategy
- **Supabase**: Automatic backups
- **Application**: Git repository
- **Environment**: Secure .env.production

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild in EasyPanel
# Or use CI/CD with GitHub Actions
```

---

## 🚀 Performance Optimization

### Production Optimizations
- ✅ **Next.js standalone output**
- ✅ **Docker multi-stage build**
- ✅ **Static asset optimization**
- ✅ **Gzip compression**

### Scaling Options
- **Vertical**: Upgrade server resources
- **Horizontal**: EasyPanel load balancer
- **CDN**: Cloudflare integration

---

## 🔐 Security Checklist

- ✅ **HTTPS enabled**
- ✅ **Environment variables secured**
- ✅ **Supabase RLS enabled**
- ✅ **API authentication required**
- ✅ **CORS properly configured**
- ✅ **No sensitive data in logs**

---

## 🆘 Support

### Logs Access
- **EasyPanel**: Dashboard → App → Logs
- **Application**: `/api/health` endpoint
- **Database**: Supabase Dashboard

### Common Commands
```bash
# Restart application
docker restart dashboard-hub-app

# View logs
docker logs dashboard-hub-app -f

# Check disk space
df -h
```

---

## 🎉 Success!

Your Dashboard Hub should now be live at:
**🌐 https://dashboard.your-domain.com**

Test all integrations with the credentials document to ensure everything works in production!
