import express, { Response } from 'express';
import { AuthRequest, authMiddleware } from '../middlewares/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/v1/assembly/summary
 * Aggregates finalized/published work from all workspaces for the assembly view
 */
router.get('/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        // Fetch published design assets
        const { data: designs } = await supabase!
            .from('design_assets')
            .select('id, name, asset_type, thumbnail_url, created_at, created_by(full_name)')
            .eq('is_published', true)
            .limit(5);

        // Fetch architecture documents
        const { data: docs } = await supabase!
            .from('architecture_documents')
            .select('id, title, doc_type, status, created_at, created_by(full_name)')
            .eq('status', 'finalized')
            .limit(5);

        // Fetch passing test results
        const { data: tests } = await supabase!
            .from('test_results')
            .select('id, status, test_case_id, created_at, tester_id(full_name)')
            .eq('status', 'passed')
            .limit(5);

        // Fetch deployed AI models
        const { data: models } = await supabase!
            .from('ai_models')
            .select('id, name, version, status, created_at, created_by(full_name)')
            .eq('status', 'deployed')
            .limit(5);

        // Fetch successful integration builds
        const { data: builds } = await supabase!
            .from('integration_builds')
            .select('id, build_number, status, created_at, created_by(full_name)')
            .eq('status', 'success')
            .limit(5);

        res.json({
            designs: designs || [],
            architecture: docs || [],
            testing: tests || [],
            ai: models || [],
            integration: builds || []
        });
    } catch (error: any) {
        console.error('Assembly summary error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/v1/assembly/combine
 * Simulate the final assembly of selected components
 */
router.post('/combine', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { components } = req.body;

        if (!components || !Array.isArray(components)) {
            return res.status(400).json({ error: 'Components list required for assembly' });
        }

        // In a real app, this would create a new 'Product' or 'Release' entry
        // For now, we return a success message and log the audit
        
        try {
            await supabase!.from('audit_logs').insert({
                user_id: req.user?.id,
                action: 'assembly_performed',
                resource_type: 'assembly',
                resource_id: 'final_assembly_' + Date.now()
            });
        } catch (e) {}

        res.json({
            success: true,
            assembly_id: 'ASSEMBLY_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            message: 'All components successfully integrated into the master assembly.',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
