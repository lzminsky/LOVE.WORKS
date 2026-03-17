"use client";

import { DISCLAIMER } from "@/lib/constants";
import type { Equilibrium } from "@/lib/types";

interface VerticalCardProps {
  equilibrium: Equilibrium;
  showPredictions?: boolean;
}

export function VerticalCard({ equilibrium, showPredictions = true }: VerticalCardProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-[var(--modal-bg)] p-8 text-center"
      style={{ aspectRatio: "1080/1920" }}
    >
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top section — ID + Confidence */}
      <div className="relative z-10 flex items-center gap-2 pt-8">
        <span className="rounded bg-[var(--overlay-hover)] px-2.5 py-1 font-mono text-xs text-muted-dark">
          {equilibrium.id}
        </span>
        <span className="text-xs font-medium text-accent">
          {equilibrium.confidence}% confidence
        </span>
      </div>

      {/* Center section — Name + Description */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="h-0.5 w-8 bg-gradient-to-r from-accent to-accent/20" />
        <h1 className="text-[48px] font-bold leading-[1.1] tracking-tight text-text">
          {equilibrium.name}
        </h1>
        <p className="max-w-[320px] text-base leading-relaxed text-muted">
          {equilibrium.description}
        </p>
      </div>

      {/* Bottom section — Predictions + watermark */}
      <div className="relative z-10 flex w-full flex-col items-center gap-6 pb-6">
        {showPredictions && (
          <div className="flex w-full max-w-[300px] flex-col gap-2.5">
            {equilibrium.predictions.map((pred, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted">{pred.outcome}</span>
                <span className="font-mono text-accent">{pred.probability}%</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-sm font-semibold text-muted-dark">
          lovebomb.works
        </div>
        <div className="text-[9px] text-muted-darker">
          {DISCLAIMER}
        </div>
      </div>
    </div>
  );
}
