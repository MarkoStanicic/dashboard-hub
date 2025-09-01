import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY (add this to .env.local)')
  console.error('\nCurrent values:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Found' : '❌ Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Generate consistent UUIDs for test data
const roleIds = {
  viewer: uuidv4(),
  editor: uuidv4(),
  admin: uuidv4()
}

const companyIds = {
  acme: uuidv4(),
  techcorp: uuidv4(),
  datalab: uuidv4()
}

const sectionIds = {
  weekly: uuidv4(),
  quarterly: uuidv4(),
  sales: uuidv4(),
  finance: uuidv4(),
  marketing: uuidv4(),
  operations: uuidv4()
}

const userIds = {
  john: uuidv4(),
  jane: uuidv4(),
  bob: uuidv4(),
  alice: uuidv4(),
  charlie: uuidv4(),
  diana: uuidv4(),
  frank: uuidv4()
}

async function setupTestData() {
  console.log('🚀 Setting up test data...')

  try {
    // Step 1: Create roles
    console.log('📋 Creating roles...')
    const { error: rolesError } = await supabase
      .from('roles')
      .upsert([
        { id: roleIds.viewer, name: 'viewer' },
        { id: roleIds.editor, name: 'editor' },
        { id: roleIds.admin, name: 'admin' }
      ])

    if (rolesError) {
      console.log('Roles might already exist:', rolesError.message)
    } else {
      console.log('✅ Roles created')
    }

    // Step 2: Create companies
    console.log('🏢 Creating test companies...')
    const { error: companiesError } = await supabase
      .from('companies')
      .upsert([
        { id: companyIds.acme, name: 'Acme Corporation' },
        { id: companyIds.techcorp, name: 'TechCorp Solutions' },
        { id: companyIds.datalab, name: 'DataLab Analytics' }
      ])

    if (companiesError) {
      console.error('Error creating companies:', companiesError)
      throw companiesError
    }
    console.log('✅ Companies created')

    // Step 3: Create sections (if table exists, otherwise skip)
    console.log('📁 Creating dashboard sections...')
    const { error: sectionsError } = await supabase
      .from('sections')
      .upsert([
        { id: sectionIds.weekly, name: 'Weekly Operations', company_id: companyIds.acme },
        { id: sectionIds.quarterly, name: 'Quarterly Review', company_id: companyIds.acme },
        { id: sectionIds.sales, name: 'Sales Dashboard', company_id: companyIds.acme },
        { id: sectionIds.finance, name: 'Financial Reports', company_id: companyIds.techcorp },
        { id: sectionIds.marketing, name: 'Marketing Analytics', company_id: companyIds.techcorp },
        { id: sectionIds.operations, name: 'Operations KPIs', company_id: companyIds.datalab }
      ])

    if (sectionsError) {
      console.log('⚠️  Sections table might not exist, skipping sections:', sectionsError.message)
    } else {
      console.log('✅ Sections created')
    }

    // Step 4: Create placeholder users
    console.log('👥 Creating placeholder users...')
    const { error: usersError } = await supabase
      .from('users')
      .upsert([
        { id: userIds.john, email: 'john.doe@acme.com', company_id: companyIds.acme, is_super_admin: false },
        { id: userIds.jane, email: 'jane.smith@acme.com', company_id: companyIds.acme, is_super_admin: false },
        { id: userIds.bob, email: 'bob.wilson@acme.com', company_id: companyIds.acme, is_super_admin: false },
        { id: userIds.alice, email: 'alice.brown@techcorp.io', company_id: companyIds.techcorp, is_super_admin: false },
        { id: userIds.charlie, email: 'charlie.davis@techcorp.io', company_id: companyIds.techcorp, is_super_admin: false },
        { id: userIds.diana, email: 'diana.taylor@datalab.co', company_id: companyIds.datalab, is_super_admin: false },
        { id: userIds.frank, email: 'frank.miller@datalab.co', company_id: companyIds.datalab, is_super_admin: false }
      ])

    if (usersError) {
      console.log('Users might already exist:', usersError.message)
    } else {
      console.log('✅ Placeholder users created')
    }

    // Step 5: Create user roles
    console.log('🔐 Assigning user roles...')
    const { error: userRolesError } = await supabase
      .from('user_roles')
      .upsert([
        { id: uuidv4(), user_id: userIds.john, company_id: companyIds.acme, role_id: roleIds.admin },
        { id: uuidv4(), user_id: userIds.jane, company_id: companyIds.acme, role_id: roleIds.editor },
        { id: uuidv4(), user_id: userIds.bob, company_id: companyIds.acme, role_id: roleIds.viewer },
        { id: uuidv4(), user_id: userIds.alice, company_id: companyIds.techcorp, role_id: roleIds.admin },
        { id: uuidv4(), user_id: userIds.charlie, company_id: companyIds.techcorp, role_id: roleIds.editor },
        { id: uuidv4(), user_id: userIds.diana, company_id: companyIds.datalab, role_id: roleIds.admin },
        { id: uuidv4(), user_id: userIds.frank, company_id: companyIds.datalab, role_id: roleIds.viewer }
      ])

    if (userRolesError) {
      console.log('User roles might already exist:', userRolesError.message)
    } else {
      console.log('✅ User roles assigned')
    }

    // Step 6: Create test dashboards
    console.log('📊 Creating test dashboards...')
    const dashboards = [
      {
        id: uuidv4(),
        title: 'Sales Performance Dashboard',
        description: 'Monthly sales metrics and KPIs',
        platform: 'tableau',
        embed_url: 'https://public.tableau.com/views/SuperstoreSample/Overview?:embed=y&:display_count=no&:toolbar=no',
        company_id: companyIds.acme,
        section_id: sectionsError ? null : sectionIds.sales
      },
      {
        id: uuidv4(),
        title: 'Weekly Operations Report',
        description: 'Operational metrics updated weekly',
        platform: 'powerbi',
        embed_url: 'https://app.powerbi.com/view?r=eyJrIjoiYWJjZGVmZ2giLCJ0IjoiMTIzNDUifQ%3D%3D',
        company_id: companyIds.acme,
        section_id: sectionsError ? null : sectionIds.weekly
      },
      {
        id: uuidv4(),
        title: 'Q4 2024 Review',
        description: 'Comprehensive quarterly business review',
        platform: 'salesforce',
        embed_url: 'https://salesforce.com/analytics/dashboard/quarterly-review',
        company_id: companyIds.acme,
        section_id: sectionsError ? null : sectionIds.quarterly
      },
      {
        id: uuidv4(),
        title: 'Customer Analytics',
        description: 'Customer behavior and satisfaction metrics',
        platform: 'tableau',
        embed_url: 'https://public.tableau.com/views/RegionalSampleWorkbook/Storms?:embed=y&:display_count=no&:toolbar=no',
        company_id: companyIds.acme,
        section_id: sectionsError ? null : sectionIds.sales
      },
      {
        id: uuidv4(),
        title: 'Financial Overview',
        description: 'Monthly financial reports and cash flow',
        platform: 'powerbi',
        embed_url: 'https://app.powerbi.com/view?r=eyJrIjoiZmluYW5jZSIsInQiOiIxMjM0NSJ9',
        company_id: companyIds.techcorp,
        section_id: sectionsError ? null : sectionIds.finance
      },
      {
        id: uuidv4(),
        title: 'Marketing Campaign ROI',
        description: 'Campaign performance and lead generation',
        platform: 'salesforce',
        embed_url: 'https://salesforce.com/analytics/dashboard/marketing-roi',
        company_id: companyIds.techcorp,
        section_id: sectionsError ? null : sectionIds.marketing
      },
      {
        id: uuidv4(),
        title: 'Product Usage Analytics',
        description: 'User engagement and feature adoption',
        platform: 'tableau',
        embed_url: 'https://public.tableau.com/views/WorldIndicators/GDPpercapita?:embed=y&:display_count=no&:toolbar=no',
        company_id: companyIds.techcorp,
        section_id: sectionsError ? null : sectionIds.marketing
      },
      {
        id: uuidv4(),
        title: 'Operations KPI Dashboard',
        description: 'Real-time operational metrics',
        platform: 'powerbi',
        embed_url: 'https://app.powerbi.com/view?r=eyJrIjoib3BlcmF0aW9ucyIsInQiOiIxMjM0NSJ9',
        company_id: companyIds.datalab,
        section_id: sectionsError ? null : sectionIds.operations
      },
      {
        id: uuidv4(),
        title: 'Growth Metrics',
        description: 'User acquisition and retention analytics',
        platform: 'tableau',
        embed_url: 'https://public.tableau.com/views/SampleHealthcare/Obesity?:embed=y&:display_count=no&:toolbar=no',
        company_id: companyIds.datalab,
        section_id: sectionsError ? null : sectionIds.operations
      },
      {
        id: uuidv4(),
        title: 'Revenue Dashboard',
        description: 'Revenue tracking and forecasting',
        platform: 'salesforce',
        embed_url: 'https://salesforce.com/analytics/dashboard/revenue-tracking',
        company_id: companyIds.datalab,
        section_id: null
      }
    ]

    const { error: dashboardsError } = await supabase
      .from('dashboards')
      .upsert(dashboards)

    if (dashboardsError) {
      console.error('Error creating dashboards:', dashboardsError)
      throw dashboardsError
    }
    console.log('✅ Dashboards created')

    // Step 7: Create test insights
    console.log('💡 Creating test insights...')
    const insights = [
      {
        id: uuidv4(),
        dashboard_id: dashboards[0].id,
        content: 'Q4 sales exceeded target by 15% - great work by the west coast team!',
        type: 'note',
        position_x: 25,
        position_y: 30,
        created_by: userIds.john
      },
      {
        id: uuidv4(),
        dashboard_id: dashboards[0].id,
        content: 'The dip in November was due to the product launch delay, but we recovered in December',
        type: 'explanation',
        position_x: 60,
        position_y: 45,
        created_by: userIds.jane
      },
      {
        id: uuidv4(),
        dashboard_id: dashboards[0].id,
        content: 'Focus area: East coast territory needs attention in Q1',
        type: 'callout',
        position_x: 80,
        position_y: 20,
        created_by: userIds.john
      },
      {
        id: uuidv4(),
        dashboard_id: dashboards[1].id,
        content: 'Server uptime improved to 99.9% after infrastructure upgrade',
        type: 'note',
        position_x: 40,
        position_y: 60,
        created_by: userIds.jane
      },
      {
        id: uuidv4(),
        dashboard_id: dashboards[1].id,
        content: 'Customer support response time target: <2 hours',
        type: 'tag',
        position_x: 70,
        position_y: 80,
        created_by: userIds.bob
      },
      {
        id: uuidv4(),
        dashboard_id: dashboards[4].id,
        content: 'Cash flow positive for 6 consecutive months',
        type: 'note',
        position_x: 30,
        position_y: 40,
        created_by: userIds.alice
      },
      {
        id: uuidv4(),
        dashboard_id: dashboards[4].id,
        content: 'R&D investment increased by 20% to support new product development',
        type: 'explanation',
        position_x: 50,
        position_y: 70,
        created_by: userIds.charlie
      },
      {
        id: uuidv4(),
        dashboard_id: dashboards[5].id,
        content: 'LinkedIn campaigns showing 40% higher conversion rate than Google Ads',
        type: 'callout',
        position_x: 35,
        position_y: 25,
        created_by: userIds.charlie
      },
      {
        id: uuidv4(),
        dashboard_id: dashboards[5].id,
        content: 'Email marketing ROI: 4:1',
        type: 'tag',
        position_x: 65,
        position_y: 55,
        created_by: userIds.alice
      },
      {
        id: uuidv4(),
        dashboard_id: dashboards[7].id,
        content: 'Production efficiency up 12% after process optimization',
        type: 'note',
        position_x: 45,
        position_y: 35,
        created_by: userIds.diana
      }
    ]

    const { error: insightsError } = await supabase
      .from('insights')
      .upsert(insights)

    if (insightsError) {
      console.log('Insights might already exist:', insightsError.message)
    } else {
      console.log('✅ Insights created')
    }

    // Step 8: Show summary and save IDs for reference
    console.log('\n🎉 Test data setup complete!')
    
    // Save important IDs to a file for reference
    const testDataReference = {
      companyIds,
      userIds,
      roleIds,
      sectionIds: sectionsError ? {} : sectionIds,
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

    fs.writeFileSync('test-data-reference.json', JSON.stringify(testDataReference, null, 2))
    
    console.log('\n📊 Summary:')
    console.log('- 3 test companies created')
    console.log('- 7 test users created (placeholder IDs)')
    console.log('- 10 test dashboards created with real Tableau Public URLs')
    console.log('- 10+ test insights created')
    if (!sectionsError) {
      console.log('- 6 dashboard sections created')
    }
    console.log('- Test data reference saved to test-data-reference.json')
    
    console.log('\n⚠️  Next Steps:')
    console.log('1. Create real Auth users in Supabase Dashboard using the emails above')
    console.log('2. Update placeholder user IDs in the database with real Auth UUIDs')
    console.log('3. Test login with different user roles!')

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
    process.exit(1)
  }
}

setupTestData() 