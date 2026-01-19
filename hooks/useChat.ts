import { useState, useCallback, useRef } from "react";

export type ConversationPhase = "INTAKE" | "BUILDING" | "DIAGNOSIS";

export interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  phase?: ConversationPhase;
  equilibrium?: Equilibrium;
  formalAnalysis?: FormalAnalysis;
}

export interface Equilibrium {
  id: string;
  name: string;
  description: string;
  confidence: number;
  predictions: {
    outcome: string;
    probability: number;
    level: "high" | "medium" | "low" | "minimal";
  }[];
}

export interface FormalAnalysis {
  parameters: {
    param: string;
    value: string;
    basis: string;
  }[];
  extensions: {
    id: string;
    name: string;
    status: "ACTIVE" | "LIKELY" | "POSSIBLE";
    detail: string;
  }[];
}

interface StreamChunk {
  type: "text" | "equilibrium" | "analysis" | "done";
  content?: string;
  data?: Equilibrium | FormalAnalysis;
  promptCount?: number;
  maxPrompts?: number;
  isUnlocked?: boolean;
}

interface UseChatOptions {
  onGateRequired?: () => void;
  initialMessages?: Message[];
}

export function useChat(options: UseChatOptions = {}) {
  const { onGateRequired, initialMessages = [] } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptCount, setPromptCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Create placeholder for assistant message
      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Prepare messages for API (exclude system messages, they're in the backend)
      const apiMessages = [...messages, userMessage]
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortControllerRef.current.signal,
        });

        if (response.status === 403) {
          const data = await response.json();
          if (data.error === "gate_required") {
            // Remove the empty assistant message
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            setIsLoading(false);
            onGateRequired?.();
            return;
          }
        }

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        // Process streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let equilibrium: Equilibrium | undefined;
        let formalAnalysis: FormalAnalysis | undefined;
        let phase: ConversationPhase | undefined;

        // Helper to extract phase from content
        const extractPhase = (content: string): ConversationPhase | undefined => {
          const match = content.match(/<phase>(INTAKE|BUILDING|DIAGNOSIS)<\/phase>/);
          return match ? (match[1] as ConversationPhase) : undefined;
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const chunk: StreamChunk = JSON.parse(line);

              switch (chunk.type) {
                case "text":
                  accumulatedContent += chunk.content || "";
                  // Extract phase if not yet found
                  if (!phase) {
                    phase = extractPhase(accumulatedContent);
                  }
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: accumulatedContent, phase }
                        : m
                    )
                  );
                  break;

                case "equilibrium":
                  equilibrium = chunk.data as Equilibrium;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, equilibrium } : m
                    )
                  );
                  break;

                case "analysis":
                  formalAnalysis = chunk.data as FormalAnalysis;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, formalAnalysis } : m
                    )
                  );
                  break;

                case "done":
                  if (chunk.promptCount !== undefined) {
                    setPromptCount(chunk.promptCount);
                  }
                  if (chunk.isUnlocked !== undefined) {
                    setIsUnlocked(chunk.isUnlocked);
                  }
                  break;
              }
            } catch {
              // Ignore malformed chunks
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled
          return;
        }
        setError("Failed to send message. Please try again.");
        // Remove the failed assistant message
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, onGateRequired]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setMessages(initialMessages);
    setError(null);
    setIsLoading(false);
  }, [initialMessages]);

  return {
    messages,
    isLoading,
    error,
    promptCount,
    isUnlocked,
    sendMessage,
    cancel,
    clearError,
    reset,
  };
}
