import express, { Response } from 'express';
import { AuthRequest, authMiddleware, workspaceAccessMiddleware } from '../../middlewares/auth.js';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/v1/workspaces/qa/test-cases
router.get('/test-cases', authMiddleware, workspaceAccessMiddleware('qa'), async (req: AuthRequest, res: Response) => {
    try {
        const { status, priority } = req.query;

        let query = supabase!
            .from('test_cases')
            .select(`
        id,
        title,
        description,
        status,
        priority,
        test_type,
        created_by(full_name),
        created_at,
        updated_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (priority) {
            query = query.eq('priority', priority);
        }

        const { data: testCases, error } = await query;

        if (error) throw error;

        res.json(testCases || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/qa/test-cases
router.post('/test-cases', authMiddleware, workspaceAccessMiddleware('qa', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, test_type, priority, steps } = req.body;

        if (!title || !test_type) {
            return res.status(400).json({ error: 'Title and test_type required' });
        }

        const { data: testCase, error } = await supabase!
            .from('test_cases')
            .insert({
                workspace_id: req.workspace?.id,
                title,
                description,
                test_type,
                priority: priority || 'medium',
                steps,
                status: 'draft',
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        try {


            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'test_case_created',
            resource_type: 'test_case',
            resource_id: testCase.id
        });


        } catch (e) {}

        res.status(201).json(testCase);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/workspaces/qa/test-cases/:testCaseId
router.put('/test-cases/:testCaseId', authMiddleware, workspaceAccessMiddleware('qa', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { testCaseId } = req.params;
        const { title, description, status, priority, steps } = req.body;

        const { data: testCase, error } = await supabase!
            .from('test_cases')
            .update({
                title: title || undefined,
                description: description || undefined,
                status: status || undefined,
                priority: priority || undefined,
                steps: steps || undefined
            })
            .eq('id', testCaseId)
            .select()
            .single();

        if (error) throw error;

        res.json(testCase);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/qa/test-results/:testCaseId
router.get('/test-results/:testCaseId', authMiddleware, workspaceAccessMiddleware('qa'), async (req: AuthRequest, res: Response) => {
    try {
        const { testCaseId } = req.params;

        const { data: results, error } = await supabase!
            .from('test_results')
            .select(`
        id,
        status,
        build_id,
        execution_time,
        error_message,
        logs,
        created_at
      `)
            .eq('test_case_id', testCaseId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(results || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/qa/test-results
router.post('/test-results', authMiddleware, workspaceAccessMiddleware('qa', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { test_case_id, build_id, status, execution_time, error_message, logs } = req.body;

        if (!test_case_id || !build_id || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: result, error } = await supabase!
            .from('test_results')
            .insert({
                test_case_id,
                build_id,
                status,
                execution_time,
                error_message,
                logs
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/qa/builds
router.get('/builds', authMiddleware, workspaceAccessMiddleware('qa'), async (req: AuthRequest, res: Response) => {
    try {
        const { status, limit = 20 } = req.query;

        let query = supabase!
            .from('builds')
            .select(`
        id,
        name,
        version,
        status,
        total_tests,
        passed_tests,
        failed_tests,
        created_by(full_name),
        created_at
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

// POST /api/v1/workspaces/qa/builds
router.post('/builds', authMiddleware, workspaceAccessMiddleware('qa', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { name, version, total_tests } = req.body;

        if (!name || !version) {
            return res.status(400).json({ error: 'Name and version required' });
        }

        const { data: build, error } = await supabase!
            .from('builds')
            .insert({
                workspace_id: req.workspace?.id,
                name,
                version,
                status: 'pending',
                total_tests: total_tests || 0,
                passed_tests: 0,
                failed_tests: 0,
                created_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(build);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/workspaces/qa/defects
router.get('/defects', authMiddleware, workspaceAccessMiddleware('qa'), async (req: AuthRequest, res: Response) => {
    try {
        const { status, severity } = req.query;

        let query = supabase!
            .from('defects')
            .select(`
        id,
        title,
        description,
        severity,
        status,
        build_id,
        assigned_to(full_name),
        reported_by(full_name),
        created_at,
        updated_at
      `)
            .eq('workspace_id', req.workspace?.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (severity) {
            query = query.eq('severity', severity);
        }

        const { data: defects, error } = await query;

        if (error) throw error;

        res.json(defects || []);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST /api/v1/workspaces/qa/defects
router.post('/defects', authMiddleware, workspaceAccessMiddleware('qa', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, severity, build_id, assigned_to } = req.body;

        if (!title || !severity || !build_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: defect, error } = await supabase!
            .from('defects')
            .insert({
                workspace_id: req.workspace?.id,
                title,
                description,
                severity,
                build_id,
                status: 'new',
                assigned_to,
                reported_by: req.user?.id
            })
            .select()
            .single();

        if (error) throw error;

        try {


            await supabase!.from('audit_logs').insert({
            org_id: req.user?.org_id,
            user_id: req.user?.id,
            action: 'defect_reported',
            resource_type: 'defect',
            resource_id: defect.id
        });


        } catch (e) {}

        res.status(201).json(defect);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/workspaces/qa/defects/:defectId
router.put('/defects/:defectId', authMiddleware, workspaceAccessMiddleware('qa', 'editor'), async (req: AuthRequest, res: Response) => {
    try {
        const { defectId } = req.params;
        const { status, severity, assigned_to } = req.body;

        const { data: defect, error } = await supabase!
            .from('defects')
            .update({
                status: status || undefined,
                severity: severity || undefined,
                assigned_to: assigned_to || undefined
            })
            .eq('id', defectId)
            .select()
            .single();

        if (error) throw error;

        res.json(defect);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;


