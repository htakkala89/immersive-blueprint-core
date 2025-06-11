import OpenAI from "openai";
import type { GameState } from "@shared/schema";
import AdmZip from 'adm-zip';
import { getGoogleAccessToken, getProjectId } from './googleAuth';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Rate limiting for image generation
let lastImageGeneration = 0;
const IMAGE_GENERATION_COOLDOWN = 500; // 0.5 seconds between generations for better responsiveness

// Rate limiting for avatar expression generation
let lastAvatarGeneration = 0;
const AVATAR_GENERATION_COOLDOWN = 2000; // 2 seconds between avatar generations

// Image cache to reduce generation times
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Track mature content images to prevent chat overlay generation
let currentMatureImageActive = false;
let matureImageTimestamp = 0;
const MATURE_IMAGE_PROTECTION_TIME = 30 * 1000; // 30 seconds protection

function createContextualIntimatePrompt(gameState: GameState, activityId?: string): string {
  // Determine location-based settings
  const location = gameState.currentScene;
  let locationSetting = "";
  
  if (location === 'player_apartment' && (gameState.apartmentTier || 1) >= 3) {
    // Penthouse setting
    locationSetting = "Ultra-luxury penthouse master suite with floor-to-ceiling windows, city lights backdrop, marble surfaces, infinity pool view, crystal chandeliers, Italian leather furnishings, premium modern architecture";
  } else if (location === 'player_apartment' && (gameState.apartmentTier || 1) >= 2) {
    // High-rise apartment
    locationSetting = "Luxury high-rise apartment with panoramic city views, modern designer furnishings, sleek contemporary design, premium materials";
  } else if (location === 'player_apartment') {
    // Basic apartment
    locationSetting = "Cozy apartment with warm lighting, comfortable furnishings, intimate atmosphere";
  } else {
    locationSetting = "Private intimate space with romantic ambiance";
  }

  const activitySettings = {
    master_suite_intimacy: `${locationSetting}, master bedroom suite, ultimate luxury setting`,
    infinity_pool_romance: `${locationSetting}, private infinity pool area, water reflections, luxury spa atmosphere`,
    master_rain_shower: `${locationSetting}, premium rain shower with marble walls, steam and luxury spa ambiance`,
    spend_the_night_together: `${locationSetting}, romantic bedroom setting with silk sheets and candlelight`,
    penthouse_morning_together: `${locationSetting}, morning light streaming through floor-to-ceiling windows`,
    shower_together: `${locationSetting}, luxurious bathroom with glass shower, steam rising, soft lighting`,
    cuddle_together: `${locationSetting}, comfortable seating area for intimate cuddling`,
    bedroom_intimacy: `${locationSetting}, romantic bedroom with warm lighting and intimate atmosphere`,
    make_love: `${locationSetting}, ultimate intimate romantic setting`
  };

  const setting = activitySettings[activityId as keyof typeof activitySettings] || 
    `${locationSetting}, Jin-Woo and Cha Hae-In in intimate romantic moment, soft lighting, emotional connection`;
  
  return `masterpiece, best quality, ultra detailed, ${setting}, stunning Korean manhwa art style, Solo Leveling aesthetic, Jin-Woo (handsome Korean male, age 24, short neat black hair, sharp angular features, intense dark eyes, tall athletic build, confident posture, Shadow Monarch aura), Cha Hae-In (beautiful Korean female, age 23, golden blonde hair in elegant bob cut, violet eyes, graceful athletic build, stunning features, S-rank hunter elegance), developing relationship, gentle connection, mutual attraction, romantic tension, intimate atmosphere, soft romantic lighting, detailed anatomy, perfect proportions, high-quality illustration, professional digital art, detailed shading, sophisticated composition, tasteful romantic imagery, elegant artistic style, emotional depth, cinematic quality, premium artwork`;
}

// Function to reset mature image protection when user exits intimate activities
export function resetMatureImageProtection(): void {
  currentMatureImageActive = false;
  matureImageTimestamp = 0;
  console.log('🔓 Mature image protection reset');
}

async function generateWithNovelAI(prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://image.novelai.net/ai/generate-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOVELAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: prompt,
        model: 'nai-diffusion-3',
        action: 'generate',
        parameters: {
          width: 1344,
          height: 768,
          scale: 20,
          sampler: 'k_dpmpp_2s_ancestral',
          steps: 85,
          seed: Math.floor(Math.random() * 1000000),
          n_samples: 1,
          ucPreset: 0,
          qualityToggle: true,
          sm: true,
          sm_dyn: true,
          dynamic_thresholding: true,
          controlnet_strength: 1.0,
          legacy: false,
          cfg_rescale: 0.8,
          noise: 0.0,
          strength: 0.9,
          negative_prompt: "low quality, blurry, deformed, bad anatomy, ugly, distorted, pixelated, artifacts, jpeg artifacts, watermark, signature, text, logo, username, monochrome, oversaturated, undersaturated, overexposed, underexposed, bad hands, extra fingers, missing fingers, malformed limbs, mutation, poorly drawn, bad proportions, gross proportions, out of frame, extra limbs, disfigured, poorly drawn hands, poorly drawn face, mutation, deformed, bad art, beginner, amateur, distorted face, black hair on woman, brown hair on woman, purple hair on woman, dark hair on woman, silver hair on woman, white hair on woman, red hair on woman, pink hair on woman, blue hair on woman, green hair on woman, any hair color except blonde on Cha Hae-In"
        }
      })
    });

    if (!response.ok) {
      console.error('NovelAI API error:', response.status, response.statusText);
      return null;
    }

    const buffer = await response.arrayBuffer();
    
    // NovelAI returns a ZIP file containing the image
    const zip = new AdmZip(Buffer.from(buffer));
    const zipEntries = zip.getEntries();
    
    if (zipEntries.length === 0) {
      console.error('NovelAI ZIP file is empty');
      return null;
    }
    
    // Get the first image file from the ZIP
    const imageEntry = zipEntries[0];
    const imageBuffer = imageEntry.getData();
    const base64Image = imageBuffer.toString('base64');
    
    // Convert to data URL for browser display
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error('Error generating NovelAI image:', error);
    return null;
  }
}

