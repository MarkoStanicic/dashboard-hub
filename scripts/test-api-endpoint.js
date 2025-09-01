#!/usr/bin/env node
/**
 * Test the Salesforce integration API endpoint directly
 * This bypasses the UI and tests the backend service directly
 */

const TEST_PAYLOAD = {
  platform: 'salesforce',
  config: {
    instance_url: 'https://orgfarm-e4a5ef21df-dev-ed.develop.my.salesforce.com',
    client_id: '3MVG9sAEuw2Y.lLvcXiEXDucDZX.6xhF8BVxITXQZDGCvZgSxZKP8JSCMPECHAI',
    client_secret: '478E2CA5AA6D53E8EC4A8AZCCB9DCBCD0666DF531T78510730CDF33AAFBF88',
    username: 'marko.b.stanicic622@agentforce.com',
    password: 'Sepultura987',
    security_token: 'REPLACE_WITH_NEW_TOKEN' // User needs to update this
  }
}

async function testAPIEndpoint() {
  console.log('🔧 Testing /api/integrations/test endpoint')
  console.log('==========================================\n')
  
  if (TEST_PAYLOAD.config.security_token === 'REPLACE_WITH_NEW_TOKEN') {
    console.log('❌ Please update the security_token in this script with your actual token')
    console.log('Get it from: Salesforce → Settings → Reset My Security Token')
    return
  }
  
  try {
    console.log('📦 Request payload:')
    console.log('Platform:', TEST_PAYLOAD.platform)
    console.log('Instance URL:', TEST_PAYLOAD.config.instance_url)
    console.log('Username:', TEST_PAYLOAD.config.username)
    console.log('Client ID:', TEST_PAYLOAD.config.client_id.substring(0, 15) + '...')
    console.log('Security Token Length:', TEST_PAYLOAD.config.security_token.length)
    console.log()
    
    console.log('🚀 Making request to localhost:3000/api/integrations/test...')
    
    const response = await fetch('http://localhost:3000/api/integrations/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail auth, but we want to see the Salesforce error specifically
      },
      body: JSON.stringify(TEST_PAYLOAD)
    })
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)
    
    const result = await response.json()
    console.log('📋 Response Body:', JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('\n✅ Integration test PASSED!')
    } else {
      console.log('\n❌ Integration test FAILED')
      console.log('Error Analysis:')
      if (result.error) {
        if (result.error.includes('invalid_grant')) {
          console.log('- Issue: Invalid username, password, or security token')
          console.log('- Solution: Reset security token and update credentials')
        } else if (result.error.includes('invalid_client')) {
          console.log('- Issue: Invalid client_id or client_secret')
          console.log('- Solution: Check Connected App Consumer Key/Secret')
        } else if (result.error.includes('unsupported_grant_type')) {
          console.log('- Issue: Connected App not configured for username-password flow')
          console.log('- Solution: Enable OAuth Settings in Connected App')
        } else if (result.error.includes('insufficient_scope')) {
          console.log('- Issue: Missing required OAuth scopes')
          console.log('- Solution: Add "api" and "refresh_token" scopes to Connected App')
        } else if (result.error.includes('Client ID appears to be too short')) {
          console.log('- Issue: Client ID validation failed')
          console.log('- Solution: Check that you copied the full Consumer Key')
        } else {
          console.log('- Unknown error, check logs for details')
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message)
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure your dev server is running: npm run dev')
    }
  }
}

// Instructions
console.log('📝 INSTRUCTIONS:')
console.log('1. Update the security_token in this script with your actual token')
console.log('2. Make sure your dev server is running (npm run dev)')
console.log('3. Run: node scripts/test-api-endpoint.js')
console.log('4. This will test the exact same code path as your UI\n')

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPIEndpoint().catch(console.error)
}