import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSceneImage, generateIntimateActivityImage, generateLocationSceneImage } from "./imageGenerator";
import { getCachedLocationImage, cacheLocationImage, preloadLocationImages, getCacheStats } from "./imagePreloader";
import { getSceneImage } from "./preGeneratedImages";
import { voiceService } from "./voiceService";
import { log } from "./vite";
import { z } from "zod";
import OpenAI from "openai";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize OpenAI for cover generation
const openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const MakeChoiceSchema = z.object({
  sessionId: z.string(),
  choice: z.object({
    id: z.string(),
    icon: z.string(),
    text: z.string(),
    detail: z.string().optional(),
  })
});

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Function to create emotional prompts for Cha Hae-In based on her presence and emotional state
function createChaHaeInEmotionalPrompt(emotion: string, location: string, timeOfDay: string): string {
  const baseCharacterDescription = "Cha Hae-In from Solo Leveling anime, beautiful S-rank hunter with long blonde hair, striking blue eyes, wearing her signature hunter outfit or elegant casual clothing";
  
  const locationMappings: Record<string, string> = {
    hunter_association: "inside the Hunter Association headquarters with its modern glass architecture and professional atmosphere",
    gangnam_tower: "at the advanced training facility with combat equipment and simulation chambers visible",
    hongdae_cafe: "in a cozy artisan coffee house with warm lighting and artistic decor",
    myeongdong_restaurant: "in an elegant traditional Korean restaurant with refined interior design",
    chahaein_apartment: "in her modern, minimalist apartment with soft lighting and personal touches"
  };

  const timeOfDayMappings: Record<string, string> = {
    morning: "during morning hours with soft natural light streaming through windows",
    afternoon: "during bright afternoon with clear daylight illuminating the scene",
    evening: "during golden hour evening with warm sunset lighting",
    night: "during peaceful night hours with soft ambient lighting"
  };

  const emotionalMappings: Record<string, string> = {
    present_confident: "looking confident and content, with a warm smile and relaxed posture, her presence filling the space with positive energy",
    absent_contemplative: "appearing thoughtful and slightly distant, as if thinking about someone special, with a gentle expression and soft eyes",
    romantic_anticipation: "with a subtle blush and hopeful expression, looking as if she's waiting for someone important",
    professional_focused: "in her professional hunter mode, alert and composed, radiating competence and determination",
    peaceful_content: "completely at ease and peaceful, with a serene expression showing inner happiness",
    playful_teasing: "with a mischievous smile and playful glint in her eyes, showing her more lighthearted side"
  };

  const locationDesc = locationMappings[location] || "in a beautiful indoor setting";
  const timeDesc = timeOfDayMappings[timeOfDay] || "with beautiful lighting";
  const emotionDesc = emotionalMappings[emotion] || "with a gentle, warm expression";

  return `${baseCharacterDescription} ${emotionDesc}, positioned ${locationDesc} ${timeDesc}. High quality anime art style, detailed facial features, atmospheric lighting, cinematic composition, masterpiece quality. Focus on her emotional expression and the romantic atmosphere of the scene.`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get or create game state
  app.get("/api/game-state/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      let gameState = await storage.getGameState(sessionId);
      
      if (!gameState) {
        // Create new game state for new players
        gameState = await storage.createGameState({
          sessionId,
          narration: "Welcome to your romantic adventure with Cha Hae-In! She greets you with a warm smile.",
          choices: [
            { id: "greet", icon: "👋", text: "Greet Cha Hae-In warmly" },
            { id: "compliment", icon: "💝", text: "Compliment her appearance" },
            { id: "daily_life", icon: "🏠", text: "Open Daily Life Hub" }
          ]
        });
      }
      
      res.json(gameState);
    } catch (error) {
      log(`Error getting game state: ${error}`);
      res.status(500).json({ error: "Failed to get game state" });
    }
  });

  // Save game state progress
  app.post("/api/save-progress", async (req, res) => {
    try {
      const { sessionId, updates } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      
      const gameState = await storage.updateGameState(sessionId, updates);
      res.json(gameState);
    } catch (error) {
      log(`Error saving progress: ${error}`);
      res.status(500).json({ error: "Failed to save progress" });
    }
  });

  // Process player choice
  app.post("/api/make-choice", async (req, res) => {
    try {
      const { sessionId, choice } = MakeChoiceSchema.parse(req.body);
      
      const gameState = await storage.processChoice(sessionId, choice);
      
      // Generate AI image for the new scene with fallback
      let imageUrl = null;
      try {
        imageUrl = await generateSceneImage(gameState);
        if (!imageUrl) {
          imageUrl = getSceneImage(gameState);
        }
        
        if (imageUrl) {
          const updatedGameState = await storage.updateGameState(sessionId, {
            sceneData: { ...gameState.sceneData, imageUrl, runes: [], particles: [] }
          });
          return res.json({ ...updatedGameState, imageUrl });
        }
      } catch (error) {
        console.error("Scene image generation error:", error);
        // Use fallback image
        imageUrl = getSceneImage(gameState);
      }
      

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request format", 
          details: error.errors 
        });
      }
      
      log(`Error processing choice: ${error}`);
      res.status(500).json({ error: "Failed to process choice" });
    }
  });

  // Character progression endpoints
  app.post("/api/level-up/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const gameState = await storage.levelUp(sessionId);
      res.json(gameState);
    } catch (error) {
      log(`Error leveling up: ${error}`);
      res.status(500).json({ error: "Failed to level up" });
    }
  });

  app.post("/api/upgrade-skill/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { skillId } = req.body;
      const gameState = await storage.upgradeSkill(sessionId, skillId);
      res.json(gameState);
    } catch (error) {
      log(`Error upgrading skill: ${error}`);
      res.status(500).json({ error: "Failed to upgrade skill" });
    }
  });

  app.post("/api/allocate-stat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { stat } = req.body;
      const gameState = await storage.allocateStatPoint(sessionId, stat);
      res.json(gameState);
    } catch (error) {
      log(`Error allocating stat: ${error}`);
      res.status(500).json({ error: "Failed to allocate stat point" });
    }
  });

  // Image generation endpoints
  app.post("/api/generate-scene-image", async (req, res) => {
    try {
      const { prompt, gameState, location, timeOfDay } = req.body;
      
      // Handle location-specific image generation
      if (location && timeOfDay) {
        const imageUrl = await generateLocationSceneImage(location, timeOfDay);
        return res.json({ imageUrl });
      }
      
      // Accept either prompt or gameState format for existing functionality
      if (!prompt && !gameState) {
        return res.status(400).json({ error: "Prompt, gameState, or location parameters are required" });
      }
      
      // If gameState is provided, use it directly with proper structure
      if (gameState) {
        const enhancedGameState = {
          ...gameState,
          narration: gameState.narration || "Shadow Monarch in Solo Leveling universe",
          currentScene: gameState.currentScene || "romantic",
          storyPath: gameState.storyPath || "romance_path",
          level: gameState.level || 1,
          affectionLevel: gameState.affectionLevel || 50
        };
        const imageUrl = await generateSceneImage(enhancedGameState);
        return res.json({ imageUrl });
      }

      // Create a complete GameState object for the image generator
      const mockGameState = {
        id: 1,
        sessionId: "solo-leveling",
        narration: prompt,
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        level: 1,
        experience: 0,
        statPoints: 0,
        skillPoints: 0,
        gold: 100,
        affectionLevel: 50,
        energy: 100,
        maxEnergy: 100,
        relationshipStatus: "dating",
        intimacyLevel: 1,
        sharedMemories: 0,
        livingTogether: 0,
        daysTogether: 1,
        currentScene: "romantic",
        choices: [],
        sceneData: null,
        storyPath: gameState?.storyPath || "romantic",
        choiceHistory: [],
        storyFlags: {},
        inventory: [],
        stats: {
          strength: 10,
          agility: 10,
          intelligence: 10,
          vitality: 10,
          sense: 10
        },
        skills: []
      };

      // Use the existing dual-generator system
      const imageUrl = await generateSceneImage(mockGameState);
      
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "Failed to generate scene image" });
      }
    } catch (error) {
      console.error(`Failed to generate scene image: ${error}`);
      res.status(500).json({ error: "Failed to generate scene image" });
    }
  });

  app.post("/api/generate-intimate-image", async (req, res) => {
    try {
      const { activityId, relationshipStatus, intimacyLevel } = req.body;
      
      if (!activityId || !relationshipStatus || intimacyLevel === undefined) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const imageUrl = await generateIntimateActivityImage(activityId, relationshipStatus, intimacyLevel);
      
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "Failed to generate intimate image" });
      }
    } catch (error) {
      console.error(`Failed to generate intimate image: ${error}`);
      res.status(500).json({ error: "Failed to generate intimate image" });
    }
  });

  // Generate location scene images for WorldMap
  app.post("/api/generate-scene-image", async (req, res) => {
    try {
      const { location, timeOfDay } = req.body;
      
      if (!location || !timeOfDay) {
        return res.status(400).json({ error: "Missing required parameters: location, timeOfDay" });
      }

      // Check cache first for instant response
      const cachedImage = getCachedLocationImage(location, timeOfDay);
      if (cachedImage) {
        console.log(`📸 Using cached image for location: ${location} at ${timeOfDay}`);
        return res.json({ imageUrl: cachedImage });
      }

      console.log(`🏙️ Generating location scene: ${location} during ${timeOfDay}`);
      
      const imageUrl = await generateLocationSceneImage(location, timeOfDay);
      
      if (imageUrl) {
        // Cache the newly generated image
        cacheLocationImage(location, timeOfDay, imageUrl);
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "Failed to generate location scene image" });
      }
    } catch (error) {
      console.error(`Failed to generate location scene: ${error}`);
      res.status(500).json({ error: "Failed to generate location scene image" });
    }
  });

  // Cache status endpoint for monitoring preload progress
  app.get("/api/cache-status", (req, res) => {
    const stats = getCacheStats();
    res.json({
      ...stats,
      isComplete: stats.percentage === 100
    });
  });

  // Generate emotional scene images of Cha Hae-In for location cards
  app.get("/api/chat-scene-image", async (req, res) => {
    try {
      const { emotion, location, timeOfDay } = req.query;
      
      if (!emotion || !location || !timeOfDay) {
        return res.status(400).json({ error: "Missing required parameters: emotion, location, timeOfDay" });
      }

      console.log(`🎭 Generating emotional scene for Cha Hae-In: ${emotion} at ${location} during ${timeOfDay}`);

      // Create emotional prompt for Cha Hae-In
      const emotionalPrompt = createChaHaeInEmotionalPrompt(emotion as string, location as string, timeOfDay as string);
      
      // Use Google Imagen for character generation
      const { generateChatSceneImage } = await import("./imageGenerator");
      const imageUrl = await generateChatSceneImage(emotionalPrompt, "character_portrait");
      
      if (imageUrl) {
        console.log(`✅ Generated emotional scene successfully`);
        res.json({ imageUrl });
      } else {
        console.error("No image URL returned from Google Imagen");
        res.status(500).json({ error: "Failed to generate emotional scene" });
      }
    } catch (error: any) {
      console.error("Google Imagen API error:", error.message);
      res.status(500).json({ error: "Image generation failed" });
    }
  });

  // Additional core gameplay endpoints
  
  // Chat endpoint with proper AI integration
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, gameState, context } = req.body;
      
      // Import personality system
      const { getPersonalityPrompt } = await import('./chaHaeInPersonality.js');
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      });

      // Create conversation context for personality system
      const conversationContext = {
        affectionLevel: Math.floor((gameState.affection || 25) / 20), // Convert 0-100 to 0-5 scale
        currentScene: context?.location || 'hunter_association',
        timeOfDay: (context?.timeOfDay || 'afternoon') as 'morning' | 'afternoon' | 'evening' | 'night',
        recentActivity: context?.activity,
        mood: 'focused' as 'confident' | 'playful' | 'vulnerable' | 'focused' | 'romantic' | 'disappointed' | 'hurt' | 'defensive',
        userBehavior: 'positive' as 'positive' | 'neutral' | 'rude' | 'mean'
      };

      const personalityPrompt = getPersonalityPrompt(conversationContext);
      
      const fullPrompt = `${personalityPrompt}

CURRENT SITUATION:
- Location: ${context?.location || 'Hunter Association'}
- Time: ${context?.timeOfDay || 'afternoon'}
- Activity: ${context?.activity || 'working on reports'}
- Weather: ${context?.weather || 'clear'}

Jin-Woo just said: "${message}"

RESPONSE INSTRUCTIONS:
- Respond naturally as Cha Hae-In in character
- Reference the current location and situation
- Show appropriate emotional reactions based on affection level
- Keep response conversational and under 100 words
- Use "Jin-Woo" when addressing him directly
- Show your hunter expertise when relevant
- Express growing feelings if affection is high enough`;
      
      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();
      
      // Determine emotional state for avatar update
      let newExpression = 'focused';
      if (response.toLowerCase().includes('smile') || response.toLowerCase().includes('happy')) {
        newExpression = 'welcoming';
      } else if (response.toLowerCase().includes('blush') || response.toLowerCase().includes('heart')) {
        newExpression = 'romantic';
      }
      
      let audioUrl = null;
      try {
        const audioBuffer = await voiceService.generateChaHaeInVoice(response);
        if (audioBuffer) {
          audioUrl = `data:audio/wav;base64,${audioBuffer.toString('base64')}`;
        }
      } catch (error) {
        console.log("Voice generation failed:", error);
      }
      
      res.json({ 
        response, 
        audioUrl,
        expression: newExpression,
        gameState: {
          ...gameState,
          affection: Math.min(100, (gameState.affection || 25) + 1)
        }
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Scene image generation
  app.post("/api/generate-scene-image", async (req, res) => {
    try {
      const { gameState } = req.body;
      
      if (!gameState) {
        return res.status(400).json({ error: "Game state is required" });
      }
      
      const imageUrl = await generateSceneImage(gameState);
      res.json({ imageUrl });
    } catch (error) {
      console.error("Scene image generation error:", error);
      res.status(500).json({ error: "Failed to generate scene image" });
    }
  });

  // Intimate activities
  app.post("/api/intimate-action", async (req, res) => {
    try {
      const { gameState, action, activityType, isCustom } = req.body;
      
      const response = `*Cha Hae-In responds warmly to your ${action}* That feels wonderful, Jin-Woo... I love being close to you like this.`;
      
      let imageUrl = null;
      try {
        imageUrl = await generateIntimateActivityImage(
          activityType,
          'married',
          gameState.intimacyLevel || 0,
          action
        );
      } catch (error) {
        console.log("Image generation failed:", error);
      }
      
      let audioUrl = null;
      try {
        const audioBuffer = await voiceService.generateChaHaeInVoice(response);
        if (audioBuffer) {
          audioUrl = `data:audio/wav;base64,${audioBuffer.toString('base64')}`;
        }
      } catch (error) {
        console.log("Voice generation failed:", error);
      }
      
      const gameStateUpdate = {
        affection: Math.min(100, gameState.affection + 3),
        intimacyLevel: Math.min(100, (gameState.intimacyLevel || 0) + 2),
        energy: Math.max(0, (gameState.energy || 100) - 10)
      };
      
      res.json({ response, imageUrl, audioUrl, gameStateUpdate });
    } catch (error) {
      console.error("Intimate action error:", error);
      res.status(500).json({ error: "Failed to process intimate action" });
    }
  });

  // Inventory system
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = [
        {
          id: 'demon_sword',
          name: 'Demon Monarch\'s Blade',
          type: 'weapon',
          rarity: 'legendary',
          attack: 150,
          description: 'A legendary sword forged from shadow energy'
        },
        {
          id: 'shadow_armor',
          name: 'Shadow Sovereign Armor',
          type: 'armor',
          rarity: 'epic',
          defense: 120,
          description: 'Armor that phases between dimensions'
        },
        {
          id: 'monarch_ring',
          name: 'Ring of the Shadow Monarch',
          type: 'accessory',
          rarity: 'legendary',
          mana: 100,
          description: 'Increases shadow magic power'
        }
      ];
      
      res.json({ inventory });
    } catch (error) {
      console.error("Inventory error:", error);
      res.status(500).json({ error: "Failed to get inventory" });
    }
  });

  // Equipment management
  app.post("/api/equip-item", async (req, res) => {
    try {
      const { gameState, item } = req.body;
      
      const gameStateUpdate = {
        ...gameState,
        equipment: {
          ...gameState.equipment,
          [item.type]: item
        }
      };
      
      res.json({ gameStateUpdate });
    } catch (error) {
      console.error("Equipment error:", error);
      res.status(500).json({ error: "Failed to equip item" });
    }
  });

  // Raid system
  app.post("/api/start-raid", async (req, res) => {
    try {
      const { gameState, raidType } = req.body;
      
      const raids = {
        shadow_dungeon: {
          name: 'Shadow Realm Dungeon',
          description: 'A dangerous dungeon filled with shadow creatures',
          energyCost: 30,
          rewards: {
            experience: 500,
            gold: 300,
            items: ['shadow_crystal', 'dark_essence']
          }
        },
        ice_cavern: {
          name: 'Frozen Cavern',
          description: 'An icy dungeon where you first met Cha Hae-In',
          energyCost: 25,
          rewards: {
            experience: 400,
            gold: 250,
            affection: 5
          }
        }
      };
      
      const raid = raids[raidType as keyof typeof raids];
      if (!raid) {
        return res.status(400).json({ error: "Invalid raid type" });
      }
      
      const gameStateUpdate = {
        energy: Math.max(0, (gameState.energy || 100) - raid.energyCost),
        experience: (gameState.experience || 0) + raid.rewards.experience,
        gold: (gameState.gold || 0) + raid.rewards.gold,
        affection: Math.min(100, gameState.affection + ((raid.rewards as any).affection || 0))
      };
      
      const narrative = `You and Cha Hae-In successfully cleared the ${raid.name}! Working together, you defeated all the monsters and grew closer as a team.`;
      
      res.json({ 
        gameStateUpdate, 
        narrative,
        rewards: raid.rewards
      });
    } catch (error) {
      console.error("Raid error:", error);
      res.status(500).json({ error: "Failed to start raid" });
    }
  });

  // Energy replenishment
  app.post("/api/replenish-energy", async (req, res) => {
    try {
      const { gameState, method, amount } = req.body;
      
      let energyGain = 0;
      let cost = 0;
      
      switch (method) {
        case 'rest':
          energyGain = 25;
          break;
        case 'full_rest':
          energyGain = 100;
          break;
        case 'energy_potion':
          energyGain = 50;
          cost = 100;
          break;
        case 'premium_rest':
          energyGain = 75;
          cost = 200;
          break;
        default:
          energyGain = amount || 25;
      }
      
      const gameStateUpdate = {
        energy: Math.min(gameState.maxEnergy || 100, (gameState.energy || 0) + energyGain),
        gold: Math.max(0, (gameState.gold || 0) - cost)
      };
      
      res.json({ gameStateUpdate, energyGain });
    } catch (error) {
      console.error("Energy replenishment error:", error);
      res.status(500).json({ error: "Failed to replenish energy" });
    }
  });

  const server = createServer(app);
  return server;
}