"use client";

import { useState, useEffect, useRef } from "react";
import { Footer } from "@/components/ui/Footer";
import { TweetPreview } from "./TweetPreview";
import { VerificationStates, VerificationState } from "./VerificationStates";
import { COPY } from "@/lib/constants";
import { Analytics } from "@/lib/analytics";

interface GateScreenProps {
  onUnlock: () => void;
  promptCount?: number;
  maxPrompts?: number;
}

export function GateScreen({ onUnlock, promptCount = 10, maxPrompts = 10 }: GateScreenProps) {
  const [verifyState, setVerifyState] = useState<VerificationState>("initial");
  const gateViewTimeRef = useRef<number>(Date.now());

  // Track gate view on mount
  useEffect(() => {
    gateViewTimeRef.current = Date.now();
  }, []);

  const handleConnect = () => {
    Analytics.twitterAuthStarted();
    setVerifyState("connecting");
    // Simulate OAuth redirect
    setTimeout(() => setVerifyState("needs_engagement"), 1500);
  };

  const handleVerify = () => {
    setVerifyState("checking");
    // Simulate verification
    setTimeout(() => {
      Analytics.engagementVerified(true, true);
      setVerifyState("success");
    }, 1500);
  };

  const handleContinue = () => {
    const timeToUnlock = Date.now() - gateViewTimeRef.current;
    Analytics.unlocked(timeToUnlock);
    onUnlock();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 pb-safe pt-safe text-text sm:p-6">
      <div className="w-full max-w-[420px] text-center">
        {/* Counter */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 sm:mb-8 sm:px-4 sm:py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-accent sm:h-2 sm:w-2" />
          <span className="text-xs font-medium text-accent sm:text-sm">
            {promptCount} of {maxPrompts} messages used
          </span>
        </div>

        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-text sm:mb-4 sm:text-[28px]">
          {COPY.gate.title}
        </h1>

        <p className="mb-6 text-sm leading-relaxed text-muted sm:mb-10 sm:text-[15px] sm:leading-[1.7]">
          {COPY.gate.description}
          <br />
          <span className="text-muted-dark">{COPY.gate.subtext}</span>
        </p>

        {/* Tweet Preview */}
        <TweetPreview />

        {/* Verification States */}
        <VerificationStates
          state={verifyState}
          onConnect={handleConnect}
          onVerify={handleVerify}
          onContinue={handleContinue}
        />

        {/* Demo controls */}
        <div className="mt-6 border-t border-white/[0.06] pt-4 sm:mt-8 sm:pt-6">
          <span className="mb-2 block text-[11px] text-muted-darker">
            Demo: Click to simulate states
          </span>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {(
              [
                "initial",
                "connecting",
                "checking",
                "needs_engagement",
                "success",
              ] as VerificationState[]
            ).map((state) => (
              <button
                key={state}
                onClick={() => setVerifyState(state)}
                className={`min-h-[36px] rounded border px-2 py-1 text-[10px] transition-colors sm:min-h-0 sm:px-2.5 sm:py-1.5 sm:text-[11px] ${
                  verifyState === state
                    ? "border-accent/30 bg-accent/20 text-accent"
                    : "border-white/[0.08] bg-white/[0.03] text-muted-dark hover:text-muted"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 pb-safe">
        <Footer />
      </div>
    </div>
  );
}
