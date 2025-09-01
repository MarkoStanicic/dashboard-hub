-- Comprehensive Auth & Database Setup Check
-- Run this in Supabase SQL Editor to diagnose and fix auth issues

DO $$
DECLARE
    auth_user_count int;
    public_user_count int;
    roles_count int;
    companies_count int;
    current_user_id uuid := 'eec337dc-4da9-47fe-9746-1bb9b1a4a197';
    acme_company_id uuid;
BEGIN
    RAISE NOTICE '🔍 === CHECKING DATABASE SETUP ===';
    RAISE NOTICE '';

    -- 1. Check auth.users vs public.users
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;
    SELECT COUNT(*) INTO public_user_count FROM public.users;
    
    RAISE NOTICE '👥 USER TABLES:';
    RAISE NOTICE '  Auth users: %', auth_user_count;
    RAISE NOTICE '  Public users: %', public_user_count;
    
    -- Show auth users
    RAISE NOTICE '';
    RAISE NOTICE '🔐 AUTH USERS:';
    FOR rec IN SELECT id, email, created_at FROM auth.users LOOP
        RAISE NOTICE '  ID: % | Email: % | Created: %', rec.id, rec.email, rec.created_at;
    END LOOP;

    -- 2. Check roles table
    SELECT COUNT(*) INTO roles_count FROM public.roles;
    RAISE NOTICE '';
    RAISE NOTICE '🏷️ ROLES (% total):',  roles_count;
    
    IF roles_count = 0 THEN
        RAISE NOTICE '❌ No roles found! Creating default roles...';
        
        INSERT INTO public.roles (name) VALUES 
            ('viewer'),
            ('editor'), 
            ('admin')
        ON CONFLICT (name) DO NOTHING;
        
        RAISE NOTICE '✅ Created default roles: viewer, editor, admin';
    ELSE
        FOR rec IN SELECT id, name FROM public.roles ORDER BY id LOOP
            RAISE NOTICE '  ID: % | Name: %', rec.id, rec.name;
        END LOOP;
    END IF;

    -- 3. Check companies table
    SELECT COUNT(*) INTO companies_count FROM public.companies;
    RAISE NOTICE '';
    RAISE NOTICE '🏢 COMPANIES (% total):', companies_count;
    
    IF companies_count = 0 THEN
        RAISE NOTICE '❌ No companies found! Creating default companies...';
        
        INSERT INTO public.companies (id, name, created_at) VALUES 
            (gen_random_uuid(), 'Acme Corporation', NOW()),
            (gen_random_uuid(), 'TechCorp Solutions', NOW()),
            (gen_random_uuid(), 'DataLab Analytics', NOW())
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Created default companies';
    ELSE
        FOR rec IN SELECT id, name, created_at FROM public.companies ORDER BY name LOOP
            RAISE NOTICE '  ID: % | Name: % | Created: %', rec.id, rec.name, rec.created_at;
        END LOOP;
    END IF;

    -- Get Acme company ID for user assignment
    SELECT id INTO acme_company_id FROM public.companies WHERE name = 'Acme Corporation' LIMIT 1;

    -- 4. Check current user setup
    RAISE NOTICE '';
    RAISE NOTICE '👤 CURRENT USER SETUP:';
    RAISE NOTICE '  Target User ID: %', current_user_id;
    
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = current_user_id) THEN
        RAISE NOTICE '  ✅ User exists in auth.users';
        
        -- Show auth user details
        FOR rec IN SELECT email, email_confirmed_at, created_at FROM auth.users WHERE id = current_user_id LOOP
            RAISE NOTICE '  Email: % | Confirmed: % | Created: %', rec.email, rec.email_confirmed_at, rec.created_at;
        END LOOP;
        
    ELSE
        RAISE NOTICE '  ❌ User NOT found in auth.users';
        RAISE NOTICE '  This means the user is not properly authenticated';
    END IF;

    IF EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id) THEN
        RAISE NOTICE '  ✅ User exists in public.users';
        
        -- Show public user details
        FOR rec IN SELECT company_id, is_super_admin, created_at FROM public.users WHERE id = current_user_id LOOP
            RAISE NOTICE '  Company ID: % | Super Admin: % | Created: %', rec.company_id, rec.is_super_admin, rec.created_at;
        END LOOP;
        
    ELSE
        RAISE NOTICE '  ❌ User NOT found in public.users - will create';
        
        -- Create the user in public.users
        INSERT INTO public.users (id, company_id, is_super_admin, created_at)
        VALUES (current_user_id, acme_company_id, true, NOW())
        ON CONFLICT (id) DO UPDATE SET
            company_id = acme_company_id,
            is_super_admin = true;
            
        RAISE NOTICE '  ✅ Created user in public.users';
    END IF;

    -- 5. Check user roles
    RAISE NOTICE '';
    RAISE NOTICE '🔑 USER ROLES:';
    
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = current_user_id) THEN
        RAISE NOTICE '  ✅ User has role assignments';
        
        FOR rec IN 
            SELECT ur.role_id, r.name as role_name, ur.company_id 
            FROM public.user_roles ur 
            LEFT JOIN public.roles r ON ur.role_id = r.id 
            WHERE ur.user_id = current_user_id 
        LOOP
            RAISE NOTICE '  Role ID: % | Name: % | Company: %', rec.role_id, rec.role_name, rec.company_id;
        END LOOP;
    ELSE
        RAISE NOTICE '  ❌ User has no role assignments - will create admin role';
        
        -- Assign admin role
        INSERT INTO public.user_roles (user_id, company_id, role_id)
        SELECT current_user_id, acme_company_id, id 
        FROM public.roles 
        WHERE name = 'admin' 
        LIMIT 1
        ON CONFLICT (user_id, company_id) DO UPDATE SET
            role_id = EXCLUDED.role_id;
            
        RAISE NOTICE '  ✅ Assigned admin role to user';
    END IF;

    -- 6. Check foreign key constraints
    RAISE NOTICE '';
    RAISE NOTICE '🔗 CHECKING FOREIGN KEY CONSTRAINTS:';
    
    -- Check if users.id references auth.users.id
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'users' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'id'
    ) THEN
        RAISE NOTICE '  ✅ Foreign key constraint exists: users.id -> auth.users.id';
    ELSE
        RAISE NOTICE '  ❌ Foreign key constraint missing: users.id -> auth.users.id';
        RAISE NOTICE '  This might cause issues. Consider adding:';
        RAISE NOTICE '  ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;';
    END IF;

    -- 7. Check RLS policies
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ ROW LEVEL SECURITY:';
    
    FOR rec IN 
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename IN ('users', 'companies', 'dashboards', 'user_roles')
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE '  Table: % | Policy: % | Command: %', rec.tablename, rec.policyname, rec.cmd;
    END LOOP;

    -- 8. Final summary
    RAISE NOTICE '';
    RAISE NOTICE '📋 === SETUP SUMMARY ===';
    RAISE NOTICE '✅ Auth users: %', auth_user_count;
    RAISE NOTICE '✅ Public users: %', (SELECT COUNT(*) FROM public.users);
    RAISE NOTICE '✅ Roles: %', (SELECT COUNT(*) FROM public.roles);
    RAISE NOTICE '✅ Companies: %', (SELECT COUNT(*) FROM public.companies);
    RAISE NOTICE '✅ User roles: %', (SELECT COUNT(*) FROM public.user_roles WHERE user_id = current_user_id);
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Setup check complete!';
    RAISE NOTICE '🔄 Now refresh your app at http://localhost:3000/dashboard';

END $$; 