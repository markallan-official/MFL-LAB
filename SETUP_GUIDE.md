# Complete Setup & Connection Guide

## 🔌 Localhost Servers & Ports

Your SaaS platform runs on three local services:

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Frontend** (React + Vite) | 5173 | http://localhost:5173 | User interface |
| **Backend** (Express + Node.js) | 3000 | http://localhost:3000 | REST API & WebSockets |
| **Database** (PostgreSQL) | 5432 | localhost:5432 | Data persistence |
| **Cache** (Redis) | 6379 | localhost:6379 | Session & data cache |

## 🚀 Local Development Startup

### Prerequisites

**Install Node.js 18 LTS and npm:**
```bash
# Verify installation
node --version
npm --version
```

**Install Docker & Docker Compose:**
```bash
# Required for PostgreSQL and Redis
docker-compose --version
```

### 1️⃣ Install Dependencies

```bash
# From root directory
npm install --legacy-peer-deps
```

### 2️⃣ Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and other services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3️⃣ Configure Environment

```bash
# Copy .env.local if needed (already created with Supabase creds)
cp .env.example .env.local

# Verify Supabase credentials are in .env.local:
# SUPABASE_URL=https://yvaidjzhhejrfgpovzmm.supabase.co
# SUPABASE_ANON_KEY=eyJhbGc...
```

### 4️⃣ Run Development Servers

**Option A: Run both from root**
```bash
npm run dev
```

**Option B: Run separately from different terminals**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 5️⃣ Verify Everything Works

**Test Frontend:**
- Open http://localhost:5173 in browser
- Should see: "Welcome to SaaS Collaborative Platform"
- See 5 workspace options

**Test Backend:**
```bash
# Health check endpoint
curl http://localhost:3000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-02-25T10:00:00.000Z",
  "uptime": 123.45
}
```

**Test Supabase Connection:**
- Frontend connects to Supabase on startup
- Backend uses Supabase for authentication and data
- Check browser console (F12) for connection status

## 🗄️ Supabase Configuration

### Your Supabase Project

```
Project URL: https://yvaidjzhhejrfgpovzmm.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Publishable Key: sb_publishable_MbYZjFMXfU2r0kkeLsHC8A_RBgdHLKu
```

### Access Supabase Dashboard

1. Go to: https://app.supabase.com
2. Login with credentials
3. Select project: **yvaidjzhhejrfgpovzmm**
4. Access services:
   - **Auth**: Manage users and authentication
   - **Database**: View and manage PostgreSQL tables
   - **Storage**: File management
   - **Realtime**: WebSocket subscriptions
   - **Edge Functions**: Backend functions

### Frontend Integration

```typescript
// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://yvaidjzhhejrfgpovzmm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);
```

**Usage Example:**
```typescript
// Sign up user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
});

// Insert data
await supabase
  .from('users')
  .insert({ email: 'user@example.com' });

// Real-time subscription
supabase
  .on('*', { event: 'INSERT', schema: 'public', table: 'users' },
    payload => console.log('New user:', payload))
  .subscribe();
```

### Backend Integration

```typescript
// backend/src/config/supabase.ts
export const supabase = createClient(
  'https://yvaidjzhhejrfgpovzmm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);
```

## 🌐 API Communication

### How Frontend Connects to Backend

```
Frontend (localhost:5173)
    ↓ HTTP requests
Backend (localhost:3000)
    ↓ API calls
Supabase (Auth + Database)
```

### API Endpoints

**Health Check:**
```
GET http://localhost:3000/health
```

**Authentication:**
```
POST http://localhost:3000/api/v1/auth/signup
POST http://localhost:3000/api/v1/auth/login
POST http://localhost:3000/api/v1/auth/logout
```

**Workspaces:**
```
GET http://localhost:3000/api/v1/workspaces
POST http://localhost:3000/api/v1/workspaces/{id}/assets
GET http://localhost:3000/api/v1/workspaces/{id}/assets
```

**Admin:**
```
GET http://localhost:3000/api/v1/admin/approvals
POST http://localhost:3000/api/v1/admin/approvals/{id}/approve
GET http://localhost:3000/api/v1/admin/activity
```

## 🚀 Deployment to Vercel

### GitHub Setup

1. Push code to GitHub: `markallan-official/AI-dev-saas-platform`
2. Create repository if needed:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/markallan-official/AI-dev-saas-platform.git
   git branch -M main
   git push -u origin main
   ```

### Vercel Deployment

1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repo: `markallan-official/AI-dev-saas-platform`
4. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install --legacy-peer-deps`

5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://yvaidjzhhejrfgpovzmm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_API_URL=https://your-backend.com
   ```

6. Click "Deploy"

### Backend Deployment Options

Backend can be deployed to:
- **Railway**: Easy Vercel integration
- **Render**: Free tier available
- **AWS Elastic Beanstalk**: Scalable
- **Google Cloud Run**: Serverless
- **Heroku**: Simple deployment

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       CLIENT BROWSER                     │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/WebSocket
                   ↓
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite)              Port 5173          │
│  - User Interface                                        │
│  - Material-UI Theme                                     │
│  - Redux State Management                                │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP REST API
                   ↓
┌─────────────────────────────────────────────────────────┐
│  BACKEND (Express + Node.js)           Port 3000         │
│  - REST API Endpoints                                    │
│  - Business Logic                                        │
│  - WebSocket Handling                                    │
└──────────────────┬──────────────────────────────────────┘
                   │ SQL Queries
                   ↓
┌─────────────────────────────────────────────────────────┐
│  SUPABASE (PostgreSQL Database)                         │
│  - User Authentication                                   │
│  - Data Persistence                                      │
│  - File Storage                                          │
│  - Real-time Subscriptions                               │
└─────────────────────────────────────────────────────────┘
```

## 🔒 Security Notes

⚠️ **Important Security Checklist:**

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Supabase credentials are public-safe (anon key only)
- ✅ Sensitive data encrypted in transit (HTTPS on production)
- ✅ Use separate API keys for deployment environments
- ✅ Enable MFA in Supabase for user accounts
- ✅ Set up RLS (Row Level Security) in Supabase database

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 5173 (Frontend)
lsof -ti:5173 | xargs kill -9

# Find and kill process on port 3000 (Backend)
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install --legacy-peer-deps
```

### Database Connection Failed
```bash
# Check Docker compose services
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Supabase Connection Error
- Verify SUPABASE_URL is correct: `https://yvaidjzhhejrfgpovzmm.supabase.co`
- Verify SUPABASE_ANON_KEY starts with `eyJ...`
- Check network connectivity
- Verify Supabase project is active at https://app.supabase.com

## ✅ Verification Checklist

Run through this to verify everything works:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Docker running (`docker --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Docker services running (`docker-compose up -d`)
- [ ] Frontend running on http://localhost:5173
- [ ] Backend running on http://localhost:3000
- [ ] Health check passes (`curl http://localhost:3000/health`)
- [ ] Supabase connection successful
- [ ] GitHub repo ready for deployment
- [ ] Vercel account connected to GitHub

## 📚 Next Steps

1. **Understand the Architecture**: Read [System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)
2. **Database Schema**: Review [Database Schema](docs/database/SCHEMA.md)
3. **Development**: Follow [Development Guidelines](.github/copilot-instructions.md)
4. **Deploy**: Use [Vercel Deployment](docs/VERCEL_DEPLOYMENT.md)

---

**Your SaaS Collaborative Platform is now ready for development! 🚀**
