import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateWithGoogleImagen(prompt: string): Promise<string | null> {
  try {
    // Note: Google's Gemini doesn't have direct image generation like DALL-E
    // We'll use the text generation to create detailed descriptions that can be used
    // with other image services or return a placeholder for now
    
    console.log('📝 Using Gemini to enhance image prompt...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const enhancedPrompt = `Create a highly detailed visual description for this scene: ${prompt}. 
    Make it cinematic and atmospheric, focusing on lighting, mood, and visual composition. 
    Ensure Cha Hae-In has golden blonde hair if she appears in the scene.
    Return only the enhanced visual description.`;
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const enhancedDescription = response.text();
    
    console.log('✅ Enhanced prompt with Gemini:', enhancedDescription.substring(0, 100) + '...');
    
    // For now, we'll return null as we don't have direct image generation
    // This allows the system to gracefully handle missing images
    // In a production environment, you would integrate with Google's Imagen API
    // or use the enhanced prompt with another image generation service
    
    return null;
  } catch (error) {
    console.error('Error with Google Imagen service:', error);
    return null;
  }
}

// Alternative implementation using NovelAI as fallback
export async function generateWithGoogleImagenFallback(prompt: string): Promise<string | null> {
  try {
    // First try to enhance the prompt with Gemini
    const enhancedPrompt = await enhancePromptWithGemini(prompt);
    
    // Then use NovelAI for actual image generation if available
    if (process.env.NOVELAI_API_KEY) {
      return await generateWithNovelAI(enhancedPrompt || prompt);
    }
    
    return null;
  } catch (error) {
    console.error('Error with Google Imagen fallback service:', error);
    return null;
  }
}

async function enhancePromptWithGemini(prompt: string): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const enhancementRequest = `Enhance this image generation prompt with more visual detail while keeping it under 200 words: ${prompt}`;
    
    const result = await model.generateContent(enhancementRequest);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error enhancing prompt with Gemini:', error);
    return null;
  }
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
          negative_prompt: "low quality, blurry, deformed, bad anatomy, ugly, distorted, pixelated, artifacts, jpeg artifacts, watermark, signature, text, logo, username, monochrome, oversaturated, undersaturated, overexposed, underexposed, bad hands, extra fingers, missing fingers, malformed limbs, mutation, poorly drawn, bad proportions, gross proportions, out of frame, extra limbs, disfigured, poorly drawn hands, poorly drawn face, mutation, deformed, bad art, beginner, amateur, distorted face, silver hair on Cha Hae-In, black hair on Cha Hae-In, dark hair on Cha Hae-In"
        }
      })
    });

    if (!response.ok) {
      console.error('NovelAI API error:', response.status, response.statusText);
      return null;
    }

    const buffer = await response.arrayBuffer();
    
    // NovelAI returns a ZIP file containing the image
    const AdmZip = (await import('adm-zip')).default;
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