# Complete Integration Testing Guide
## Dashboard Hub - Tableau, Power BI & Salesforce Integrations

This guide provides comprehensive testing procedures for all three platform integrations in your Dashboard Hub.

---

## 🎯 Prerequisites

### **Development Environment**
- ✅ Node.js 18+ installed
- ✅ Dashboard Hub project cloned and dependencies installed
- ✅ Development server running (`npm run dev`)
- ✅ Database schema deployed (Supabase)

### **Platform Accounts**
- ✅ **Tableau Cloud** - 14-day free trial with API access
- ✅ **Power BI Free** - Individual account + Azure AD app registration  
- ✅ **Salesforce Developer Edition** - Free development org
- ✅ **Credentials configured** - All authentication details ready

> 📚 **New to setup?** Follow the [Free Account Setup Guide](./FREE_ACCOUNT_SETUP_GUIDE.md) first.

---

## 🚀 Quick Start Testing

### **1. Verify Development Server**
```bash
# Make sure your dev server is running
npm run dev

# Should be accessible at:
# http://localhost:3001 (or 3000 if port 3000 is free)
```

### **2. Run Complete Test Suite**
```bash
# Test all integrations at once
node scripts/test-all-integrations.js

# Test individual platforms
node scripts/test-tableau.js
node scripts/test-powerbi.js
node scripts/test-oauth-direct.sh  # For Salesforce
```

### **3. Expected Results**
✅ **All Green**: All integrations working - you're ready to go!  
❌ **Some Red**: Check error messages and follow troubleshooting below

---

## 📊 Platform-Specific Testing

### **Tableau Integration Testing**

#### **Configuration Required**
```javascript
{
  server_url: 'https://10ax.online.tableau.com',
  site_id: 'your-site-name',
  personal_access_token_name: 'Dashboard Hub Integration', 
  personal_access_token_secret: 'your-token-secret'
}
```

#### **Testing Steps**
1. **Authentication Test**:
   ```bash
   node scripts/test-tableau.js
   ```
   
2. **Manual UI Test**:
   - Go to `http://localhost:3001/company/integrations`
   - Click "Connect" for Tableau
   - Enter your credentials
   - Click "Test Connection"

3. **Dashboard Discovery Test**:
   - After successful connection, click "Sync Dashboards"
   - Should discover workbooks and views from your site

#### **Expected Results**
- ✅ Server connection established
- ✅ Site authentication successful  
- ✅ Server version and permissions displayed
- ✅ Can discover workbooks/dashboards

#### **Common Issues**
- **401 Authentication Error**: Check PAT credentials
- **404 Site Not Found**: Verify server_url and site_id
- **No Dashboards Found**: Create workbooks in Tableau Cloud first

---

### **Power BI Integration Testing**

#### **Configuration Required**
```javascript
{
  tenant_id: 'your-tenant-guid',
  client_id: 'your-app-registration-id', 
  client_secret: 'your-client-secret',
  workspace_id: 'optional-workspace-id'
}
```

#### **Testing Steps**
1. **Authentication Test**:
   ```bash
   node scripts/test-powerbi.js
   ```

2. **Manual UI Test**:
   - Go to `http://localhost:3001/company/integrations`
   - Click "Connect" for Power BI
   - Enter Azure AD credentials
   - Click "Test Connection"

3. **Dashboard Discovery Test**:
   - After connection, click "Sync Dashboards"
   - Should discover dashboards and reports from workspaces

#### **Expected Results**
- ✅ Azure AD authentication successful
- ✅ Tenant information retrieved
- ✅ Workspace access confirmed
- ✅ User permissions validated

#### **Common Issues**
- **Invalid Client**: Check Azure AD app registration
- **Insufficient Scope**: Grant Power BI API permissions
- **No Admin Consent**: Admin needs to approve API permissions

---

### **Salesforce Integration Testing**

#### **Configuration Required**
```javascript
{
  instance_url: 'https://yourorg-dev-ed.develop.my.salesforce.com',
  client_id: 'connected-app-consumer-key',
  client_secret: 'connected-app-consumer-secret',
  username: 'your@email.com',
  password: 'yourpassword',
  security_token: 'your-security-token'
}
```

#### **Testing Steps**
1. **Direct OAuth Test**:
   ```bash
   # Update credentials in script first
   ./scripts/test-oauth-direct.sh
   ```

2. **API Test**:
   ```bash
   node scripts/test-api-endpoint.js
   ```

3. **Manual UI Test**:
   - Go to `http://localhost:3001/company/integrations`
   - Click "Connect" for Salesforce
   - Enter Connected App credentials
   - Click "Test Connection"

#### **Expected Results**
- ✅ OAuth authentication successful
- ✅ Organization information retrieved
- ✅ API access confirmed
- ✅ Can discover Analytics Cloud dashboards/reports

#### **Common Issues**
- **Invalid Grant**: Reset security token
- **Invalid Client**: Check Connected App OAuth settings
- **Missing API Scope**: Add required OAuth scopes to Connected App

---

