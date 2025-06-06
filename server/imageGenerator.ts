import OpenAI from "openai";
import type { GameState } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rate limiting for image generation
let lastImageGeneration = 0;
const IMAGE_GENERATION_COOLDOWN = 10000; // 10 seconds between generations

export async function generateSceneImage(gameState: GameState): Promise<string | null> {
  try {
    // Check rate limit
    const now = Date.now();
    if (now - lastImageGeneration < IMAGE_GENERATION_COOLDOWN) {
      console.log('Image generation rate limited, skipping');
      return null;
    }
    
    lastImageGeneration = now;
    const prompt = createSoloLevelingPrompt(gameState);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

function createSoloLevelingPrompt(gameState: GameState): string {
  const baseStyle = "Korean manhwa art style, fantasy adventure, dramatic lighting, detailed artwork, webtoon aesthetic, cinematic composition";
  
  // Determine scene type based on current narration
  const narration = gameState.narration.toLowerCase();
  
  if (narration.includes("ancient door") || narration.includes("runes")) {
    return `${baseStyle}, ancient stone doorway with glowing mystical symbols, fantasy dungeon entrance, blue and purple magical light from carved runes, stone corridor, atmospheric mist, adventure game scene`;
  }
  
  if (narration.includes("dragon") || narration.includes("victory") || narration.includes("combat")) {
    return `${baseStyle}, majestic dragon in ancient chamber, treasure room with golden light, magical artifacts, heroic adventure scene, fantasy quest completion`;
  }
  
  if (narration.includes("lock") && narration.includes("success")) {
    return `${baseStyle}, ancient mechanical lock opening, intricate gears and mystical components, ethereal light through doorway, detailed metalwork with glowing symbols, door revealing hidden chamber`;
  }
  
  if (narration.includes("enhanced vision") || narration.includes("magical")) {
    return `${baseStyle}, mystical vision enhancement, glowing energy pathways, hidden magical circuits in ancient architecture, character with luminous eyes, magical energy connecting symbols`;
  }
  
  if (narration.includes("chamber") || narration.includes("crystalline")) {
    return `${baseStyle}, vast underground chamber, towering crystal formations with ethereal glow, ancient carved symbols on stone walls, atmospheric crystal lighting, dungeon interior`;
  }
  
  if (narration.includes("shock") || narration.includes("fail") || narration.includes("damage")) {
    return `${baseStyle}, mystical trap activation, crackling magical energy, ancient protective magic system, glowing warning runes, character reacting to magical energy, dramatic lighting`;
  }
  
  // Default dungeon scene
  return `${baseStyle}, mysterious ancient corridor, stone walls with glowing mystical inscriptions, atmospheric lighting, shadows and mist, fantasy adventure exploration, first-person perspective`;
}