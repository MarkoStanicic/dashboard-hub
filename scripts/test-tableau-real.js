#!/usr/bin/env node
/**
 * Real Tableau Integration Test
 * Tests with your actual Tableau Cloud credentials
 */

// Your Tableau Cloud Configuration - CONFIGURED WITH YOUR ACTUAL VALUES
const TABLEAU_CONFIG = {
  server_url: 'https://prod-ch-a.online.tableau.com',
  site_id: 'markobstanicic-82ac5ce1ec',
  content_url: 'markobstanicic-82ac5ce1ec',
  api_version: '3.19',
  
  // Personal Access Token (ENABLED!)
  personal_access_token_name: 'Dashboard Hub Integration',
  personal_access_token_secret: 'ci361QLnROqj8/7aJDZgbQ==:CVbIMxpqhBHwlm1b7tnInuFiX3AU8cOu'
}

const API_URL = 'http://localhost:3000/api/integrations/test'

console.log('📊 TABLEAU CLOUD INTEGRATION TEST')
console.log('==================================')
console.log('')

async function testTableauIntegration() {
  console.log('🔍 Configuration Check:')
  console.log(`Server URL: ${TABLEAU_CONFIG.server_url}`)
  console.log(`Site ID: ${TABLEAU_CONFIG.site_id}`)
  console.log(`API Version: ${TABLEAU_CONFIG.api_version}`)
  console.log(`PAT Name: ${TABLEAU_CONFIG.personal_access_token_name}`)
  console.log(`PAT Secret: ✅ SET (${TABLEAU_CONFIG.personal_access_token_secret.substring(0, 20)}...)`)
  console.log('')

  // Validation
  if (!TABLEAU_CONFIG.personal_access_token_secret) {
    console.log('❌ Personal Access Token secret is missing!')
    return
  }

  console.log('🚀 Testing connection...')
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'tableau',
        config: TABLEAU_CONFIG
      })
    })
    
    console.log(`📊 Response: ${response.status} ${response.statusText}`)
    
    const result = await response.json()
    
    if (result.success) {
      console.log('\n✅ TABLEAU CONNECTION SUCCESSFUL!')
      console.log('📋 Server Information:')
      if (result.data) {
        console.log(`   Server Version: ${result.data.server_version || 'Unknown'}`)
        console.log(`   Site Name: ${result.data.site_name || 'Unknown'}`)
        console.log(`   API Version: ${result.data.api_version || 'Unknown'}`)
        console.log(`   Permissions: ${result.data.user_permissions?.join(', ') || 'Unknown'}`)
      }
      
      console.log('\n🎯 Next Steps:')
      console.log('1. ✅ Connection working - great!')
      console.log('2. Test in UI: http://localhost:3000/company/integrations')
      console.log('3. Try "Sync Dashboards" to import your workbooks')
      console.log('4. Check the main dashboard page to see imported dashboards')
      
    } else {
      console.log('\n❌ TABLEAU CONNECTION FAILED')
      console.log(`Error: ${result.error}`)
      
      console.log('\n🔧 Troubleshooting:')
      if (result.error?.includes('401') || result.error?.includes('Authentication failed')) {
        console.log('• Check your Personal Access Token name and secret')
        console.log('• Verify your site_id is correct (check URL in Tableau Cloud)')
        console.log('• Make sure your token hasn\'t expired')
      } else if (result.error?.includes('404')) {
        console.log('• Verify your server_url is correct')
        console.log('• Check that your site_id matches your Tableau site name')
        console.log('• Ensure your site is active and accessible')
      } else if (result.error?.includes('No authentication credentials')) {
        console.log('• Make sure personal_access_token_name and secret are set')
        console.log('• Personal Access Token is the recommended method')
      } else {
        console.log('• Check Tableau server status')
        console.log('• Verify network connectivity')
        console.log('• Review Tableau site permissions')
      }
      
      console.log('\n📋 Double-check these values:')
      console.log(`• Server URL: ${TABLEAU_CONFIG.server_url}`)
      console.log(`• Site ID: ${TABLEAU_CONFIG.site_id}`)
      console.log('• Personal Access Token name and secret')
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

console.log('📝 Before Running:')
console.log('1. Update TABLEAU_CONFIG with your actual values')
console.log('2. Get Personal Access Token from Tableau Cloud')
console.log('3. Make sure dev server is running (npm run dev)')
console.log('4. Run: node scripts/test-tableau-real.js')
console.log('')

if (import.meta.url === `file://${process.argv[1]}`) {
  testTableauIntegration().catch(console.error)
}
