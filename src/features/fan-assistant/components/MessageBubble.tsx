"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ChatTurn } from "@/types";
import { cn } from "@/lib/utils/cn";

export function MessageBubble({ turn }: { turn: ChatTurn }) {
  const isUser = turn.role === "user";
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "max-w-[80%] rounded-card px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-turf text-pitch"
            : "border border-pitch-line bg-pitch-surface text-floodlight"
        )}
        // role="status" only on assistant turns so screen readers announce
        // streamed replies without re-announcing the user's own message.
        {...(!isUser ? { role: "status", "aria-live": "polite" as const } : {})}
      >
        {turn.content || (
          <span className="text-floodlight-dim" aria-hidden="true">
            &hellip;
          </span>
        )}
      </motion.div>
    </div>
  );
}
