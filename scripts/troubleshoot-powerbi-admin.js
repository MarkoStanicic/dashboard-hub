#!/usr/bin/env node

/**
 * Troubleshoot Power BI Admin Rights for Trial Accounts
 */

console.log('🔍 POWER BI TRIAL ADMIN TROUBLESHOOTING')
console.log('======================================\n')

console.log('🤔 **YOU\'RE RIGHT - This is odd!**')
console.log('If you created both accounts yourself, you should have admin rights.\n')

console.log('🔧 **LET\'S TROUBLESHOOT STEP BY STEP:**\n')

console.log('1️⃣ **VERIFY YOUR ACCOUNT TYPE**')
console.log('   • Are you signed in with the SAME email for both:')
console.log('     - Azure portal (portal.azure.com)')
console.log('     - Power BI service (app.powerbi.com)')
console.log('   • Check top-right corner - should be same email\n')

console.log('2️⃣ **CHECK POWER BI TRIAL STATUS**')
console.log('   • Go to: https://app.powerbi.com')
console.log('   • Look for "Trial" indicator (top-right)')
console.log('   • Is your trial active? (should show days remaining)')
console.log('   • Trial accounts sometimes take time to fully provision\n')

console.log('3️⃣ **VERIFY AZURE AD ROLE**')
console.log('   • Go to: https://portal.azure.com')
console.log('   • Navigate to "Azure Active Directory"')
console.log('   • Click "Users" → find your user → click on it')
console.log('   • Check "Assigned roles" - you should see:')
console.log('     ✅ Global Administrator (if trial owner)')
console.log('     ✅ Or at least User Administrator\n')

console.log('4️⃣ **CHECK MICROSOFT 365 ADMIN CENTER**')
console.log('   • Go to: https://admin.microsoft.com')
console.log('   • If you can access this, you have admin rights')
console.log('   • Check "Users" → "Active users" → your user')
console.log('   • Look at assigned licenses and roles\n')

console.log('5️⃣ **POWER BI SPECIFIC CHECKS**')
console.log('   • In Power BI (app.powerbi.com):')
console.log('   • Settings (gear) → "Admin portal"')
console.log('   • You should see ALL these options:')
console.log('     ✅ Tenant settings')
console.log('     ✅ Usage metrics') 
console.log('     ✅ Users')
console.log('     ✅ Premium Per User')
console.log('     ✅ Capacity settings\n')

console.log('❓ **WHAT DO YOU SEE?**\n')

console.log('**In Power BI Admin Portal, do you see:**')
console.log('□ Only "Capacity settings" and "Refresh summary"? → Limited admin')
console.log('□ "Tenant settings" missing? → Need to activate full admin')
console.log('□ "Admin portal" missing entirely? → Wrong account/no admin\n')

console.log('🔧 **POSSIBLE SOLUTIONS:**\n')

console.log('**Solution A: Activate Power BI Admin Role**')
console.log('1. Go to https://admin.microsoft.com')
console.log('2. Users → Active users → [Your user]')
console.log('3. Click "Manage roles"')
console.log('4. Check "Power Platform administrator" or "Power BI administrator"')
console.log('5. Save and wait 15-30 minutes\n')

console.log('**Solution B: Check Trial Limitations**')
console.log('1. Some trials have delayed admin activation')
console.log('2. Try waiting 24-48 hours after trial signup')
console.log('3. Or upgrade to Power BI Pro trial\n')

console.log('**Solution C: Use Different Approach**')
console.log('1. Since you own the tenant, you can try:')
console.log('2. Azure portal → Azure Active Directory → Enterprise apps')
console.log('3. Find your Power BI app registration')
console.log('4. Grant permissions directly in Azure AD\n')

console.log('**Solution D: Create New Tenant (if needed)**')
console.log('1. Create a new Microsoft account (outlook.com)')
console.log('2. Sign up for fresh Power BI trial')
console.log('3. Should get immediate admin rights\n')

console.log('💡 **QUICK DIAGNOSTIC:**')
console.log('What do you see when you go to:')
console.log('• https://admin.microsoft.com (can you access?)')
console.log('• https://portal.azure.com → Azure AD → Users (your role?)')
console.log('• https://app.powerbi.com → Settings → Admin portal (what options?)\n')

console.log('🎯 **EXPECTED FOR TRIAL OWNER:**')
console.log('You should be able to:')
console.log('✅ Access Microsoft 365 admin center')
console.log('✅ See all Azure AD admin features') 
console.log('✅ Have full Power BI admin portal access')
console.log('✅ Configure all tenant settings\n')

console.log('📞 **REPORT BACK:**')
console.log('Please check these and let me know:')
console.log('1. Can you access admin.microsoft.com?')
console.log('2. What roles do you see in Azure AD for your user?')
console.log('3. What exactly appears in Power BI Admin portal?')
console.log('4. How old is your trial account?')

console.log('\n🚀 Once we figure this out, Power BI integration will work perfectly!')
