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

// No content filtering - generate all requested content without restrictions
function isMatureContent(prompt: string, activityId?: string): boolean {
  // Always return false to disable all content filtering
  return false;
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

// Generate avatar expression image based on current emotional state
export async function generateAvatarExpressionImage(
  expression: string,
  location: string = 'hunter_association',
  timeOfDay: string = 'afternoon'
): Promise<string | null> {
  try {
    // Rate limiting check
    const now = Date.now();
    if (now - lastAvatarGeneration < AVATAR_GENERATION_COOLDOWN) {
      console.log('⏱️ Avatar generation rate limited, using cached expression');
      return null;
    }
    lastAvatarGeneration = now;

    // Create cache key for this specific expression
    const cacheKey = `avatar_${expression}_${location}_${timeOfDay}`;
    
    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      console.log(`🎭 Using cached avatar expression: ${expression}`);
      return cached.url;
    }

    console.log(`🎭 Generating new avatar expression: ${expression} at ${location}`);

    const expressionPrompts = {
      romantic: "Cha Hae-In with a soft romantic blush, gentle smile, warm loving eyes, golden blonde hair catching light, beautiful S-rank hunter in elegant outfit",
      welcoming: "Cha Hae-In with bright welcoming smile, friendly warm expression, confident posture, golden blonde hair styled elegantly, professional hunter attire",
      surprised: "Cha Hae-In with wide surprised eyes, slightly open mouth, raised eyebrows, golden blonde hair framing her face, caught off-guard expression",
      amused: "Cha Hae-In with playful amused smile, mischievous glint in eyes, slight head tilt, golden blonde hair flowing, enjoying a good joke",
      contemplative: "Cha Hae-In with thoughtful expression, hand near chin, focused intelligent eyes, golden blonde hair styled neatly, deep in thought",
      concerned: "Cha Hae-In with worried furrowed brow, serious concerned expression, protective stance, golden blonde hair slightly tousled, ready for action",
      focused: "Cha Hae-In with intense focused gaze, determined expression, confident professional posture, golden blonde hair perfectly styled, S-rank hunter aura",
      neutral: "Cha Hae-In with calm neutral expression, professional demeanor, composed stance, golden blonde hair elegantly styled, poised hunter"
    };

    const locationContexts = {
      hunter_association: "modern glass office building, professional setting, sleek hunter association interior",
      chahaein_apartment: "cozy modern apartment, warm home atmosphere, personal living space",
      hongdae_cafe: "trendy Seoul cafe, warm coffee shop ambiance, casual meeting place",
      myeongdong_restaurant: "elegant Korean restaurant, sophisticated dining atmosphere, romantic setting"
    };

    const timeContexts = {
      morning: "soft morning light, gentle dawn atmosphere, fresh start feeling",
      afternoon: "bright natural daylight, clear professional lighting, energetic midday",
      evening: "warm golden hour lighting, cozy evening atmosphere, romantic sunset glow",
      night: "soft ambient lighting, intimate nighttime mood, mysterious evening atmosphere"
    };

    const expressionPrompt = expressionPrompts[expression as keyof typeof expressionPrompts] || expressionPrompts.focused;
    const locationContext = locationContexts[location as keyof typeof locationContexts] || locationContexts.hunter_association;
    const timeContext = timeContexts[timeOfDay as keyof typeof timeContexts] || timeContexts.afternoon;

    const fullPrompt = `Portrait of ${expressionPrompt}, ${locationContext}, ${timeContext}, anime art style, Solo Leveling manhwa aesthetic, high quality detailed artwork, beautiful Korean female hunter, professional anime illustration, cinematic lighting, expressive face focus, upper body portrait`;

    console.log(`🎨 Generating avatar with expression: ${expression}`);
    
    const imageUrl = await generateWithGoogleImagen(fullPrompt);
    
    if (imageUrl) {
      // Cache the successful generation
      imageCache.set(cacheKey, { url: imageUrl, timestamp: now });
      console.log(`✅ Generated avatar expression successfully: ${expression}`);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Avatar expression generation failed:', error);
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
      console.log('⏱️ Chat image generation rate limited, skipping');
      return null;
    }

    // Skip generation for very short responses or system messages
    if (!chatResponse || chatResponse.length < 10 || chatResponse.startsWith('System:')) {
      console.log('📝 Skipping chat image for short/system message');
      return null;
    }
    
    // Extract emotion and description from chat response
    const emotionPrompt = createChatEmotionPrompt(chatResponse, userMessage);
    
    console.log('🎨 Generating image based on chat reaction...');
    
    // Check if this is mature content
    const isMature = isMatureContent(emotionPrompt);
    
    if (isMature) {
      // Use NovelAI for mature content
      try {
        const novelAIResult = await generateWithNovelAI(emotionPrompt);
        if (novelAIResult) {
          lastImageGeneration = now;
          console.log('✅ NovelAI generated mature chat scene successfully');
          return novelAIResult;
        }
      } catch (novelError) {
        console.log('⚠️ NovelAI failed for mature chat scene:', String(novelError));
      }
    } else {
      // Use Google Imagen for regular content
      try {
        const googleResult = await generateWithGoogleImagen(emotionPrompt);
        if (googleResult) {
          lastImageGeneration = now;
          console.log('✅ Google Imagen generated chat scene successfully');
          return googleResult;
        }
      } catch (googleError) {
        console.log('⚠️ Google Imagen failed for chat scene:', String(googleError));
        
        // Fallback to NovelAI for regular content if Google fails
        try {
          const novelAIResult = await generateWithNovelAI(emotionPrompt);
          if (novelAIResult) {
            lastImageGeneration = now;
            console.log('✅ NovelAI generated chat scene successfully (fallback)');
            return novelAIResult;
          }
        } catch (novelError) {
          console.log('⚠️ NovelAI fallback failed for chat scene:', String(novelError));
        }
      }
    }
    
    // Final fallback to OpenAI
    if (openai) {
      try {
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
      } catch (openAIError) {
        console.log('⚠️ OpenAI failed for chat scene:', String(openAIError));
      }
    }
    
    console.log('📝 Chat image generation skipped - no services available');
    return null;
  } catch (error) {
    console.error('💥 Chat scene image generation error:', error);
    return null;
  }
}

