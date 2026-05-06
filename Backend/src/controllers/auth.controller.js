import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';

export async function signup(req, res, next) {
  try {
    const { name, email, password, secretKey } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: { message: 'Email already registered' } });
    const passwordHash = await bcrypt.hash(password, 10);
    const role = secretKey === process.env.ADMIN_SECRET_KEY ? 'admin' : 'member';
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role });
    setAuthCookie(res, signToken(user._id));
    res.status(201).json({ user: user.toJSON() });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    setAuthCookie(res, signToken(user._id));
    res.json({ user: user.toJSON() });
  } catch (err) { next(err); }
}

export async function logout(req, res) {
  clearAuthCookie(res);
  res.json({ ok: true });
}

export async function me(req, res) {
  res.json({ user: req.user.toJSON() });
}
