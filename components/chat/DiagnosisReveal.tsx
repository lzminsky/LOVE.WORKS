"use client";

import { useState } from "react";
import { useSkin } from "@/lib/skin-context";

interface DiagnosisRevealProps {
  onReveal: () => void;
}

export function DiagnosisReveal({ onReveal }: DiagnosisRevealProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const { skin } = useSkin();
  const isSoft = skin === "soft";

  const handleReveal = () => {
    setIsRevealing(true);
    onReveal();
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 sm:p-6 ${
      isSoft ? "border-accent/30 bg-accent/[0.04]" : "border-accent/20 bg-accent/[0.03]"
    }`}>
      {/* Subtle glow border — static in soft mode */}
      {!isSoft && (
        <div className="absolute inset-0 rounded-xl border border-accent/10 animate-pulse-glow pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col items-center gap-3 text-center sm:gap-4">
        <p className="text-sm font-medium text-text sm:text-[15px]">
          Your diagnosis is ready.
        </p>
        <button
          onClick={handleReveal}
          disabled={isRevealing}
          aria-label="Reveal your diagnosis"
          className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/20 hover:border-accent/50 disabled:opacity-50 sm:px-6 sm:py-3"
        >
          Reveal
          <span className="text-base">→</span>
        </button>
      </div>
    </div>
  );
}
