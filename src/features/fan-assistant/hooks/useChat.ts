"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatTurn } from "@/types";
import { fetchWithTimeout, FetchTimeoutError } from "@/lib/utils/fetchWithTimeout";

/**
 * Handles sending a message to /api/chat and incrementally appending the
 * streamed response into the last assistant turn. Kept UI-agnostic so it
 * can back any presentation component (and is unit-testable without DOM).
 */
export function useChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastMessageRef = useRef<{ message: string; locale: string } | null>(null);

  const sendMessage = useCallback(async (message: string, locale = "en") => {
    setError(null);
    lastMessageRef.current = { message, locale };

    const userTurn: ChatTurn = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    const assistantTurn: ChatTurn = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setTurns((prev) => [...prev, userTurn, assistantTurn]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetchWithTimeout(
        "/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, locale }),
          signal: controller.signal,
        },
        20_000
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed with status ${res.status}`);
      }
      if (!res.body) throw new Error("No response stream from server");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setTurns((prev) =>
          prev.map((t) => (t.id === assistantTurn.id ? { ...t, content: t.content + chunk } : t))
        );
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      // Drop the empty assistant bubble that was streaming when the
      // request failed, so the retry doesn't leave a blank turn behind.
      setTurns((prev) => prev.filter((t) => t.id !== assistantTurn.id || t.content.length > 0));
      if (err instanceof FetchTimeoutError) {
        setError("The assistant took too long to respond. Please check your connection and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const retryLast = useCallback(() => {
    if (!lastMessageRef.current) return;
    const { message, locale } = lastMessageRef.current;
    void sendMessage(message, locale);
  }, [sendMessage]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { turns, sendMessage, retryLast, isStreaming, error, cancel };
}
