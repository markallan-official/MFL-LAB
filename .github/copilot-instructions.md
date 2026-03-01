# SaaS Collaborative Platform - Copilot Instructions

## Project Overview

This is an enterprise SaaS platform for collaborative development of complex applications (AAA games, enterprise software) with role-segregated workspaces and centralized integration.

## Technology Stack

- **Frontend**: React 18, TypeScript, Redux Toolkit, Material-UI, Vite, Socket.IO
- **Backend**: Node.js 18 LTS, Express, TypeScript, Prisma, PostgreSQL, Redis, Kafka
- **Infrastructure**: Docker, Kubernetes, AWS/Azure, Terraform
- **Testing**: Jest, Playwright, Vitest

## Project Structure

```
├── docs/                    # Documentation
│   ├── architecture/       # System architecture docs
│   ├── database/          # Database schema docs
│   ├── security/          # Security architecture
│   ├── diagrams/          # User flow & system diagrams
│   ├── TECH_STACK.md      # Technology decisions
│   ├── SCALABILITY.md     # Scaling strategy
│   └── README.md          # Main documentation
├── backend/                # Node.js Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── utils/
│   │   └── server.ts
│   ├── tests/
│   ├── migrations/
│   ├── .env.example
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   ├── .env.example
│   └── package.json
├── shared/                 # Shared TypeScript types & utilities
│   ├── src/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── infrastructure/         # Infrastructure as Code
│   ├── docker/            # Docker configurations
│   ├── k8s/               # Kubernetes manifests
│   └── terraform/         # Terraform modules
├── docker-compose.yml      # Local dev environment
├── .env.example           # Environment variables template
└── package.json          # Root workspace configuration

```

## Development Workspace Setup

### Workspaces

1. **Graphic Designer Workspace**
   - Component: `frontend/src/pages/workspaces/DesignerWorkspace.tsx`
   - API: `backend/src/routes/designer/`
   - Database: `design_projects`, `design_assets`, `design_artboards`

2. **System Analyst Workspace**
   - Component: `frontend/src/pages/workspaces/AnalystWorkspace.tsx`
   - API: `backend/src/routes/analyst/`
   - Database: `architecture_documents`, `data_models`, `api_specifications`

3. **QA/Testing Workspace**
   - Component: `frontend/src/pages/workspaces/QAWorkspace.tsx`
   - API: `backend/src/routes/qa/`
   - Database: `test_cases`, `test_results`, `builds`, `defects`

4. **AI Builder Workspace**
   - Component: `frontend/src/pages/workspaces/AIWorkspace.tsx`
   - API: `backend/src/routes/ai/`
   - Database: `ai_models`, `training_jobs`, `model_deployments`

5. **Integration Workspace**
   - Component: `frontend/src/pages/workspaces/IntegrationWorkspace.tsx`
   - API: `backend/src/routes/integration/`
   - Database: `integration_builds`, `build_artifacts`

### Admin Panel

- Component: `frontend/src/pages/admin/`
- API: `backend/src/routes/admin/`
- Features: Approval workflows, user management, activity monitoring

### Client Portal

- Component: `frontend/src/pages/client/`
- API: `backend/src/routes/client/`
- Features: Read-only dashboard, feedback submission

## Key Development Guidelines

### Code Organization