function createIntimatePrompt(activityId: string, relationshipStatus: string, intimacyLevel: number): string {
  // Ultra-high quality mature content prompts for maximum detail and realism
  const qualityPrefix = "masterpiece, best quality, ultra detailed, elegant artistic style, sophisticated composition, tasteful romantic imagery, high-quality illustration, professional digital art, detailed shading, perfect anatomy";
  
  // Character descriptions for consistent quality - ALWAYS BLONDE CHA HAE-IN
  const jinWooDesc = "Jin-Woo (handsome Korean male, age 24, short neat black hair, sharp angular features, intense dark eyes, tall athletic build, confident posture, Shadow Monarch aura)";
  const chaHaeInDesc = "Cha Hae-In (beautiful Korean female, age 23, golden blonde hair in elegant bob cut, violet eyes, graceful athletic build, stunning features, S-rank hunter elegance)";
  
  // Enhanced activity-specific prompts with progressive intimacy
  const enhancedActivities = {
    cuddling: `${qualityPrefix}, ${jinWooDesc}, ${chaHaeInDesc}, tender cuddling on comfortable bed, gentle embrace, emotional intimacy, soft romantic lighting, warm atmosphere, developing relationship, gentle connection, mutual attraction, romantic tension, intimate but appropriate, wholesome romantic moment`,
    
    cuddle_together: `${qualityPrefix}, ${jinWooDesc}, ${chaHaeInDesc}, romantic cuddling session, close intimate embrace, emotional bonding, soft lighting, tender moments, gentle physical contact, romantic atmosphere, growing intimacy, affectionate touching, warm connection`,
    
    shower_together: `${qualityPrefix}, ${jinWooDesc}, ${chaHaeInDesc}, intimate shower scene, steamy bathroom atmosphere, partial nudity, sensual romantic interaction, water droplets, soft romantic lighting, passionate embrace, mature romantic content, artistic nudity, sophisticated intimacy`,
    
    bedroom_intimacy: `${qualityPrefix}, ${jinWooDesc}, ${chaHaeInDesc}, private bedroom intimacy, passionate romantic scene, explicit intimate interaction, detailed anatomy, mature romantic content, sensual positioning, passionate embrace, deep emotional connection, explicit but tasteful, sophisticated adult content`,
    
    make_love: `${qualityPrefix}, ${jinWooDesc}, ${chaHaeInDesc}, ultimate intimate lovemaking scene, explicit passionate interaction, detailed intimate anatomy, full romantic nudity, sensual positioning, intense emotional and physical connection, sophisticated adult content, artistic mature imagery, passionate romance`,
    
    kitchen_intimacy: `${qualityPrefix}, ${jinWooDesc}, ${chaHaeInDesc}, passionate kitchen counter scene, spontaneous intimate moment, sensual romantic interaction, domestic intimate setting, passionate embrace against counter, mature romantic content`
  };
  
  const basePrompt = enhancedActivities[activityId as keyof typeof enhancedActivities] || 
    `${qualityPrefix}, ${jinWooDesc}, ${chaHaeInDesc}, intimate romantic scene, passionate interaction, mature romantic content, emotional connection`;
  
  // Enhance based on intimacy level for progressive content
  if (intimacyLevel >= 9) {
    return `${basePrompt}, ultra explicit content, detailed intimate anatomy, multiple intimate positions, maximum passion, sophisticated adult artwork, no content restrictions`;
  } else if (intimacyLevel >= 7) {
    return `${basePrompt}, explicit intimate content, detailed romantic anatomy, passionate positioning, mature adult content, sophisticated intimacy`;
  } else if (intimacyLevel >= 5) {
    return `${basePrompt}, sensual mature content, romantic nudity, intimate touching, passionate embrace, tasteful adult imagery`;
  } else {
    return `${basePrompt}, romantic tension, emotional intimacy, gentle touching, developing passion, tasteful romantic content`;
  }
}

export async function generateIntimateActivityImage(activityId: string, relationshipStatus: string, intimacyLevel: number, specificAction?: string, gameState?: any): Promise<string | null> {
  console.log(`🔞 Generating explicit content for activity: ${activityId}${specificAction ? ` with action: ${specificAction}` : ''}`);

  // Rate limiting
  const now = Date.now();
  if (now - lastImageGeneration < IMAGE_GENERATION_COOLDOWN) {
    return null;
  }
  lastImageGeneration = now;

  let prompt: string;
  
  if (specificAction && gameState) {
    // Create contextual prompt using game state for proper location setting
    prompt = createContextualIntimatePrompt(gameState, activityId);
  } else {
    // Use standard activity-based prompt
    prompt = createIntimatePrompt(activityId, relationshipStatus, intimacyLevel);
  }
  
  // Use NovelAI for all mature content
  console.log('🎨 Generating mature content with NovelAI...');
  try {
    const result = await generateWithNovelAI(prompt);
    if (result) {
      console.log('✅ NovelAI generated mature content successfully');
      return result;
    }
  } catch (error) {
    console.log('⚠️ NovelAI failed for mature content:', String(error));
  }

  // No fallback to Google Imagen for mature content - only NovelAI handles mature content
  console.log('📝 Mature content generation failed - NovelAI unavailable');
  return null;
}