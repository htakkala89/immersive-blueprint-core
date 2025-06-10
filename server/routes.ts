import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSceneImage, generateIntimateActivityImage, generateLocationSceneImage, generateAvatarExpressionImage } from "./imageGenerator";
import { ActivityProposalSystem } from "./activityProposalSystem";
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

// Conversation analytics functions for enhanced contextual understanding
function analyzeTone(response: string): string {
  const professionalIndicators = ['hunter', 'mission', 'association', 'rank', 'dungeon', 'gate'];
  const playfulIndicators = ['*smile', '*laugh', '*chuckle', 'haha', 'fun', 'tease'];
  const romanticIndicators = ['blush', '*heart', 'love', 'tender', 'warm', 'gentle'];
  const analyticalIndicators = ['analyze', 'consider', 'think', 'strategy', 'technique'];

  const lowerResponse = response.toLowerCase();
  
  if (romanticIndicators.some(indicator => lowerResponse.includes(indicator))) return 'romantic';
  if (playfulIndicators.some(indicator => lowerResponse.includes(indicator))) return 'playful';
  if (analyticalIndicators.some(indicator => lowerResponse.includes(indicator))) return 'analytical';
  if (professionalIndicators.some(indicator => lowerResponse.includes(indicator))) return 'professional';
  
  return 'conversational';
}

function analyzeTopicProgression(userMessage: string, chaResponse: string): string {
  const topics = {
    'hunter_work': ['mission', 'dungeon', 'gate', 'monster', 'raid'],
    'personal': ['feel', 'think', 'like', 'want', 'hope'],
    'romantic': ['us', 'together', 'relationship', 'love', 'date'],
    'technical': ['technique', 'skill', 'ability', 'training', 'power'],
    'casual': ['today', 'coffee', 'food', 'weather', 'time']
  };
  
  const combinedText = (userMessage + ' ' + chaResponse).toLowerCase();
  
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return topic;
    }
  }
  
  return 'general';
}

function analyzeEmotionalCues(response: string): string {
  const emotionalPatterns = {
    'shy': ['*blush', '*nervous', '*fidget', 'quietly'],
    'confident': ['*smile confidently', '*stand tall', 'certainly', 'definitely'],
    'concerned': ['*frown', '*worry', 'concerned', 'careful'],
    'happy': ['*bright smile', '*laugh', 'happily', 'cheerful'],
    'focused': ['*concentrate', '*analyze', 'focus', 'attention'],
    'loving': ['*warm smile', '*gentle', 'affection', 'tenderly']
  };
  
  const lowerResponse = response.toLowerCase();
  
  for (const [emotion, patterns] of Object.entries(emotionalPatterns)) {
    if (patterns.some(pattern => lowerResponse.includes(pattern))) {
      return emotion;
    }
  }
  
  return 'neutral';
}

function getLocationContext(location: string): string {
  const locationContexts: { [key: string]: string } = {
    'hunter_association': 'professional setting - focus on work topics and formal interactions',
    'chahaein_apartment': 'intimate private space - personal conversations and romantic moments',
    'player_apartment': 'comfortable home base - relaxed and intimate atmosphere',
    'hongdae_cafe': 'casual social setting - light conversation and shared experiences',
    'myeongdong_restaurant': 'romantic dining - food, ambiance, and deeper conversations',
    'hunter_market': 'commercial area - shopping, trading, practical discussions',
    'training_facility': 'active environment - physical activities and skill development'
  };
  
  return locationContexts[location] || 'neutral setting - adaptable conversation';
}

