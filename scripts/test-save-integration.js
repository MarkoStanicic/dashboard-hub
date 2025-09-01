#!/usr/bin/env node

/**
 * Test script to debug integration saving issues
 */

const API_URL = 'http://localhost:3000'

// Test data that matches what should be sent from the UI
const testIntegrationData = {
  company_id: 'test-company-id', // This might be the issue - we need real company ID
  platform: 'tableau',
  name: 'Test Tableau Integration',
  status: 'connected',
  config: {
    server_url: 'https://prod-ch-a.online.tableau.com',
    site_id: 'markobstanicic-82ac5ce1ec',
    content_url: 'markobstanicic-82ac5ce1ec',
    api_version: '3.19',
    personal_access_token_name: 'Dashboard Hub Integration',
    personal_access_token_secret: 'ci361QLnROqj8/7aJDZgbQ==:CVbIMxpqhBHwlm1b7tnInuFiX3AU8cOu'
  },
  sync_enabled: true,
  created_by: 'test-user-id' // This might also be the issue - we need real user ID
}

async function testSaveIntegration() {
  console.log('🔧 Testing Integration Save Functionality...\n')
  
  try {
    // First, let's check if the server is running
    console.log('1️⃣ Checking server health...')
    const healthResponse = await fetch(`${API_URL}/api/integrations/test`, {
      method: 'GET'
    })
    console.log(`   Server response: ${healthResponse.status} ${healthResponse.statusText}\n`)

    // Try to create integration via direct API call (simulating frontend)
    console.log('2️⃣ Testing direct API call to create integration...')
    console.log('   Payload:', JSON.stringify(testIntegrationData, null, 2))
    
    const createResponse = await fetch(`${API_URL}/api/integrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testIntegrationData)
    })
    
    console.log(`   Response status: ${createResponse.status} ${createResponse.statusText}`)
    
    const responseText = await createResponse.text()
    console.log(`   Response body: ${responseText}\n`)
    
    if (!createResponse.ok) {
      console.log('❌ Integration creation failed!')
      
      // Common issues to check
      console.log('🔍 Possible issues to check:')
      console.log('   1. Missing /api/integrations POST endpoint')
      console.log('   2. Authentication required but not provided')
      console.log('   3. Invalid company_id or user_id')
      console.log('   4. Database schema mismatch')
      console.log('   5. Supabase client configuration')
      return
    }
    
    console.log('✅ Integration creation successful!')
    const responseData = JSON.parse(responseText)
    console.log('   Created integration:', responseData)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 The development server is not running!')
      console.log('   Please start it with: npm run dev')
    }
  }
}

// Also test what happens in browser console
function generateBrowserTest() {
  console.log('\n🌐 Browser Console Test:')
  console.log('Open your browser console and run this:')
  console.log(`
// Test the integration save directly from browser
const testData = ${JSON.stringify(testIntegrationData, null, 2)};

fetch('/api/integrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(res => {
  console.log('Response status:', res.status, res.statusText);
  return res.text();
})
.then(text => {
  console.log('Response body:', text);
})
.catch(err => {
  console.error('Error:', err);
});
`)
}

console.log('🧪 INTEGRATION SAVE DEBUG TEST')
console.log('=====================================\n')

testSaveIntegration().then(() => {
  generateBrowserTest()
  console.log('\n✅ Test completed!')
})
