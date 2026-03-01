# Vercel Deployment Setup Guide

## Prerequisites

- GitHub account with `markallan-official` username
- Vercel account (linked to your GitHub)
- Supabase project created

## Step 1: Link GitHub Repository to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository: `markallan-official/AI-dev-saas-platform`
4. Click "Import"

## Step 2: Configure Environment Variables in Vercel

In Vercel project settings, add these environment variables:

```
VITE_SUPABASE_URL=https://yvaidjzhhejrfgpovzmm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YWlkanpoaGVqcmZncG92em1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDMxOTcsImV4cCI6MjA4NzYxOTE5N30.uyREMgiTD5o5it4SB5xFoBalKItB_5z-ehOFafQl_vo
VITE_API_URL=https://your-backend-domain.com
SUPABASE_URL=https://yvaidjzhhejrfgpovzmm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YWlkanpoaGVqcmZncG92em1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDMxOTcsImV4cCI6MjA4NzYxOTE5N30.uyREMgiTD5o5it4SB5xFoBalKItB_5z-ehOFafQl_vo
```

## Step 3: Deploy Backend

Backend can be deployed separately to:
- Railway
- Render
- AWS Lambda
- Google Cloud Run
- Heroku

For this guide, we'll use Vercel Functions.

## Step 4: Configure Build & Deployment

Vercel will automatically use `vercel.json` configuration which specifies:
- Build command: `npm run build`
- Output directory: `frontend/dist`
- Framework: Vite

## Step 5: Custom Domains (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Step 6: GitHub Secrets for CI/CD

Add these secrets to your GitHub repository:
- `VERCEL_TOKEN` - Get from Vercel Account Settings
- `VERCEL_ORG_ID` - Your Vercel org ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key

## Local Development

### Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Accessible at: http://localhost:5173

### Backend (Port 3000)
```bash
cd backend
npm install
npm run dev
```
Accessible at: http://localhost:3000

## API Integration

Frontend calls backend API at: `http://localhost:3000/api/v1/...`

Vercel automatically proxies `/api/*` requests to your backend through API routes.

## Environment Variables

Each environment needs:
- **Development**: `.env.local`
- **Staging**: Set in Vercel/Render staging environment
- **Production**: Set in Vercel/Render production environment

## Troubleshooting

### Build fails with missing dependencies
```bash
npm install --legacy-peer-deps
npm run build
```

### Port conflicts
- Frontend: Change vite port in `vite.config.ts`
- Backend: Change API_PORT in `.env`

### Supabase connection fails
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check Supabase project is active
- Verify network connectivity

## Deployment Workflow

1. Push to `main` branch
2. GitHub Actions workflow triggers automatically
3. Tests run (if configured)
4. Builds project
5. Deploys to Vercel
6. Frontend available at: https://your-domain.vercel.app
