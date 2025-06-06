import OpenAI from "openai";
import type { GameState } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateSceneImage(gameState: GameState): Promise<string | null> {
  try {
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
  const baseStyle = "Solo Leveling manhwa art style, dark fantasy, dramatic lighting, detailed shadows, Korean webtoon aesthetic, high contrast, cinematic composition";
  
  // Determine scene type based on current narration
  const narration = gameState.narration.toLowerCase();
  
  if (narration.includes("ancient door") || narration.includes("runes")) {
    return `${baseStyle}. Ancient stone door covered in glowing magical runes, mysterious dungeon entrance, eerie blue and purple magical light emanating from carved symbols, stone corridor perspective, atmospheric mist, fantasy RPG dungeon entrance scene`;
  }
  
  if (narration.includes("dragon") || narration.includes("victory") || narration.includes("combat")) {
    return `${baseStyle}. Epic dragon battle aftermath in ancient chamber, defeated dragon guardian retreating, glowing treasure room beyond, magical artifacts scattered, heroic warrior silhouette, dramatic victory scene with golden light`;
  }
  
  if (narration.includes("lock") && narration.includes("success")) {
    return `${baseStyle}. Ancient mechanical lock mechanism opening, intricate gears and magical components, ethereal light streaming through opening door, detailed metalwork and glowing runes, perspective showing door swinging open to reveal chamber beyond`;
  }
  
  if (narration.includes("enhanced vision") || narration.includes("magical")) {
    return `${baseStyle}. Magical vision enhancement scene, glowing spectral pathways visible, hidden magical circuits in ancient architecture, character with glowing eyes seeing secret passages, mystical energy threads connecting magical symbols`;
  }
  
  if (narration.includes("chamber") || narration.includes("crystalline")) {
    return `${baseStyle}. Vast underground magical chamber, towering crystalline formations glowing with otherworldly light, ancient symbols carved into stone walls, atmospheric lighting from magical crystals, dungeon interior perspective`;
  }
  
  if (narration.includes("shock") || narration.includes("fail") || narration.includes("damage")) {
    return `${baseStyle}. Dangerous magical trap activation, electric magical energy crackling, ancient defensive magic system triggering, warning runes glowing red, character recoiling from magical shock, dramatic lighting effects`;
  }
  
  // Default dungeon scene
  return `${baseStyle}. Mysterious ancient dungeon corridor, stone walls with glowing magical inscriptions, atmospheric torchlight, shadows and mist, fantasy RPG dungeon exploration scene, adventurer's perspective`;
}