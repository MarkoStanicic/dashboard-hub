#!/usr/bin/env node

/**
 * Real Power BI Integration Test Script
 * This script tests actual Power BI connection with your Azure AD app
 */

const API_URL = 'http://localhost:3000' // Development server port

// Your actual Power BI Azure AD app credentials
const POWERBI_CONFIG = {
  platform: 'powerbi',
  name: 'My Power BI Integration',
  config: {
    // Your Azure AD (Entra ID) details from the images
    tenant_id: 'brookastudio.onmicrosoft.com',                  // Domain format (not GUID)
    client_id: '909f8357-0b51-4bb7-93a0-c159d1a7541d',           // Application (client) ID  
    client_secret: 'W.U8Q~SyQiVbNoI0GQVduBncKSNVR1Xw~3Ac9bXF',     // Your actual client secret
    
    // OPTIONAL: Specific workspace (leave empty to scan all accessible workspaces)
    workspace_id: '',                      // Power BI workspace (app workspace) ID
    
    // DEFAULT: Authority URL (usually don't need to change)
    authority: 'https://login.microsoftonline.com'
  }
}

console.log('🔧 POWER BI INTEGRATION SETUP GUIDE')
console.log('=====================================\n')

console.log('📋 **STEP 1: Azure AD App Registration Setup**')
console.log('1. Go to https://portal.azure.com')
console.log('2. Navigate to "Azure Active Directory" (or "Microsoft Entra ID")')
console.log('3. Click "App registrations" → "New registration"')
console.log('4. Fill in:')
console.log('   - Name: "Dashboard Hub Power BI Integration"')
console.log('   - Supported account types: "Accounts in this organizational directory only"')
console.log('   - Redirect URI: Leave blank (we\'re using client credentials flow)')
console.log('5. Click "Register"\n')

console.log('📋 **STEP 2: Configure App Permissions**')
console.log('1. In your new app, go to "API permissions"')
console.log('2. Click "Add a permission" → "Power BI Service"')
console.log('3. Select "Application permissions" (not Delegated)')
console.log('4. Check these permissions:')
console.log('   ✅ App.Read.All')
console.log('   ✅ Dashboard.Read.All')
console.log('   ✅ Report.Read.All')
console.log('   ✅ Workspace.Read.All')
console.log('5. Click "Add permissions"')
console.log('6. Click "Grant admin consent" (you need admin rights)\n')

console.log('📋 **STEP 3: Create Client Secret**')
console.log('1. Go to "Certificates & secrets"')
console.log('2. Click "New client secret"')
console.log('3. Description: "Dashboard Hub Secret"')
console.log('4. Expires: "24 months" (or your preference)')
console.log('5. Click "Add"')
console.log('6. **IMPORTANT**: Copy the secret value immediately (you can\'t see it again!)\n')

console.log('📋 **STEP 4: Enable Power BI Service Principal**')
console.log('1. Go to https://app.powerbi.com')
console.log('2. Click Settings (gear icon) → "Admin portal"')
console.log('3. Go to "Tenant settings"')
console.log('4. Scroll to "Developer settings"')
console.log('5. Enable "Allow service principals to use Power BI APIs"')
console.log('6. Add your app\'s Application ID to the allowed list')
console.log('7. Click "Apply"\n')

console.log('📋 **STEP 5: Get Your Credentials**')
console.log('From your Azure AD app registration overview page, copy:')
console.log('- **Application (client) ID**: This is your client_id')
console.log('- **Directory (tenant) ID**: This is your tenant_id')
console.log('- **Client secret value**: From step 3 above\n')

console.log('📋 **STEP 6: Test Connection (Run this script)**')
console.log('1. Update the POWERBI_CONFIG above with your real credentials')
console.log('2. Run: node scripts/test-powerbi-real.js')
console.log('3. If successful, proceed to browser integration\n')

