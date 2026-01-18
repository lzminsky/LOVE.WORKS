import { cookies } from "next/headers";

const COOKIE_NAME = "love-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface Session {
  sessionId: string;
  promptCount: number;
  isUnlocked: boolean;
  twitterHandle: string | null;
  createdAt: number;
}

function generateSessionId(): string {
  return crypto.randomUUID();
}

function encodeSession(session: Session): string {
  // Base64 encode the JSON
  // In production, you'd sign this with jose or similar
  return Buffer.from(JSON.stringify(session)).toString("base64");
}

function decodeSession(encoded: string): Session | null {
  try {
    const json = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(json) as Session;
  } catch {
    return null;
  }
}

export function createSession(): Session {
  return {
    sessionId: generateSessionId(),
    promptCount: 0,
    isUnlocked: false,
    twitterHandle: null,
    createdAt: Date.now(),
  };
}

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie?.value) {
    return createSession();
  }

  const session = decodeSession(cookie.value);
  if (!session) {
    return createSession();
  }

  return session;
}

export function serializeSessionCookie(session: Session): string {
  const encoded = encodeSession(session);
  return `${COOKIE_NAME}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

export function incrementPromptCount(session: Session): Session {
  return {
    ...session,
    promptCount: session.promptCount + 1,
  };
}

export function unlockSession(session: Session, twitterHandle: string): Session {
  return {
    ...session,
    isUnlocked: true,
    twitterHandle,
  };
}
