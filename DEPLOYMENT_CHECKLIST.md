# ✅ Dashboard Hub - Deployment Checklist

**Complete checklist for deploying to production**

---

## 🚀 Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] **All features working** in development
- [ ] **No console errors** in browser
- [ ] **All integrations tested** locally
- [ ] **Environment variables** configured
- [ ] **Production build** successful: `npm run build`

### ✅ Docker Configuration
- [ ] **Dockerfile** created ✅
- [ ] **docker-compose.yml** configured ✅
- [ ] **Health check endpoint** working: `/api/health` ✅
- [ ] **Local Docker test**: `npm run docker:build && npm run docker:run`

### ✅ Environment Setup
- [ ] **Production environment** file created from template
- [ ] **Supabase credentials** updated for production
- [ ] **Integration credentials** documented
- [ ] **Domain/subdomain** configured

---

## 🏗️ Infrastructure Setup

### ✅ Hetzner Cloud Server
- [ ] **Server created** (minimum 2GB RAM)
- [ ] **SSH access** configured
- [ ] **Firewall rules** set (ports 80, 443, 22)
- [ ] **Domain DNS** pointed to server IP

### ✅ EasyPanel Installation
- [ ] **EasyPanel installed**: `curl -sSL https://get.easypanel.io | sh`
- [ ] **EasyPanel accessible** via web interface
- [ ] **SSL certificates** configured (Let's Encrypt)

---

## 🔐 External Services Configuration

### ✅ Supabase
- [ ] **Production URLs updated** in Authentication settings
- [ ] **Site URL**: `https://dashboard.your-domain.com`
- [ ] **Redirect URLs**: `https://dashboard.your-domain.com/auth/callback`
- [ ] **RLS policies** enabled and tested
- [ ] **Database schema** up to date

### ✅ Salesforce
- [ ] **Connected App** callback URL updated
- [ ] **Callback URL**: `https://dashboard.your-domain.com/auth/callback`
- [ ] **OAuth scopes** configured correctly
- [ ] **IP restrictions** relaxed or configured
- [ ] **Credentials** documented

### ✅ Tableau
- [ ] **Server URL** configured for production
- [ ] **Personal Access Token** generated (recommended)
- [ ] **Workbook permissions** set (public or trusted auth)
- [ ] **Trusted domains** updated if using embedded auth

### ✅ Power BI
- [ ] **Azure AD app** redirect URIs updated
- [ ] **Redirect URI**: `https://dashboard.your-domain.com/auth/callback`
- [ ] **API permissions** granted and admin consent given
- [ ] **Power BI Admin Portal** settings enabled:
  - [ ] Service principals can call Fabric public APIs
  - [ ] Service principals can access read-only admin APIs
  - [ ] Embed content in apps
- [ ] **Security group** configured with service principal

---

## 🚀 Deployment Process

### ✅ Initial Deployment
- [ ] **Upload project** to server
- [ ] **Environment variables** configured in EasyPanel
- [ ] **Docker image** built successfully
- [ ] **Container** started without errors
- [ ] **Health check** passes: `curl https://dashboard.your-domain.com/api/health`

### ✅ Domain & SSL
- [ ] **Domain** configured in EasyPanel
- [ ] **SSL certificate** generated (Let's Encrypt)
- [ ] **HTTPS redirect** working
- [ ] **Custom domain** accessible

---

## 🧪 Post-Deployment Testing

### ✅ Basic Functionality
- [ ] **Homepage** loads correctly
- [ ] **User registration** works
- [ ] **User login** works
- [ ] **Password reset** works
- [ ] **Navigation** between pages works

### ✅ Integration Testing
- [ ] **Salesforce connection** test passes
- [ ] **Salesforce dashboards** sync successfully
- [ ] **Salesforce dashboards** display without auth prompts

- [ ] **Tableau connection** test passes
- [ ] **Tableau workbooks** discovered
- [ ] **Tableau workbooks** embed correctly

- [ ] **Power BI connection** test passes
- [ ] **Power BI dashboards** sync successfully
- [ ] **Power BI embed tokens** generate successfully
- [ ] **Power BI dashboards** embed with JavaScript SDK

### ✅ Performance & Security
- [ ] **Page load times** acceptable
- [ ] **SSL certificates** valid
- [ ] **Security headers** present
- [ ] **API endpoints** respond correctly
- [ ] **Error handling** working properly

---

## 📊 Monitoring Setup

### ✅ Health Monitoring
- [ ] **Health endpoint** responding: `/api/health`
- [ ] **EasyPanel monitoring** configured
- [ ] **Resource usage** monitored
- [ ] **Application logs** accessible

### ✅ Backup Strategy
- [ ] **Supabase backups** enabled (automatic)
- [ ] **Application source** in Git repository
- [ ] **Environment configuration** securely backed up
- [ ] **External service configurations** documented

---

## 🔧 Troubleshooting Commands

### Quick Debug Commands
```bash
# Check container status
docker ps

# View application logs
docker logs dashboard-hub-app -f

# Test health endpoint
curl https://dashboard.your-domain.com/api/health

# Restart application
docker restart dashboard-hub-app

# Check resource usage
docker stats dashboard-hub-app
```

### Common Issues
```bash
# 500 errors → Check application logs
docker logs dashboard-hub-app

# SSL issues → Check EasyPanel domain configuration
# Integration errors → Verify external service credentials
# Performance issues → Check server resources
```

---

## 🎯 Success Criteria

### ✅ All Systems Go
- [ ] **Application accessible** at production domain
- [ ] **All integrations working** without user auth prompts
- [ ] **Dashboards loading** correctly from all platforms
- [ ] **User experience** smooth and responsive
- [ ] **No critical errors** in application logs
- [ ] **SSL certificate** valid and automatic renewal set

### ✅ Documentation Complete
- [ ] **Deployment guide** available
- [ ] **Credentials reference** secured
- [ ] **Troubleshooting steps** documented
- [ ] **Monitoring procedures** in place

---

## 🚀 Go Live!

**Once all items are checked:**

1. **Announce** the production deployment
2. **Monitor** application performance
3. **Test** all critical user journeys
4. **Document** any issues and resolutions
5. **Celebrate** successful deployment! 🎉

**Production URL**: `https://dashboard.your-domain.com`

---

**📞 Emergency Procedures**: If anything goes wrong, check the troubleshooting section and application logs first. Always have the previous working version ready for quick rollback.
