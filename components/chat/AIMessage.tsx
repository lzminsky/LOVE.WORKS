"use client";

import { EquilibriumCard } from "@/components/equilibrium/EquilibriumCard";
import { FormalAnalysis } from "@/components/equilibrium/FormalAnalysis";
import { ProbabilityLevel } from "@/components/equilibrium/ProbabilityRow";
import { ConversationPhase } from "@/hooks/useChat";

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
  phase?: ConversationPhase;
  equilibrium?: Equilibrium;
  formalAnalysis?: FormalAnalysisData;
  animate?: boolean;
}

// Parse phase and thinking block from content - handles both complete and incomplete blocks during streaming
function parseContent(content: string): {
  mainContent: string;
  thinkingContent: string | null;
  isStreaming: boolean;
} {
  // First, strip the phase tag (it's metadata, not display content)
  let processedContent = content.replace(/<phase>(INTAKE|BUILDING|DIAGNOSIS)<\/phase>\s*/g, "");

  // Check for complete thinking block
  const completeMatch = processedContent.match(/<thinking>([\s\S]*?)<\/thinking>/);

  if (completeMatch) {
    const thinkingContent = completeMatch[1].trim();
    const mainContent = processedContent.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();
    return { mainContent, thinkingContent, isStreaming: false };
  }

  // Check for incomplete thinking block (streaming in progress)
  const incompleteMatch = processedContent.match(/<thinking>([\s\S]*)$/);

  if (incompleteMatch) {
    // Thinking block started but not finished - hide it from main content
    const mainContent = processedContent.replace(/<thinking>[\s\S]*$/, "").trim();
    const thinkingContent = incompleteMatch[1].trim();
    return { mainContent, thinkingContent, isStreaming: true };
  }

  // No thinking block at all
  return { mainContent: processedContent, thinkingContent: null, isStreaming: false };
}

// Get phase-specific loading message
function getPhaseLoadingMessage(phase?: ConversationPhase): string {
  switch (phase) {
    case "INTAKE":
      return "Scanning patterns";
    case "BUILDING":
      return "Mapping dynamics";
    case "DIAGNOSIS":
      return "Running full analysis";
    default:
      return "Reasoning formally";
  }
}

export function AIMessage({
  content,
  phase,
  equilibrium,
  formalAnalysis,
  animate = true,
}: AIMessageProps) {
  // First extract thinking blocks (also strips phase tags)
  const { mainContent, thinkingContent, isStreaming } = parseContent(content);

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

  // Only show equilibrium card in DIAGNOSIS phase
  const showEquilibriumCard = equilibrium && phase === "DIAGNOSIS";

  // Get phase-appropriate loading message
  const loadingMessage = getPhaseLoadingMessage(phase);

  return (
    <div className="overflow-hidden rounded-xl bg-white/[0.02] p-4 sm:p-6">
      {/* Phase indicator for DIAGNOSIS */}
      {phase === "DIAGNOSIS" && paragraphs.length === 0 && !showThinkingIndicator && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Full Analysis
        </div>
      )}

      {/* Thinking indicator while streaming */}
      {showThinkingIndicator && paragraphs.length === 0 && (
        <div className="mb-4 flex items-center gap-2 text-xs text-neutral-500 sm:mb-6 sm:gap-3 sm:text-[13px]">
          <span className="font-mono text-accent">ƒ</span>
          <span>{loadingMessage}</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      )}

      {/* Response text */}
      {paragraphs.length > 0 && (
        <div className={showEquilibriumCard || showFormalSection ? "mb-6 sm:mb-8" : ""}>
          <div className="break-words text-sm leading-relaxed text-neutral-300 sm:text-[15px] sm:leading-[1.8]">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className={i < paragraphs.length - 1 ? "mb-3 sm:mb-4" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Equilibrium Card - ONLY in DIAGNOSIS phase */}
      {showEquilibriumCard && (
        <div className="mb-4 sm:mb-6">
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
