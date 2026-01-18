interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-5 px-6">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-dark">
        You
      </div>
      <p className="text-[15px] leading-[1.7] text-text">{content}</p>
    </div>
  );
}
