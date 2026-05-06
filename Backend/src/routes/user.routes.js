import { Router } from 'express';
import { listUsers, updateRole, deleteUser } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { validate, roleUpdateSchema } from '../validators/schemas.js';

const r = Router();
r.use(requireAuth);
r.get('/', requireAdmin, listUsers);
r.patch('/:id/role', requireAdmin, validate(roleUpdateSchema), updateRole);
r.delete('/:id', requireAdmin, deleteUser);

export default r;
