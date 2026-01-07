interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export default function LoadingSpinner({ label, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center gap-2 text-ink-700">
      <span
        className={`inline-block animate-spin rounded-full border-2 border-ink-700/30 border-t-ink-900 ${sizeMap[size]}`}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && <span className="text-xs text-ink-700/70">{label}</span>}
    </div>
  );
}
