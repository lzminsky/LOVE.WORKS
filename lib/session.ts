import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "lovebomb-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface Session {
  sessionId: string;
  promptCount: number;
  isUnlocked: boolean;
  twitterHandle: string | null;
  createdAt: number;
}

function getSecret(): string | null {
  return process.env.SESSION_SECRET || null;
}

function sign(payload: string): string {
  const secret = getSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function verify(payload: string, signature: string): boolean {
  const secret = getSecret();
  if (!secret) return true; // No secret configured — accept unsigned (dev fallback)
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function generateSessionId(): string {
  return crypto.randomUUID();
}

function encodeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64");
  const sig = sign(payload);
  return sig ? `${payload}.${sig}` : payload;
}

function decodeSession(encoded: string): Session | null {
  try {
    const dotIndex = encoded.lastIndexOf(".");
    let payload: string;

    if (dotIndex !== -1) {
      // Signed cookie: payload.signature
      payload = encoded.substring(0, dotIndex);
      const sig = encoded.substring(dotIndex + 1);
      if (!verify(payload, sig)) return null;
    } else {
      // Unsigned cookie (legacy or no secret configured)
      const secret = getSecret();
      if (secret) return null; // Secret is set but cookie is unsigned — reject
      payload = encoded;
    }

    const json = Buffer.from(payload, "base64").toString("utf-8");
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
