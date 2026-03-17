"use client";

import { CRISIS_RESOURCES } from "@/lib/safety";

interface SafetyMessageProps {
  content: string;
}

export function SafetyMessage({ content }: SafetyMessageProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-warning/20 bg-warning/5 p-4 sm:p-6">
      {/* Warm header */}
      <div className="mb-4 flex items-center gap-2.5 sm:mb-5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/15 text-warning sm:h-7 sm:w-7">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-warning sm:text-[15px]">
          Your safety matters
        </span>
      </div>

      {/* AI message content */}
      <div className="mb-5 text-sm leading-relaxed text-text sm:mb-6 sm:text-[15px]">
        {content}
      </div>

      {/* Crisis resources */}
      <div className="space-y-2.5 sm:space-y-3">
        {CRISIS_RESOURCES.map((resource) => (
          <div
            key={resource.name}
            className="flex flex-col gap-0.5 rounded-lg bg-[var(--overlay)] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4"
          >
            <div>
              <div className="text-[13px] font-medium text-text sm:text-sm">
                {resource.name}
              </div>
              <div className="text-xs text-muted sm:text-[13px]">
                {resource.description}
              </div>
            </div>
            <div className="mt-1 text-[13px] font-semibold text-accent sm:mt-0 sm:flex-shrink-0 sm:text-sm">
              {resource.contact}
            </div>
          </div>
        ))}
      </div>

      {/* Reassurance footer */}
      <p className="mt-4 text-xs leading-relaxed text-muted sm:mt-5 sm:text-[13px]">
        These resources are free, confidential, and available 24/7. You deserve support.
      </p>
    </div>
  );
}
