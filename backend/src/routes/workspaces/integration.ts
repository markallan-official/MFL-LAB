import express, { Response } from 'express';
import { AuthRequest, authMiddleware, workspaceAccessMiddleware } from '../../middlewares/auth.js';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/v1/workspaces/integration/builds
router.get('/builds', authMiddleware, workspaceAccessMiddleware('integration'), async (req: AuthRequest, res: Response) => {
    try {
        const { status, limit = 20 } = req.query;

        let query = supabase!
            .from('integration_builds')
            .select(`
        id,
        build_name,
        version,
        status,
        total_modules,
        integrated_modules,
        build_type,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit as string) || 20);

        if (status) {
            query = query.eq('status', status);
        }

        const { data: builds, error } = await query;

        if (error) throw error;

        res.json(builds || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/integration/builds
router.post('/builds', authMiddleware, workspaceAccessMiddleware('integration', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { build_name, version, build_type, description } = req.body;

        if (!build_name || !version || !build_type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: build, error } = await supabase!
            .from('integration_builds')
            .insert({
                workspace_id: req.workspace?.id,
                build_name,
                version,
                build_type,
                description,
                status: 'initialized',
                total_modules: 0,
                integrated_modules: 0,
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        try {


            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'integration_build_created',
            resource_type: 'integration_build',
            resource_id: build.id
        });


        } catch (e) {}

        res.status(201).json(build);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/workspaces/integration/builds/:buildId
router.put('/builds/:buildId', authMiddleware, workspaceAccessMiddleware('integration', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { buildId } = req.params;
        const { status, total_modules, integrated_modules } = req.body;

        const { data: build, error } = await supabase!
            .from('integration_builds')
            .update({
                status: status || undefined,
                total_modules: total_modules || undefined,
                integrated_modules: integrated_modules || undefined
            })
            .eq('id', buildId)
            .select()
            .single();

        if (error) throw error;

        res.json(build);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/integration/builds/:buildId/artifacts
router.get('/builds/:buildId/artifacts', authMiddleware, workspaceAccessMiddleware('integration'), async (req: AuthRequest, res: Response) => {
    try {
        const { buildId } = req.params;

        const { data: artifacts, error } = await supabase!
            .from('build_artifacts')
            .select(`
        id,
        artifact_name,
        artifact_type,
        file_path,
        file_size,
        checksum,
        created_by(full_name),
        created_at
      `)
            .eq('build_id', buildId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(artifacts || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/integration/artifacts
router.post('/artifacts', authMiddleware, workspaceAccessMiddleware('integration', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { build_id, artifact_name, artifact_type, file_path, file_size, checksum } = req.body;

        if (!build_id || !artifact_name || !artifact_type || !file_path) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: artifact, error } = await supabase!
            .from('build_artifacts')
            .insert({
                build_id,
                artifact_name,
                artifact_type,
                file_path,
                file_size,
                checksum,
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(artifact);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// DELETE /api/v1/workspaces/integration/artifacts/:artifactId
router.delete('/artifacts/:artifactId', authMiddleware, workspaceAccessMiddleware('integration', 'manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { artifactId } = req.params;

        const { error } = await supabase!
            .from('build_artifacts')
            .delete()
            .eq('id', artifactId);

        if (error) throw error;

        res.json({ message: 'Artifact deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/integration/workspace-integrations
router.get('/workspace-integrations', authMiddleware, workspaceAccessMiddleware('integration'), async (req: AuthRequest, res: Response) => {
    try {
        const { data: integrations, error } = await supabase!
            .from('workspace_integrations')
            .select(`
        id,
        source_workspace,
        target_workspace,
        integration_status,
        sync_frequency,
        last_sync,
        created_by(full_name),
        created_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(integrations || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/integration/workspace-integrations
router.post('/workspace-integrations', authMiddleware, workspaceAccessMiddleware('integration', 'manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { source_workspace, target_workspace, sync_frequency } = req.body;

        if (!source_workspace || !target_workspace) {
            return res.status(400).json({ error: 'Source and target workspace required' });
        }

        const { data: integration, error } = await supabase!
            .from('workspace_integrations')
            .insert({
                workspace_id: req.workspace?.id,
                source_workspace,
                target_workspace,
                sync_frequency: sync_frequency || 'manual',
                integration_status: 'pending',
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        try {


            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'workspace_integration_created',
            resource_type: 'workspace_integration',
            resource_id: integration.id
        });


        } catch (e) {}

        res.status(201).json(integration);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/integration/:integrationId/sync
router.post('/:integrationId/sync', authMiddleware, workspaceAccessMiddleware('integration', 'manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { integrationId } = req.params;

        const { data: integration, error } = await supabase!
            .from('workspace_integrations')
            .update({
                last_sync: new Date().toISOString(),
                integration_status: 'syncing'
            })
            .eq('id', integrationId)
            .select()
            .single();

        if (error) throw error;

        try {


            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'workspace_sync_initiated',
            resource_type: 'workspace_integration',
            resource_id: integrationId
        });


        } catch (e) {}

        res.json({ message: 'Sync initiated', integration });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;


