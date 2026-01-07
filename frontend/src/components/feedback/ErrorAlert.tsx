interface ErrorAlertProps {
  title?: string;
  message: string;
  suggestions?: string[];
}

export default function ErrorAlert({ title = 'Something went wrong', message, suggestions }: ErrorAlertProps) {
  return (
    <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-accent-600">Error</p>
      <h3 className="mt-1 text-sm font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-xs text-ink-700/80">{message}</p>
      {suggestions && suggestions.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-ink-700/70">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>• {suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
