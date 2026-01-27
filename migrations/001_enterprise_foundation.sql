-- PHASE 1: ENTERPRISE FOUNDATION MIGRATION
-- Safe additive changes only - zero impact on existing functionality

-- Organizations table for hierarchy management
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'facility' CHECK (type IN ('facility', 'department', 'team')),
    parent_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    contact_info JSONB DEFAULT '{}', -- { email, phone, address }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    -- Constraints
    CONSTRAINT valid_hierarchy CHECK (
        (type = 'facility' AND parent_id IS NULL) OR
        (type = 'department' AND parent_id IS NOT NULL) OR
        (type = 'team' AND parent_id IS NOT NULL)
    )
);

-- User-Organization relationships with roles
CREATE TABLE IF NOT EXISTS user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'manager', 'admin', 'owner')),
    permissions JSONB DEFAULT '{}', -- Flexible permissions system
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    -- Unique constraint: one role per user per org
    UNIQUE(user_id, org_id)
);

-- Enterprise reporting configurations
CREATE TABLE IF NOT EXISTS enterprise_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('compliance', 'progress', 'certification', 'custom')),
    config JSONB DEFAULT '{}', -- Report configuration
    schedule JSONB DEFAULT NULL, -- Automated report scheduling
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Audit log for enterprise features
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for performance
    INDEX idx_audit_logs_org_created_at (org_id, created_at),
    INDEX idx_audit_logs_user_created_at (user_id, created_at)
);

-- Safe additions to existing tables (nullable columns)
ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id),
    ADD COLUMN IF NOT EXISTS enterprise_settings JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS last_org_context UUID;

ALTER TABLE enrollments 
    ADD COLUMN IF NOT EXISTS org_context JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS assignment_note TEXT;

ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS org_context JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS compliance_tags TEXT[];

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_org_context ON enrollments USING GIN(org_context);

-- Update trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_organizations_updated_at
    BEFORE UPDATE ON user_organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_reports_updated_at
    BEFORE UPDATE ON enterprise_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert example data for testing (can be removed in production)
INSERT INTO organizations (name, type, settings) VALUES 
    ('Demo Manufacturing Corp', 'facility', '{"demo": true}')
ON CONFLICT DO NOTHING;

-- Verification queries (for testing)
-- SELECT 'Migration completed successfully' as status;
-- SELECT COUNT(*) as organizations_count FROM organizations;
-- SELECT COUNT(*) as user_organizations_count FROM user_organizations;