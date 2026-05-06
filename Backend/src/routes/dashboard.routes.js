import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.use(requireAuth);
r.get('/', getDashboard);

export default r;
