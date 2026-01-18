"use client";

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
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-background/95 px-8 py-4 backdrop-blur-xl">
      <div className="text-[15px] font-semibold tracking-tight text-text">
        {CONFIG.appName}
      </div>

      <div className="flex items-center gap-5">
        {/* Prompt counter */}
        {!isUnlocked && (
          <div className="flex items-center gap-2 rounded-md bg-white/[0.03] px-3 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[13px] tabular-nums text-muted">
              {promptCount} of {maxPrompts}
            </span>
          </div>
        )}

        {isUnlocked && (
          <div className="flex items-center gap-2 rounded-md bg-accent/10 px-3 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-[13px] text-accent">Unlimited</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-1">
          <button
            onClick={onAboutClick}
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-dark transition-colors hover:text-muted"
          >
            About
          </button>
          <button
            onClick={onExportClick}
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-dark transition-colors hover:text-muted"
          >
            Export
          </button>
          <button
            onClick={onNewClick}
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-dark transition-colors hover:text-muted"
          >
            New
          </button>
        </div>
      </div>
    </header>
  );
}
