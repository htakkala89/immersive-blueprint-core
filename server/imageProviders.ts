import AdmZip from 'adm-zip';

interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  provider?: string;
}

interface ImageProvider {
  name: string;
  generate: (prompt: string, options?: any) => Promise<ImageGenerationResult>;
  isAvailable: () => Promise<boolean>;
}

class NovelAIProvider implements ImageProvider {
  name = 'NovelAI';

  async isAvailable(): Promise<boolean> {
    if (!process.env.NOVELAI_API_KEY) return false;
    
    try {
      // Test with a simple request to check API availability
      const response = await fetch('https://api.novelai.net/user/subscription', {
        headers: { 'Authorization': `Bearer ${process.env.NOVELAI_API_KEY}` }
      });
      return response.status !== 404;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, options: any = {}): Promise<ImageGenerationResult> {
    const endpoints = [
      'https://image.novelai.net/ai/generate-image'
    ];

    const negativePrompt = "silver hair on Cha Hae-In, white hair on Cha Hae-In, black hair on Cha Hae-In, brown hair on Cha Hae-In, dark hair on Cha Hae-In, blonde hair on Jin-Woo, light hair on Jin-Woo, incorrect character appearances, wrong hair colors, low quality, worst quality, blurry, bad anatomy, deformed, ugly, distorted";
    
    const requestBody = {
      input: `masterpiece, best quality, detailed, ${prompt}, Solo Leveling manhwa art style, romantic scene, beautiful lighting`,
      model: 'nai-diffusion-3',
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
              return {
                success: true,
                imageUrl: `data:image/png;base64,${base64Image}`,
                provider: this.name
              };
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

    return {
      success: false,
      error: 'All NovelAI endpoints failed',
      provider: this.name
    };
  }
}

class GoogleImagenProvider implements ImageProvider {
  name = 'Google Imagen';

  async isAvailable(): Promise<boolean> {
    const hasKey = !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const projectId = this.getProjectId();
    const hasProject = projectId !== null;
    
    console.log(`Google Imagen availability check: hasKey=${hasKey}, projectId=${projectId}, hasProject=${hasProject}`);
    
    return hasKey && hasProject;
  }

  private getProjectId(): string | null {
    try {
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        return process.env.GOOGLE_CLOUD_PROJECT_ID || null;
      }
      
      const serviceAccountString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      if (serviceAccountString === 'undefined' || serviceAccountString.trim() === '') {
        return process.env.GOOGLE_CLOUD_PROJECT_ID || null;
      }
      
      const serviceAccount = JSON.parse(serviceAccountString);
      return serviceAccount.project_id;
    } catch {
      return process.env.GOOGLE_CLOUD_PROJECT_ID || null;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    // Import the existing Google auth system
    const { getGoogleAccessToken } = await import('./googleAuth');
    return await getGoogleAccessToken();
  }

  async generate(prompt: string): Promise<ImageGenerationResult> {
    const projectId = this.getProjectId();
    const accessToken = await this.getAccessToken();

    if (!projectId || !accessToken) {
      return {
        success: false,
        error: 'Google Imagen credentials not available',
        provider: this.name
      };
    }

    try {
      // Enhanced prompt matching the working location image system
      const enhancedPrompt = `${prompt}. Solo Leveling manhwa art style by DUBU, vibrant glowing colors (neon purples, blues, golds), sharp dynamic action with clean lines, detailed character designs, powerful and epic feel. NEGATIVE PROMPT: purple hair on Cha Hae-In, black hair on Cha Hae-In, brown hair on Cha Hae-In, dark hair on Cha Hae-In, blonde hair on Jin-Woo, light hair on Jin-Woo, incorrect character appearances, wrong hair colors, character design errors`;
      
      const response = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagegeneration@006:predict`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instances: [{
              prompt: enhancedPrompt
            }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "1:1",
              safetyFilterLevel: "block_only_high",
              personGeneration: "allow_adult",
              outputMimeType: "image/png"
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Google Imagen response structure:', JSON.stringify(data, null, 2));
        
        // Try multiple possible response formats
        let imageUrl = data.predictions?.[0]?.bytesBase64Encoded ||
                      data.predictions?.[0]?.image?.bytesBase64Encoded ||
                      data.predictions?.[0]?.generatedImage?.bytesBase64Encoded;
        
        if (imageUrl) {
          return {
            success: true,
            imageUrl: `data:image/png;base64,${imageUrl}`,
            provider: this.name
          };
        } else {
          console.log('No image found in Google Imagen response');
        }
      }

      // Enhanced error handling
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
      console.log('Google Imagen error:', errorMessage, errorData);
      
      return {
        success: false,
        error: `Google Imagen API error: ${errorMessage}`,
        provider: this.name
      };
    } catch (error) {
      return {
        success: false,
        error: `Google Imagen generation failed: ${error instanceof Error ? error.message : String(error)}`,
        provider: this.name
      };
    }
  }
}

class OpenAIProvider implements ImageProvider {
  name = 'OpenAI DALL-E';

  async isAvailable(): Promise<boolean> {
    return !!process.env.OPENAI_API_KEY;
  }

  async generate(prompt: string): Promise<ImageGenerationResult> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not available',
        provider: this.name
      };
    }

    try {
      // Content-safe prompt for DALL-E compliance
      const safePrompt = `Two characters from Korean manhwa Solo Leveling in a romantic scene, anime art style, soft lighting, emotional moment, high quality digital art, tender expression`;
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: safePrompt,
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'standard',
          n: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.data?.[0]?.url;
        
        if (imageUrl) {
          return {
            success: true,
            imageUrl,
            provider: this.name
          };
        }
      }

      // Enhanced error handling
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
      
      return {
        success: false,
        error: `OpenAI API error: ${errorMessage}`,
        provider: this.name
      };
    } catch (error) {
      return {
        success: false,
        error: `OpenAI generation failed: ${error instanceof Error ? error.message : String(error)}`,
        provider: this.name
      };
    }
  }
}

export class ImageGenerationService {
  private providers: ImageProvider[] = [
    new NovelAIProvider(),
    new GoogleImagenProvider(),
    new OpenAIProvider()
  ];

  async generateImage(prompt: string, preferredProvider?: string): Promise<ImageGenerationResult> {
    // Try preferred provider first if specified
    if (preferredProvider) {
      const provider = this.providers.find(p => p.name.toLowerCase() === preferredProvider.toLowerCase());
      if (provider && await provider.isAvailable()) {
        const result = await provider.generate(prompt);
        if (result.success) return result;
      }
    }

    // Try all available providers in order: NovelAI → Google Imagen → OpenAI
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        console.log(`Attempting generation with ${provider.name}...`);
        const result = await provider.generate(prompt);
        
        if (result.success) {
          console.log(`✅ Successfully generated image with ${provider.name}`);
          return result;
        } else {
          console.log(`❌ ${provider.name} failed: ${result.error}`);
          
          // Continue to next provider immediately if this one fails
          continue;
        }
      }
    }

    return {
      success: false,
      error: 'All image generation providers failed or unavailable'
    };
  }

  async getAvailableProviders(): Promise<string[]> {
    const available = [];
    for (const provider of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        console.log(`Provider ${provider.name}: ${isAvailable ? 'Available' : 'Not Available'}`);
        if (isAvailable) {
          available.push(provider.name);
        }
      } catch (error) {
        console.log(`Provider ${provider.name} check failed:`, error);
      }
    }
    console.log('Available providers:', available);
    return available;
  }
}

export const imageGenerationService = new ImageGenerationService();