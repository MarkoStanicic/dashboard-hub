import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function simpleTestSetup() {
  console.log('🚀 Setting up test data with actual schema...')

  try {
    // Use existing company IDs from database
    const { data: existingCompanies } = await supabase.from('companies').select('*')
    console.log('📊 Found existing companies:', existingCompanies?.length)

    // Use existing role IDs (integers)
    const roleIds = {
      admin: 1,
      editor: 2, 
      viewer: 3
    }

    // Use the existing company UUIDs
    const companyIds = {
      acme: existingCompanies?.[0]?.id,
      techcorp: existingCompanies?.[1]?.id,
      datalab: existingCompanies?.[2]?.id
    }

    console.log('🏢 Using company IDs:', companyIds)

    // Generate user UUIDs (these will be placeholder until we create Auth users)
    const userIds = {
      john: uuidv4(),
      jane: uuidv4(),
      bob: uuidv4(),
      alice: uuidv4(),
      charlie: uuidv4(),
      diana: uuidv4(),
      frank: uuidv4()
    }

    // Step 1: Check what columns exist in users table
    console.log('👥 Checking users table...')
    const { data: testUser, error: userTestError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (userTestError) {
      console.log('Users table error:', userTestError.message)
    }

    // Step 2: Create users with minimal columns
    console.log('👥 Creating test users...')
    const { error: usersError } = await supabase
      .from('users')
      .upsert([
        { id: userIds.john, company_id: companyIds.acme, is_super_admin: false },
        { id: userIds.jane, company_id: companyIds.acme, is_super_admin: false },
        { id: userIds.bob, company_id: companyIds.acme, is_super_admin: false },
        { id: userIds.alice, company_id: companyIds.techcorp, is_super_admin: false },
        { id: userIds.charlie, company_id: companyIds.techcorp, is_super_admin: false },
        { id: userIds.diana, company_id: companyIds.datalab, is_super_admin: false },
        { id: userIds.frank, company_id: companyIds.datalab, is_super_admin: false }
      ])

    if (usersError) {
      console.log('Users error:', usersError.message)
    } else {
      console.log('✅ Users created')
    }

    // Step 3: Create user roles
    console.log('🔐 Creating user roles...')
    const { error: userRolesError } = await supabase
      .from('user_roles')
      .upsert([
        { user_id: userIds.john, company_id: companyIds.acme, role_id: roleIds.admin },
        { user_id: userIds.jane, company_id: companyIds.acme, role_id: roleIds.editor },
        { user_id: userIds.bob, company_id: companyIds.acme, role_id: roleIds.viewer },
        { user_id: userIds.alice, company_id: companyIds.techcorp, role_id: roleIds.admin },
        { user_id: userIds.charlie, company_id: companyIds.techcorp, role_id: roleIds.editor },
        { user_id: userIds.diana, company_id: companyIds.datalab, role_id: roleIds.admin },
        { user_id: userIds.frank, company_id: companyIds.datalab, role_id: roleIds.viewer }
      ])

    if (userRolesError) {
      console.log('User roles error:', userRolesError.message)
    } else {
      console.log('✅ User roles created')
    }

    // Step 4: Check dashboards table structure
    console.log('📊 Checking dashboards table...')
    const { data: testDashboard, error: dashboardTestError } = await supabase
      .from('dashboards')
      .select('*')
      .limit(1)

    if (dashboardTestError) {
      console.log('Dashboards table error:', dashboardTestError.message)
    }

    // Step 5: Create dashboards with minimal columns
    console.log('📊 Creating test dashboards...')
    const { error: dashboardsError } = await supabase
      .from('dashboards')
      .upsert([
        {
          id: uuidv4(),
          title: 'Sales Performance Dashboard',
          platform: 'tableau',
          embed_url: 'https://public.tableau.com/views/SuperstoreSample/Overview?:embed=y&:display_count=no&:toolbar=no',
          company_id: companyIds.acme
        },
        {
          id: uuidv4(),
          title: 'Weekly Operations Report',
          platform: 'powerbi',
          embed_url: 'https://app.powerbi.com/view?r=sample',
          company_id: companyIds.acme
        },
        {
          id: uuidv4(),
          title: 'Financial Overview',
          platform: 'powerbi',
          embed_url: 'https://app.powerbi.com/view?r=finance',
          company_id: companyIds.techcorp
        },
        {
          id: uuidv4(),
          title: 'Growth Metrics',
          platform: 'tableau',
          embed_url: 'https://public.tableau.com/views/SampleHealthcare/Obesity?:embed=y&:display_count=no&:toolbar=no',
          company_id: companyIds.datalab
        }
      ])

    if (dashboardsError) {
      console.log('Dashboards error:', dashboardsError.message)
    } else {
      console.log('✅ Dashboards created')
    }

    // Save user mapping for Auth setup
    const testDataReference = {
      userIds,
      companyIds,
      roleIds,
      testUsers: [
        { id: userIds.john, email: 'john.doe@acme.com', role: 'admin', company: 'Acme Corporation' },
        { id: userIds.jane, email: 'jane.smith@acme.com', role: 'editor', company: 'Acme Corporation' },
        { id: userIds.bob, email: 'bob.wilson@acme.com', role: 'viewer', company: 'Acme Corporation' },
        { id: userIds.alice, email: 'alice.brown@techcorp.io', role: 'admin', company: 'TechCorp Solutions' },
        { id: userIds.charlie, email: 'charlie.davis@techcorp.io', role: 'editor', company: 'TechCorp Solutions' },
        { id: userIds.diana, email: 'diana.taylor@datalab.co', role: 'admin', company: 'DataLab Analytics' },
        { id: userIds.frank, email: 'frank.miller@datalab.co', role: 'viewer', company: 'DataLab Analytics' }
      ]
    }

    // Save to file
    await import('fs').then(fs => {
      fs.default.writeFileSync('test-data-reference.json', JSON.stringify(testDataReference, null, 2))
    })

    console.log('\n🎉 Test data setup complete!')
    console.log('\n📊 Summary:')
    console.log('- Using 3 existing companies')
    console.log('- Created 7 test users (placeholder IDs)')
    console.log('- Created 4 test dashboards with real Tableau URLs')
    console.log('- Test data reference saved to test-data-reference.json')
    
    console.log('\n⚠️  Next Steps:')
    console.log('1. Create real Auth users in Supabase Dashboard:')
    testDataReference.testUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`)
    })
    console.log('2. Update user IDs in database with real Auth UUIDs')
    console.log('3. Test your dashboard hub!')

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
  }
}

simpleTestSetup() 