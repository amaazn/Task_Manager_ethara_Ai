import Project from '../models/Project.js';

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Admin access required' } });
  }
  next();
}

export function requireProjectMember(paramName = 'id') {
  return async (req, res, next) => {
    try {
      const projectId = req.params[paramName];
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ error: { message: 'Project not found' } });
      const isAdmin = req.user.role === 'admin';
      const isMember = project.members.some((m) => m.equals(req.user._id));
      if (!isAdmin && !isMember) {
        return res.status(403).json({ error: { message: 'Not a member of this project' } });
      }
      req.project = project;
      next();
    } catch (err) {
      next(err);
    }
  };
}
