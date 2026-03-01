import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middlewares/auth.js';
import { sendAccessRequestEmail } from '../services/emailService.js';

const router = express.Router();

// POST /api/v1/auth/signup - Request account access
router.post('/signup', async (req: Request, res: Response) => {
    const { email, password, full_name, organization, requested_role } = req.body;

    try {
        // Validate input
        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if email already registered
        const { data: existingUser } = await supabase!
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase!.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    requested_role,
                },
                emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:4002'}/login`
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed');

        // Get or create organization
        let orgId: string;
        if (organization) {
            const { data: existingOrg } = await supabase!
                .from('organizations')
                .select('id')
                .eq('slug', organization.toLowerCase().replace(/\s+/g, '-'))
                .single();

            if (existingOrg) {
                orgId = existingOrg.id;
            } else {
                const { data: newOrg, error: orgError } = await supabase!
                    .from('organizations')
                    .insert({
                        name: organization,
                        slug: organization.toLowerCase().replace(/\s+/g, '-'),
                        owner_id: authData.user.id
                    })
                    .select()
                    .single();

                if (orgError) throw orgError;
                orgId = newOrg.id;
            }
        } else {
            // Create default org
            const { data: newOrg, error: orgError } = await supabase!
                .from('organizations')
                .insert({
                    name: `${full_name}'s Organization`,
                    slug: `org-${authData.user.id.substring(0, 8)}`,
                    owner_id: authData.user.id
                })
                .select()
                .single();

            if (orgError) throw orgError;
            orgId = newOrg.id;
        }

        // Create user record
        const { error: userError } = await supabase!
            .from('users')
            .insert({
                id: authData.user.id,
                org_id: orgId,
                email,
                full_name,
                status: 'pending',
                email_verified: false,
                metadata: { requested_role }
            });

        if (userError) throw userError;

        // Create approval request for admin
        const { error: approvalError } = await supabase!
            .from('approvals')
            .insert({
                org_id: orgId,
                type: 'user_join',
                status: 'pending',
                requester_id: authData.user.id,
                data: {
                    user_id: authData.user.id,
                    email,
                    full_name,
                    requested_role,
                    requested_at: new Date().toISOString()
                }
            });

        if (approvalError) throw approvalError;

        // Send email notification to Admin (markmallan01@gmail.com)
        await sendAccessRequestEmail(email, full_name);

        res.status(201).json({
            success: true,
            message: 'Signup request submitted. Awaiting admin approval.',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                full_name
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/auth/login - Authenticate user
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Sign in with Supabase
        const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
            email,
            password
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Authentication failed');

        // Check if user is active
        const { data: user, error: userError } = await supabase!
            .from('users')
            .select('id, email, full_name, status, org_id')
            .eq('id', authData.user.id)
            .single();

        if (userError || !user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isSuper = user.email?.toLowerCase() === 'markmallan01@gmail.com';
        if (!isSuper && (!user.status || !user.status.startsWith('active'))) {
            return res.status(403).json({
                error: 'Account not active',
                message: `Account status: ${user.status}. Awaiting admin approval.`
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                org_id: user.org_id
            },
            session: authData.session,
            access_token: authData.session?.access_token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: (error as Error).message });
    }
});

// POST /api/v1/auth/logout - Logout user
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { error } = await supabase!.auth.signOut();
        if (error) throw error;

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/auth/verify-email - Verify email token
router.post('/verify-email', async (req: Request, res: Response) => {
    const { token, type } = req.body;

    try {
        if (!token || !type) {
            return res.status(400).json({ error: 'Token and type required' });
        }

        const { data, error } = await supabase!.auth.verifyOtp({
            token_hash: token,
            type: type as any
        });

        if (error) throw error;

        // Update user email verified status
        if (data.user) {
            await supabase!
                .from('users')
                .update({ email_verified: true })
                .eq('id', data.user.id);
        }

        res.json({
            success: true,
            message: 'Email verified successfully',
            user: data.user
        });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// POST /api/v1/auth/refresh - Refresh session token
router.post('/refresh', async (req: Request, res: Response) => {
    const { refresh_token } = req.body;

    try {
        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const { data, error } = await supabase!.auth.refreshSession({
            refresh_token
        });

        if (error) throw error;

        res.json({
            success: true,
            session: data.session,
            access_token: data.session?.access_token
        });
    } catch (error) {
        res.status(401).json({ error: (error as Error).message });
    }
});

// GET /api/v1/auth/me - Get current user
router.get('/me', authMiddleware, async (req: any, res: Response) => {
    try {
        res.json({
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;


