import fetch from 'node-fetch';

interface VoiceConfig {
  apiKey: string;
  chaHaeInVoice: string;
  gameMasterVoice: string;
  systemVoice: string;
}

class VoiceService {
  private config: VoiceConfig;

  constructor() {
    this.config = {
      apiKey: process.env.ELEVENLABS_API_KEY || '',
      chaHaeInVoice: process.env.ELEVENLABS_VOICE_CHA_HAE_IN || '',
      gameMasterVoice: process.env.ELEVENLABS_VOICE_GAME_MASTER || '',
      systemVoice: process.env.ELEVENLABS_VOICE_SYSTEM || ''
    };
  }

  private async generateVoice(text: string, voiceId: string): Promise<Buffer | null> {
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
    } catch (error) {
      console.error('🔊 Voice generation failed:', error.message);
      return null;
    }
  }

  async generateChaHaeInVoice(text: string): Promise<Buffer | null> {
    console.log('🎤 Generating Cha Hae-In voice...');
    return this.generateVoice(text, this.config.chaHaeInVoice);
  }

  async generateGameMasterVoice(text: string): Promise<Buffer | null> {
    console.log('🎤 Generating Game Master voice...');
    return this.generateVoice(text, this.config.gameMasterVoice);
  }

  async generateSystemVoice(text: string): Promise<Buffer | null> {
    console.log('🎤 Generating System voice...');
    return this.generateVoice(text, this.config.systemVoice);
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

  async generateVoiceByCharacter(character: string, text: string): Promise<Buffer | null> {
    const cleanText = this.cleanTextForVoice(text);
    
    // Skip very short text or non-speech content
    if (cleanText.length < 3 || /^[^a-zA-Z]*$/.test(cleanText)) {
      return null;
    }

    switch (character.toLowerCase()) {
      case 'cha hae-in':
      case 'cha hae in':
      case 'hae-in':
      case 'chahaein':
        return this.generateChaHaeInVoice(cleanText);
      
      case 'game master':
      case 'narrator':
      case 'gm':
        return this.generateGameMasterVoice(cleanText);
      
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