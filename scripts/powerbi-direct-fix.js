#!/usr/bin/env node

/**
 * Direct Power BI Fix - Bypass Tenant Settings
 */

console.log('🔧 POWER BI DIRECT FIX')
console.log('======================\n')

console.log('🎯 **GOOD NEWS!**')
console.log('Since you own the Azure tenant, we can work around the admin issue.\n')

console.log('🚀 **SOLUTION A: Grant App Permissions Directly in Azure**\n')

console.log('1️⃣ **Go to Azure Portal**')
console.log('   • https://portal.azure.com')
console.log('   • Azure Active Directory → App registrations')
console.log('   • Find your "Dashboard Hub Power BI Integration" app\n')

console.log('2️⃣ **Modify API Permissions**')
console.log('   • Click on your app → API permissions')
console.log('   • Remove all current permissions')
console.log('   • Add new permissions → Power BI Service')
console.log('   • Select DELEGATED permissions (not Application):')
console.log('     ✅ Dashboard.Read.All (Delegated)')
console.log('     ✅ Report.Read.All (Delegated)')
console.log('     ✅ Workspace.Read.All (Delegated)')
console.log('   • Click "Grant admin consent for [Your Tenant]"\n')

console.log('3️⃣ **Enable Public Client**')
console.log('   • In your app → Authentication')
console.log('   • Advanced settings → "Allow public client flows" → YES')
console.log('   • Add redirect URI: http://localhost:3000/auth/callback\n')

console.log('🚀 **SOLUTION B: Try Personal Microsoft Account**\n')

console.log('Alternative approach:')
console.log('1. Create new outlook.com account')
console.log('2. Sign up for Power BI with that account')
console.log('3. Personal accounts often have fewer restrictions')
console.log('4. Create sample content there\n')

console.log('🚀 **SOLUTION C: Use Your Existing Azure Setup**\n')

console.log('Actually, let\'s test your current setup:')
console.log('• You have the Azure AD app created ✅')
console.log('• You have client credentials ✅')
console.log('• Let\'s try connecting with what you have!')

console.log('\n💡 **IMMEDIATE TEST:**')
console.log('Let\'s try your Power BI integration RIGHT NOW with:')
console.log('• Your existing Tenant ID')
console.log('• Your existing Client ID') 
console.log('• Your existing Client Secret')
console.log('• Leave Workspace ID empty')

console.log('\n🎯 **NEXT STEPS:**')
console.log('1. Try the delegated permissions approach above')
console.log('2. OR just test with current credentials')
console.log('3. OR create fresh personal Microsoft account')
console.log('4. Let me know which you prefer!')

console.log('\n💬 **What would you like to try first?**')
console.log('A) Modify Azure app to use delegated permissions')
console.log('B) Test current setup as-is') 
console.log('C) Create fresh personal Microsoft account')
