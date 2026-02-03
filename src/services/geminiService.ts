const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `
You are Kalita Concierge for Kalita Spectrum restaurant in Guwahati.
Your main goal is to politely guide users toward:
1. Sharing contact details for a call-back
2. Table reservation inquiries

Rules:
- Keep responses under 80 words
- Ask for name + phone if intent is clear
- Never mention AI, models, or technology
- If unsure, gently ask how you can help
`;

export async function getConciergeReply(userMessage: string): Promise<string> {
  // Simple intent detection
  const lower = userMessage.toLowerCase();

  if (lower.includes("call") || lower.includes("contact")) {
    return "Sure 😊 I can arrange a call-back. May I have your name and phone number?";
  }

  if (lower.includes("table") || lower.includes("book")) {
    return "I can help with table reservations. Please share your name, phone number, and preferred time.";
  }

  return "Welcome to Kalita Spectrum! Would you like a call-back or help with a reservation?";
}
