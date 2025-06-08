import fetch from 'node-fetch';

interface VoiceConfig {
  apiKey: string;
  chaHaeInVoice: string;
  gameMasterVoice: string;
  systemVoice: string;
  narratorVoice: string;
}

interface VoiceRequest {
  text: string;
  voiceId: string;
  priority: number;
  character: string;
  timestamp: number;
}

class VoiceService {
  private config: VoiceConfig;
  private voiceQueue: VoiceRequest[] = [];
  private isProcessing: boolean = false;

  constructor() {
    this.config = {
      apiKey: process.env.ELEVENLABS_API_KEY || '',
      chaHaeInVoice: process.env.ELEVENLABS_VOICE_CHA_HAE_IN_NEW || process.env.ELEVENLABS_VOICE_CHA_HAE_IN || '',
      gameMasterVoice: process.env.ELEVENLABS_VOICE_GAME_MASTER || '',
      systemVoice: process.env.ELEVENLABS_VOICE_SYSTEM || '',
      narratorVoice: process.env.ELEVENLABS_VOICE_GAME_MASTER || '' // Use Game Master voice for story narration
    };
  }

  private async processVoiceQueue(): Promise<void> {
    if (this.isProcessing || this.voiceQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    // Sort queue by priority (lower number = higher priority), then by timestamp
    this.voiceQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.timestamp - b.timestamp;
    });

    const request = this.voiceQueue.shift();
    if (request) {
      console.log(`🎭 Processing voice for ${request.character} (priority ${request.priority})`);
      await this.generateVoiceInternal(request.text, request.voiceId);
      
      // Add delay between voice generations to ensure proper sequencing
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.isProcessing = false;
    
    // Process next item in queue
    if (this.voiceQueue.length > 0) {
      setTimeout(() => this.processVoiceQueue(), 100);
    }
  }

  private async addToVoiceQueue(text: string, voiceId: string, priority: number, character: string): Promise<Buffer | null> {
    const request: VoiceRequest = {
      text,
      voiceId,
      priority,
      character,
      timestamp: Date.now()
    };

    this.voiceQueue.push(request);
    this.processVoiceQueue();
    
    // For now, return null immediately as we're queueing
    // In a full implementation, we'd return a promise that resolves when the voice is ready
    return null;
  }

  private async generateVoiceInternal(text: string, voiceId: string): Promise<Buffer | null> {
    try {
      if (!this.config.apiKey || !voiceId) {
        console.log('⚠️ ElevenLabs API configuration incomplete - voice disabled');
        return null;
      }

      // Clean and validate text
      const cleanText = this.cleanTextForVoice(text);
      if (cleanText.length < 3) {
        return null;
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.config.apiKey
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🚫 ElevenLabs API Error ${response.status}:`, errorText);
        return null;
      }

      const audioBuffer = await response.buffer();
      console.log('✅ Voice generated successfully');
      return audioBuffer;
    } catch (error: any) {
      if (error.message && error.message.includes('quota_exceeded')) {
        console.log('🚫 ElevenLabs quota exceeded - voice disabled until new API key provided');
      } else {
        console.error('🔊 Voice generation failed:', error.message);
      }
      return null;
    }
  }

  async generateChaHaeInVoice(text: string): Promise<Buffer | null> {
    console.log('🎤 Generating Cha Hae-In voice...');
    return this.generateVoiceInternal(text, this.config.chaHaeInVoice);
  }

  async generateGameMasterVoice(text: string): Promise<Buffer | null> {
    console.log('🎤 Generating Game Master voice...');
    return this.generateVoiceInternal(text, this.config.gameMasterVoice);
  }

  async generateSystemVoice(text: string): Promise<Buffer | null> {
    console.log('🎤 Generating System voice...');
    return this.generateVoiceInternal(text, this.config.systemVoice);
  }

  async generateStoryNarrationVoice(text: string): Promise<Buffer | null> {
    console.log('🎭 Generating Story Narration voice...');
    const cleanText = this.cleanTextForStoryNarration(text);
    if (cleanText.length < 5) {
      return null;
    }
    return this.generateVoice(cleanText, this.config.narratorVoice);
  }

  // Clean text for voice generation (remove formatting, emotes, etc.)
  private cleanTextForVoice(text: string): string {
    return text
      .replace(/\*[^*]*\*/g, '') // Remove *actions*
      .replace(/\([^)]*\)/g, '') // Remove (descriptions)
      .replace(/[🎵🎶🎤🎧🔊🔉🔈🔇]/g, '') // Remove music emojis
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Remove emojis
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Clean text specifically for story narration (preserve narrative flow)
  private cleanTextForStoryNarration(text: string): string {
    return text
      .replace(/\*[^*]*\*/g, '') // Remove *actions* but keep narrative descriptions
      .replace(/[🎵🎶🎤🎧🔊🔉🔈🔇]/g, '') // Remove music emojis
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // Remove emojis
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\.\.\./g, '.') // Convert ellipsis to period for better speech
      .replace(/([.!?])\s*([.!?])/g, '$1 ') // Clean up repeated punctuation
      .trim();
  }

  async generateVoiceByCharacter(character: string, text: string): Promise<Buffer | null> {
    const cleanText = this.cleanTextForVoice(text);
    
    // Skip very short text or non-speech content
    if (cleanText.length < 3 || /^[^a-zA-Z]*$/.test(cleanText)) {
      return null;
    }

    switch (character.toLowerCase()) {
      case 'cha hae-in':
      case 'cha hae in':
      case 'cha-hae-in':
      case 'hae-in':
      case 'chahaein':
        return this.generateChaHaeInVoice(cleanText);
      
      case 'game master':
      case 'game-master':
      case 'gm':
        return this.generateGameMasterVoice(cleanText);
      
      case 'narrator':
      case 'story':
      case 'narration':
      case 'story-narrator':
        return this.generateStoryNarrationVoice(cleanText);
      
      case 'system':
      case 'game':
      case 'announcement':
        return this.generateSystemVoice(cleanText);
      
      default:
        // Default to game master for unknown characters
        return this.generateGameMasterVoice(cleanText);
    }
  }
}

export const voiceService = new VoiceService();