import express, { Response } from 'express';
import { AuthRequest, authMiddleware, workspaceAccessMiddleware } from '../../middlewares/auth.js';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/v1/workspaces/analyst/documents
router.get('/documents', authMiddleware, workspaceAccessMiddleware('analyst'), async (req: AuthRequest, res: Response) => {
    try {
        const { doc_type } = req.query;

        let query = supabase!
            .from('architecture_documents')
            .select(`
        id,
        name,
        description,
        doc_type,
        version,
        is_published,
        tags,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('created_at', { ascending: false });

        if (doc_type) {
            query = query.eq('doc_type', doc_type);
        }

        const { data: documents, error } = await query;

        if (error) throw error;

        res.json(documents || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/analyst/documents
router.post('/documents', authMiddleware, workspaceAccessMiddleware('analyst', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, content, doc_type, tags } = req.body;

        if (!name || !doc_type) {
            return res.status(400).json({ error: 'Name and doc_type required' });
        }

        const { data: document, error } = await supabase!
            .from('architecture_documents')
            .insert({
                workspace_id: req.workspace?.id,
                name,
                description,
                content,
                doc_type,
                tags: tags || [],
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        try {


            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'document_created',
            resource_type: 'architecture_document',
            resource_id: document.id
        });


        } catch (e) {}

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/workspaces/analyst/documents/:docId
router.put('/documents/:docId', authMiddleware, workspaceAccessMiddleware('analyst', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { docId } = req.params;
        const { name, description, content, is_published } = req.body;

        const { data: document, error } = await supabase!
            .from('architecture_documents')
            .update({
                name: name || undefined,
                description: description || undefined,
                content: content || undefined,
                is_published: is_published !== undefined ? is_published : undefined
            })
            .eq('id', docId)
            .select()
            .single();

        if (error) throw error;

        res.json(document);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/analyst/data-models
router.get('/data-models', authMiddleware, workspaceAccessMiddleware('analyst'), async (req: AuthRequest, res: Response) => {
    try {
        const { data: models, error } = await supabase!
            .from('data_models')
            .select(`
        id,
        name,
        description,
        version,
        is_published,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(models || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/analyst/data-models
router.post('/data-models', authMiddleware, workspaceAccessMiddleware('analyst', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, schema } = req.body;

        if (!name || !schema) {
            return res.status(400).json({ error: 'Name and schema required' });
        }

        const { data: model, error } = await supabase!
            .from('data_models')
            .insert({
                workspace_id: req.workspace?.id,
                name,
                description,
                schema,
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(model);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/analyst/api-specs
router.get('/api-specs', authMiddleware, workspaceAccessMiddleware('analyst'), async (req: AuthRequest, res: Response) => {
    try {
        const { endpoint, method } = req.query;

        let query = supabase!
            .from('api_specifications')
            .select(`
        id,
        name,
        endpoint,
        method,
        description,
        version,
        is_published,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('endpoint');

        if (endpoint) {
            query = query.ilike('endpoint', `%${endpoint}%`);
        }

        if (method) {
            query = query.eq('method', method);
        }

        const { data: specs, error } = await query;

        if (error) throw error;

        res.json(specs || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/analyst/api-specs
router.post('/api-specs', authMiddleware, workspaceAccessMiddleware('analyst', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, endpoint, method, description, spec } = req.body;

        if (!name || !endpoint || !method || !spec) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: apiSpec, error } = await supabase!
            .from('api_specifications')
            .insert({
                workspace_id: req.workspace?.id,
                name,
                endpoint,
                method,
                description,
                spec,
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(apiSpec);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;


