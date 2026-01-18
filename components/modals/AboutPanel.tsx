"use client";

import { COPY, EXTENSIONS, LINKS } from "@/lib/constants";

interface AboutPanelProps {
  onClose: () => void;
}

export function AboutPanel({ onClose }: AboutPanelProps) {
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur"
      />

      {/* Panel */}
      <div className="relative w-full max-w-[480px] animate-slide-in overflow-y-auto border-l border-white/[0.06] bg-[#0d0d0d] p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-xl text-muted-dark transition-colors hover:text-muted"
        >
          ×
        </button>

        {/* Content */}
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-dark">
          About
        </div>

        <h2 className="mb-6 text-[28px] font-semibold tracking-tight text-text">
          love.works
        </h2>

        <div className="text-[15px] leading-[1.8] text-muted">
          <p className="mb-5">{COPY.about.intro}</p>
          <p className="mb-5">{COPY.about.description}</p>
          <p className="mb-8 font-medium text-accent">{COPY.about.tagline}</p>
        </div>

        {/* The Framework */}
        <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-dark">
            The Framework
          </div>
          <div className="mb-4 text-sm leading-[1.7] text-muted">
            {COPY.about.framework}
          </div>
          <a
            href={LINKS.boundedWorks}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-4 py-2.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/20"
          >
            Read the formal model →
          </a>
        </div>

        {/* Extensions list */}
        <div className="mb-8">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-dark">
            10 Extensions
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EXTENSIONS.map((ext, i) => (
              <div
                key={i}
                className="rounded-md bg-white/[0.02] px-3 py-2.5 font-mono text-xs text-muted"
              >
                {ext}
              </div>
            ))}
          </div>
        </div>

        {/* Findings */}
        <div className="mb-8">
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-dark">
            Findings
          </div>

          {/* Finding 1 */}
          <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-2 font-mono text-[13px] text-muted-dark">01</div>
            <div className="mb-3 text-base font-semibold text-text">
              People act according to their best interests
            </div>
            <p className="text-sm leading-[1.7] text-muted">
              People aren&apos;t irrational. They&apos;re optimizing under
              constraints you can&apos;t see. The model makes those constraints
              visible.
            </p>
          </div>

          {/* Finding 2 */}
          <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-2 font-mono text-[13px] text-muted-dark">02</div>
            <div className="mb-3 text-base font-semibold text-text">
              The Manosphere is Wrong
            </div>
            <div className="text-sm leading-[1.8] text-muted">
              <p className="mb-3">
                Run the pure economic optimization for men in modern dating.
                Account for legal asymmetries, information asymmetries, exit
                costs. Solve for Nash equilibrium.
              </p>
              <p className="mb-3 text-text">
                The model&apos;s recommendation: date men.
              </p>
              <p className="mb-3 italic text-muted">
                Rollo Tomassi&apos;s next book should be The Rational Gay.
              </p>
              <p className="font-medium text-accent">
                Not a Red Pill. A Rainbow Pill.
              </p>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rounded-xl border border-accent/15 bg-accent/[0.05] p-6">
            <div className="mb-2 font-mono text-[13px] text-accent">03</div>
            <div className="mb-4 text-base font-semibold text-text">
              Love is the answer
            </div>

            <div className="mb-4 rounded-lg bg-black/30 p-4 font-mono text-[13px]">
              <div className="mb-2 font-semibold text-accent">LOVE (n.)</div>
              <div className="leading-[1.7] text-muted">
                Unilateral disarmament through costly signaling of private
                information, inviting reciprocal disarmament, creating mutual
                hold-up vulnerability that aligns incentives.
              </div>
            </div>

            <div className="mb-4 text-[13px] leading-relaxed text-muted">
              <div className="mb-2 font-semibold text-muted">
                Required structure:
              </div>
              <div className="flex flex-col gap-1.5">
                <span>1. Costly signal — disclosure that could be exploited</span>
                <span>
                  2. Unilateral disarmament — reducing your own bargaining
                  position
                </span>
                <span>3. Invitation for reciprocity — implicit request to match</span>
                <span>4. Mutual vulnerability — both parties exposed</span>
                <span>
                  5. Aligned incentives — neither benefits from extraction
                </span>
              </div>
            </div>

            <div className="text-sm leading-[1.8] text-muted">
              <p className="mb-3">
                Love and exploitation cannot coexist. Love IS the exit from
                strategic positioning.
              </p>
              <p className="mb-3 font-medium text-text">
                Choosing to be destroyable by someone—and them choosing the same
                for you.
              </p>
              <p className="text-muted">
                Not attachment. Not affection. Not &quot;I love you but I&apos;m
                keeping options open.&quot; Mutual disarmament. Equal exposure.
                The deliberate surrender of strategic advantage.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] pt-6">
          <div className="mb-3 text-[13px] text-muted-dark">
            A{" "}
            <a
              href={LINKS.boundedWorks}
              className="text-muted transition-colors hover:text-text"
            >
              bounded.works
            </a>{" "}
            product
          </div>
          <a
            href={LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-muted-dark transition-colors hover:text-muted"
          >
            {LINKS.twitterHandle}
          </a>
        </div>
      </div>
    </div>
  );
}
