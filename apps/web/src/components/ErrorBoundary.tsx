import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : 'Something broke.' };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="text-5xl font-black pf-gradient-text">Oops</div>
        <p className="text-white/60 text-sm mt-2">This view crashed: {this.state.error}</p>
        <div className="mt-4 flex gap-2 justify-center">
          <button onClick={() => this.setState({ error: null })} className="px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/5">Retry</button>
          <Link to="/" onClick={() => this.setState({ error: null })} className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6C5CFF] to-[#00E5CC] text-black">Dashboard</Link>
        </div>
      </div>
    );
  }
}
