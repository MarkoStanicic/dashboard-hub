-- Update existing integrations table to match our expected schema
-- Run this in Supabase SQL Editor

BEGIN;

-- Rename service column to platform
ALTER TABLE integrations RENAME COLUMN service TO platform;

-- Add status column and convert from connected boolean
ALTER TABLE integrations ADD COLUMN status text DEFAULT 'disconnected';
UPDATE integrations SET status = CASE WHEN connected THEN 'connected' ELSE 'disconnected' END;
ALTER TABLE integrations DROP COLUMN connected;

-- Add missing columns
ALTER TABLE integrations ADD COLUMN name text;
ALTER TABLE integrations ADD COLUMN encrypted_credentials text;
ALTER TABLE integrations ADD COLUMN access_token text;
ALTER TABLE integrations ADD COLUMN refresh_token text;
ALTER TABLE integrations ADD COLUMN token_expires_at timestamptz;
ALTER TABLE integrations ADD COLUMN base_url text;
ALTER TABLE integrations ADD COLUMN last_sync_at timestamptz;
ALTER TABLE integrations ADD COLUMN last_error text;
ALTER TABLE integrations ADD COLUMN sync_enabled boolean DEFAULT true;
ALTER TABLE integrations ADD COLUMN created_by uuid REFERENCES users(id);
ALTER TABLE integrations ADD COLUMN updated_at timestamptz DEFAULT now();

-- Add constraints
ALTER TABLE integrations ADD CONSTRAINT integrations_platform_check 
    CHECK (platform IN ('tableau', 'powerbi', 'salesforce'));
    
ALTER TABLE integrations ADD CONSTRAINT integrations_status_check 
    CHECK (status IN ('connected', 'disconnected', 'error', 'pending'));

-- Update existing records with default names
UPDATE integrations SET name = CASE 
    WHEN platform = 'tableau' THEN 'Tableau Integration'
    WHEN platform = 'powerbi' THEN 'Power BI Integration' 
    WHEN platform = 'salesforce' THEN 'Salesforce Integration'
    ELSE platform || ' Integration'
END WHERE name IS NULL;

-- Make name required
ALTER TABLE integrations ALTER COLUMN name SET NOT NULL;

-- Create unique constraint
ALTER TABLE integrations ADD CONSTRAINT integrations_unique_platform_name 
    UNIQUE(company_id, platform, name);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integrations_company_id ON integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON integrations(platform);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_last_sync ON integrations(last_sync_at);

-- Enable RLS if not already enabled
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view integrations for their company" ON integrations;
DROP POLICY IF EXISTS "Admins can manage integrations" ON integrations;

-- Create RLS policies
CREATE POLICY "Users can view integrations for their company" ON integrations
    FOR SELECT USING (
        company_id IN (
            SELECT u.company_id FROM users u WHERE u.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
        )
    );

CREATE POLICY "Admins can manage integrations" ON integrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN user_roles ur ON ur.user_id = u.id
            JOIN roles r ON r.id = ur.role_id
            WHERE u.id = auth.uid() 
            AND u.company_id = integrations.company_id
            AND r.name = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
        )
    );

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at 
    BEFORE UPDATE ON integrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Success message
SELECT 'Integrations table updated successfully!' as result;