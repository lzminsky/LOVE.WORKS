import { Metadata } from "next";
import { DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & Disclaimer",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-12 text-text sm:px-6">
      <div className="w-full max-w-[640px]">
        <a
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-dark transition-colors hover:text-muted"
        >
          ← Back
        </a>

        <h1 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          Terms & Disclaimer
        </h1>

        <div className="space-y-6 text-sm leading-relaxed text-muted sm:text-[15px] sm:leading-[1.8]">
          <p className="font-medium text-text">{DISCLAIMER}</p>

          <p>
            lovebomb.works is an entertainment and educational tool that applies
            economic and game-theoretic frameworks to relationship dynamics. The
            analysis provided is based on formal models and should not be
            interpreted as professional psychological, therapeutic, or legal
            advice.
          </p>

          <p>
            The model describes population-level patterns using economic
            frameworks. It does not predict individual outcomes, prescribe
            behavior, or make normative claims about relationship structures.
            Individual situations are complex and may involve factors the model
            cannot capture.
          </p>

          <h2 className="pt-2 text-base font-semibold text-text sm:text-lg">
            Not a substitute for professional help
          </h2>
          <p>
            If you are experiencing domestic violence, abuse, or a mental health
            crisis, please contact a qualified professional or crisis service
            immediately. This tool is not equipped to provide crisis support.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-text">
                988 Suicide &amp; Crisis Lifeline:
              </strong>{" "}
              Call or text 988
            </li>
            <li>
              <strong className="text-text">Crisis Text Line:</strong> Text HOME
              to 741741
            </li>
            <li>
              <strong className="text-text">
                National Domestic Violence Hotline:
              </strong>{" "}
              1-800-799-7233
            </li>
            <li>
              <strong className="text-text">RAINN:</strong> 1-800-656-4673
            </li>
          </ul>

          <h2 className="pt-2 text-base font-semibold text-text sm:text-lg">
            No warranty
          </h2>
          <p>
            The service is provided &ldquo;as is&rdquo; without warranty of any
            kind. We make no guarantees about the accuracy, completeness, or
            usefulness of any analysis.
          </p>

          <h2 className="pt-2 text-base font-semibold text-text sm:text-lg">
            Privacy
          </h2>
          <p>
            Conversations are processed via the Claude API and are not stored
            permanently on our servers. Session data is maintained in browser
            cookies for functionality purposes only.
          </p>

          <div className="border-t border-[var(--border)] pt-6 text-xs text-muted-dark">
            <p>
              A{" "}
              <a
                href="https://bounded.works"
                className="text-muted transition-colors hover:text-text"
              >
                bounded.works
              </a>{" "}
              product
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
