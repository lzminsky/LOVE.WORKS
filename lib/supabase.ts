import { createClient } from "@supabase/supabase-js";

// Types for our database tables
export interface DbUser {
  id: string;
  twitter_id: string | null;
  twitter_handle: string | null;
  created_at: string;
  unlocked: boolean;
  unlocked_at: string | null;
  prompt_count: number;
}

export interface DbSession {
  id: string;
  user_id: string | null;
  session_token: string;
  created_at: string;
  last_active: string;
  prompt_count: number;
}

// Server-side client (uses service role key for full access)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials not configured - using fallback session management");
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Session management with Supabase
export async function getOrCreateSession(sessionToken: string | null): Promise<{
  session: DbSession;
  user: DbUser | null;
  isNew: boolean;
}> {
  const supabase = createServerClient();

  // Fallback if Supabase not configured
  if (!supabase) {
    return {
      session: {
        id: crypto.randomUUID(),
        user_id: null,
        session_token: sessionToken || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        prompt_count: 0,
      },
      user: null,
      isNew: !sessionToken,
    };
  }

  // Try to find existing session
  if (sessionToken) {
    const { data: existingSession } = await supabase
      .from("sessions")
      .select("*, users(*)")
      .eq("session_token", sessionToken)
      .single();

    if (existingSession) {
      // Update last_active
      await supabase
        .from("sessions")
        .update({ last_active: new Date().toISOString() })
        .eq("id", existingSession.id);

      return {
        session: existingSession as DbSession,
        user: existingSession.users as DbUser | null,
        isNew: false,
      };
    }
  }

  // Create new session
  const newToken = crypto.randomUUID();
  const { data: newSession, error } = await supabase
    .from("sessions")
    .insert({
      session_token: newToken,
      prompt_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create session:", error);
    throw error;
  }

  return {
    session: newSession as DbSession,
    user: null,
    isNew: true,
  };
}

// Increment prompt count
export async function incrementPromptCount(sessionId: string): Promise<number> {
  const supabase = createServerClient();

  if (!supabase) {
    return 0; // Fallback handled by cookie session
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({ prompt_count: supabase.rpc("increment_prompt_count", { row_id: sessionId }) })
    .eq("id", sessionId)
    .select("prompt_count")
    .single();

  if (error) {
    // Fallback: fetch current count and increment
    const { data: current } = await supabase
      .from("sessions")
      .select("prompt_count")
      .eq("id", sessionId)
      .single();

    const newCount = (current?.prompt_count || 0) + 1;

    await supabase
      .from("sessions")
      .update({ prompt_count: newCount })
      .eq("id", sessionId);

    return newCount;
  }

  return data?.prompt_count || 0;
}

// Link session to Twitter user and unlock
export async function linkTwitterAndUnlock(
  sessionToken: string,
  twitterId: string,
  twitterHandle: string
): Promise<{ user: DbUser; session: DbSession }> {
  const supabase = createServerClient();

  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  // Check if user exists
  let { data: user } = await supabase
    .from("users")
    .select()
    .eq("twitter_id", twitterId)
    .single();

  if (!user) {
    // Create new user
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        twitter_id: twitterId,
        twitter_handle: twitterHandle,
        unlocked: true,
        unlocked_at: new Date().toISOString(),
        prompt_count: 0,
      })
      .select()
      .single();

    if (userError) throw userError;
    user = newUser;
  } else if (!user.unlocked) {
    // Unlock existing user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        unlocked: true,
        unlocked_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    user = updatedUser;
  }

  // Link session to user
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .update({ user_id: user.id })
    .eq("session_token", sessionToken)
    .select()
    .single();

  if (sessionError) throw sessionError;

  return { user: user as DbUser, session: session as DbSession };
}

// Check if user is unlocked
export async function checkUnlocked(sessionToken: string): Promise<boolean> {
  const supabase = createServerClient();

  if (!supabase) {
    return false;
  }

  const { data } = await supabase
    .from("sessions")
    .select("users(unlocked)")
    .eq("session_token", sessionToken)
    .single();

  // Supabase returns joined relations - cast through unknown to handle type inference
  const users = data?.users as unknown as { unlocked: boolean } | null;
  return users?.unlocked || false;
}
