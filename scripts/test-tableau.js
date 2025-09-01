#!/usr/bin/env node
/**
 * Tableau Integration Test Script
 * Dedicated testing for Tableau Cloud/Server connections
 */

const TABLEAU_CONFIG = {
  server_url: 'https://10ax.online.tableau.com', // Your Tableau Cloud URL
  site_id: 'your-site-name', // Your site name from Tableau Cloud
  content_url: 'your-site-name', // Usually same as site_id
  api_version: '3.19',
  
  // Method 1: Personal Access Token (RECOMMENDED)
  personal_access_token_name: 'Dashboard Hub Integration',
  personal_access_token_secret: 'YOUR_TOKEN_SECRET',
  
  // Method 2: Username/Password (if no PAT available)
  // username: 'your@email.com',
  // password: 'yourpassword'
}

const API_URL = 'http://localhost:3000/api/integrations/test'

console.log('📊 TABLEAU INTEGRATION TEST')
console.log('===========================')
console.log('')

async function testTableauIntegration() {
  console.log('🔍 Configuration Check:')
  console.log(`Server URL: ${TABLEAU_CONFIG.server_url}`)
  console.log(`Site ID: ${TABLEAU_CONFIG.site_id}`)
  console.log(`API Version: ${TABLEAU_CONFIG.api_version}`)
  
  if (TABLEAU_CONFIG.personal_access_token_name) {
    console.log(`PAT Name: ${TABLEAU_CONFIG.personal_access_token_name}`)
    console.log(`PAT Secret: ${'*'.repeat(20)}`)
  } else if (TABLEAU_CONFIG.username) {
    console.log(`Username: ${TABLEAU_CONFIG.username}`)
    console.log(`Password: ${'*'.repeat(TABLEAU_CONFIG.password?.length || 0)}`)
  } else {
    console.log('❌ No authentication method configured!')
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
      console.log('1. Create some workbooks in your Tableau site')
      console.log('2. Test dashboard discovery with the sync feature')
      console.log('3. Try embedding dashboards in your app')
      
    } else {
      console.log('\n❌ TABLEAU CONNECTION FAILED')
      console.log(`Error: ${result.error}`)
      
      console.log('\n🔧 Troubleshooting:')
      if (result.error?.includes('401') || result.error?.includes('Authentication failed')) {
        console.log('• Check your Personal Access Token name and secret')
        console.log('• Verify your username and password if using that method')
        console.log('• Ensure your Tableau site is accessible')
      } else if (result.error?.includes('404')) {
        console.log('• Verify your server_url is correct')
        console.log('• Check that your site_id matches your Tableau site name')
        console.log('• Ensure your site is active and accessible')
      } else if (result.error?.includes('No authentication credentials')) {
        console.log('• Configure either Personal Access Token or username/password')
        console.log('• Personal Access Token is the recommended method')
      } else {
        console.log('• Check Tableau server status')
        console.log('• Verify network connectivity')
        console.log('• Review Tableau site permissions')
      }
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
console.log('1. Update TABLEAU_CONFIG with your Tableau Cloud credentials')
console.log('2. Get Personal Access Token from Tableau Cloud → My Account Settings')
console.log('3. Make sure your dev server is running (npm run dev)')
console.log('4. Run: node scripts/test-tableau.js')
console.log('')

if (import.meta.url === `file://${process.argv[1]}`) {
  testTableauIntegration().catch(console.error)
}