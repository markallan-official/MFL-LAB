import express, { Response } from 'express';
import { AuthRequest, authMiddleware, workspaceAccessMiddleware } from '../../middlewares/auth.js';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/v1/workspaces/designer/projects
router.get('/projects', authMiddleware, workspaceAccessMiddleware('designer'), async (req: AuthRequest, res: Response) => {
    try {
        const { data: projects, error } = await supabase!
            .from('design_projects')
            .select(`
        id,
        name,
        description,
        thumbnail_url,
        is_archived,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(projects || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/designer/projects
router.post('/projects', authMiddleware, workspaceAccessMiddleware('designer', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Project name required' });
        }

        const { data: project, error } = await supabase!
            .from('design_projects')
            .insert({
                workspace_id: req.workspace?.id,
                name,
                description,
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        // Log audit
        try {

            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'project_created',
            resource_type: 'design_project',
            resource_id: project.id
        });

        } catch (e) {}

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/designer/projects/:projectId
router.get('/projects/:projectId', authMiddleware, workspaceAccessMiddleware('designer'), async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;

        const { data: project, error } = await supabase!
            .from('design_projects')
            .select(`
        id,
        name,
        description,
        thumbnail_url,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('id', projectId)
            .eq('workspace_id', req.workspace?.id)
            .single();

        if (error) throw error;

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/designer/assets - Get project assets
router.get('/projects/:projectId/assets', authMiddleware, workspaceAccessMiddleware('designer'), async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;

        const { data: assets, error } = await supabase!
            .from('design_assets')
            .select(`
        id,
        name,
        description,
        asset_type,
        file_url,
        thumbnail_url,
        version,
        tags,
        is_published,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(assets || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/designer/assets - Create/upload asset
router.post('/assets', authMiddleware, workspaceAccessMiddleware('designer', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { project_id, name, asset_type, file_url, description, tags } = req.body;

        if (!project_id || !name || !asset_type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: asset, error } = await supabase!
            .from('design_assets')
            .insert({
                project_id,
                name,
                asset_type,
                file_url,
                description,
                tags: tags || [],
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        // Log audit
        try {

            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'asset_created',
            resource_type: 'design_asset',
            resource_id: asset.id
        });

        } catch (e) {}

        res.status(201).json(asset);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/workspaces/designer/assets/:assetId - Update asset
router.put('/assets/:assetId', authMiddleware, workspaceAccessMiddleware('designer', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { assetId } = req.params;
        const { name, description, tags, is_published } = req.body;

        const { data: asset, error } = await supabase!
            .from('design_assets')
            .update({
                name: name || undefined,
                description: description || undefined,
                tags: tags || undefined,
                is_published: is_published !== undefined ? is_published : undefined
            })
            .eq('id', assetId)
            .select()
            .single();

        if (error) throw error;

        res.json(asset);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// DELETE /api/v1/workspaces/designer/assets/:assetId
router.delete('/assets/:assetId', authMiddleware, workspaceAccessMiddleware('designer', 'manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { assetId } = req.params;

        const { error } = await supabase!
            .from('design_assets')
            .delete()
            .eq('id', assetId);

        if (error) throw error;

        res.json({ success: true, message: 'Asset deleted' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/designer/assets/:assetId/comments
router.post('/assets/:assetId/comments', authMiddleware, workspaceAccessMiddleware('designer'), async (req: AuthRequest, res: Response) => {
    try {
        const { assetId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Comment content required' });
        }

        const { data: comment, error } = await supabase!
            .from('design_comments')
            .insert({
                asset_id: assetId,
                user_id: req.user?.id,
                content
            })
            .select(`
        id,
        content,
        user:user_id(full_name),
        created_at
      `)
            .single();

        if (error) throw error;

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/designer/assets/:assetId/comments
router.get('/assets/:assetId/comments', authMiddleware, workspaceAccessMiddleware('designer'), async (req: AuthRequest, res: Response) => {
    try {
        const { assetId } = req.params;

        const { data: comments, error } = await supabase!
            .from('design_comments')
            .select(`
        id,
        content,
        user:user_id(full_name),
        created_at,
        updated_at
      `)
            .eq('asset_id', assetId)
            .is('parent_comment_id', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(comments || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;


