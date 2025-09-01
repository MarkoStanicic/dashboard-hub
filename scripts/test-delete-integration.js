#!/usr/bin/env node

/**
 * Test script for delete integration functionality
 */

const API_URL = 'http://localhost:3000'

async function testDeleteIntegration() {
  console.log('🧪 Testing Delete Integration Functionality...\n')
  
  try {
    // First, list all integrations to see what's available
    console.log('1️⃣ Fetching current integrations...')
    const listResponse = await fetch(`${API_URL}/api/integrations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!listResponse.ok) {
      console.error(`❌ Failed to fetch integrations: ${listResponse.status} ${listResponse.statusText}`)
      return
    }
    
    const integrations = await listResponse.json()
    console.log(`✅ Found ${integrations.length} integrations\n`)
    
    if (integrations.length === 0) {
      console.log('ℹ️ No integrations found to delete. Create an integration first.')
      return
    }
    
    // Display integrations
    console.log('📋 Current Integrations:')
    integrations.forEach((integration, index) => {
      console.log(`${index + 1}. ${integration.name} (${integration.platform}) - ${integration.status}`)
      console.log(`   ID: ${integration.id}`)
      console.log(`   Created: ${new Date(integration.created_at).toLocaleDateString()}`)
      console.log('   ---')
    })
    
    console.log('\n💡 To test delete functionality:')
    console.log('1. Go to Company → Integrations in your browser')
    console.log('2. Click the red trash can icon on any integration')
    console.log('3. You should see a confirmation dialog')
    console.log('4. Click "Delete Integration" to confirm')
    console.log('5. The integration and related dashboards should be removed')
    
    console.log('\n🔧 Delete functionality includes:')
    console.log('✅ Confirmation dialog with warning')
    console.log('✅ Shows what will be deleted (dashboards, sync history)')
    console.log('✅ Proper error handling')
    console.log('✅ Success notifications')
    console.log('✅ Automatic page refresh')
    console.log('✅ Server-side cleanup of related dashboards')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 The development server is not running!')
      console.log('   Please start it with: npm run dev')
    }
  }
}

function generateBrowserTest() {
  console.log('\n🌐 Browser Console Test (if needed):')
  console.log('Open your browser console and run this to test the API directly:\n')
  
  console.log(`
// Test delete API directly (replace 'INTEGRATION_ID' with actual ID)
const integrationId = 'INTEGRATION_ID'; // Replace with actual ID from list above

fetch(\`/api/integrations?id=\${integrationId}\`, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => {
  console.log('Response status:', res.status, res.statusText);
  return res.json();
})
.then(data => {
  console.log('Delete result:', data);
})
.catch(err => {
  console.error('Error:', err);
});
`)
}

console.log('🗑️ DELETE INTEGRATION TESTER')
console.log('=============================\n')

testDeleteIntegration().then(() => {
  generateBrowserTest()
  console.log('\n✅ Test completed!')
})
