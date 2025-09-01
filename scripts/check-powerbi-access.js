#!/usr/bin/env node

/**
 * Check Power BI access and provide guidance
 */

console.log('🔍 POWER BI ACCESS CHECKER')
console.log('==========================\n')

console.log('📋 **CHECK YOUR POWER BI PERMISSIONS**\n')

console.log('1️⃣ **Check if you have admin access:**')
console.log('   • Go to: https://app.powerbi.com')
console.log('   • Click the Settings gear icon (top right)')
console.log('   • Do you see "Admin portal" option?')
console.log('     ✅ YES = You have some admin access')
console.log('     ❌ NO = You are a regular user\n')

console.log('2️⃣ **If you have "Admin portal" access:**')
console.log('   • Click "Admin portal"')
console.log('   • Look for "Tenant settings" in the left menu')
console.log('     ✅ YES = You can configure service principals')
console.log('     ❌ NO = You need higher admin privileges\n')

console.log('3️⃣ **Check your role:**')
console.log('   • Go to: https://admin.microsoft.com (Microsoft 365 admin)')
console.log('   • Or check with your IT admin about your Power BI role')
console.log('   • Roles that can configure tenant settings:')
console.log('     ✅ Global Administrator')
console.log('     ✅ Power BI Administrator')
console.log('     ✅ Fabric Administrator\n')

console.log('💡 **ALTERNATIVE SOLUTIONS**\n')

console.log('🔄 **Option A: Ask Your Admin**')
console.log('Send this request to your IT/Power BI admin:')
console.log('---')
console.log('Subject: Enable Power BI API Access for Dashboard Integration')
console.log('')
console.log('Hi [Admin Name],')
console.log('')
console.log('I\'m setting up a dashboard integration that needs to read')
console.log('Power BI content via API. Could you please:')
console.log('')
console.log('1. Go to Power BI Admin portal → Tenant settings')
console.log('2. Find "Allow service principals to use Power BI APIs"')
console.log('3. Enable it and add this Application ID: [YOUR_CLIENT_ID]')
console.log('')
console.log('This allows secure, read-only access to our Power BI content.')
console.log('')
console.log('Thanks!')
console.log('[Your Name]')
console.log('---\n')

console.log('🔄 **Option B: Use Delegated Permissions (Limited)**')
console.log('If admin approval isn\'t possible, we can try:')
console.log('• User-based authentication instead of service principal')
console.log('• More limited but might work for personal content')
console.log('• Requires user to sign in each time\n')

console.log('🔄 **Option C: Power BI Embedded Trial**')
console.log('• Create Azure account with Power BI Embedded')
console.log('• Different permission model')
console.log('• May have more flexibility for API access\n')

console.log('📞 **NEXT STEPS**')
console.log('1. Check your permissions using steps above')
console.log('2. If no admin access: Contact your IT admin with the message')
console.log('3. If admin says no: We can try Option B (delegated permissions)')
console.log('4. Update us on what you find!\n')

console.log('💭 **Questions to ask your admin:**')
console.log('• "Can you enable service principal API access for Power BI?"')
console.log('• "What\'s our organization\'s policy on Power BI API integrations?"')
console.log('• "Can I get a dedicated Power BI workspace for this project?"')
console.log('• "Should I use Power BI Embedded instead?"')

console.log('\n✅ Run this check and let us know what you find!')
