-- Fix User Company Assignment
-- Run this in Supabase SQL Editor to assign your user to a company

DO $$
DECLARE
    current_auth_user_id uuid;
    acme_company_id uuid;
    admin_role_id int;
BEGIN
    -- Get the current authenticated user ID
    SELECT auth.uid() INTO current_auth_user_id;
    
    -- Get Acme company ID
    SELECT id INTO acme_company_id FROM companies WHERE name = 'Acme Corporation' LIMIT 1;
    
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
    
    RAISE NOTICE 'Current User ID: %', current_auth_user_id;
    RAISE NOTICE 'Acme Company ID: %', acme_company_id;
    RAISE NOTICE 'Admin Role ID: %', admin_role_id;
    
    -- Update or insert user with company assignment
    INSERT INTO users (id, company_id, is_super_admin, created_at)
    VALUES (current_auth_user_id, acme_company_id, true, NOW())
    ON CONFLICT (id) DO UPDATE SET 
        company_id = acme_company_id,
        is_super_admin = true;
    
    -- Ensure user has admin role
    INSERT INTO user_roles (user_id, company_id, role_id)
    VALUES (current_auth_user_id, acme_company_id, admin_role_id)
    ON CONFLICT (user_id, company_id) DO UPDATE SET 
        role_id = admin_role_id;
    
    RAISE NOTICE '✅ User successfully assigned to Acme Corporation with admin role';
    RAISE NOTICE '✅ User is now super admin';
    
END $$; 