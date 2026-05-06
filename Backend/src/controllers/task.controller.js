import Task from '../models/Task.js';
import Project from '../models/Project.js';

export async function listTasks(req, res, next) {
  try {
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) { next(err); }
}

export async function createTask(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';
    const assignee = req.body.assignee || null;
    if (assignee && !isAdmin && assignee !== req.user._id.toString()) {
      return res.status(403).json({ error: { message: 'Members can only assign tasks to themselves' } });
    }
    const task = await Task.create({
      ...req.body,
      project: req.params.id,
      createdBy: req.user._id,
    });
    const populated = await task.populate([
      { path: 'assignee', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
    ]);
    res.status(201).json({ task: populated });
  } catch (err) { next(err); }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: { message: 'Task not found' } });
    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ error: { message: 'Project not found' } });
    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignee && task.assignee.equals(req.user._id);
    const isCreator = task.createdBy && task.createdBy.equals(req.user._id);
    if (!isAdmin && !isAssignee && !isCreator) {
      return res.status(403).json({ error: { message: 'Not allowed to update this task' } });
    }
    if (req.body.assignee && !isAdmin && req.body.assignee !== req.user._id.toString()) {
      return res.status(403).json({ error: { message: 'Members can only assign tasks to themselves' } });
    }
    Object.assign(task, req.body);
    await task.save();
    const populated = await task.populate([
      { path: 'assignee', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
    ]);
    res.json({ task: populated });
  } catch (err) { next(err); }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: { message: 'Task not found' } });
    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignee && task.assignee.equals(req.user._id);
    const isCreator = task.createdBy && task.createdBy.equals(req.user._id);
    if (!isAdmin && !isAssignee && !isCreator) {
      return res.status(403).json({ error: { message: 'Not allowed to delete this task' } });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
}
