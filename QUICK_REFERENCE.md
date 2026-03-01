# Quick Reference Guide

## Essential Commands

### Development Setup
```bash
# Initial setup
npm install
cp .env.example .env.local
docker-compose up -d
npm run db:migrate --workspace=backend

# Start development
npm run dev                    # Start all services
npm run dev --workspace=backend  # Start backend only
npm run dev --workspace=frontend # Start frontend only
```

### Database Operations
```bash
npm run db:migrate --workspace=backend    # Run migrations
npm run db:seed --workspace=backend       # Seed with test data
npm run db:reset --workspace=backend      # Reset DB (dev only!)
```

### Testing
```bash
npm run test                   # Test all workspaces
npm run test:unit             # Unit tests only
npm run test:coverage         # Coverage report
npm run test:e2e              # E2E tests
```

### Code Quality
```bash
npm run lint                   # Lint all code
npm run format                 # Format code
npm run type-check             # TypeScript check
```

### Docker
```bash
docker-compose up -d           # Start services
docker-compose down            # Stop services
docker-compose logs -f         # View logs
docker-compose restart redis   # Restart specific service
```

---

## 🌐 Localhost Servers & Ports

Your SaaS platform runs on these local services:

| Service | Port | URL | Type |
|---------|------|-----|------|
| **Frontend** | 5173 | http://localhost:5173 | React + Vite Web App |
| **Backend API** | 3000 | http://localhost:3000 | Express REST API |
| **Health Check** | 3000 | http://localhost:3000/health | API Status |
| **PostgreSQL** | 5432 | localhost:5432 | Database |
| **Redis** | 6379 | localhost:6379 | Cache |

**Quick Start:**
```bash
npm install
docker-compose up -d
npm run dev
```

Then open: **http://localhost:5173** in your browser

---

## 🔌 Supabase Integration

Your Supabase project is connected for authentication and database:

```
Project URL: https://yvaidjzhhejrfgpovzmm.supabase.co
Dashboard: https://app.supabase.com/project/yvaidjzhhejrfgpovzmm
Frontend Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Features Available:**
- PostgreSQL Database
- User Authentication
- File Storage
- Real-time Subscriptions
- Edge Functions

**Access Dashboard:** https://app.supabase.com

---

## 🚀 Vercel Deployment

Configured for automatic deployment:

```
GitHub Repo: markallan-official/AI-dev-saas-platform
Vercel Project: Auto-linked from GitHub
Build: npm run build
Output: frontend/dist
```

**Deploy to Vercel:**
1. Push to GitHub
2. Vercel auto-deploys
3. Frontend available at: https://your-domain.vercel.app

See: `docs/VERCEL_DEPLOYMENT.md` for detailed setup

---

## Project Structure Quick Navigation

```
Key Directories:
  /docs                - Documentation (START HERE!)
  /backend/src         - Backend API code
  /frontend/src        - React components
  /infrastructure      - K8s, Docker, Terraform configs

Important Files:
  README.md            - Project overview
  SETUP_GUIDE.md       - Complete setup & connection guide
  .env.local           - Environment (with Supabase creds)
  .env.example         - Environment template
  docker-compose.yml   - Local dev setup
```

---

## Architecture At a Glance

### Workspaces
1. **Designer** - Asset creation, design management
2. **Analyst** - Architecture, documentation, specs
3. **QA** - Testing, builds, defects
4. **AI** - Model development, training, deployment
5. **Integration** - Central assembly, releases

### Key Features
- ✅ Real-time collaboration
- ✅ Multi-factor authentication
- ✅ Role-based access control
- ✅ Complete audit logging
- ✅ Scalable to 100,000+ users

---

## URLs in Development

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | 🎨 React Web App |
| **Backend API** | http://localhost:3000 | 🔌 REST API |
| **Health Check** | http://localhost:3000/health | ✅ API Status |
| **Supabase Dashboard** | https://app.supabase.com | 🗄️ Database & Auth |
| **API Docs** | http://localhost:3000/api/docs | 📖 API Documentation |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |
| pgAdmin* | http://localhost:5050 | DB management |
| Redis Commander* | http://localhost:8081 | Cache management |

*Requires: `docker-compose --profile tools up -d`

---

## Default Test Credentials

```
Admin:
  Email: admin@example.com
  Pass: Admin@123!

Designer:
  Email: designer@example.com
  Pass: Designer@123!

Analyst:
  Email: analyst@example.com
  Pass: Analyst@123!

QA:
  Email: qa@example.com
  Pass: QA@123!

AI Engineer:
  Email: ai@example.com
  Pass: AI@123!
```

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Redux, MaterialUI |
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | PostgreSQL 15 |
| Cache | Redis |
| Message Queue | Kafka (optional) |
| Real-time | Socket.IO |
| Container | Docker |
| Orchestration | Kubernetes |
| Build | Vite (frontend), TypeScript (backend) |
| Testing | Jest, Vitest, Playwright |

---

## Common Development Tasks

### Adding a New API Endpoint

```typescript
// backend/src/routes/designers.ts
app.post('/api/v1/designer/assets', authenticate, authorize('asset:create'), (req, res) => {
  // Implementation
});
```

### Creating a New React Component

```typescript
// frontend/src/components/AssetUpload.tsx
import React from 'react';

const AssetUpload: React.FC = () => {
  return <div>Asset Upload Component</div>;
};

