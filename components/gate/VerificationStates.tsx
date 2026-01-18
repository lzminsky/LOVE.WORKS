"use client";

export type VerificationState =
  | "initial"
  | "connecting"
  | "checking"
  | "needs_engagement"
  | "success";

interface VerificationStatesProps {
  state: VerificationState;
  onConnect: () => void;
  onVerify: () => void;
  onContinue: () => void;
}

export function VerificationStates({
  state,
  onConnect,
  onVerify,
  onContinue,
}: VerificationStatesProps) {
  if (state === "initial") {
    return (
      <>
        <button
          onClick={onConnect}
          className="mb-4 w-full rounded-xl bg-accent px-6 py-4 text-[15px] font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          Connect Twitter →
        </button>
        <p className="text-[13px] text-muted-darker">
          Just help spread the word if you found this useful.
        </p>
      </>
    );
  }

  if (state === "connecting") {
    return (
      <div className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl bg-white/[0.05] px-6 py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-dark border-t-accent" />
        <span className="text-sm text-muted">Connecting to Twitter...</span>
      </div>
    );
  }

  if (state === "checking") {
    return (
      <div className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl bg-white/[0.05] px-6 py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-dark border-t-accent" />
        <span className="text-sm text-muted">Checking engagement...</span>
      </div>
    );
  }

  if (state === "needs_engagement") {
    return (
      <>
        <div className="mb-4 w-full rounded-xl border border-warning/20 bg-warning/10 p-4 text-left">
          <div className="mb-1 text-sm font-semibold text-warning">
            Almost there
          </div>
          <div className="text-[13px] text-muted">
            Please like and retweet the post above, then click verify.
          </div>
        </div>
        <button
          onClick={onVerify}
          className="mb-4 w-full rounded-xl bg-accent px-6 py-4 text-[15px] font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          Verify Engagement
        </button>
      </>
    );
  }

  if (state === "success") {
    return (
      <div className="mb-4 w-full rounded-xl border border-success/20 bg-success/10 px-6 py-5 text-center">
        <div className="mb-2 text-2xl">✓</div>
        <div className="mb-1 text-base font-semibold text-success">
          Unlocked!
        </div>
        <div className="mb-4 text-[13px] text-muted">
          You now have unlimited access.
        </div>
        <button
          onClick={onContinue}
          className="rounded-lg bg-success px-6 py-3 text-sm font-semibold text-background transition-colors hover:brightness-110"
        >
          Continue →
        </button>
      </div>
    );
  }

  return null;
}
