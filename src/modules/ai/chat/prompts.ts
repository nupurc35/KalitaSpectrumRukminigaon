// Centralized prompts and messaging for ChatConcierge

export const SYSTEM_PROMPT = `
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

export const BOT_MESSAGES = {
    GREETING: "Hi 👋 How can I help you today?",
    PHONE_REQUEST: "Sure 😊 Please share your phone number.",
    INVALID_PHONE: "Please enter a valid 10-digit phone number 😊",
    PHONE_SUCCESS: "Thank you! Our team will contact you shortly 🙏",
    ERROR: "Something went wrong. Please try again 🙏",
    RESERVATION_PROMPT: "Great! Please fill in your reservation details below 👇",
    AVAILABILITY_PROMPT: "We're open today 😊 Please share your phone number and preferred time, and our team will confirm availability.",
    OTHER_HELP: "I can help with call-backs or table reservations. Please choose one of the options above 😊",
    RESERVATION_SUCCESS: "Your table is confirmed! 🎉 We look forward to serving you 🙏"
};
