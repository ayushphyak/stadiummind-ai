"use client";

import { useState, type FormEvent } from "react";
import { Send, RotateCcw, Globe } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { FAN_ASSISTANT_DEMO_PROMPTS } from "@/features/fan-assistant/lib/demoData";

const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
];

export function ChatWindow() {
  const { turns, sendMessage, retryLast, isStreaming, error } = useChat();
  const [draft, setDraft] = useState("");
  const [locale, setLocale] = useState("en");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    // Guards against double-submit while a previous request is still
    // streaming — cheaper and simpler than a debounce timer for this case.
    if (!trimmed || isStreaming) return;
    setDraft("");
    void sendMessage(trimmed, locale);
  };

  const handleDemoPrompt = (prompt: string) => {
    if (isStreaming) return;
    setDraft("");
    void sendMessage(prompt, locale);
  };

  return (
    <div className="flex h-[70vh] flex-col rounded-card border border-pitch-line bg-pitch-surface/60">
      <div className="flex items-center justify-between border-b border-pitch-line px-4 py-3">
        <h2 className="font-display text-base font-semibold">Fan Assistant</h2>
        <label className="flex items-center gap-1.5 text-xs text-floodlight-dim">
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          Language
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="rounded-md border border-pitch-line bg-pitch px-2 py-1 text-floodlight"
            aria-label="Response language"
          >
            {SUPPORTED_LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        role="log"
        aria-label="Conversation with Fan Assistant"
      >
        {turns.length === 0 ? (
          // Empty state as an invitation to act, per design guidance.
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-floodlight-dim">
            <p className="font-display text-lg text-floodlight">Ask me anything about today&apos;s match</p>
            <p className="max-w-xs text-sm">
              Try: &ldquo;Where&apos;s the nearest restroom to Section 214?&rdquo; or &ldquo;How long is the queue at Gate C?&rdquo;
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {FAN_ASSISTANT_DEMO_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDemoPrompt(prompt)}
                  disabled={isStreaming}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((t) => <MessageBubble key={t.id} turn={t} />)
        )}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-md bg-alert-red/10 px-3 py-2 text-sm text-alert-red"
          >
            <span>{error}</span>
            <Button type="button" size="sm" variant="ghost" onClick={retryLast} className="shrink-0 text-alert-red hover:bg-alert-red/10">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-pitch-line p-3">
        <label htmlFor="chat-input" className="sr-only">
          Message the Fan Assistant
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about seats, food, queues, or schedules..."
          maxLength={2000}
          className="h-11 flex-1 rounded-card border border-pitch-line bg-pitch px-4 text-sm text-floodlight placeholder:text-floodlight-dim focus-visible:border-turf"
        />
        <Button type="submit" disabled={isStreaming || !draft.trim()}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {isStreaming ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
