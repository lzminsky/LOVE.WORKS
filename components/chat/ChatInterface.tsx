"use client";

import { useCallback } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { COPY, CONFIG } from "@/lib/constants";

interface ChatInterfaceProps {
  onShowGate: () => void;
  onShowAbout: () => void;
  onShowExport: () => void;
  onShowResetConfirm: () => void;
}

export function ChatInterface({
  onShowGate,
  onShowAbout,
  onShowExport,
  onShowResetConfirm,
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
    <div className="flex min-h-screen flex-col bg-background">
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

      <ChatInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={!isUnlocked && promptCount >= CONFIG.maxFreeMessages}
      />

      <Footer />
    </div>
  );
}
