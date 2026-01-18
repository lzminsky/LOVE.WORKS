"use client";

import { useState, useEffect } from "react";
import { useCountUp } from "@/hooks/useCountUp";

export type ProbabilityLevel = "high" | "medium" | "low" | "minimal";

interface ProbabilityRowProps {
  outcome: string;
  probability: number;
  level: ProbabilityLevel;
  delay?: number;
  animate?: boolean;
}

const levelColors: Record<ProbabilityLevel, { dot: string; text: string; value: string }> = {
  high: {
    dot: "bg-accent",
    text: "text-text",
    value: "text-accent",
  },
  medium: {
    dot: "bg-muted",
    text: "text-muted",
    value: "text-muted",
  },
  low: {
    dot: "bg-muted-dark",
    text: "text-muted",
    value: "text-muted-dark",
  },
  minimal: {
    dot: "bg-neutral-700",
    text: "text-muted",
    value: "text-neutral-700",
  },
};

export function ProbabilityRow({
  outcome,
  probability,
  level,
  delay = 0,
  animate = true,
}: ProbabilityRowProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const displayValue = useCountUp(probability, 600, shouldAnimate);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setShouldAnimate(true), delay);
      return () => clearTimeout(timer);
    }
  }, [animate, delay]);

  const colors = levelColors[level];

  return (
    <div
      className={`flex items-center gap-3 transition-opacity duration-300 ${
        shouldAnimate ? "opacity-100" : "opacity-30"
      }`}
    >
      <div className={`h-2 w-2 flex-shrink-0 rounded-full ${colors.dot}`} />
      <span className={`w-9 flex-shrink-0 font-mono text-[13px] ${colors.value}`}>
        {shouldAnimate ? displayValue : 0}%
      </span>
      <span className={`text-sm ${colors.text}`}>{outcome}</span>
    </div>
  );
}
