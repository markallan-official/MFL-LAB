-- SaaS Collaborative Development Platform - Database Schema
-- Supabase PostgreSQL Setup
-- Created: February 27, 2026

-- ============================================
-- ORGANIZATION & MULTI-TENANCY
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT org_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive', 'suspended');

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  status user_status DEFAULT 'pending',
  email_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'UTC',
  password_changed_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(org_id, email),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- ============================================
-- ROLES & PERMISSIONS
-- ============================================

CREATE TYPE role_level AS ENUM ('super_admin', 'org_admin', 'workspace_lead', 'workspace_user', 'client_user');

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  role_level role_level NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(org_id, name),
  CONSTRAINT valid_system_role CHECK (
    NOT (is_system = TRUE AND org_id IS NOT NULL)
  )
);

CREATE INDEX idx_roles_org_id ON roles(org_id);
CREATE INDEX idx_roles_level ON roles(role_level);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  workspace_id UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, role_id, workspace_id),
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > assigned_at)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_workspace_id ON user_roles(workspace_id);

-- ============================================
-- WORKSPACES
-- ============================================

CREATE TYPE workspace_type AS ENUM ('designer', 'analyst', 'qa', 'ai_builder', 'integration');
CREATE TYPE workspace_access_level AS ENUM ('viewer', 'editor', 'manager', 'admin');

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  type workspace_type NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(org_id, type)
);

CREATE INDEX idx_workspaces_org_id ON workspaces(org_id);
CREATE INDEX idx_workspaces_type ON workspaces(type);

CREATE TABLE workspace_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  user_id UUID NOT NULL REFERENCES users(id),
  access_level workspace_access_level DEFAULT 'viewer',
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(workspace_id, user_id),
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > granted_at)
);

CREATE INDEX idx_workspace_access_workspace_id ON workspace_access(workspace_id);
CREATE INDEX idx_workspace_access_user_id ON workspace_access(user_id);

-- ============================================
-- ADMIN APPROVALS
-- ============================================

CREATE TYPE approval_type AS ENUM ('user_join', 'role_change', 'client_access', 'workspace_access', 'budget_approval');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  type approval_type NOT NULL,
  status approval_status DEFAULT 'pending',
  requester_id UUID REFERENCES users(id),
  approver_id UUID REFERENCES users(id),
  data JSONB NOT NULL,
  reason TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_approval_timestamp CHECK (
    status = 'pending' OR (status != 'pending' AND approved_at IS NOT NULL)
  )
);

CREATE INDEX idx_approvals_org_id ON approvals(org_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_approver_id ON approvals(approver_id);
CREATE INDEX idx_approvals_created_at ON approvals(created_at);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  change_summary JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('success', 'error', 'pending'))
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- DESIGNER WORKSPACE TABLES
-- ============================================

CREATE TABLE design_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_design_projects_workspace_id ON design_projects(workspace_id);

CREATE TYPE asset_type AS ENUM ('image', 'icon', 'component', 'color', 'typography', 'pattern', 'other');

CREATE TABLE design_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES design_projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  asset_type asset_type NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  version INT DEFAULT 1,
  tags VARCHAR(100)[],
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_design_assets_project_id ON design_assets(project_id);
CREATE INDEX idx_design_assets_asset_type ON design_assets(asset_type);
CREATE INDEX idx_design_assets_tags ON design_assets USING GIN(tags);

