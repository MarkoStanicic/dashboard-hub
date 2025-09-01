#!/usr/bin/env node

/**
 * Debug Power BI Tenant ID Issue
 */

console.log('🔍 POWER BI TENANT DEBUG')
console.log('========================\n')

console.log('🤔 **ISSUE ANALYSIS:**')
console.log('Script test: ✅ 200 OK')
console.log('Browser test: ❌ Tenant not found')
console.log('Same credentials, different results!\n')

console.log('🔧 **POSSIBLE SOLUTIONS:**\n')

console.log('1️⃣ **TRY DIFFERENT TENANT ID FORMAT**')
console.log('Instead of: 41b5960e-bd91-4e35-a767-7efcf7ef4f15')
console.log('Try your domain: brookastudio.onmicrosoft.com')
console.log('Or just: brookastudio\n')

console.log('2️⃣ **CHECK AZURE AD DOMAIN**')
console.log('• Go to: https://portal.azure.com')
console.log('• Azure Active Directory → Overview')
console.log('• Look for "Primary domain" or "Tenant domain"')
console.log('• It might be something like: yourname.onmicrosoft.com\n')

console.log('3️⃣ **VERIFY TENANT IN DIFFERENT PLACE**')
console.log('• Go to: https://portal.azure.com → Azure Active Directory')
console.log('• Click on "Properties" in the left menu')
console.log('• Check both "Tenant ID" and "Domain name"\n')

console.log('4️⃣ **TRY DIFFERENT AUTH ENDPOINT**')
console.log('Sometimes the tenant needs a different format for Power BI')
console.log('Common formats:')
console.log('• yourname.onmicrosoft.com (most common)')
console.log('• just the GUID we have')
console.log('• your custom domain if you have one\n')

console.log('🎯 **IMMEDIATE FIXES TO TRY:**\n')

console.log('**Fix A: Use Domain Name Instead**')
console.log('In the browser form, try:')
console.log('Tenant ID: brookastudio.onmicrosoft.com')
console.log('(replace "brookastudio" with your actual domain)\n')

console.log('**Fix B: Check Your Azure AD Domain**')
console.log('1. Go to Azure portal')
console.log('2. Azure Active Directory → Properties')
console.log('3. Copy the "Primary domain" value')
console.log('4. Use that as Tenant ID in browser\n')

console.log('**Fix C: Power BI Specific Tenant**')
console.log('1. Go to https://app.powerbi.com')
console.log('2. Settings → About')
console.log('3. Look for tenant information there\n')

console.log('💡 **MOST LIKELY SOLUTION:**')
console.log('The tenant ID format needs to be a domain name for Power BI.')
console.log('Check Azure AD Properties for your .onmicrosoft.com domain!')

console.log('\n📞 **NEXT STEPS:**')
console.log('1. Check Azure AD Properties for domain name')
console.log('2. Try browser test with domain name instead of GUID')
console.log('3. Report back what domain you find!')

// Test different tenant formats
const tenantFormats = [
  '41b5960e-bd91-4e35-a767-7efcf7ef4f15',
  'brookastudio.onmicrosoft.com',
  'dev.brookastudio.onmicrosoft.com'
]

console.log('\n🧪 **FORMATS TO TEST:**')
tenantFormats.forEach((format, i) => {
  console.log(`${i + 1}. ${format}`)
})

console.log('\nTry each format in the browser until one works!')
