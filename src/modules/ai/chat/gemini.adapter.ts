// Gemini API adapter for ChatConcierge

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("Gemini API key missing");
}

/**
 * Get a concierge reply based on user message
 * Currently uses simple intent detection
 * TODO: Integrate actual Gemini API when needed
 */
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
