"use client";

import { useState } from "react";
import { CONFIG } from "@/lib/constants";

interface HeaderProps {
  promptCount: number;
  maxPrompts: number;
  isUnlocked: boolean;
  onAboutClick: () => void;
  onExportClick: () => void;
  onNewClick: () => void;
}

export function Header({
  promptCount,
  maxPrompts,
  isUnlocked,
  onAboutClick,
  onExportClick,
  onNewClick,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative flex items-center justify-between border-b border-white/[0.06] bg-background px-4 py-3 pt-safe sm:px-6 md:px-8 md:py-4">
      <div className="text-sm font-semibold tracking-tight text-text sm:text-[15px]">
        {CONFIG.appName}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
        {/* Prompt counter - shows remaining messages */}
        {!isUnlocked && (
          <div className="flex items-center gap-1.5 rounded-md bg-white/[0.03] px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                maxPrompts - promptCount <= 3 ? "bg-warning" : "bg-success"
              }`}
            />
            <span className="text-xs tabular-nums text-muted sm:text-[13px]">
              <span className="hidden sm:inline">{maxPrompts - promptCount} {maxPrompts - promptCount === 1 ? "message" : "messages"} left</span>
              <span className="sm:hidden">{maxPrompts - promptCount}</span>
            </span>
          </div>
        )}

        {isUnlocked && (
          <div className="flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs text-accent sm:text-[13px]">
              <span className="hidden sm:inline">Unlimited</span>
              <span className="sm:hidden">∞</span>
            </span>
          </div>
        )}

        {/* Desktop action buttons */}
        <div className="hidden gap-1 sm:flex">
          <button
            onClick={onAboutClick}
            className="min-h-[44px] rounded-md px-3 py-2 text-[13px] font-medium text-muted-dark transition-colors hover:text-muted"
          >
            About
          </button>
          <button
            onClick={onExportClick}
            className="min-h-[44px] rounded-md px-3 py-2 text-[13px] font-medium text-muted-dark transition-colors hover:text-muted"
          >
            Export
          </button>
          <button
            onClick={onNewClick}
            className="min-h-[44px] rounded-md px-3 py-2 text-[13px] font-medium text-muted-dark transition-colors hover:text-muted"
          >
            New
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-dark transition-colors hover:text-muted sm:hidden"
          aria-label="Menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-white/[0.06] bg-background px-4 py-2 sm:hidden">
          <button
            onClick={() => {
              onAboutClick();
              setMenuOpen(false);
            }}
            className="flex min-h-[48px] w-full items-center rounded-md px-3 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            About
          </button>
          <button
            onClick={() => {
              onExportClick();
              setMenuOpen(false);
            }}
            className="flex min-h-[48px] w-full items-center rounded-md px-3 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            Export
          </button>
          <button
            onClick={() => {
              onNewClick();
              setMenuOpen(false);
            }}
            className="flex min-h-[48px] w-full items-center rounded-md px-3 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            New Conversation
          </button>
        </div>
      )}
    </header>
  );
}
