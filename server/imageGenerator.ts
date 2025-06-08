import OpenAI from "openai";
import type { GameState } from "@shared/schema";
import AdmZip from 'adm-zip';

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
  
  // Don't treat general Solo Leveling content as mature by default
  // Only specific romantic/intimate content should use NovelAI
  
  const matureKeywords = [
    'intimate', 'passionate', 'embrace', 'kiss', 'romantic', 'love', 'tender',
    'close', 'touch', 'caress', 'desire', 'attraction', 'seductive', 'alluring',
    'beautiful', 'gorgeous', 'stunning', 'enchanting', 'captivating', 'date',
    'confession', 'feelings', 'heart', 'soul', 'bond', 'connection', 'affection',
    'hae-in', 'cha', 'jin-woo', 'hunter', 'guild'
  ];

  const matureScenes = [
    'romantic', 'love', 'kiss', 'embrace', 'intimate', 'tender', 'confession',
    'date', 'passion', 'heart', 'soul', 'bond', 'appreciation', 'start'
  ];
  
  return matureKeywords.some(keyword => narration.includes(keyword)) ||
         matureScenes.some(scene => storyPath.includes(scene));
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
    if (!process.env.GOOGLE_IMAGEN_API_KEY) {
      console.log('Google Imagen API key not available');
      return null;
    }

    const apiKey = process.env.GOOGLE_IMAGEN_API_KEY;
    
    // Try Google AI Studio endpoint for image generation
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/imagen-3.0-generate-001:generateImage?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:generateImage?key=${apiKey}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: {
              text: prompt + ". High quality anime art style, detailed digital illustration, cinematic lighting, vibrant colors, Solo Leveling manhwa style"
            },
            safetySettings: [{
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH"
            }],
            personGeneration: "ALLOW_ADULT"
          })
        });

        if (response.ok) {
          const data = await response.json();
          const imageData = data.generatedImages?.[0]?.bytesBase64Encoded || data.candidates?.[0]?.image?.bytesBase64Encoded;
          
          if (imageData) {
            console.log('✅ Google Imagen generated image successfully');
            return `data:image/png;base64,${imageData}`;
          }
        } else {
          const errorText = await response.text();
          console.log(`Endpoint ${endpoint} failed:`, response.status, errorText);
        }
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint} error:`, endpointError);
      }
    }
    
    console.log('All Google Imagen endpoints failed, falling back to OpenAI');
    return null;
  } catch (error) {
    console.error('Google Imagen generation error:', error);
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
      // Use NovelAI specifically for mature/romantic themes
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
    if (process.env.GOOGLE_API_KEY) {
      console.log('🎯 Using Google Imagen for Solo Leveling content');
      const googleImage = await generateWithGoogleImagen(generalPrompt);
      if (googleImage) {
        console.log('✅ Google Imagen generated image successfully');
        return googleImage;
      }
      console.log('⚠️ Google Imagen failed, trying OpenAI fallback');
    }
    
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

function createMatureSoloLevelingPrompt(gameState: GameState): string {
  const baseStyle = "masterpiece, best quality, anime style, manhwa art, Solo Leveling aesthetic, detailed artwork, cinematic composition, dramatic lighting";
  const narration = gameState.narration.toLowerCase();
  
  // Character descriptions for mature scenes with explicit hair colors
  const jinWooDesc = "Sung Jin-Woo (tall Korean male with BLACK HAIR, short messy black hair, sharp dark eyes, handsome angular face, black hunter outfit, Shadow Monarch, NOT blonde, NOT light hair)";
  const chaHaeInDesc = "Cha Hae-In (beautiful Korean female hunter, long BLONDE hair, elegant features, graceful stance, white hunter outfit, sword saint)";
  
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