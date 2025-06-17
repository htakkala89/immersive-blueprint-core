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

    const negativePrompt = "dark hair on Cha Hae-In, black hair on Cha Hae-In, brown hair on Cha Hae-In, blonde hair on Jin-Woo, light hair on Jin-Woo, incorrect character appearances, wrong hair colors, low quality, worst quality, blurry, bad anatomy, deformed, ugly, distorted, censored bars, mosaic censoring";
    
    const optimizedPrompt = `${prompt}, Cha Hae-In with blonde hair, Jin-Woo with dark hair, Solo Leveling manhwa art style, explicit mature content, uncensored, high quality erotic artwork, Korean webtoon aesthetic, NSFW content, adult content`;

    // Try latest models first, fallback to V3 if unavailable
    const models = ['nai-diffusion-4', 'nai-diffusion-3'];
    
    for (const model of models) {
      const requestBody = {
        input: optimizedPrompt,
        model: model,
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
                console.log(`✅ NovelAI ${model} generated image successfully`);
                return {
                  success: true,
                  imageUrl: `data:image/png;base64,${base64Image}`,
                  provider: `${this.name} ${model}`
                };
              }
            } catch (zipError) {
              console.log('Failed to extract ZIP from NovelAI response:', zipError);
            }
          } else {
            const errorText = await response.text();
            console.log(`NovelAI ${model} at ${endpoint} failed with status ${response.status}:`, errorText);
          }
        } catch (error) {
          console.log(`NovelAI ${model} endpoint ${endpoint} failed:`, error);
        }
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
    const hasApiKey = !!process.env.GOOGLE_API_KEY;
    console.log(`Google Imagen availability check: hasApiKey=${hasApiKey}`);
    return hasApiKey;
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
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: 'Google API key not available',
        provider: this.name
      };
    }

    try {
      // Using Google Generative AI API for image generation
      const enhancedPrompt = `${prompt}. Solo Leveling manhwa art style, romantic cinematic lighting, beautiful detailed faces, expressive eyes, tender emotional connection, elegant composition, high quality digital art, Korean webtoon aesthetic, intimate atmosphere, artistic excellence`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            safetySettings: [
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_ONLY_HIGH"
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Google Generative AI response structure:', JSON.stringify(data, null, 2));
        
        // Google Generative AI response format
        const imageData = data.generatedImages?.[0]?.bytesBase64Encoded;
        
        if (imageData) {
          return {
            success: true,
            imageUrl: `data:image/png;base64,${imageData}`,
            provider: this.name
          };
        } else {
          console.log('No image found in Google Generative AI response');
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
    new NovelAIProvider()
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