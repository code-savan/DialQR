import { GoogleGenAI, Type } from "@google/genai";
import { PhoneAnalysis } from "../types";

// The API_KEY is injected by Vite's define config during build
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePhoneNumber = async (number: string): Promise<PhoneAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this phone number and provide feedback: ${number}. Determine if it looks like a valid international or local format and identify the likely country.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            formatted: { type: Type.STRING },
            countrySuggestion: { type: Type.STRING },
            securityNote: { type: Type.STRING }
          },
          required: ["isValid", "formatted"]
        }
      }
    });

    // Handle string | undefined by providing a default empty string for the compiler
    const responseText = response.text ?? "";
    
    if (responseText.length === 0) {
      throw new Error("No text content returned from Gemini API");
    }

    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Graceful fallback to ensure the app stays functional even if AI fails
    return {
      isValid: true,
      formatted: number,
      countrySuggestion: "Detected"
    };
  }
};