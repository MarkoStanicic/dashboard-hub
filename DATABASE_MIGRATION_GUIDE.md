# Database Migration Guide

## 🚨 Important: Schema Update Required

Your current Supabase database schema doesn't match our integration system requirements. Follow these steps to update it:

## 📋 **Step-by-Step Migration**

### **Step 1: Update Integrations Table**
Copy and run `scripts/update-existing-integrations.sql` in your **Supabase SQL Editor**:

**What it does:**
- Renames `service` → `platform`
- Converts `connected` (boolean) → `status` (text)
- Adds missing columns: `name`, `encrypted_credentials`, `access_token`, etc.
- Sets up proper constraints and security policies

### **Step 2: Create Missing Tables & Update Dashboards**
Copy and run `scripts/create-missing-tables.sql` in your **Supabase SQL Editor**:

**What it does:**
- Creates the `sections` table (for organizing dashboards)
- Adds missing columns to `dashboards` table: `section_id`, `integration_id`, `external_id`
- Creates default sections for existing companies
- Sets up indexes and security policies

### **Step 3: Validate Everything**
Copy and run `scripts/validate-schema.sql` in your **Supabase SQL Editor**:

**What it does:**
- Checks that all tables have the correct structure
- Validates constraints, indexes, and security policies
- Shows record counts to confirm data integrity

## ⚠️ **Before You Start**

1. **Backup your data** (Supabase automatically backs up, but be safe)
2. **Run scripts in order** (don't skip steps)
3. **Check for errors** after each script

## 🔍 **Current vs Expected Schema**

### **Current Integrations Table:**
```sql
integrations (
  id uuid,
  company_id uuid,
  service text,      -- ❌ Should be 'platform'
  config jsonb,
  connected bool,    -- ❌ Should be 'status' text
  created_at timestamp
)
```

### **Expected Integrations Table:**
```sql
integrations (
  id uuid,
  company_id uuid,
  platform text,     -- ✅ tableau/powerbi/salesforce
  name text,          -- ✅ User-friendly name
  status text,        -- ✅ connected/disconnected/error/pending
  config jsonb,
  encrypted_credentials text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  base_url text,
  last_sync_at timestamptz,
  last_error text,
  sync_enabled boolean,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
```

### **New Tables:**
- **`sections`**: Organize dashboards into logical groups
- **Enhanced `dashboards`**: Links to integrations and sections

## 🎯 **After Migration**

Once you've run all scripts successfully:

1. ✅ Your integration system will work with real platforms
2. ✅ Dashboard search and filtering will function properly  
3. ✅ Security policies will be properly configured
4. ✅ You can start connecting to Tableau, Power BI, and Salesforce

## 🛠️ **Troubleshooting**

### **If you get constraint errors:**
- Check if you have existing data that violates new constraints
- The scripts are designed to handle existing data safely

### **If RLS policies fail:**
- Make sure your `auth.users_id` column exists and is properly configured
- The scripts drop existing policies before creating new ones

### **If you need to start fresh:**
You can also drop the integrations table completely and run the original `scripts/create-integrations-schema.sql` for a clean start:

```sql
-- Only if you want to start completely fresh
DROP TABLE IF EXISTS integrations CASCADE;
-- Then run create-integrations-schema.sql
```

## 📞 **Need Help?**

If you encounter any issues during migration, the scripts are designed to be safe and can be run multiple times. Each script checks for existing columns/constraints before making changes.