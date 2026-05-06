import Task from '../models/Task.js';
import Project from '../models/Project.js';

export async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const projectFilter = isAdmin ? {} : { members: userId };
    const projects = await Project.find(projectFilter).select('_id name');
    const projectIds = projects.map((p) => p._id);

    const myTasks = await Task.find({ assignee: userId })
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(50);

    const visibleTasks = await Task.find({ project: { $in: projectIds } });
    const byStatus = { todo: 0, in_progress: 0, done: 0 };
    for (const t of visibleTasks) byStatus[t.status]++;

    const now = new Date();
    const overdue = await Task.find({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      dueDate: { $ne: null, $lt: now },
    })
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .sort({ dueDate: 1 })
      .limit(50);

    res.json({
      myTasks,
      byStatus,
      overdue,
      projectCount: projects.length,
    });
  } catch (err) { next(err); }
}
