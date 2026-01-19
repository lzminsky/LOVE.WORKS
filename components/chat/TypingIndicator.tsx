"use client";

import { useState, useEffect, useCallback } from "react";

const loadingMessages = [
  // === ECON-SOUNDING (formal economics) ===
  "Computing utility maximization functions...",
  "Solving for Nash equilibrium...",
  "Calculating reservation utility thresholds...",
  "Estimating market clearing prices...",
  "Evaluating Pareto efficiency conditions...",
  "Running mechanism design analysis...",
  "Checking incentive compatibility constraints...",
  "Modeling strategic complementarities...",
  "Deriving best response functions...",
  "Assessing bargaining power asymmetries...",
  "Computing quasi-rent extraction potential...",
  "Evaluating commitment device credibility...",
  "Analyzing repeated game dynamics...",

  // === TECHNICAL (ICAPM-VRP specific) ===
  "Estimating variance risk premium...",
  "Calibrating ICAPM parameters...",
  "Computing hedging demand coefficients...",
  "Measuring state variable exposures...",
  "Evaluating intertemporal substitution elasticity...",
  "Calculating Sharpe ratio bounds...",
  "Estimating market position percentiles...",
  "Running principal-agent decomposition...",
  "Analyzing information asymmetry gradients...",
  "Computing hold-up vulnerability index...",
  "Modeling tournament effect intensity...",
  "Evaluating credit rationing thresholds...",
  "Calibrating prospect theory parameters...",
  "Measuring reference class stickiness...",

  // === FUNNY (self-aware, absurd) ===
  "Analyzing aura equilibrium...",
  "Computing situationship stability metrics...",
  "Measuring red flag density...",
  "Evaluating ick probability distribution...",
  "Calculating optimal double-text timing...",
  "Modeling breadcrumb trajectory...",
  "Running vibes-based regression...",
  "Estimating ghost risk premium...",
  "Checking if he's just not that into you...",
  "Solving the two-body problem (the dating one)...",
  "Evaluating 'we need to talk' probability...",
  "Computing emotional availability index...",
  "Analyzing roster diversification strategy...",
  "Calculating main character energy coefficient...",
  "Modeling hot girl summer returns...",
  "Evaluating 'let's just be friends' transition matrix...",
  "Computing talking stage duration distribution...",
  "Analyzing cuffing season volatility...",
  "Measuring delusion index...",
  "Estimating 3am text regret probability...",
  "Running attachment style factor analysis...",
  "Checking Mercury retrograde interference...",
  "Solving for 'what are we' equilibrium...",
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function useTypingEffect(text: string, speed = 35) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isTyping };
}

function useLoadingMessage(intervalMs = 3500) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [shuffledMessages, setShuffledMessages] = useState<string[]>(() =>
    shuffleArray(loadingMessages)
  );

  const resetMessages = useCallback(() => {
    setShuffledMessages(shuffleArray(loadingMessages));
    setMessageIndex(0);
  }, []);

  useEffect(() => {
    resetMessages();
  }, [resetMessages]);

  useEffect(() => {
    if (shuffledMessages.length === 0) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % shuffledMessages.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [shuffledMessages, intervalMs]);

  return shuffledMessages[messageIndex] || loadingMessages[0];
}

export function TypingIndicator() {
  const message = useLoadingMessage(3500);
  const { displayedText, isTyping } = useTypingEffect(message, 35);

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white/[0.02] p-6">
      {/* Pulsing ƒ symbol */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 animate-pulse-glow">
        <span className="font-mono text-xl font-semibold text-accent animate-pulse-opacity">
          ƒ
        </span>
      </div>

      {/* Typing message */}
      <div className="min-h-[20px] font-mono text-sm text-neutral-500">
        {displayedText}
        {isTyping && (
          <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-blink bg-accent align-middle" />
        )}
      </div>
    </div>
  );
}
