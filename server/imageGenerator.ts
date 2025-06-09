import OpenAI from "openai";
import type { GameState } from "@shared/schema";
import AdmZip from 'adm-zip';
import { getGoogleAccessToken, getProjectId } from './googleAuth';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Rate limiting for image generation
let lastImageGeneration = 0;
const IMAGE_GENERATION_COOLDOWN = 1000; // 1 second between generations

// Image cache to reduce generation times
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Track mature content images to prevent chat overlay generation
let currentMatureImageActive = false;
let matureImageTimestamp = 0;
const MATURE_IMAGE_PROTECTION_TIME = 30 * 1000; // 30 seconds protection

function createContextualIntimatePrompt(gameState: GameState): string {
  const activitySettings = {
    shower_together: "Luxurious bathroom with glass shower, steam rising, soft lighting, Jin-Woo and Cha Hae-In sharing intimate shower moment, romantic atmosphere",
    cuddle_together: "Cozy bedroom with soft lighting, comfortable bed with silky sheets, Jin-Woo and Cha Hae-In cuddling intimately, warm romantic glow",
    bedroom_intimacy: "Romantic bedroom with candles, rose petals scattered on silk sheets, Jin-Woo and Cha Hae-In in intimate embrace, emotional connection",
    make_love: "Private romantic sanctuary, Jin-Woo and Cha Hae-In in ultimate intimate moment, soft candlelight, deep emotional connection, tasteful romantic scene"
  };

  const setting = activitySettings[gameState.currentScene as keyof typeof activitySettings] || 
    "Jin-Woo and Cha Hae-In in intimate romantic moment, soft lighting, emotional connection";
  
  return `${setting}, beautiful anime art style, Solo Leveling aesthetic, tasteful romantic artwork, emotional intimacy focus, Korean manhwa style characters, Jin-Woo with black hair, Cha Hae-In with golden blonde hair, mature romantic content`;
}

// Function to reset mature image protection when user exits intimate activities
export function resetMatureImageProtection(): void {
  currentMatureImageActive = false;
  matureImageTimestamp = 0;
  console.log('🔓 Mature image protection reset');
}

