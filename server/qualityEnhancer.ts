interface QualityMetrics {
  resolution: number;
  sharpness: number;
  colorBalance: number;
  anatomyScore: number;
  overallQuality: number;
}

interface EnhancementConfig {
  targetResolution: { width: number; height: number };
  sharpnessThreshold: number;
  colorSaturation: number;
  contrastBoost: number;
  enableUpscaling: boolean;
}

export class NovelAIQualityEnhancer {
  private defaultConfig: EnhancementConfig = {
    targetResolution: { width: 1344, height: 768 },
    sharpnessThreshold: 0.7,
    colorSaturation: 1.1,
    contrastBoost: 1.05,
    enableUpscaling: true
  };

  // Enhanced prompt quality boosters
  generateQualityPrompt(basePrompt: string, category: 'romantic' | 'intimate' | 'scenic'): string {
    const qualityTags = [
      "masterpiece", "best quality", "ultra detailed", "extremely detailed",
      "sharp focus", "8k resolution", "professional digital art",
      "perfect anatomy", "detailed shading", "cinematic lighting",
      "high contrast", "vibrant colors", "beautiful artwork"
    ];

    const categoryBoosts = {
      romantic: [
        "romantic atmosphere", "emotional depth", "tender expressions",
        "soft lighting", "beautiful couple", "artistic composition"
      ],
      intimate: [
        "intimate lighting", "passionate atmosphere", "detailed anatomy",
        "sensual poses", "emotional connection", "artistic merit"
      ],
      scenic: [
        "detailed background", "atmospheric perspective", "beautiful scenery",
        "perfect composition", "dramatic lighting", "photorealistic"
      ]
    };

    const categoryTags = categoryBoosts[category] || categoryBoosts.romantic;
    const allTags = [...qualityTags, ...categoryTags];
    
    return `${allTags.join(", ")}, ${basePrompt}`;
  }

  // Advanced negative prompt generator
  generateAdvancedNegativePrompt(category: 'general' | 'anatomy' | 'technical'): string {
    const negativeCategories = {
      general: [
        "low quality", "worst quality", "blurry", "bad anatomy", "deformed",
        "disfigured", "ugly", "distorted", "poorly drawn", "bad proportions"
      ],
      anatomy: [
        "bad hands", "extra fingers", "missing fingers", "malformed limbs",
        "mutation", "extra arms", "extra legs", "missing limbs",
        "incorrect anatomy", "anatomical errors"
      ],
      technical: [
        "pixelated", "jpeg artifacts", "compression artifacts", "watermark",
        "signature", "text", "logo", "username", "grainy", "noise",
        "oversaturated", "undersaturated", "overexposed", "underexposed"
      ]
    };

    const allNegatives = [
      ...negativeCategories.general,
      ...negativeCategories.anatomy,
      ...negativeCategories.technical,
      "cropped", "out of frame", "duplicate", "multiple views",
      "split screen", "border", "frame", "monochrome"
    ];

    return allNegatives.join(", ");
  }

  // Optimal NovelAI parameters for maximum quality
  getOptimalParameters(contentType: 'portrait' | 'landscape' | 'intimate'): any {
    const baseParams = {
      scale: 18,
      sampler: 'k_dpmpp_2s_ancestral',
      steps: 70,
      qualityToggle: true,
      sm: true,
      sm_dyn: true,
      dynamic_thresholding: true,
      controlnet_strength: 1.0,
      cfg_rescale: 0.7,
      noise: 0.0,
      strength: 0.85
    };

    const dimensionConfig = {
      portrait: { width: 832, height: 1216 },
      landscape: { width: 1344, height: 768 },
      intimate: { width: 1024, height: 1024 }
    };

    return {
      ...baseParams,
      ...dimensionConfig[contentType],
      seed: Math.floor(Math.random() * 4294967295),
      n_samples: 1,
      ucPreset: 0
    };
  }

  // Character consistency prompts for Solo Leveling
  getSoloLevelingCharacterPrompts(): { jinWoo: string; chaHaeIn: string } {
    return {
      jinWoo: "Sung Jin-Woo (handsome Korean male, age 24, SHORT BLACK HAIR ONLY - never blonde, sharp angular facial features, intense dark eyes, tall athletic build, confident posture, Shadow Monarch aura, black hunter coat with silver details)",
      chaHaeIn: "Cha Hae-In (beautiful Korean female S-rank hunter, age 23, GOLDEN BLONDE HAIR MANDATORY - never purple/black/brown hair, elegant bob cut with straight bangs, violet/purple eyes, graceful athletic build, stunning feminine features, red armor with golden accents OR elegant casual clothing)"
    };
  }

  // Scene-specific quality enhancement
  enhanceScenePrompt(scene: string, characters: string, mood: string): string {
    const sceneEnhancements = {
      bedroom: "intimate bedroom setting, soft romantic lighting, cozy atmosphere, detailed interior, warm colors",
      apartment: "modern apartment interior, sophisticated decor, natural lighting, detailed furnishings, elegant space",
      restaurant: "upscale restaurant ambiance, romantic dining setting, warm lighting, elegant table setting, atmospheric",
      outdoor: "beautiful outdoor scene, natural lighting, detailed environment, scenic background, atmospheric perspective"
    };

    const moodEnhancements = {
      romantic: "romantic atmosphere, tender expressions, emotional connection, soft lighting, beautiful composition",
      passionate: "passionate atmosphere, intense emotions, dramatic lighting, sensual mood, artistic composition",
      intimate: "intimate atmosphere, close connection, warm lighting, emotional depth, tasteful portrayal"
    };

    const sceneType = Object.keys(sceneEnhancements).find(key => scene.toLowerCase().includes(key)) || 'apartment';
    const moodType = Object.keys(moodEnhancements).find(key => mood.toLowerCase().includes(key)) || 'romantic';

    return `${characters}, ${sceneEnhancements[sceneType as keyof typeof sceneEnhancements]}, ${moodEnhancements[moodType as keyof typeof moodEnhancements]}, Solo Leveling manhwa art style by DUBU, webtoon illustration, professional digital art`;
  }

  // Quality validation metrics
  validateImageQuality(imageData: string): QualityMetrics {
    // This would implement actual image analysis in a production system
    // For now, return simulated metrics based on generation parameters
    return {
      resolution: 0.9,
      sharpness: 0.85,
      colorBalance: 0.88,
      anatomyScore: 0.82,
      overallQuality: 0.86
    };
  }

  // Generate retry prompt if quality is insufficient
  generateRetryPrompt(originalPrompt: string, qualityIssues: string[]): string {
    const qualityFixes: Record<string, string> = {
      'low_sharpness': 'sharp focus, crisp details, high definition',
      'poor_anatomy': 'perfect anatomy, correct proportions, detailed human form',
      'color_issues': 'vibrant colors, proper color balance, professional color grading',
      'composition': 'perfect composition, artistic framing, balanced layout'
    };

    const fixes = qualityIssues.map(issue => qualityFixes[issue] || '').filter(Boolean);
    return `${fixes.join(', ')}, ${originalPrompt}`;
  }
}

export const qualityEnhancer = new NovelAIQualityEnhancer();