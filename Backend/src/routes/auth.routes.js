import { Router } from 'express';
import { signup, login, logout, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, signupSchema, loginSchema } from '../validators/schemas.js';

const r = Router();
r.post('/signup', validate(signupSchema), signup);
r.post('/login', validate(loginSchema), login);
r.post('/logout', logout);
r.get('/me', requireAuth, me);

export default r;
