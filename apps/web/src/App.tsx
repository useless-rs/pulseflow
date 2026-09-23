import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Sidebar } from './components/layout';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import { Analytics, Calendar, Settings, Notifications } from './pages/More';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0B14] text-white flex">
        <Sidebar />
        <main className="flex-1 px-6 pb-10 max-w-6xl mx-auto w-full">
          <nav className="md:hidden flex gap-3 py-3 text-sm text-white/60">
            <Link to="/">Dash</Link><Link to="/kanban">Kanban</Link><Link to="/analytics">Stats</Link><Link to="/login">Login</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
