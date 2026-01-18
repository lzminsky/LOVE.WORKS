"use client";

interface ResetConfirmModalProps {
  onExportAndReset: () => void;
  onResetWithoutExport: () => void;
  onCancel: () => void;
}

export function ResetConfirmModal({
  onExportAndReset,
  onResetWithoutExport,
  onCancel,
}: ResetConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-5 backdrop-blur-lg">
      <div className="w-full max-w-[400px] rounded-2xl border border-white/[0.08] bg-[#111111] p-8">
        <h3 className="mb-3 text-lg font-semibold text-text">
          Start new conversation?
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-muted">
          Your current conversation will be cleared. Would you like to export it
          first?
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onExportAndReset}
            className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
          >
            Export & Start New
          </button>
          <button
            onClick={onResetWithoutExport}
            className="rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-white/20 hover:text-text"
          >
            Start New Without Exporting
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg bg-transparent px-4 py-3 text-sm text-muted-dark transition-colors hover:text-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
