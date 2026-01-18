"use client";

import { Footer } from "@/components/ui/Footer";

interface ExportCardProps {
  onBack: () => void;
}

export function ExportCard({ onBack }: ExportCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-text">
      <div className="mb-6 text-[13px] uppercase tracking-[0.1em] text-muted-dark">
        Export Preview — 1200×628
      </div>

      {/* Card Preview (scaled down) */}
      <div className="relative mb-8 h-[314px] w-[600px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d0d] p-12">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="mb-5 flex items-center gap-2">
              <span className="rounded bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-muted-dark">
                EQ-001
              </span>
              <span className="text-[11px] font-medium text-accent">
                70% confidence
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-semibold leading-none tracking-tight text-text">
              Situationship
              <br />
              Steady State
            </h1>

            <p className="max-w-[400px] text-base leading-relaxed text-muted">
              He&apos;s optimizing correctly. You&apos;re the one mispricing the
              contract.
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="font-mono text-sm text-accent">65%</span>
              <span className="text-sm text-muted">Status quo continues</span>
            </div>

            <div className="text-sm font-semibold text-muted-dark">
              love.works
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="rounded-lg border border-white/10 bg-transparent px-5 py-3 text-sm text-muted transition-colors hover:border-white/20 hover:text-text"
        >
          ← Back
        </button>
        <button className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-muted transition-colors hover:bg-white/[0.08] hover:text-text">
          Copy Link
        </button>
        <button className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-muted transition-colors hover:bg-white/[0.08] hover:text-text">
          Download PNG
        </button>
        <button className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover">
          Share to Twitter →
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <Footer />
      </div>
    </div>
  );
}
