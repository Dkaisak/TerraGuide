export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`tg-progress h-3 w-full overflow-hidden rounded-full ${className}`}
    >
      <div
        className="tg-progress-fill h-full rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}