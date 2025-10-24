
import { GoogleGenAI } from "@google/genai";
import type { LocationData } from '../types';

let ai: GoogleGenAI | null = null;

function getAi() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }
  return ai;
}

export async function getLocationContext(location: LocationData): Promise<string> {
  try {
    const genAI = getAi();
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the provided coordinates, what is the likely name of the venue or building (e.g., "Main Library Auditorium", "Science Building Room 101", "Downtown Office")? Be concise.`,
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        }
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error getting location context from Gemini:", error);
    return "N/A";
  }
}
