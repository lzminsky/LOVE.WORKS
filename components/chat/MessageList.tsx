"use client";

import { SystemMessage } from "./SystemMessage";
import { UserMessage } from "./UserMessage";
import { AIMessage } from "./AIMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ErrorToast } from "@/components/ui/ErrorToast";
import { COPY } from "@/lib/constants";
import { ConversationPhase } from "@/hooks/useChat";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  phase?: ConversationPhase;
  equilibrium?: {
    id: string;
    name: string;
    description: string;
    confidence: number;
    predictions: Array<{
      outcome: string;
      probability: number;
      level: "high" | "medium" | "low" | "minimal";
    }>;
  };
  formalAnalysis?: {
    parameters: Array<{ param: string; value: string; basis: string }>;
    extensions: Array<{
      id: string;
      name: string;
      status: "ACTIVE" | "LIKELY" | "POSSIBLE";
      detail: string;
    }>;
  };
}

type ErrorType = keyof typeof COPY.errors;

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: ErrorType | string | null;
  onDismissError: () => void;
  onRetry: () => void;
}

export function MessageList({
  messages,
  isLoading,
  error,
  onDismissError,
  onRetry,
}: MessageListProps) {
  return (
    <main className="mx-auto flex w-full max-w-[680px] flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      {messages.map((message, index) => {
        if (message.role === "system") {
          return <SystemMessage key={message.id} />;
        }

        if (message.role === "user") {
          return <UserMessage key={message.id} content={message.content} />;
        }

        if (message.role === "assistant") {
          return (
            <AIMessage
              key={message.id}
              content={message.content}
              phase={message.phase}
              equilibrium={message.equilibrium}
              formalAnalysis={message.formalAnalysis}
              animate={index === messages.length - 1}
            />
          );
        }

        return null;
      })}

      {/* Error Toast */}
      {error && (
        <ErrorToast type={error} onDismiss={onDismissError} onRetry={onRetry} />
      )}

      {/* Loading Indicator */}
      {isLoading && <TypingIndicator />}
    </main>
  );
}
