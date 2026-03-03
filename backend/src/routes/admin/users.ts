import express, { Response } from 'express';
import { AuthRequest, authMiddleware, rbacMiddleware } from '../../middlewares/auth.js';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/v1/admin/users - List all user profiles
router.get('/', authMiddleware, rbacMiddleware('users:manage'), async (req: AuthRequest, res: Response) => {
    try {
        const { data: profiles, error } = await supabase!
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(profiles || []);
    } catch (error: any) {
        console.error('Get users error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/v1/admin/users/:id/approve - Approve profile
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

// POST /api/v1/admin/users/:id/reject - Reject/Delete profile
router.post('/:id/reject', authMiddleware, rbacMiddleware('users:manage'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase!
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'User removed successfully'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/v1/admin/users/:id/role - Change user role
router.put('/:id/role', authMiddleware, rbacMiddleware('users:manage'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const { error } = await supabase!
            .from('profiles')
            .update({ role })
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Role updated successfully'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
