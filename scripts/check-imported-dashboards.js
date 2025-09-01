#!/usr/bin/env node

/**
 * Check what dashboards have been imported to the database
 */

const API_URL = 'http://localhost:3000'

async function checkImportedDashboards() {
  console.log('🔍 Checking Imported Dashboards...\n')
  
  try {
    // Check dashboards via API if available
    console.log('📋 Fetching dashboards via API...')
    const response = await fetch(`${API_URL}/api/dashboards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const dashboards = await response.json()
      console.log(`✅ Found ${dashboards.length} dashboards in database\n`)
      
      if (dashboards.length > 0) {
        console.log('📊 Dashboard Details:')
        console.log('===================')
        dashboards.forEach((dashboard, index) => {
          console.log(`${index + 1}. ${dashboard.title}`)
          console.log(`   Type: ${dashboard.type}`)
          console.log(`   Description: ${dashboard.description || 'No description'}`)
          console.log(`   Embed URL: ${dashboard.embed_url}`)
          console.log(`   External ID: ${dashboard.external_id || 'None'}`)
          console.log(`   Integration ID: ${dashboard.integration_id || 'None'}`)
          console.log(`   Company ID: ${dashboard.company_id}`)
          console.log(`   Created: ${new Date(dashboard.created_at).toLocaleString()}`)
          console.log('   ---')
        })
        
        // Check for Tableau dashboards specifically
        const tableauDashboards = dashboards.filter(d => d.type === 'tableau')
        console.log(`\n🎯 Tableau Dashboards: ${tableauDashboards.length}`)
        if (tableauDashboards.length > 0) {
          tableauDashboards.forEach(dashboard => {
            console.log(`   - "${dashboard.title}" (${dashboard.external_id})`)
          })
        }
        
      } else {
        console.log('❌ No dashboards found in database')
        console.log('\n🔍 This suggests that either:')
        console.log('   1. The sync didn\'t actually save to the database')
        console.log('   2. There\'s a mismatch in company_id filtering')
        console.log('   3. The dashboard import failed silently')
      }
      
    } else {
      console.log(`❌ API request failed: ${response.status} ${response.statusText}`)
      console.log('   This might mean there\'s no dashboard API endpoint yet.')
    }
    
  } catch (error) {
    console.error('❌ Error checking dashboards:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 The development server is not running!')
      console.log('   Please start it with: npm run dev')
    }
  }
}

async function generateDatabaseCheck() {
  console.log('\n💾 Direct Database Check:')
  console.log('========================')
  
  console.log('\n🌐 Run this in your browser console to check the database directly:')
  console.log(`
// Check dashboards directly in browser
fetch('/api/dashboards')
  .then(res => {
    console.log('Response status:', res.status, res.statusText);
    return res.json();
  })
  .then(dashboards => {
    console.log('Total dashboards:', dashboards.length);
    console.log('Dashboards:', dashboards);
    
    const tableauDashboards = dashboards.filter(d => d.type === 'tableau');
    console.log('Tableau dashboards:', tableauDashboards.length);
    
    if (tableauDashboards.length === 0) {
      console.log('❌ No Tableau dashboards found - sync may have failed');
    } else {
      console.log('✅ Tableau dashboards found:', tableauDashboards);
    }
  })
  .catch(err => {
    console.error('Error:', err);
  });
`)

  console.log('\n📝 If no dashboards are found, check:')
  console.log('   1. Are there dashboard API endpoints?')
  console.log('   2. Did the sync actually save to database?')
  console.log('   3. Is there a company_id mismatch?')
  console.log('   4. Are there any RLS policies blocking access?')
}

console.log('🔍 DASHBOARD IMPORT CHECKER')
console.log('============================\n')

checkImportedDashboards().then(() => {
  generateDatabaseCheck()
  console.log('\n✅ Check completed!')
})
