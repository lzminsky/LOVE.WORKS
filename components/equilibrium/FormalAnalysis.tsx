"use client";

import { useState } from "react";
import { ThinkingBlock } from "./ThinkingBlock";

interface Parameter {
  param: string;
  value: string;
  basis: string;
}

interface Extension {
  id: string;
  name: string;
  status: "ACTIVE" | "LIKELY" | "POSSIBLE";
  detail: string;
}

interface FormalAnalysisProps {
  parameters?: Parameter[];
  extensions?: Extension[];
  rawThinking?: string;
}

export function FormalAnalysis({ parameters, extensions, rawThinking }: FormalAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If we have no data at all, don't render
  const hasStructuredData = (parameters && parameters.length > 0) || (extensions && extensions.length > 0);
  const hasRawThinking = rawThinking && rawThinking.trim().length > 0;

  if (!hasStructuredData && !hasRawThinking) {
    return null;
  }

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-muted transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-text"
      >
        <span className="font-mono text-base text-accent transition-transform group-hover:scale-110">ƒ</span>
        <span className="font-medium">Reasoned formally</span>
        <span
          className={`ml-1 text-sm text-muted-dark transition-transform duration-200 ${
            isExpanded ? "rotate-90" : "rotate-0"
          }`}
        >
          ›
        </span>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <>
          {/* If we have raw thinking content, show it styled */}
          {hasRawThinking && (
            <div className="mt-4 sm:mt-5">
              <ThinkingBlock content={rawThinking} />
            </div>
          )}

          {/* If we have structured data (from JSON blocks), show that too */}
          {hasStructuredData && (
            <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/40 p-4 font-mono text-xs leading-relaxed sm:mt-5 sm:rounded-[10px] sm:p-6 sm:text-[13px] sm:leading-[1.7]">
              {/* Parameters */}
              {parameters && parameters.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-dark sm:mb-4 sm:text-[11px]">
                    Parameter Estimation
                  </div>
                  <div className="flex flex-col gap-2">
                    {parameters.map((row, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-1 rounded-md bg-white/[0.02] px-3 py-2 sm:grid sm:grid-cols-[160px_140px_1fr] sm:gap-4 sm:px-3.5 sm:py-2.5"
                      >
                        <span className="flex-shrink-0 truncate text-accent">{row.param}</span>
                        <span className="text-muted">{row.value}</span>
                        <span className="text-muted-dark">{row.basis}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extensions */}
              {extensions && extensions.length > 0 && (
                <div>
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-dark sm:mb-4 sm:text-[11px]">
                    Active Extensions
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {extensions.map((ext, i) => (
                      <div
                        key={i}
                        className={`rounded-lg border-l-2 bg-white/[0.02] p-3 sm:p-3.5 sm:px-4 ${
                          ext.status === "ACTIVE" ? "border-accent" : "border-muted-dark"
                        }`}
                      >
                        <div className="mb-1.5 flex flex-wrap items-center gap-2 sm:mb-2 sm:gap-3">
                          <span className="text-muted-dark">{ext.id}</span>
                          <span className="text-text">{ext.name}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.05em] sm:px-2 sm:text-[10px] ${
                              ext.status === "ACTIVE"
                                ? "bg-accent/15 text-accent"
                                : "bg-white/[0.05] text-muted-dark"
                            }`}
                          >
                            {ext.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted sm:text-xs">{ext.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
