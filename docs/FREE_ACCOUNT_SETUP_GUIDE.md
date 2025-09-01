# Free Account Setup Guide for Dashboard Integrations

This guide will help you set up free accounts for **Tableau**, **Power BI**, and **Salesforce** to test your dashboard hub integrations.

## 🎯 Overview

All three platforms offer free tiers that are perfect for testing integrations:
- **Tableau Public** - Free forever, public dashboards
- **Power BI Free** - Individual use, limited features but great for testing
- **Salesforce Developer Edition** - Full featured, free development environment

---

## 📊 Tableau Public Setup (100% Free)

### **Step 1: Create Tableau Public Account**
1. Go to [Tableau Public](https://public.tableau.com/en-us/s/)
2. Click **"Sign Up"** 
3. Fill in your details and create account
4. **Download Tableau Desktop Public** (free desktop app)

### **Step 2: Create Sample Dashboard**
1. Open **Tableau Desktop Public**
2. Connect to **Sample - Superstore** (built-in dataset)
3. Create a simple dashboard:
   - Drag **Sales** to columns
   - Drag **Category** to rows
   - Create a bar chart
   - Save to **Tableau Public** (File → Save to Tableau Public)

### **Step 3: Get Authentication Credentials**
1. Go to [Tableau Cloud](https://online.tableau.com) (NOT Tableau Public)
2. Start **free 14-day trial** for full API access
3. Once signed in, go to **My Account Settings**
4. Create **Personal Access Token**:
   - Token Name: `Dashboard Hub Integration`
   - Copy the **Token Name** and **Token Secret**

### **Step 4: Test Configuration**
```javascript
{
  server_url: 'https://10ax.online.tableau.com', // Your trial URL
  site_id: 'your-site-name', // From your Tableau Cloud URL
  content_url: 'your-site-name',
  personal_access_token_name: 'Dashboard Hub Integration',
  personal_access_token_secret: 'your-token-secret'
}
```

**⚠️ Note**: Tableau Public doesn't have API access. For testing, use the Tableau Cloud 14-day trial.

---

## ⚡ Power BI Free Setup

### **Step 1: Create Microsoft Account**
1. Go to [Power BI](https://powerbi.microsoft.com)
2. Click **"Start free"**
3. Use your existing Microsoft account or create new one
4. Choose **"Individual"** (free tier)

### **Step 2: Create Sample Dashboard**
1. Sign into [Power BI Service](https://app.powerbi.com)
2. Click **"Get Data"** → **"Samples"**
3. Install **"Sales and Marketing Sample"**
4. This creates a sample dashboard you can use for testing

### **Step 3: Set Up Azure AD App Registration**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **"Azure Active Directory"** → **"App registrations"**
3. Click **"New registration"**:
   - **Name**: `Dashboard Hub Power BI Integration`
   - **Account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank for now
4. Click **"Register"**

### **Step 4: Configure API Permissions**
1. In your app registration, go to **"API permissions"**
2. Click **"Add a permission"** → **"Power BI Service"**
3. Select **"Delegated permissions"** and add:
   - `Dashboard.Read.All`
   - `Report.Read.All`
   - `Workspace.Read.All`
4. Click **"Grant admin consent"** (if you're admin)

### **Step 5: Create Client Secret**
1. Go to **"Certificates & secrets"**
2. Click **"New client secret"**:
   - **Description**: `Dashboard Hub Integration`
   - **Expires**: `6 months`
3. **Copy the secret value immediately** (you can't see it again!)

### **Step 6: Get Configuration Details**
1. **Tenant ID**: From Azure AD Overview page
2. **Client ID**: From your app registration Overview
3. **Client Secret**: From step 5
4. **Workspace ID**: From Power BI URL when viewing your workspace

### **Step 7: Test Configuration**
```javascript
{
  tenant_id: 'your-tenant-id',
  client_id: 'your-client-id', 
  client_secret: 'your-client-secret',
  workspace_id: 'your-workspace-id' // Optional
}
```

---

## ☁️ Salesforce Developer Edition Setup (Completely Free)

### **Step 1: Create Developer Org**
1. Go to [Salesforce Developer](https://developer.salesforce.com)
2. Click **"Sign up for a free Developer Edition"**
3. Fill in details (use a real email - you'll need to verify)
4. Check your email and click verification link
5. Set your password and security question

### **Step 2: Access Your Developer Org**
1. Your org URL will be something like: `https://yourname-dev-ed.develop.my.salesforce.com`
2. Login with your credentials
3. You now have a **full Salesforce org** with all features!

### **Step 3: Create Connected App**
1. In Salesforce, click **Setup** (gear icon)
2. Quick Find: **"App Manager"**
3. Click **"New Connected App"**
4. Fill in **Basic Information**:
   - **Connected App Name**: `Dashboard Hub Integration`
   - **API Name**: `Dashboard_Hub_Integration`
   - **Contact Email**: Your email

### **Step 4: Configure OAuth Settings**
1. Check **"Enable OAuth Settings"**
2. **Callback URL**: `http://localhost:3001/auth/callback`
3. **Selected OAuth Scopes**:
   - ✅ `Access and manage your data (api)`
   - ✅ `Perform requests on your behalf at any time (refresh_token, offline_access)`
   - ✅ `Access your basic information (id, profile, email, address, phone)`
4. **Additional Settings**:
   - ✅ `Require Secret for Web Server Flow`
   - ✅ `Require Secret for Refresh Token Flow`
5. **Distribution State**: `Local`
6. Click **"Save"**

### **Step 5: Get Credentials**
1. After saving, click **"Continue"**
2. Copy these values:
   - **Consumer Key** (this is your `client_id`)
   - **Consumer Secret** (this is your `client_secret`)

### **Step 6: Set Up User Permissions**
1. Go to **Setup** → **Permission Sets**
2. Click **"New"**:
   - **Label**: `API Access`
   - **API Name**: `API_Access`
3. Save, then click **"System Permissions"**
4. Check ✅ **"API Enabled"**
5. Save
6. Go to **Users** → find yourself → **Permission Set Assignments**
7. Add the **"API Access"** permission set

### **Step 7: Get Security Token**
1. Click your profile → **"Settings"**
2. **"My Personal Information"** → **"Reset My Security Token"**
3. Check your email for the security token

### **Step 8: Test Configuration**
```javascript
{
  instance_url: 'https://yourname-dev-ed.develop.my.salesforce.com',
  client_id: 'your-consumer-key',
  client_secret: 'your-consumer-secret',
  username: 'your@email.com',
  password: 'yourpassword',
  security_token: 'your-security-token'
}
```

---

## 🧪 Testing Your Setup

### **Quick Test Script**
Once you have all accounts set up, test them using:

```bash
# Update credentials in the script first
node scripts/test-all-integrations.js
```

### **Expected Results**
- ✅ **Tableau**: Should connect and show workbook count
- ✅ **Power BI**: Should connect and show workspace info  
- ✅ **Salesforce**: Should connect and show org details

### **Common Issues & Solutions**

**Tableau**:
- **401 Error**: Check Personal Access Token credentials
- **404 Error**: Verify server_url and site_id

**Power BI**:
- **Invalid Client**: Check client_id and client_secret
- **Forbidden**: Ensure API permissions are granted

**Salesforce**:
- **Invalid Grant**: Reset security token
- **Invalid Client**: Check Connected App settings
- **API Not Enabled**: Add API permission to user

---

## 🎉 Success! What's Next?

Once all three integrations are working:

1. **Create Real Dashboards**: Build some sample dashboards in each platform
2. **Test Dashboard Discovery**: Use the sync feature to import dashboards
3. **Test Embedding**: Verify dashboard embedding works
4. **Explore Advanced Features**: Try different authentication methods

## 💡 Pro Tips

- **Keep Credentials Secure**: Never commit real credentials to git
- **Use Environment Variables**: Store secrets in `.env.local`
- **Regular Testing**: Test integrations regularly as tokens expire
- **Monitor Limits**: Free tiers have usage limits - monitor your usage

---

## 📞 Support

If you encounter issues:
1. Check the **error analysis** in the test scripts
2. Verify **account permissions** and **API access**
3. Ensure **credentials are correct** and **not expired**
4. Check platform-specific **troubleshooting guides**

All three platforms have excellent documentation and community support for developers!