// Content classification for mature scene detection
function isMatureContent(prompt: string, activityId?: string): boolean {
  const promptLower = prompt.toLowerCase();
  
  // Check for explicit intimate activity IDs
  const matureActivityIds = ['strip_poker', 'make_love', 'shower_together', 'intimate_evening'];
  if (activityId && matureActivityIds.includes(activityId)) {
    return true;
  }
  
  // Check for mature content keywords in prompt
  const explicitMatureKeywords = [
    'strip poker', 'naked', 'nude', 'undressing', 'intimate', 'sensual', 'erotic',
    'making love', 'passionate', 'bedroom scene', 'shower together', 'seductive',
    'lingerie', 'revealing', 'sexual', 'romantic embrace', 'kissing passionately',
    'panties', 'underwear', 'bra', 'boobs', 'breasts', 'cleavage', 'butt', 'ass',
    'thong', 'g-string', 'bikini', 'topless', 'bottomless', 'sex', 'fucking',
    'pussy', 'vagina', 'nipples', 'tits', 'aroused', 'wet', 'horny', 'orgasm',
    'masturbating', 'fingering', 'oral', 'blowjob', 'cumming', 'moaning',
    'spread legs', 'bend over', 'show me', 'take off', 'remove clothes',
    'lift skirt', 'open shirt', 'unbutton', 'zipper down', '露出', 'エロ'
  ];

  return explicitMatureKeywords.some(keyword => promptLower.includes(keyword));
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
          width: 1024,
          height: 1024,
          scale: 7,
          sampler: 'k_euler_ancestral',
          steps: 28,
          seed: Math.floor(Math.random() * 1000000),
          n_samples: 1,
          ucPreset: 0,
          qualityToggle: true,
          sm: false,
          sm_dyn: false,
          dynamic_thresholding: false,
          controlnet_strength: 1,
          legacy: false,
          negative_prompt: "blonde hair, light hair, yellow hair, golden hair, bright hair, white hair, silver hair, gray hair, wrong hair color"
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

async function generateWithGoogleImagen(prompt: string): Promise<string | null> {
  try {
    const projectId = getProjectId();
    if (!projectId) {
      console.log('Google Cloud project ID not available');
      return null;
    }

    // Get OAuth access token using service account
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      console.log('Failed to get Google Cloud access token');
      return null;
    }

    const location = 'us-central1';
    const vertexEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`;
    
    console.log('🎨 Attempting Google Imagen generation...');
    
    const response = await fetch(vertexEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt + ". Solo Leveling manhwa art style by DUBU, vibrant glowing colors (neon purples, blues, golds), sharp dynamic action with clean lines, detailed character designs, powerful and epic feel. NEGATIVE PROMPT: purple hair on Cha Hae-In, black hair on Cha Hae-In, brown hair on Cha Hae-In, dark hair on Cha Hae-In, blonde hair on Jin-Woo, light hair on Jin-Woo, incorrect character appearances, wrong hair colors, character design errors"
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetyFilterLevel: "block_only_high",
          personGeneration: "allow_adult"
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const prediction = data.predictions?.[0];
      const imageData = prediction?.bytesBase64Encoded;
      
      if (imageData) {
        console.log('✅ Google Imagen generated image successfully');
        return `data:image/png;base64,${imageData}`;
      }
    } else {
      const errorText = await response.text();
      console.log('Vertex AI Imagen failed:', response.status, errorText);
      
      // Try alternative Imagen model
      const altEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;
      
      const altResponse = await fetch(altEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt + ". Solo Leveling manhwa art style by DUBU, vibrant glowing colors (neon purples, blues, golds), sharp dynamic action with clean lines, detailed character designs, powerful and epic feel. NEGATIVE PROMPT: Cha Hae-In with purple hair, Cha Hae-In with black hair, Cha Hae-In with brown hair, Jin-Woo with blonde hair, incorrect hair colors"
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_only_high"
          }
        })
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        const altPrediction = altData.predictions?.[0];
        const altImageData = altPrediction?.bytesBase64Encoded;
        
        if (altImageData) {
          console.log('✅ Google Imagen (alternative model) generated image successfully');
          return `data:image/png;base64,${altImageData}`;
        }
      } else {
        const altErrorText = await altResponse.text();
        console.log('Alternative Imagen model also failed:', altResponse.status, altErrorText);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Google Imagen generation error:', error);
    return null;
  }
}

// New function to generate images based on chat descriptions
export async function generateChatSceneImage(chatResponse: string, userMessage: string): Promise<string | null> {
  try {
    // Don't generate chat images over mature content images
    const now = Date.now();
    if (currentMatureImageActive && (now - matureImageTimestamp) < MATURE_IMAGE_PROTECTION_TIME) {
      console.log('🔞 Skipping chat image generation - mature content image protected');
      return null;
    }

    // Rate limiting check
    if (now - lastImageGeneration < IMAGE_GENERATION_COOLDOWN) {
      console.log('Image generation rate limited, skipping');
      return null;
    }
    
    // Extract emotion and description from chat response
    const emotionPrompt = createChatEmotionPrompt(chatResponse, userMessage);
    
    console.log('🎨 Generating image based on chat reaction...');
    
    // Use NovelAI for character emotion scenes
    const novelAIResult = await generateWithNovelAI(emotionPrompt);
    if (novelAIResult) {
      lastImageGeneration = now;
      console.log('✅ NovelAI generated chat scene successfully');
      return novelAIResult;
    }
    
    // Fallback to Google Imagen
    const googleResult = await generateWithGoogleImagen(emotionPrompt);
    if (googleResult) {
      lastImageGeneration = now;
      console.log('✅ Google Imagen generated chat scene successfully');
      return googleResult;
    }
    
    // Final fallback to OpenAI
    if (openai) {
      const openAIResult = await openai.images.generate({
        model: "dall-e-3",
        prompt: emotionPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
      
      if (openAIResult.data?.[0]?.url) {
        lastImageGeneration = now;
        console.log('✅ OpenAI generated chat scene successfully');
        return openAIResult.data[0].url;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating chat scene image:', error);
    return null;
  }
}

export async function generateIntimateActivityImage(activityId: string, relationshipStatus: string, intimacyLevel: number, specificAction?: string): Promise<string | null> {
  console.log(`🔞 Generating mature content for activity: ${activityId}${specificAction ? ` with action: ${specificAction}` : ''}`);

  // Rate limiting
  const now = Date.now();
  if (now - lastImageGeneration < IMAGE_GENERATION_COOLDOWN) {
    return null;
  }
  lastImageGeneration = now;

  let prompt: string;
  
  if (specificAction) {
    // Create custom prompt based on specific user action
    prompt = createCustomIntimatePrompt(specificAction, relationshipStatus, intimacyLevel);
  } else {
    // Use standard activity-based prompt
    prompt = createIntimatePrompt(activityId, relationshipStatus, intimacyLevel);
  }
  
  // Use NovelAI for mature content
  if (isMatureContent(prompt, activityId)) {
    console.log('🎨 Using NovelAI for mature content...');
    const result = await generateWithNovelAI(prompt);
    if (result) {
      console.log('✅ NovelAI generated mature image successfully');
      return result;
    }
  }

  // Fallback to Google Imagen for non-explicit content
  console.log('🎯 Using Google Imagen fallback for intimate content');
  return await generateWithGoogleImagen(prompt);
}

export async function generateSceneImage(gameState: GameState): Promise<string | null> {
  try {
    // Create cache key based on scene and game state
    const cacheKey = `${gameState.currentScene}_${gameState.level}_${gameState.narration?.slice(0, 50) || 'default'}`;
    
    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📸 Using cached image for scene');
      return cached.url;
    }
    
    // Check rate limit
    const now = Date.now();
    if (now - lastImageGeneration < IMAGE_GENERATION_COOLDOWN) {
      console.log('Image generation rate limited, skipping');
      return null;
    }
    
    lastImageGeneration = now;
    
    // Context-aware prompt generation for intimate activities
    const intimateActivities = ['shower_together', 'cuddle_together', 'bedroom_intimacy', 'make_love'];
    const isIntimateActivity = intimateActivities.includes(gameState.currentScene);
    
    // Use the actual scene prompt if available, otherwise use narration
    const scenePrompt = gameState.narration || '';
    const useMatureGenerator = isMatureContent(scenePrompt) || isIntimateActivity;
    
    // If the prompt contains café/coffee scene description, use it directly with Google Imagen
    if (scenePrompt.includes('café') || scenePrompt.includes('coffee') || scenePrompt.includes('sitting across from each other')) {
      console.log('🎯 Detected café scene - using direct prompt with Google Imagen');
      const googleImage = await generateWithGoogleImagen(scenePrompt);
      if (googleImage) {
        console.log('✅ Google Imagen generated café scene successfully');
        imageCache.set(cacheKey, { url: googleImage, timestamp: Date.now() });
        return googleImage;
      }
    }
    
    if (useMatureGenerator && process.env.NOVELAI_API_KEY) {
      console.log(`🔥 Mature content detected in scene "${gameState.storyPath}" - using NovelAI`);
      const maturePrompt = isIntimateActivity ? createContextualIntimatePrompt(gameState) : createMatureSoloLevelingPrompt(gameState);
      const novelaiImage = await generateWithNovelAI(maturePrompt);
      if (novelaiImage) {
        // Mark mature image as active to prevent chat overlays
        currentMatureImageActive = true;
        matureImageTimestamp = Date.now();
        console.log('✅ NovelAI generated mature content successfully');
        return novelaiImage;
      }
      console.log('⚠️ NovelAI failed, trying Google Imagen fallback');
    }
    
    // Use Google Imagen for characters and general scenes (better anime style)
    const generalPrompt = createSoloLevelingPrompt(gameState);
    console.log('🎯 Attempting Google Imagen for Solo Leveling content');
    const googleImage = await generateWithGoogleImagen(generalPrompt);
    if (googleImage) {
      console.log('✅ Google Imagen generated image successfully');
      // Cache the successfully generated image
      imageCache.set(cacheKey, { url: googleImage, timestamp: Date.now() });
      return googleImage;
    }
    console.log('⚠️ Google Imagen failed, trying OpenAI fallback');
    
    // Fallback to OpenAI if available
    if (openai) {
      try {
        // Enhance prompt for accurate character generation
        const fallbackPrompt = useMatureGenerator ? 
          (isIntimateActivity ? createContextualIntimatePrompt(gameState) : createMatureSoloLevelingPrompt(gameState)) : 
          generalPrompt;
        const enhancedPrompt = (fallbackPrompt.includes('Jin-Woo') || fallbackPrompt.includes('Sung')) ? 
          `${fallbackPrompt}. Korean male protagonist with short BLACK hair, dark eyes, NOT blonde, accurate Solo Leveling character design` : 
          fallbackPrompt;
          
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });
        
        const imageUrl = response.data?.[0]?.url;
        if (imageUrl) {
          // Track mature content images to prevent chat overlays
          if (useMatureGenerator) {
            currentMatureImageActive = true;
            matureImageTimestamp = Date.now();
          }
          console.log('✅ OpenAI generated fallback image successfully');
          return imageUrl;
        }
      } catch (openaiError) {
        console.log('⚠️ OpenAI generation failed:', (openaiError as Error)?.message || 'Unknown error');
      }
    }

    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

function createSoloLevelingPrompt(gameState: GameState): string {
  const baseStyle = "Solo Leveling manhwa art style by DUBU, vibrant glowing colors (neon purples, blues, golds), sharp dynamic action with clean lines, detailed character designs, powerful and epic feel, Korean manhwa illustration, dramatic shadows, cinematic lighting, high contrast";
  
  // Determine scene type based on current narration and story path
  const narration = gameState.narration.toLowerCase();
  const storyPath = gameState.storyPath?.toLowerCase() || '';
  
  // Detect who is speaking in the current scene
  const chaHaeInSpeaking = narration.includes("cha hae-in says") || narration.includes("cha responds") || 
                          narration.includes("she says") || narration.includes("cha hae-in speaks") ||
                          narration.includes("cha hae-in:") || narration.includes("her voice") ||
                          narration.includes("she responds") || narration.includes("she asks") ||
                          narration.includes("cha smiles") || narration.includes("she smiles");
  
  // Solo Leveling specific character designs with strict appearance rules
  const includeJinWoo = narration.includes("jin-woo") || narration.includes("sung") || narration.includes("shadow monarch") || narration.includes("you are") || storyPath.includes("jin") || narration.includes("both characters") || narration.includes("together");
  const includeHaeIn = narration.includes("hae-in") || narration.includes("cha") || narration.includes("sword saint") || storyPath.includes("cha") || narration.includes("both characters") || narration.includes("together") || chaHaeInSpeaking;
  
  // Prioritize couple scenes in romantic contexts
  const isRomanticScene = narration.includes("together") || narration.includes("both") || narration.includes("hae-in") || 
                         storyPath.includes("romantic") || storyPath.includes("caring") || storyPath.includes("meeting") ||
                         narration.includes("smile") || narration.includes("talk") || narration.includes("conversation") ||
                         narration.includes("moment") || narration.includes("feeling");
  
  // STRICT CHARACTER APPEARANCE RULES - DO NOT DEVIATE
  let characterDescription = "";
  
  // PRIORITIZE CHA HAE-IN in conversation scenes - reduce Jin-Woo focus
  if (chaHaeInSpeaking || narration.includes("conversation") || narration.includes("talking") || narration.includes("speaking")) {
    characterDescription = ", close-up focus on Cha Hae-In (MANDATORY: Korean female, age 23, GOLDEN BLONDE HAIR ALWAYS - ABSOLUTELY NO purple/black/brown/any other hair color, beautiful feminine features, bright eyes, athletic but graceful build, wearing red knight armor OR elegant casual clothing, sword at side, confident but gentle expression, Solo Leveling manhwa art style). CRITICAL: Her hair MUST be bright golden blonde, never dark, never purple, ALWAYS BLONDE. Focus on her facial expressions and emotions";
  }
  // Only show both together in specific romantic moments
  else if (narration.includes("both look") || narration.includes("together they") || narration.includes("side by side")) {
    characterDescription = ", Sung Jin-Woo and Cha Hae-In together (Jin-Woo: Korean male, age 24, SHORT BLACK HAIR ONLY - never blonde or purple, sharp features, dark eyes, black hunter outfit; Cha Hae-In: Korean female, age 23, GOLDEN BLONDE HAIR MANDATORY - NEVER purple/black/brown/dark hair, beautiful features, red armor or elegant clothing), romantic interaction, standing close together, meaningful eye contact, gentle expressions, couple scene. ABSOLUTE REQUIREMENT: Cha Hae-In has bright golden blonde hair, NOT any other color";
  } 
  // Default to Cha Hae-In for most conversation scenes
  else if (includeHaeIn || isRomanticScene) {
    characterDescription = ", focus on Cha Hae-In (MANDATORY: Korean female, age 23, GOLDEN BLONDE HAIR ALWAYS - ABSOLUTELY NO purple/black/brown/any other hair color, beautiful feminine features, bright eyes, athletic but graceful build, wearing red knight armor OR elegant casual clothing, sword at side, confident but gentle expression, Solo Leveling manhwa art style). CRITICAL: Her hair MUST be bright golden blonde, never dark, never purple, ALWAYS BLONDE";
  } 
  else if (includeJinWoo && !includeHaeIn) {
    characterDescription = ", Sung Jin-Woo (MUST BE: Korean male, age 24, SHORT BLACK HAIR ONLY - NOT blonde/long/purple, sharp angular facial features, dark eyes, athletic build, wearing black hunter outfit or casual dark clothing, confident posture, Solo Leveling manhwa art style - NEVER make him blonde or feminine)";
  }

  // Prioritize environmental and location-based scenes over character portraits
  
  // Daily Life Hub - apartment/city scenes
  if (storyPath.includes("daily_life") || narration.includes("apartment") || narration.includes("daily life")) {
    return `${baseStyle}, modern Korean apartment interior with city skyline view through large windows, cozy living space with contemporary furniture, evening lighting, urban hunter lifestyle setting, detailed architecture and interior design, manhwa environment art`;
  }
  
  // Hunter Association/Guild scenes
  if (narration.includes("association") || narration.includes("guild") || narration.includes("hunter facility")) {
    return `${baseStyle}, Korean Hunter Association headquarters interior, modern glass and steel architecture, professional meeting halls with holographic displays, high-tech hunter equipment, official government building atmosphere, detailed architectural environment`;
  }
  
  // Marketplace scenes
  if (storyPath.includes("marketplace") || narration.includes("marketplace") || narration.includes("shopping")) {
    return `${baseStyle}, bustling Korean hunter marketplace street scene, magical item vendors, weapon shops, gift stores, crowded shopping district with hunters browsing wares, detailed urban environment with Korean signage and architecture`;
  }
  
  // Gate and dungeon scenes
  if (narration.includes("gate") || narration.includes("dungeon") || narration.includes("portal")) {
    return `${baseStyle}, mysterious dungeon gate portal with purple energy, Solo Leveling gate entrance, dimensional rift with swirling dark energy, ominous atmosphere${characterDescription}, hunter preparing to enter`;
  }
  
  if (narration.includes("shadow") || narration.includes("army") || narration.includes("soldiers")) {
    return `${baseStyle}, shadow soldiers emerging from darkness, purple shadowy figures with glowing eyes, Solo Leveling shadow army, dark magic summoning${characterDescription}, monarch's power`;
  }
  
  if (narration.includes("boss") || narration.includes("monster") || narration.includes("combat") || narration.includes("battle") || narration.includes("enemy") || narration.includes("attack")) {
    return `${baseStyle}, terrifying dungeon monsters in battle - massive orcs with glowing red eyes and sharp fangs, giant goblins wielding crude weapons, magical beasts breathing fire, stone golems with glowing cores, menacing creatures in dark dungeon setting with dramatic lighting, Solo Leveling monster design, fierce and intimidating enemies`;
  }
  
  if (narration.includes("level up") || narration.includes("system") || narration.includes("status")) {
    return `${baseStyle}, blue system window interface floating in air, RPG status screen, glowing stats display, Solo Leveling system notifications${characterDescription}, game-like UI elements`;
  }
  
  if (narration.includes("hunter") || narration.includes("association") || narration.includes("guild")) {
    return `${baseStyle}, Korean Hunter Association building interior, modern hunter facility, professional meeting room, S-rank hunters gathered${characterDescription}, official hunter setting`;
  }
  
  if (narration.includes("café") || narration.includes("coffee") || narration.includes("table") || narration.includes("sitting")) {
    return `${baseStyle}, wide establishing shot of cozy Korean café interior showing full scene, Sung Jin-Woo (Korean male, SHORT BLACK HAIR ONLY - never blonde or purple, dark hunter outfit) and Cha Hae-In (Korean female, BRIGHT GOLDEN BLONDE HAIR ONLY - never purple or black or brown hair, elegant hunter attire) sitting across from each other at wooden table, coffee cups and steam visible, warm ambient lighting from windows, intimate conversation scene, both characters clearly visible in frame, detailed café environment with wooden furniture and soft lighting, manhwa romance composition. IMPORTANT: Cha Hae-In MUST have blonde hair, NOT purple hair`;
  }
  
  if (narration.includes("holding hands") || narration.includes("hand finds") || narration.includes("fingers intertwine")) {
    return `${baseStyle}, medium shot focused on café table showing Sung Jin-Woo and Cha Hae-In holding hands across wooden surface, coffee cups nearby, both characters partially visible with hands prominently featured, warm intimate lighting, romantic moment, detailed hand positioning, café setting background, manhwa romance style`;
  }
  
  if (narration.includes("date") || narration.includes("together")) {
    return `${baseStyle}, wide shot of cozy Korean café interior, Sung Jin-Woo and Cha Hae-In sitting across from each other at a table, coffee cups between them, warm lighting, intimate conversation, both characters visible in frame, manhwa romance scene composition, detailed café setting with windows and ambient lighting`;
  }
  
  if (narration.includes("romantic") || narration.includes("intimate")) {
    return `${baseStyle}, romantic scene between hunters, soft lighting, emotional moment, beautiful Korean setting${characterDescription}, intimate atmosphere with manhwa romance style`;
  }
  
  if (narration.includes("power") || narration.includes("monarch") || narration.includes("awakening")) {
    return `${baseStyle}, massive power surge, purple energy explosion, shadow monarch transformation, overwhelming magical aura${characterDescription}, ultimate power display`;
  }
  
  // Default dungeon scene
  return `${baseStyle}, mysterious ancient corridor, stone walls with glowing mystical inscriptions, atmospheric lighting, shadows and mist${characterDescription}, fantasy adventure exploration`;
}

