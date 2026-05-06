import User from '../models/User.js';

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map((u) => u.toJSON()) });
  } catch (err) { next(err); }
}

export async function updateRole(req, res, next) {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    if (user._id.equals(req.user._id) && role !== 'admin') {
      return res.status(400).json({ error: { message: 'Cannot demote yourself' } });
    }
    user.role = role;
    await user.save();
    res.json({ user: user.toJSON() });
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ error: { message: 'Cannot delete yourself' } });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
