import { LINKS, CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="flex items-center justify-center gap-3 border-t border-white/[0.04] bg-background px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
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
      <span className="text-neutral-800">·</span>
      <a
        href={LINKS.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-muted-darker transition-colors hover:text-muted sm:text-xs"
      >
        {LINKS.twitterHandle}
      </a>
    </footer>
  );
}
