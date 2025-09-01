-- Setup Test Data for Dashboard Hub
-- Run this script to create test companies, users, dashboards, and insights

-- First, let's ensure we have the basic roles
INSERT INTO roles (id, name, description) VALUES 
  ('viewer-role-id', 'viewer', 'Can view dashboards and insights'),
  ('editor-role-id', 'editor', 'Can view and edit dashboards and insights'),
  ('admin-role-id', 'admin', 'Can manage users, dashboards, and company settings')
ON CONFLICT (name) DO NOTHING;

-- Create test companies
INSERT INTO companies (id, name, domain, created_at) VALUES 
  ('company-1-acme', 'Acme Corporation', 'acme.com', NOW() - INTERVAL '6 months'),
  ('company-2-techcorp', 'TechCorp Solutions', 'techcorp.io', NOW() - INTERVAL '3 months'),
  ('company-3-datalab', 'DataLab Analytics', 'datalab.co', NOW() - INTERVAL '1 month')
ON CONFLICT (id) DO NOTHING;

-- Create sections for organizing dashboards
INSERT INTO sections (id, name, company_id, created_at) VALUES 
  ('section-1-weekly', 'Weekly Operations', 'company-1-acme', NOW() - INTERVAL '5 months'),
  ('section-2-quarterly', 'Quarterly Review', 'company-1-acme', NOW() - INTERVAL '5 months'),
  ('section-3-sales', 'Sales Dashboard', 'company-1-acme', NOW() - INTERVAL '4 months'),
  ('section-4-finance', 'Financial Reports', 'company-2-techcorp', NOW() - INTERVAL '2 months'),
  ('section-5-marketing', 'Marketing Analytics', 'company-2-techcorp', NOW() - INTERVAL '2 months'),
  ('section-6-operations', 'Operations KPIs', 'company-3-datalab', NOW() - INTERVAL '3 weeks')
ON CONFLICT (id) DO NOTHING;

