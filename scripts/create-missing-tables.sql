-- Create missing tables and update dashboards table
-- Run this after updating integrations table

BEGIN;

-- Create sections table (doesn't exist in your schema)
CREATE TABLE IF NOT EXISTS sections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(company_id, name)
);

-- Update dashboards table to add missing columns
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
    
    -- Add description column if it doesn't exist (I see it might be missing)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dashboards' AND column_name = 'description') THEN
        ALTER TABLE dashboards ADD COLUMN description text;
    END IF;
    
    -- Remove the old section column if it exists (replace with section_id)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dashboards' AND column_name = 'section') THEN
        ALTER TABLE dashboards DROP COLUMN section;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboards_integration_id ON dashboards(integration_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_section_id ON dashboards(section_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_external_id ON dashboards(external_id);
CREATE INDEX IF NOT EXISTS idx_sections_company_id ON sections(company_id);

-- Enable RLS for sections
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sections
DROP POLICY IF EXISTS "Users can view sections for their company" ON sections;
DROP POLICY IF EXISTS "Admins can manage sections" ON sections;

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

-- Insert default sections for existing companies
INSERT INTO sections (company_id, name, description)
SELECT 
    c.id,
    'Executive Dashboard',
    'High-level metrics and KPIs for executive leadership'
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM sections s 
    WHERE s.company_id = c.id AND s.name = 'Executive Dashboard'
);

INSERT INTO sections (company_id, name, description)
SELECT 
    c.id,
    'Sales & Marketing',
    'Sales performance, lead generation, and marketing analytics'
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM sections s 
    WHERE s.company_id = c.id AND s.name = 'Sales & Marketing'
);

INSERT INTO sections (company_id, name, description)
SELECT 
    c.id,
    'Operations',
    'Operational metrics, efficiency, and process monitoring'
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM sections s 
    WHERE s.company_id = c.id AND s.name = 'Operations'
);

COMMIT;

-- Success message
SELECT 'Missing tables created and dashboards table updated successfully!' as result;