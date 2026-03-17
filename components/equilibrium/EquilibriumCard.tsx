"use client";

import { ProbabilityRow, ProbabilityLevel } from "./ProbabilityRow";
import { useSkin } from "@/lib/skin-context";

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
  const { skin } = useSkin();
  const isSoft = skin === "soft";

  return (
    <div
      className={`relative overflow-hidden bg-[var(--card-bg)] ${
        isSoft
          ? "rounded-2xl sm:rounded-[20px] p-5 sm:p-10"
          : "rounded-xl border border-[var(--border)] sm:rounded-2xl p-4 sm:p-8"
      }`}
      style={isSoft ? { boxShadow: "0 1px 4px rgba(0,0,0,0.05)" } : undefined}
    >
      {/* Top accent line */}
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-accent to-accent/20" />

      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-5">
        <span className="rounded bg-[var(--overlay-hover)] px-2 py-0.5 font-mono text-[10px] text-muted-dark sm:px-2.5 sm:py-1 sm:text-xs">
          {id}
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-[10px] text-muted-dark sm:text-xs">Model confidence</span>
          <span className="font-mono text-xs font-semibold text-accent sm:text-sm">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className={`mb-1.5 text-xl leading-tight tracking-tight text-text sm:mb-2 sm:text-[32px] ${
        isSoft ? "font-serif-display font-normal" : "font-bold"
      }`}>
        {name}
      </h2>
      <p className="mb-4 text-xs text-muted sm:mb-7 sm:text-sm">{description}</p>

      {/* Predictions */}
      <div className={`flex flex-col ${isSoft ? "gap-3 sm:gap-4" : "gap-2 sm:gap-3"}`}>
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-dark sm:mb-1 sm:text-[11px]">
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
