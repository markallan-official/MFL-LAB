# Implementation Guide - SaaS Collaborative Development Platform

**Last Updated**: February 27, 2026  
**Status**: Ready for Feature Development

---

## Quick Start

### Current Status
✅ **Backend**: Running on http://localhost:8001  
✅ **Frontend**: Running on http://localhost:4174  
✅ **Architecture**: Fully designed and documented  
✅ **Database Schema**: Complete with RLS and triggers  

### Next Steps
1. Set up Supabase database schema
2. Implement authentication flows
3. Build admin approval workflows
4. Create workspace components

---

## Phase 1: Supabase Setup

### Step 1.1: Create Tables in Supabase

1. Navigate to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (URL: `https://yvaidjzhhejrfgpovzmm.supabase.co`)
3. Go to **SQL Editor**
4. Copy entire script from `docs/database/DATABASE_SCHEMA.sql`
5. Paste and execute in SQL editor
6. Verify all tables created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

### Step 1.2: Enable Row-Level Security

1. Go to **Authentication** → **RLS**
2. Verify RLS is enabled on all tables
3. Test policies with sample data:
   ```sql
   -- Create test organization
   INSERT INTO organizations (name, slug, owner_id) 
   VALUES ('Test Org', 'test-org', auth.uid());
   
   -- Create test user
   INSERT INTO users (id, org_id, email, full_name) 
   VALUES (auth.uid(), org_id, 'test@example.com', 'Test User');
   ```

### Step 1.3: Configure Authentication

**Email Provider Setup:**
1. Go to **Authentication** → **Providers**
2. Enable **Email**
3. Configure:
   - SMTP settings (Gmail/SendGrid recommended)
   - Email templates
   - Redirect URLs:
     ```
     http://localhost:4174/auth/callback
     http://localhost:4174/confirm
     ```

**MFA Configuration (Optional):**
1. Go to **Authentication** → **MFA**
2. Enable TOTP (Time-based One-Time Password)

---

## Phase 2: Backend API Implementation

### Step 2.1: Authentication Routes

Create `backend/src/routes/auth.ts`:

```typescript
import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// POST /api/v1/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, full_name, organization } = req.body;
  
  try {
    // Create user in Supabase Auth
    const authRes = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          organization
        }
      }
    });

    if (authRes.error) throw authRes.error;

    // Create approval request for admin
    // User remains in 'pending' status until approved

    res.json({
      success: true,
      message: 'Signup request submitted. Awaiting admin approval.',
      user: authRes.data.user
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const res_auth = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (res_auth.error) throw res_auth.error;

    // Check if user is approved
    const { data: user } = await supabase
      .from('users')
      .select('status')
      .eq('id', res_auth.data.user.id)
      .single();

    if (user?.status !== 'active') {
      return res.status(403).json({
        error: 'User account is not active. Awaiting admin approval.'
      });
    }

    res.json({
      success: true,
      user: res_auth.data.user,
      session: res_auth.data.session
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    await supabase.auth.signOut();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// POST /api/v1/auth/verify-email
router.post('/verify-email', async (req: Request, res: Response) => {
  const { token, type } = req.body;

  try {
    const result = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'email' | 'sms'
    });

    if (result.error) throw result.error;

    res.json({ success: true, message: 'Email verified' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
```

### Step 2.2: Admin Approval Routes

Create `backend/src/routes/admin/approvals.ts`:

