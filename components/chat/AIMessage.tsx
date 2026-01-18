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

// Parse thinking block from content - handles both complete and incomplete blocks during streaming
function parseThinkingBlock(content: string): {
  mainContent: string;
  thinkingContent: string | null;
  isStreaming: boolean;
} {
  // Check for complete thinking block
  const completeMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);

  if (completeMatch) {
    const thinkingContent = completeMatch[1].trim();
    const mainContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();
    return { mainContent, thinkingContent, isStreaming: false };
  }

  // Check for incomplete thinking block (streaming in progress)
  const incompleteMatch = content.match(/<thinking>([\s\S]*)$/);

  if (incompleteMatch) {
    // Thinking block started but not finished - hide it from main content
    const mainContent = content.replace(/<thinking>[\s\S]*$/, "").trim();
    const thinkingContent = incompleteMatch[1].trim();
    return { mainContent, thinkingContent, isStreaming: true };
  }

  // No thinking block at all
  return { mainContent: content, thinkingContent: null, isStreaming: false };
}

export function AIMessage({
  content,
  equilibrium,
  formalAnalysis,
  animate = true,
}: AIMessageProps) {
  // First extract thinking blocks
  const { mainContent, thinkingContent, isStreaming } = parseThinkingBlock(content);

  // Strip out the JSON blocks from displayed content
  // Also strip any incomplete JSON blocks during streaming
  const cleanContent = mainContent
    .replace(/```equilibrium\n[\s\S]*?\n```/g, "")
    .replace(/```analysis\n[\s\S]*?\n```/g, "")
    .replace(/```equilibrium[\s\S]*$/g, "") // Incomplete equilibrium block
    .replace(/```analysis[\s\S]*$/g, "") // Incomplete analysis block
    .trim();

  // Split content into paragraphs
  const paragraphs = cleanContent.split("\n\n").filter(Boolean);

  // Determine if we have any formal analysis to show (only when not streaming)
  const hasStructuredAnalysis = formalAnalysis &&
    ((formalAnalysis.parameters && formalAnalysis.parameters.length > 0) ||
     (formalAnalysis.extensions && formalAnalysis.extensions.length > 0));
  const hasThinking = thinkingContent && thinkingContent.length > 0 && !isStreaming;
  const showFormalSection = hasStructuredAnalysis || hasThinking;

  // Show thinking indicator while streaming formal analysis
  const showThinkingIndicator = isStreaming && thinkingContent && thinkingContent.length > 0;

  return (
    <div className="rounded-xl bg-white/[0.02] p-6">
      {/* Thinking indicator while streaming */}
      {showThinkingIndicator && paragraphs.length === 0 && (
        <div className="mb-6 flex items-center gap-3 text-[13px] text-neutral-500">
          <span className="font-mono text-accent">ƒ</span>
          <span>Reasoning formally</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      )}

      {/* Response text */}
      {paragraphs.length > 0 && (
        <div className={equilibrium || showFormalSection ? "mb-8" : ""}>
          <div className="text-[15px] leading-[1.8] text-neutral-300">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className={i < paragraphs.length - 1 ? "mb-4" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

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
