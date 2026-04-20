import { GoogleGenAI, Type } from "@google/genai";
import { Category, Notification, AISummary } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey as string });

export async function classifyNotification(sender: string, content: string, app: string): Promise<Category> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Classify this notification from ${app} (Sender: ${sender}): "${content}". 
      Return one of these categories: Personal, Work, Important, Social, Other. 
      Respond with ONLY the category name.`,
    });
    
    const category = response.text?.trim() as Category;
    const validCategories: Category[] = ['Personal', 'Work', 'Important', 'Social', 'Other'];
    return validCategories.includes(category) ? category : 'Other';
  } catch (error) {
    console.error("Classification error:", error);
    return 'Other';
  }
}

export async function generateDailySummary(notifications: Notification[]): Promise<AISummary> {
  const simplified = notifications.map(n => ({
    from: n.sender,
    msg: n.content,
    cat: n.category,
    app: n.app
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a snapshot summary of these notifications: ${JSON.stringify(simplified)}.
      Format your response as JSON with these keys: 
      "summaryText" (string, max 100 chars), 
      "urgentCount" (number of priority messages),
      "breakdown" (object with counts for Personal, Work, Important, Social). 
      Make it feel like a high-level intelligence report.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryText: { type: Type.STRING },
            urgentCount: { type: Type.NUMBER },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                Personal: { type: Type.NUMBER },
                Work: { type: Type.NUMBER },
                Important: { type: Type.NUMBER },
                Social: { type: Type.NUMBER },
              }
            }
          },
          required: ["summaryText", "urgentCount", "breakdown"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AISummary;
  } catch (error) {
    console.error("Summary error:", error);
    return {
      totalNotifications: notifications.length,
      urgentCount: 0,
      summaryText: "Efficiency is key. Review your vault manually.",
      breakdown: { Personal: 0, Work: 0, Important: 0, Social: 0 } as any
    };
  }
}