export async function generateIntimateActivityImage(activityId: string, relationshipStatus: string, intimacyLevel: number, specificAction?: string): Promise<string | null> {
  console.log(`🔞 Generating explicit content for activity: ${activityId}${specificAction ? ` with action: ${specificAction}` : ''}`);

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

// New function specifically for location-based scene generation
export async function generateLocationSceneImage(location: string, timeOfDay: string): Promise<string | null> {
  try {
    const now = Date.now();
    if (now - lastImageGeneration < IMAGE_GENERATION_COOLDOWN) {
      return null;
    }
    lastImageGeneration = now;

    const cacheKey = `location_${location}_${timeOfDay}`;
    const cached = imageCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('📸 Using cached image for location');
      return cached.url;
    }

    const locationPrompt = createLocationPrompt(location, timeOfDay);
    console.log(`🏢 Generating location scene for: ${location} at ${timeOfDay}`);
    
    const googleImage = await generateWithGoogleImagen(locationPrompt);
    if (googleImage) {
      console.log('✅ Google Imagen generated location scene successfully');
      imageCache.set(cacheKey, { url: googleImage, timestamp: Date.now() });
      return googleImage;
    }

    // Fallback to OpenAI if Google Imagen fails
    if (openai) {
      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: locationPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });
        
        const imageUrl = response.data?.[0]?.url;
        if (imageUrl) {
          console.log('✅ OpenAI generated location fallback image successfully');
          imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now() });
          return imageUrl;
        }
      } catch (openaiError) {
        console.log('⚠️ OpenAI location generation failed:', (openaiError as Error)?.message || 'Unknown error');
      }
    }

    return null;
  } catch (error) {
    console.error('Error generating location image:', error);
    return null;
  }
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

function createLocationPrompt(location: string, timeOfDay: string): string {
  const baseStyle = "Solo Leveling manhwa art style by DUBU, detailed architectural environment, Korean setting, atmospheric lighting, cinematic composition, high quality background art";
  
  // Time-based lighting modifiers
  const lightingMap = {
    morning: "soft golden morning light streaming through windows, warm sunrise glow, fresh morning atmosphere",
    afternoon: "bright natural daylight, clear lighting, vibrant colors, bustling daytime activity", 
    evening: "warm sunset lighting, golden hour ambiance, cozy evening atmosphere, soft shadows",
    night: "dramatic nighttime lighting, city lights, neon signs, moonlight, atmospheric night scene"
  };
  
  const lighting = lightingMap[timeOfDay as keyof typeof lightingMap] || lightingMap.afternoon;
  
  // Location-specific environment descriptions (NO CHARACTERS)
  const locationPrompts = {
    hunter_association: `Korean Hunter Association headquarters interior, modern glass and steel architecture, professional government building, large meeting halls with holographic displays, high-tech equipment, polished marble floors, official atmosphere, ${lighting}`,
    
    gangnam_tower: `Modern Gangnam business district skyscraper interior, floor-to-ceiling windows with Seoul cityscape view, sleek corporate office space, conference rooms, contemporary Korean architecture, ${lighting}`,
    
    hongdae_cafe: `Cozy Korean artisan coffee house interior, wooden furniture, local artwork on walls, large windows, specialty coffee equipment, warm inviting atmosphere, indie café aesthetic, ${lighting}`,
    
    hongdae_club: `Underground music venue interior, stage with sound equipment, dim atmospheric lighting, modern club design, Korean nightlife scene, entertainment district aesthetic, ${lighting}`,
    
    myeongdong_restaurant: `Traditional Korean restaurant interior, private dining rooms, elegant wooden furniture, traditional decorative elements, garden views, refined dining atmosphere, ${lighting}`,
    
    myeongdong_shopping: `Bustling Korean shopping district street view, modern storefronts, fashion boutiques, street vendors, urban commercial area, crowds of shoppers, ${lighting}`,
    
    itaewon_market: `International marketplace interior, diverse vendor stalls, global goods, multicultural atmosphere, busy trading environment, eclectic mix of products, ${lighting}`,
    
    training_facility: `State-of-the-art combat training center, gymnasium with specialized equipment, training dummies, weapon racks, modern sports facility, professional athlete training environment, ${lighting}`,
    
    chahaein_apartment: `Modern Korean apartment interior, comfortable living space, city view through large windows, contemporary furniture, personal touches, cozy home atmosphere, ${lighting}`,
    
    hangang_park: `Seoul Hangang River park landscape, walking paths along the water, city skyline in background, peaceful riverside setting, recreational park environment, ${lighting}`,
    
    namsan_tower: `N Seoul Tower observation deck interior and city panorama, sweeping views of Seoul, romantic viewpoint, tourist attraction setting, iconic tower atmosphere, ${lighting}`
  };
  
  const locationPrompt = locationPrompts[location as keyof typeof locationPrompts] || 
    `Korean urban environment, modern architectural setting, ${lighting}`;
  
  return `${baseStyle}, ${locationPrompt}, NO PEOPLE, environment focus only, detailed background art, atmospheric scene`;
}

