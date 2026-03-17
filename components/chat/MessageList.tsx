"use client";

import { SystemMessage } from "./SystemMessage";
import { UserMessage } from "./UserMessage";
import { AIMessage } from "./AIMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ErrorToast } from "@/components/ui/ErrorToast";
import { ChatError } from "@/hooks/useChat";
import { useSkin } from "@/lib/skin-context";
import type { Message } from "@/lib/types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: ChatError | null;
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
  const { skin } = useSkin();
  const isSoft = skin === "soft";

  return (
    <main className={`mx-auto flex w-full max-w-[680px] flex-col overflow-x-hidden ${
      isSoft ? "gap-5 p-5 sm:gap-7 sm:p-6" : "gap-4 p-4 sm:gap-6 sm:p-6"
    }`}>
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
        <ErrorToast error={error} onDismiss={onDismissError} onRetry={onRetry} />
      )}

      {/* Loading Indicator */}
      {isLoading && <TypingIndicator />}
    </main>
  );
}
