"use client";

import { COPY } from "@/lib/constants";
import { useSkin } from "@/lib/skin-context";

interface WelcomeModalProps {
  onClose: () => void;
  onAbout: () => void;
}

export function WelcomeModal({ onClose, onAbout }: WelcomeModalProps) {
  const { skin } = useSkin();
  const isSoft = skin === "soft";

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4 pb-safe pt-safe backdrop-blur-lg sm:p-5 ${
      isSoft ? "bg-black/50" : "bg-black/85"
    }`}>
      <div className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--modal-bg)] px-5 py-7 text-center sm:px-12 sm:py-10">
        <div className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-muted-dark sm:mb-4 sm:text-[13px]">
          {COPY.welcomeModal.tagline}
        </div>
        <div className={`mb-4 text-2xl tracking-tight text-text sm:mb-5 sm:text-[32px] ${
          isSoft ? "font-serif-display font-normal" : "font-semibold"
        }`}>
          {COPY.welcomeModal.title}
        </div>
        <p className="mb-2 text-sm leading-relaxed text-muted sm:mb-3 sm:text-[15px] sm:leading-[1.7]">
          {COPY.welcomeModal.description}
        </p>
        <p className="mb-6 text-base font-medium leading-relaxed text-text sm:mb-8 sm:text-[17px]">
          {COPY.welcomeModal.cta}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <button
            onClick={onAbout}
            className="min-h-[48px] rounded-lg border border-[var(--border)] bg-transparent px-5 py-3 text-sm font-medium text-muted transition-colors hover:border-accent/30 hover:text-text sm:min-h-0"
          >
            About the model
          </button>
          <button
            onClick={onClose}
            className="min-h-[48px] rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover sm:min-h-0"
          >
            Got it →
          </button>
        </div>
      </div>
    </div>
  );
}
