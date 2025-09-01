# 🔐 Integration Credentials Reference

**Dashboard Hub - Production Testing Credentials**

> ⚠️ **SECURITY NOTE**: This document contains sensitive information. Keep it secure and never commit to version control.

---

## 🔧 Supabase Configuration

### Database Connection
```env
NEXT_PUBLIC_SUPABASE_URL=https://igocndtvggqhjlpqvzfk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnb2NuZHR2Z2dxaGpscHF2emZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODQ3NjMsImV4cCI6MjA2OTM2MDc2M30.hLzpbQQHA51DBqXrXbNx_LfxB3tMLrvpuEr0mvsukag
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnb2NuZHR2Z2dxaGpscHF2emZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4NDc2MywiZXhwIjoyMDY5MzYwNzYzfQ.ZPYIXJ2xBezZ2t6vH39Y66n3o10K1n3WIEDYTfSvAc8
```

**✅ For Production**: Update Site URL and Redirect URLs in Supabase Dashboard:
- **Site URL**: `https://dashboard.your-domain.com`
- **Redirect URLs**: `https://dashboard.your-domain.com/auth/callback`

---

## 🌐 Salesforce Integration

### Connected App Configuration
```
App Name: Dashboard Hub Integration
Consumer Key: 3MVG9dAEux2v1sLvCxiEXDUeD0X.64xFhEBVsl1XOzbGCvZg5zXz9U3CkPECblAb8Ssko9R.MzQbxZ0CdypBY
Consumer Secret: 47BE2CA54A06D35E8C4A8A2CB95C8CD05665F93117E510730CBF33A1F6F88AD3
```

### User Credentials
```
Username: marko.b.stanicic822@agentforce.com
Password: Sepultura!987
Security Token: S4BzMZh80WOmjCUpW7wkbIkO
Instance URL: https://orgfarm-e4a5ef21df-dev-ed.develop.my.salesforce.com
Sandbox: true
```

### OAuth Settings
```
Callback URL: https://dashboard.your-domain.com/auth/callback
OAuth Scopes: api, refresh_token, offline_access, wave_api
IP Relaxation: Relax IP restrictions
```

**🔧 For Production**: Update Callback URL in Salesforce Connected App settings

---

## 📊 Tableau Integration

### Tableau Cloud Configuration
```
Server URL: https://your-server.online.tableau.com
Site ID: your-site-id (if not default)
```

### Personal Access Token (Recommended)
```
PAT Name: dashboard-hub-integration
PAT Secret: [Generate new PAT in Tableau Cloud]
```

### Alternative: Username/Password
```
Username: your-tableau-username
Password: your-tableau-password
```

**🔧 For Production**: 
1. Generate new PAT in Tableau Cloud → Settings → Personal Access Tokens
2. Update workbook permissions for public access or trusted authentication

---

## ⚡ Power BI Integration

### Azure AD App Registration
```
Application Name: Dashboard Hub
Application (Client) ID: your-client-id-here
Directory (Tenant) ID: your-tenant-id-here
Client Secret: W.U8Q~SyQiVbNoI0GQVduBncKSNVR1Xw~3Ac9bXF
```

### API Permissions (Required)
```
Power BI Service:
✅ Dataset.Read.All (Delegated)
✅ Dashboard.Read.All (Delegated)  
✅ Report.Read.All (Delegated)
✅ Workspace.Read.All (Delegated)
✅ Content.Create (Delegated)
```

### Power BI Admin Portal Settings
```
✅ Service principals can call Fabric public APIs
✅ Service principals can create workspaces, connections, and deployment pipelines  
✅ Allow service principals to create and use profiles
✅ Service principals can access read-only admin APIs
✅ Embed content in apps
```

**🔧 For Production**: 
1. Update Redirect URIs in Azure AD: `https://dashboard.your-domain.com/auth/callback`
2. Ensure service principal is in the security group configured in Power BI Admin Portal

---

## 🧪 Testing Checklist

### After Deployment, Test These:

#### ✅ Authentication
- [ ] User registration works
- [ ] User login works  
- [ ] Password reset works

#### ✅ Salesforce Integration
- [ ] Connection test passes
- [ ] Dashboard sync works
- [ ] Dashboards display correctly
- [ ] No authentication prompts during viewing

#### ✅ Tableau Integration
- [ ] Connection test passes
- [ ] Workbook discovery works
- [ ] Workbooks embed correctly
- [ ] Public access or trusted auth working

#### ✅ Power BI Integration
- [ ] Connection test passes
- [ ] Dashboard/Report sync works
- [ ] Embed tokens generate successfully
- [ ] Dashboards embed with Power BI SDK
- [ ] No 403 API errors

---

## 🔒 Security Notes

### Credential Management
- **Never commit** this file to version control
- **Use environment variables** for production
- **Rotate secrets** regularly
- **Monitor access logs** in external services

### Production Security
- **Enable HTTPS** everywhere
- **Verify SSL certificates**
- **Check CORS settings**
- **Monitor API usage** in external services

### Backup Strategy
- **Document all credentials** securely
- **Keep external service configs** backed up
- **Test disaster recovery** procedures

---

## 🆘 Troubleshooting

### Common Production Issues

#### Salesforce Errors
```
Error: "Invalid client credentials"
→ Check Consumer Key/Secret in production environment
→ Verify Callback URL matches production domain
```

#### Tableau Errors  
```
Error: "Sign in to Tableau Cloud"
→ Make workbook public or configure trusted authentication
→ Verify server URL and site ID
```

#### Power BI Errors
```
Error: "403 API is not accessible"
→ Check Power BI Admin Portal settings
→ Verify service principal in security group
→ Wait 10-15 minutes for settings propagation
```

### Debug Steps
1. **Check API health**: `https://dashboard.your-domain.com/api/health`
2. **Verify environment variables** in EasyPanel
3. **Check application logs** for specific errors
4. **Test each integration** connection individually

---

## 📞 Emergency Contacts

### Service Dashboards
- **Supabase**: https://supabase.com/dashboard
- **Salesforce**: https://login.salesforce.com
- **Tableau**: https://online.tableau.com
- **Power BI**: https://app.powerbi.com
- **Azure AD**: https://portal.azure.com

### Quick Recovery
```bash
# Restart application
docker restart dashboard-hub-app

# View real-time logs  
docker logs dashboard-hub-app -f

# Check health status
curl https://dashboard.your-domain.com/api/health
```

---

**🎯 Goal**: All integrations working seamlessly in production with no user authentication prompts during dashboard viewing!