console.log('📋 **STEP 7: Browser Integration**')
console.log('1. Open http://localhost:3000/company/integrations')
console.log('2. Click "Connect Platform" → "Power BI"')
console.log('3. Fill in your credentials:')
console.log('   - Tenant ID: YOUR_TENANT_ID')
console.log('   - Client ID: YOUR_CLIENT_ID')  
console.log('   - Client Secret: YOUR_CLIENT_SECRET')
console.log('   - Workspace ID: (leave empty to scan all)')
console.log('4. Click "Test Connection"')
console.log('5. If successful, click "Save Integration"')
console.log('6. Click "Sync Dashboards" to import your Power BI content\n')

async function testPowerBIConnection() {
  // Check if credentials are configured
  if (POWERBI_CONFIG.config.tenant_id === 'YOUR_TENANT_ID' || 
      POWERBI_CONFIG.config.client_id === 'YOUR_CLIENT_ID' ||
      POWERBI_CONFIG.config.client_secret === 'YOUR_CLIENT_SECRET') {
    console.log('⚠️  **CONFIGURATION REQUIRED**')
    console.log('Please update the POWERBI_CONFIG in this script with your real Azure AD app credentials.')
    console.log('Follow the steps above to set up your Azure AD app registration first.\n')
    return
  }

  console.log('🧪 **TESTING POWER BI CONNECTION**')
  console.log('==================================\n')
  
  try {
    console.log('📤 Testing Power BI connection with your credentials...')
    console.log(`🏢 Tenant: ${POWERBI_CONFIG.config.tenant_id}`)
    console.log(`🔑 Client ID: ${POWERBI_CONFIG.config.client_id}`)
    console.log(`📁 Workspace: ${POWERBI_CONFIG.config.workspace_id || 'All accessible workspaces'}\n`)
    
    const response = await fetch(`${API_URL}/api/integrations/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(POWERBI_CONFIG)
    })
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Test failed: ${errorText}`)
      
      if (response.status === 401) {
        console.log('\n💡 Authentication failed. Check:')
        console.log('   1. Tenant ID is correct')
        console.log('   2. Client ID is correct') 
        console.log('   3. Client secret is correct and not expired')
        console.log('   4. App has required permissions granted')
      }
      return
    }
    
    const result = await response.json()
    console.log('\n✅ **CONNECTION SUCCESSFUL!**')
    console.log('📊 Connection Details:')
    console.log(`   • Tenant: ${result.data?.tenant_name || 'Unknown'}`)
    console.log(`   • User Email: ${result.data?.user_email || 'Service Principal'}`)
    console.log(`   • Accessible Workspaces: ${result.data?.workspace_count || 0}`)
    console.log(`   • Permissions: ${result.data?.permissions?.join(', ') || 'Unknown'}`)
    
    console.log('\n🎉 **READY FOR BROWSER INTEGRATION!**')
    console.log('Your Power BI app is properly configured. You can now:')
    console.log('1. Go to http://localhost:3000/company/integrations')
    console.log('2. Add your Power BI integration using the same credentials')
    console.log('3. Sync your dashboards and reports\n')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 The development server is not running!')
      console.log('   Please start it with: npm run dev')
    }
  }
}

function generateConnectionConfig() {
  console.log('\n🔧 **BROWSER CONNECTION CONFIG**')
  console.log('Copy these values to the browser form:\n')
  
  console.log('```')
  console.log(`Tenant ID: ${POWERBI_CONFIG.config.tenant_id}`)
  console.log(`Client ID: ${POWERBI_CONFIG.config.client_id}`)
  console.log(`Client Secret: ${POWERBI_CONFIG.config.client_secret}`)
  console.log(`Workspace ID: ${POWERBI_CONFIG.config.workspace_id || '(leave empty for all workspaces)'}`)
  console.log('```\n')
}

// Run the test
testPowerBIConnection().then(() => {
  generateConnectionConfig()
  console.log('✅ Power BI integration test completed!')
})