- **Single Responsibility Principle**: Each file should have one purpose
- **Type Safety**: Always use TypeScript types, avoid `any`
- **Component Composition**: Prefer composition over inheritance
- **Error Handling**: Use consistent error handling patterns (Result types or exceptions)

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions**: camelCase (e.g., `getUserById()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Database Tables**: snake_case (e.g., `design_assets`)
- **API Endpoints**: kebab-case (e.g., `/api/v1/design-assets`)

### Backend Best Practices

1. **API Versioning**: Use `/api/v1/` prefix
2. **Authentication**: Check `req.user` from JWT middleware
3. **Authorization**: Use RBAC middleware for permissions
4. **Validation**: Use Zod schemas for input validation
5. **Error Responses**: Use consistent error format with status codes
6. **Logging**: Use Winston for structured logging
7. **Database**: Use Prisma with migrations

### Frontend Best Practices

1. **Component Hooks**: Use functional components with React hooks
2. **State Management**: Redux for global, React hooks for local
3. **Server State**: React Query for API caching
4. **Styling**: Material-UI components with theme customization
5. **TypeScript**: Strong typing for props and state
6. **Testing**: React Testing Library for unit tests
7. **Accessibility**: WCAG 2.1 AA compliance target

### Security Practices

1. **Authentication**: Enforce OAuth 2.0 + JWT flow
2. **Authorization**: Always validate user permissions before operations
3. **Input Validation**: Validate and sanitize all inputs
4. **API Security**: Rate limiting, CORS, HTTPS/TLS
5. **Secrets**: Never hardcode secrets, use environment variables
6. **Data Protection**: Encrypt sensitive data, use HTTPS everywhere
7. **Audit**: Log all significant actions with user context

## Database Schema

The schema is defined in `docs/database/SCHEMA.md`. Key entities:

- `organizations`: Multi-tenancy root
- `users`, `roles`, `permissions`: Authentication & authorization
- `workspaces`, `workspace_access`: Workspace isolation
- `design_*`: Designer workspace tables
- `test_cases`, `builds`, `defects`: QA workspace tables
- `ai_models`, `training_jobs`: AI workspace tables
- `audit_logs`: Security audit trail

## API Specification

RESTful API with OpenAPI documentation. Key endpoints:

**Authentication**
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/mfa/verify` - MFA verification
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Token refresh

**Workspaces**
- `GET /api/v1/workspaces` - List user workspaces
- `POST /api/v1/workspaces/:id/assets` - Upload asset
- `GET /api/v1/workspaces/:id/assets` - List workspace assets

**Admin**
- `GET /api/v1/admin/approvals` - List pending approvals
- `POST /api/v1/admin/approvals/:id/approve` - Approve request
- `GET /api/v1/admin/activity` - View activity logs

See `docs/` for API documentation.

## UI Design System

### Colors (Hexagonal Theme)

- **Primary Blue**: `#0066FF`
- **Secondary Red**: `#FF0000`
- **Light Background**: `#F5F5F5`
- **Dark Text**: `#1A1A1A`

### Hexagon Components

The UI uses a hexagonal grid-based layout for workspace selection:

```
    /\
   /  \
  / WS1 \
  \    /
   \  /
    \/

Each workspace is a clickable hexagon
```

Implemented as:
- `HexagonContainer.tsx`: Grid layout
- `HexagonCell.tsx`: Individual hexagon
- `HexagonNav.tsx`: Navigation

## Common Tasks

### Running Development Environment

```bash
# Start all services (includes Docker)
docker-compose up -d

# Start API server
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Run tests
npm run test --workspaces

# Run linting
npm run lint --workspaces
```

### Adding a New Workspace Module

1. Create workspace component: `frontend/src/pages/workspaces/YourWorkspace.tsx`
2. Add routes: `backend/src/routes/your-workspace/`
3. Add database tables: `backend/migrations/create_your_workspace_tables.sql`
4. Add API documentation
5. Update admin panel for access control
6. Add tests

### Adding a New Database Table

1. Create migration: `backend/migrations/`
2. Update Prisma schema: `backend/prisma/schema.prisma`
3. Run: `npm run db:migrate`
4. Update TypeScript types in `shared/src/types/`
5. Add API endpoints

### Accessing Local Services

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **Swagger UI**: http://localhost:3000/api/swagger
- **PostgreSQL**: localhost:5432 (postgres/postgres)
- **Redis**: localhost:6379
- **pgAdmin** (optional): http://localhost:5050 (admin@example.com/admin)

## Testing Strategy

- **Unit Tests**: Jest for functions and components
- **Integration Tests**: Jest with database
- **E2E Tests**: Playwright for user flows
- **Coverage Target**: >80% unit, >60% integration

```bash
# Run specific test suite
npm run test -- WorkspaceComponent.test.tsx

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Deployment

### Local Deployment

```bash
# Build all packages
npm run build

# Build Docker image
docker build -f infrastructure/docker/Dockerfile.prod -t saas-platform:latest .

# Run container
docker run -p 8000:3000 saas-platform:latest
```

### Cloud Deployment

See `infrastructure/k8s/` for Kubernetes manifests.

```bash
# Deploy to EKS
kubectl apply -f infrastructure/k8s/

# Check deployment status
kubectl get pods -n default
```

## Troubleshooting

### PostgreSQL Connection Refused
```bash
docker-compose ps
docker-compose logs postgres
docker-compose restart postgres
```

### Redis Connection Failed
```bash
redis-cli -h localhost ping
docker-compose restart redis
```

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
```

### Database Migration Issues
```bash
# Reset database (dev only!)
npm run db:reset --workspace=backend

# Run migrations
npm run db:migrate --workspace=backend
```

## Git Workflow

1. Create feature branch: `git checkout -b feature/workspace-enhancements`
2. Make changes
3. Commit with conventional commits: `git commit -m "feat: Add designer canvas"`
4. Push: `git push origin feature/workspace-enhancements`
5. Create Pull Request
6. Get reviewed and merge

Conventional commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructure
- `test`: Tests
- `chore`: Maintenance

## Resources

- [System Architecture](../docs/architecture/SYSTEM_ARCHITECTURE.md)
- [Database Schema](../docs/database/SCHEMA.md)
- [Tech Stack](../docs/TECH_STACK.md)
- [Security](../docs/security/SECURITY_ARCHITECTURE.md)
- [Scalability](../docs/SCALABILITY.md)
- [User Flows](../docs/diagrams/USER_FLOWS.md)

## Important Notes

⚠️ **Before deployment:**
- Always run tests: `npm run test`
- Lint code: `npm run lint`
- Check security: Run dependency scan
- Verify environment variables are set
- Test in staging first

⚠️ **Security:**
- Never commit `.env` files with real secrets
- Always use HTTPS in production
- Enable MFA for all admin accounts
- Rotate secrets regularly

## Questions or Issues?

- Check documentation first
- Search existing issues/discussions
- Create a detailed issue with reproduction steps
- Ask in team discussions

---

**Last Updated**: February 25, 2026  
**Version**: 1.0  
**Maintained By**: Platform Architecture Team
