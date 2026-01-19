"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea with minimum height for mobile
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      // Minimum 56px on mobile for 2 lines, auto-grow up to 200px
      const minHeight = 56;
      textarea.style.height = `${Math.max(minHeight, Math.min(textarea.scrollHeight, 200))}px`;
    }
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading || disabled) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    // Plain Enter adds a new line (better for mobile)
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSubmit = value.trim() && !isLoading && !disabled;

  return (
    <div className="flex-shrink-0 border-t border-white/[0.06] bg-background/95 px-4 pb-safe pt-3 backdrop-blur-xl sm:px-6 sm:pt-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-[680px] items-end gap-2 sm:gap-3"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your situation..."
          rows={2}
          disabled={disabled}
          enterKeyHint="enter"
          className="flex-1 resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-base leading-relaxed text-text outline-none placeholder:text-muted-dark focus:border-white/[0.12] disabled:opacity-50 sm:rounded-[10px] sm:px-[18px] sm:py-3.5 sm:text-[15px]"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Send message"
          className={`flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg transition-colors sm:min-h-0 sm:min-w-0 sm:rounded-[10px] sm:p-3.5 ${
            canSubmit
              ? "bg-accent text-background hover:bg-accent-hover"
              : "bg-white/[0.05] text-muted-dark"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:h-[18px] sm:w-[18px]">
            <path
              d="M12 19V5M12 5L5 12M12 5L19 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
