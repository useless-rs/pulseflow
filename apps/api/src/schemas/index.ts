import { z } from 'zod';
export const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const taskSchema = z.object({
  title: z.string().min(2), description: z.string().default(''),
  status: z.enum(['todo', 'doing', 'done']).default('todo'),
  projectId: z.string().min(1), tags: z.array(z.string()).default([]),
});
export const projectSchema = z.object({ name: z.string().min(2), description: z.string().default('') });
export const taskPatchSchema = taskSchema.partial();
export const taskQuerySchema = z.object({
  status: z.enum(['todo', 'doing', 'done']).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
