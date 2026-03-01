# Database Schema Design

## Overview

This document defines the complete data model for the collaborative development platform, optimized for PostgreSQL with support for multi-tenancy, role-based access control, and audit trailing.

## Core Entities

### 1. Organizations & Tenancy

```sql
-- Organizations (Multi-tenancy root)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  brand_color_primary VARCHAR(7) DEFAULT '#0066FF',  -- Blue
  brand_color_secondary VARCHAR(7) DEFAULT '#FF0000', -- Red
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT brand_color_format CHECK (
    brand_color_primary ~ '^#[0-9A-F]{6}$' AND
    brand_color_secondary ~ '^#[0-9A-F]{6}$'
  )
);

-- Organization Settings
CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  max_users INT DEFAULT 100,
  max_workspaces INT DEFAULT 10,
  enable_api_access BOOLEAN DEFAULT true,
  enable_sso BOOLEAN DEFAULT false,
  ip_whitelist TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Users & Authentication

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended, deactivated
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(organization_id, email),
  INDEX idx_organization_email (organization_id, email),
  INDEX idx_user_status (status)
);

-- Auth Sessions
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  refresh_token_hash VARCHAR(255) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,
  
  INDEX idx_session_user (user_id),
  INDEX idx_session_expiry (expires_at)
);

-- Email Verification Tokens
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_token_user (user_id)
);
```

### 3. Teams & Organizational Structure

```sql
-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  UNIQUE(organization_id, name),
  INDEX idx_team_org (organization_id)
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- lead, member, observer
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by UUID REFERENCES users(id),
  
  UNIQUE(team_id, user_id),
  INDEX idx_member_team (team_id),
  INDEX idx_member_user (user_id)
);
```

### 4. Roles & Permissions

```sql
-- Role Definitions
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  workspace_type VARCHAR(50), -- 'designer', 'analyst', 'qa', 'ai', 'integration', 'admin', 'client'
  is_system BOOLEAN DEFAULT false, -- System roles cannot be modified
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(organization_id, name),
  INDEX idx_role_workspace (workspace_type)
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'workspace', 'admin', 'collaboration', 'integration'
  resource_type VARCHAR(50), -- 'asset', 'test', 'model', 'document', 'org'
  action VARCHAR(20), -- 'create', 'read', 'update', 'delete', 'execute'
  
  UNIQUE(resource_type, action)
);

-- Role Permissions (Junction)
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(role_id, permission_id),
  INDEX idx_role_perm (role_id)
);

-- User Roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),
  expires_at TIMESTAMP, -- Optional: time-limited role assignment
  
  UNIQUE(user_id, role_id),
  INDEX idx_user_role (user_id),
  INDEX idx_role_user (role_id)
);
```

### 5. Workspaces

```sql
-- Workspaces (Role-specific isolated environments)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  workspace_type VARCHAR(50) NOT NULL, -- 'designer', 'analyst', 'qa', 'ai', 'integration'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  UNIQUE(organization_id, name, workspace_type),
  INDEX idx_workspace_org (organization_id),
  INDEX idx_workspace_type (workspace_type),
  INDEX idx_workspace_team (team_id)
);

-- Workspace Permissions (User-to-Workspace access)
CREATE TABLE workspace_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level VARCHAR(50) NOT NULL, -- 'viewer', 'contributor', 'admin'
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID REFERENCES users(id),
  expires_at TIMESTAMP,
  
  UNIQUE(workspace_id, user_id),
  INDEX idx_access_workspace (workspace_id),
  INDEX idx_access_user (user_id),
  INDEX idx_access_expiry (expires_at)
);

-- Workspace Settings
CREATE TABLE workspace_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  max_collaborators INT DEFAULT 50,
  retention_days INT DEFAULT 90,
  enable_version_control BOOLEAN DEFAULT true,
  enable_real_time_collaboration BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Approval & Onboarding

```sql
-- Approval Requests
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL, -- 'user_signup', 'role_change', 'workspace_access', 'external_access'
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_email VARCHAR(255),
  requestee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  details JSONB,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  
  INDEX idx_approval_org (organization_id),
  INDEX idx_approval_status (status),
  INDEX idx_approval_requester (requester_id)
);
```

### 7. Designer Workspace Entities

```sql
-- Design Projects
CREATE TABLE design_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  UNIQUE(workspace_id, name),
  INDEX idx_project_workspace (workspace_id)
);

-- Design Artboards
CREATE TABLE design_artboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES design_projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  width INT,
  height INT,
  content JSONB, -- Serialized canvas state
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id),
  
  INDEX idx_artboard_project (project_id)
);

-- Design Assets
CREATE TABLE design_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50), -- 'image', 'vector', 'model_3d', 'icon', 'component'
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  INDEX idx_asset_workspace (workspace_id),
  INDEX idx_asset_type (asset_type)
);

-- Asset Versions
CREATE TABLE design_asset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES design_assets(id) ON DELETE CASCADE,
  version INT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  change_notes TEXT,
  
  UNIQUE(asset_id, version),
  INDEX idx_version_asset (asset_id)
);
```

### 8. Analyst Workspace Entities

```sql
-- Architecture Documents
CREATE TABLE architecture_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB, -- Document structure
  status VARCHAR(50) DEFAULT 'draft', -- draft, review, published
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  INDEX idx_doc_workspace (workspace_id),
  INDEX idx_doc_status (status)
);

-- Data Models
CREATE TABLE data_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  schema JSONB, -- Entity definitions
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  UNIQUE(workspace_id, name),
  INDEX idx_model_workspace (workspace_id)
);

