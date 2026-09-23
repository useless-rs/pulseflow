import { useEffect, useRef, useState } from 'react';

export interface DrawerTask {
  id: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  dueDate?: string;
}

export interface TaskPatch {
  title: string;
  description: string;
  tags: string[];
  status: 'todo' | 'doing' | 'done';
  dueDate?: string;
}

export function TaskDrawer({ task, onClose, onSave, onDelete }: {
  task: DrawerTask;
  onClose: () => void;
  onSave: (patch: TaskPatch) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [tags, setTags] = useState(task.tags.join(', '));
  const [status, setStatus] = useState<TaskPatch['status']>(
    task.status === 'doing' || task.status === 'done' ? task.status : 'todo'
  );
  const [due, setDue] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = () => {
    onSave({
      title: title.trim() || task.title,
      description,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      status,
      dueDate: due ? new Date(`${due}T00:00:00`).toISOString() : undefined,
    });
  };

  const remove = () => {
    if (window.confirm(`Delete "${task.title}"?`)) onDelete();
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Details for ${task.title}`}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#14141F] border-l border-white/10 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Task details</h2>
          <button onClick={onClose} aria-label="Close details" className="px-2 py-1 rounded-lg border border-white/10 text-sm hover:bg-white/5">✕</button>
        </div>
        <label className="block text-xs text-white/50 mb-1" htmlFor="drawer-title">Title</label>
        <input id="drawer-title" ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm mb-3" />
        <label className="block text-xs text-white/50 mb-1" htmlFor="drawer-desc">Description</label>
        <textarea id="drawer-desc" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm mb-3" />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs text-white/50 mb-1" htmlFor="drawer-status">Status</label>
            <select id="drawer-status" value={status} onChange={e => setStatus(e.target.value as TaskPatch['status'])} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
              <option value="todo">To Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1" htmlFor="drawer-tags">Tags (comma separated)</label>
            <input id="drawer-tags" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs text-white/50 mb-1" htmlFor="drawer-due">Due date</label>
          <div className="flex gap-2">
            <input id="drawer-due" type="date" value={due} onChange={e => setDue(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            {due && <button onClick={() => setDue('')} aria-label="Clear due date" className="px-3 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/5">✕</button>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="flex-1 py-2 rounded-xl font-semibold bg-gradient-to-r from-[#6C5CFF] to-[#00E5CC] text-black text-sm">Save changes</button>
          <button onClick={remove} className="px-4 py-2 rounded-xl border border-[#FF5C7A]/40 text-[#FF5C7A] text-sm hover:bg-[#FF5C7A]/10">Delete</button>
        </div>
      </aside>
    </div>
  );
}
