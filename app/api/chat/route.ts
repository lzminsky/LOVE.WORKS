import { NextRequest, NextResponse } from "next/server";

// Stub API route for chat
// TODO: Implement actual Claude API integration with:
// - Vercel AI SDK streaming
// - Cookie-based session management
// - Rate limiting via Upstash Redis
// - Prompt counting

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // For now, return a mock response
    // In production, this would use streamText from Vercel AI SDK
    return NextResponse.json({
      message: "API stub - implement Claude integration",
      received: messages.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

/*
// Production implementation would look like:

import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const SYSTEM_PROMPT = `...`; // 36k char system prompt

export async function POST(req: NextRequest) {
  // 1. Validate session from cookie
  // 2. Check rate limit via Upstash
  // 3. Check prompt count

  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: SYSTEM_PROMPT,
    messages,
  });

  // 4. Increment prompt count in cookie

  return result.toDataStreamResponse();
}
*/
