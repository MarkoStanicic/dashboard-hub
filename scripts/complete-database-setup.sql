-- Complete Dashboard Hub Test Data Setup
-- Run this script in Supabase SQL Editor

-- First, let's get the existing company IDs
DO $$
DECLARE
    acme_id uuid;
    techcorp_id uuid;
    datalab_id uuid;
BEGIN
    -- Get existing company IDs
    SELECT id INTO acme_id FROM companies WHERE name = 'Acme Corporation' LIMIT 1;
    SELECT id INTO techcorp_id FROM companies WHERE name = 'TechCorp Solutions' LIMIT 1;
    SELECT id INTO datalab_id FROM companies WHERE name = 'DataLab Analytics' LIMIT 1;

    -- If companies don't exist, create them
    IF acme_id IS NULL THEN
        INSERT INTO companies (id, name, created_at) 
        VALUES (gen_random_uuid(), 'Acme Corporation', NOW()) 
        RETURNING id INTO acme_id;
    END IF;
    
    IF techcorp_id IS NULL THEN
        INSERT INTO companies (id, name, created_at) 
        VALUES (gen_random_uuid(), 'TechCorp Solutions', NOW()) 
        RETURNING id INTO techcorp_id;
    END IF;
    
    IF datalab_id IS NULL THEN
        INSERT INTO companies (id, name, created_at) 
        VALUES (gen_random_uuid(), 'DataLab Analytics', NOW()) 
        RETURNING id INTO datalab_id;
    END IF;

    -- Create Auth users with specific UUIDs
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES 
    -- Acme Corporation Users
    ('00000000-0000-0000-0000-000000000000', '6262c8b9-a6d0-4b75-9157-65c3a8175b54', 'authenticated', 'authenticated', 'john.doe@acme.com', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), '', NOW(), '', NOW(), '', '', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, NOW(), NOW(), NULL, NULL, '', '', NOW(), '', 0, NOW(), '', NOW()),
    ('00000000-0000-0000-0000-000000000000', '2965912d-a139-4fcc-bf22-06100ae9aa5f', 'authenticated', 'authenticated', 'jane.smith@acme.com', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), '', NOW(), '', NOW(), '', '', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, NOW(), NOW(), NULL, NULL, '', '', NOW(), '', 0, NOW(), '', NOW()),
    ('00000000-0000-0000-0000-000000000000', '26eea5d1-28bc-42f8-b083-e635d179d9e9', 'authenticated', 'authenticated', 'bob.wilson@acme.com', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), '', NOW(), '', NOW(), '', '', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, NOW(), NOW(), NULL, NULL, '', '', NOW(), '', 0, NOW(), '', NOW()),
    -- TechCorp Users  
    ('00000000-0000-0000-0000-000000000000', 'b7888868-0a1d-434b-bcf7-833fda592142', 'authenticated', 'authenticated', 'alice.brown@techcorp.io', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), '', NOW(), '', NOW(), '', '', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, NOW(), NOW(), NULL, NULL, '', '', NOW(), '', 0, NOW(), '', NOW()),
    ('00000000-0000-0000-0000-000000000000', '27cf52b6-5690-440c-b225-a5e3cc9486ea', 'authenticated', 'authenticated', 'charlie.davis@techcorp.io', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), '', NOW(), '', NOW(), '', '', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, NOW(), NOW(), NULL, NULL, '', '', NOW(), '', 0, NOW(), '', NOW()),
    -- DataLab Users
    ('00000000-0000-0000-0000-000000000000', 'b9f2db65-ff4b-4bc4-9e13-c23fb588534c', 'authenticated', 'authenticated', 'diana.taylor@datalab.co', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), '', NOW(), '', NOW(), '', '', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, NOW(), NOW(), NULL, NULL, '', '', NOW(), '', 0, NOW(), '', NOW()),
    ('00000000-0000-0000-0000-000000000000', 'ff9cc3b2-9d49-4033-b9f2-30594ff94367', 'authenticated', 'authenticated', 'frank.miller@datalab.co', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), '', NOW(), '', NOW(), '', '', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, NOW(), NOW(), NULL, NULL, '', '', NOW(), '', 0, NOW(), '', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Create identities for each user
    INSERT INTO auth.identities (
        provider_id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at,
        email
    ) VALUES 
    ('6262c8b9-a6d0-4b75-9157-65c3a8175b54', '6262c8b9-a6d0-4b75-9157-65c3a8175b54', '{"sub":"6262c8b9-a6d0-4b75-9157-65c3a8175b54","email":"john.doe@acme.com"}', 'email', NOW(), NOW(), NOW(), 'john.doe@acme.com'),
    ('2965912d-a139-4fcc-bf22-06100ae9aa5f', '2965912d-a139-4fcc-bf22-06100ae9aa5f', '{"sub":"2965912d-a139-4fcc-bf22-06100ae9aa5f","email":"jane.smith@acme.com"}', 'email', NOW(), NOW(), NOW(), 'jane.smith@acme.com'),
    ('26eea5d1-28bc-42f8-b083-e635d179d9e9', '26eea5d1-28bc-42f8-b083-e635d179d9e9', '{"sub":"26eea5d1-28bc-42f8-b083-e635d179d9e9","email":"bob.wilson@acme.com"}', 'email', NOW(), NOW(), NOW(), 'bob.wilson@acme.com'),
    ('b7888868-0a1d-434b-bcf7-833fda592142', 'b7888868-0a1d-434b-bcf7-833fda592142', '{"sub":"b7888868-0a1d-434b-bcf7-833fda592142","email":"alice.brown@techcorp.io"}', 'email', NOW(), NOW(), NOW(), 'alice.brown@techcorp.io'),
    ('27cf52b6-5690-440c-b225-a5e3cc9486ea', '27cf52b6-5690-440c-b225-a5e3cc9486ea', '{"sub":"27cf52b6-5690-440c-b225-a5e3cc9486ea","email":"charlie.davis@techcorp.io"}', 'email', NOW(), NOW(), NOW(), 'charlie.davis@techcorp.io'),
    ('b9f2db65-ff4b-4bc4-9e13-c23fb588534c', 'b9f2db65-ff4b-4bc4-9e13-c23fb588534c', '{"sub":"b9f2db65-ff4b-4bc4-9e13-c23fb588534c","email":"diana.taylor@datalab.co"}', 'email', NOW(), NOW(), NOW(), 'diana.taylor@datalab.co'),
    ('ff9cc3b2-9d49-4033-b9f2-30594ff94367', 'ff9cc3b2-9d49-4033-b9f2-30594ff94367', '{"sub":"ff9cc3b2-9d49-4033-b9f2-30594ff94367","email":"frank.miller@datalab.co"}', 'email', NOW(), NOW(), NOW(), 'frank.miller@datalab.co')
    ON CONFLICT (provider_id, provider) DO NOTHING;

    -- Insert into public.users table (checking what columns exist)
    INSERT INTO users (id, company_id, is_super_admin, created_at)
    VALUES 
    ('6262c8b9-a6d0-4b75-9157-65c3a8175b54', acme_id, false, NOW()),
    ('2965912d-a139-4fcc-bf22-06100ae9aa5f', acme_id, false, NOW()),
    ('26eea5d1-28bc-42f8-b083-e635d179d9e9', acme_id, false, NOW()),
    ('b7888868-0a1d-434b-bcf7-833fda592142', techcorp_id, false, NOW()),
    ('27cf52b6-5690-440c-b225-a5e3cc9486ea', techcorp_id, false, NOW()),
    ('b9f2db65-ff4b-4bc4-9e13-c23fb588534c', datalab_id, false, NOW()),
    ('ff9cc3b2-9d49-4033-b9f2-30594ff94367', datalab_id, false, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Insert user roles
    INSERT INTO user_roles (user_id, company_id, role_id)
    VALUES 
    ('6262c8b9-a6d0-4b75-9157-65c3a8175b54', acme_id, 1), -- john = admin
    ('2965912d-a139-4fcc-bf22-06100ae9aa5f', acme_id, 2), -- jane = editor  
    ('26eea5d1-28bc-42f8-b083-e635d179d9e9', acme_id, 3), -- bob = viewer
    ('b7888868-0a1d-434b-bcf7-833fda592142', techcorp_id, 1), -- alice = admin
    ('27cf52b6-5690-440c-b225-a5e3cc9486ea', techcorp_id, 2), -- charlie = editor
    ('b9f2db65-ff4b-4bc4-9e13-c23fb588534c', datalab_id, 1), -- diana = admin
    ('ff9cc3b2-9d49-4033-b9f2-30594ff94367', datalab_id, 3) -- frank = viewer
    ON CONFLICT (user_id, company_id) DO NOTHING;

    -- Insert test dashboards
    INSERT INTO dashboards (id, company_id, title, type, embed_url, created_by, created_at)
    VALUES 
    (gen_random_uuid(), acme_id, 'Sales Performance Dashboard', 'tableau', 'https://public.tableau.com/views/SuperstoreSample/Overview?:embed=y&:display_count=no&:toolbar=no', '6262c8b9-a6d0-4b75-9157-65c3a8175b54', NOW()),
    (gen_random_uuid(), acme_id, 'Weekly Operations Report', 'powerbi', 'https://public.tableau.com/views/RegionalSampleWorkbook/Storms?:embed=y&:display_count=no&:toolbar=no', '2965912d-a139-4fcc-bf22-06100ae9aa5f', NOW()),
    (gen_random_uuid(), acme_id, 'Customer Analytics', 'tableau', 'https://public.tableau.com/views/WorldIndicators/GDPpercapita?:embed=y&:display_count=no&:toolbar=no', '6262c8b9-a6d0-4b75-9157-65c3a8175b54', NOW()),
    (gen_random_uuid(), techcorp_id, 'Financial Overview', 'powerbi', 'https://public.tableau.com/views/SampleHealthcare/Obesity?:embed=y&:display_count=no&:toolbar=no', 'b7888868-0a1d-434b-bcf7-833fda592142', NOW()),
    (gen_random_uuid(), techcorp_id, 'Marketing Campaign ROI', 'salesforce', 'https://public.tableau.com/views/SuperstoreSample/Performance?:embed=y&:display_count=no&:toolbar=no', '27cf52b6-5690-440c-b225-a5e3cc9486ea', NOW()),
    (gen_random_uuid(), datalab_id, 'Growth Metrics', 'tableau', 'https://public.tableau.com/views/COVID-19Cases_15840488375870/COVID-19Cases?:embed=y&:display_count=no&:toolbar=no', 'b9f2db65-ff4b-4bc4-9e13-c23fb588534c', NOW()),
    (gen_random_uuid(), datalab_id, 'Operations KPI Dashboard', 'powerbi', 'https://public.tableau.com/views/RegionalSampleWorkbook/College?:embed=y&:display_count=no&:toolbar=no', 'b9f2db65-ff4b-4bc4-9e13-c23fb588534c', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Success message
    RAISE NOTICE 'Dashboard Hub test data setup complete!';
    RAISE NOTICE 'Created 7 auth users with test data';
    RAISE NOTICE 'Test accounts (all with password TestPass123!):';
    RAISE NOTICE '  john.doe@acme.com (Admin - Acme)';
    RAISE NOTICE '  jane.smith@acme.com (Editor - Acme)'; 
    RAISE NOTICE '  bob.wilson@acme.com (Viewer - Acme)';
    RAISE NOTICE '  alice.brown@techcorp.io (Admin - TechCorp)';
    RAISE NOTICE '  charlie.davis@techcorp.io (Editor - TechCorp)';
    RAISE NOTICE '  diana.taylor@datalab.co (Admin - DataLab)';
    RAISE NOTICE '  frank.miller@datalab.co (Viewer - DataLab)';

END $$; 