import { Router } from 'express';
import { updateTask, deleteTask } from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { validate, taskUpdateSchema } from '../validators/schemas.js';

const r = Router();
r.use(requireAuth);
r.patch('/:id', validate(taskUpdateSchema), updateTask);
r.delete('/:id', requireAdmin, deleteTask);

export default r;