```typescript
import express, { Request, Response } from 'express';
import { authMiddleware, rbacMiddleware } from '../../middlewares/auth.js';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/v1/admin/approvals
router.get('/', authMiddleware, rbacMiddleware('users:manage'), async (req: Request, res: Response) => {
  try {
    const { data: approvals, error } = await supabase
      .from('approvals')
      .select(`
        id,
        type,
        status,
        data,
        created_at,
        requester:requester_id(email, full_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/v1/admin/approvals/:id/approve
router.post('/:id/approve', authMiddleware, rbacMiddleware('users:manage'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role_id, permissions } = req.body;

  try {
    // Get approval
    const { data: approval, error: fetchError } = await supabase
      .from('approvals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (approval.type === 'user_join') {
      // Approve user
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: 'active', email_verified: true })
        .eq('id', approval.data.user_id);

      if (updateError) throw updateError;

      // Assign role
      await supabase.from('user_roles').insert({
        user_id: approval.data.user_id,
        role_id,
        assigned_by: req.user.id
      });

      // Send approval email
      // TODO: Implement email service
    }

    // Update approval status
    await supabase
      .from('approvals')
      .update({
        status: 'approved',
        approver_id: req.user.id,
        approved_at: new Date()
      })
      .eq('id', id);

    res.json({ success: true, message: 'Approval processed' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/v1/admin/approvals/:id/reject
router.post('/:id/reject', authMiddleware, rbacMiddleware('users:manage'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    await supabase
      .from('approvals')
      .update({
        status: 'rejected',
        approver_id: req.user.id,
        rejection_reason: reason,
        approved_at: new Date()
      })
      .eq('id', id);

    res.json({ success: true, message: 'Approval rejected' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
```

### Step 2.3: Workspace Routes

Create `backend/src/routes/workspaces/designer.ts`:

```typescript
import express, { Request, Response } from 'express';
import { authMiddleware, workspaceAccessMiddleware } from '../../middlewares/auth.js';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/v1/workspaces/designer/projects
router.get('/projects', authMiddleware, workspaceAccessMiddleware('designer'), async (req: Request, res: Response) => {
  try {
    const { data: projects, error } = await supabase
      .from('design_projects')
      .select(`
        id,
        name,
        description,
        created_by(full_name),
        created_at
      `)
      .eq('workspace_id', req.workspace.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/v1/workspaces/designer/projects
router.post('/projects', authMiddleware, workspaceAccessMiddleware('designer', 'editor'), async (req: Request, res: Response) => {
  const { name, description } = req.body;

  try {
    const { data: project, error } = await supabase
      .from('design_projects')
      .insert({
        workspace_id: req.workspace.id,
        name,
        description,
        created_by: req.user.id
      })
      .select();

    if (error) throw error;

    res.json(project[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/v1/workspaces/designer/assets
router.post('/assets', authMiddleware, workspaceAccessMiddleware('designer', 'editor'), async (req: Request, res: Response) => {
  const { project_id, name, asset_type, file_url } = req.body;

  try {
    const { data: asset, error } = await supabase
      .from('design_assets')
      .insert({
        project_id,
        name,
        asset_type,
        file_url,
        created_by: req.user.id
      })
      .select();

    if (error) throw error;

    res.json(asset[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
```

### Step 2.4: Update Server.ts

Update `backend/src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import adminApprovalsRoutes from './routes/admin/approvals.js';
import designerRoutes from './routes/workspaces/designer.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4174' }));
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/approvals', adminApprovalsRoutes);
app.use('/api/v1/workspaces/designer', designerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.API_PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api/docs`);
});
```

---

## Phase 3: Frontend Implementation

### Step 3.1: Create Auth Context

Create `frontend/src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Step 3.2: Create Login Page

Create `frontend/src/pages/Login.tsx`:

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/workspaces');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '100px auto',
      padding: '40px',
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#0066FF', marginBottom: '30px' }}>Login</h1>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#FFE6E6',
          color: '#D32F2F',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #DDD',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #DDD',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0066FF',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        No account? <a href="/signup" style={{ color: '#0066FF' }}>Sign up</a>
      </p>
    </div>
  );
};

export default LoginPage;
```

### Step 3.3: Create Signup Page

Create `frontend/src/pages/Signup.tsx` (similar structure with signup form)

### Step 3.4: Update App.tsx Routes

Update frontend routes to include auth pages and protected workspaces.

---

## Phase 4: Admin Dashboard

### Building the Admin Panel

Key components to create:

1. **AdminDashboard** (`pages/admin/AdminDashboard.tsx`)
   - Overview metrics
   - Quick actions
   - Activity widget

2. **ApprovalQueue** (`pages/admin/ApprovalQueue.tsx`)
   - Pending approvals list
   - Approval/rejection actions
   - Bulk operations

3. **UserManagement** (`pages/admin/UserManagement.tsx`)
   - User list with filtering
   - Role assignment
   - Deactivation options

4. **RoleManagement** (`pages/admin/RoleManagement.tsx`)
   - Role CRUD operations
   - Permission builder
   - Role assignment tracking

---

## Phase 5: Real-Time Collaboration

### Add Socket.IO to Backend

```bash
npm install socket.io --workspace=backend
```

```typescript
// backend/src/websocket.ts
import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

export const createWebSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join workspace room
    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace-${workspaceId}`);
      console.log(`User ${socket.id} joined workspace ${workspaceId}`);
    });

    // Broadcast changes
    socket.on('item-updated', (data) => {
      socket.to(`workspace-${data.workspaceId}`).emit('item-updated', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};
```

---

## Testing Checklist

### Authentication Flow ✓
- [ ] User signup request submitted
- [ ] Admin approval workflow
- [ ] Email verification
- [ ] Login success
- [ ] Session persistence
- [ ] Logout functionality

### Admin Dashboard ✓
- [ ] View pending approvals
- [ ] Approve/reject users
- [ ] Assign roles
- [ ] View activity logs
- [ ] User management

### Workspace Access ✓
- [ ] Users see only assigned workspaces
- [ ] Edit permissions enforced
- [ ] Admin access to all workspaces
- [ ] Workspace-specific data isolation

### Real-Time Collaboration ✓
- [ ] Users receive live updates
- [ ] Comments are broadcast
- [ ] Asset changes propagate
- [ ] Connection recovery

---

## Deployment Checklist

### Before Production
- [ ] Enable HTTPS/TLS
- [ ] Configure rate limiting
- [ ] Set up email service (SendGrid/Mailgun)
- [ ] Configure CDN (Cloudflare)
- [ ] Set up monitoring (New Relic/Datadog)
- [ ] Configure backup strategy
- [ ] Run security audit
- [ ] Load testing
- [ ] Database optimization

### Production Environment
```bash
# Build and deploy
npm run build
docker build -t saas-platform:latest .
kubernetes apply -f infrastructure/k8s/
```

---

## Next Steps

1. **Execute this guide** step-by-step
2. **Test each feature** before moving to next phase
3. **Collect feedback** from initial users
4. **Iterate and improve** based on feedback

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Express.js Guide**: https://expressjs.com/
- **React Documentation**: https://react.dev/
- **Socket.IO Guide**: https://socket.io/docs/

## Current Services Status

Check services running:
```bash
# Backend health
curl http://localhost:8001/health

# Frontend
http://localhost:4174
```

---

**Happy Coding! 🚀**

