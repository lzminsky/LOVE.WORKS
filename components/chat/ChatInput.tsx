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

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading || disabled) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSubmit = value.trim() && !isLoading && !disabled;

  return (
    <div className="border-t border-white/[0.06] bg-background/95 px-6 pb-6 pt-5 backdrop-blur-xl">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-[680px] items-end gap-3"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your situation..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-[18px] py-3.5 text-[15px] leading-relaxed text-text outline-none placeholder:text-muted-dark focus:border-white/[0.12] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className={`flex items-center justify-center rounded-[10px] p-3.5 transition-colors ${
            canSubmit
              ? "bg-accent text-background hover:bg-accent-hover"
              : "bg-white/[0.05] text-muted-dark"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
