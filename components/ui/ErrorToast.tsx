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
    <div className="flex items-start gap-2.5 rounded-lg border border-error/20 bg-error/10 p-3 sm:gap-3.5 sm:rounded-[10px] sm:p-4 sm:px-5">
      {/* Error icon */}
      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-error/20">
        <span className="text-xs font-bold text-error">!</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[13px] font-semibold text-error sm:mb-1 sm:text-sm">{displayError.title}</div>
        <div className="text-xs leading-relaxed text-muted sm:text-[13px]">
          {displayError.message}
        </div>
      </div>

      <div className="flex flex-shrink-0 gap-1.5 sm:gap-2">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="min-h-[36px] rounded-md border border-error/30 bg-error/10 px-2.5 py-1.5 text-[11px] font-medium text-error transition-colors hover:bg-error/20 sm:min-h-0 sm:px-3 sm:text-xs"
          >
            Retry
          </button>
        )}
        <button
          onClick={onDismiss}
          className="min-h-[36px] min-w-[36px] p-1.5 text-base leading-none text-muted-dark transition-colors hover:text-muted sm:min-h-0 sm:min-w-0"
        >
          ×
        </button>
      </div>
    </div>
  );
}