function createChatEmotionPrompt(chatResponse: string, userMessage: string): string {
  // Enhanced pattern detection for visual descriptions
  const visualPatterns = [
    /\(([^)]+)\)/g, // Text in parentheses like (cheeks flushed red)
    /\*([^*]+)\*/g, // Text in asterisks like *smiles softly*
    /her (\w+) (\w+)/gi, // "her cheeks flushed", "her eyes sparkled"
    /she (\w+)/gi, // "she smiled", "she blushed"
    /(blush|smile|laugh|giggle|eyes|cheeks|face|expression)/gi,
    // New patterns for physical descriptions
    /(tilts? her head|head tilt|leans? forward|leans? back)/gi,
    /(red armor|armor gleaming|gleaming faintly|armor shining)/gi,
    /(blonde hair|hair catches|hair flowing|golden hair)/gi,
    /(adjusts her|crosses her arms|hands on hips|shifts position)/gi,
    /(genuinely curious|thoughtful expression|questioning look)/gi,
    /(steps closer|moves away|approaches|reaches out)/gi
  ];

  let visualDescriptions = [];
  
  // Extract all visual cues
  visualPatterns.forEach(pattern => {
    const matches = chatResponse.match(pattern);
    if (matches) {
      visualDescriptions.push(...matches);
    }
  });

  // Parse specific emotions and physical actions
  const emotions = {
    blushing: /blush|flushed|red cheeks|pink/i.test(chatResponse),
    smiling: /smile|grin|happy|cheerful/i.test(chatResponse),
    shy: /shy|bashful|timid|nervous/i.test(chatResponse),
    confident: /confident|strong|determined/i.test(chatResponse),
    surprised: /surprise|shock|wide eyes|gasp/i.test(chatResponse),
    thoughtful: /thoughtful|pensive|considering/i.test(chatResponse)
  };

  // Parse physical descriptions and equipment details
  const physicalDescriptions = {
    headTilt: /tilts? her head|head tilt/i.test(chatResponse),
    armorGleaming: /red armor|armor gleaming|gleaming faintly|armor shining/i.test(chatResponse),
    hairDescription: /blonde hair|hair catches|hair flowing|golden hair/i.test(chatResponse),
    bodyLanguage: /adjusts her|crosses her arms|hands on hips|shifts position/i.test(chatResponse),
    curious: /genuinely curious|thoughtful expression|questioning look/i.test(chatResponse),
    movement: /steps closer|moves away|approaches|reaches out/i.test(chatResponse)
  };

  // Detect specific detailed expressions for immersive visuals
  const specificExpressions = {
    lipBite: /bites her lip|biting her lip|lip bite|nervously bites/i.test(chatResponse),
    smallSmile: /small smile|gentle smile|shy smile|soft smile/i.test(chatResponse),
    touchesLips: /touches her lips|runs her finger|traces her lip/i.test(chatResponse),
    looksAway: /looks away shyly|glances away|averts her gaze|looks down bashfully/i.test(chatResponse),
    deepBlush: /cheeks flush|face turns red|blushes deeply|rosy cheeks|pink cheeks/i.test(chatResponse)
  };
  
  // Build comprehensive visual description including physical actions
  let visualDesc = "";
  
  // Physical actions and equipment details
  if (physicalDescriptions.headTilt) visualDesc += "tilting her head with a curious expression, slight head tilt showing interest, ";
  if (physicalDescriptions.armorGleaming) visualDesc += "red armor gleaming faintly in the light, metallic sheen catching illumination, ";
  if (physicalDescriptions.hairDescription) visualDesc += "golden blonde hair catching the light beautifully, hair flowing naturally, ";
  if (physicalDescriptions.bodyLanguage) visualDesc += "confident body language and posture, graceful stance, ";
  if (physicalDescriptions.curious) visualDesc += "genuinely curious expression, thoughtful and engaged look, ";
  if (physicalDescriptions.movement) visualDesc += "graceful movement, elegant hunter poise, ";
  
  // Specific facial expressions
  if (specificExpressions.lipBite) visualDesc += "biting her lower lip nervously, intimate close-up of her mouth and lips, detailed facial expression, ";
  if (specificExpressions.smallSmile) visualDesc += "small genuine smile playing on her lips, gentle expression, close-up portrait showing delicate features, ";
  if (specificExpressions.touchesLips) visualDesc += "delicately touching her lips with her finger, intimate gesture, close-up facial shot, ";
  if (specificExpressions.looksAway) visualDesc += "shyly looking away with bashful expression, side profile view, elegant neck and jawline visible, ";
  if (specificExpressions.deepBlush) visualDesc += "deep blush coloring her cheeks, rosy pink complexion, soft romantic lighting, ";
  
  // Fallback to general emotions if no specific descriptions detected
  if (!visualDesc) {
    if (emotions.blushing) visualDesc += "blushing with rosy cheeks, ";
    if (emotions.smiling) visualDesc += "gentle warm smile, ";
    if (emotions.shy) visualDesc += "shy and bashful expression, ";
    if (emotions.confident) visualDesc += "confident determined look, ";
    if (emotions.surprised) visualDesc += "surprised wide eyes, ";
    if (emotions.thoughtful) visualDesc += "thoughtful contemplative expression, ";
  }

  // Detect who is speaking - if Cha Hae-In is responding, focus on her
  const chaHaeInSpeaking = chatResponse.toLowerCase().includes('cha hae-in') ||
                          /\b(i|my|me)\b/i.test(chatResponse) ||
                          /\b(she says|she responds|her voice|she smiles|she speaks)\b/i.test(userMessage);
  
  // Determine if this should be a couple scene or solo portrait
  const isCoupleMoment = userMessage.toLowerCase().includes('both') || 
                        userMessage.toLowerCase().includes('together') ||
                        /\b(we|us|couple)\b/i.test(chatResponse);
  
  // Generate comprehensive visual prompts based on detected descriptions
  if (chaHaeInSpeaking && !isCoupleMoment) {
    // Create highly detailed portraits for specific expressions and physical actions
    if (specificExpressions.lipBite || specificExpressions.touchesLips) {
      return `Ultra close-up intimate portrait of Cha Hae-In from Solo Leveling manhwa by DUBU, ${visualDesc} extreme close-up focusing on her mouth and lips area, beautiful Korean S-rank hunter with GOLDEN BLONDE HAIR MANDATORY - NEVER purple/black/brown hair, detailed lip texture and expression, soft romantic lighting, high detail facial features, cinematic depth of field, Solo Leveling manhwa art style, vibrant glowing colors, intimate immersive composition. ABSOLUTE REQUIREMENT: Cha Hae-In has bright golden blonde hair only`;
    } else if (specificExpressions.smallSmile || specificExpressions.deepBlush) {
      return `Intimate close-up portrait of Cha Hae-In from Solo Leveling manhwa by DUBU, ${visualDesc} detailed facial expression with focus on her smile and blushing cheeks, beautiful Korean S-rank hunter with GOLDEN BLONDE HAIR MANDATORY - NEVER purple/black/brown hair, soft romantic lighting highlighting facial contours, expressive eyes and delicate features, Solo Leveling manhwa art style, vibrant glowing colors, emotional intimate composition. ABSOLUTE REQUIREMENT: Cha Hae-In has bright golden blonde hair only`;
    } else if (physicalDescriptions.headTilt || physicalDescriptions.armorGleaming) {
      return `Portrait of Cha Hae-In from Solo Leveling manhwa by DUBU, ${visualDesc} beautiful Korean S-rank hunter with GOLDEN BLONDE HAIR MANDATORY - NEVER purple/black/brown hair, striking features, wearing red knight armor gleaming in the light, detailed physical expression and posture, elegant hunter stance, soft lighting highlighting her features and equipment, Solo Leveling manhwa art style, vibrant glowing colors, sharp dynamic lines, detailed character design. ABSOLUTE REQUIREMENT: Cha Hae-In has bright golden blonde hair only`;
    } else {
      return `Close-up portrait of Cha Hae-In from Solo Leveling manhwa by DUBU, ${visualDesc} beautiful Korean S-rank hunter with GOLDEN BLONDE HAIR MANDATORY - NEVER purple/black/brown hair, striking features, wearing red knight armor or elegant hunter clothing, detailed facial expression showing genuine emotion, soft lighting highlighting her features, speaking or responding, expressive face, Solo Leveling manhwa art style, vibrant glowing colors, sharp dynamic lines, detailed character design. ABSOLUTE REQUIREMENT: Cha Hae-In has bright golden blonde hair only`;
    }
  } else if (isCoupleMoment) {
    return `Romantic scene between Sung Jin-Woo and Cha Hae-In from Solo Leveling manhwa by DUBU, ${visualDesc} Jin-Woo (Korean male, short black hair, dark eyes, black hunter outfit) and Cha Hae-In (Korean female, GOLDEN BLONDE HAIR MANDATORY - NEVER purple/black/brown hair, red armor or elegant clothing) having intimate conversation, meaningful eye contact, standing close together, romantic tension, beautiful background setting, detailed facial expressions, Solo Leveling manhwa art style, vibrant glowing colors, couple interaction scene. ABSOLUTE REQUIREMENT: Cha Hae-In has bright golden blonde hair only`;
  } else {
    return `Portrait of Cha Hae-In from Solo Leveling manhwa by DUBU, ${visualDesc} beautiful Korean S-rank hunter with GOLDEN BLONDE HAIR MANDATORY - NEVER purple/black/brown hair, striking features, wearing red knight armor or elegant hunter clothing, detailed facial expression showing genuine emotion, soft lighting on face highlighting her features, Solo Leveling manhwa art style, vibrant glowing colors, sharp dynamic lines, detailed character design. ABSOLUTE REQUIREMENT: Cha Hae-In has bright golden blonde hair only`;
  }
}

