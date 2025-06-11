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
      'https://api.novelai.net/ai/generate-image',
      'https://backend.novelai.net/ai/generate-image',
      'https://novelai.net/api/ai/generate-image'
    ];

    const negativePrompt = "low quality, worst quality, blurry, bad anatomy, deformed, ugly, distorted";
    
    const requestBody = {
      input: `masterpiece, best quality, detailed, ${prompt}, Solo Leveling manhwa art style, romantic scene, beautiful lighting`,
      model: 'nai-diffusion-3',
      parameters: {
        width: 832,
        height: 1216,
        scale: 12,
        sampler: 'k_euler_ancestral',
        steps: 50,
        seed: Math.floor(Math.random() * 4294967295),
        n_samples: 1,
        ucPreset: 0,
        uc: negativePrompt,
        qualityToggle: true,
        sm: false,
        sm_dyn: false
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
          const base64Image = Buffer.from(buffer).toString('base64');
          return {
            success: true,
            imageUrl: `data:image/png;base64,${base64Image}`,
            provider: this.name
          };
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
    return !!process.env.GOOGLE_APPLICATION_CREDENTIALS && this.getProjectId() !== null;
  }

  private getProjectId(): string | null {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
      return credentials.project_id || null;
    } catch {
      return null;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
      const { private_key, client_email } = credentials;

      if (!private_key || !client_email) return null;

      const header = {
        alg: 'RS256',
        typ: 'JWT'
      };

      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: client_email,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
      };

      // Simple JWT creation without external libraries
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      
      const crypto = await import('crypto');
      const signature = crypto.sign('RSA-SHA256', Buffer.from(`${encodedHeader}.${encodedPayload}`), private_key);
      const encodedSignature = signature.toString('base64url');
      
      const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
      });

      const data = await response.json();
      return data.access_token || null;
    } catch {
      return null;
    }
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
      // Enhanced prompt for Narrative Lens intimate scenes
      const enhancedPrompt = `${prompt}, Solo Leveling manhwa art style, romantic scene between Cha Hae-In and Sung Jin-Woo, Korean webtoon illustration, detailed character features, soft lighting, emotional connection, high quality digital artwork, tender moment`;
      
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
              aspectRatio: '3:4',
              safetyFilterLevel: 'block_only_high',
              personGeneration: 'allow_adult',
              guidanceScale: 15,
              seed: Math.floor(Math.random() * 1000000)
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.predictions?.[0]?.bytesBase64Encoded;
        
        if (imageUrl) {
          return {
            success: true,
            imageUrl: `data:image/png;base64,${imageUrl}`,
            provider: this.name
          };
        }
      }

      // Enhanced error handling
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
      
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
      if (await provider.isAvailable()) {
        available.push(provider.name);
      }
    }
    return available;
  }
}

export const imageGenerationService = new ImageGenerationService();