import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Sidebar } from './components/layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteFocus } from './components/RouteFocus';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutsHelp } from './components/ShortcutsHelp';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import { Analytics, Calendar, Settings, Notifications } from './pages/More';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0B14] text-white flex">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#6C5CFF] focus:text-black focus:text-sm focus:font-semibold">
          Skip to main content
        </a>
        <RouteFocus />
        <CommandPalette />
        <ShortcutsHelp />
        <Sidebar />
        <main id="main-content" tabIndex={-1} className="flex-1 px-6 pb-10 max-w-6xl mx-auto w-full">
          <nav aria-label="Mobile" className="md:hidden flex flex-wrap gap-x-4 gap-y-2 py-3 text-sm text-white/60">
            <Link to="/">Dash</Link><Link to="/kanban">Kanban</Link><Link to="/analytics">Stats</Link><Link to="/calendar">Calendar</Link><Link to="/notifications">Notifications</Link><Link to="/settings">Settings</Link><Link to="/login">Login</Link>
          </nav>
          <ErrorBoundary>
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
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}
