import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Trends', to: '/trends' },
  { label: 'News Pulse', to: '/news' },
  { label: 'Shopping Radar', to: '/shopping' },
  { label: 'Reports', to: '/reports' },
];

export default function Sidebar() {
  return (
    <aside className="glass grid-mask flex h-full flex-col rounded-3xl border border-ink-700/10 p-6">
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-700/60">Navigator</p>
          <h2 className="mt-2 text-xl font-semibold text-ink-900">Insight Paths</h2>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between rounded-xl border border-transparent px-4 py-3 text-sm font-medium transition',
                  'hover:border-ink-700/10 hover:bg-white/70',
                  isActive && 'border-ink-900/10 bg-white text-ink-900 shadow-sm'
                )
              }
              end={item.to === '/'}
            >
              <span>{item.label}</span>
              <span className="text-xs text-ink-700/60">↗</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto space-y-3 pt-6 text-xs text-ink-700/70">
        <div className="rounded-2xl border border-ink-700/15 bg-white/70 px-4 py-3">
          <p className="font-semibold text-ink-900">Cache Status</p>
          <p className="mt-1">TTL adaptive mode enabled.</p>
        </div>
        <div className="rounded-2xl border border-ink-700/15 bg-ink-900 px-4 py-3 text-paper">
          <p className="text-xs uppercase tracking-[0.2em] text-paper/70">Next sync</p>
          <p className="mt-1 text-lg font-semibold">00:04:12</p>
        </div>
      </div>
    </aside>
  );
}
