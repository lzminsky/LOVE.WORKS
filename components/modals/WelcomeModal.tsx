"use client";

import { COPY } from "@/lib/constants";

interface WelcomeModalProps {
  onClose: () => void;
  onAbout: () => void;
}

export function WelcomeModal({ onClose, onAbout }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-5 backdrop-blur-lg">
      <div className="max-w-[420px] rounded-2xl border border-white/[0.08] bg-[#111111] px-12 py-10 text-center">
        <div className="mb-4 text-[13px] font-medium uppercase tracking-[0.1em] text-muted-dark">
          {COPY.welcomeModal.tagline}
        </div>
        <div className="mb-5 text-[32px] font-semibold tracking-tight text-text">
          {COPY.welcomeModal.title}
        </div>
        <p className="mb-3 text-[15px] leading-[1.7] text-muted">
          {COPY.welcomeModal.description}
        </p>
        <p className="mb-8 text-[17px] font-medium leading-relaxed text-text">
          {COPY.welcomeModal.cta}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onAbout}
            className="rounded-lg border border-white/10 bg-transparent px-5 py-3 text-sm font-medium text-muted transition-colors hover:border-white/20 hover:text-text"
          >
            About the model
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
          >
            Got it →
          </button>
        </div>
      </div>
    </div>
  );
}
