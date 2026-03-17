"use client";

import { useState, useEffect } from "react";
import { getCatalog, clearCatalog, CatalogEntry } from "@/lib/equilibrium-catalog";

interface CatalogPanelProps {
  onClose: () => void;
}

export function CatalogPanel({ onClose }: CatalogPanelProps) {
  const [entries, setEntries] = useState<CatalogEntry[]>([]);

  useEffect(() => {
    setEntries(getCatalog());
  }, []);

  const handleClear = () => {
    clearCatalog();
    setEntries([]);
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur" />

      {/* Panel */}
      <div className="relative h-full w-full animate-slide-in overflow-x-hidden overflow-y-auto border-l border-[var(--border)] bg-[var(--modal-bg)] px-4 py-5 pb-safe pt-safe sm:max-w-[580px] sm:px-10 sm:py-8">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center text-xl text-muted-dark transition-colors hover:text-muted sm:right-6 sm:top-6 sm:min-h-0 sm:min-w-0 sm:p-2"
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-dark">
          Catalog
        </div>
        <h2 className="mb-3 text-xl font-semibold tracking-tight text-text sm:mb-6 sm:text-[28px]">
          Your Diagnoses
        </h2>

        {/* Empty state */}
        {entries.length === 0 && (
          <p className="text-[13px] text-muted-dark sm:text-sm">
            No diagnoses yet. Start a conversation to receive your first equilibrium diagnosis.
          </p>
        )}

        {/* Entries */}
        {entries.length > 0 && (
          <>
            <div className="flex flex-col gap-2 sm:gap-3">
              {entries.map((entry) => (
                <div
                  key={`${entry.id}-${entry.timestamp}`}
                  className="rounded-lg border border-[var(--border)] bg-[var(--overlay)] p-3 sm:rounded-xl sm:p-4"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="rounded bg-[var(--overlay-hover)] px-1.5 py-0.5 font-mono text-[10px] text-muted-dark sm:px-2 sm:py-0.5 sm:text-[11px]">
                      {entry.id}
                    </span>
                    <span className="text-[10px] text-muted-dark sm:text-[11px]">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-text sm:text-sm">
                    {entry.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-accent sm:text-xs">
                      {entry.confidence}%
                    </span>
                    <span className="text-[10px] text-muted-dark sm:text-[11px]">
                      confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear button */}
            <button
              onClick={handleClear}
              className="mt-5 text-[12px] text-muted-dark transition-colors hover:text-error sm:mt-8 sm:text-[13px]"
            >
              Clear history
            </button>
          </>
        )}
      </div>
    </div>
  );
}
