import { NextRequest } from "next/server";
import {
  getSession,
  incrementPromptCount,
  serializeSessionCookie,
} from "@/lib/session";
import { CONFIG } from "@/lib/constants";

// Mock streaming response for development (no API key needed)
// Replace with real Claude integration when ready
const MOCK_RESPONSE = `This is a classic situationship structure. He's keeping you in the zone between his casual threshold and his commitment threshold—close enough that you stay, far enough that he preserves optionality.

The daily texting is low-cost maintenance. It keeps you engaged without requiring actual investment. The weekend avoidance is the tell: weekends are when real couples do things. He's protecting that time for optionality—either other options, or just the freedom to have them.

The bar stories while claiming "busy with work" is information leakage. He's not even hiding it well, which suggests he's not that worried about losing you. That tells you something about how he's pricing your exit threat.`;

const MOCK_EQUILIBRIUM = {
  id: "EQ-001",
  name: "Situationship Steady State",
  description:
    "A stable equilibrium where he extracts value while preserving optionality.",
  confidence: 70,
  predictions: [
    { outcome: "Status quo continues", probability: 65, level: "high" },
    { outcome: "He fades out", probability: 20, level: "medium" },
    { outcome: "She exits", probability: 12, level: "low" },
    { outcome: "He commits", probability: 3, level: "minimal" },
  ],
};

const MOCK_FORMAL_ANALYSIS = {
  parameters: [
    {
      param: "MP_M",
      value: "60-75th %ile",
      basis: "Active social life, multiple options",
    },
    {
      param: "MP_F",
      value: "55-70th %ile",
      basis: "Maintained but not prioritized",
    },
    { param: "T_commit", value: "> her MP_F", basis: "No commitment signals" },
    { param: "T_casual", value: "< her MP_F", basis: "Maintained contact" },
  ],
  extensions: [
    {
      id: "EXT-V",
      name: "Credit Rationing",
      status: "ACTIVE",
      detail: "He's rationing commitment. Q_commit = 0 for her.",
    },
    {
      id: "EXT-IX",
      name: "Tournament Effects",
      status: "LIKELY",
      detail: "Weekend bar activity suggests active market participation.",
    },
  ],
};

export async function POST(req: NextRequest) {
  try {
    // Get or create session
    const session = await getSession();

    // Check if user has hit the gate
    if (!session.isUnlocked && session.promptCount >= CONFIG.maxFreeMessages) {
      return new Response(
        JSON.stringify({
          error: "gate_required",
          promptCount: session.promptCount,
          maxPrompts: CONFIG.maxFreeMessages,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Increment prompt count
    const updatedSession = incrementPromptCount(session);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simulate streaming by sending chunks
        const words = MOCK_RESPONSE.split(" ");

        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? " " : "");
          const chunk = JSON.stringify({ type: "text", content: word }) + "\n";
          controller.enqueue(encoder.encode(chunk));

          // Simulate typing delay
          await new Promise((resolve) => setTimeout(resolve, 30));
        }

        // Send equilibrium data
        const equilibriumChunk =
          JSON.stringify({ type: "equilibrium", data: MOCK_EQUILIBRIUM }) + "\n";
        controller.enqueue(encoder.encode(equilibriumChunk));

        // Send formal analysis
        const analysisChunk =
          JSON.stringify({ type: "analysis", data: MOCK_FORMAL_ANALYSIS }) + "\n";
        controller.enqueue(encoder.encode(analysisChunk));

        // Send done signal with updated session info
        const doneChunk =
          JSON.stringify({
            type: "done",
            promptCount: updatedSession.promptCount,
            maxPrompts: CONFIG.maxFreeMessages,
            isUnlocked: updatedSession.isUnlocked,
          }) + "\n";
        controller.enqueue(encoder.encode(doneChunk));

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Set-Cookie": serializeSessionCookie(updatedSession),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/*
================================================================================
CLAUDE INTEGRATION (swap in when you have API key)
================================================================================

import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// Add to dependencies:
// npm install ai @ai-sdk/anthropic

const SYSTEM_PROMPT = `...`; // Your 36k char system prompt here

// Replace the mock streaming section with:

const result = await streamText({
  model: anthropic("claude-sonnet-4-20250514"),
  system: SYSTEM_PROMPT,
  messages: messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  })),
});

return result.toDataStreamResponse({
  headers: {
    "Set-Cookie": serializeSessionCookie(updatedSession),
  },
});

================================================================================
*/