function createCustomIntimatePrompt(specificAction: string, relationshipStatus: string, intimacyLevel: number): string {
  const actionLower = specificAction.toLowerCase();
  
  // Extract exact requested content for precise generation
  let basePrompt = `Cha Hae-In from Solo Leveling, beautiful Korean female S-rank hunter with GOLDEN BLONDE HAIR MANDATORY - NEVER purple/black/brown hair, athletic build, `;
  
  // Direct mapping for specific user requests - produce exactly what they ask for
  if (actionLower.includes('panties') || actionLower.includes('underwear')) {
    basePrompt += 'showing her panties, delicate underwear visible, intimate pose, ';
  }
  if (actionLower.includes('bra') || actionLower.includes('boobs') || actionLower.includes('breasts')) {
    basePrompt += 'revealing her bra, beautiful breasts exposed, topless or partial undress, ';
  }
  if (actionLower.includes('butt') || actionLower.includes('ass')) {
    basePrompt += 'showing her attractive butt, curved figure, rear view or side angle, ';
  }
  if (actionLower.includes('thong') || actionLower.includes('g-string')) {
    basePrompt += 'wearing a thong, minimal coverage, intimate underwear, ';
  }
  if (actionLower.includes('bikini')) {
    basePrompt += 'in a bikini, swimwear revealing her figure, beach or pool setting, ';
  }
  if (actionLower.includes('topless') || actionLower.includes('naked') || actionLower.includes('nude')) {
    basePrompt += 'topless, bare chest exposed, no shirt or bra, nude upper body, ';
  }
  if (actionLower.includes('bottomless')) {
    basePrompt += 'bottomless, lower body exposed, no pants or underwear, ';
  }
  if (actionLower.includes('spread legs') || actionLower.includes('open legs')) {
    basePrompt += 'with legs spread open, intimate pose, provocative position, ';
  }
  if (actionLower.includes('bend over') || actionLower.includes('bending')) {
    basePrompt += 'bending over seductively, provocative position, rear view, ';
  }
  if (actionLower.includes('lift skirt') || actionLower.includes('skirt up')) {
    basePrompt += 'lifting her skirt up, revealing underneath, panties visible, ';
  }
  if (actionLower.includes('sex') || actionLower.includes('fucking')) {
    basePrompt += 'in sexual position, intimate coupling, erotic scene, ';
  }
  if (actionLower.includes('masturbat') || actionLower.includes('touch herself')) {
    basePrompt += 'touching herself intimately, self-pleasure, solo erotic scene, ';
  }
  
  // Affection-based willingness and expression
  if (intimacyLevel >= 4) {
    basePrompt += 'eager and willing, enjoying the attention, seductive smile, confident expression, ';
  } else if (intimacyLevel >= 3) {
    basePrompt += 'blushing but compliant, trusting expression, shy but willing, ';
  } else {
    basePrompt += 'hesitant but curious, shy demeanor, uncertain but intrigued, ';
  }
  
  basePrompt += 'anime art style, high quality, detailed, intimate lighting, Solo Leveling character design, erotic illustration, NSFW content';
  
  return basePrompt;
}

