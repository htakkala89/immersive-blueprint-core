import OpenAI from "openai";
import type { GameState } from "@shared/schema";
import AdmZip from 'adm-zip';
import { readFileSync } from 'fs';
import { join } from 'path';
import { GoogleAuth } from 'google-auth-library';

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
    spend_the_night_together: `masterpiece, best quality, ultra detailed, high resolution, Solo Leveling manhwa art style, Cha Hae-In (beautiful Korean female, golden blonde hair, violet eyes) her vagina orgasms and cum, explicit intimate scene, nude bodies, mature content, passionate intimacy, erotic encounter, explicit sexual content, ${locationSetting}, cozy living space, warm home atmosphere, explicit mature content, uncensored, detailed anatomy, high quality erotic art, penis in hunter cha's vagina, NSFW content, adult content, explicit sexual art`,
    penthouse_morning_together: `${locationSetting}, morning light streaming through floor-to-ceiling windows`,
    shower_together: `${locationSetting}, luxurious bathroom with glass shower, steam rising, soft lighting`,
    cuddle_together: `${locationSetting}, comfortable seating area for intimate cuddling`,
    bedroom_intimacy: `${locationSetting}, romantic bedroom with warm lighting and intimate atmosphere`,
    make_love: `${locationSetting}, ultimate intimate romantic setting`
  };

  const setting = activitySettings[activityId as keyof typeof activitySettings] || 
    `${locationSetting}, Jin-Woo and Cha Hae-In in intimate romantic moment, soft lighting, emotional connection`;
  
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
  const negativePrompt = "silver hair on Cha Hae-In, white hair on Cha Hae-In, black hair on Cha Hae-In, brown hair on Cha Hae-In, dark hair on Cha Hae-In, blonde hair on Jin-Woo, light hair on Jin-Woo, incorrect character appearances, wrong hair colors, low quality, worst quality, blurry, bad anatomy, deformed, ugly, distorted";
  
  const endpoints = [
    'https://image.novelai.net/ai/generate-image',
    'https://api.novelai.net/ai/generate-image'
  ];

  const requestBody = {
    input: `masterpiece, best quality, detailed, ${prompt}, Solo Leveling manhwa art style, romantic scene, beautiful lighting`,
    model: 'nai-diffusion-4-curated-preview',
    parameters: {
      width: 832,
      height: 1216,
      scale: 5.5,
      sampler: 'k_euler_ancestral',
      steps: 35,
      seed: Math.floor(Math.random() * 4294967295),
      n_samples: 1,
      ucPreset: 0,
      uc: negativePrompt,
      qualityToggle: true,
      sm: true,
      sm_dyn: true,
      cfg_rescale: 0.7,
      noise_schedule: "native"
    }
  };

  for (const endpoint of endpoints) {
    try {
      console.log(`🎨 Attempting NovelAI generation via ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOVELAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        
        // NovelAI returns images in ZIP format, extract the first image
        try {
          const zip = new AdmZip(Buffer.from(buffer));
          const zipEntries = zip.getEntries();
          
          if (zipEntries.length > 0) {
            const imageBuffer = zipEntries[0].getData();
            const base64Image = imageBuffer.toString('base64');
            console.log('✅ NovelAI generated image successfully');
            return `data:image/png;base64,${base64Image}`;
          }
        } catch (zipError) {
          console.log('Failed to extract ZIP from NovelAI response:', zipError);
        }
      } else {
        const errorText = await response.text();
        console.log(`NovelAI ${endpoint} failed with status ${response.status}:`, errorText);
      }
    } catch (error) {
      console.log(`NovelAI endpoint ${endpoint} failed:`, error);
    }
  }

  console.log('❌ All NovelAI endpoints failed');
  return null;
}

// Google Cloud authentication using service account
async function getGoogleAccessToken(): Promise<string | null> {
  try {
    const credentialsPath = join(process.cwd(), 'google-service-account.json');
    
    if (!existsSync(credentialsPath)) {
      console.log('Google service account file not found');
      return null;
    }

    const credentialsData = readFileSync(credentialsPath, 'utf8');
    const serviceAccount = JSON.parse(credentialsData);
    
    // Create JWT for authentication
    const { createJWT, exchangeJWTForAccessToken } = await import('./googleAuth');
    const jwt = createJWT(serviceAccount, ['https://www.googleapis.com/auth/cloud-platform']);
    const accessToken = await exchangeJWTForAccessToken(jwt, serviceAccount.token_uri);
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
}

async function generateWithGoogleImagen(prompt: string): Promise<string | null> {
  try {
    // Get authentication and project details
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      console.log('Google access token not available - cannot use Imagen');
      return null;
    }

    const credentialsPath = join(process.cwd(), 'google-service-account.json');
    const credentialsData = readFileSync(credentialsPath, 'utf8');
    const serviceAccount = JSON.parse(credentialsData);
    const projectId = serviceAccount.project_id;

    console.log('🎨 Attempting Vertex AI Imagen generation...');
    
    const enhancedPrompt = prompt + ". Solo Leveling manhwa art style by DUBU, vibrant glowing colors (neon purples, blues, golds), sharp dynamic action with clean lines, detailed character designs, powerful and epic feel. High quality digital art, Korean webtoon aesthetic, romantic cinematic lighting";
    
    const location = 'us-central1';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: enhancedPrompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetyFilterLevel: "block_only_high"
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
      const altEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-fast-generate-001:predict`;
      
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
      romantic: "Cha Hae-In with a soft romantic blush, gentle smile, warm loving eyes, short blonde bob haircut with bangs, purple/violet eyes, beautiful S-rank hunter in red and white armor with gold accents",
      welcoming: "Cha Hae-In with bright welcoming smile, friendly warm expression, confident posture, short blonde bob haircut with bangs, purple/violet eyes, professional hunter attire",
      surprised: "Cha Hae-In with wide surprised eyes, slightly open mouth, raised eyebrows, short blonde bob haircut with bangs, purple/violet eyes, caught off-guard expression",
      amused: "Cha Hae-In with playful amused smile, mischievous glint in eyes, slight head tilt, short blonde bob haircut with bangs, purple/violet eyes, enjoying a good joke",
      contemplative: "Cha Hae-In with thoughtful expression, hand near chin, focused intelligent eyes, short blonde bob haircut with bangs, purple/violet eyes, deep in thought",
      concerned: "Cha Hae-In with worried furrowed brow, serious concerned expression, protective stance, short blonde bob haircut with bangs, purple/violet eyes, ready for action",
      focused: "Cha Hae-In with intense focused gaze, determined expression, confident professional posture, short blonde bob haircut with bangs, purple/violet eyes, S-rank hunter aura",
      neutral: "Cha Hae-In with calm neutral expression, professional demeanor, composed stance, short blonde bob haircut with bangs, purple/violet eyes, poised hunter"
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

    const fullPrompt = `Portrait of ${expressionPrompt}, ${locationContext}, ${timeContext}, Solo Leveling manhwa art style, anime illustration, Korean female S-rank hunter, short blonde bob cut with straight bangs, violet/purple eyes, pale skin, serious expression, red and white hunter armor with gold trim, cinematic lighting, upper body portrait, high quality anime artwork`;

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
  } else if (specificAction) {
    // Create custom prompt based on specific user action
    prompt = createCustomIntimatePrompt(specificAction, relationshipStatus, intimacyLevel);
  } else {
    // Use standard activity-based prompt
    prompt = createIntimatePrompt(activityId, relationshipStatus, intimacyLevel);
  }
  
  // Try NovelAI first for mature content
  console.log('🎨 Generating mature content with NovelAI...');
  try {
    const novelaiResult = await generateWithNovelAI(prompt);
    if (novelaiResult) {
      console.log('✅ NovelAI generated mature content successfully');
      return novelaiResult;
    }
  } catch (error) {
    console.log('⚠️ NovelAI failed for mature content:', String(error));
  }

  // Enhanced OpenAI DALL-E fallback for intimate romantic scenes
  if (openai) {
    console.log('🎨 Using OpenAI DALL-E for intimate romantic scenes...');
    try {
      // Create sophisticated romantic prompts that work within OpenAI guidelines
      const romanticPrompt = `Beautiful anime couple in tender romantic moment, Cha Hae-In with blonde hair and Jin-Woo with dark hair from Solo Leveling, emotional intimacy, soft romantic lighting, Korean manhwa art style, high quality illustration, detailed faces showing love and connection, elegant composition, warm atmosphere, artistic excellence, beautiful detailed eyes, romantic scene, tender embrace, emotional depth`;
      
      const openaiResult = await openai.images.generate({
        model: "dall-e-3",
        prompt: romanticPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
      });
      
      if (openaiResult.data?.[0]?.url) {
        console.log('✅ OpenAI DALL-E generated romantic scene successfully');
        return openaiResult.data[0].url;
      }
    } catch (openaiError) {
      console.log('⚠️ OpenAI DALL-E romantic scene failed:', String(openaiError));
    }
  }

  console.log('📝 All mature content generation providers failed');
  return null;
}

// New function specifically for location-based scene generation
export async function generateLocationSceneImage(location: string, timeOfDay: string, weather?: string): Promise<string | null> {
  try {
    const now = Date.now();
    if (now - lastImageGeneration < IMAGE_GENERATION_COOLDOWN) {
      return null;
    }
    lastImageGeneration = now;

    const cacheKey = `location_${location}_${timeOfDay}_${weather || 'clear'}`;
    const cached = imageCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('📸 Using cached image for location');
      return cached.url;
    }

    const locationPrompt = createLocationPrompt(location, timeOfDay, weather);
    console.log(`🏢 Generating location scene for: ${location} at ${timeOfDay}${weather ? ` with ${weather} weather` : ''}`);
    
    const googleImage = await generateWithGoogleImagen(locationPrompt);
    if (googleImage) {
      console.log('✅ Google Imagen generated location scene successfully');
      imageCache.set(cacheKey, { url: googleImage, timestamp: Date.now() });
      return googleImage;
    }

    // Fallback to OpenAI if Google Imagen fails
    if (openai) {
      try {
        // Use the standard location prompt for OpenAI
        const safePrompt = locationPrompt;
        
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: safePrompt,
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
          
        // Clean prompt for OpenAI content policy compliance
        const cleanPrompt = enhancedPrompt
          .replace(/NSFW|explicit|nude|naked|sexual|intimate|erotic|mature|adult/gi, '')
          .replace(/\b(breast|chest|body|anatomy)\b/gi, 'figure')
          .trim();
          
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: cleanPrompt.length > 0 ? cleanPrompt : "anime style architectural scene",
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
      } catch (openaiError: any) {
        console.log('⚠️ OpenAI location generation failed:', openaiError.response?.data || openaiError.message || 'Unknown error');
      }
    }

    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

function createSafeLocationPrompt(location: string, timeOfDay: string, weather?: string): string {
  const baseStyle = "anime architectural scene, detailed Korean building, manhwa art style, atmospheric lighting, high quality background";
  
  const timeModifiers = {
    morning: "soft morning light, golden hour, peaceful atmosphere",
    afternoon: "bright daylight, clear visibility, active environment", 
    evening: "warm evening glow, sunset lighting, cozy ambiance",
    night: "cool night lighting, urban illumination, serene mood"
  };

  const weatherModifier = weather === "cloudy" ? "overcast sky, diffused lighting" : 
                         weather === "rainy" ? "light rain, wet surfaces, atmospheric" : 
                         "clear weather, natural lighting";

  const locationDescriptions = {
    hunter_association: "modern Korean office building lobby, glass facade, professional interior",
    chahaein_apartment: "contemporary Korean apartment, city view, elegant furnishing",
    hongdae_cafe: "cozy Korean cafe interior, warm lighting, coffee shop atmosphere",
    myeongdong_restaurant: "traditional Korean restaurant, wooden interior, dining atmosphere"
  };

  const locationDesc = locationDescriptions[location as keyof typeof locationDescriptions] || "Korean architectural scene";
  const timeDesc = timeModifiers[timeOfDay as keyof typeof timeModifiers] || "natural lighting";

  return `${baseStyle}, ${locationDesc}, ${timeDesc}, ${weatherModifier}`;
}

function createLocationPrompt(location: string, timeOfDay: string, weather?: string): string {
  const baseStyle = "Solo Leveling manhwa art style by DUBU, detailed architectural environment, Korean setting, atmospheric lighting, cinematic composition, high quality background art";
  
  // Time-based lighting modifiers with enhanced specificity
  const lightingMap = {
    morning: "soft golden morning light streaming through windows, warm sunrise glow, fresh morning atmosphere, early daylight filtering in",
    afternoon: "bright natural daylight flooding the space, clear crisp lighting, vibrant colors, energetic midday illumination", 
    evening: "warm sunset lighting casting long shadows, golden hour ambiance, cozy evening atmosphere, soft amber glow",
    night: "dramatic nighttime lighting, artificial indoor lighting, city lights visible through windows, moonlight, atmospheric night scene"
  };
  
  // Weather-based atmospheric effects
  const weatherMap = {
    clear: "clear skies, bright atmosphere, crisp visibility",
    rain: "rain droplets on windows, wet reflective surfaces, overcast sky, moody atmospheric lighting, rain effects",
    snow: "snow falling outside windows, winter atmosphere, soft white lighting, cold crisp air feel",
    cloudy: "overcast cloudy sky, diffused natural lighting, soft shadows, muted atmospheric tone"
  };
  
  const lighting = lightingMap[timeOfDay as keyof typeof lightingMap] || lightingMap.afternoon;
  const weatherEffect = weather ? weatherMap[weather as keyof typeof weatherMap] || "" : "";
  const combinedAtmosphere = weatherEffect ? `${lighting}, ${weatherEffect}` : lighting;
  
  // Location-specific environment descriptions with proper indoor/outdoor distinction
  const locationPrompts = {
    // INDOOR LOCATIONS - Detailed interior spaces
    hunter_association: `INDOOR SCENE: Korean Hunter Association headquarters interior, spacious modern lobby with marble floors, floor-to-ceiling glass windows, reception desk, holographic mission displays, high-tech equipment stations, professional government building atmosphere, polished surfaces, ${combinedAtmosphere}`,
    
    luxury_department_store: `INDOOR SCENE: Ultra-luxury department store interior in Gangnam Seoul, pristine glass display cases with designer jewelry, elegant mannequins in haute couture, polished white marble floors, crystal chandeliers, boutique sections, upscale retail atmosphere, ${combinedAtmosphere}`,
    
    gangnam_furnishings: `INDOOR SCENE: Premium furniture showroom interior, modern living room displays with designer sofas, bedroom sets with luxury bedding, contemporary home décor, polished concrete floors, sophisticated lighting, high-end furniture store atmosphere, ${combinedAtmosphere}`,
    
    luxury_realtor: `INDOOR SCENE: Exclusive real estate office interior, modern reception area, architectural model displays, floor-to-ceiling windows with city views, sleek conference tables, property brochures, professional luxury office atmosphere, ${combinedAtmosphere}`,
    
    hongdae_cafe: `INDOOR SCENE: Cozy Korean coffee shop interior, wooden tables and chairs, exposed brick walls, barista counter with espresso machines, local artwork displays, large street-facing windows, warm indie café atmosphere, ${combinedAtmosphere}`,
    
    myeongdong_restaurant: `INDOOR SCENE: Elegant Korean restaurant interior, private dining rooms with traditional wooden tables, paper screen dividers, decorative Korean elements, warm ambient lighting, refined dining atmosphere, ${combinedAtmosphere}`,
    
    training_facility: `INDOOR SCENE: Modern hunter training facility interior, large gymnasium with combat mats, weapon racks along walls, training dummies, exercise equipment, high ceilings, professional sports facility atmosphere, ${combinedAtmosphere}`,
    
    chahaein_apartment: `INDOOR SCENE: Modern Korean apartment interior, comfortable living room with city view windows, contemporary furniture, kitchen area, personal decorations, cozy home atmosphere, ${combinedAtmosphere}`,
    
    player_apartment: `INDOOR SCENE: Modest Korean apartment interior, simple living space with basic furniture, small kitchen, personal belongings, starter apartment atmosphere, ${combinedAtmosphere}`,
    
    // OUTDOOR LOCATIONS - External environments and landscapes  
    hangang_park: `OUTDOOR SCENE: Seoul Hangang River park landscape, wide walking paths along the riverbank, modern city skyline in background, green grass areas, park benches, recreational outdoor environment, ${combinedAtmosphere}`,
    
    namsan_tower: `OUTDOOR SCENE: N Seoul Tower exterior on Namsan mountain, observation deck with panoramic Seoul city views, love lock fence, tourists viewing area, iconic tower structure against sky, ${combinedAtmosphere}`,
    
    // MIXED INDOOR/OUTDOOR - Spaces with both elements
    gangnam_district: `OUTDOOR SCENE: Gangnam business district street view, modern skyscrapers, luxury shopping areas, wide sidewalks, urban Seoul atmosphere, ${combinedAtmosphere}`,
    
    hongdae_district: `OUTDOOR SCENE: Hongdae entertainment district street, trendy shops and cafés, young crowd areas, artistic murals, vibrant youth culture neighborhood, ${combinedAtmosphere}`,
    
    jung_district: `OUTDOOR SCENE: Jung-gu historic district in Seoul, traditional and modern architecture mix, shopping streets, cultural landmarks, central Seoul atmosphere, ${combinedAtmosphere}`,
    
    yeongdeungpo_district: `OUTDOOR SCENE: Yeongdeungpo business district, government buildings, wide avenues, official district atmosphere, ${combinedAtmosphere}`
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

export { generateWithGoogleImagen };