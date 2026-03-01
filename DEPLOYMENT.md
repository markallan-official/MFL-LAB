# Deployment Guide - MFL LABS SaaS

This guide outlines the steps to deploy your SaaS platform to a production environment using **Vercel** (Frontend) and **Supabase** (Backend/Database).

## 1. Supabase Configuration (Backend)

Ensure your Supabase project is ready for production:

1.  **Site URL**: Update your `Site URL` in `Authentication > Settings > Configuration` to your production URL (e.g., `https://mfl-labs.vercel.app`).
2.  **Redirect URLs**: Add your production URL and common redirect patterns (e.g., `https://mfl-labs.vercel.app/**`) to the `Redirect URLs` list.
3.  **Database Tables**: Ensure all tables (`users`, `user_assignments`, etc.) are created and RLS (Row Level Security) policies are active.
4.  **SMTP**: For reliable emails, configure a custom SMTP provider (like Sengrid or Resend) in `Authentication > Settings > SMTP`.

## 2. Netlify Deployment (Recommended - No Limits)

I have optimized the platform for Netlify so you can deploy instantly without Vercel's daily limits.

1.  **Login**: Go to [Netlify](https://app.netlify.com/).
2.  **Add New Site**: Select **Import from Git** and choose your `MFL-LAB` repository.
3.  **Site Settings**:
    *   **Build Command**: `npm run build --workspace=@saas/frontend`
    *   **Publish Directory**: `frontend/dist`
    *   **Functions Directory**: `netlify/functions` (Should be auto-detected).
4.  **Environment Variables**: Add your **SMTP** variables in **Site Configuration > Environment Variables** (the same ones we listed for Vercel).
5.  **Deploy**: Click **Deploy site**.

## 3. Vercel Deployment (Alternative)
*Note: Only if you have not hit your daily deployment limit.*
... (rest of the Vercel guide)

### 2.1. Email Support (Optional)
If you want the "Access Granted" emails to be sent live from your Vercel deployment, add these variables in **Project Settings > Environment Variables**:

*   `SMTP_HOST`: `smtp.gmail.com`
*   `SMTP_PORT`: `587`
*   `SMTP_SECURE`: `false`
*   `SMTP_USER`: `markmallan01@gmail.com`
*   `SMTP_PASS`: `etimcnnlnrtotnxn`

## 3. Post-Deployment Steps

1.  **Initial Admin Setup**: Manually set your status to `admin` in the Supabase `users` table for your email `markmallan01@gmail.com`.
2.  **Access Approvals**: Use the **Admin Control Panel** to approve new requests.

---
*Created by Antigravity for MFL LABS*
