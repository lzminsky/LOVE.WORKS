export const SAFETY_PREFIX = "[SAFETY]";

export interface CrisisResource {
  name: string;
  contact: string;
  description: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "National Domestic Violence Hotline",
    contact: "1-800-799-7233",
    description: "24/7 confidential support for domestic violence",
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    description: "Free 24/7 crisis counseling via text",
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    contact: "Call or text 988",
    description: "24/7 mental health crisis support",
  },
  {
    name: "RAINN",
    contact: "1-800-656-4673",
    description: "National Sexual Assault Hotline",
  },
];

/**
 * Check if AI response content contains the safety prefix.
 * Returns the cleaned content (prefix stripped) if safety detected, null otherwise.
 */
export function detectSafetyResponse(content: string): string | null {
  if (content.trimStart().startsWith(SAFETY_PREFIX)) {
    return content.trimStart().slice(SAFETY_PREFIX.length).trimStart();
  }
  return null;
}
