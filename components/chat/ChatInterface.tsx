"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { MessageList, Message } from "./MessageList";
import { ChatInput } from "./ChatInput";
import {
  COPY,
  CONFIG,
  MOCK_AI_RESPONSE,
  MOCK_EQUILIBRIUM,
  MOCK_FORMAL_ANALYSIS,
} from "@/lib/constants";

type ErrorType = keyof typeof COPY.errors | null;

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
  const [messages, setMessages] = useState<Message[]>([
    { id: "system-1", role: "system", content: COPY.onboarding },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorType>(null);
  const [promptCount, setPromptCount] = useState(7); // Mock: 7 of 10 used
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleSubmit = useCallback(
    async (content: string) => {
      // Check if we've hit the gate
      if (!isUnlocked && promptCount >= CONFIG.maxFreeMessages) {
        onShowGate();
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add AI response with mock data
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: MOCK_AI_RESPONSE,
        equilibrium: MOCK_EQUILIBRIUM,
        formalAnalysis: MOCK_FORMAL_ANALYSIS,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);

      // Increment prompt count
      if (!isUnlocked) {
        const newCount = promptCount + 1;
        setPromptCount(newCount);

        // Check if we've now hit the gate
        if (newCount >= CONFIG.maxFreeMessages) {
          setTimeout(() => onShowGate(), 1000);
        }
      }
    },
    [isUnlocked, promptCount, onShowGate]
  );

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    // In real implementation, would retry the last request
  }, []);

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
        onDismissError={handleDismissError}
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
