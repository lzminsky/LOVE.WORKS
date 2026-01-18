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

// Parse thinking block from content
function parseThinkingBlock(content: string): { mainContent: string; thinkingContent: string | null } {
  // Match <thinking>...</thinking> tags
  const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);

  if (!thinkingMatch) {
    return { mainContent: content, thinkingContent: null };
  }

  const thinkingContent = thinkingMatch[1].trim();
  const mainContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();

  return { mainContent, thinkingContent };
}

export function AIMessage({
  content,
  equilibrium,
  formalAnalysis,
  animate = true,
}: AIMessageProps) {
  // First extract thinking blocks
  const { mainContent, thinkingContent } = parseThinkingBlock(content);

  // Strip out the JSON blocks from displayed content
  const cleanContent = mainContent
    .replace(/```equilibrium\n[\s\S]*?\n```/g, "")
    .replace(/```analysis\n[\s\S]*?\n```/g, "")
    .trim();

  // Split content into paragraphs
  const paragraphs = cleanContent.split("\n\n").filter(Boolean);

  // Determine if we have any formal analysis to show
  const hasStructuredAnalysis = formalAnalysis &&
    ((formalAnalysis.parameters && formalAnalysis.parameters.length > 0) ||
     (formalAnalysis.extensions && formalAnalysis.extensions.length > 0));
  const hasThinking = thinkingContent && thinkingContent.length > 0;
  const showFormalSection = hasStructuredAnalysis || hasThinking;

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

      {/* Formal Analysis Toggle - shows structured data and/or raw thinking */}
      {showFormalSection && (
        <FormalAnalysis
          parameters={formalAnalysis?.parameters}
          extensions={formalAnalysis?.extensions}
          rawThinking={thinkingContent || undefined}
        />
      )}
    </div>
  );
}
