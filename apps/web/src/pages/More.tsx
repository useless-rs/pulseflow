import { Topbar } from '../components/layout';
import { Card } from '../components/ui';

export function Analytics() {
  const bars = [40, 65, 50, 80, 62, 90, 74];
  return (
    <div>
      <Topbar title="Analytics" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-semibold mb-3">Throughput by day</div>
          <div className="flex items-end gap-2 h-36">
            {bars.map((h, i) => <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-[#6C5CFF] to-[#00E5CC]" style={{ height: `${h}%` }} />)}
          </div>
        </Card>
        <Card>
          <div className="font-semibold mb-3">Insights</div>
          <ul className="text-sm text-white/70 space-y-2 list-disc pl-5">
            <li>Doing WIP is healthy at 9 — cap at 12.</li>
            <li>Cycle time down 18% after WS realtime.</li>
            <li>Export CSV from API: <code>/api/tasks</code>.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function Calendar() {
  return (
    <div>
      <Topbar title="Calendar" />
      <Card><div className="text-white/60 text-sm">Sprint view — connect deadlines from tasks. Coming next loop: drag deadlines.</div></Card>
    </div>
  );
}

export function Settings() {
  return (
    <div>
      <Topbar title="Settings" />
      <Card><div className="font-semibold">Workspace</div><div className="text-sm text-white/60 mt-1">Theme, API URL, token. Brand: #6C5CFF / #00E5CC on #0B0B14.</div></Card>
    </div>
  );
}

export function Login() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <Card>
        <div className="text-2xl font-extrabold">Welcome back <span className="pf-gradient-text">to PulseFlow</span></div>
        <div className="text-sm text-white/50 mt-1">demo@pulseflow.io / password123</div>
        <input id="email" defaultValue="demo@pulseflow.io" className="mt-4 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
        <input id="pw" type="password" defaultValue="password123" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
        <button onClick={async () => {
          const email = (document.getElementById('email') as HTMLInputElement).value;
          const password = (document.getElementById('pw') as HTMLInputElement).value;
          const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
          const j = await r.json();
          if (j.token) { localStorage.setItem('pf_token', j.token); location.href = '/'; }
          else alert('Login failed');
        }} className="mt-3 w-full py-2 rounded-xl font-semibold bg-gradient-to-r from-[#6C5CFF] to-[#00E5CC] text-black">Sign in</button>
      </Card>
    </div>
  );
}
