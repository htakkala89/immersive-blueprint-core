interface ArtisticPromptOptions {
  emotionalTone: 'tender' | 'passionate' | 'romantic' | 'intimate' | 'playful';
  setting: string;
  activityContext: string;
  intimacyLevel: number;
}

export class ArtisticPromptEngine {
  private baseArtStyles = {
    manhwa: "Solo Leveling manhwa art style by DUBU, detailed character designs, cinematic composition, dramatic lighting",
    romantic: "romantic art style, soft lighting, emotional depth, beautiful couple portrayal, artistic merit",
    elegant: "elegant artistic style, sophisticated composition, tasteful romantic imagery, high-quality illustration"
  };

  private emotionalDescriptors = {
    tender: {
      expressions: "gentle loving gazes, soft tender smiles, peaceful contentment",
      atmosphere: "warm intimate atmosphere, soft golden lighting, cozy romantic setting",
      body_language: "gentle touches, caring embraces, protective closeness"
    },
    passionate: {
      expressions: "intense loving gazes, passionate expressions, deep emotional connection",
      atmosphere: "dramatic romantic lighting, intimate private setting, intense emotional atmosphere",
      body_language: "passionate embraces, close intimate positioning, emotional intensity"
    },
    romantic: {
      expressions: "loving romantic gazes, beautiful smiles, heartfelt emotions",
      atmosphere: "romantic lighting, beautiful scenic background, intimate romantic setting",
      body_language: "romantic closeness, gentle caresses, loving connection"
    },
    intimate: {
      expressions: "deeply connected gazes, vulnerable emotional expressions, pure love",
      atmosphere: "private intimate setting, soft romantic lighting, emotional sanctuary",
      body_language: "intimate closeness, tender touches, emotional vulnerability"
    },
    playful: {
      expressions: "joyful smiles, playful expressions, happy contentment",
      atmosphere: "bright cheerful lighting, comfortable casual setting, joyful atmosphere",
      body_language: "playful interactions, comfortable closeness, carefree moments"
    }
  };

  private settingDescriptors = {
    apartment: "modern Korean apartment interior, cozy living space, warm home atmosphere",
    cafe: "intimate corner of cozy Korean café, soft ambient lighting, romantic setting",
    park: "beautiful outdoor park setting, natural scenery, peaceful romantic atmosphere",
    restaurant: "elegant Korean restaurant, private dining area, romantic dinner setting",
    association: "quiet corner of Hunter Association, professional yet intimate setting"
  };

  generateArtisticPrompt(options: ArtisticPromptOptions): string {
    const emotional = this.emotionalDescriptors[options.emotionalTone];
    const artStyle = options.intimacyLevel > 7 ? this.baseArtStyles.romantic : this.baseArtStyles.elegant;
    
    // Create character descriptions focused on emotional connection
    const characterDesc = this.createCharacterDescription(options.intimacyLevel);
    const settingDesc = this.createSettingDescription(options.setting);
    const emotionalContext = this.createEmotionalContext(options.emotionalTone, options.activityContext);
    
    return `${artStyle}, ${characterDesc}, ${settingDesc}, ${emotional.expressions}, ${emotional.atmosphere}, ${emotional.body_language}, ${emotionalContext}, beautiful artistic composition, high quality romantic art, emotional depth and artistic merit, tasteful and elegant portrayal`;
  }

  private createCharacterDescription(intimacyLevel: number): string {
    const baseDesc = "Sung Jin-Woo and Cha Hae-In as beautiful couple, Solo Leveling character designs";
    
    if (intimacyLevel >= 8) {
      return `${baseDesc}, deeply in love, emotional vulnerability, pure connection between souls`;
    } else if (intimacyLevel >= 6) {
      return `${baseDesc}, romantic couple, growing emotional bond, tender care for each other`;
    } else {
      return `${baseDesc}, developing relationship, gentle emotional connection, mutual respect and attraction`;
    }
  }

