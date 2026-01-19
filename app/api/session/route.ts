import { getSession, serializeSessionCookie, createSession } from "@/lib/session";
import { CONFIG } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getSession();

    // If this is a new session, set the cookie
    const isNew = session.promptCount === 0 && !session.isUnlocked;

    return new Response(
      JSON.stringify({
        promptCount: session.promptCount,
        maxPrompts: CONFIG.maxFreeMessages,
        isUnlocked: session.isUnlocked,
        remaining: CONFIG.maxFreeMessages - session.promptCount,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...(isNew && { "Set-Cookie": serializeSessionCookie(session) }),
        },
      }
    );
  } catch (error) {
    console.error("Session API error:", error);
    // Return default session state on error
    return new Response(
      JSON.stringify({
        promptCount: 0,
        maxPrompts: CONFIG.maxFreeMessages,
        isUnlocked: false,
        remaining: CONFIG.maxFreeMessages,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
