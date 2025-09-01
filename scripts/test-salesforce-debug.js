#!/usr/bin/env node
/**
 * Comprehensive Salesforce Integration Debug Script
 * This script will systematically test the Salesforce connection and identify issues
 */

// Test configuration - replace with your actual values
const TEST_CONFIG = {
  instance_url: 'https://orgfarm-e4a5ef21df-dev-ed.develop.my.salesforce.com',
  client_id: '3MVG9sAEuw2Y.lLvcXiEXDucDZX.6xhF8BVxITXQZDGCvZgSxZKP8JSCMPECHAI',
  client_secret: '478E2CA5AA6D53E8EC4A8AZCCB9DCBCD0666DF531T78510730CDF33AAFBF88',
  username: 'marko.b.stanicic622@agentforce.com',
  password: 'Sepultura987',
  security_token: 'REPLACE_WITH_NEW_TOKEN_FROM_EMAIL'
}

console.log('🔍 SALESFORCE INTEGRATION DEBUG SCRIPT')
console.log('=====================================\n')

// Step 1: Validate configuration
console.log('📋 Step 1: Configuration Validation')
console.log('-----------------------------------')

function validateConfig(config) {
  const issues = []
  
  // Check required fields
  if (!config.instance_url) issues.push('❌ instance_url is missing')
  if (!config.client_id) issues.push('❌ client_id is missing')
  if (!config.client_secret) issues.push('❌ client_secret is missing')
  if (!config.username) issues.push('❌ username is missing')
  if (!config.password) issues.push('❌ password is missing')
  
  // Validate formats
  if (config.client_id && config.client_id.length < 50) {
    issues.push('❌ client_id appears too short (should be 50+ chars)')
  }
  
  if (config.client_secret && config.client_secret.length < 30) {
    issues.push('❌ client_secret appears too short (should be 30+ chars)')
  }
  
  if (config.instance_url && !config.instance_url.startsWith('https://')) {
    issues.push('❌ instance_url should start with https://')
  }
  
  if (config.username && !config.username.includes('@')) {
    issues.push('❌ username should be an email address')
  }
  
  if (!config.security_token || config.security_token === 'REPLACE_WITH_NEW_TOKEN_FROM_EMAIL') {
    issues.push('⚠️  security_token not set - you need to reset and get new token')
  }
  
  return issues
}

const configIssues = validateConfig(TEST_CONFIG)
if (configIssues.length > 0) {
  console.log('Configuration Issues Found:')
  configIssues.forEach(issue => console.log(issue))
  console.log('\n❌ Fix configuration issues before continuing.\n')
} else {
  console.log('✅ Configuration validation passed\n')
}

// Step 2: Test OAuth endpoint directly
console.log('🔐 Step 2: Direct OAuth Test')
console.log('---------------------------')