-- Create test users (you'll need to add these via Supabase Auth UI or modify with real auth IDs)
-- Note: In production, these IDs should come from Supabase Auth
INSERT INTO users (id, email, company_id, is_super_admin, created_at) VALUES 
  ('user-1-john', 'john.doe@acme.com', 'company-1-acme', false, NOW() - INTERVAL '5 months'),
  ('user-2-jane', 'jane.smith@acme.com', 'company-1-acme', false, NOW() - INTERVAL '4 months'),
  ('user-3-bob', 'bob.wilson@acme.com', 'company-1-acme', false, NOW() - INTERVAL '3 months'),
  ('user-4-alice', 'alice.brown@techcorp.io', 'company-2-techcorp', false, NOW() - INTERVAL '2 months'),
  ('user-5-charlie', 'charlie.davis@techcorp.io', 'company-2-techcorp', false, NOW() - INTERVAL '1 month'),
  ('user-6-diana', 'diana.taylor@datalab.co', 'company-3-datalab', false, NOW() - INTERVAL '3 weeks'),
  ('user-7-frank', 'frank.miller@datalab.co', 'company-3-datalab', false, NOW() - INTERVAL '2 weeks')
ON CONFLICT (id) DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (id, user_id, company_id, role_id, created_at) VALUES 
  ('role-1', 'user-1-john', 'company-1-acme', 'admin-role-id', NOW() - INTERVAL '5 months'),
  ('role-2', 'user-2-jane', 'company-1-acme', 'editor-role-id', NOW() - INTERVAL '4 months'),
  ('role-3', 'user-3-bob', 'company-1-acme', 'viewer-role-id', NOW() - INTERVAL '3 months'),
  ('role-4', 'user-4-alice', 'company-2-techcorp', 'admin-role-id', NOW() - INTERVAL '2 months'),
  ('role-5', 'user-5-charlie', 'company-2-techcorp', 'editor-role-id', NOW() - INTERVAL '1 month'),
  ('role-6', 'user-6-diana', 'company-3-datalab', 'admin-role-id', NOW() - INTERVAL '3 weeks'),
  ('role-7', 'user-7-frank', 'company-3-datalab', 'viewer-role-id', NOW() - INTERVAL '2 weeks')
ON CONFLICT (id) DO NOTHING;

-- Create test dashboards with different platforms
INSERT INTO dashboards (id, title, description, platform, embed_url, company_id, section_id, created_at) VALUES 
  -- Acme Corporation Dashboards
  ('dash-1-sales', 'Sales Performance Dashboard', 'Monthly sales metrics and KPIs', 'tableau', 'https://public.tableau.com/views/SalesPerformance2024/Dashboard1?:embed=y&:display_count=no&:toolbar=no', 'company-1-acme', 'section-3-sales', NOW() - INTERVAL '4 months'),
  ('dash-2-weekly', 'Weekly Operations Report', 'Operational metrics updated weekly', 'powerbi', 'https://app.powerbi.com/view?r=eyJrIjoiYWJjZGVmZ2giLCJ0IjoiMTIzNDUifQ%3D%3D', 'company-1-acme', 'section-1-weekly', NOW() - INTERVAL '3 months'),
  ('dash-3-quarterly', 'Q4 2024 Review', 'Comprehensive quarterly business review', 'salesforce', 'https://salesforce.com/analytics/dashboard/quarterly-review', 'company-1-acme', 'section-2-quarterly', NOW() - INTERVAL '2 months'),
  ('dash-4-customer', 'Customer Analytics', 'Customer behavior and satisfaction metrics', 'tableau', 'https://public.tableau.com/views/CustomerAnalytics/Dashboard2?:embed=y&:display_count=no&:toolbar=no', 'company-1-acme', 'section-3-sales', NOW() - INTERVAL '1 month'),
  
  -- TechCorp Solutions Dashboards
  ('dash-5-finance', 'Financial Overview', 'Monthly financial reports and cash flow', 'powerbi', 'https://app.powerbi.com/view?r=eyJrIjoiZmluYW5jZSIsInQiOiIxMjM0NSJ9', 'company-2-techcorp', 'section-4-finance', NOW() - INTERVAL '2 months'),
  ('dash-6-marketing', 'Marketing Campaign ROI', 'Campaign performance and lead generation', 'salesforce', 'https://salesforce.com/analytics/dashboard/marketing-roi', 'company-2-techcorp', 'section-5-marketing', NOW() - INTERVAL '1 month'),
  ('dash-7-product', 'Product Usage Analytics', 'User engagement and feature adoption', 'tableau', 'https://public.tableau.com/views/ProductUsage/Dashboard3?:embed=y&:display_count=no&:toolbar=no', 'company-2-techcorp', 'section-5-marketing', NOW() - INTERVAL '3 weeks'),
  
  -- DataLab Analytics Dashboards
  ('dash-8-ops', 'Operations KPI Dashboard', 'Real-time operational metrics', 'powerbi', 'https://app.powerbi.com/view?r=eyJrIjoib3BlcmF0aW9ucyIsInQiOiIxMjM0NSJ9', 'company-3-datalab', 'section-6-operations', NOW() - INTERVAL '2 weeks'),
  ('dash-9-growth', 'Growth Metrics', 'User acquisition and retention analytics', 'tableau', 'https://public.tableau.com/views/GrowthMetrics/Dashboard4?:embed=y&:display_count=no&:toolbar=no', 'company-3-datalab', 'section-6-operations', NOW() - INTERVAL '1 week'),
  ('dash-10-revenue', 'Revenue Dashboard', 'Revenue tracking and forecasting', 'salesforce', 'https://salesforce.com/analytics/dashboard/revenue-tracking', 'company-3-datalab', null, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Create test insights for dashboards
INSERT INTO insights (id, dashboard_id, content, type, position_x, position_y, created_by, created_at) VALUES 
  -- Sales Performance Dashboard insights
  ('insight-1', 'dash-1-sales', 'Q4 sales exceeded target by 15% - great work by the west coast team!', 'note', 25, 30, 'user-1-john', NOW() - INTERVAL '3 months'),
  ('insight-2', 'dash-1-sales', 'The dip in November was due to the product launch delay, but we recovered in December', 'explanation', 60, 45, 'user-2-jane', NOW() - INTERVAL '2 months'),
  ('insight-3', 'dash-1-sales', 'Focus area: East coast territory needs attention in Q1', 'callout', 80, 20, 'user-1-john', NOW() - INTERVAL '1 month'),
  
  -- Weekly Operations insights
  ('insight-4', 'dash-2-weekly', 'Server uptime improved to 99.9% after infrastructure upgrade', 'note', 40, 60, 'user-2-jane', NOW() - INTERVAL '2 weeks'),
  ('insight-5', 'dash-2-weekly', 'Customer support response time target: <2 hours', 'tag', 70, 80, 'user-3-bob', NOW() - INTERVAL '1 week'),
  
  -- Financial Overview insights
  ('insight-6', 'dash-5-finance', 'Cash flow positive for 6 consecutive months', 'note', 30, 40, 'user-4-alice', NOW() - INTERVAL '1 month'),
  ('insight-7', 'dash-5-finance', 'R&D investment increased by 20% to support new product development', 'explanation', 50, 70, 'user-5-charlie', NOW() - INTERVAL '2 weeks'),
  
  -- Marketing Campaign insights
  ('insight-8', 'dash-6-marketing', 'LinkedIn campaigns showing 40% higher conversion rate than Google Ads', 'callout', 35, 25, 'user-5-charlie', NOW() - INTERVAL '1 week'),
  ('insight-9', 'dash-6-marketing', 'Email marketing ROI: 4:1', 'tag', 65, 55, 'user-4-alice', NOW() - INTERVAL '5 days'),
  
  -- Operations KPI insights
  ('insight-10', 'dash-8-ops', 'Production efficiency up 12% after process optimization', 'note', 45, 35, 'user-6-diana', NOW() - INTERVAL '1 week'),
  ('insight-11', 'dash-8-ops', 'New quality control measures reduced defect rate by 8%', 'explanation', 75, 65, 'user-7-frank', NOW() - INTERVAL '3 days'),
  
  -- Growth Metrics insights
  ('insight-12', 'dash-9-growth', 'User retention improved 25% after onboarding redesign', 'note', 40, 50, 'user-6-diana', NOW() - INTERVAL '2 days'),
  ('insight-13', 'dash-9-growth', 'Mobile app downloads increased 60% this quarter', 'callout', 60, 30, 'user-7-frank', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Display summary of test data created
SELECT 
  'Test Data Summary' as info,
  (SELECT COUNT(*) FROM companies WHERE id LIKE 'company-%') as companies_created,
  (SELECT COUNT(*) FROM users WHERE id LIKE 'user-%') as users_created,
  (SELECT COUNT(*) FROM dashboards WHERE id LIKE 'dash-%') as dashboards_created,
  (SELECT COUNT(*) FROM insights WHERE id LIKE 'insight-%') as insights_created,
  (SELECT COUNT(*) FROM sections WHERE id LIKE 'section-%') as sections_created; 