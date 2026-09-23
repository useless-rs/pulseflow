import { Topbar } from '../components/layout';
import { Card, Badge, Button } from '../components/ui';
import { useLocalTasks } from '../lib/hooks';

const cols = [['todo', 'To Do'], ['doing', 'Doing'], ['done', 'Done']];

export function Kanban() {
  const { tasks, move } = useLocalTasks();
  return (
    <div>
      <Topbar title="Kanban" />
      <div className="grid md:grid-cols-3 gap-4">
        {cols.map(([key, label]) => (
          <div key={key} className="bg-white/[0.02] rounded-2xl p-3 border border-white/5">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="font-semibold">{label}</span>
              <Badge>{tasks.filter(t => t.status === key).length}</Badge>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.status === key).map(t => (
                <Card key={t.id}>
                  <div className="font-medium text-sm">{t.title}</div>
                  <div className="mt-2 flex gap-1.5 items-center">
                    <Badge>{t.tag}</Badge>
                    <div className="ml-auto flex gap-1">
                      {cols.filter(([k]) => k !== t.status).map(([k, l]) => (
                        <button key={k} onClick={() => move(t.id, k)} className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 hover:bg-white/10">→ {l}</button>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4"><Button>＋ New task (connects to /api/tasks)</Button></div>
    </div>
  );
}
