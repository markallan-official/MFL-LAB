import express, { Response } from 'express';
import { AuthRequest, authMiddleware, workspaceAccessMiddleware } from '../../middlewares/auth.js';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/v1/workspaces/ai/models
router.get('/models', authMiddleware, workspaceAccessMiddleware('ai_builder'), async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;

        let query = supabase!
            .from('ai_models')
            .select(`
        id,
        name,
        description,
        model_type,
        framework,
        status,
        version,
        accuracy,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: models, error } = await query;

        if (error) throw error;

        res.json(models || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/ai/models
router.post('/models', authMiddleware, workspaceAccessMiddleware('ai_builder', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, model_type, framework, hyperparameters } = req.body;

        if (!name || !model_type || !framework) {
            return res.status(400).json({ error: 'Name, model_type, and framework required' });
        }

        const { data: model, error } = await supabase!
            .from('ai_models')
            .insert({
                workspace_id: req.workspace?.id,
                name,
                description,
                model_type,
                framework,
                hyperparameters,
                status: 'created',
                version: '1.0.0',
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        try {


            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'ai_model_created',
            resource_type: 'ai_model',
            resource_id: model.id
        });


        } catch (e) {}

        res.status(201).json(model);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/workspaces/ai/models/:modelId
router.put('/models/:modelId', authMiddleware, workspaceAccessMiddleware('ai_builder', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { modelId } = req.params;
        const { name, description, status, accuracy, hyperparameters } = req.body;

        const { data: model, error } = await supabase!
            .from('ai_models')
            .update({
                name: name || undefined,
                description: description || undefined,
                status: status || undefined,
                accuracy: accuracy || undefined,
                hyperparameters: hyperparameters || undefined
            })
            .eq('id', modelId)
            .select()
            .single();

        if (error) throw error;

        res.json(model);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/ai/training-jobs
router.get('/training-jobs', authMiddleware, workspaceAccessMiddleware('ai_builder'), async (req: AuthRequest, res: Response) => {
    try {
        const { model_id, status } = req.query;

        let query = supabase!
            .from('training_jobs')
            .select(`
        id,
        model_id,
        job_name,
        status,
        progress,
        start_time,
        end_time,
        total_epochs,
        current_epoch,
        loss,
        accuracy,
        created_by(full_name),
        created_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('created_at', { ascending: false });

        if (model_id) {
            query = query.eq('model_id', model_id);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data: jobs, error } = await query;

        if (error) throw error;

        res.json(jobs || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/ai/training-jobs
router.post('/training-jobs', authMiddleware, workspaceAccessMiddleware('ai_builder', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { model_id, job_name, dataset_path, total_epochs, batch_size } = req.body;

        if (!model_id || !job_name || !total_epochs) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: job, error } = await supabase!
            .from('training_jobs')
            .insert({
                workspace_id: req.workspace?.id,
                model_id,
                job_name,
                dataset_path,
                total_epochs,
                batch_size,
                status: 'queued',
                progress: 0,
                current_epoch: 0,
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/workspaces/ai/training-jobs/:jobId
router.put('/training-jobs/:jobId', authMiddleware, workspaceAccessMiddleware('ai_builder', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const { status, progress, current_epoch, loss, accuracy } = req.body;

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (progress !== undefined) updateData.progress = progress;
        if (current_epoch !== undefined) updateData.current_epoch = current_epoch;
        if (loss !== undefined) updateData.loss = loss;
        if (accuracy !== undefined) updateData.accuracy = accuracy;

        if (status === 'completed') {
            updateData.end_time = new Date().toISOString();
        }

        const { data: job, error } = await supabase!
            .from('training_jobs')
            .update(updateData)
            .eq('id', jobId)
            .select()
            .single();

        if (error) throw error;

        res.json(job);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/ai/deployments
router.get('/deployments', authMiddleware, workspaceAccessMiddleware('ai_builder'), async (req: AuthRequest, res: Response) => {
    try {
        const { status, model_id } = req.query;

        let query = supabase!
            .from('model_deployments')
            .select(`
        id,
        model_id,
        deployment_name,
        status,
        version,
        inference_endpoint,
        performance_metrics,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (model_id) {
            query = query.eq('model_id', model_id);
        }

        const { data: deployments, error } = await query;

        if (error) throw error;

        res.json(deployments || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/ai/deployments
router.post('/deployments', authMiddleware, workspaceAccessMiddleware('ai_builder', 'manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { model_id, deployment_name, environment, resources } = req.body;

        if (!model_id || !deployment_name || !environment) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: deployment, error } = await supabase!
            .from('model_deployments')
            .insert({
                workspace_id: req.workspace?.id,
                model_id,
                deployment_name,
                environment,
                resources,
                status: 'pending',
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        try {


            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'model_deployment_created',
            resource_type: 'model_deployment',
            resource_id: deployment.id
        });


        } catch (e) {}

        res.status(201).json(deployment);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/workspaces/ai/deployments/:deploymentId
router.put('/deployments/:deploymentId', authMiddleware, workspaceAccessMiddleware('ai_builder', 'manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { deploymentId } = req.params;
        const { status, inference_endpoint, performance_metrics } = req.body;

        const { data: deployment, error } = await supabase!
            .from('model_deployments')
            .update({
                status: status || undefined,
                inference_endpoint: inference_endpoint || undefined,
                performance_metrics: performance_metrics || undefined
            })
            .eq('id', deploymentId)
            .select()
            .single();

        if (error) throw error;

        res.json(deployment);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;


