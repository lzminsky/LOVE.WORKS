"use client";

import { LINKS, CONFIG } from "@/lib/constants";
import { SkinToggle } from "./SkinToggle";

export function Footer() {
  return (
    <footer className="flex flex-shrink-0 items-center justify-center gap-3 border-t border-[var(--border)] bg-background px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
      <span className="text-[11px] text-muted-darker sm:text-xs">
        A{" "}
        <a
          href={LINKS.boundedWorks}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-dark transition-colors hover:text-muted"
        >
          {CONFIG.parentOrg}
        </a>{" "}
        product
      </span>
      <span className="text-muted-darker">·</span>
      <a
        href={LINKS.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-muted-darker transition-colors hover:text-muted sm:text-xs"
      >
        {LINKS.twitterHandle}
      </a>
      <span className="text-muted-darker">·</span>
      <a
        href="/terms"
        className="text-[11px] text-muted-darker transition-colors hover:text-muted sm:text-xs"
      >
        Terms
      </a>
      <span className="text-muted-darker">·</span>
      <SkinToggle />
    </footer>
  );
}
