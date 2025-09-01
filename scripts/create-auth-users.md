# Creating Test Auth Users in Supabase

Since our test data script creates database records with placeholder user IDs, you need to create real Supabase Auth users and then update the database records with the actual auth user IDs.

## Step 1: Create Auth Users via Supabase Dashboard

1. Go to your Supabase Dashboard → Authentication → Users
2. Click "Add user" and create these test accounts:

### Test Users to Create:

#### Company 1 - Acme Corporation
- **john.doe@acme.com** (Admin)
  - Email: john.doe@acme.com  
  - Temporary Password: TestPass123!
  
- **jane.smith@acme.com** (Editor)
  - Email: jane.smith@acme.com
  - Temporary Password: TestPass123!
  
- **bob.wilson@acme.com** (Viewer)
  - Email: bob.wilson@acme.com
  - Temporary Password: TestPass123!

#### Company 2 - TechCorp Solutions  
- **alice.brown@techcorp.io** (Admin)
  - Email: alice.brown@techcorp.io
  - Temporary Password: TestPass123!
  
- **charlie.davis@techcorp.io** (Editor)
  - Email: charlie.davis@techcorp.io
  - Temporary Password: TestPass123!

#### Company 3 - DataLab Analytics
- **diana.taylor@datalab.co** (Admin)
  - Email: diana.taylor@datalab.co
  - Temporary Password: TestPass123!
  
- **frank.miller@datalab.co** (Viewer)
  - Email: frank.miller@datalab.co
  - Temporary Password: TestPass123!

## Step 2: Get the Auth User IDs

After creating each user in Supabase Auth, copy their UUID from the dashboard.

## Step 3: Update Database Records

Run the SQL script we'll generate to update the placeholder user IDs with real Auth IDs:

```sql
-- Update users table with real Supabase Auth IDs
UPDATE users SET id = 'REAL_AUTH_UUID_HERE' WHERE id = 'user-1-john';
UPDATE users SET id = 'REAL_AUTH_UUID_HERE' WHERE id = 'user-2-jane';
-- ... repeat for all users
```

## Step 4: Update Related Tables

Since user_id is referenced in other tables, you'll need to update those as well:

```sql
-- Update user_roles table
UPDATE user_roles SET user_id = 'REAL_AUTH_UUID_HERE' WHERE user_id = 'user-1-john';
-- ... repeat for all users

-- Update insights table  
UPDATE insights SET created_by = 'REAL_AUTH_UUID_HERE' WHERE created_by = 'user-1-john';
-- ... repeat for all users
```

## Alternative: Script-Based Approach

I'll create a script that can help you do this automatically once you have the Auth UUIDs. 