import { NextRequest } from "next/server";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import {
  getSession,
  incrementPromptCount,
  serializeSessionCookie,
} from "@/lib/session";
import { CONFIG } from "@/lib/constants";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    // Create streaming response with Claude
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // Create custom stream that parses equilibrium and analysis blocks
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullText = "";

        try {
          for await (const chunk of (await result).textStream) {
            fullText += chunk;

            // Send text chunk
            const textChunk = JSON.stringify({ type: "text", content: chunk }) + "\n";
            controller.enqueue(encoder.encode(textChunk));
          }

          // After streaming completes, parse for equilibrium and analysis blocks
          const equilibrium = parseEquilibrium(fullText);
          const analysis = parseAnalysis(fullText);

          if (equilibrium) {
            const equilibriumChunk =
              JSON.stringify({ type: "equilibrium", data: equilibrium }) + "\n";
            controller.enqueue(encoder.encode(equilibriumChunk));
          }

          if (analysis) {
            const analysisChunk =
              JSON.stringify({ type: "analysis", data: analysis }) + "\n";
            controller.enqueue(encoder.encode(analysisChunk));
          }

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
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
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

// Parse equilibrium block from response
function parseEquilibrium(text: string) {
  const match = text.match(/```equilibrium\n([\s\S]*?)\n```/);
  if (!match) return null;

  try {
    const data = JSON.parse(match[1]);
    // Validate structure
    if (data.id && data.name && data.description && typeof data.confidence === 'number' && Array.isArray(data.predictions)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

// Parse formal analysis block from response
function parseAnalysis(text: string) {
  const match = text.match(/```analysis\n([\s\S]*?)\n```/);
  if (!match) return null;

  try {
    const data = JSON.parse(match[1]);
    // Validate structure
    if (Array.isArray(data.parameters) && Array.isArray(data.extensions)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}
