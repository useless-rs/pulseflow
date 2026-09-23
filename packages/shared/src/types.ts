export type TaskStatus = 'todo' | 'doing' | 'done';
export interface User { id: string; name: string; email: string; role: string; }
export interface Project { id: string; name: string; description: string; taskCount?: number; }
export interface Task { id: string; title: string; description: string; status: TaskStatus; projectId: string; tags: string[]; }
export interface ApiResponse<T> { data?: T; error?: string; total?: number; }
