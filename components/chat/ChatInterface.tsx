"use client";

import { useCallback, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChat, Equilibrium } from "@/hooks/useChat";
import { COPY, CONFIG } from "@/lib/constants";

interface ChatInterfaceProps {
  onShowGate: () => void;
  onShowAbout: () => void;
  onShowExport: () => void;
  onShowResetConfirm: () => void;
  onEquilibriumUpdate?: (equilibrium: Equilibrium) => void;
}

export function ChatInterface({
  onShowGate,
  onShowAbout,
  onShowExport,
  onShowResetConfirm,
  onEquilibriumUpdate,
}: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    error,
    promptCount,
    isUnlocked,
    sendMessage,
    clearError,
  } = useChat({
    onGateRequired: onShowGate,
    initialMessages: [
      { id: "system-1", role: "system", content: COPY.onboarding },
    ],
  });

  // Track latest equilibrium and notify parent
  useEffect(() => {
    const latestWithEquilibrium = [...messages]
      .reverse()
      .find((m) => m.equilibrium);

    if (latestWithEquilibrium?.equilibrium && onEquilibriumUpdate) {
      onEquilibriumUpdate(latestWithEquilibrium.equilibrium);
    }
  }, [messages, onEquilibriumUpdate]);

  const handleSubmit = useCallback(
    async (content: string) => {
      await sendMessage(content);
    },
    [sendMessage]
  );

  const handleRetry = useCallback(() => {
    clearError();
    // Could implement retry logic here
  }, [clearError]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Scrollable area containing Header + Messages */}
      <div className="flex-1 overflow-y-auto">
        <Header
          promptCount={promptCount}
          maxPrompts={CONFIG.maxFreeMessages}
          isUnlocked={isUnlocked}
          onAboutClick={onShowAbout}
          onExportClick={onShowExport}
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
        disabled={!isUnlocked && promptCount >= CONFIG.maxFreeMessages}
      />

      <Footer />
    </div>
  );
}
