import "server-only";

/**
 * Provider-agnostic AI client.
 *
 * Why this exists: the hackathon brief allows Gemini or OpenAI, and a real
 * ops platform shouldn't be hard-wired to one vendor (pricing, quota, or
 * regional availability can force a swap mid-tournament). Callers depend on
 * `AiClient`, never on a specific SDK.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiClient {
  /** Streams response chunks as they arrive from the provider. */
  streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown>;
}

class GeminiClient implements AiClient {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    const systemMessage = messages.find((m) => m.role === "system");
    const conversation = messages.filter((m) => m.role !== "system");

    const body = {
      systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
      contents: conversation.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok || !res.body) {
      throw new AiProviderError(`Gemini request failed with status ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const parsed = JSON.parse(payload);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text as string;
        } catch {
          // Malformed SSE frame — skip rather than crash the stream.
          continue;
        }
      }
    }
  }
}

class OpenAiClient implements AiClient {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });

    if (!res.ok || !res.body) {
      throw new AiProviderError(`OpenAI request failed with status ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const parsed = JSON.parse(payload);
          const text = parsed?.choices?.[0]?.delta?.content;
          if (text) yield text as string;
        } catch {
          continue;
        }
      }
    }
  }
}

export class AiProviderError extends Error {}

/** Factory — reads env at call time so tests can swap providers freely. */
export function getAiClient(): AiClient {
  const provider = process.env.AI_PROVIDER ?? "gemini";

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new AiProviderError("OPENAI_API_KEY is not configured");
    return new OpenAiClient(key, process.env.OPENAI_MODEL ?? "gpt-4o-mini");
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiProviderError("GEMINI_API_KEY is not configured");
  return new GeminiClient(key, process.env.GEMINI_MODEL ?? "gemini-1.5-flash");
}
