"use client";

import { COPY } from "@/lib/constants";
import type { ChatError } from "@/hooks/useChat";

type ErrorType = keyof typeof COPY.errors;

interface ErrorToastProps {
  error: ChatError | string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorToast({ error, onDismiss, onRetry }: ErrorToastProps) {
  // Handle ChatError object or string
  const isChatError = typeof error === "object" && error !== null;
  const errorType = isChatError ? error.type : error;
  const errorMessage = isChatError ? error.message : error;

  // Check if it's a known error type in COPY
  const isKnownError = errorType in COPY.errors;
  const displayError = isKnownError
    ? COPY.errors[errorType as ErrorType]
    : { title: "Error", message: errorMessage };

  // Show retry for most error types except rate limiting
  const showRetry = errorType !== "rate_limited";

  return (
    <div className="flex items-start gap-3.5 rounded-[10px] border border-error/20 bg-error/10 p-4 px-5">
      {/* Error icon */}
      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-error/20">
        <span className="text-xs font-bold text-error">!</span>
      </div>

      <div className="flex-1">
        <div className="mb-1 text-sm font-semibold text-error">{displayError.title}</div>
        <div className="text-[13px] leading-relaxed text-muted">
          {displayError.message}
        </div>
      </div>

      <div className="flex gap-2">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/20"
          >
            Retry
          </button>
        )}
        <button
          onClick={onDismiss}
          className="p-1.5 text-base leading-none text-muted-dark transition-colors hover:text-muted"
        >
          ×
        </button>
      </div>
    </div>
  );
}
