export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-6">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-accent animate-pulse-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-dark">Reasoning formally...</span>
    </div>
  );
}
