# Deployment Guide - MFL LABS SaaS

This guide outlines the steps to deploy your SaaS platform to a production environment using **Vercel** (Frontend) and **Supabase** (Backend/Database).

## 1. Supabase Configuration (Backend)

Ensure your Supabase project is ready for production:

1.  **Site URL**: Update your `Site URL` in `Authentication > Settings > Configuration` to your production URL (e.g., `https://mfl-labs.vercel.app`).
2.  **Redirect URLs**: Add your production URL and common redirect patterns (e.g., `https://mfl-labs.vercel.app/**`) to the `Redirect URLs` list.
3.  **Database Tables**: Ensure all tables (`users`, `user_assignments`, etc.) are created and RLS (Row Level Security) policies are active.
4.  **SMTP**: For reliable emails, configure a custom SMTP provider (like Sengrid or Resend) in `Authentication > Settings > SMTP`.

## 2. Vercel Deployment (Frontend)

1.  **Project Setup**: Import your repository into Vercel.
2.  **Environment Variables**: Add the following variables in the Vercel dashboard:
    *   `VITE_SUPABASE_URL`: Your production Supabase project URL.
    *   `VITE_SUPABASE_ANON_KEY`: Your production Supabase anonymous key.
3.  **Build Settings**: Use `npm run build` and the output directory should be `dist`.
4.  **Custom Domain**: Point your professional domain to Vercel in the `Settings > Domains` section.

## 3. Post-Deployment Steps

1.  **Initial Admin Setup**: Manually set your status to `admin` in the Supabase `users` table for your primary email (e.g., `markmallan01@gmail.com`).
2.  **Access Approvals**: Use the **Admin Control Panel** to review and approve new access requests.
3.  **SSL/TLS**: Vercel automatically handles SSL for your custom domain.

## 4. Scaling Considerations

*   **Database Scaling**: Monitor Supabase usage and upgrade plans if your user base grows significantly.
*   **Edge Functions**: Use Supabase Edge Functions for complex backend logic that requires high availability.

---
*Created by Antigravity for MFL LABS*
