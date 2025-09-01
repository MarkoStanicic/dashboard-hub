import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function completeSetup() {
  console.log('🎯 Completing Dashboard Hub setup...')

  try {
    // Read the test data reference
    const testData = JSON.parse(fs.readFileSync('test-data-reference.json', 'utf8'))
    
    console.log('📋 Setting up users and roles...')
    
    // Create user_roles entries
    const userRolesData = [
      { user_id: testData.userIds.john, company_id: testData.companyIds.acme, role_id: testData.roleIds.admin },
      { user_id: testData.userIds.jane, company_id: testData.companyIds.acme, role_id: testData.roleIds.editor },
      { user_id: testData.userIds.bob, company_id: testData.companyIds.acme, role_id: testData.roleIds.viewer },
      { user_id: testData.userIds.alice, company_id: testData.companyIds.techcorp, role_id: testData.roleIds.admin },
      { user_id: testData.userIds.charlie, company_id: testData.companyIds.techcorp, role_id: testData.roleIds.editor },
      { user_id: testData.userIds.diana, company_id: testData.companyIds.datalab, role_id: testData.roleIds.admin },
      { user_id: testData.userIds.frank, company_id: testData.companyIds.datalab, role_id: testData.roleIds.viewer }
    ]

    const { error: userRolesError } = await supabase
      .from('user_roles')
      .upsert(userRolesData)

    if (userRolesError) {
      console.log('⚠️  User roles error (might need Auth users first):', userRolesError.message)
    } else {
      console.log('✅ User roles assigned')
    }

    // Check what columns exist in dashboards table
    console.log('📊 Checking dashboard table structure...')
    const { data: dashboardSample } = await supabase
      .from('dashboards')
      .select('*')
      .limit(1)

    console.log('Dashboard columns available:', dashboardSample ? Object.keys(dashboardSample[0] || {}) : 'Table empty')

    // Create dashboards with only available columns
    console.log('📊 Creating test dashboards...')
    const dashboardsData = [
      {
        title: 'Sales Performance Dashboard',
        embed_url: 'https://public.tableau.com/views/SuperstoreSample/Overview?:embed=y&:display_count=no&:toolbar=no',
        company_id: testData.companyIds.acme
      },
      {
        title: 'Weekly Operations Report',
        embed_url: 'https://public.tableau.com/views/RegionalSampleWorkbook/Storms?:embed=y&:display_count=no&:toolbar=no',
        company_id: testData.companyIds.acme
      },
      {
        title: 'Financial Overview',
        embed_url: 'https://public.tableau.com/views/WorldIndicators/GDPpercapita?:embed=y&:display_count=no&:toolbar=no',
        company_id: testData.companyIds.techcorp
      },
      {
        title: 'Growth Metrics',
        embed_url: 'https://public.tableau.com/views/SampleHealthcare/Obesity?:embed=y&:display_count=no&:toolbar=no',
        company_id: testData.companyIds.datalab
      }
    ]

    const { error: dashboardsError } = await supabase
      .from('dashboards')
      .upsert(dashboardsData)

    if (dashboardsError) {
      console.log('⚠️  Dashboards error:', dashboardsError.message)
    } else {
      console.log('✅ Test dashboards created')
    }

    console.log('\n🎉 Setup complete!')
    console.log('\n🧪 Test Your Dashboard Hub:')
    console.log('1. Login with any of these accounts:')
    testData.testUsers.forEach(user => {
      console.log(`   - ${user.email} / TestPass123! (${user.role})`)
    })
    console.log('2. Navigate to /dashboard to see the test data')
    console.log('3. Try different user roles to test permissions')

  } catch (error) {
    console.error('❌ Error completing setup:', error)
  }
}

completeSetup() 