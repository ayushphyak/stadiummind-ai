export const FAN_ASSISTANT_DEMO_PROMPTS = [
  "Where is the nearest restroom to Section 214?",
  "How long is the queue at Gate C right now?",
  "What food options are open near Gate B?",
  "Can you give me walking directions to my seat in Section 108?",
];

const DEFAULT_DEMO_RESPONSE =
  "Welcome to StadiumMind AI demo mode. I can help with seating directions, crowd updates, food locations, and match-day services around the stadium.";

const DEMO_RESPONSE_RULES: Array<{ test: (message: string) => boolean; response: string }> = [
  {
    test: (message) => /(restroom|bathroom|toilet|washroom)/i.test(message),
    response:
      "The nearest restroom to Section 214 is on Level 2 behind the north concourse. Follow the overhead signs toward Gate B and you should reach it in about 2 minutes.",
  },
  {
    test: (message) => /(gate c|queue|wait|line)/i.test(message),
    response:
      "Gate C is currently showing a high queue with an estimated 12–15 minute wait. For faster entry, Gate D is lower traffic right now at around 4 minutes.",
  },
  {
    test: (message) => /(food|eat|snack|drink|vendor)/i.test(message),
    response:
      "Near Gate B you can find tacos, pizza slices, and halal wraps open now. The shortest line is usually at the express kiosks near Section 119.",
  },
  {
    test: (message) => /(seat|section|directions|wayfinding|find)/i.test(message),
    response:
      "From the main concourse, head to the nearest stairwell marked for Sections 100–120, then follow signs for your block. Stewards in yellow vests can guide you to the exact row if needed.",
  },
];

export function getDemoFanAssistantResponse(message: string) {
  const normalizedMessage = message.trim();
  if (!normalizedMessage) return DEFAULT_DEMO_RESPONSE;

  const rule = DEMO_RESPONSE_RULES.find(({ test }) => test(normalizedMessage));
  return rule?.response ?? DEFAULT_DEMO_RESPONSE;
}