function createIntimatePrompt(activityId: string, relationshipStatus: string, intimacyLevel: number): string {
  const baseStyle = "anime style, detailed, beautiful, romantic lighting, intimate atmosphere, Cha Hae-In and Jin-Woo from Solo Leveling";
  
  switch (activityId) {
    case 'strip_poker':
      return intimacyLevel >= 8 
        ? `${baseStyle}, playing strip poker in cozy bedroom, romantic tension, sultry expressions, revealing clothing, playful atmosphere, cards scattered`
        : `${baseStyle}, playing poker at home, flirtatious glances, romantic tension, warm lighting, casual clothing`;
    
    case 'make_love':
      if (relationshipStatus === 'married') {
        return intimacyLevel >= 9 
          ? `${baseStyle}, passionate intimate embrace, married couple in bedroom, romantic atmosphere, beautiful lighting, sensual poses, loving expressions`
          : `${baseStyle}, tender romantic moment, married couple embracing, soft lighting, intimate but tasteful, loving connection`;
      } else {
        return `${baseStyle}, romantic intimate moment, couple embracing tenderly, warm lighting, emotional connection, beautiful scene`;
      }
    
    case 'shower_together':
      return intimacyLevel >= 8 
        ? `${baseStyle}, romantic shower scene, steam and water, intimate atmosphere, couple together, sensual but artistic, beautiful lighting`
        : `${baseStyle}, romantic bathroom scene, couple together, steam effects, intimate but tasteful, warm lighting`;
    
    case 'intimate_evening':
      return intimacyLevel >= 8 
        ? `${baseStyle}, romantic bedroom scene, couple on bed, intimate atmosphere, beautiful lighting, passionate expressions, sensual poses`
        : `${baseStyle}, romantic evening at home, couple cuddling, soft lighting, intimate but tasteful, loving atmosphere`;
    
    case 'wake_up_together':
      return relationshipStatus === 'married' 
        ? `${baseStyle}, married couple waking up together, bedroom scene, morning light, intimate but tasteful, loving expressions, beautiful composition`
        : `${baseStyle}, couple waking up together, cozy bedroom, morning atmosphere, romantic but tasteful, warm lighting`;
    
    default:
      return `${baseStyle}, romantic scene, beautiful couple, intimate atmosphere, tasteful composition, emotional connection`;
  }
}



