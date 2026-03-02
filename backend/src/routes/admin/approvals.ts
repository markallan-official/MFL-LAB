import express, { Response } from 'express';
import { AuthRequest, authMiddleware, rbacMiddleware } from '../../middlewares/auth.js';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/v1/admin/approvals - List pending profiles
router.get('/', authMiddleware, rbacMiddleware('users:manage'), async (req: AuthRequest, res: Response) => {
    try {
        const { data: profiles, error } = await supabase!
            .from('profiles')
            .select('*')
            .eq('approved', false)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map profiles to match the frontend expected structure if necessary
        // The frontend expects a Certain structure, but we can simplify it or adapt the frontend
        res.json(profiles || []);
    } catch (error: any) {
        console.error('Get approvals error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/v1/admin/approvals/:id/approve - Approve profile
router.post('/:id/approve', authMiddleware, rbacMiddleware('users:manage'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role = 'user' } = req.body;

        const { error: updateError } = await supabase!
            .from('profiles')
            .update({
                approved: true,
                role: role
            })
            .eq('id', id);

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'User approved successfully'
        });
    } catch (error: any) {
        console.error('Approve error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/v1/admin/approvals/:id/reject - Reject/Delete profile
router.post('/:id/reject', authMiddleware, rbacMiddleware('users:manage'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // For rejection, we might want to delete the profile or mark it as rejected
        // The user didn't specify, so let's delete to keep it clean
        const { error } = await supabase!
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Request rejected'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;


