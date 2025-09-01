-- Validate that the database schema is properly set up for the integration system
-- Run this to check if everything is configured correctly

-- Check integrations table structure
SELECT 
    'integrations' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'integrations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sections table structure  
SELECT 
    'sections' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sections' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check dashboards table for new columns
SELECT 
    'dashboards' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dashboards' 
AND table_schema = 'public'
AND column_name IN ('section_id', 'integration_id', 'external_id', 'description')
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name IN ('integrations', 'sections', 'dashboards')
ORDER BY table_name, constraint_type;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('integrations', 'sections', 'dashboards')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('integrations', 'sections', 'dashboards')
ORDER BY tablename, policyname;

-- Count records in each table
SELECT 
    'companies' as table_name,
    count(*) as record_count
FROM companies
UNION ALL
SELECT 
    'users' as table_name,
    count(*) as record_count  
FROM users
UNION ALL
SELECT 
    'integrations' as table_name,
    count(*) as record_count
FROM integrations
UNION ALL
SELECT 
    'sections' as table_name,
    count(*) as record_count
FROM sections
UNION ALL
SELECT 
    'dashboards' as table_name,
    count(*) as record_count
FROM dashboards;

-- Success message
SELECT '✅ Schema validation complete! Check the results above.' as validation_result;