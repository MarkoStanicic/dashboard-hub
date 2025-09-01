#!/usr/bin/env node
/**
 * Integration Testing with Authentication Bypass
 * This script temporarily enables auth bypass for development testing
 */

import { spawn } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const ENV_FILE = '.env.local'

console.log('🔧 INTEGRATION TESTING WITH AUTH BYPASS')
console.log('======================================')

async function enableAuthBypass() {
  try {
    // Read current .env.local
    let envContent = ''
    try {
      envContent = readFileSync(ENV_FILE, 'utf8')
    } catch (error) {
      console.log('📄 Creating new .env.local file...')
    }
    
    // Check if bypass is already enabled
    if (envContent.includes('BYPASS_AUTH_FOR_TESTING=true')) {
      console.log('✅ Auth bypass already enabled')
      return true
    }
    
    // Add bypass flag
    const bypassLine = '\n# Temporary auth bypass for testing\nBYPASS_AUTH_FOR_TESTING=true\n'
    
    if (!envContent.includes('BYPASS_AUTH_FOR_TESTING')) {
      envContent += bypassLine
      writeFileSync(ENV_FILE, envContent)
      console.log('✅ Auth bypass enabled in .env.local')
    } else {
      // Replace existing false with true
      envContent = envContent.replace(
        /BYPASS_AUTH_FOR_TESTING=false/g, 
        'BYPASS_AUTH_FOR_TESTING=true'
      )
      writeFileSync(ENV_FILE, envContent)
      console.log('✅ Auth bypass updated to true')
    }
    
    return true
  } catch (error) {
    console.log('❌ Failed to enable auth bypass:', error.message)
    return false
  }
}

async function disableAuthBypass() {
  try {
    let envContent = readFileSync(ENV_FILE, 'utf8')
    
    // Replace true with false or remove the line
    envContent = envContent.replace(
      /BYPASS_AUTH_FOR_TESTING=true/g, 
      'BYPASS_AUTH_FOR_TESTING=false'
    )
    
    writeFileSync(ENV_FILE, envContent)
    console.log('✅ Auth bypass disabled')
  } catch (error) {
    console.log('⚠️  Could not disable auth bypass:', error.message)
  }
}

async function runTest(testScript) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running ${testScript}...`)
    
    const child = spawn('node', [testScript], {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Test failed with exit code ${code}`))
      }
    })
    
    child.on('error', (error) => {
      reject(error)
    })
  })
}

async function main() {
  const testScripts = [
    'scripts/quick-demo-test.js',
    'scripts/test-all-integrations.js'
  ]
  
  console.log('\n📋 Test Plan:')
  console.log('1. Enable authentication bypass')
  console.log('2. Run integration tests')
  console.log('3. Disable authentication bypass')
  console.log('4. Provide next steps')
  
  // Step 1: Enable auth bypass
  console.log('\n🔧 Step 1: Enabling Authentication Bypass')
  const bypassEnabled = await enableAuthBypass()
  
  if (!bypassEnabled) {
    console.log('❌ Cannot proceed without auth bypass')
    process.exit(1)
  }
  
  // Wait a moment for the environment to update
  console.log('⏳ Waiting for environment update...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Step 2: Run tests
  console.log('\n🧪 Step 2: Running Integration Tests')
  
  let allTestsPassed = true
  
  for (const testScript of testScripts) {
    try {
      await runTest(testScript)
      console.log(`✅ ${testScript} completed`)
    } catch (error) {
      console.log(`❌ ${testScript} failed:`, error.message)
      allTestsPassed = false
    }
  }
  
  // Step 3: Disable auth bypass
  console.log('\n🔒 Step 3: Disabling Authentication Bypass')
  await disableAuthBypass()
  
  // Step 4: Summary
  console.log('\n📊 TEST RESULTS SUMMARY')
  console.log('======================')
  
  if (allTestsPassed) {
    console.log('✅ All tests passed!')
    console.log('🎉 Your integration system is working correctly!')
  } else {
    console.log('❌ Some tests failed')
    console.log('🔧 Check the error messages above for details')
  }
  
  console.log('\n🎯 NEXT STEPS:')
  console.log('1. Set up your platform credentials using the setup guides')
  console.log('2. Update test scripts with real credentials')
  console.log('3. Test each platform individually')
  console.log('4. Use the UI to test the full integration workflow')
  console.log('')
  console.log('📚 Guides Available:')
  console.log('• docs/FREE_ACCOUNT_SETUP_GUIDE.md')
  console.log('• docs/INTEGRATION_TESTING_GUIDE.md')
  console.log('')
  console.log('🌐 UI Testing: http://localhost:3001/company/integrations')
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Test interrupted - cleaning up...')
  await disableAuthBypass()
  process.exit(0)
})

process.on('uncaughtException', async (error) => {
  console.log('\n💥 Unexpected error:', error.message)
  await disableAuthBypass()
  process.exit(1)
})

main().catch(async (error) => {
  console.log('\n❌ Test suite failed:', error.message)
  await disableAuthBypass()
  process.exit(1)
})