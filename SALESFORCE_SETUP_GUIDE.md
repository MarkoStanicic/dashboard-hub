# Salesforce Integration Setup Guide

## Step 1: Create Connected App in Salesforce

1. **Log into your Salesforce Dev Org**
   - Go to https://login.salesforce.com (or your custom domain)
   - Use your dev org credentials

2. **Navigate to Connected Apps**
   - Click Setup (gear icon) → Setup
   - In Quick Find, search for "App Manager"
   - Click "App Manager" under Apps

3. **Create New Connected App**
   - Click "New Connected App" button
   - Fill in Basic Information:
     - **Connected App Name**: `Dashboard Hub Integration`
     - **API Name**: `Dashboard_Hub_Integration`
     - **Contact Email**: Your email address
     - **Description**: `Integration for Dashboard Hub to access Analytics and Reports`

4. **Configure OAuth Settings**
   - Check "Enable OAuth Settings"
   - **Callback URL**: `https://your-dashboard-hub-domain.com/auth/callback` (use your actual domain)
   - **Selected OAuth Scopes** - Add these scopes:
     - `Access and manage your data (api)`
     - `Perform requests on your behalf at any time (refresh_token, offline_access)`
     - `Access your basic information (id, profile, email, address, phone)`
     - `Access Wave Analytics (wave_api)` (if available)

5. **Additional Settings**
   - **Require Secret for Web Server Flow**: Check this
   - **Require Secret for Refresh Token Flow**: Check this
   - **Enable Client Credentials Flow**: Uncheck this

6. **Save and Get Credentials**
   - Click "Save"
   - After saving, click "Continue"
   - **Copy and save these values**:
     - **Consumer Key** (this is your `client_id`)
     - **Consumer Secret** (this is your `client_secret`)

## Step 2: Configure User Access

1. **Create Permission Set (Recommended)**
   - Go to Setup → Permission Sets
   - Click "New"
   - Name: `Dashboard Hub Access`
   - Description: `Permissions for Dashboard Hub integration`
   - Save

2. **Add System Permissions**
   - In your permission set, go to System Permissions
   - Enable:
     - `API Enabled`
     - `Access Wave Analytics` (if available)
     - `View All Data` (for discovery - can be restricted later)
     - `Modify All Data` (only if you need write access)

3. **Assign Permission Set**
   - Go to Users → find your integration user
   - Click on user → Permission Set Assignments
   - Add the "Dashboard Hub Access" permission set

## Step 3: Security Token (Required for Username/Password Flow)

1. **Reset Security Token**
   - Go to your user settings (click your avatar → Settings)
   - Click "My Personal Information" → "Reset My Security Token"
   - Click "Reset Security Token"
   - Check your email for the new security token

## Step 4: Test Your Setup

Your credentials should be:
- **Instance URL**: `https://yourorg.salesforce.com` (or your custom domain)
- **Client ID**: Consumer Key from connected app
- **Client Secret**: Consumer Secret from connected app  
- **Username**: Your Salesforce username
- **Password**: Your Salesforce password
- **Security Token**: From the reset email
- **API Version**: `58.0` (default)
- **Sandbox**: `false` (unless using a sandbox org)

## Troubleshooting

**Common Issues:**
1. **"Invalid Grant" Error**: Check that username/password/security token are correct
2. **"Invalid Client" Error**: Verify client_id and client_secret are correct
3. **"Insufficient Scope" Error**: Make sure OAuth scopes include `api` and `refresh_token`
4. **No Dashboards Found**: Ensure you have Analytics Cloud enabled and dashboards created

**Analytics Cloud Requirements:**
- Your org must have Analytics Cloud (Einstein Analytics) enabled
- You need appropriate licenses for Analytics Cloud
- Dashboards must be shared with your user or public

If you don't have Analytics Cloud, the integration will still find standard Salesforce Reports that can be embedded.