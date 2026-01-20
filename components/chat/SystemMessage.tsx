"use client";

import { COPY } from "@/lib/constants";

const EXAMPLES = [
  "We've been dating for 8 months and he still says he's not ready for a relationship. He was hurt by his ex. I think he just needs more time.",
  "She moved in 6 months ago and now she's completely different. Cold, distant, picks fights over nothing.",
  "I found texts from his coworker. When I brought it up he said I was being insecure and controlling.",
];

export function SystemMessage() {
  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="rounded-xl border-l-2 border-accent bg-white/[0.02] p-5 px-6">
        <p className="text-[15px] leading-[1.7] text-muted">
          Think of me as that neurodivergent friend who clocks what's actually happening while everyone else is still making excuses. I'll be honest, but I actually give a shit.
        </p>
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-dark">
          People come here with things like:
        </p>
        <div className="space-y-2">
          {EXAMPLES.map((example, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <p className="text-sm italic leading-relaxed text-muted">
                "{example}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border-l-2 border-accent/50 bg-white/[0.02] p-5 px-6">
        <p className="text-[15px] leading-[1.7] text-muted">
          I'll ask a few questions to understand the full picture, then tell you what's actually happening and what's likely to happen next.
        </p>
      </div>
    </div>
  );
}
