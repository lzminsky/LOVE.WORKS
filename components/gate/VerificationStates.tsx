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
          className="mb-3 w-full rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-accent-hover sm:mb-4 sm:px-6 sm:py-4 sm:text-[15px]"
        >
          Connect Twitter →
        </button>
        <p className="text-xs text-muted-darker sm:text-[13px]">
          Just help spread the word if you found this useful.
        </p>
      </>
    );
  }

  if (state === "connecting") {
    return (
      <div className="mb-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white/[0.05] px-5 py-3.5 sm:mb-4 sm:gap-3 sm:px-6 sm:py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-dark border-t-accent" />
        <span className="text-[13px] text-muted sm:text-sm">Connecting to Twitter...</span>
      </div>
    );
  }

  if (state === "checking") {
    return (
      <div className="mb-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white/[0.05] px-5 py-3.5 sm:mb-4 sm:gap-3 sm:px-6 sm:py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-dark border-t-accent" />
        <span className="text-[13px] text-muted sm:text-sm">Checking engagement...</span>
      </div>
    );
  }

  if (state === "needs_engagement") {
    return (
      <>
        <div className="mb-3 w-full rounded-xl border border-warning/20 bg-warning/10 p-3.5 text-left sm:mb-4 sm:p-4">
          <div className="mb-0.5 text-[13px] font-semibold text-warning sm:mb-1 sm:text-sm">
            Almost there
          </div>
          <div className="text-xs text-muted sm:text-[13px]">
            Please like and retweet the post above, then click verify.
          </div>
        </div>
        <button
          onClick={onVerify}
          className="mb-3 w-full rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-accent-hover sm:mb-4 sm:px-6 sm:py-4 sm:text-[15px]"
        >
          Verify Engagement
        </button>
      </>
    );
  }

  if (state === "success") {
    return (
      <div className="mb-3 w-full rounded-xl border border-success/20 bg-success/10 px-5 py-4 text-center sm:mb-4 sm:px-6 sm:py-5">
        <div className="mb-1.5 text-xl sm:mb-2 sm:text-2xl">✓</div>
        <div className="mb-0.5 text-[15px] font-semibold text-success sm:mb-1 sm:text-base">
          Unlocked!
        </div>
        <div className="mb-3 text-xs text-muted sm:mb-4 sm:text-[13px]">
          You now have unlimited access.
        </div>
        <button
          onClick={onContinue}
          className="min-h-[44px] rounded-lg bg-success px-5 py-2.5 text-[13px] font-semibold text-background transition-colors hover:brightness-110 sm:px-6 sm:py-3 sm:text-sm"
        >
          Continue →
        </button>
      </div>
    );
  }

  return null;
}
