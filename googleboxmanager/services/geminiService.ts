import { GoogleGenAI, Type } from "@google/genai";
import { ItemAttribute } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API Key found in process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const suggestAttributes = async (itemName: string, description: string): Promise<ItemAttribute[]> => {
  const ai = getAI();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `为以下物品生成有用的库存属性列表：物品名称 "${itemName}"，描述 "${description}"。
      请严格返回键值对（key-value），描述其物理属性、类型或用途。
      例如：电池的"电压"，书籍的"作者"，衣服的"尺寸"。
      请使用中文返回。限制为 3-5 个最重要的属性。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              value: { type: Type.STRING }
            },
            required: ["key", "value"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const attributes = JSON.parse(text) as ItemAttribute[];
    return attributes;
  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return [];
  }
};

export const smartSearchInterpretation = async (query: string): Promise<string[]> => {
    const ai = getAI();
    if (!ai) return [query];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `用户正在搜索家庭库存中的物品。查询词： "${query}"。
            请返回一个包含 3-5 个同义词、相关类别或特定物品类型的 JSON 列表，这些词可能与该查询匹配。
            请使用中文返回。
            例如："露营" -> ["帐篷", "睡袋", "营地灯", "户外装备"]`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        const text = response.text;
        if(!text) return [query];
        return JSON.parse(text) as string[];

    } catch (e) {
        console.error("Gemini search expansion error", e);
        return [query];
    }
}