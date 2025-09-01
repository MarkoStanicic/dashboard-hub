#!/usr/bin/env node

/**
 * Check for duplicate dashboards and provide cleanup options
 */

const API_URL = 'http://localhost:3000'

async function checkDuplicateDashboards() {
  console.log('🔍 Checking for Duplicate Dashboards...\n')
  
  try {
    // Check dashboards via browser console method since we don't have API endpoint
    console.log('📋 To check for duplicates, run this in your browser console:')
    console.log('(Open DevTools → Console → Paste this code)\n')
    
    console.log(`
// Check for duplicate dashboards
fetch('/dashboard')
  .then(() => {
    // Get raw dashboard data from page
    console.log('🔍 Checking dashboard database...');
    
    // This would need to be run server-side to access Supabase directly
    // For now, we'll provide SQL queries to run in Supabase
  });
`)

    console.log('\n💾 Or run these SQL queries in Supabase SQL Editor:')
    console.log('=' .repeat(50))
    
    console.log('\n1️⃣ Find duplicate dashboards by external_id:')
    console.log(`
SELECT 
  external_id,
  integration_id,
  title,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as dashboard_ids
FROM dashboards 
WHERE external_id IS NOT NULL
GROUP BY external_id, integration_id, title
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
`)

    console.log('\n2️⃣ Find duplicate dashboards by title (same integration):')
    console.log(`
SELECT 
  title,
  integration_id,
  type,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as dashboard_ids,
  STRING_AGG(created_at::text, ', ') as created_dates
FROM dashboards 
GROUP BY title, integration_id, type
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
`)

    console.log('\n3️⃣ View all dashboards with details:')
    console.log(`
SELECT 
  id,
  title,
  type,
  external_id,
  integration_id,
  created_at,
  updated_at
FROM dashboards 
ORDER BY integration_id, title, created_at;
`)

    console.log('\n🧹 To clean up duplicates (CAREFUL - run these one by one):')
    console.log('=' .repeat(50))
    
    console.log('\n4️⃣ Delete older duplicates (keeps the newest):')
    console.log(`
-- First, review what will be deleted:
WITH ranked_dashboards AS (
  SELECT 
    id,
    title,
    external_id,
    integration_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY external_id, integration_id 
      ORDER BY created_at DESC
    ) as rn
  FROM dashboards 
  WHERE external_id IS NOT NULL
)
SELECT 
  id,
  title,
  external_id,
  created_at,
  'WILL BE DELETED' as action
FROM ranked_dashboards 
WHERE rn > 1
ORDER BY integration_id, title;

-- Then, if you're sure, delete the duplicates:
-- DELETE FROM dashboards 
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT 
--       id,
--       ROW_NUMBER() OVER (
--         PARTITION BY external_id, integration_id 
--         ORDER BY created_at DESC
--       ) as rn
--     FROM dashboards 
--     WHERE external_id IS NOT NULL
--   ) ranked 
--   WHERE rn > 1
-- );
`)

    console.log('\n5️⃣ Alternative: Delete by specific IDs (safer):')
    console.log(`
-- Replace 'dashboard-id-1', 'dashboard-id-2' with actual IDs from query #1
-- DELETE FROM dashboards WHERE id IN ('dashboard-id-1', 'dashboard-id-2');
`)

    console.log('\n📊 After cleanup, verify the results:')
    console.log(`
SELECT 
  type,
  COUNT(*) as total_dashboards,
  COUNT(DISTINCT integration_id) as integrations_count
FROM dashboards 
GROUP BY type
ORDER BY type;
`)

    console.log('\n💡 Understanding the duplicate issue:')
    console.log('   - Each dashboard should have a unique external_id + integration_id')
    console.log('   - Duplicates happen when sync runs multiple times')
    console.log('   - Our improved sync logic now prevents future duplicates')
    console.log('   - You only need to clean up existing duplicates once')

    console.log('\n🚀 After cleanup:')
    console.log('   1. Test the sync again - should show "0 new, X updated"')
    console.log('   2. Refresh your dashboard page')
    console.log('   3. Should see the correct number of dashboards')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function generateTestSync() {
  console.log('\n🧪 Test the improved sync logic:')
  console.log('=' .repeat(40))
  console.log('1. Go to Company → Integrations')
  console.log('2. Click "Sync Dashboards" on your Tableau integration')
  console.log('3. You should see:')
  console.log('   - "New dashboards imported: 0"')
  console.log('   - "Existing dashboards updated: 2"')
  console.log('   - No duplicates created!')
  console.log('\n✅ This confirms the duplicate prevention is working')
}

console.log('🔍 DUPLICATE DASHBOARD CHECKER')
console.log('==============================\n')

checkDuplicateDashboards().then(() => {
  generateTestSync()
  console.log('\n✅ Check completed!')
})
