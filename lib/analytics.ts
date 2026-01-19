import posthog from "posthog-js";

// Initialize PostHog (client-side only)
let initialized = false;

export function initAnalytics() {
  if (typeof window === "undefined") return;
  if (initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key) {
    console.warn("PostHog not configured - analytics disabled");
    return;
  }

  posthog.init(key, {
    api_host: host || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false, // We'll handle this manually
    capture_pageleave: true,
    autocapture: false, // We want explicit events only
  });

  initialized = true;
}

// Analytics events from PRD
export const Analytics = {
  // Page view
  pageView: (page: string, referrer?: string) => {
    if (typeof window === "undefined") return;
    posthog.capture("page_view", { page, referrer });
  },

  // Conversation started
  conversationStarted: (source?: string) => {
    if (typeof window === "undefined") return;
    posthog.capture("conversation_started", { source });
  },

  // Message sent
  messageSent: (promptNumber: number, isGated: boolean) => {
    if (typeof window === "undefined") return;
    posthog.capture("message_sent", {
      prompt_number: promptNumber,
      is_gated: isGated,
    });
  },

  // Gate reached
  gateReached: (promptCount: number) => {
    if (typeof window === "undefined") return;
    posthog.capture("gate_reached", { prompt_count: promptCount });
  },

  // Twitter auth started
  twitterAuthStarted: () => {
    if (typeof window === "undefined") return;
    posthog.capture("twitter_auth_started");
  },

  // Twitter auth completed
  twitterAuthCompleted: (alreadyEngaged: boolean) => {
    if (typeof window === "undefined") return;
    posthog.capture("twitter_auth_completed", { already_engaged: alreadyEngaged });
  },

  // Engagement verified
  engagementVerified: (liked: boolean, retweeted: boolean) => {
    if (typeof window === "undefined") return;
    posthog.capture("engagement_verified", { liked, retweeted });
  },

  // User unlocked
  unlocked: (timeToUnlockMs: number) => {
    if (typeof window === "undefined") return;
    posthog.capture("unlocked", { time_to_unlock: timeToUnlockMs });
  },

  // Formal analysis requested
  formalAnalysisRequested: (promptNumber: number) => {
    if (typeof window === "undefined") return;
    posthog.capture("formal_analysis_requested", { prompt_number: promptNumber });
  },

  // Export generated
  exportGenerated: (shareMethod: "png" | "markdown" | "link" | "twitter") => {
    if (typeof window === "undefined") return;
    posthog.capture("export_generated", { share_method: shareMethod });
  },

  // Share completed
  shareCompleted: (platform: "twitter" | "copy_link" | "download") => {
    if (typeof window === "undefined") return;
    posthog.capture("share_completed", { platform });
  },

  // Error occurred
  errorOccurred: (errorType: string, errorMessage?: string) => {
    if (typeof window === "undefined") return;
    posthog.capture("error_occurred", {
      error_type: errorType,
      error_message: errorMessage,
    });
  },

  // Rate limited
  rateLimited: (limitType: "per_second" | "hourly" | "lifetime") => {
    if (typeof window === "undefined") return;
    posthog.capture("rate_limited", { limit_type: limitType });
  },

  // Identify user (after Twitter auth)
  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    posthog.identify(userId, traits);
  },

  // Reset (on logout or session clear)
  reset: () => {
    if (typeof window === "undefined") return;
    posthog.reset();
  },
};