-- API Specifications
CREATE TABLE api_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specification JSONB, -- OpenAPI/GraphQL spec
  version VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  UNIQUE(workspace_id, name),
  INDEX idx_spec_workspace (workspace_id)
);
```

### 9. QA Workspace Entities

```sql
-- Test Cases
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  test_type VARCHAR(50), -- 'unit', 'integration', 'e2e', 'performance', 'security'
  steps JSONB,
  expected_result TEXT,
  priority VARCHAR(20), -- 'critical', 'high', 'medium', 'low'
  status VARCHAR(50) DEFAULT 'new', -- new, ready, running, passed, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  INDEX idx_test_workspace (workspace_id),
  INDEX idx_test_type (test_type)
);

-- Test Results
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  build_id UUID,
  status VARCHAR(50), -- 'passed', 'failed', 'skipped', 'error'
  execution_time_ms INT,
  error_message TEXT,
  assertions_passed INT,
  assertions_total INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  run_by UUID REFERENCES users(id),
  
  INDEX idx_result_test (test_case_id),
  INDEX idx_result_build (build_id)
);

-- Builds
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  build_number INT NOT NULL,
  version VARCHAR(50),
  status VARCHAR(50), -- 'queued', 'running', 'passed', 'failed', 'released'
  artifact_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  triggered_by UUID REFERENCES users(id),
  
  UNIQUE(workspace_id, build_number),
  INDEX idx_build_workspace (workspace_id),
  INDEX idx_build_status (status)
);

-- Defects
CREATE TABLE defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20), -- 'critical', 'major', 'minor', 'trivial'
  status VARCHAR(50) DEFAULT 'new', -- new, assigned, in_progress, resolved, closed
  test_case_id UUID REFERENCES test_cases(id),
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  
  INDEX idx_defect_workspace (workspace_id),
  INDEX idx_defect_status (status),
  INDEX idx_defect_severity (severity)
);
```

### 10. AI Workspace Entities

```sql
-- AI Models
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model_type VARCHAR(50), -- 'classification', 'regression', 'nlp', 'vision', 'custom'
  version VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft', -- draft, training, testing, production, archived
  performance_metrics JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  UNIQUE(workspace_id, name, version),
  INDEX idx_model_workspace (workspace_id)
);

-- Training Jobs
CREATE TABLE training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'queued', -- queued, running, completed, failed
  parameters JSONB,
  metrics JSONB,
  logs TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  INDEX idx_job_model (model_id),
  INDEX idx_job_status (status)
);

-- Model Deployments
CREATE TABLE model_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  environment VARCHAR(50), -- 'staging', 'production'
  deployed_url TEXT,
  status VARCHAR(50), -- 'active', 'inactive', 'rollback'
  deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deployed_by UUID REFERENCES users(id),
  
  INDEX idx_deployment_model (model_id)
);
```

### 11. Integration Workspace & Build Management

```sql
-- Integration Builds (Combined release artifacts)
CREATE TABLE integration_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  build_version VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'assembling', -- assembling, validated, staged, released
  designer_output_ids UUID[],
  analyst_output_ids UUID[],
  qa_output_ids UUID[],
  ai_output_ids UUID[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  UNIQUE(workspace_id, build_version),
  INDEX idx_integ_build_workspace (workspace_id),
  INDEX idx_integ_build_status (status)
);

-- Build Artifacts
CREATE TABLE build_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_build_id UUID NOT NULL REFERENCES integration_builds(id) ON DELETE CASCADE,
  artifact_type VARCHAR(50), -- 'asset', 'spec', 'test_result', 'model'
  source_workspace_id UUID,
  artifact_reference_id UUID,
  artifact_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_artifact_build (integration_build_id)
);
```

### 12. Client Portal Entities

```sql
-- Client Accounts
CREATE TABLE client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(organization_id, email),
  INDEX idx_client_org (organization_id)
);

-- Preview Deployments
CREATE TABLE preview_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_build_id UUID REFERENCES integration_builds(id),
  deployment_url TEXT,
  status VARCHAR(50), -- 'staging', 'live', 'archived'
  deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  INDEX idx_deploy_org (organization_id)
);

-- Feedback Submissions
CREATE TABLE feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submission_type VARCHAR(50), -- 'feedback', 'issue', 'feature_request'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  attachments JSONB,
  submitted_by VARCHAR(255), -- Email (client may not have user account)
  status VARCHAR(50) DEFAULT 'new', -- new, triaged, in_progress, resolved, closed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  
  INDEX idx_feedback_org (organization_id),
  INDEX idx_feedback_status (status)
);
```

### 13. Audit & Logging

```sql
-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_audit_org (organization_id),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_resource (resource_type, resource_id),
  INDEX idx_audit_timestamp (created_at)
);

-- Activity Logs
CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activity_type VARCHAR(50),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_activity_workspace (workspace_id),
  INDEX idx_activity_timestamp (created_at)
);
```

## Indexes & Optimization

### Primary Indexes
- All UUID primary keys have implicit B-tree indexes
- Foreign keys indexed by default
- Composite indexes on frequently filtered columns

### Query Optimization Strategies
1. **Connection Pooling**: PgBouncer for connection management
2. **Query Caching**: Redis for frequently accessed data
3. **Materialized Views**: For complex reports
4. **Partitioning**: Audit logs and activity logs by date

## Data Retention & Archival

- Soft deletes via `deleted_at` timestamp
- Audit logs retained for 365 days minimum
- Activity logs archived after 90 days
- Design versions retained for 180 days
- Old build artifacts archived to cold storage after 30 days

## Scalability Considerations

- **Horizontal Read Scaling**: Read replicas for reporting
- **Sharding Strategy**: By `organization_id` for multi-tenant scaling
- **Archive Tables**: Historical data moved to separate schema
- **Partitioning**: Logs partitioned by date

---

**Version**: 1.0  
**Last Updated**: February 25, 2026