  private createSettingDescription(setting: string): string {
    const settingMap = {
      'chahaein_apartment': this.settingDescriptors.apartment,
      'hongdae_cafe': this.settingDescriptors.cafe,
      'hangang_park': this.settingDescriptors.park,
      'myeongdong_restaurant': this.settingDescriptors.restaurant,
      'hunter_association': this.settingDescriptors.association
    };

    return settingMap[setting as keyof typeof settingMap] || "beautiful romantic setting, intimate atmosphere";
  }

  private createEmotionalContext(tone: string, activity: string): string {
    const contextMap = {
      'cuddling': 'tender intimate cuddling, emotional comfort, peaceful togetherness',
      'kissing': 'passionate romantic kiss, deep emotional connection, loving intimacy',
      'talking': 'intimate conversation, emotional vulnerability, sharing hearts',
      'together': 'beautiful moment together, pure love, emotional sanctuary',
      'bedroom': 'private intimate space, emotional vulnerability, tender love',
      'shower': 'intimate cleansing ritual, tender care, emotional closeness'
    };

    const activityContext = Object.keys(contextMap).find(key => 
      activity.toLowerCase().includes(key)
    );

    return activityContext ? contextMap[activityContext as keyof typeof contextMap] : 'beautiful romantic moment, emotional connection, pure love';
  }

  generateRomanticPrompt(userPrompt: string, chatHistory: any[]): string {
    // Analyze user prompt for emotional tone and setting
    const tone = this.analyzeEmotionalTone(userPrompt);
    const setting = this.extractSetting(userPrompt, chatHistory);
    const intimacyLevel = this.assessIntimacyLevel(userPrompt, chatHistory);
    
    return this.generateArtisticPrompt({
      emotionalTone: tone,
      setting,
      activityContext: userPrompt,
      intimacyLevel
    });
  }

  private analyzeEmotionalTone(prompt: string): 'tender' | 'passionate' | 'romantic' | 'intimate' | 'playful' {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('passionate') || lowerPrompt.includes('intense') || lowerPrompt.includes('desire')) {
      return 'passionate';
    } else if (lowerPrompt.includes('tender') || lowerPrompt.includes('gentle') || lowerPrompt.includes('soft')) {
      return 'tender';
    } else if (lowerPrompt.includes('intimate') || lowerPrompt.includes('close') || lowerPrompt.includes('private')) {
      return 'intimate';
    } else if (lowerPrompt.includes('playful') || lowerPrompt.includes('fun') || lowerPrompt.includes('laugh')) {
      return 'playful';
    } else {
      return 'romantic';
    }
  }

  private extractSetting(prompt: string, chatHistory: any[]): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('apartment') || lowerPrompt.includes('home') || lowerPrompt.includes('bedroom')) {
      return 'chahaein_apartment';
    } else if (lowerPrompt.includes('café') || lowerPrompt.includes('coffee')) {
      return 'hongdae_cafe';
    } else if (lowerPrompt.includes('park') || lowerPrompt.includes('outdoor')) {
      return 'hangang_park';
    } else if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('dinner')) {
      return 'myeongdong_restaurant';
    } else {
      return 'chahaein_apartment'; // Default to intimate setting
    }
  }

  private assessIntimacyLevel(prompt: string, chatHistory: any[]): number {
    const lowerPrompt = prompt.toLowerCase();
    let level = 5; // Base romantic level
    
    // Increase based on intimate keywords
    if (lowerPrompt.includes('kiss') || lowerPrompt.includes('embrace')) level += 2;
    if (lowerPrompt.includes('close') || lowerPrompt.includes('together')) level += 1;
    if (lowerPrompt.includes('love') || lowerPrompt.includes('heart')) level += 1;
    if (lowerPrompt.includes('intimate') || lowerPrompt.includes('private')) level += 2;
    
    // Cap at 10 for artistic romantic content
    return Math.min(level, 10);
  }
}

export const artisticPromptEngine = new ArtisticPromptEngine();