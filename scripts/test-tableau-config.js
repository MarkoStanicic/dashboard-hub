#!/usr/bin/env node
/**
 * Tableau Configuration Helper
 * Update this with your actual Tableau Cloud credentials
 */

// UPDATE THESE WITH YOUR ACTUAL VALUES
const TABLEAU_CONFIG = {
  server_url: 'https://10ax.online.tableau.com', // Replace with your actual URL
  site_id: 'markobstanicic', // Replace with your actual site name (without numbers/special chars)
  content_url: 'markobstanicic', // Usually same as site_id
  api_version: '3.19',
  
  // Personal Access Token (REQUIRED)
  personal_access_token_name: 'Dashboard Hub Integration',
  personal_access_token_secret: 'YOUR_TOKEN_SECRET_HERE', // Paste your token secret here
}

console.log('📊 TABLEAU CLOUD CONFIGURATION')
console.log('==============================')
console.log('')

console.log('🔍 Current Configuration:')
console.log(`Server URL: ${TABLEAU_CONFIG.server_url}`)
console.log(`Site ID: ${TABLEAU_CONFIG.site_id}`)
console.log(`Content URL: ${TABLEAU_CONFIG.content_url}`)
console.log(`API Version: ${TABLEAU_CONFIG.api_version}`)
console.log(`Token Name: ${TABLEAU_CONFIG.personal_access_token_name}`)
console.log(`Token Secret: ${TABLEAU_CONFIG.personal_access_token_secret === 'YOUR_TOKEN_SECRET_HERE' ? '❌ NOT SET' : '✅ SET'}`)
console.log('')

if (TABLEAU_CONFIG.personal_access_token_secret === 'YOUR_TOKEN_SECRET_HERE') {
  console.log('⚠️  Please update the token secret before testing!')
  console.log('')
  console.log('Steps:')
  console.log('1. In Tableau Cloud → Profile → My Account Settings')
  console.log('2. Personal Access Tokens → Create new token')
  console.log('3. Copy the token secret and paste it in this file')
  console.log('4. Update the server_url and site_id if needed')
  console.log('5. Run: node scripts/test-tableau-real.js')
} else {
  console.log('✅ Configuration looks good!')
  console.log('🚀 Ready to test connection!')
  console.log('')
  console.log('Next steps:')
  console.log('1. Run: node scripts/test-tableau-real.js')
  console.log('2. If successful, test in UI at: http://localhost:3000/company/integrations')
}

export { TABLEAU_CONFIG }
