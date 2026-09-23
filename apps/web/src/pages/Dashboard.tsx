import { Topbar } from '../components/layout';
import { Card, Badge } from '../components/ui';

export function Dashboard() {
  const kpis = [
    ['Throughput', '48 tasks/wk', '+12%'],
    ['In progress', '9', 'live'],
    ['Done', '132', '+8'],
    ['Cycle time', '1.8d', '-0.4d'],
  ];
  return (
    <div>
      <Topbar title="Good evening — here's your pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(([k, v, d]) => (
          <Card key={k}>
            <div className="text-xs text-white/50">{k}</div>
            <div className="text-2xl font-extrabold mt-1">{v}</div>
            <div className="text-xs text-[#00E5CC] mt-1">{d}</div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <div className="font-semibold mb-3">Velocity (SVG)</div>
          <svg viewBox="0 0 400 120" className="w-full h-32">
            <polyline points="0,90 50,70 100,75 150,45 200,55 250,30 300,40 350,15 400,25" fill="none" stroke="#00E5CC" strokeWidth="3" />
            <polyline points="0,100 50,95 100,90 150,85 200,80 250,70 300,65 350,60 400,55" fill="none" stroke="#6C5CFF" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </Card>
        <Card>
          <div className="font-semibold mb-3">Activity</div>
          {['Mia moved “Ship Kanban UI” to Doing', 'API broadcast task.updated', 'CI passed — build green', 'Demo login used 12×'].map(a => (
            <div key={a} className="text-sm text-white/70 py-1.5 border-b border-white/5 flex gap-2"><Badge>live</Badge>{a}</div>
          ))}
        </Card>
      </div>
    </div>
  );
}
