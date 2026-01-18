import { COPY } from "@/lib/constants";

export function SystemMessage() {
  return (
    <div className="rounded-xl border-l-2 border-accent bg-white/[0.02] p-5 px-6">
      <p className="text-[15px] leading-[1.7] text-muted">{COPY.onboarding}</p>
    </div>
  );
}
