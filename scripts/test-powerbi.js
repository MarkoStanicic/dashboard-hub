#!/usr/bin/env node
/**
 * Power BI Integration Test Script
 * Dedicated testing for Power BI Service connections via Azure AD
 */

const POWERBI_CONFIG = {
  tenant_id: 'YOUR_TENANT_ID', // From Azure AD
  client_id: 'YOUR_CLIENT_ID', // App Registration Client ID
  client_secret: 'YOUR_CLIENT_SECRET', // App Registration Secret
  workspace_id: 'YOUR_WORKSPACE_ID', // Optional: specific workspace to test
  authority: 'https://login.microsoftonline.com',
  scope: 'https://analysis.windows.net/powerbi/api/.default'
}

const API_URL = 'http://localhost:3000/api/integrations/test'

console.log('⚡ POWER BI INTEGRATION TEST')
console.log('============================')
console.log('')

async function testPowerBIIntegration() {
  console.log('🔍 Configuration Check:')
  console.log(`Tenant ID: ${POWERBI_CONFIG.tenant_id}`)
  console.log(`Client ID: ${POWERBI_CONFIG.client_id}`)
  console.log(`Client Secret: ${'*'.repeat(20)}`)
  console.log(`Authority: ${POWERBI_CONFIG.authority}`)
  console.log(`Scope: ${POWERBI_CONFIG.scope}`)
  if (POWERBI_CONFIG.workspace_id) {
    console.log(`Workspace ID: ${POWERBI_CONFIG.workspace_id}`)
  }
  
  // Basic validation
  if (!POWERBI_CONFIG.tenant_id || POWERBI_CONFIG.tenant_id === 'YOUR_TENANT_ID') {
    console.log('❌ Please update POWERBI_CONFIG with your actual tenant_id')
    return
  }
  
  if (!POWERBI_CONFIG.client_id || POWERBI_CONFIG.client_id === 'YOUR_CLIENT_ID') {
    console.log('❌ Please update POWERBI_CONFIG with your actual client_id')
    return
  }
  
  if (!POWERBI_CONFIG.client_secret || POWERBI_CONFIG.client_secret === 'YOUR_CLIENT_SECRET') {
    console.log('❌ Please update POWERBI_CONFIG with your actual client_secret')
    return
  }
  
  // Validate GUID format for tenant_id
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!guidRegex.test(POWERBI_CONFIG.tenant_id)) {
    console.log('❌ tenant_id should be a valid GUID format')
    return
  }
  
  console.log('\n🚀 Testing connection...')
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'powerbi',
        config: POWERBI_CONFIG
      })
    })
    
    console.log(`📊 Response: ${response.status} ${response.statusText}`)
    
    const result = await response.json()
    
    if (result.success) {
      console.log('\n✅ POWER BI CONNECTION SUCCESSFUL!')
      console.log('📋 Account Information:')
      if (result.data) {
        console.log(`   Tenant: ${result.data.tenant_name || 'Unknown'}`)
        console.log(`   User Email: ${result.data.user_email || 'Unknown'}`)
        console.log(`   Workspace Count: ${result.data.workspace_count || 'Unknown'}`)
        console.log(`   Permissions: ${result.data.permissions?.join(', ') || 'Unknown'}`)
      }
      
      console.log('\n🎯 Next Steps:')
      console.log('1. Create some dashboards in your Power BI workspace')
      console.log('2. Test dashboard discovery with the sync feature')
      console.log('3. Try embedding dashboards in your app')
      console.log('4. Test with different workspaces if needed')
      
    } else {
      console.log('\n❌ POWER BI CONNECTION FAILED')
      console.log(`Error: ${result.error}`)
      
      console.log('\n🔧 Troubleshooting:')
      if (result.error?.includes('invalid_client')) {
        console.log('• Check your client_id and client_secret in Azure AD')
        console.log('• Verify your App Registration exists and is active')
        console.log('• Ensure client_secret has not expired')
      } else if (result.error?.includes('invalid_scope') || result.error?.includes('insufficient_scope')) {
        console.log('• Check Power BI API permissions in Azure AD')
        console.log('• Ensure admin consent is granted for API permissions')
        console.log('• Required permissions: Dashboard.Read.All, Report.Read.All, Workspace.Read.All')
      } else if (result.error?.includes('unauthorized_client')) {
        console.log('• App Registration may not be configured for client credentials flow')
        console.log('• Check "Certificates & secrets" section in Azure AD')
      } else if (result.error?.includes('invalid_tenant')) {
        console.log('• Verify your tenant_id is correct')
        console.log('• Check Azure AD → Overview for correct Tenant ID')
      } else {
        console.log('• Check Azure AD app registration configuration')
        console.log('• Verify Power BI service is available in your tenant')
        console.log('• Ensure user has Power BI license')
      }
      
      console.log('\n📋 Azure AD Setup Checklist:')
      console.log('□ App Registration created')
      console.log('□ Client secret generated and not expired')
      console.log('□ Power BI Service API permissions added')
      console.log('□ Admin consent granted for permissions')
      console.log('□ Power BI Pro/Premium license assigned')
    }
    
  } catch (error) {
    console.log('\n❌ TEST FAILED')
    console.log(`Error: ${error.message}`)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure your dev server is running:')
      console.log('   npm run dev')
    }
  }
}

console.log('📝 Setup Instructions:')
console.log('1. Create Azure AD App Registration')
console.log('2. Add Power BI Service API permissions')
console.log('3. Generate client secret')
console.log('4. Update POWERBI_CONFIG with your credentials')
console.log('5. Run: node scripts/test-powerbi.js')
console.log('')

console.log('🔗 Helpful Links:')
console.log('• Azure Portal: https://portal.azure.com')
console.log('• Power BI Service: https://app.powerbi.com')
console.log('• Power BI Developer Docs: https://docs.microsoft.com/en-us/power-bi/developer/')
console.log('')

if (import.meta.url === `file://${process.argv[1]}`) {
  testPowerBIIntegration().catch(console.error)
}