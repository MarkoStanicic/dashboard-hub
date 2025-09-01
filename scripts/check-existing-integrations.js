#!/usr/bin/env node

/**
 * Check existing integrations and clean up duplicates
 */

const API_URL = 'http://localhost:3000'

async function checkExistingIntegrations() {
  console.log('🔍 Checking Existing Integrations...\n')
  
  try {
    // Get existing integrations
    console.log('📋 Fetching current integrations...')
    const response = await fetch(`${API_URL}/api/integrations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch integrations: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      return
    }
    
    const integrations = await response.json()
    console.log(`✅ Found ${integrations.length} existing integrations\n`)
    
    if (integrations.length === 0) {
      console.log('✨ No existing integrations found. You can create a new one!')
      return
    }
    
    // Display existing integrations
    console.log('📊 Existing Integrations:')
    console.log('========================')
    integrations.forEach((integration, index) => {
      console.log(`${index + 1}. ${integration.name}`)
      console.log(`   Platform: ${integration.platform}`)
      console.log(`   Status: ${integration.status}`)
      console.log(`   Created: ${new Date(integration.created_at).toLocaleDateString()}`)
      console.log(`   ID: ${integration.id}`)
      console.log('   ---')
    })
    
    // Check for tableau specifically
    const tableauIntegrations = integrations.filter(i => i.platform === 'tableau')
    
    if (tableauIntegrations.length > 0) {
      console.log('\n🎯 Tableau Integrations Found:')
      tableauIntegrations.forEach(integration => {
        console.log(`   - "${integration.name}" (${integration.status})`)
      })
      
      console.log('\n💡 Solutions:')
      console.log('1. Use a different name like "Tableau Cloud Integration" or "My Tableau Server"')
      console.log('2. Delete the existing integration first')
      console.log('3. Update the existing integration instead of creating a new one')
    }
    
  } catch (error) {
    console.error('❌ Error checking integrations:', error)
  }
}

async function generateCleanupScript() {
  console.log('\n🧹 Cleanup Options:')
  console.log('===================')
  
  console.log('\n🌐 Option 1: Delete existing integration from browser console:')
  console.log(`
// Get all integrations
fetch('/api/integrations')
  .then(res => res.json())
  .then(integrations => {
    console.log('Existing integrations:', integrations);
    
    // Find Tableau integration to delete
    const tableauIntegration = integrations.find(i => i.platform === 'tableau');
    if (tableauIntegration) {
      console.log('Found Tableau integration to delete:', tableauIntegration.id);
      
      // Delete it
      return fetch(\`/api/integrations?id=\${tableauIntegration.id}\`, {
        method: 'DELETE'
      });
    }
  })
  .then(res => {
    if (res) {
      console.log('Delete response:', res.status, res.statusText);
      return res.json();
    }
  })
  .then(result => {
    if (result) {
      console.log('Delete result:', result);
      console.log('✅ Now you can create a new Tableau integration!');
    }
  })
  .catch(err => console.error('Error:', err));
`)

  console.log('\n📝 Option 2: Use a different name in the UI:')
  console.log('   - "Tableau Cloud Production"')
  console.log('   - "My Tableau Server"') 
  console.log('   - "Tableau Dashboard Hub"')
  console.log('   - "Company Tableau Integration"')
}

console.log('🔍 INTEGRATION CONFLICT CHECKER')
console.log('=================================\n')

checkExistingIntegrations().then(() => {
  generateCleanupScript()
  console.log('\n✅ Check completed!')
})
