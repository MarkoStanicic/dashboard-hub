#!/usr/bin/env node

/**
 * Debug My Workspace Access Issue
 */

const API_URL = 'http://localhost:3000'

// Your Power BI credentials
const POWERBI_CONFIG = {
  platform: 'powerbi',
  name: 'Debug My Workspace Test',
  config: {
    tenant_id: 'brookastudio.onmicrosoft.com',
    client_id: '909f8357-0b51-4bb7-93a0-c159d1a7541d',
    client_secret: 'W.U8Q~SyQiVbNoI0GQVduBncKSNVR1Xw~3Ac9bXF',
    workspace_id: '', // Empty to scan all
    authority: 'https://login.microsoftonline.com'
  }
}

console.log('🔍 MY WORKSPACE DEBUG TEST')
console.log('===========================\n')

console.log('🎯 **DEBUGGING WHY MY WORKSPACE NOT FOUND**\n')

async function debugMyWorkspace() {
  try {
    console.log('1️⃣ **Testing Power BI API Endpoints Directly...**\n')
    
    // Test connection first
    const testResponse = await fetch(`${API_URL}/api/integrations/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(POWERBI_CONFIG)
    })
    
    if (!testResponse.ok) {
      console.error('❌ Connection test failed:', testResponse.status)
      return
    }
    
    const testResult = await testResponse.json()
    console.log('✅ Connection test passed')
    console.log('📊 Found workspaces:', testResult.data?.workspace_count || 0)
    console.log('')
    
    // Test dashboard discovery
    console.log('2️⃣ **Testing Dashboard Discovery...**\n')
    
    // We need to get the integration ID first
    const integrationsResponse = await fetch(`${API_URL}/api/integrations`)
    if (!integrationsResponse.ok) {
      console.error('❌ Could not get integrations')
      return
    }
    
    const integrations = await integrationsResponse.json()
    const powerbiIntegration = integrations.find(i => i.platform === 'powerbi')
    
    if (!powerbiIntegration) {
      console.error('❌ No Power BI integration found')
      console.log('💡 Make sure you have saved your Power BI integration first')
      return
    }
    
    console.log('✅ Found Power BI integration:', powerbiIntegration.name)
    console.log('🔑 Integration ID:', powerbiIntegration.id)
    console.log('')
    
    console.log('3️⃣ **Testing Sync Discovery...**\n')
    
    // Test the sync endpoint to see what gets discovered
    const syncTestUrl = `${API_URL}/api/integrations/test`
    const syncTestResponse = await fetch(syncTestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'powerbi',
        name: 'Debug Test',
        config: powerbiIntegration.config
      })
    })
    
    if (syncTestResponse.ok) {
      const syncResult = await syncTestResponse.json()
      console.log('📊 Sync test result:')
      console.log('   • Success:', syncResult.success)
      console.log('   • Data:', JSON.stringify(syncResult.data, null, 2))
    } else {
      console.error('❌ Sync test failed:', syncTestResponse.status)
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message)
  }
}

console.log('🔧 **POSSIBLE ISSUES:**\n')

console.log('**Issue 1: API Permissions**')
console.log('• Your service principal might not have permission to access My workspace')
console.log('• My workspace often has stricter access controls')
console.log('• Try checking Azure AD app permissions\n')

console.log('**Issue 2: API Endpoints**')
console.log('• /v1.0/myorg/dashboards might return 403/404')
console.log('• /v1.0/myorg/reports might be blocked')
console.log('• Service principals sometimes can\'t access personal workspace\n')

console.log('**Issue 3: Content Type**')
console.log('• Your My workspace has Reports, not Dashboards')
console.log('• Our integration tries to get both')
console.log('• But API might only return actual Dashboards\n')

console.log('🚀 **ALTERNATIVE SOLUTIONS:**\n')

console.log('**Solution A: Create Real Dashboards**')
console.log('1. Go to Power BI → Get data → Samples')
console.log('2. Choose "Financial Sample" → Connect')
console.log('3. This creates actual Dashboards (not just Reports)')
console.log('4. Test sync again\n')

console.log('**Solution B: Pin Reports to Dashboards**')
console.log('1. Open any Report in Power BI')
console.log('2. Click "Pin to dashboard" (📌 icon)')
console.log('3. Create new dashboard from the report')
console.log('4. Repeat for other reports')
console.log('5. Test sync again\n')

console.log('**Solution C: Use Named Workspace**')
console.log('1. Create a new workspace (not "My workspace")')
console.log('2. Move/create content there')
console.log('3. Service principals work better with named workspaces\n')

console.log('📞 **IMMEDIATE NEXT STEPS:**')
console.log('1. Import the 2 found dashboards (test basic sync)')
console.log('2. Run this debug script: node scripts/debug-my-workspace.js')
console.log('3. Try Solution A (Financial Sample) for quick test')
console.log('4. Check browser console for API errors')

console.log('\n🔍 Running debug test...\n')

debugMyWorkspace().then(() => {
  console.log('\n✅ Debug test completed!')
  console.log('\n💡 **RECOMMENDATION:**')
  console.log('If debug shows API errors, try creating actual Dashboard content')
  console.log('using Power BI samples instead of just Reports.')
})
