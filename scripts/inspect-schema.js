import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectSchema() {
  console.log('🔍 Detailed Schema Inspection...')

  try {
    // Get all table names
    const { data: tables } = await supabase
      .rpc('sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      })

    console.log('\n📋 Available Tables:', tables?.map(t => t.table_name))

    // Check each table's columns
    for (const table of ['roles', 'companies', 'users', 'dashboards', 'user_roles', 'insights']) {
      console.log(`\n🔍 ${table.toUpperCase()} table structure:`)
      
      const { data: columns } = await supabase
        .rpc('sql', {
          query: `
            SELECT 
              column_name, 
              data_type, 
              is_nullable,
              column_default
            FROM information_schema.columns 
            WHERE table_name = '${table}' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
          `
        })

      if (columns && columns.length > 0) {
        columns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'nullable'} ${col.column_default ? `default: ${col.column_default}` : ''}`)
        })
      } else {
        console.log(`  Table '${table}' does not exist`)
      }
    }

    // Check if we can see any existing data
    console.log('\n📊 Existing Data:')
    
    // Check roles
    const { data: existingRoles } = await supabase.from('roles').select('*').limit(3)
    console.log('Roles:', existingRoles)

    // Check companies  
    const { data: existingCompanies } = await supabase.from('companies').select('*').limit(3)
    console.log('Companies:', existingCompanies)

    // Check users
    const { data: existingUsers } = await supabase.from('users').select('*').limit(3)
    console.log('Users:', existingUsers)

  } catch (error) {
    console.error('❌ Error inspecting schema:', error)
  }
}

inspectSchema() 