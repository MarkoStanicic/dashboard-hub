#!/usr/bin/env node

/**
 * Debug Power BI 404 Error
 */

console.log('🔍 POWER BI 404 DEBUG')
console.log('=======================\n')

console.log('🎯 **PROGRESS ANALYSIS:**')
console.log('✅ Tenant authentication working (brookastudio.onmicrosoft.com)')
console.log('✅ Client credentials accepted')
console.log('❌ 404 error from Power BI API endpoints\n')

console.log('🚨 **LIKELY ISSUES:**\n')

console.log('1️⃣ **WRONG API ENDPOINT**')
console.log('Our code tries: /v1.0/myorg/users')
console.log('But this endpoint might not exist for service principals')
console.log('Power BI API for service principals uses different endpoints\n')

console.log('2️⃣ **NO POWER BI CONTENT**')
console.log('Your trial account might not have:')
console.log('• Any workspaces created')
console.log('• Any dashboards or reports')
console.log('• Power BI Pro license activated\n')

console.log('3️⃣ **INSUFFICIENT PERMISSIONS**')
console.log('Service principal might need:')
console.log('• To be added to specific workspaces')
console.log('• Different API permissions')
console.log('• Power BI admin approval (which we bypassed)\n')

console.log('🔧 **IMMEDIATE FIXES TO TRY:**\n')

console.log('**Fix A: Create Power BI Content First**')
console.log('1. Go to: https://app.powerbi.com')
console.log('2. Click "Get data" → "Samples"')
console.log('3. Choose "Financial Sample" → Connect')
console.log('4. Wait for it to create a workspace with content')
console.log('5. Then test integration again\n')

console.log('**Fix B: Test Different API Endpoints**')
console.log('Instead of checking users, just try to list workspaces')
console.log('The /v1.0/myorg/groups endpoint should work\n')

console.log('**Fix C: Use Modified Power BI Service**')
console.log('Update the PowerBI service to skip user check')
console.log('and only try to get workspaces/dashboards\n')

console.log('💡 **QUICK TEST:**')
console.log('Let\'s modify the Power BI service to:')
console.log('1. Skip the getCurrentUser() call (causing 404)')
console.log('2. Only try getWorkspaces()')
console.log('3. Handle empty results gracefully\n')

console.log('🎯 **RECOMMENDED APPROACH:**')
console.log('1. Create sample Power BI content first')
console.log('2. Modify our service to handle missing content')
console.log('3. Test with simplified API calls')

console.log('\n📞 **NEXT STEPS:**')
console.log('A) Create sample Power BI content and retry')
console.log('B) Modify Power BI service code to handle 404s')
console.log('C) Test with workspace-specific API calls')
console.log('\nWhich approach would you like to try?')