export default AssetUpload;
```

### Adding a Database Table

1. Create migration file: `backend/migrations/001_create_table.sql`
2. Update Prisma schema: `backend/prisma/schema.prisma`
3. Run: `npm run db:migrate --workspace=backend`

---

## Debugging Tips

### Backend Not Starting?
```bash
# Check port 3000 is free
lsof -ti:3000 | xargs kill -9

# Check environment variables
cat .env.local | grep DATABASE_URL

# Check database connection
psql postgresql://postgres:postgres@localhost:5432/saas_dev
```

### Frontend Not Loading?
```bash
# Clear cache and node_modules
rm -rf node_modules/.vite
npm run build --workspace=frontend

# Check port 5173 is free
lsof -ti:5173 | xargs kill -9
```

### Database Issues?
```bash
# Check PostgreSQL running
docker-compose logs postgres

# Restart database
docker-compose restart postgres
docker-compose exec postgres psql -U postgres -d saas_dev -c "SELECT 1"

# Reset database (WARNING - loses data!)
npm run db:reset --workspace=backend
```

---

## Security Checklist

Before committing code:
- [ ] No secrets in `.env.local` committed
- [ ] All inputs validated
- [ ] Authentication checks in place
- [ ] Authorization enforced
- [ ] Error messages don't leak details
- [ ] Sensitive data logged as `***`

Before deployment:
- [ ] All tests passing
- [ ] Linting passes
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Environment variables configured
- [ ] Database backups verified

---

## Documentation Map

**For Understanding the Platform:**
1. Start → `README.md`
2. Architecture → `docs/architecture/SYSTEM_ARCHITECTURE.md`
3. Database → `docs/database/SCHEMA.md`

**For Development:**
1. Guidelines → `.github/copilot-instructions.md`
2. Tech Stack → `docs/TECH_STACK.md`
3. User Flows → `docs/diagrams/USER_FLOWS.md`

**For Operations:**
1. Deployment → `docs/DEPLOYMENT.md`
2. Scaling → `docs/SCALABILITY.md`
3. Security → `docs/security/SECURITY_ARCHITECTURE.md`

---

## Performance Optimization Tips

### Frontend
- Use React DevTools profiler
- Check bundle size: `npm run build`
- Enable source maps for debugging
- Use React.memo for expensive components

### Backend
- Monitor slow queries: `EXPLAIN ANALYZE`
- Check Redis hit rate: `redis-cli INFO stats`
- Use connection pooling
- Add database indexes

### Infrastructure
- Monitor pod resources: `kubectl top pods`
- Check cache eviction: `redis-cli INFO memory`
- Review CloudWatch metrics
- Check log aggregation

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: Add new capability"

# Push and create PR
git push origin feature/my-feature

# Commit message format
feat: Add user authentication       # New feature
fix: Fix login bug                 # Bug fix
docs: Update README                 # Documentation
style: Format code                  # Formatting
refactor: Reorganize modules        # Code restructure
test: Add login tests              # Tests
chore: Update dependencies          # Maintenance
```

---

## Useful Commands Reference

```bash
# View logs
docker-compose logs -f [service]
kubectl logs -f deployment/backend -n production

# Check service health
curl http://localhost:3000/health

# Database queries
psql -h localhost -U postgres -d saas_dev
  \dt                    # List tables
  \d table_name         # Describe table
  SELECT * FROM users;  # Query

# Redis commands
redis-cli ping
redis-cli keys '*'
redis-cli TTL key_name

# Kubernetes
kubectl get pods -n production
kubectl describe pod [pod-name] -n production
kubectl logs [pod-name] -n production
kubectl exec -it [pod-name] -- /bin/bash
```

---

## Architecture Decision Records (ADRs)

**Why TypeScript?**
- Type safety reduces bugs
- Better IDE support
- Frontend and backend unified language

**Why PostgreSQL?**
- ACID compliance for critical data
- JSON support for flexibility
- Row-level security features

**Why Kubernetes?**
- Industry standard for scaling
- Self-healing capabilities
- Multi-region support

**Why Socket.IO?**
- Cross-browser WebSocket support
- Fallback mechanisms
- Proven in production

---

## Emergency Procedures

### Service Down
1. Check service status: `kubectl get pods`
2. Check logs: `kubectl logs <pod>`
3. Restart service: `kubectl rollout restart deployment/backend`
4. If issue persists, rollback: `kubectl rollout undo deployment/backend`

### Database Down
1. Check connection: `psql -h localhost -c "SELECT 1"`
2. Restore from backup: Check AWS RDS console
3. Verify data integrity after restore

### High Error Rates
1. Check logs for errors: `kubectl logs -f deployment/backend`
2. Monitor resources: `kubectl top pods`
3. Scale if needed: `kubectl scale deployment backend --replicas=5`
4. Check dependencies (Redis, DB, Kafka)

---

## Contact & Help

- Documentation: See `/docs` directory
- Development Issues: Check `.github/copilot-instructions.md`
- Architecture Questions: Review `docs/architecture/SYSTEM_ARCHITECTURE.md`
- Security Concerns: See `docs/security/SECURITY_ARCHITECTURE.md`

---

**Quick Start Time**: ~15 minutes  
**First Deploy Time**: ~1 hour  
**Learning Curve**: Moderate (comprehensive docs provided)

---

*Last Updated: February 25, 2026*
