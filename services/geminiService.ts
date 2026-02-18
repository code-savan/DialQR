
import { GoogleGenAI, Type } from "@google/genai";
import { PhoneAnalysis } from "../types";

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

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      isValid: true,
      formatted: number,
      countrySuggestion: "Unknown"
    };
  }
};