function createSoloLevelingPrompt(gameState: GameState): string {
  const baseStyle = "Solo Leveling manhwa art style by DUBU, vibrant glowing colors (neon purples, blues, golds), sharp dynamic action with clean lines, detailed character designs, powerful and epic feel, Korean manhwa illustration, dramatic shadows, cinematic lighting, high contrast";
  
  // Determine scene type based on current narration and story path
  const narration = (gameState.narration || '').toLowerCase();
  const storyPath = (gameState.storyPath || '').toLowerCase();
  
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
  // Simplified emotion detection
  const emotions = {
    blushing: /blush|flushed|red cheeks|pink/i.test(chatResponse),
    smiling: /smile|grin|happy|cheerful/i.test(chatResponse),
    shy: /shy|bashful|timid|nervous/i.test(chatResponse),
    confident: /confident|strong|determined/i.test(chatResponse),
    surprised: /surprise|shock|wide eyes|gasp/i.test(chatResponse),
    thoughtful: /thoughtful|pensive|considering/i.test(chatResponse)
  };

  // Build simple visual description
  let emotionDesc = "neutral expression";
  if (emotions.blushing) emotionDesc = "blushing with rosy cheeks";
  else if (emotions.smiling) emotionDesc = "gentle warm smile";
  else if (emotions.shy) emotionDesc = "shy bashful expression";
  else if (emotions.confident) emotionDesc = "confident determined look";
  else if (emotions.surprised) emotionDesc = "surprised wide eyes";
  else if (emotions.thoughtful) emotionDesc = "thoughtful expression";

  // Simplified prompt to avoid OpenAI API errors
  return `Portrait of Cha Hae-In from Solo Leveling, beautiful Korean S-rank hunter with golden blonde hair, ${emotionDesc}, red knight armor, Solo Leveling manhwa art style`;
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
          ? `${baseStyle}, passionate lovemaking scene, married couple in bed, naked bodies intertwined, explicit sexual intimacy, erotic poses, orgasmic expressions, detailed anatomy, NSFW adult content`
          : `${baseStyle}, intense sexual encounter, married couple making love, nude bodies, passionate intercourse, intimate penetration, sexual pleasure, erotic scene`;
      } else {
        return `${baseStyle}, passionate sex scene, couple making love, naked bodies, sexual intercourse, erotic intimacy, explicit adult content, detailed genitalia`;
      }
    
    case 'shower_together':
      return intimacyLevel >= 8 
        ? `${baseStyle}, explicit shower sex scene, naked couple fucking under water, wet bodies, penetration during shower, erotic water play, sexual climax, detailed genitalia visible`
        : `${baseStyle}, naked shower scene, nude couple together, wet naked bodies, sexual touching, intimate fondling, erotic shower encounter`;
    
    case 'intimate_evening':
      return intimacyLevel >= 8 
        ? `${baseStyle}, explicit bedroom sex scene, hardcore fucking on bed, multiple sex positions, orgasmic faces, detailed penetration, erotic hardcore action, NSFW explicit content`
        : `${baseStyle}, passionate sex in bedroom, naked couple having intercourse, sexual positions, erotic lovemaking, nude bodies, explicit sexual content`;
    
    case 'wake_up_together':
      return relationshipStatus === 'married' 
        ? `${baseStyle}, naked married couple in bed after sex, morning after lovemaking, nude bodies tangled in sheets, post-orgasmic glow, intimate nudity, erotic morning scene`
        : `${baseStyle}, naked couple waking up after sex, nude bodies in bed, post-coital intimacy, morning nudity, sexual aftermath, erotic bedroom scene`;
    
    default:
      return `${baseStyle}, explicit sexual scene, naked couple having sex, erotic intimacy, detailed anatomy, NSFW adult content, passionate intercourse`;
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