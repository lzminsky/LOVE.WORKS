"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { EquilibriumCard } from "@/components/equilibrium/EquilibriumCard";
import { FormalAnalysis as FormalAnalysisComponent } from "@/components/equilibrium/FormalAnalysis";
import { DiagnosisReveal } from "@/components/chat/DiagnosisReveal";
import { playRevealTone } from "@/lib/audio";
import { detectSafetyResponse } from "@/lib/safety";
import { SafetyMessage } from "@/components/chat/SafetyMessage";
import { useSkin } from "@/lib/skin-context";
import type { ConversationPhase, Equilibrium, FormalAnalysis } from "@/lib/types";

interface AIMessageProps {
  content: string;
  phase?: ConversationPhase;
  equilibrium?: Equilibrium;
  formalAnalysis?: FormalAnalysis;
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
  const [revealed, setRevealed] = useState(false);
  const { skin } = useSkin();
  const isSoft = skin === "soft";

  // Check for safety-flagged response before any other processing
  const safetyContent = detectSafetyResponse(content);
  if (safetyContent) {
    return <SafetyMessage content={safetyContent} />;
  }

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

  // Blind reveal: if there's an equilibrium card but not yet revealed (and not streaming)
  const needsReveal = showEquilibriumCard && !revealed && !isStreaming;

  // Get phase-appropriate loading message
  const loadingMessage = getPhaseLoadingMessage(phase);

  const handleReveal = () => {
    playRevealTone();
    setRevealed(true);
  };

  return (
    <div className={`overflow-hidden rounded-xl bg-[var(--overlay)] ${isSoft ? "p-5 sm:p-8" : "p-4 sm:p-6"}`}>
      {/* Phase indicator for DIAGNOSIS */}
      {phase === "DIAGNOSIS" && !cleanContent && !showThinkingIndicator && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Full Analysis
        </div>
      )}

      {/* Thinking indicator while streaming */}
      {showThinkingIndicator && !cleanContent && (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-dark sm:mb-6 sm:gap-3 sm:text-[13px]">
          <span className={`${isSoft ? "font-serif-display" : "font-mono"} text-accent`}>ƒ</span>
          <span>{loadingMessage}</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      )}

      {/* Response text */}
      {cleanContent && (
        <div className={showEquilibriumCard || showFormalSection ? "mb-6 sm:mb-8" : ""}>
          <div className="prose prose-sm prose-neutral max-w-none prose-p:text-muted prose-p:leading-relaxed prose-strong:text-text prose-em:text-muted prose-ol:text-muted prose-ul:text-muted prose-li:text-muted sm:prose-base">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 sm:mb-4 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
                em: ({ children }) => <em className="text-muted">{children}</em>,
                ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-3">{children}</ol>,
                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-3">{children}</ul>,
                li: ({ children }) => <li className="text-text">{children}</li>,
              }}
            >
              {cleanContent}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Blind Reveal prompt — shown when diagnosis ready but not yet revealed */}
      {needsReveal && (
        <div className="mb-4 sm:mb-6">
          <DiagnosisReveal onReveal={handleReveal} />
        </div>
      )}

      {/* Equilibrium Card - ONLY in DIAGNOSIS phase, after reveal */}
      {showEquilibriumCard && (revealed || isStreaming) && (
        <div
          className="mb-4 sm:mb-6"
          style={{
            animation: revealed && !isStreaming ? "revealCard 200ms ease-out forwards" : undefined,
          }}
        >
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

      {/* Formal Analysis Toggle - shows structured data and/or raw thinking, only after reveal */}
      {showFormalSection && (!showEquilibriumCard || revealed) && (
        <FormalAnalysisComponent
          parameters={formalAnalysis?.parameters}
          extensions={formalAnalysis?.extensions}
          rawThinking={thinkingContent || undefined}
        />
      )}
    </div>
  );
}
