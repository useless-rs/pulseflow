import { Link } from 'react-router-dom';
export function NotFound() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl font-black pf-gradient-text">404</div>
      <p className="text-white/60 mt-2">Lost the pulse? Let's get you back.</p>
      <Link to="/" className="inline-block mt-4 px-4 py-2 rounded-xl bg-white/10">→ Dashboard</Link>
    </div>
  );
}
