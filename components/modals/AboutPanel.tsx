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

      {/* Panel - full width on mobile, slide-in on desktop */}
      <div className="relative h-full w-full animate-slide-in overflow-x-hidden overflow-y-auto border-l border-white/[0.06] bg-[#0d0d0d] px-4 py-5 pb-safe pt-safe sm:max-w-[580px] sm:px-10 sm:py-8">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center text-xl text-muted-dark transition-colors hover:text-muted sm:right-6 sm:top-6 sm:min-h-0 sm:min-w-0 sm:p-2"
        >
          ×
        </button>

        {/* Content */}
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-dark">
          About
        </div>

        <h2 className="mb-3 text-xl font-semibold tracking-tight text-text sm:mb-6 sm:text-[28px]">
          lovebomb.works
        </h2>

        <div className="text-[13px] leading-[1.7] text-muted sm:text-[15px] sm:leading-[1.8]">
          <p className="mb-3 sm:mb-5">{COPY.about.intro}</p>
          <p className="mb-3 sm:mb-5">{COPY.about.description}</p>
          <p className="mb-5 font-medium text-accent sm:mb-8">{COPY.about.tagline}</p>
        </div>

        {/* The Framework */}
        <div className="mb-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 sm:mb-6 sm:rounded-xl sm:p-5">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-dark sm:mb-3 sm:text-[11px]">
            The Framework
          </div>
          <div className="mb-3 text-[13px] leading-[1.6] text-muted sm:mb-4 sm:text-sm sm:leading-[1.7]">
            {COPY.about.framework}
          </div>
          <a
            href={LINKS.boundedWorks}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3.5 py-2 text-[12px] font-medium text-accent transition-colors hover:bg-accent/20 sm:min-h-0 sm:px-4 sm:py-2.5 sm:text-[13px]"
          >
            Read the formal model →
          </a>
        </div>

        {/* Extensions list */}
        <div className="mb-5 sm:mb-8">
          <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-dark sm:mb-4 sm:text-[11px]">
            10 Extensions
          </div>
          <div className="flex flex-wrap gap-1.5 sm:grid sm:grid-cols-2 sm:gap-2">
            {EXTENSIONS.map((ext, i) => (
              <div
                key={i}
                className="rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 font-mono text-[10px] text-muted sm:rounded-md sm:px-3 sm:py-2.5 sm:text-xs"
              >
                {ext}
              </div>
            ))}
          </div>
        </div>

        {/* Findings */}
        <div className="mb-5 sm:mb-8">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-dark sm:mb-5 sm:text-[11px]">
            Findings
          </div>

          {/* Finding 1 */}
          <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 sm:mb-6 sm:rounded-xl sm:p-5">
            <div className="mb-1.5 font-mono text-[11px] text-muted-dark sm:mb-2 sm:text-[13px]">01</div>
            <div className="mb-1.5 text-[13px] font-semibold text-text sm:mb-3 sm:text-base">
              People act according to their best interests
            </div>
            <p className="text-[13px] leading-[1.6] text-muted sm:text-sm sm:leading-[1.7]">
              People aren&apos;t irrational. They&apos;re optimizing under
              constraints you can&apos;t see. The model makes those constraints
              visible.
            </p>
          </div>

          {/* Finding 2 */}
          <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 sm:mb-6 sm:rounded-xl sm:p-5">
            <div className="mb-1.5 font-mono text-[11px] text-muted-dark sm:mb-2 sm:text-[13px]">02</div>
            <div className="mb-1.5 text-[13px] font-semibold text-text sm:mb-3 sm:text-base">
              The Manosphere is Wrong
            </div>
            <div className="text-[13px] leading-[1.6] text-muted sm:text-sm sm:leading-[1.8]">
              <p className="mb-2 sm:mb-3">
                Run the pure economic optimization for men in modern dating.
                Account for legal asymmetries, information asymmetries, exit
                costs. Solve for Nash equilibrium.
              </p>
              <p className="mb-2 text-text sm:mb-3">
                The model&apos;s recommendation: date men.
              </p>
              <p className="mb-2 italic text-muted-dark sm:mb-3">
                Rollo Tomassi&apos;s next book should be The Rational Gay.
              </p>
              <p className="font-medium text-accent">
                Not a Red Pill. A Rainbow Pill.
              </p>
            </div>
          </div>
        </div>

        {/* Finding 3 — The Climax */}
        <div className="mb-6 sm:mb-10">
          {/* Divider */}
          <div className="mb-6 flex justify-center sm:mb-12">
            <div className="h-px w-8 bg-accent/50 sm:w-10" />
          </div>

          {/* Title — centered, large */}
          <h3 className="mb-4 text-center text-lg font-semibold tracking-tight text-text sm:mb-9 sm:text-2xl">
            Love is the answer
          </h3>

          {/* Definition — centered */}
          <div className="mb-4 text-center sm:mb-7">
            <div className="mb-1.5 font-mono text-[11px] font-semibold tracking-wide text-accent sm:mb-3 sm:text-xs">
              LOVE (n.)
            </div>
            <p className="mx-auto max-w-[320px] text-[13px] leading-[1.6] text-muted sm:max-w-[400px] sm:text-[15px] sm:leading-[1.8]">
              Unilateral disarmament through costly signaling of private
              information, inviting reciprocal disarmament, creating mutual
              hold-up vulnerability that aligns incentives.
            </p>
          </div>

          {/* Required structure — faded, smaller */}
          <div className="mb-5 flex flex-col items-center gap-0.5 text-[10px] text-muted-dark sm:mb-10 sm:gap-1 sm:text-xs">
            <span className="text-center">Costly signal · Unilateral disarmament · Invitation for reciprocity</span>
            <span>Mutual vulnerability · Aligned incentives</span>
          </div>

          {/* The centerpiece line */}
          <p className="mx-auto mb-5 max-w-[300px] text-center text-base font-medium leading-snug text-text sm:mb-10 sm:max-w-[380px] sm:text-xl">
            Choosing to be destroyable by someone—and them choosing the same for you.
          </p>

          {/* Supporting text */}
          <div className="mx-auto max-w-[320px] text-center sm:max-w-[400px]">
            <p className="mb-2.5 text-[13px] leading-[1.6] text-muted-dark sm:mb-4 sm:text-sm sm:leading-[1.8]">
              Love and exploitation cannot coexist. Love IS the exit from
              strategic positioning.
            </p>
            <p className="mb-2.5 text-[13px] leading-[1.6] text-muted-dark sm:mb-4 sm:text-sm sm:leading-[1.8]">
              Not attachment. Not affection. Not &quot;I love you but I&apos;m
              keeping options open.&quot;
            </p>
            <p className="text-[13px] font-medium leading-[1.6] text-muted sm:text-[15px] sm:leading-[1.8]">
              Mutual disarmament. Equal exposure. The deliberate surrender of
              strategic advantage.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] pt-3.5 sm:pt-6">
          <div className="mb-1.5 text-[11px] text-muted-dark sm:mb-3 sm:text-[13px]">
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
            className="text-[11px] text-muted-dark transition-colors hover:text-muted sm:text-[13px]"
          >
            {LINKS.twitterHandle}
          </a>
        </div>
      </div>
    </div>
  );
}
