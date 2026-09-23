import { z } from 'zod';
export const taskSchema = z.object({ title: z.string().min(2), status: z.enum(['todo', 'doing', 'done']) });
export const emailSchema = z.string().email();
export function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
export function formatDate(iso: string) { return new Date(iso).toLocaleDateString(); }
export function paginate<T>(items: T[], page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total: items.length, page, limit };
}
export const BRAND = { primary: '#6C5CFF', accent: '#00E5CC', ink: '#0B0B14' };
