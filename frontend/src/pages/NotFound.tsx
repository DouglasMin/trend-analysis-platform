import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <span className="text-xs uppercase tracking-[0.3em] text-ink-700/60">Lost signal</span>
      <h1 className="text-4xl font-semibold text-ink-900">Page not found</h1>
      <p className="text-sm text-ink-700/80">
        The route you requested does not exist. Return to the dashboard to continue exploring
        trends.
      </p>
      <Link
        to="/"
        className="rounded-full border border-ink-700/10 bg-white px-4 py-2 text-xs font-semibold text-ink-900 shadow-sm"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
