import dynamic from "next/dynamic";
import { BackButton } from "@/components/layout/BackButton";

// Code-split: ChatWindow pulls in client-only chat state and isn't needed
// for the initial paint of any other route.
const ChatWindow = dynamic(
  () => import("@/features/fan-assistant/components/ChatWindow").then((m) => m.ChatWindow),
  {
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center rounded-card border border-pitch-line text-floodlight-dim">
        Loading assistant…
      </div>
    ),
  }
);

export const metadata = {
  title: "Fan Assistant — StadiumMind AI",
};

export default function FanAssistantPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-12">
      <BackButton fallbackHref="/" />
      <h1 className="mt-2 font-display text-3xl font-semibold text-floodlight">Fan Assistant</h1>
      <p className="mt-2 max-w-xl text-floodlight-dim">
        Multilingual AI guidance for navigation, food, queues, and match info.
        For medical emergencies or security concerns, alert the nearest steward directly.
      </p>
      <div className="mt-8">
        <ChatWindow />
      </div>
    </main>
  );
}