function createMatureSoloLevelingPrompt(gameState: GameState): string {
  const baseStyle = "Solo Leveling manhwa art style by DUBU, vibrant glowing colors (neon purples, blues, golds), sharp dynamic action with clean lines, detailed character designs, powerful and epic feel, Korean manhwa illustration, dramatic shadows, cinematic lighting, high contrast";
  const narration = gameState.narration.toLowerCase();
  
  // Accurate Solo Leveling character descriptions
  const jinWooDesc = "Sung Jin-Woo (tall Korean male, short spiky BLACK hair, sharp angular facial features, intense dark eyes, black hunter coat with silver details, confident powerful stance, shadow aura, Shadow Monarch design from Solo Leveling manhwa)";
  const chaHaeInDesc = "Cha Hae-In (beautiful Korean female S-rank hunter, blonde hair in elegant style, red armor with golden accents, graceful sword stance, determined expression, Sword Saint from Solo Leveling manhwa)";
  
  // Romantic and intimate scene generation
  if (narration.includes("kiss") || narration.includes("embrace")) {
    return `${baseStyle}, ${jinWooDesc} and ${chaHaeInDesc} in romantic embrace, passionate kiss, intimate moment, soft lighting, romantic atmosphere, detailed facial expressions, emotional connection, fantasy setting background, tender scene`;
  }
  
  if (narration.includes("romantic") || narration.includes("love") || narration.includes("confession")) {
    return `${baseStyle}, ${jinWooDesc} and ${chaHaeInDesc} romantic scene, love confession moment, emotional intimacy, beautiful lighting, romantic atmosphere, detailed character interaction, fantasy romance, tender expressions`;
  }
  
  if (narration.includes("intimate") || narration.includes("close") || narration.includes("tender")) {
    return `${baseStyle}, ${jinWooDesc} and ${chaHaeInDesc} intimate moment, close together, tender interaction, soft romantic lighting, emotional scene, detailed artwork, fantasy romance setting`;
  }
  
  if (narration.includes("beautiful") || narration.includes("stunning") || narration.includes("gorgeous")) {
    return `${baseStyle}, ${chaHaeInDesc} beauty focus, elegant pose, detailed character design, beautiful lighting, graceful appearance, fantasy hunter outfit, sword saint aesthetic, romantic scene`;
  }
  
  if (narration.includes("passion") || narration.includes("desire") || narration.includes("attraction")) {
    return `${baseStyle}, ${jinWooDesc} and ${chaHaeInDesc} passionate scene, intense emotional connection, romantic tension, dramatic lighting, detailed character interaction, fantasy romance`;
  }
  
  if (narration.includes("touch") || narration.includes("caress") || narration.includes("gentle")) {
    return `${baseStyle}, ${jinWooDesc} and ${chaHaeInDesc} gentle touching, tender caress, intimate physical contact, soft lighting, romantic scene, detailed hand placement, emotional connection`;
  }
  
  // Date and romantic outing scenes
  if (narration.includes("date") || narration.includes("dinner") || narration.includes("restaurant")) {
    return `${baseStyle}, ${jinWooDesc} and ${chaHaeInDesc} on romantic date, elegant restaurant setting, intimate dinner scene, romantic atmosphere, soft lighting, detailed character interaction`;
  }
  
  if (narration.includes("beach") || narration.includes("sunset")) {
    return `${baseStyle}, ${jinWooDesc} and ${chaHaeInDesc} romantic beach scene, sunset background, intimate moment by ocean, romantic atmosphere, beautiful lighting, detailed scenery`;
  }
  
  if (narration.includes("rooftop") || narration.includes("stars")) {
    return `${baseStyle}, ${jinWooDesc} and ${chaHaeInDesc} rooftop romantic scene, starry night sky, intimate setting, city lights background, romantic atmosphere, detailed urban fantasy`;
  }
  
  // Default romantic scene
  return `${baseStyle}, ${jinWooDesc} and ${chaHaeInDesc} romantic scene, intimate moment, beautiful lighting, detailed character interaction, fantasy romance setting, emotional connection`;
}