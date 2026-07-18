import { NextRequest, NextResponse } from "next/server";
import { getAiClient, AiProviderError } from "@/lib/ai/client";
import { FAN_ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { guardUserInput } from "@/lib/ai/promptGuard";
import { chatRequestSchema } from "@/lib/security/sanitize";
import { rateLimit } from "@/lib/security/rateLimit";
import { getDemoFanAssistantResponse } from "@/features/fan-assistant/lib/demoData";

export const runtime = "nodejs"; // streaming fetch to provider needs Node runtime here

/**
 * POST /api/chat
 * Streams the Fan Assistant's reply as plain text chunks (text/event-stream
 * would also work; kept simple as a ReadableStream of UTF-8 text so the
 * client hook can consume it with a basic reader).
 *
 * Security pipeline (in order): rate limit -> schema validation ->
 * injection guard -> scoped system prompt -> provider call. Errors are
 * mapped to generic client-safe messages; internals are only logged.
 */
export async function POST(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limit = rateLimit(`chat:${identifier}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before sending another message." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAtMs - Date.now()) / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const guard = guardUserInput(parsed.data.message);
  if (!guard.safe) {
    // Don't silently execute a flagged message — respond with a safe,
    // static message instead of forwarding it to the model.
    return NextResponse.json(
      {
        error:
          "Your message couldn't be processed. Please rephrase your question about stadium services.",
      },
      { status: 400 }
    );
  }

  try {
    const ai = getAiClient();
    const stream = ai.streamChat([
      { role: "system", content: FAN_ASSISTANT_SYSTEM_PROMPT },
      { role: "user", content: `${guard.sanitized}\n\nRespond in locale: ${parsed.data.locale}` },
    ]);

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          // Never leak provider error internals to the client stream.
          console.error("[api/chat] stream error", err);
          controller.enqueue(encoder.encode("\n[The assistant hit an error. Please try again.]"));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (err) {
    if (err instanceof AiProviderError) {
      console.error("[api/chat] provider misconfigured, using demo response mode");
      const demoMessage = getDemoFanAssistantResponse(parsed.data.message);
      const encoder = new TextEncoder();
      const readable = new ReadableStream<Uint8Array>({
        start(controller) {
          for (const chunk of demoMessage.split(" ")) {
            controller.enqueue(encoder.encode(`${chunk} `));
          }
          controller.close();
        },
      });
      return new NextResponse(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      });
    }
    console.error("[api/chat] unexpected error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
