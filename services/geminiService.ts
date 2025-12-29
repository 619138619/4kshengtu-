import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";

// Helper to check for API key selection for paid models
export const checkApiKeySelection = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    return hasKey;
  }
  return true; // Fallback if not in the specific environment, assuming env var works
};

export const promptSelectKey = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.openSelectKey) {
    await win.aistudio.openSelectKey();
  } else {
    alert("Please ensure your API Key is set in the environment.");
  }
};

const getAIClient = () => {
  // Always create a new client to ensure we pick up any newly selected API key
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// 1. Style Transfer (Nano Banana Pro / gemini-3-pro-image-preview)
export const generateStyledImage = async (
  base64Image: string,
  promptSuffix: string
): Promise<string> => {
  const ai = getAIClient();
  const mimeType = "image/png"; // Assumed from canvas/file input

  // Construct a prompt that locks onto the face
  const fullPrompt = `Generate a new image of the person in this reference image. Maintain the facial features and likeness strictly. Render the person ${promptSuffix}. High quality, detailed.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          { text: fullPrompt }
        ]
      },
      config: {
        imageConfig: {
          imageSize: '1K', // Default for faster multi-gen
          aspectRatio: '1:1'
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from API");
  } catch (error) {
    console.error("Style Gen Error:", error);
    throw error;
  }
};

// 2. Edit Image (Gemini 2.5 Flash Image)
export const editImageWithPrompt = async (
  base64Image: string,
  instruction: string
): Promise<string> => {
  const ai = getAIClient();
  const mimeType = "image/png";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          { text: instruction }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Edit API");
  } catch (error) {
    console.error("Edit Error:", error);
    throw error;
  }
};

// 3. Generate from Scratch (Nano Banana Pro / gemini-3-pro-image-preview)
export const generateImageFromScratch = async (
  prompt: string,
  size: ImageSize
): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: '1:1'
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Generate API");
  } catch (error) {
    console.error("Generate Error:", error);
    throw error;
  }
};

// Helper for file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};