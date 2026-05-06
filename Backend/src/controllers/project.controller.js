import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

export async function listProjects(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? {} : { members: req.user._id };
    const projects = await Project.find(filter)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) { next(err); }
}

export async function createProject(req, res, next) {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    const populated = await project.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'members', select: 'name email role' },
    ]);
    res.status(201).json({ project: populated });
  } catch (err) { next(err); }
}

export async function getProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');
    if (!project) return res.status(404).json({ error: { message: 'Project not found' } });
    res.json({ project });
  } catch (err) { next(err); }
}

export async function updateProject(req, res, next) {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');
    if (!project) return res.status(404).json({ error: { message: 'Project not found' } });
    res.json({ project });
  } catch (err) { next(err); }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: { message: 'Project not found' } });
    await Task.deleteMany({ project: project._id });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function addMember(req, res, next) {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    )
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');
    if (!project) return res.status(404).json({ error: { message: 'Project not found' } });
    res.json({ project });
  } catch (err) { next(err); }
}

export async function removeMember(req, res, next) {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.userId } },
      { new: true }
    )
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');
    if (!project) return res.status(404).json({ error: { message: 'Project not found' } });
    res.json({ project });
  } catch (err) { next(err); }
}