CREATE TABLE design_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES design_assets(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES design_comments(id),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_design_comments_asset_id ON design_comments(asset_id);
CREATE INDEX idx_design_comments_user_id ON design_comments(user_id);

-- ============================================
-- ANALYST WORKSPACE TABLES
-- ============================================

CREATE TYPE doc_type AS ENUM ('architecture', 'diagram', 'specification', 'requirements', 'design_document');

CREATE TABLE architecture_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  doc_type doc_type NOT NULL,
  version INT DEFAULT 1,
  is_published BOOLEAN DEFAULT FALSE,
  tags VARCHAR(100)[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_architecture_documents_workspace_id ON architecture_documents(workspace_id);
CREATE INDEX idx_architecture_documents_doc_type ON architecture_documents(doc_type);

CREATE TABLE data_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  version INT DEFAULT 1,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_data_models_workspace_id ON data_models(workspace_id);

CREATE TYPE http_method AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS');

CREATE TABLE api_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  method http_method NOT NULL,
  description TEXT,
  spec JSONB NOT NULL,
  version INT DEFAULT 1,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_specifications_workspace_id ON api_specifications(workspace_id);
CREATE INDEX idx_api_specifications_endpoint ON api_specifications(endpoint);

-- ============================================
-- QA WORKSPACE TABLES
-- ============================================

CREATE TYPE test_case_status AS ENUM ('draft', 'ready', 'executing', 'completed', 'deprecated');
CREATE TYPE test_result_status AS ENUM ('passed', 'failed', 'skipped', 'blocked', 'inconclusive');
CREATE TYPE severity_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE defect_status AS ENUM ('open', 'assigned', 'in_progress', 'fixed', 'verified', 'closed', 'reopened');

CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB DEFAULT '{}',
  expected_results TEXT,
  status test_case_status DEFAULT 'draft',
  priority INT DEFAULT 3,
  tags VARCHAR(100)[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_test_cases_workspace_id ON test_cases(workspace_id);
CREATE INDEX idx_test_cases_status ON test_cases(status);

CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID NOT NULL REFERENCES test_cases(id),
  build_id UUID,
  status test_result_status NOT NULL,
  executed_by UUID REFERENCES users(id),
  execution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INT,
  notes TEXT,
  attachments JSONB DEFAULT '[]'
);

CREATE INDEX idx_test_results_test_case_id ON test_results(test_case_id);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_test_results_execution_date ON test_results(execution_date);

CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  version VARCHAR(50) NOT NULL,
  build_number INT,
  description TEXT,
  status VARCHAR(50) DEFAULT 'building',
  total_tests INT DEFAULT 0,
  passed_tests INT DEFAULT 0,
  failed_tests INT DEFAULT 0,
  skipped_tests INT DEFAULT 0,
  test_coverage NUMERIC(5,2),
  download_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_builds_workspace_id ON builds(workspace_id);
CREATE INDEX idx_builds_version ON builds(version);

CREATE TABLE defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reproduction_steps TEXT,
  severity severity_level DEFAULT 'medium',
  status defect_status DEFAULT 'open',
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_defects_workspace_id ON defects(workspace_id);
CREATE INDEX idx_defects_status ON defects(status);
CREATE INDEX idx_defects_severity ON defects(severity);
CREATE INDEX idx_defects_assigned_to ON defects(assigned_to);

-- ============================================
-- AI BUILDER WORKSPACE TABLES
-- ============================================

CREATE TYPE model_status AS ENUM ('development', 'testing', 'staging', 'production', 'deprecated');
CREATE TYPE training_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');

CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model_type VARCHAR(100) NOT NULL,
  version VARCHAR(50),
  framework VARCHAR(100),
  status model_status DEFAULT 'development',
  parameters JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_models_workspace_id ON ai_models(workspace_id);
CREATE INDEX idx_ai_models_status ON ai_models(status);

CREATE TABLE training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id),
  name VARCHAR(255),
  description TEXT,
  status training_status DEFAULT 'queued',
  dataset_info JSONB DEFAULT '{}',
  hyperparameters JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_training_jobs_model_id ON training_jobs(model_id);
CREATE INDEX idx_training_jobs_status ON training_jobs(status);

CREATE TYPE deployment_env AS ENUM ('dev', 'staging', 'production');

CREATE TABLE model_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id),
  training_job_id UUID REFERENCES training_jobs(id),
  environment deployment_env NOT NULL,
  version VARCHAR(50),
  endpoint_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  performance_metrics JSONB DEFAULT '{}',
  deployed_by UUID REFERENCES users(id),
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(model_id, environment)
);

CREATE INDEX idx_model_deployments_model_id ON model_deployments(model_id);
CREATE INDEX idx_model_deployments_environment ON model_deployments(environment);

-- ============================================
-- INTEGRATION WORKSPACE TABLES
-- ============================================

CREATE TYPE integration_build_status AS ENUM ('planning', 'building', 'testing', 'ready', 'deployed', 'failed');
CREATE TYPE artifact_type AS ENUM ('docker_image', 'binary', 'source', 'documentation', 'config');

CREATE TABLE integration_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  status integration_build_status DEFAULT 'planning',
  
  -- Component references
  design_asset_id UUID REFERENCES design_assets(id),
  architecture_document_id UUID REFERENCES architecture_documents(id),
  ai_model_id UUID REFERENCES ai_models(id),
  qa_build_id UUID REFERENCES builds(id),
  
  -- Build info
  build_log TEXT,
  build_duration_minutes INT,
  test_coverage NUMERIC(5,2),
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deployed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_integration_builds_workspace_id ON integration_builds(workspace_id);
CREATE INDEX idx_integration_builds_status ON integration_builds(status);
CREATE INDEX idx_integration_builds_created_at ON integration_builds(created_at);

