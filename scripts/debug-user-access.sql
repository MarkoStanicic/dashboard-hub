-- Debug User Access Issues
-- Run this in Supabase SQL Editor to check and fix your user data

DO $$
DECLARE
    current_auth_user_id uuid;
    acme_company_id uuid;
    techcorp_company_id uuid;
    datalab_company_id uuid;
    admin_role_id int;
    user_company_id uuid;
    user_is_super_admin boolean;
BEGIN
    -- Get the current authenticated user ID (this should be YOUR user ID)
    SELECT auth.uid() INTO current_auth_user_id;
    
    -- Get company IDs
    SELECT id INTO acme_company_id FROM companies WHERE name = 'Acme Corporation' LIMIT 1;
    SELECT id INTO techcorp_company_id FROM companies WHERE name = 'TechCorp Solutions' LIMIT 1;
    SELECT id INTO datalab_company_id FROM companies WHERE name = 'DataLab Analytics' LIMIT 1;
    
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
    
    RAISE NOTICE '🔍 Debug Information:';
    RAISE NOTICE 'Current Auth User ID: %', current_auth_user_id;
    RAISE NOTICE 'Acme Company ID: %', acme_company_id;
    RAISE NOTICE 'TechCorp Company ID: %', techcorp_company_id;
    RAISE NOTICE 'DataLab Company ID: %', datalab_company_id;
    RAISE NOTICE 'Admin Role ID: %', admin_role_id;
    
    -- Check if user exists in users table
    IF EXISTS (SELECT 1 FROM users WHERE id = current_auth_user_id) THEN
        RAISE NOTICE '✅ User exists in users table';
        
        -- Get current user data
        SELECT company_id, is_super_admin INTO user_company_id, user_is_super_admin 
        FROM users WHERE id = current_auth_user_id LIMIT 1;
        
        RAISE NOTICE 'Current user data:';
        RAISE NOTICE '  Company ID: %', user_company_id;
        RAISE NOTICE '  Is Super Admin: %', user_is_super_admin;
        
        -- Update user to be super admin with first company
        UPDATE users 
        SET 
            company_id = acme_company_id,
            is_super_admin = true
        WHERE id = current_auth_user_id;
        
        RAISE NOTICE '✅ Updated user to be super admin of Acme Corporation';
        
    ELSE
        RAISE NOTICE '❌ User does not exist in users table, creating...';
        
        -- Create user record
        INSERT INTO users (id, company_id, is_super_admin, created_at)
        VALUES (current_auth_user_id, acme_company_id, true, NOW());
        
        RAISE NOTICE '✅ Created user record as super admin of Acme Corporation';
    END IF;
    
    -- Check/create user role
    IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = current_auth_user_id) THEN
        RAISE NOTICE '✅ User role exists';
    ELSE
        RAISE NOTICE '❌ User role missing, creating...';
        
        -- Create admin role for user
        INSERT INTO user_roles (user_id, company_id, role_id)
        VALUES (current_auth_user_id, acme_company_id, admin_role_id)
        ON CONFLICT (user_id, company_id) DO NOTHING;
        
        RAISE NOTICE '✅ Created admin role for user';
    END IF;
    
    -- Final verification
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Setup Complete! Your user now has:';
    RAISE NOTICE '  - Super Admin access';
    RAISE NOTICE '  - Admin role in Acme Corporation';
    RAISE NOTICE '  - Access to all company dashboards';
    RAISE NOTICE '  - Full navigation with profile dropdown';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Now refresh your browser at http://localhost:3000/dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '🧭 Your new navigation includes:';
    RAISE NOTICE '  - Dashboard Hub logo (click to go to dashboards)';
    RAISE NOTICE '  - Dashboards, Company, Admin navigation links';
    RAISE NOTICE '  - Profile dropdown with your email and role badge';
    RAISE NOTICE '  - Sign Out option in the dropdown';

END $$; 