import { Router } from 'express';
import {
  listProjects, createProject, getProject, updateProject,
  deleteProject, addMember, removeMember,
} from '../controllers/project.controller.js';
import { listTasks, createTask } from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin, requireProjectMember } from '../middleware/role.js';
import {
  validate, projectSchema, projectUpdateSchema, memberAddSchema, taskSchema,
} from '../validators/schemas.js';

const r = Router();
r.use(requireAuth);

r.get('/', listProjects);
r.post('/', requireAdmin, validate(projectSchema), createProject);
r.get('/:id', requireProjectMember('id'), getProject);
r.patch('/:id', requireAdmin, validate(projectUpdateSchema), updateProject);
r.delete('/:id', requireAdmin, deleteProject);
r.post('/:id/members', requireAdmin, validate(memberAddSchema), addMember);
r.delete('/:id/members/:userId', requireAdmin, removeMember);

r.get('/:id/tasks', requireProjectMember('id'), listTasks);
r.post('/:id/tasks', requireProjectMember('id'), validate(taskSchema), createTask);

export default r;
