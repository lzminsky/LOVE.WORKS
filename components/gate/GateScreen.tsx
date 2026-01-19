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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-text">
      <div className="w-full max-w-[420px] text-center">
        {/* Counter */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-sm font-medium text-accent">
            {promptCount} of {maxPrompts} messages used
          </span>
        </div>

        <h1 className="mb-4 text-[28px] font-semibold tracking-tight text-text">
          {COPY.gate.title}
        </h1>

        <p className="mb-10 text-[15px] leading-[1.7] text-muted">
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
        <div className="mt-8 border-t border-white/[0.06] pt-6">
          <span className="mb-2 block text-[11px] text-muted-darker">
            Demo: Click to simulate states
          </span>
          <div className="flex flex-wrap justify-center gap-2">
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
                className={`rounded border px-2.5 py-1.5 text-[11px] transition-colors ${
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
      <div className="absolute bottom-0 left-0 right-0">
        <Footer />
      </div>
    </div>
  );
}
