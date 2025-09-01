import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('🔍 Checking database schema...')

  try {
    // Check roles table
    console.log('\n📋 Roles table:')
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .limit(1)

    if (rolesError) {
      console.log('Roles table structure:', rolesError.message)
    } else {
      console.log('Roles columns:', roles.length > 0 ? Object.keys(roles[0]) : 'Table exists but empty')
    }

    // Check companies table
    console.log('\n🏢 Companies table:')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)

    if (companiesError) {
      console.log('Companies table structure:', companiesError.message)
    } else {
      console.log('Companies columns:', companies.length > 0 ? Object.keys(companies[0]) : 'Table exists but empty')
    }

    // Check users table
    console.log('\n👥 Users table:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      console.log('Users table structure:', usersError.message)
    } else {
      console.log('Users columns:', users.length > 0 ? Object.keys(users[0]) : 'Table exists but empty')
    }

    // Check dashboards table
    console.log('\n📊 Dashboards table:')
    const { data: dashboards, error: dashboardsError } = await supabase
      .from('dashboards')
      .select('*')
      .limit(1)

    if (dashboardsError) {
      console.log('Dashboards table structure:', dashboardsError.message)
    } else {
      console.log('Dashboards columns:', dashboards.length > 0 ? Object.keys(dashboards[0]) : 'Table exists but empty')
    }

    // Check user_roles table
    console.log('\n🔐 User_roles table:')
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1)

    if (userRolesError) {
      console.log('User_roles table structure:', userRolesError.message)
    } else {
      console.log('User_roles columns:', userRoles.length > 0 ? Object.keys(userRoles[0]) : 'Table exists but empty')
    }

    // Check sections table
    console.log('\n📁 Sections table:')
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('*')
      .limit(1)

    if (sectionsError) {
      console.log('Sections table structure:', sectionsError.message)
    } else {
      console.log('Sections columns:', sections.length > 0 ? Object.keys(sections[0]) : 'Table exists but empty')
    }

    // Check insights table
    console.log('\n💡 Insights table:')
    const { data: insights, error: insightsError } = await supabase
      .from('insights')
      .select('*')
      .limit(1)

    if (insightsError) {
      console.log('Insights table structure:', insightsError.message)
    } else {
      console.log('Insights columns:', insights.length > 0 ? Object.keys(insights[0]) : 'Table exists but empty')
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error)
  }
}

checkSchema() 