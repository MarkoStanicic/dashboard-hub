-- Create integrations table for storing platform connections
-- This table will store encrypted credentials and connection metadata

CREATE TABLE IF NOT EXISTS integrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    platform text NOT NULL CHECK (platform IN ('tableau', 'powerbi', 'salesforce')),
    name text NOT NULL, -- User-friendly name for the integration
    status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
    
    -- Connection configuration (encrypted JSON)
    config jsonb NOT NULL DEFAULT '{}',
    
    -- Encrypted credentials
    encrypted_credentials text, -- PGP encrypted credentials
    
    -- OAuth tokens (if applicable) 
    access_token text,
    refresh_token text,
    token_expires_at timestamptz,
    
    -- Connection metadata
    base_url text,
    last_sync_at timestamptz,
    last_error text,
    sync_enabled boolean DEFAULT true,
    
    -- Audit fields
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Ensure one integration per platform per company
    UNIQUE(company_id, platform, name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integrations_company_id ON integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON integrations(platform);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_last_sync ON integrations(last_sync_at);

-- Create sections table (referenced in API but doesn't exist)
CREATE TABLE IF NOT EXISTS sections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(company_id, name)
);

-- Update dashboards table to reference sections properly and add source integration
DO $$ 
BEGIN
    -- Add section_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dashboards' AND column_name = 'section_id') THEN
        ALTER TABLE dashboards ADD COLUMN section_id uuid REFERENCES sections(id);
    END IF;
    
    -- Add integration_id column to track which integration a dashboard came from
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dashboards' AND column_name = 'integration_id') THEN
        ALTER TABLE dashboards ADD COLUMN integration_id uuid REFERENCES integrations(id);
    END IF;
    
    -- Add external_id to track dashboard ID in external platform
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dashboards' AND column_name = 'external_id') THEN
        ALTER TABLE dashboards ADD COLUMN external_id text;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dashboards' AND column_name = 'description') THEN
        ALTER TABLE dashboards ADD COLUMN description text;
    END IF;
    
    -- Remove the old section column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dashboards' AND column_name = 'section') THEN
        ALTER TABLE dashboards DROP COLUMN section;
    END IF;
END $$;

-- Create index for better performance on dashboard queries
CREATE INDEX IF NOT EXISTS idx_dashboards_integration_id ON dashboards(integration_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_section_id ON dashboards(section_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_external_id ON dashboards(external_id);

-- RLS Policies for integrations
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Users can only see integrations for their company (unless super admin)
CREATE POLICY "Users can view integrations for their company" ON integrations
    FOR SELECT USING (
        company_id IN (
            SELECT u.company_id FROM users u WHERE u.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
        )
    );

-- Only admins can manage integrations
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

-- RLS Policies for sections  
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sections for their company" ON sections
    FOR SELECT USING (
        company_id IN (
            SELECT u.company_id FROM users u WHERE u.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
        )
    );

CREATE POLICY "Admins can manage sections" ON sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN user_roles ur ON ur.user_id = u.id
            JOIN roles r ON r.id = ur.role_id
            WHERE u.id = auth.uid() 
            AND u.company_id = sections.company_id
            AND r.name IN ('admin', 'editor')
        ) OR
        EXISTS (
            SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_super_admin = true
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_integrations_updated_at 
    BEFORE UPDATE ON integrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some default sections for existing companies
INSERT INTO sections (company_id, name, description)
SELECT 
    c.id,
    'Executive Dashboard',
    'High-level metrics and KPIs for executive leadership'
FROM companies c
ON CONFLICT (company_id, name) DO NOTHING;

INSERT INTO sections (company_id, name, description)
SELECT 
    c.id,
    'Sales & Marketing',
    'Sales performance, lead generation, and marketing analytics'
FROM companies c
ON CONFLICT (company_id, name) DO NOTHING;

INSERT INTO sections (company_id, name, description)
SELECT 
    c.id,
    'Operations',
    'Operational metrics, efficiency, and process monitoring'
FROM companies c
ON CONFLICT (company_id, name) DO NOTHING;

-- Create a view for dashboard with integration info
CREATE OR REPLACE VIEW dashboard_with_integration AS
SELECT 
    d.*,
    i.platform as integration_platform,
    i.status as integration_status,
    i.name as integration_name,
    s.name as section_name
FROM dashboards d
LEFT JOIN integrations i ON d.integration_id = i.id
LEFT JOIN sections s ON d.section_id = s.id;

COMMENT ON TABLE integrations IS 'Stores connections to external BI platforms like Tableau, Power BI, and Salesforce';
COMMENT ON TABLE sections IS 'Organizes dashboards into logical groups within a company';
COMMENT ON VIEW dashboard_with_integration IS 'Dashboard data enriched with integration and section information';