
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResponse, Teacher } from "../types";

export const searchTeachersByCity = async (city: string): Promise<SearchResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Find all high schools (תיכונים) in the city of "${city}", Israel.
    For each high school, identify the following staff members:
    1. Physics Teachers (preferably coordinators/רכזים)
    2. Chemistry Teachers (preferably coordinators/רכזים)
    3. Biology Teachers (preferably coordinators/רכזים)

    For each teacher/coordinator found, provide:
    - Name (שם מלא)
    - School Name (שם בית הספר)
    - Email (אימייל)
    - Phone (טלפון)
    - Role (תפקיד - רכז/מורה)
    - Note (הערה רלוונטית - כאן עליך להוסיף כל מידע נוסף שמצאת על המורה: וותק, תחומי עניין מדעיים, פרסים, קישורים לפרופילים מקצועיים אם קיימים, או כל מידע מעניין אחר מאתר בית הספר).

    Format the final result as a valid JSON object with three arrays: "physics", "chemistry", and "biology".
    Each array element should have: name, school, email, phone, role, note.
    If details are missing, put "לא נמצא".
    Focus on public information from school websites, Ministry of Education directories, and official school newsletters.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            physics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  school: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  role: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
                required: ["name", "school", "email", "phone", "role", "note"]
              }
            },
            chemistry: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  school: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  role: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
                required: ["name", "school", "email", "phone", "role", "note"]
              }
            },
            biology: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  school: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  role: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
                required: ["name", "school", "email", "phone", "role", "note"]
              }
            }
          },
          required: ["physics", "chemistry", "biology"]
        }
      },
    });

    const resultText = response.text;
    const parsedData = JSON.parse(resultText);
    
    // Extract sources from grounding metadata
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "מקור מידע",
        uri: chunk.web?.uri || "#"
      })) || [];

    return {
      physics: parsedData.physics || [],
      chemistry: parsedData.chemistry || [],
      biology: parsedData.biology || [],
      sources: sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("נכשלנו באחזור הנתונים. אנא נסה שוב מאוחר יותר.");
  }
};
