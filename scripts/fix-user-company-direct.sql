-- Fix User Company Assignment (Direct Method)
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from the users table

DO $$
DECLARE
    target_user_id uuid := 'eec337dc-4da9-47fe-9746-1bb9b1a4a197'; -- Your user ID from the screenshot
    acme_company_id uuid;
    admin_role_id int;
BEGIN
    -- Get Acme company ID
    SELECT id INTO acme_company_id FROM companies WHERE name = 'Acme Corporation' LIMIT 1;
    
    -- Get admin role ID  
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
    
    -- If admin role doesn't exist, try to find any role
    IF admin_role_id IS NULL THEN
        SELECT id INTO admin_role_id FROM roles LIMIT 1;
    END IF;
    
    RAISE NOTICE 'Target User ID: %', target_user_id;
    RAISE NOTICE 'Acme Company ID: %', acme_company_id;
    RAISE NOTICE 'Admin Role ID: %', admin_role_id;
    
    -- Check if user already exists in users table
    IF EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
        RAISE NOTICE 'User exists, updating...';
        
        -- Update existing user
        UPDATE users 
        SET 
            company_id = acme_company_id,
            is_super_admin = true
        WHERE id = target_user_id;
        
        RAISE NOTICE '✅ Updated existing user record';
        
    ELSE
        RAISE NOTICE 'User does not exist, creating...';
        
        -- Create new user record
        INSERT INTO users (id, company_id, is_super_admin, created_at)
        VALUES (target_user_id, acme_company_id, true, NOW());
        
        RAISE NOTICE '✅ Created new user record';
    END IF;
    
    -- Handle user roles
    IF admin_role_id IS NOT NULL THEN
        -- Delete existing user roles first
        DELETE FROM user_roles WHERE user_id = target_user_id;
        
        -- Insert new admin role
        INSERT INTO user_roles (user_id, company_id, role_id)
        VALUES (target_user_id, acme_company_id, admin_role_id);
        
        RAISE NOTICE '✅ Assigned admin role to user';
    ELSE
        RAISE NOTICE '⚠️ No admin role found, skipping role assignment';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 User setup complete!';
    RAISE NOTICE 'User ID: %', target_user_id;
    RAISE NOTICE 'Company: Acme Corporation (%)', acme_company_id;
    RAISE NOTICE 'Super Admin: Yes';
    RAISE NOTICE 'Role: Admin';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Now refresh your browser at http://localhost:3000/dashboard';
    
END $$; 