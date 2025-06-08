import OpenAI from "openai";
import type { GameState } from "@shared/schema";
import AdmZip from 'adm-zip';
import { getGoogleAccessToken, getProjectId } from './googleAuth';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Rate limiting for image generation
let lastImageGeneration = 0;
const IMAGE_GENERATION_COOLDOWN = 1000; // 1 second between generations

// Content classification for mature scene detection
function isMatureContent(gameState: GameState): boolean {
  const narration = gameState.narration.toLowerCase();
  const storyPath = gameState.storyPath.toLowerCase();
  const sessionId = gameState.sessionId?.toLowerCase() || '';
  
  // Use Google Imagen for general content (cover, start, character scenes)
  if (storyPath === 'cover' || storyPath === 'start' || narration.includes('cover art') || sessionId.includes('cover')) {
    return false;
  }
  
  // Only treat explicitly intimate/sexual content as mature
  // Most Solo Leveling content including romance should use Google Imagen
  
  const explicitMatureKeywords = [
    'passionate kiss', 'intimate embrace', 'seductive', 'alluring pose',
    'bedroom', 'undressing', 'sensual', 'erotic'
  ];

  const explicitMatureScenes = [
    'intimate_scene', 'bedroom_scene', 'passionate_moment'
  ];
  
  return explicitMatureKeywords.some(keyword => narration.includes(keyword)) ||
         explicitMatureScenes.some(scene => storyPath.includes(scene));
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
          prompt: prompt + ". High quality anime art style, detailed digital illustration, cinematic lighting, vibrant colors, Solo Leveling manhwa style"
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
            prompt: prompt + ". High quality anime art style, detailed digital illustration, cinematic lighting, vibrant colors, Solo Leveling manhwa style"
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
    // Rate limiting check
    const now = Date.now();
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

export async function generateSceneImage(gameState: GameState): Promise<string | null> {
  try {
    // Check rate limit
    const now = Date.now();
    if (now - lastImageGeneration < IMAGE_GENERATION_COOLDOWN) {
      console.log('Image generation rate limited, skipping');
      return null;
    }
    
    lastImageGeneration = now;
    
    // Check if this is mature/romantic content
    const useMatureGenerator = isMatureContent(gameState);
    
    if (useMatureGenerator && process.env.NOVELAI_API_KEY) {
      console.log(`🔥 Mature content detected in scene "${gameState.storyPath}" - using NovelAI`);
      const maturePrompt = createMatureSoloLevelingPrompt(gameState);
      const novelaiImage = await generateWithNovelAI(maturePrompt);
      if (novelaiImage) {
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
      return googleImage;
    }
    console.log('⚠️ Google Imagen failed, trying OpenAI fallback');
    
    // Fallback to OpenAI if available
    if (openai) {
      try {
        // Enhance prompt for accurate character generation
        const fallbackPrompt = useMatureGenerator ? createMatureSoloLevelingPrompt(gameState) : generalPrompt;
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
  const baseStyle = "Solo Leveling manhwa art style, CHUGONG webtoon aesthetic, Korean manhwa illustration, detailed digital art, dramatic shadows, sharp angular character designs, purple and blue color scheme, cinematic lighting, high contrast, professional manhwa quality";
  
  // Determine scene type based on current narration and story path
  const narration = gameState.narration.toLowerCase();
  const storyPath = gameState.storyPath?.toLowerCase() || '';
  
  // Solo Leveling specific character designs
  const includeJinWoo = narration.includes("jin-woo") || narration.includes("sung") || narration.includes("shadow monarch") || narration.includes("you are") || storyPath.includes("jin");
  const includeHaeIn = narration.includes("hae-in") || narration.includes("cha") || narration.includes("sword saint") || storyPath.includes("cha");
  
  let characterDescription = "";
  if (includeJinWoo) {
    characterDescription = ", Sung Jin-Woo (tall Korean male, short spiky BLACK hair, sharp angular face, intense dark eyes, black hunter coat, confident stance, shadow aura, Solo Leveling protagonist design)";
  }
  if (includeHaeIn) {
    characterDescription += ", Cha Hae-In (beautiful Korean female, blonde hair, red armor, elegant sword stance, S-rank hunter, graceful but powerful, Solo Leveling character design)";
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
  
  if (narration.includes("boss") || narration.includes("monster") || narration.includes("combat")) {
    return `${baseStyle}, intense boss battle scene, powerful dungeon monster, dramatic combat lighting, hunter vs monster, action-packed fight scene${characterDescription}, Solo Leveling battle aesthetic`;
  }
  
  if (narration.includes("level up") || narration.includes("system") || narration.includes("status")) {
    return `${baseStyle}, blue system window interface floating in air, RPG status screen, glowing stats display, Solo Leveling system notifications${characterDescription}, game-like UI elements`;
  }
  
  if (narration.includes("hunter") || narration.includes("association") || narration.includes("guild")) {
    return `${baseStyle}, Korean Hunter Association building interior, modern hunter facility, professional meeting room, S-rank hunters gathered${characterDescription}, official hunter setting`;
  }
  
  if (narration.includes("café") || narration.includes("coffee") || narration.includes("table") || narration.includes("sitting")) {
    return `${baseStyle}, wide establishing shot of cozy Korean café interior showing full scene, Sung Jin-Woo (Korean male, black hair, dark hunter outfit) and Cha Hae-In (Korean female, blonde hair, elegant hunter attire) sitting across from each other at wooden table, coffee cups and steam visible, warm ambient lighting from windows, intimate conversation scene, both characters clearly visible in frame, detailed café environment with wooden furniture and soft lighting, manhwa romance composition`;
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
  // Extract emotional descriptions from chat response
  const emotionPatterns = [
    /\(([^)]+)\)/g, // Text in parentheses like (cheeks flushed red)
    /\*([^*]+)\*/g, // Text in asterisks like *smiles softly*
    /her (\w+) (\w+)/gi, // "her cheeks flushed", "her eyes sparkled"
    /she (\w+)/gi, // "she smiled", "she blushed"
    /(blush|smile|laugh|giggle|eyes|cheeks|face|expression)/gi
  ];

  let emotionalDescriptions = [];
  
  // Extract all emotional cues
  emotionPatterns.forEach(pattern => {
    const matches = chatResponse.match(pattern);
    if (matches) {
      emotionalDescriptions.push(...matches);
    }
  });

  // Parse specific emotions and expressions
  const emotions = {
    blushing: /blush|flushed|red cheeks|pink/i.test(chatResponse),
    smiling: /smile|grin|happy|cheerful/i.test(chatResponse),
    shy: /shy|bashful|timid|nervous/i.test(chatResponse),
    confident: /confident|strong|determined/i.test(chatResponse),
    surprised: /surprise|shock|wide eyes|gasp/i.test(chatResponse),
    thoughtful: /thoughtful|pensive|considering/i.test(chatResponse)
  };

  // Build emotion description
  let emotionDesc = "";
  if (emotions.blushing) emotionDesc += "blushing with rosy cheeks, ";
  if (emotions.smiling) emotionDesc += "gentle warm smile, ";
  if (emotions.shy) emotionDesc += "shy and bashful expression, ";
  if (emotions.confident) emotionDesc += "confident determined look, ";
  if (emotions.surprised) emotionDesc += "surprised wide eyes, ";
  if (emotions.thoughtful) emotionDesc += "thoughtful contemplative expression, ";

  return `Professional anime portrait of Cha Hae-In from Solo Leveling manhwa, ${emotionDesc} beautiful Korean S-rank hunter with long blonde hair and striking blue eyes, wearing white and gold Hunter Association uniform, detailed facial expression showing genuine emotion, soft lighting on face highlighting her features, manhwa art style, high quality anime illustration, emotional close-up portrait, Solo Leveling character design`;
}

function createMatureSoloLevelingPrompt(gameState: GameState): string {
  const baseStyle = "Solo Leveling manhwa art style, CHUGONG official artwork, Korean webtoon illustration, professional manhwa quality, detailed digital art, sharp character designs, dramatic shadows, purple and blue color palette, high contrast lighting";
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