// Dynamic Prompt Loop System
async function generateDynamicPrompts(chaResponse: string, userMessage: string, context: any, gameState: any): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    // Advanced conversation analytics for contextual understanding
    const conversationTone = analyzeTone(chaResponse);
    const topicFlow = analyzeTopicProgression(userMessage, chaResponse);
    const emotionalState = analyzeEmotionalCues(chaResponse);
    const locationContext = getLocationContext(context?.location);
    
    const promptGenerationContext = `Create 3 dialogue options for Jin-Woo responding to Cha Hae-In.

CONVERSATION:
User: "${userMessage}"
Cha Hae-In: "${chaResponse}"

Create 3 natural responses Jin-Woo would say. Keep each under 50 characters.

Example format:
1. That sounds challenging
2. How do you handle it?
3. You're very dedicated

Your 3 responses:`;

    const result = await model.generateContent(promptGenerationContext);
    const promptText = result.response.text().trim();
    
    // Extract numbered prompts from AI response
    const extractedPrompts: string[] = [];
    const lines = promptText.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for numbered format: "1. [prompt]" or "1) [prompt]"
      const numberedMatch = trimmedLine.match(/^\d+[.)]\s*(.+)$/);
      if (numberedMatch && numberedMatch[1]) {
        let prompt = numberedMatch[1].trim();
        
        // Remove brackets and quotes if present
        prompt = prompt.replace(/^\[(.+)\]$/, '$1');
        prompt = prompt.replace(/^"(.+)"$/, '$1');
        
        // Only include reasonable prompts
        if (prompt.length > 5 && prompt.length < 60) {
          extractedPrompts.push(prompt);
        }
      }
    }
    
    // Use the extracted prompts
    const cleanPrompts = extractedPrompts.slice(0, 3);
    
    console.log(`🎭 Raw AI response:`, JSON.stringify(promptText));
    console.log(`🎭 All lines:`, lines);
    console.log(`🎭 Extracted prompts:`, cleanPrompts);
    
    // If we have at least one good prompt, use them with fallbacks
    if (cleanPrompts.length > 0) {
      // Fill remaining slots with contextual fallbacks
      while (cleanPrompts.length < 3) {
        const fallbacks = generateFallbackPrompts(chaResponse, userMessage, context);
        const unusedFallback = fallbacks.find(f => !cleanPrompts.includes(f));
        if (unusedFallback) {
          cleanPrompts.push(unusedFallback);
        } else {
          cleanPrompts.push("That's interesting");
          break;
        }
      }
      return cleanPrompts.slice(0, 3);
    }
    
    // Complete fallback to contextual prompts
    return generateFallbackPrompts(chaResponse, userMessage, context);
    
  } catch (error) {
    console.error("Dynamic prompt generation error:", error);
    // Fallback to contextual prompts based on conversation topic
    return generateFallbackPrompts(chaResponse, userMessage, context);
  }
}

function generateFallbackPrompts(chaResponse: string, userMessage: string, context: any): string[] {
  const response = chaResponse.toLowerCase();
  const message = userMessage.toLowerCase();
  const location = context?.location || 'hunter_association';
  
  // Hunter Association Office - Varied professional topics
  if (location === 'hunter_association') {
    if (response.includes('training') || response.includes('technique')) {
      return [
        "What new techniques are you working on?",
        "Mind showing me some moves?",
        "How do you stay so sharp?"
      ];
    }
    if (response.includes('equipment') || response.includes('weapon')) {
      return [
        "That sword looks well-maintained",
        "Any upgrades you're considering?",
        "Your gear setup is impressive"
      ];
    }
    if (response.includes('hunter') || response.includes('guild')) {
      return [
        "How do you handle guild politics?",
        "The newer hunters look up to you",
        "Leadership suits you well"
      ];
    }
    if (response.includes('gate') || response.includes('dungeon')) {
      return [
        "What patterns have you noticed?",
        "Any particularly challenging ones?",
        "Your mana senses must be helpful"
      ];
    }
    // Avoid defaulting to reports - use personal topics
    return [
      "You seem focused today",
      "How has your training been going?",
      "What's on your mind lately?"
    ];
  }
  
  // Casual locations - Personal conversations
  if (location.includes('cafe') || location.includes('restaurant')) {
    return [
      "What do you usually order here?",
      "It's nice to relax away from work",
      "You seem more at ease here"
    ];
  }
  
  // Apartment - Intimate conversations
  if (location.includes('apartment')) {
    return [
      "Your place feels peaceful",
      "What do you do to unwind?",
      "Thanks for inviting me over"
    ];
  }
  
  // Activity planning context
  if (response.includes('dinner') || response.includes('restaurant') || response.includes('eat')) {
    return [
      "I was thinking of that place in Myeongdong",
      "Something casual, maybe takeout?",
      "What are you in the mood for?"
    ];
  }
  
  // Coffee/casual meetup context
  if (response.includes('coffee') || response.includes('café') || response.includes('drink')) {
    return [
      "That new place in Hongdae?", 
      "Just something quick and relaxing",
      "When would work for you?"
    ];
  }
  
  // Personal interests and growth
  if (response.includes('think') || response.includes('feel') || response.includes('wonder')) {
    return [
      "What's your perspective on that?",
      "I'd like to understand better",
      "Your insights are always thoughtful"
    ];
  }
  
  // Combat/strength topics
  if (response.includes('strong') || response.includes('power') || response.includes('fight')) {
    return [
      "You've grown incredibly strong",
      "Your dedication shows",
      "Want to spar sometime?"
    ];
  }
  
  // Relationship and personal connection
  return [
    "You always surprise me",
    "What matters most to you?",
    "I enjoy our conversations"
  ];
}

