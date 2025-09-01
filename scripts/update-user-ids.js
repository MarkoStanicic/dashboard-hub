import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Map of placeholder IDs to real Auth UUIDs
// Update these with the actual UUIDs from your Supabase Auth dashboard
const userIdMap = {
  'user-1-john': 'PASTE_REAL_UUID_HERE',      // john.doe@acme.com (Admin)
  'user-2-jane': 'PASTE_REAL_UUID_HERE',      // jane.smith@acme.com (Editor) 
  'user-3-bob': 'PASTE_REAL_UUID_HERE',       // bob.wilson@acme.com (Viewer)
  'user-4-alice': 'PASTE_REAL_UUID_HERE',     // alice.brown@techcorp.io (Admin)
  'user-5-charlie': 'PASTE_REAL_UUID_HERE',   // charlie.davis@techcorp.io (Editor)
  'user-6-diana': 'PASTE_REAL_UUID_HERE',     // diana.taylor@datalab.co (Admin)
  'user-7-frank': 'PASTE_REAL_UUID_HERE'      // frank.miller@datalab.co (Viewer)
}

async function updateUserIds() {
  console.log('🔄 Updating placeholder user IDs with real Auth UUIDs...')

  try {
    for (const [placeholderId, realUuid] of Object.entries(userIdMap)) {
      if (realUuid === 'PASTE_REAL_UUID_HERE') {
        console.log(`⚠️  Skipping ${placeholderId} - please update with real UUID`)
        continue
      }

      console.log(`🔄 Updating ${placeholderId} → ${realUuid}`)

      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({ id: realUuid })
        .eq('id', placeholderId)

      if (userError) {
        console.error(`❌ Error updating user ${placeholderId}:`, userError)
        continue
      }

      // Update user_roles table
      const { error: rolesError } = await supabase
        .from('user_roles')
        .update({ user_id: realUuid })
        .eq('user_id', placeholderId)

      if (rolesError) {
        console.error(`❌ Error updating user_roles for ${placeholderId}:`, rolesError)
        continue
      }

      // Update insights table
      const { error: insightsError } = await supabase
        .from('insights')
        .update({ created_by: realUuid })
        .eq('created_by', placeholderId)

      if (insightsError) {
        console.error(`❌ Error updating insights for ${placeholderId}:`, insightsError)
        continue
      }

      console.log(`✅ Successfully updated ${placeholderId}`)
    }

    console.log('\n🎉 User ID update complete!')
    console.log('You can now test login with the created Auth users.')

  } catch (error) {
    console.error('❌ Error updating user IDs:', error)
    process.exit(1)
  }
}

updateUserIds() 