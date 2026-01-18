import { LINKS, CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="flex items-center justify-center gap-4 border-t border-white/[0.04] bg-background px-6 py-4">
      <span className="text-xs text-muted-darker">
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
        className="text-xs text-muted-darker transition-colors hover:text-muted"
      >
        {LINKS.twitterHandle}
      </a>
    </footer>
  );
}