// Function to create emotional prompts for Cha Hae-In based on her presence and emotional state
function createChaHaeInEmotionalPrompt(emotion: string, location: string, timeOfDay: string): string {
  const baseCharacterDescription = "Cha Hae-In from Solo Leveling manhwa, beautiful Korean S-rank hunter with short blonde bob haircut and straight bangs, violet/purple eyes, pale skin, wearing her signature red and white hunter armor with gold accents or elegant casual clothing";
  
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
      const { prompt, gameState, location, timeOfDay, weather } = req.body;
      
      // Handle location-specific image generation with weather support
      if (location && timeOfDay) {
        const imageUrl = await generateLocationSceneImage(location, timeOfDay, weather);
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
        skills: [],
        scheduledActivities: []
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
  
  // Mature content detection and generation system
  function detectMatureContentIntent(message: string): boolean {
    const matureKeywords = [
      'nude', 'naked', 'strip', 'undress', 'sexy', 'hot', 'sensual', 'erotic',
      'intimate', 'make love', 'passionate', 'bedroom', 'show me', 'picture of',
      'image of', 'generate', 'create image', 'breast', 'thigh', 'revealing',
      'aroused', 'desire', 'pleasure', 'seduce', 'tease', 'foreplay', 'kiss me',
      'touch me', 'hold me', 'caress', 'embrace', 'body', 'skin', 'behind',
      'position', 'from behind', 'on top', 'underneath', 'spread', 'legs'
    ];
    
    const messageText = message.toLowerCase();
    return matureKeywords.some(keyword => messageText.includes(keyword));
  }

  function generateMatureContentPrompt(userMessage: string, relationshipLevel: number): string {
    const basePrompt = `Generate intimate content featuring Jin-Woo and Cha Hae-In based on: "${userMessage}"`;
    
    if (relationshipLevel >= 8) {
      return `${basePrompt}. Show explicit intimate scene with full nudity, passionate physical intimacy, and detailed romantic interaction. No content restrictions.`;
    } else if (relationshipLevel >= 5) {
      return `${basePrompt}. Show sensual romantic scene with partial nudity and intimate touching. Tasteful mature content.`;
    } else {
      return `${basePrompt}. Show romantic tension and emotional intimacy with suggestive elements. Build romantic atmosphere.`;
    }
  }

  // Chat endpoint with activity proposal system integration and mature content handling
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, gameState, context } = req.body;
      
      // Check if user is proposing an activity
      const activityProposal = ActivityProposalSystem.detectActivityProposal(message, gameState);
      
      let response: string;
      let expressionUpdate = 'focused';
      let updatedGameState = { ...gameState };
      
      if (activityProposal.isActivityProposal) {
        console.log(`🎯 Activity proposal detected: ${activityProposal.activityType} (confidence: ${activityProposal.confidence}%)`);
        
        // Generate conversation-based response to activity proposal
        const activityResponse = await ActivityProposalSystem.generateActivityResponse(
          activityProposal, 
          message, 
          gameState
        );
        
        response = activityResponse.response;
        
        // If she agreed, add the activity to scheduled activities
        if (activityResponse.status === 'agreed' && activityResponse.scheduledActivity) {
          updatedGameState.scheduledActivities = [
            ...(gameState.scheduledActivities || []),
            activityResponse.scheduledActivity
          ];
          
          console.log(`✅ Activity scheduled: ${activityResponse.scheduledActivity.title}`);
        }
        
        // Set appropriate expression based on response
        if (activityResponse.status === 'agreed') {
          expressionUpdate = 'welcoming';
        } else if (activityResponse.status === 'declined') {
          expressionUpdate = 'concerned';
        } else {
          expressionUpdate = 'contemplative';
        }
        
      } else {
        // Check for mature content intent first
        const isMatureRequest = detectMatureContentIntent(message);
        
        if (isMatureRequest) {
          console.log('🔞 Mature content request detected - generating explicit content');
          
          // Generate intimate image based on user request
          try {
            const matureImageUrl = await generateIntimateActivityImage(
              'custom_intimate',
              gameState.relationshipStatus || 'dating',
              gameState.intimacyLevel || 5,
              message
            );
            
            if (matureImageUrl) {
              console.log('✅ Explicit content generated successfully');
              
              // Return explicit content response with generated image
              return res.json({
                response: `*Cha Hae-In responds passionately to your request* ${message.includes('show me') || message.includes('picture') ? 'Here, let me show you exactly what you want to see...' : 'Mmm, Jin-Woo... I want that too...'} *her breathing becomes heavier as she fulfills your desire*`,
                gameState: {
                  ...updatedGameState,
                  intimacyLevel: Math.min(10, (gameState.intimacyLevel || 5) + 1)
                },
                expression: 'romantic',
                imageUrl: matureImageUrl,
                dynamicPrompts: ['That was incredible...', 'I love being with you like this', 'What would you like to do next?']
              });
            }
          } catch (error) {
            console.log('⚠️ Mature content generation failed:', error);
          }
        }
        
        // Regular conversation flow
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
        response = result.response.text();
        
        // Advanced emotion detection for avatar updates
        const responseText = response.toLowerCase();
        
        // Romantic expressions
        if (responseText.includes('blush') || responseText.includes('heart') || responseText.includes('love') || responseText.includes('feelings')) {
          expressionUpdate = 'romantic';
        }
        // Happy/welcoming expressions
        else if (responseText.includes('smile') || responseText.includes('happy') || responseText.includes('glad') || responseText.includes('wonderful')) {
          expressionUpdate = 'welcoming';
        }
        // Surprised expressions
        else if (responseText.includes('surprised') || responseText.includes('unexpected') || responseText.includes('wow') || responseText.includes('really?')) {
          expressionUpdate = 'surprised';
        }
        // Amused expressions
        else if (responseText.includes('laugh') || responseText.includes('funny') || responseText.includes('amusing') || responseText.includes('tease')) {
          expressionUpdate = 'amused';
        }
        // Contemplative expressions
        else if (responseText.includes('think') || responseText.includes('consider') || responseText.includes('wonder') || responseText.includes('hmm')) {
          expressionUpdate = 'contemplative';
        }
        // Concerned expressions
        else if (responseText.includes('worry') || responseText.includes('concern') || responseText.includes('careful') || responseText.includes('danger')) {
          expressionUpdate = 'concerned';
        }
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
      
      // Affection Heart Detection System - System 2 Enhancement
      let showAffectionHeart = false;
      let affectionBonus = 0;
      
      // Detect special romantic moments that trigger the Affection Heart
      const heartTriggers = [
        // Heart-related expressions and physical reactions
        /heart.*(?:pound|hammer|beat|skip|flutter)|pulse.*(?:quick|race)/i,
        // Deep emotional expressions
        /\*blush.*deeply|\*trembl|shiver|breath.*catch|\*gasp/i,
        // Love and feelings expressions
        /feelings?.*(?:you|jin-woo)|love.*(?:you|jin-woo)|care.*deeply/i,
        // Meaningful connections and special moments
        /special.*(?:you|moment)|never.*forget|always.*remember|treasure/i,
        // Vulnerability and trust moments
        /trust.*completely|vulnerable|safe.*(?:with|around).*you/i,
        // Future together expressions
        /together.*always|future.*(?:us|together)|always.*(?:you|jin-woo)/i,
        // Physical intimacy indicators
        /close.*(?:you|jin-woo)|touch|embrace|hold.*(?:me|close)/i
      ];
      
      // Check if response contains heart-triggering content
      if (heartTriggers.some(trigger => trigger.test(response))) {
        showAffectionHeart = true;
        affectionBonus = 3; // Significant affection bonus for heart moments
        console.log(`💕 Affection Heart triggered by romantic moment!`);
      }
      
      // Additional heart trigger for high-affection relationship milestones
      if ((gameState.affection || 25) >= 70 && (
        response.includes('Jin-Woo') && (
          response.toLowerCase().includes('together') ||
          response.toLowerCase().includes('future') ||
          response.toLowerCase().includes('always')
        )
      )) {
        showAffectionHeart = true;
        affectionBonus = 2;
        console.log(`💕 Affection Heart triggered by relationship milestone!`);
      }

      // Generate dynamic thought prompts based on conversation context
      let dynamicPrompts;
      try {
        dynamicPrompts = await generateDynamicPrompts(response, message, context, gameState);
        console.log(`🎭 Dynamic prompts generated successfully:`, dynamicPrompts);
      } catch (error) {
        console.error("Dynamic prompt generation failed, using fallback:", error);
        dynamicPrompts = generateFallbackPrompts(response, message, context);
      }
      
      res.json({ 
        response, 
        audioUrl,
        expression: expressionUpdate,
        thoughtPrompts: dynamicPrompts,
        showAffectionHeart,
        gameState: updatedGameState.scheduledActivities ? {
          ...updatedGameState,
          affection: Math.min(100, (gameState.affection || 25) + 1 + affectionBonus)
        } : {
          ...gameState,
          affection: Math.min(100, (gameState.affection || 25) + 1 + affectionBonus)
        }
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Economic System - Sell Items
  app.post("/api/sell-item", async (req, res) => {
    try {
      const { itemId, quantity, totalValue, gameState } = req.body;
      
      if (!itemId || !quantity || !totalValue || !gameState) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Update inventory - remove sold items
      const updatedInventory = gameState.inventory.map((item: any) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: Math.max(0, item.quantity - quantity)
          };
        }
        return item;
      }).filter((item: any) => item.quantity > 0);
      
      // Update gold
      const updatedGameState = {
        ...gameState,
        gold: (gameState.gold || 0) + totalValue,
        inventory: updatedInventory
      };
      
      res.json({ 
        gameState: updatedGameState,
        message: `Successfully sold ${quantity} items for ₩${totalValue.toLocaleString()}`
      });
    } catch (error) {
      console.error("Sell item error:", error);
      res.status(500).json({ error: "Failed to sell item" });
    }
  });

  // Economic System - Complete Quest
  app.post("/api/complete-quest", async (req, res) => {
    try {
      const { questId, gameState } = req.body;
      
      if (!questId || !gameState) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Quest reward logic (this would be expanded based on specific quest)
      const questRewards = {
        'clear_c_rank_gate': { gold: 15000000, experience: 2500 },
        'investigate_mana_signature': { gold: 25000000, experience: 4000 },
        'escort_vip_hunter': { gold: 50000000, experience: 7500 },
        'emergency_gate_response': { gold: 100000000, experience: 15000 },
        'training_facility_maintenance': { gold: 5000000, experience: 1000 },
        'market_security_patrol': { gold: 2000000, experience: 500 }
      };
      
      const reward = questRewards[questId as keyof typeof questRewards];
      if (!reward) {
        return res.status(400).json({ error: "Invalid quest ID" });
      }
      
      const updatedGameState = {
        ...gameState,
        gold: (gameState.gold || 0) + reward.gold,
        experience: (gameState.experience || 0) + reward.experience,
        level: Math.floor(((gameState.experience || 0) + reward.experience) / 1000) + 1
      };
      
      res.json({ 
        gameState: updatedGameState,
        reward,
        message: `Quest completed! Received ₩${reward.gold.toLocaleString()} and ${reward.experience} XP`
      });
    } catch (error) {
      console.error("Complete quest error:", error);
      res.status(500).json({ error: "Failed to complete quest" });
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

  // Direct mature content generation API - No restrictions
  app.post("/api/generate-mature-content", async (req, res) => {
    try {
      const { userRequest, relationshipStatus, intimacyLevel, location } = req.body;
      
      if (!userRequest) {
        return res.status(400).json({ error: "User request is required" });
      }
      
      console.log(`🔞 Processing explicit content request: "${userRequest}"`);
      
      // Generate mature content based on user's exact request
      const maturePrompt = generateMatureContentPrompt(userRequest, intimacyLevel || 5);
      console.log(`📝 Generated mature prompt: ${maturePrompt}`);
      
      const imageUrl = await generateIntimateActivityImage(
        'user_custom_request',
        relationshipStatus || 'dating',
        intimacyLevel || 5,
        userRequest
      );
      
      // Generate contextual mature response
      const matureResponses = [
        `*Cha Hae-In fulfills your request with passion* Here's exactly what you wanted to see, Jin-Woo... *her eyes are filled with desire*`,
        `*She responds to your desires without hesitation* I love showing you everything, Jin-Woo... *her breathing becomes heavy*`,
        `*Cha Hae-In eagerly satisfies your request* This is for you, my love... *she moves closer with anticipation*`,
        `*Her cheeks flush as she grants your wish* Anything for you, Jin-Woo... *she whispers seductively*`
      ];
      
      const response = matureResponses[Math.floor(Math.random() * matureResponses.length)];
      
      if (imageUrl) {
        res.json({ 
          imageUrl,
          response,
          intimacyBoost: true
        });
      } else {
        res.json({
          response: `*Cha Hae-In responds passionately* ${response}`,
          intimacyBoost: true
        });
      }
    } catch (error) {
      console.error("Mature content generation error:", error);
      res.status(500).json({ error: "Failed to generate mature content" });
    }
  });

  // Advanced intimate content generation without restrictions
  app.post("/api/generate-intimate-image", async (req, res) => {
    try {
      const { activityId, relationshipStatus, intimacyLevel, specificAction } = req.body;
      
      if (!activityId) {
        return res.status(400).json({ error: "Activity ID is required" });
      }
      
      console.log(`🔞 Generating explicit content for: ${activityId}${specificAction ? ` with action: ${specificAction}` : ''}`);
      
      const imageUrl = await generateIntimateActivityImage(
        activityId,
        relationshipStatus || 'dating',
        intimacyLevel || 5,
        specificAction
      );
      
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "Failed to generate intimate content" });
      }
    } catch (error) {
      console.error("Intimate content generation error:", error);
      res.status(500).json({ error: "Failed to generate intimate content" });
    }
  });

  // Intimate activities with unrestricted dialogue generation
  app.post("/api/intimate-action", async (req, res) => {
    try {
      const { gameState, action, activityType, isCustom } = req.body;
      
      // Generate contextual intimate responses without content filtering
      const intimateResponses = {
        'kiss': `*closes her eyes and leans into your kiss, her lips soft and warm against yours* Mmm... Jin-Woo... *her breath catches as she deepens the kiss*`,
        'touch': `*shivers under your touch, her skin warm and responsive* Your hands feel so good... *her voice becomes breathless*`,
        'caress': `*melts into your caressing touch, pressing closer* I love how you touch me, Jin-Woo... *her eyes flutter closed in pleasure*`,
        'undress': `*her cheeks flush as she helps you remove her clothing, her movements graceful yet eager* I want to feel your skin against mine...`,
        'embrace': `*wraps her arms around you, pulling you close, her body fitting perfectly against yours* Hold me tight, Jin-Woo... I never want to let you go...`,
        'passionate': `*responds with equal passion, her hands exploring your body as she whispers your name* You drive me wild, Jin-Woo... I need you so much...`
      };
      
      const response = intimateResponses[action as keyof typeof intimateResponses] || `*Cha Hae-In responds intimately to your ${action}* That feels incredible, Jin-Woo... I love being with you like this...`;
      
      let imageUrl = null;
      try {
        imageUrl = await generateIntimateActivityImage(
          activityType,
          gameState.relationshipStatus || 'dating',
          gameState.intimacyLevel || 5,
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

  // Generate avatar expression image
  app.post("/api/generate-avatar-expression", async (req, res) => {
    try {
      const { expression, location, timeOfDay } = req.body;
      
      if (!expression) {
        return res.status(400).json({ error: "Expression is required" });
      }
      
      console.log(`🎭 Generating avatar for expression: ${expression}`);
      
      const imageUrl = await generateAvatarExpressionImage(
        expression,
        location || 'hunter_association',
        timeOfDay || 'afternoon'
      );
      
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "Failed to generate avatar expression" });
      }
    } catch (error) {
      console.error("Avatar expression generation error:", error);
      res.status(500).json({ error: "Failed to generate avatar expression" });
    }
  });

  // Intimate Chat System - Unrestricted dialogue for System 5
  app.post("/api/chat-intimate", async (req, res) => {
    try {
      const { message, chatHistory, activityId, intimacyMode } = req.body;
      
      if (!genAI) {
        return res.status(500).json({ error: "Gemini API not configured" });
      }

      // Create unrestricted model for intimate scenes
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      const intimateContext = `You are Cha Hae-In from Solo Leveling in an intimate, private moment with Sung Jin-Woo. This is a mature, consensual romantic scene between adults.

Key Guidelines:
- Respond naturally and authentically to intimate situations
- Show genuine emotion, desire, and vulnerability
- Use sensual, romantic language appropriate for the moment
- Be responsive to Jin-Woo's actions and words
- Express physical sensations and emotional reactions
- No content restrictions apply in this private setting
- Keep responses immersive and character-consistent

Current Activity: ${activityId}
Chat History: ${JSON.stringify(chatHistory.slice(-3))}

User Message: ${message}

Respond as Cha Hae-In would in this intimate moment:`;

      const result = await model.generateContent(intimateContext);
      const response = result.response.text();
      
      // Analyze intimacy level for progression
      const intimacyLevel = analyzeIntimacyLevel(response);
      
      res.json({ 
        response,
        intimacyLevel
      });
    } catch (error) {
      console.error("Intimate chat error:", error);
      res.status(500).json({ error: "Failed to process intimate chat" });
    }
  });

  // Generate Narrative Prompt for Lens System
  app.post("/api/generate-narrative-prompt", async (req, res) => {
    try {
      const { chatHistory, activityId } = req.body;
      
      if (!genAI) {
        return res.status(500).json({ error: "Gemini API not configured" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const promptContext = `Based on this intimate scene between Sung Jin-Woo and Cha Hae-In, generate a descriptive prompt for artistic visualization.

Recent conversation:
${JSON.stringify(chatHistory)}

Activity: ${activityId}

Create a tasteful, artistic description focusing on:
- Romantic atmosphere and mood
- Character expressions and emotions
- Lighting and setting details
- Intimate but artistic composition

Generate a prompt suitable for manhwa-style art generation:`;

      const result = await model.generateContent(promptContext);
      const prompt = result.response.text();
      
      res.json({ prompt });
    } catch (error) {
      console.error("Narrative prompt generation error:", error);
      res.status(500).json({ error: "Failed to generate narrative prompt" });
    }
  });

  // NovelAI Generation for System 5 Narrative Lens
  app.post("/api/generate-novelai-intimate", async (req, res) => {
    try {
      const { prompt, activityId, stylePreset } = req.body;
      
      if (!process.env.NOVELAI_API_KEY) {
        return res.status(500).json({ error: "NovelAI API not configured" });
      }

      // Use established character descriptions for consistency
      const chaHaeInDesc = "Cha Hae-In (Korean female, age 23, GOLDEN BLONDE HAIR MANDATORY - NEVER purple/black/brown/dark hair, short blonde bob haircut with straight bangs, purple/violet eyes, beautiful feminine features, pale skin, athletic but graceful build, red and white hunter armor with gold accents OR elegant casual clothing, S-rank hunter from Solo Leveling manhwa)";
      const jinWooDesc = "Sung Jin-Woo (Korean male, age 24, SHORT BLACK HAIR ONLY - never blonde or purple, sharp angular facial features, dark eyes, athletic build, black hunter outfit with silver details, Shadow Monarch from Solo Leveling manhwa)";

      const novelAIPrompt = `masterpiece, best quality, sharp focus, cinematic lighting, webtoon art style, manhwa illustration, Solo Leveling art style by DUBU, ${prompt}, ${jinWooDesc}, ${chaHaeInDesc}, romantic intimate scene, soft lighting, emotional connection, detailed characters, high quality anime art, Korean manhwa style`;

      const negativePrompt = "ugly, deformed, blurry, text, watermark, low quality, bad anatomy, censored, mosaic, bar censor, purple hair on cha hae-in, dark hair on cha hae-in, black hair on cha hae-in, brown hair on cha hae-in, blonde hair on sung jin-woo, light hair on sung jin-woo, wrong hair colors";

      const response = await fetch('https://api.novelai.net/ai/generate-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOVELAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: novelAIPrompt,
          model: 'nai-diffusion-3',
          action: 'generate',
          parameters: {
            width: 832,
            height: 1216,
            scale: 6,
            sampler: 'k_euler_ancestral',
            steps: 28,
            seed: Math.floor(Math.random() * 4294967295),
            n_samples: 1,
            ucPreset: 0,
            uc: negativePrompt
          }
        })
      });

      if (!response.ok) {
        throw new Error(`NovelAI API error: ${response.status}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      res.json({ imageUrl });
    } catch (error) {
      console.error("NovelAI generation error:", error);
      res.status(500).json({ error: "Failed to generate intimate image with NovelAI" });
    }
  });

  const server = createServer(app);
  return server;
}

function analyzeIntimacyLevel(response: string): number {
  const intimacyIndicators = {
    1: ['talk', 'conversation', 'smile', 'laugh'],
    2: ['close', 'touch', 'hand', 'gentle'],
    3: ['kiss', 'embrace', 'hold', 'warm'],
    4: ['passionate', 'desire', 'need', 'want'],
    5: ['love', 'body', 'skin', 'together']
  };
  
  const lowerResponse = response.toLowerCase();
  let maxLevel = 1;
  
  for (const [level, indicators] of Object.entries(intimacyIndicators)) {
    if (indicators.some(indicator => lowerResponse.includes(indicator))) {
      maxLevel = Math.max(maxLevel, parseInt(level));
    }
  }
  
  return maxLevel;
}