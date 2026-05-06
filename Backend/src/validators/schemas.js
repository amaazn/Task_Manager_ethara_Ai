import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  secretKey: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(''),
});

export const projectUpdateSchema = projectSchema.partial();

export const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  assignee: z.string().nullish(),
  status: z.enum(['todo', 'in_progress', 'done']).optional().default('todo'),
  dueDate: z.string().datetime().nullish(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  assignee: z.string().nullish(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  dueDate: z.string().datetime().nullish(),
});

export const roleUpdateSchema = z.object({
  role: z.enum(['admin', 'member']),
});

export const memberAddSchema = z.object({
  userId: z.string().min(1),
});

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Validation failed', details: result.error.issues } });
    }
    req.body = result.data;
    next();
  };
}
