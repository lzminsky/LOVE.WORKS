"use client";

import { useCallback, useEffect, useRef } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChat, Equilibrium, Message } from "@/hooks/useChat";
import { COPY, CONFIG } from "@/lib/constants";
import { Analytics } from "@/lib/analytics";

interface ChatInterfaceProps {
  onShowGate: (promptCount: number) => void;
  onShowAbout: () => void;
  onShowExport: (messages: Message[]) => void;
  onShowResetConfirm: () => void;
  onEquilibriumUpdate?: (equilibrium: Equilibrium) => void;
  onMessagesUpdate?: (messages: Message[]) => void;
}

export function ChatInterface({
  onShowGate,
  onShowAbout,
  onShowExport,
  onShowResetConfirm,
  onEquilibriumUpdate,
  onMessagesUpdate,
}: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    error,
    promptCount,
    maxPrompts,
    isUnlocked,
    sendMessage,
    clearError,
  } = useChat({
    onGateRequired: (count) => {
      Analytics.gateReached(count);
      onShowGate(count);
    },
    initialMessages: [
      { id: "system-1", role: "system", content: COPY.onboarding },
    ],
  });

  // Track conversation start (first user message)
  const conversationStartedRef = useRef(false);

  // Track latest equilibrium and notify parent
  useEffect(() => {
    const latestWithEquilibrium = [...messages]
      .reverse()
      .find((m) => m.equilibrium);

    if (latestWithEquilibrium?.equilibrium && onEquilibriumUpdate) {
      onEquilibriumUpdate(latestWithEquilibrium.equilibrium);
    }
  }, [messages, onEquilibriumUpdate]);

  // Keep parent in sync with messages for export
  useEffect(() => {
    onMessagesUpdate?.(messages);
  }, [messages, onMessagesUpdate]);

  const handleSubmit = useCallback(
    async (content: string) => {
      // Track conversation start on first message
      if (!conversationStartedRef.current) {
        conversationStartedRef.current = true;
        Analytics.conversationStarted("chat");
      }

      // Track message sent
      const currentPromptCount = promptCount + 1;
      Analytics.messageSent(currentPromptCount, currentPromptCount >= maxPrompts);

      await sendMessage(content);
    },
    [sendMessage, promptCount, maxPrompts]
  );

  const handleRetry = useCallback(() => {
    clearError();
    // Could implement retry logic here
  }, [clearError]);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-background">
      {/* Scrollable area containing Header + Messages */}
      <div className="relative z-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <Header
          promptCount={promptCount}
          maxPrompts={maxPrompts}
          isUnlocked={isUnlocked}
          onAboutClick={onShowAbout}
          onExportClick={() => onShowExport(messages)}
          onNewClick={onShowResetConfirm}
        />

        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          onDismissError={clearError}
          onRetry={handleRetry}
        />
      </div>

      {/* Fixed input at bottom */}
      <ChatInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={CONFIG.messageLimitEnabled && !isUnlocked && promptCount >= maxPrompts}
      />

      <Footer />
    </div>
  );
}