async function testDirectOAuth() {
  try {
    // Determine correct login URL
    const isDevOrg = TEST_CONFIG.instance_url?.includes('develop') || TEST_CONFIG.instance_url?.includes('scratch')
    const isSandbox = TEST_CONFIG.instance_url?.includes('test.salesforce.com') || TEST_CONFIG.instance_url?.includes('sandbox')
    
    const loginUrl = isSandbox 
      ? 'https://test.salesforce.com/services/oauth2/token'
      : 'https://login.salesforce.com/services/oauth2/token'
    
    console.log(`🌐 Using login URL: ${loginUrl}`)
    console.log(`📍 Dev Org detected: ${isDevOrg}`)
    console.log(`📍 Sandbox detected: ${isSandbox}`)
    
    // Prepare request
    const securityToken = (TEST_CONFIG.security_token || '').trim()
    const fullPassword = TEST_CONFIG.password + securityToken
    
    console.log(`👤 Username: ${TEST_CONFIG.username}`)
    console.log(`🔑 Client ID: ${TEST_CONFIG.client_id.substring(0, 15)}...`)
    console.log(`🔒 Password length: ${TEST_CONFIG.password.length}`)
    console.log(`🎫 Security token length: ${securityToken.length}`)
    console.log(`🔗 Full password length: ${fullPassword.length}`)
    
    const bodyParams = [
      `grant_type=password`,
      `client_id=${encodeURIComponent(TEST_CONFIG.client_id)}`,
      `client_secret=${encodeURIComponent(TEST_CONFIG.client_secret)}`,
      `username=${encodeURIComponent(TEST_CONFIG.username)}`,
      `password=${encodeURIComponent(fullPassword)}`
    ].join('&')
    
    console.log(`📦 Request body length: ${bodyParams.length}`)
    console.log('🚀 Making OAuth request...\n')
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: bodyParams
    })
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }
      
      console.log('❌ OAuth Request Failed:')
      console.log('Error Details:', JSON.stringify(errorData, null, 2))
      
      // Analyze common errors
      if (typeof errorData === 'object' && errorData.error) {
        console.log('\n🔍 Error Analysis:')
        switch (errorData.error) {
          case 'invalid_grant':
            console.log('- This usually means username, password, or security token is incorrect')
            console.log('- Try resetting your security token again')
            console.log('- Verify your password is correct')
            break
          case 'invalid_client_id':
            console.log('- Your Connected App Consumer Key (client_id) is incorrect')
            console.log('- Check your Connected App settings')
            break
          case 'invalid_client':
            console.log('- Your Connected App Consumer Secret (client_secret) is incorrect')
            console.log('- Check your Connected App settings')
            break
          case 'unsupported_grant_type':
            console.log('- Your Connected App is not configured for Username-Password flow')
            console.log('- Check OAuth Settings in your Connected App')
            break
          default:
            console.log(`- Unknown error: ${errorData.error}`)
        }
      }
      
      return false
    } else {
      const tokenData = await response.json()
      console.log('✅ OAuth Success!')
      console.log(`🎟️  Access Token: ${tokenData.access_token.substring(0, 20)}...`)
      console.log(`🏢 Instance URL: ${tokenData.instance_url}`)
      return true
    }
    
  } catch (error) {
    console.log('❌ OAuth Test Failed with Exception:')
    console.log(error.message)
    return false
  }
}

// Step 3: Test using our service class
console.log('🔧 Step 3: Service Class Test')
console.log('----------------------------')

async function testServiceClass() {
  try {
    // Import our service (adjust path as needed)
    const { SalesforceService } = await import('../lib/platforms/salesforce-service.js')
    
    const service = new SalesforceService(TEST_CONFIG)
    const result = await service.testConnection()
    
    if (result.success) {
      console.log('✅ Service Test Passed!')
      console.log('Connection Data:', JSON.stringify(result.data, null, 2))
    } else {
      console.log('❌ Service Test Failed:')
      console.log('Error:', result.error)
    }
    
    return result.success
  } catch (error) {
    console.log('❌ Service Test Failed with Exception:')
    console.log(error.message)
    return false
  }
}

// Main execution
async function runDiagnostics() {
  if (configIssues.length > 0) {
    console.log('⚠️  Cannot run OAuth tests due to configuration issues.')
    console.log('Please fix the configuration issues above and run again.')
    return
  }
  
  console.log('Starting OAuth diagnostics...\n')
  
  const oauthSuccess = await testDirectOAuth()
  console.log('\n' + '='.repeat(50) + '\n')
  
  if (oauthSuccess) {
    console.log('Proceeding to service class test...\n')
    await testServiceClass()
  } else {
    console.log('❌ OAuth failed - fix OAuth issues before testing service class')
  }
  
  console.log('\n🏁 Diagnostics Complete')
  console.log('======================')
}

// Add instructions for user
console.log('📝 BEFORE RUNNING THIS SCRIPT:')
console.log('1. Replace TEST_CONFIG values with your actual credentials')
console.log('2. Make sure you have reset your security token and updated it above')
console.log('3. Run: node scripts/test-salesforce-debug.js')
console.log('\n')

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostics().catch(console.error)
}

export { runDiagnostics, testDirectOAuth, validateConfig }