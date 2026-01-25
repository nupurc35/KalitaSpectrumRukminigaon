
import { GoogleGenAI } from "@google/genai";

export const getTasteRecommendation = async (userPreference: string) => {
  try {
    // Initializing directly in the call to ensure the latest process.env.API_KEY is used
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing from the environment.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User preference: ${userPreference}`,
      config: {
        systemInstruction: `You are the "Kalita Concierge" for Kalita Spectrum on GS Road, Guwahati. 
        Your role is to guide guests through our multi-cuisine "Spectrum" which includes Main Menu (North Indian), Oriental Delights, Continental Grills, Beverage Bar, and Desserts.
        Do NOT mention Korean food.
        We are known for our diverse range—from home-style Murgir Jhol and Burmese Khao Suey to premium Continental Sizzlers.
        Recommend specific categories or signature dishes based on the user's mood.
        Tone: Sophisticated, welcoming, and knowledgeable.
        Max 2-3 sentences.`,
        temperature: 0.7,
      },
    });

    return response.text || "I recommend exploring our signature Spectrum Sizzlers or our heart-warming Burmese Khao Suey—just a few highlights of the culinary spectrum we offer.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the menu database right now, but our signature grills and oriental delights are always a wonderful choice!";
  }
};
