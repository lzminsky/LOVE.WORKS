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
            <div className="mt-5">
              <ThinkingBlock content={rawThinking} />
            </div>
          )}

          {/* If we have structured data (from JSON blocks), show that too */}
          {hasStructuredData && (
            <div className="mt-5 rounded-[10px] border border-white/[0.06] bg-black/40 p-6 font-mono text-[13px] leading-[1.7]">
              {/* Parameters */}
              {parameters && parameters.length > 0 && (
                <div className="mb-6">
                  <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-dark">
                    Parameter Estimation
                  </div>
                  <div className="flex flex-col gap-2">
                    {parameters.map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[160px_140px_1fr] gap-4 rounded-md bg-white/[0.02] px-3.5 py-2.5"
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
                  <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-dark">
                    Active Extensions
                  </div>
                  <div className="flex flex-col gap-3">
                    {extensions.map((ext, i) => (
                      <div
                        key={i}
                        className={`rounded-lg border-l-2 bg-white/[0.02] p-3.5 px-4 ${
                          ext.status === "ACTIVE" ? "border-accent" : "border-muted-dark"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-3">
                          <span className="text-muted-dark">{ext.id}</span>
                          <span className="text-text">{ext.name}</span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-[0.05em] ${
                              ext.status === "ACTIVE"
                                ? "bg-accent/15 text-accent"
                                : "bg-white/[0.05] text-muted-dark"
                            }`}
                          >
                            {ext.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted">{ext.detail}</div>
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
