# GitHub Actions & Vercel CI/CD Setup

## GitHub Secrets Configuration

You need to add these secrets to your GitHub repository for automatic Vercel deployment.

### Where to Add Secrets

1. Go to: https://github.com/markallan-official/AI-dev-saas-platform/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret below

### Required Secrets

#### 1. VERCEL_TOKEN
- **Description**: Personal access token for Vercel CLI
- **How to get**:
  1. Go to https://vercel.com/account/tokens
  2. Create new token with scope "Full Account"
  3. Copy the token
- **Value**: `xxx_xxx_xxx_xxx...`

#### 2. VERCEL_ORG_ID
- **Description**: Your Vercel organization/account ID
- **How to get**:
  1. Go to https://vercel.com/account/general
  2. Look for "Team ID" (for personal account, use your account ID)
  3. Copy the ID
- **Value**: `[UUID or org ID]`

#### 3. VERCEL_PROJECT_ID
- **Description**: Your Vercel project ID
- **How to get**:
  1. Go to your Vercel project settings
  2. Look for "Project ID"
  3. Copy the ID
- **Value**: `[Project UUID]`

#### 4. SUPABASE_URL
- **Description**: Your Supabase project URL
- **Value**: `https://yvaidjzhhejrfgpovzmm.supabase.co`

#### 5. SUPABASE_ANON_KEY
- **Description**: Your Supabase anonymous/public key
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YWlkanpoaGVqcmZncG92em1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDMxOTcsImV4cCI6MjA4NzYxOTE5N30.uyREMgiTD5o5it4SB5xFoBalKItB_5z-ehOFafQl_vo`

### Optional Secrets

#### API_URL (for production)
- **Description**: Your production backend API URL
- **When needed**: After backend deployment
- **Value**: `https://your-backend-domain.com` or `https://your-api.railway.app`

---

## GitHub Actions Workflow

### File Location
`.github/workflows/deploy-vercel.yml`

### Triggers
- ✅ Push to `main` branch
- ✅ Push to `develop` branch  
- ✅ Pull requests to `main` or `develop`

### What It Does

1. **Checkout Code**: Gets your latest code from GitHub
2. **Setup Node.js**: Installs Node.js 18 LTS
3. **Install Dependencies**: Runs `npm install --legacy-peer-deps`
4. **Build Project**: Runs `npm run build`
5. **Deploy to Vercel**: Deploys using Vercel CLI

### Workflow File Content

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install --legacy-peer-deps

      - name: Build project
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          VITE_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: markallan-official
```

---

## Deployment Flow

```
┌─────────────────────────────────────────────┐
│  You push code to GitHub                     │
│  (to main, develop, or create PR)           │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  GitHub Actions Workflow Triggers           │
│  - Checks out code                          │
│  - Installs dependencies                    │
│  - Runs npm run build                       │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Vercel Deployment Action                   │
│  - Uses VERCEL_TOKEN for authentication     │
│  - Deploys to VERCEL_PROJECT_ID             │
│  - Creates preview for PRs                  │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Preview/Production URL                     │
│  - PRs: https://pr-xxx--project.vercel.app  │
│  - Main: https://project.vercel.app         │
└─────────────────────────────────────────────┘
```

---

## Testing the Workflow

### 1. First Deployment (Manual)

```bash
# Make a small change
echo "# Deployed!" >> README.md

# Commit and push
git add README.md
git commit -m "chore: Test deployment"
git push origin main
```

### 2. Check Workflow Status

1. Go to: https://github.com/markallan-official/AI-dev-saas-platform/actions
2. Click the latest workflow run
3. Watch the steps complete

### 3. Access Deployed Site

After workflow completes:
- Check Vercel: https://vercel.com/markallan-official
- Find your project and click the URL

---

## Troubleshooting CI/CD

### Build Fails: "Cannot find module"
**Cause**: Dependencies not installed  
**Solution**: Already handled with `npm install --legacy-peer-deps`

### Deployment Fails: "Invalid Vercel Token"
**Cause**: VERCEL_TOKEN secret not set or expired  
**Solution**:
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Update VERCEL_TOKEN secret on GitHub

### Deployment Fails: "Project not found"
**Cause**: VERCEL_PROJECT_ID incorrect  
**Solution**:
1. Find correct ID at https://vercel.com/dashboard
2. Update VERCEL_PROJECT_ID secret

### Build Fails with TypeScript Errors
**Cause**: TypeScript compilation errors  
**Solution**:
1. Run `npm run build` locally to see errors
2. Fix errors in code
3. Commit and push again

### Preview Not Creating for PRs
**Cause**: Workflow not configured for PRs  
**Solution**: Workflow already handles PRs - check GitHub Actions tab

---

## Vercel Project Setup

### Initial Setup (One-time)

1. **Create Vercel Project**:
   - Go to https://vercel.com/new
   - Import from GitHub: markallan-official/AI-dev-saas-platform
   - Framework: Vite
   - Build command: `npm run build`
   - Output: `frontend/dist`

2. **Add Environment Variables** (in Vercel):
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_API_URL

3. **Get Project IDs**:
   - Copy VERCEL_ORG_ID from settings
   - Copy VERCEL_PROJECT_ID from settings

4. **Add to GitHub Secrets**:
   - Add VERCEL_TOKEN
   - Add VERCEL_ORG_ID
   - Add VERCEL_PROJECT_ID

---

## Monitoring Deployments

### Real-time Monitoring

1. **GitHub Actions**: https://github.com/markallan-official/AI-dev-saas-platform/actions
2. **Vercel Dashboard**: https://vercel.com/dashboard
3. **Deployment Logs**: Click workflow run → View logs

### After Deployment

Check at:
- **Staging**: https://[project-name]-staging.vercel.app
- **Production**: https://[domain].vercel.app

---

## Security Best Practices

✅ **What We're Doing:**
- Secrets stored in GitHub (encrypted)
- Secrets not logged in workflow output
- Only public Supabase keys in CI/CD
- Separate environment variables per environment

⚠️ **More You Should Do:**
- Rotate tokens regularly
- Never commit secrets
- Use different keys for dev/staging/production
- Enable branch protection rules

---

## Rollback Strategy

If deployment has issues:

### Via Vercel
1. Go to https://vercel.com/dashboard
2. Click project
3. Go to "Deployments"
4. Click "..." on working deployment
5. Select "Promote to Production"

### Via GitHub
1. Revert commit: `git revert <commit-hash>`
2. Push: `git push origin main`
3. Workflow automatically re-deploys

---

## Advanced Configuration

### Deploy Different Branches to Different Environments

Modify `vercel-project-id` based on branch:

```yaml
- name: Deploy to Vercel
  uses: vercel/action@main
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ 
      github.ref == 'refs/heads/main' 
        && secrets.VERCEL_PROJECT_ID_PROD
        || secrets.VERCEL_PROJECT_ID_STAGING 
    }}
```

### Run Tests Before Deployment

Add step before build:

```yaml
- name: Run tests
  run: npm test

- name: Build project
  run: npm run build
```

---

## Next Steps

1. ✅ Create GitHub repo (if not done)
2. ✅ Link to Vercel (if not done)
3. ⏳ Add GitHub secrets (do this next)
4. ✅ Push first commit
5. ✅ Watch workflow run
6. ✅ Visit deployed URL

---

**Setup Time**: ~10 minutes to add secrets  
**Deployment Time**: ~5 minutes per deploy  
**Cost**: Free tier available on both GitHub & Vercel

For more help, see: [VERCEL_DEPLOYMENT.md](DEPLOYMENT.md)
