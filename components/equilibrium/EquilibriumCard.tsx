"use client";

import { ProbabilityRow, ProbabilityLevel } from "./ProbabilityRow";

interface Prediction {
  outcome: string;
  probability: number;
  level: ProbabilityLevel;
}

interface EquilibriumCardProps {
  id: string;
  name: string;
  description: string;
  confidence: number;
  predictions: Prediction[];
  animate?: boolean;
}

export function EquilibriumCard({
  id,
  name,
  description,
  confidence,
  predictions,
  animate = true,
}: EquilibriumCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black/40 p-8">
      {/* Top accent line */}
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-accent to-accent/20" />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded bg-white/[0.05] px-2.5 py-1 font-mono text-xs text-muted-dark">
          {id}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-dark">Model confidence</span>
          <span className="font-mono text-sm font-semibold text-accent">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className="mb-2 text-[32px] font-bold leading-tight tracking-tight text-white">
        {name}
      </h2>
      <p className="mb-7 text-sm text-muted">{description}</p>

      {/* Predictions */}
      <div className="flex flex-col gap-3">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-dark">
          Predictions
        </div>
        {predictions.map((pred, i) => (
          <ProbabilityRow
            key={i}
            outcome={pred.outcome}
            probability={pred.probability}
            level={pred.level}
            delay={i * 100}
            animate={animate}
          />
        ))}
      </div>
    </div>
  );
}
