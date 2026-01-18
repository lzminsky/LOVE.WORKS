"use client";

import { EquilibriumCard } from "@/components/equilibrium/EquilibriumCard";
import { FormalAnalysis } from "@/components/equilibrium/FormalAnalysis";
import { ProbabilityLevel } from "@/components/equilibrium/ProbabilityRow";

interface Prediction {
  outcome: string;
  probability: number;
  level: ProbabilityLevel;
}

interface Equilibrium {
  id: string;
  name: string;
  description: string;
  confidence: number;
  predictions: Prediction[];
}

interface FormalAnalysisData {
  parameters: Array<{ param: string; value: string; basis: string }>;
  extensions: Array<{
    id: string;
    name: string;
    status: "ACTIVE" | "LIKELY" | "POSSIBLE";
    detail: string;
  }>;
}

interface AIMessageProps {
  content: string;
  equilibrium?: Equilibrium;
  formalAnalysis?: FormalAnalysisData;
  animate?: boolean;
}

export function AIMessage({
  content,
  equilibrium,
  formalAnalysis,
  animate = true,
}: AIMessageProps) {
  // Split content into paragraphs
  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <div className="rounded-xl bg-white/[0.02] p-6">
      {/* Response text */}
      <div className="mb-8 text-[15px] leading-[1.8] text-neutral-300">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className={i < paragraphs.length - 1 ? "mb-4" : ""}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* Equilibrium Card */}
      {equilibrium && (
        <div className="mb-6">
          <EquilibriumCard
            id={equilibrium.id}
            name={equilibrium.name}
            description={equilibrium.description}
            confidence={equilibrium.confidence}
            predictions={equilibrium.predictions}
            animate={animate}
          />
        </div>
      )}

      {/* Formal Analysis Toggle */}
      {formalAnalysis && (
        <FormalAnalysis
          parameters={formalAnalysis.parameters}
          extensions={formalAnalysis.extensions}
        />
      )}
    </div>
  );
}