CREATE TABLE build_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_build_id UUID NOT NULL REFERENCES integration_builds(id),
  artifact_type artifact_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  checksum VARCHAR(255),
  download_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_build_artifacts_integration_build_id ON build_artifacts(integration_build_id);
CREATE INDEX idx_build_artifacts_artifact_type ON build_artifacts(artifact_type);

-- ============================================
-- CLIENT PORTAL TABLES
-- ============================================

CREATE TYPE client_access_type AS ENUM ('read_only', 'feedback', 'approval');

CREATE TABLE client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  access_type client_access_type DEFAULT 'read_only',
  shared_projects UUID[] DEFAULT '{}',
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_client_access_org_id ON client_access(org_id);
CREATE INDEX idx_client_access_user_id ON client_access(user_id);

CREATE TABLE client_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  resource_id UUID NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_feedback_workspace_id ON client_feedback(workspace_id);
CREATE INDEX idx_client_feedback_user_id ON client_feedback(user_id);

-- ============================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their organization's data
CREATE POLICY "users_see_own_org_users"
ON users
FOR SELECT
USING (
  org_id = (SELECT org_id FROM users WHERE id = auth.uid() LIMIT 1)
);

-- Workspaces are visible to users with access
CREATE POLICY "users_see_accessible_workspaces"
ON workspaces
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workspace_access
    WHERE workspace_access.workspace_id = workspaces.id
    AND workspace_access.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.org_id = workspaces.org_id
  )
);

-- Audit logs are visible to admins and the user who performed the action
CREATE POLICY "admins_and_self_see_audit_logs"
ON audit_logs
FOR SELECT
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.id = auth.uid()
    AND r.role_level IN ('super_admin', 'org_admin')
  )
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's organization
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
SELECT org_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION has_permission(p_permission TEXT)
RETURNS BOOLEAN AS $$
SELECT EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid()
  AND r.permissions @> jsonb_build_object(p_permission, true)
)
$$ LANGUAGE SQL STABLE;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_change_summary JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_log_id UUID;
BEGIN
  -- Get user's organization
  v_org_id := (SELECT org_id FROM users WHERE id = auth.uid());
  
  -- Insert audit log
  INSERT INTO audit_logs (
    org_id, user_id, action, resource_type, resource_id, change_summary
  ) VALUES (
    v_org_id, auth.uid(), p_action, p_resource_type, p_resource_id, p_change_summary
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_update_timestamp
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER roles_update_timestamp
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER workspaces_update_timestamp
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create default system roles
INSERT INTO roles (org_id, name, description, role_level, is_system, permissions)
VALUES 
  (NULL, 'Super Admin', 'Platform administrator with full access', 'super_admin', TRUE, '{"*": true}'::jsonb),
  (NULL, 'Admin', 'Organization administrator', 'org_admin', TRUE, '{"users:manage": true, "workspaces:manage": true, "roles:manage": true}'::jsonb),
  (NULL, 'Lead', 'Workspace lead/manager', 'workspace_lead', TRUE, '{"workspace:edit": true, "workspace:invite": true}'::jsonb),
  (NULL, 'User', 'Regular workspace user', 'workspace_user', TRUE, '{"workspace:view": true, "workspace:edit": true}'::jsonb),
  (NULL, 'Client', 'External client with read-only access', 'client_user', TRUE, '{"workspace:view": true}'::jsonb);

-- ============================================
-- DOCUMENTATION
-- ============================================

/*
SCHEMA SUMMARY:
- Organizations: Multi-tenant root
- Users: Team members with organization membership
- Roles: RBAC with permissions and role levels
- Workspaces: 5 domain-specific work areas
- Approvals: Admin approval workflow
- Audit Logs: Comprehensive activity tracking
- Workspace-Specific: Designer, Analyst, QA, AI, Integration tables
- Client: Client portal and feedback

KEY FEATURES:
✓ Multi-tenancy with row-level security
✓ Role-based access control (RBAC)
✓ Admin approval workflows
✓ Comprehensive audit logging
✓ Workspace isolation
✓ Real-time collaboration support
✓ Client portal integration
✓ Extensible permission system

RUN THIS SCRIPT:
1. Connect to Supabase PostgreSQL
2. Run all SQL statements
3. Verify tables created: SELECT * FROM information_schema.tables WHERE table_schema = 'public';
4. Test RLS policies
5. Seed initial data as needed
*/

