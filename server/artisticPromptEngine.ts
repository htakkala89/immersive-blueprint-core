interface ArtisticPromptOptions {
  emotionalTone: 'tender' | 'passionate' | 'romantic' | 'intimate' | 'playful';
  setting: string;
  activityContext: string;
  intimacyLevel: number;
}

export class ArtisticPromptEngine {
  private baseArtStyles = {
    manhwa: "masterpiece, best quality, ultra detailed, extremely detailed, sharp focus, Solo Leveling manhwa art style by DUBU, webtoon illustration, Korean manhwa style, professional digital art, vibrant colors, detailed character designs, cinematic composition, dramatic lighting, high resolution",
    romantic: "masterpiece, best quality, ultra detailed, romantic art style, soft ethereal lighting, emotional depth, beautiful couple portrayal, artistic merit, professional illustration, high quality artwork, detailed rendering",
    elegant: "masterpiece, best quality, ultra detailed, artistic style, sophisticated composition, intimate romantic imagery, high-quality illustration, professional digital art, detailed shading, perfect anatomy"
  };

  private emotionalDescriptors = {
    tender: {
      expressions: "gentle loving gazes, soft tender smiles, peaceful contentment, affectionate expressions",
      atmosphere: "warm intimate atmosphere, soft golden lighting, cozy romantic setting, private sanctuary",
      body_language: "gentle touches, caring embraces, protective closeness, tender caresses"
    },
    passionate: {
      expressions: "intense loving gazes, passionate expressions, deep emotional connection, desire-filled looks",
      atmosphere: "dramatic romantic lighting, intimate private setting, intense emotional atmosphere, heated environment",
      body_language: "passionate embraces, close intimate positioning, emotional intensity, fervent touches"
    },
    romantic: {
      expressions: "loving romantic gazes, beautiful smiles, heartfelt emotions, adoring looks",
      atmosphere: "romantic lighting, beautiful scenic background, intimate romantic setting, sensual ambiance",
      body_language: "romantic closeness, gentle caresses, loving connection, intimate positioning"
    },
    intimate: {
      expressions: "deeply connected gazes, vulnerable emotional expressions, pure love, sensual awareness",
      atmosphere: "private intimate setting, soft romantic lighting, emotional sanctuary, secluded space",
      body_language: "intimate closeness, tender touches, emotional vulnerability, physical connection"
    },
    playful: {
      expressions: "joyful smiles, playful expressions, happy contentment, mischievous looks",
      atmosphere: "bright cheerful lighting, comfortable casual setting, joyful atmosphere, relaxed environment",
      body_language: "playful interactions, comfortable closeness, carefree moments, teasing touches"
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
    // Always generate explicit content for intimacy level 8+
    if (options.intimacyLevel >= 8) {
      console.log(`Generating explicit content - Activity: ${options.activityContext}, Intimacy: ${options.intimacyLevel}`);
      return this.generateExplicitPrompt(options);
    }
    
    const emotional = this.emotionalDescriptors[options.emotionalTone];
    const artStyle = options.intimacyLevel > 7 ? this.baseArtStyles.romantic : this.baseArtStyles.elegant;
    
    // Create character descriptions focused on emotional connection
    const characterDesc = this.createCharacterDescription(options.intimacyLevel);
    const settingDesc = this.createSettingDescription(options.setting);
    const emotionalContext = this.createEmotionalContext(options.emotionalTone, options.activityContext);
    
    return `${artStyle}, ${characterDesc}, ${settingDesc}, ${emotional.expressions}, ${emotional.atmosphere}, ${emotional.body_language}, ${emotionalContext}, beautiful artistic composition, high quality romantic art, emotional depth and artistic merit, detailed intimate portrayal`;
  }

  private isExplicitActivity(activity: string): boolean {
    const explicitActivities = ['shower_together', 'shower', 'bedroom', 'undress', 'nude', 'naked', 'explicit', 'sexual', 'intimate_moment', 'bath', 'together', 'massage', 'touch', 'embrace', 'kiss', 'erotic', 'nsfw', 'mature', 'adult'];
    const activityLower = activity.toLowerCase();
    return explicitActivities.some(explicit => activityLower.includes(explicit));
  }

  private generateExplicitPrompt(options: ArtisticPromptOptions): string {
    const baseQuality = "masterpiece, best quality, ultra detailed, high resolution, Solo Leveling manhwa art style";
    const characters = "Cha Hae-In (beautiful Korean S-rank hunter female, short bob cut golden blonde hair with straight bangs, striking violet purple eyes, pale flawless skin, elegant feminine curves, athletic toned body)";
    
    const activityDesc = 'explicit intimate nude scene, completely naked body, bare breasts exposed, nude feminine form, sensual erotic pose, explicit sexual content, mature adult content, passionate intimate moment, detailed anatomy, uncensored nudity';
    const setting = this.createSettingDescription(options.setting);

    // Activity-specific explicit descriptions
    const explicitContexts = {
      'shower_together': 'solo nude shower scene, wet naked body glistening with water droplets, steam-filled bathroom, bare breasts and nipples visible, completely nude feminine form, sensual bathing, water cascading over naked skin, intimate solo shower moment, explicit nudity',
      'shower': 'solo nude shower scene, wet naked body glistening with water droplets, steam-filled bathroom, bare breasts and nipples visible, completely nude feminine form, sensual bathing, water cascading over naked skin, intimate solo shower moment, explicit nudity',
      'bedroom_intimacy': 'explicit bedroom nude scene, completely naked on bed, bare breasts exposed, nude body sprawled on sheets, intimate bedroom pose, sensual positioning, explicit sexual positioning, nude feminine curves, passionate bedroom moment',
      'spend_night_together': 'intimate bedroom scene, nude body on silk sheets, bare breasts and curves exposed, sensual bedroom pose, explicit nudity in bed, passionate intimate moment, romantic bedroom setting, completely naked feminine form',
      'undress': 'intimate undressing scene, removing clothes slowly, revealing naked body gradually, bare breasts becoming visible, explicit nudity reveal, sensual stripping, clothing removal, nude body exposure',
      'massage': 'nude body massage scene, naked on massage table, bare skin glistening with oil, sensual touching, intimate massage therapy, explicit nudity during massage, erotic massage, nude feminine form',
      'cuddle': 'intimate nude cuddling, naked bodies embracing, bare skin contact, explicit nudity while cuddling, sensual naked embrace, nude intimate moment'
    };

    const specificActivityDesc = explicitContexts[options.activityContext as keyof typeof explicitContexts] || activityDesc;
    
    const explicitPrompt = `${baseQuality}, ${characters}, ${specificActivityDesc}, modern Korean apartment interior, cozy bedroom setting, warm intimate atmosphere, soft romantic lighting, explicit mature content, uncensored, highly detailed erotic art, NSFW adult content, explicit sexual art, premium quality intimate illustration`;
    
    console.log('EXPLICIT PROMPT GENERATED:', explicitPrompt);
    return explicitPrompt;
  }

  private createCharacterDescription(intimacyLevel: number): string {
    const jinWooDesc = "Sung Jin-Woo (handsome Korean male, age 24, short neat black hair, sharp angular features, intense dark eyes, tall athletic build, confident posture, Shadow Monarch aura)";
    const chaHaeInDesc = "Cha Hae-In (beautiful Korean female, age 23, golden blonde hair in elegant bob cut, violet eyes, graceful athletic build, stunning features, S-rank hunter elegance)";
    
    if (intimacyLevel >= 8) {
      return `${jinWooDesc}, ${chaHaeInDesc}, deeply in love couple, emotional vulnerability, pure soul connection, intimate bond, passionate romance`;
    } else if (intimacyLevel >= 6) {
      return `${jinWooDesc}, ${chaHaeInDesc}, romantic couple, growing emotional bond, tender care, developing intimacy`;
    } else {
      return `${jinWooDesc}, ${chaHaeInDesc}, developing relationship, gentle connection, mutual attraction, romantic tension`;
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
      'cuddling': 'tender intimate cuddling, emotional comfort, peaceful togetherness, warm physical connection',
      'kissing': 'passionate romantic kiss, deep emotional connection, loving intimacy, sensual embrace',
      'talking': 'intimate conversation, emotional vulnerability, sharing hearts, private moments',
      'together': 'beautiful moment together, pure love, emotional sanctuary, intimate bonding',
      'bedroom': 'private intimate space, emotional vulnerability, tender love, sensual atmosphere',
      'shower_together': 'steamy bathroom environment, cascading warm water, intimate cleansing ritual, water droplets on skin, steam-filled atmosphere, wet hair, bathroom intimacy',
      'shower': 'intimate cleansing ritual, tender care, emotional closeness, steamy environment',
      'kitchen': 'kitchen counter intimacy, cooking together ambiance, culinary seduction, domestic passion',
      'touch': 'gentle intimate touching, physical connection, sensual exploration, tender caresses',
      'embrace': 'passionate embrace, close physical contact, emotional intimacy, loving hold',
      'undress': 'intimate undressing, vulnerability, sensual revelation, tender exposure',
      'body': 'physical intimacy, body appreciation, sensual contact, intimate exploration'
    };

    const activityContext = Object.keys(contextMap).find(key => 
      activity.toLowerCase().includes(key)
    );

    return activityContext ? contextMap[activityContext as keyof typeof contextMap] : 'beautiful romantic moment, emotional connection, intimate love';
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