# Power BI Integration Setup Guide

This guide will help you set up Power BI integration with your Dashboard Hub.

## Prerequisites

- Microsoft 365 or Power BI account
- Azure AD admin rights (for app registration)
- Some Power BI content (dashboards/reports) to test with

## Step 1: Azure AD App Registration

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to Azure Active Directory** (or "Microsoft Entra ID")
3. **Click "App registrations"** → **"New registration"**
4. **Fill in the registration form**:
   - **Name**: `Dashboard Hub Power BI Integration`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank (we're using client credentials flow)
5. **Click "Register"**

## Step 2: Configure API Permissions

1. **In your new app, go to "API permissions"**
2. **Click "Add a permission"** → **"Power BI Service"**
3. **Select "Application permissions"** (not Delegated)
4. **Check these permissions**:
   - ✅ `App.Read.All`
   - ✅ `Dashboard.Read.All`
   - ✅ `Report.Read.All`
   - ✅ `Workspace.Read.All`
5. **Click "Add permissions"**
6. **Click "Grant admin consent"** (you need admin rights)

> **Note**: Admin consent is required for application permissions. If you don't have admin rights, ask your IT admin to grant consent.

## Step 3: Create Client Secret

1. **Go to "Certificates & secrets"**
2. **Click "New client secret"**
3. **Fill in**:
   - **Description**: `Dashboard Hub Secret`
   - **Expires**: `24 months` (or your preference)
4. **Click "Add"**
5. **⚠️ IMPORTANT**: Copy the secret value immediately (you can't see it again!)

## Step 4: Enable Power BI Service Principal

1. **Go to Power BI Service**: https://app.powerbi.com
2. **Click Settings** (gear icon) → **"Admin portal"**
3. **Go to "Tenant settings"**
4. **Scroll to "Developer settings"**
5. **Enable "Allow service principals to use Power BI APIs"**
6. **Add your app's Application ID** to the allowed list
7. **Click "Apply"**

> **Note**: If you don't see "Admin portal", you need Power BI admin rights. Ask your Power BI admin to enable service principal access.

## Step 5: Gather Your Credentials

From your Azure AD app registration **Overview** page, copy:

- **Application (client) ID**: This is your `client_id`
- **Directory (tenant) ID**: This is your `tenant_id`  
- **Client secret value**: From Step 3 above

## Step 6: Test Connection (Optional)

Before using the browser, you can test the connection:

1. **Edit** `scripts/test-powerbi-real.js`
2. **Replace** the placeholder values with your real credentials
3. **Run**: `node scripts/test-powerbi-real.js`
4. **If successful**, proceed to browser integration

## Step 7: Browser Integration

1. **Open**: http://localhost:3000/company/integrations
2. **Click**: "Connect Platform" → "Power BI"
3. **Fill in your credentials**:
   - **Tenant ID**: Your Directory (tenant) ID
   - **Client ID**: Your Application (client) ID
   - **Client Secret**: Your client secret value
   - **Workspace ID**: (leave empty to scan all accessible workspaces)
4. **Click**: "Test Connection"
5. **If successful**, click "Save Integration"
6. **Click**: "Sync Dashboards" to import your Power BI content

## Sample Power BI Content (Optional)

If you don't have Power BI content yet, you can create some samples:

### Create a Sample Workspace

1. **Go to**: https://app.powerbi.com
2. **Click**: "Workspaces" → "Create a workspace"
3. **Name**: `Dashboard Hub Test`
4. **Click**: "Save"

### Import Sample Data

1. **In your new workspace**, click "Get data"
2. **Choose**: "Samples" → "Financial Sample"
3. **Click**: "Connect"
4. **This creates**: A sample dashboard and report you can use for testing

### Alternative: Use Templates

1. **Download**: Power BI template files from Microsoft
2. **Import**: Into your workspace
3. **Publish**: To create dashboards and reports

## Troubleshooting

### Authentication Errors

- **Check**: Tenant ID, Client ID, and Client Secret are correct
- **Verify**: Client secret hasn't expired
- **Ensure**: Admin consent was granted for API permissions
- **Confirm**: Service principal access is enabled in Power BI admin settings

### Permission Errors

- **Verify**: Your app has the required Power BI API permissions
- **Check**: Admin consent was granted (look for green checkmarks)
- **Ensure**: Service principal is added to allowed list in Power BI tenant settings

### No Content Found

- **Check**: You have dashboards or reports in your Power BI workspace
- **Verify**: Service principal has access to the workspace
- **Try**: Leaving Workspace ID empty to scan all accessible workspaces

## Security Notes

- **Store secrets securely**: Never commit client secrets to version control
- **Use principle of least privilege**: Only grant necessary permissions
- **Rotate secrets regularly**: Set reasonable expiration times
- **Monitor access**: Review Power BI audit logs periodically

## Next Steps

After successful integration:

1. **Sync dashboards** to import your Power BI content
2. **View dashboards** in the main Dashboard Hub
3. **Embed reports** using Power BI's embedding capabilities
4. **Set up automated sync** (if needed)

## Support

If you encounter issues:

1. **Check**: The troubleshooting section above
2. **Review**: Power BI and Azure AD documentation
3. **Test**: Connection using the test script first
4. **Verify**: All setup steps were completed correctly
