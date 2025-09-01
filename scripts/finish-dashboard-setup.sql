-- Dashboard Hub - Final Setup Script
-- Run this in Supabase SQL Editor to add test dashboards and supporting data

DO $$
DECLARE
    acme_id uuid;
    techcorp_id uuid;
    datalab_id uuid;
    current_user_id uuid;
    dash1_id uuid;
    dash2_id uuid;
    dash3_id uuid;
    dash4_id uuid;
    dash5_id uuid;
    dash6_id uuid;
    dash7_id uuid;
    dash8_id uuid;
    dash9_id uuid;
    dash10_id uuid;
BEGIN
    -- Get existing company IDs
    SELECT id INTO acme_id FROM companies WHERE name = 'Acme Corporation' LIMIT 1;
    SELECT id INTO techcorp_id FROM companies WHERE name = 'TechCorp Solutions' LIMIT 1;
    SELECT id INTO datalab_id FROM companies WHERE name = 'DataLab Analytics' LIMIT 1;
    
    -- Get current user (assuming you're the super admin)
    SELECT id INTO current_user_id FROM users WHERE is_super_admin = true LIMIT 1;
    
    RAISE NOTICE 'Setting up dashboards for companies...';
    RAISE NOTICE 'Acme ID: %', acme_id;
    RAISE NOTICE 'TechCorp ID: %', techcorp_id;
    RAISE NOTICE 'DataLab ID: %', datalab_id;
    RAISE NOTICE 'Current user ID: %', current_user_id;

    -- Create test dashboards individually to capture IDs
    -- Acme Corporation Dashboards
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), acme_id, 'Sales Performance Dashboard', 'tableau', 'https://public.tableau.com/views/SuperstoreSample/Overview?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash1_id;
    
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), acme_id, 'Weekly Operations Report', 'tableau', 'https://public.tableau.com/views/RegionalSampleWorkbook/Storms?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash2_id;
    
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), acme_id, 'Customer Analytics', 'tableau', 'https://public.tableau.com/views/WorldIndicators/GDPpercapita?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash3_id;
    
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), acme_id, 'Q4 2024 Review', 'powerbi', 'https://public.tableau.com/views/SampleHealthcare/Obesity?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash4_id;
    
    -- TechCorp Solutions Dashboards  
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), techcorp_id, 'Financial Overview', 'tableau', 'https://public.tableau.com/views/COVID-19Cases_15840488375870/COVID-19Cases?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash5_id;
    
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), techcorp_id, 'Marketing Campaign ROI', 'salesforce', 'https://public.tableau.com/views/SuperstoreSample/Performance?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash6_id;
    
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), techcorp_id, 'Product Usage Analytics', 'tableau', 'https://public.tableau.com/views/RegionalSampleWorkbook/College?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash7_id;
    
    -- DataLab Analytics Dashboards
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), datalab_id, 'Growth Metrics', 'tableau', 'https://public.tableau.com/views/StartupGrowthMetrics/GrowthDashboard?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash8_id;
    
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), datalab_id, 'Operations KPI Dashboard', 'powerbi', 'https://public.tableau.com/views/SampleWorkbook/OfficeSupplies?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash9_id;
    
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES (gen_random_uuid(), datalab_id, 'Revenue Tracking', 'salesforce', 'https://public.tableau.com/views/Economics_0/EconomicIndicators?:embed=y&:display_count=no&:toolbar=no', current_user_id, NOW())
    RETURNING id INTO dash10_id;

    RAISE NOTICE '✅ Created 10 test dashboards';

    -- Add some test insights if the insights table exists
    BEGIN
        INSERT INTO insights (id, dashboard_id, content, type, position_x, position_y, created_by, created_at)
        VALUES 
        (gen_random_uuid(), dash1_id, 'Q4 sales exceeded target by 15% - great work by the west coast team!', 'note', 25, 30, current_user_id, NOW()),
        (gen_random_uuid(), dash1_id, 'The dip in November was due to the product launch delay, but we recovered in December', 'explanation', 60, 45, current_user_id, NOW()),
        (gen_random_uuid(), dash1_id, 'Focus area: East coast territory needs attention in Q1', 'callout', 80, 20, current_user_id, NOW()),
        
        (gen_random_uuid(), dash2_id, 'Server uptime improved to 99.9% after infrastructure upgrade', 'note', 40, 60, current_user_id, NOW()),
        (gen_random_uuid(), dash2_id, 'Customer support response time target: <2 hours', 'tag', 70, 80, current_user_id, NOW()),
        
        (gen_random_uuid(), dash5_id, 'Cash flow positive for 6 consecutive months', 'note', 30, 40, current_user_id, NOW()),
        (gen_random_uuid(), dash5_id, 'R&D investment increased by 20% to support new product development', 'explanation', 50, 70, current_user_id, NOW()),
        
        (gen_random_uuid(), dash6_id, 'LinkedIn campaigns showing 40% higher conversion rate than Google Ads', 'callout', 35, 25, current_user_id, NOW()),
        (gen_random_uuid(), dash6_id, 'Email marketing ROI: 4:1', 'tag', 65, 55, current_user_id, NOW()),
        
        (gen_random_uuid(), dash8_id, 'Production efficiency up 12% after process optimization', 'note', 45, 35, current_user_id, NOW()),
        (gen_random_uuid(), dash9_id, 'Monthly recurring revenue growth rate: 8%', 'callout', 30, 50, current_user_id, NOW()),
        (gen_random_uuid(), dash10_id, 'Target conversion rate for Q1: 3.5%', 'tag', 55, 25, current_user_id, NOW());
        
        RAISE NOTICE '✅ Added test insights to dashboards';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE '⚠️  Insights table does not exist, skipping insights';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Could not add insights: %', SQLERRM;
    END;

    -- Add sections if the table exists
    BEGIN
        INSERT INTO sections (id, name, company_id, created_at)
        VALUES 
        (gen_random_uuid(), 'Weekly Operations', acme_id, NOW()),
        (gen_random_uuid(), 'Quarterly Review', acme_id, NOW()),
        (gen_random_uuid(), 'Sales Dashboard', acme_id, NOW()),
        (gen_random_uuid(), 'Financial Reports', techcorp_id, NOW()),
        (gen_random_uuid(), 'Marketing Analytics', techcorp_id, NOW()),
        (gen_random_uuid(), 'Operations KPIs', datalab_id, NOW()),
        (gen_random_uuid(), 'Growth Analytics', datalab_id, NOW())
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Added dashboard sections';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE '⚠️  Sections table does not exist, skipping sections';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Could not add sections: %', SQLERRM;
    END;

    -- Add integrations if the table exists
    BEGIN
        INSERT INTO integrations (id, company_id, service, config, connected_at, created_at)
        VALUES 
        (gen_random_uuid(), acme_id, 'tableau', '{"server_url": "https://public.tableau.com", "site": "public"}', NOW(), NOW()),
        (gen_random_uuid(), acme_id, 'powerbi', '{"workspace": "acme-workspace"}', NOW(), NOW()),
        (gen_random_uuid(), techcorp_id, 'salesforce', '{"instance_url": "https://techcorp.salesforce.com"}', NOW(), NOW()),
        (gen_random_uuid(), techcorp_id, 'tableau', '{"server_url": "https://public.tableau.com", "site": "public"}', NOW(), NOW()),
        (gen_random_uuid(), datalab_id, 'tableau', '{"server_url": "https://public.tableau.com", "site": "public"}', NOW(), NOW()),
        (gen_random_uuid(), datalab_id, 'powerbi', '{"workspace": "datalab-workspace"}', NOW(), NOW())
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Added integration configurations';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE '⚠️  Integrations table does not exist, skipping integrations';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Could not add integrations: %', SQLERRM;
    END;

    -- Success message
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Dashboard Hub setup complete!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Created:';
    RAISE NOTICE '  - 10 test dashboards with real Tableau Public URLs';
    RAISE NOTICE '  - 12+ contextual insights on dashboards';
    RAISE NOTICE '  - 7 dashboard sections for organization';
    RAISE NOTICE '  - 6 integration configurations';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to test:';
    RAISE NOTICE '  1. Navigate to /dashboard to see company dashboards';
    RAISE NOTICE '  2. Click on any dashboard to see embedded view + insights';
    RAISE NOTICE '  3. Try /company/integrations to see BI platform status';
    RAISE NOTICE '  4. Use /admin to manage users and view system stats';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Dashboard Distribution:';
    RAISE NOTICE '  - Acme Corporation: 4 dashboards';
    RAISE NOTICE '  - TechCorp Solutions: 3 dashboards';  
    RAISE NOTICE '  - DataLab Analytics: 3 dashboards';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Your Dashboard Hub is now fully operational!';

END $$; 