
import { GoogleGenAI, Type } from "@google/genai";
import { TableData } from "../types";

export const extractTableFromImage = async (base64Data: string, mimeType: string): Promise<TableData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Act as a high-precision OCR and table extraction specialist. 
            Examine the provided image of a document or paper sheet.
            1. Detect the main table structure.
            2. Extract all rows and columns exactly as they appear.
            3. If headers are present, identify them.
            4. Return the data as a JSON object with two fields: 'headers' (array of strings) and 'rows' (array of array of strings).
            
            Maintain the relative positioning of data. Empty cells should be represented as empty strings.`
          },
          {
            inlineData: {
              data: base64Data.split(',')[1] || base64Data,
              mimeType: mimeType
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The column headers of the table"
          },
          rows: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            description: "The data rows of the table"
          }
        },
        required: ["headers", "rows"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return result as TableData;
};
