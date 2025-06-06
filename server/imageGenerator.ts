import OpenAI from "openai";
import type { GameState } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rate limiting for image generation
let lastImageGeneration = 0;
const IMAGE_GENERATION_COOLDOWN = 1000; // 1 second between generations

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
  
  // Check if characters should be included in the scene
  const includeCharacters = narration.includes("maya") || narration.includes("alex") || 
                           narration.includes("companion") || narration.includes("team") ||
                           narration.includes("responds") || narration.includes("says") ||
                           narration.includes("turns to") || narration.includes("speaking") ||
                           narration.includes("beside you") || narration.includes("together");
  
  let characterDescription = "";
  if (includeCharacters) {
    if (narration.includes("maya")) {
      characterDescription = ", Maya (elegant female mage with flowing dark robes and mystical staff, wise expression, magical aura, standing beside the protagonist)";
    }
    if (narration.includes("alex")) {
      characterDescription += ", Alex (confident male warrior with polished armor and sword, protective stance, determined expression)";
    }
    if (includeCharacters && !characterDescription) {
      characterDescription = ", adventuring party with diverse fantasy characters including a wise mage and brave warrior";
    }
  }
  
  if (narration.includes("ancient door") || narration.includes("runes")) {
    return `${baseStyle}, ancient stone doorway with glowing mystical symbols, fantasy dungeon entrance, blue and purple magical light from carved runes, stone corridor, atmospheric mist${characterDescription}, adventure game scene`;
  }
  
  if (narration.includes("dragon") || narration.includes("victory") || narration.includes("combat")) {
    return `${baseStyle}, majestic dragon in ancient chamber, treasure room with golden light, magical artifacts, heroic adventure scene${characterDescription}, fantasy quest completion`;
  }
  
  if (narration.includes("lock") && narration.includes("success")) {
    return `${baseStyle}, ancient mechanical lock opening, intricate gears and mystical components, ethereal light through doorway, detailed metalwork with glowing symbols${characterDescription}, door revealing hidden chamber`;
  }
  
  if (narration.includes("enhanced vision") || narration.includes("magical")) {
    return `${baseStyle}, mystical vision enhancement, glowing energy pathways, hidden magical circuits in ancient architecture${characterDescription}, magical energy connecting symbols`;
  }
  
  if (narration.includes("chamber") || narration.includes("crystalline")) {
    return `${baseStyle}, vast underground chamber, towering crystal formations with ethereal glow, ancient carved symbols on stone walls${characterDescription}, atmospheric crystal lighting, dungeon interior`;
  }
  
  if (narration.includes("shock") || narration.includes("fail") || narration.includes("damage")) {
    return `${baseStyle}, mystical trap activation, crackling magical energy, ancient protective magic system, glowing warning runes${characterDescription}, dramatic lighting`;
  }
  
  if (narration.includes("speak") || narration.includes("conversation") || narration.includes("dialogue")) {
    return `${baseStyle}, characters in conversation in ancient dungeon setting${characterDescription}, fantasy party discussing strategy, atmospheric dungeon lighting`;
  }
  
  // Default dungeon scene
  return `${baseStyle}, mysterious ancient corridor, stone walls with glowing mystical inscriptions, atmospheric lighting, shadows and mist${characterDescription}, fantasy adventure exploration`;
}