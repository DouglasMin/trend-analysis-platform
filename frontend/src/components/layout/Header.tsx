import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="glass flex items-center justify-between rounded-2xl border border-ink-700/10 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-paper shadow-md">
          TC
        </div>
        <div>
          <Link to="/" className="text-lg font-semibold text-ink-900">
            Trend Compass
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-700/70">Signal Lab</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-700">
        <span className="rounded-full border border-ink-700/15 px-3 py-1">Seoul Region</span>
        <span className="rounded-full bg-aqua-400/15 px-3 py-1 text-aqua-500">Live feed ready</span>
      </div>
    </header>
  );
}