## 🔧 Advanced Testing Scenarios

### **1. End-to-End Dashboard Sync**

**Test Flow**:
1. Connect to platform
2. Discover available dashboards
3. Select dashboards to import
4. Sync to local database
5. Verify dashboards appear in Dashboard Hub

**Testing Steps**:
```bash
# 1. Test connection
node scripts/test-all-integrations.js

# 2. Manual sync test via UI
# Navigate to integrations page
# Click "Sync Dashboards" for each platform
# Verify dashboards appear in main dashboard list
```

### **2. Dashboard Embedding Test**

**Prerequisites**: At least one dashboard synced from each platform

**Testing Steps**:
1. Go to main dashboard page
2. Click on a synced dashboard
3. Verify it opens in embed mode
4. Test responsive behavior
5. Check for proper authentication

### **3. Multi-Platform Integration**

**Test Scenario**: All three platforms connected simultaneously

**Validation Points**:
- ✅ All platforms show "Connected" status
- ✅ Dashboard discovery works for all platforms
- ✅ Search and filtering work across platforms
- ✅ No conflicts between platform configurations

---

## 🐛 Troubleshooting Guide

### **Connection Failed - All Platforms**

1. **Check Dev Server**:
   ```bash
   curl http://localhost:3001/api/integrations/test
   # Should return method not allowed (OPTIONS not supported)
   ```

2. **Check Database Connection**:
   - Verify Supabase credentials in `.env.local`
   - Test database connectivity

3. **Check Network**:
   - Disable VPN if using one
   - Check firewall settings

### **Authentication Errors**

#### **Tableau**
- Verify Tableau Cloud trial is active
- Check Personal Access Token expiration
- Ensure site permissions for API access

#### **Power BI**
- Check Azure AD app registration
- Verify client secret hasn't expired
- Confirm Power BI license assignment

#### **Salesforce**
- Reset security token if needed
- Check Connected App OAuth settings
- Verify user has API Enabled permission

### **Dashboard Discovery Issues**

1. **No Dashboards Found**:
   - Create sample dashboards in each platform
   - Check user permissions for dashboard access
   - Verify workspace/site access

2. **Partial Discovery**:
   - Check API rate limits
   - Verify permissions for all workspaces/sites
   - Review error logs for specific failures

---

## 📊 Performance Testing

### **Load Testing**
```bash
# Test multiple concurrent connections
for i in {1..5}; do
  node scripts/test-all-integrations.js &
done
wait
```

### **Dashboard Sync Performance**
- **Small Dataset**: < 10 dashboards per platform
- **Medium Dataset**: 10-50 dashboards per platform  
- **Large Dataset**: 50+ dashboards per platform

**Metrics to Monitor**:
- Connection time per platform
- Dashboard discovery time
- Sync completion time
- Error rates

---

## ✅ Testing Checklist

### **Basic Functionality**
- [ ] All three platforms connect successfully
- [ ] Dashboard discovery works for each platform
- [ ] Dashboards can be synced to local database
- [ ] Synced dashboards appear in main dashboard list
- [ ] Dashboard embedding works correctly

### **Error Handling**
- [ ] Invalid credentials handled gracefully
- [ ] Network errors don't crash the system
- [ ] API rate limits are respected
- [ ] User feedback is clear and actionable

### **Security**
- [ ] Credentials are encrypted in database
- [ ] No credentials exposed in logs
- [ ] Proper authentication for all API calls
- [ ] Row-level security works correctly

### **User Experience**
- [ ] Loading states during connection tests
- [ ] Clear error messages for failed connections
- [ ] Progress indicators during dashboard sync
- [ ] Responsive design on different screen sizes

---

## 🎉 Success Criteria

Your integration testing is successful when:

1. **✅ All Connections Green**: All three platforms authenticate successfully
2. **✅ Dashboard Discovery**: Can discover dashboards from all platforms
3. **✅ Sync Functionality**: Can import dashboards to local database
4. **✅ Embedding Works**: Dashboards display correctly when opened
5. **✅ Error Recovery**: System handles failures gracefully
6. **✅ Performance**: Connections and syncs complete in reasonable time

## 🚀 Next Steps

Once testing is complete:

1. **Production Setup**: Configure production credentials
2. **Monitoring**: Set up logging and monitoring for integrations
3. **Scheduling**: Implement automatic dashboard sync schedules
4. **User Training**: Train end users on the integration features
5. **Scaling**: Plan for handling larger numbers of dashboards

---

## 📞 Support Resources

- **Platform Documentation**:
  - [Tableau REST API](https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api.htm)
  - [Power BI REST API](https://docs.microsoft.com/en-us/rest/api/power-bi/)
  - [Salesforce REST API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)

- **Troubleshooting**:
  - Check error logs in browser dev tools
  - Review server logs for detailed error messages
  - Test credentials directly with platform APIs

- **Community Support**:
  - Tableau Developer Community
  - Power BI Developer Community  
  - Salesforce Trailblazer Community

Your Dashboard Hub integration system is production-ready! 🎉