import { useState, useCallback, useRef, useEffect } from "react";
import { Analytics } from "@/lib/analytics";

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
  onGateRequired?: (promptCount: number) => void;
  onRateLimited?: (retryAfter: number) => void;
  initialMessages?: Message[];
}

// Error types for better handling
export type ChatErrorType = "rate_limited" | "api_error" | "network_error" | "timeout";

export interface ChatError {
  type: ChatErrorType;
  message: string;
  retryAfter?: number;
}

export function useChat(options: UseChatOptions = {}) {
  const { onGateRequired, onRateLimited, initialMessages = [] } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [promptCount, setPromptCount] = useState(0);
  const [maxPrompts, setMaxPrompts] = useState(10);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastMessageRef = useRef<string | null>(null);

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

  // Fetch initial session state on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/session");
        if (response.ok) {
          const data = await response.json();
          setPromptCount(data.promptCount);
          setMaxPrompts(data.maxPrompts);
          setIsUnlocked(data.isUnlocked);
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      } finally {
        setSessionLoaded(true);
      }
    }
    fetchSession();
  }, []);

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

        // Handle specific error responses
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));

          // Gate required (403)
          if (response.status === 403 && data.error === "gate_required") {
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            setIsLoading(false);
            onGateRequired?.(data.promptCount || maxPrompts);
            return;
          }

          // Rate limited (429)
          if (response.status === 429) {
            const retryAfter = data.retryAfter || 5;
            Analytics.rateLimited("per_second");
            setError({
              type: "rate_limited",
              message: `Too many requests. Please wait ${retryAfter} seconds.`,
              retryAfter,
            });
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            setIsLoading(false);
            onRateLimited?.(retryAfter);
            return;
          }

          // Server error - attempt retry
          if (response.status >= 500 && retryCount < MAX_RETRIES) {
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            setRetryCount((prev) => prev + 1);
            lastMessageRef.current = content;
            const delay = RETRY_DELAYS[retryCount] || 4000;
            setTimeout(() => {
              if (lastMessageRef.current) {
                sendMessage(lastMessageRef.current);
              }
            }, delay);
            return;
          }

          // Generic API error
          throw new Error(data.message || "Failed to send message");
        }

        // Reset retry count on success
        setRetryCount(0);
        lastMessageRef.current = null;

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

        // Determine error type
        let errorType: ChatErrorType = "api_error";
        let errorMessage = "Something went wrong. Please try again.";

        if (err instanceof TypeError && err.message.includes("fetch")) {
          errorType = "network_error";
          errorMessage = "Network error. Please check your connection.";
        } else if (err instanceof Error) {
          if (err.message.includes("timeout")) {
            errorType = "timeout";
            errorMessage = "Request timed out. Please try again.";
          } else if (err.message) {
            errorMessage = err.message;
          }
        }

        // Track error
        Analytics.errorOccurred(errorType, errorMessage);

        setError({ type: errorType, message: errorMessage });
        // Remove the failed assistant message
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, onGateRequired, onRateLimited, maxPrompts, retryCount]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    lastMessageRef.current = null;
    setRetryCount(0);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setMessages(initialMessages);
    setError(null);
    setIsLoading(false);
    setRetryCount(0);
    lastMessageRef.current = null;
  }, [initialMessages]);

  // Retry function for manual retry
  const retry = useCallback(() => {
    if (lastMessageRef.current) {
      setError(null);
      sendMessage(lastMessageRef.current);
    }
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    error,
    promptCount,
    maxPrompts,
    isUnlocked,
    sessionLoaded,
    retryCount,
    sendMessage,
    cancel,
    clearError,
    reset,
    retry,
  };
}
