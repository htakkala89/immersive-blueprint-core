import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSceneImage, generateIntimateActivityImage, generateLocationSceneImage, generateAvatarExpressionImage } from "./imageGenerator";
import { imageGenerationService } from "./imageProviders";
import { ActivityProposalSystem } from "./activityProposalSystem";
import { getCachedLocationImage, cacheLocationImage, preloadLocationImages, getCacheStats } from "./imagePreloader";
import { getSceneImage } from "./preGeneratedImages";
import { voiceService } from "./voiceService";
import { log } from "./vite";
import { z } from "zod";
import OpenAI from "openai";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { narrativeEngine, type StoryMemory } from "./narrativeEngine";
import { artisticPromptEngine } from "./artisticPromptEngine";
import { qualityEnhancer } from "./qualityEnhancer";
import { narrativeArchitect } from "./narrative-architect-api";
import { episodeEngine } from "./episodeEngine";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { db } from "./db";
import { playerProfiles, gameStates, episodeProgress, insertPlayerProfileSchema, insertGameStateSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

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
    
    const location = context?.location || 'hunter_association';
    const affectionLevel = context?.affectionLevel || 0;
    const timeOfDay = context?.timeOfDay || 'day';
    
    // Create location-specific context for AI prompt generation
    let locationContextPrompt = '';
    if (location === 'player_apartment' || location === 'chahaein_apartment') {
      locationContextPrompt = `SETTING: Private apartment setting at ${timeOfDay}. This is an intimate, personal space where conversations should be romantic, caring, and emotionally vulnerable. Affection level: ${affectionLevel}/100.`;
    } else if (location === 'hunter_association') {
      locationContextPrompt = `SETTING: Professional Hunter Association headquarters. Conversations should be professional but can include personal warmth given their close relationship.`;
    } else {
      locationContextPrompt = `SETTING: Casual social location (${location}). Conversations should be relaxed and personal.`;
    }

    const promptGenerationContext = `Create 3 dialogue options for Jin-Woo responding to Cha Hae-In.

${locationContextPrompt}

CONVERSATION:
User: "${userMessage}"
Cha Hae-In: "${chaResponse}"

Create 3 natural responses Jin-Woo would say that fit the setting. Keep each under 50 characters.

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
  const affectionLevel = context?.affectionLevel || 0;
  const timeOfDay = context?.timeOfDay || 'day';
  const completedEpisodes = context?.completedEpisodes || [];
  const sharedMemories = context?.sharedMemories || [];

  // Episode-driven conversation priorities
  // Check for episode-specific memory callbacks first
  if (completedEpisodes.includes('EP_TEST_CAFE_DATE') && location === 'hongdae_cafe') {
    return [
      "Remember our last conversation here? I still think about what you said.",
      "This place holds special memories for us now.",
      "I'm glad we can share quiet moments like this together."
    ];
  }

  // Episode availability hints based on progression
  if (location === 'hongdae_cafe' && affectionLevel >= 0 && !completedEpisodes.includes('EP_TEST_CAFE_DATE')) {
    return [
      "I was hoping we could sit and talk properly sometime.",
      "There's something peaceful about this place, don't you think?",
      "Coffee dates like this... they matter more than you might realize."
    ];
  }

  // Story progression hints based on relationship level
  if (affectionLevel >= 20 && affectionLevel < 40) {
    return [
      "I've been thinking about how much we've grown closer lately.",
      "There are things I want to share with you... when the time is right.",
      "Do you ever wonder where this path we're on will lead us?"
    ];
  }

  if (affectionLevel >= 40 && affectionLevel < 70) {
    return [
      "I trust you more than anyone else, Jin-Woo.",
      "Sometimes I catch myself thinking about our future together.",
      "You've become so important to me... more than I expected."
    ];
  }
  
  // Player Apartment - Intimate, romantic setting
  if (location === 'player_apartment') {
    if (response.includes('comfortable') || response.includes('cozy')) {
      return [
        "I love having you here with me",
        "You make this place feel like home",
        "*I pull you closer on the couch*"
      ];
    }
    if (response.includes('tired') || response.includes('relax')) {
      return [
        "Let me take care of you tonight",
        "*I massage your shoulders gently*",
        "You can rest here as long as you want"
      ];
    }
    if (response.includes('beautiful') || response.includes('gorgeous')) {
      return [
        "*I brush a strand of hair from your face*",
        "You're breathtaking in this light",
        "*I lean in to kiss you softly*"
      ];
    }
    if (timeOfDay === 'night' && affectionLevel >= 70) {
      return [
        "Stay the night with me",
        "*I hold your hand tenderly*",
        "I never want this moment to end"
      ];
    }
    // Default intimate apartment prompts
    return [
      "I'm so glad you're here",
      "*I caress your cheek gently*",
      "You mean everything to me"
    ];
  }
  
  // Cha Hae-In's Apartment - Personal, romantic
  if (location === 'chahaein_apartment') {
    if (response.includes('home') || response.includes('private')) {
      return [
        "Thank you for letting me into your world",
        "Your place reflects who you are",
        "*I admire how you've made this yours*"
      ];
    }
    if (response.includes('intimate') || response.includes('close')) {
      return [
        "*I move closer to you*",
        "Being here with you feels so right",
        "*I take your hand in mine*"
      ];
    }
    return [
      "Your home is as beautiful as you are",
      "*I look into your eyes lovingly*",
      "I feel so connected to you here"
    ];
  }
  
  // Hunter Association Office - Professional but personal
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
    // Professional but with personal warmth
    return [
      "You seem focused today",
      "How has your training been going?",
      "What's on your mind lately?"
    ];
  }
  
  // Coffee date activity - Special contextual prompts
  if (context?.activity === 'enjoying coffee date with Jin-Woo') {
    return [
      "I'm glad we could do this together.",
      "You seem more relaxed than usual.",
      "How's the coffee? I wasn't sure what you'd prefer."
    ];
  }
  
  // Casual romantic locations - Personal conversations
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
  // Direct download endpoint for generated images
  app.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(process.cwd(), 'public', filename);
    
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.sendFile(filepath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });

  // API endpoint to test both models and return results
  app.get("/api/test-models", async (req, res) => {
    try {
      const results = { novelai: null, imagen: null, errors: [] };
      
      // Test NovelAI V4
      try {
        console.log('Testing NovelAI V4 Curated Preview...');
        const novelaiResult = await imageGenerationService.generateNovelAI({
          activityId: 'bedroom_intimacy',
          relationshipStatus: 'deeply_connected', 
          intimacyLevel: 8
        });
        results.novelai = novelaiResult;
      } catch (error) {
        results.errors.push(`NovelAI V4 failed: ${error.message}`);
      }
      
      // Test Google Imagen 4.0
      try {
        console.log('Testing Google Imagen 4.0...');
        const imagenResult = await generateLocationSceneImage('chahaein_apartment', 'evening');
        results.imagen = imagenResult;
      } catch (error) {
        results.errors.push(`Google Imagen 4.0 failed: ${error.message}`);
      }
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Serve test images page (must be before Vite middleware)
  app.get("/test-images", (req, res) => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Model Tests</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a1a; color: white; }
        .test-section { margin: 30px 0; padding: 20px; border: 1px solid #333; border-radius: 8px; }
        .image-container { margin: 20px 0; text-align: center; }
        .generated-image { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
        .loading { color: #888; font-style: italic; }
        .error { color: #ff6b6b; }
        .success { color: #51cf66; }
        .model-info { background: #2a2a2a; padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace; }
        button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin: 5px; }
        button:hover { background: #5855eb; }
    </style>
</head>
<body>
    <h1>AI Model Generation Tests</h1>
    
    <div class="test-section">
        <h2>NovelAI V4 Curated Preview Test</h2>
        <div class="model-info">Model: nai-diffusion-4-curated-preview</div>
        <button onclick="testNovelAI()">Generate Intimate Scene</button>
        <div id="novelai-status" class="loading">Ready to test...</div>
        <div id="novelai-container" class="image-container"></div>
    </div>

    <div class="test-section">
        <h2>Google Imagen 4.0 Test</h2>
        <div class="model-info">Model: imagen-4.0-generate-001</div>
        <button onclick="testImagen()">Generate Location Scene</button>
        <div id="imagen-status" class="loading">Ready to test...</div>
        <div id="imagen-container" class="image-container"></div>
    </div>

    <script>
        async function testNovelAI() {
            const statusDiv = document.getElementById('novelai-status');
            const containerDiv = document.getElementById('novelai-container');
            
            statusDiv.textContent = 'Generating with NovelAI V4...';
            statusDiv.className = 'loading';
            containerDiv.innerHTML = '';
            
            try {
                const response = await fetch('/api/generate-novelai-intimate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        activityId: 'shower_intimacy',
                        relationshipStatus: 'deeply_connected',
                        intimacyLevel: 8
                    })
                });
                
                const data = await response.json();
                
                if (data.imageUrl) {
                    statusDiv.textContent = 'Successfully generated with NovelAI V4';
                    statusDiv.className = 'success';
                    
                    const img = document.createElement('img');
                    img.src = data.imageUrl;
                    img.className = 'generated-image';
                    img.alt = 'NovelAI V4 Generated Image';
                    containerDiv.appendChild(img);
                } else {
                    statusDiv.textContent = 'Failed to generate image';
                    statusDiv.className = 'error';
                }
            } catch (error) {
                statusDiv.textContent = 'Error: ' + error.message;
                statusDiv.className = 'error';
            }
        }

        async function testImagen() {
            const statusDiv = document.getElementById('imagen-status');
            const containerDiv = document.getElementById('imagen-container');
            
            statusDiv.textContent = 'Generating with Google Imagen 4.0...';
            statusDiv.className = 'loading';
            containerDiv.innerHTML = '';
            
            try {
                const response = await fetch('/api/generate-scene-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        location: 'chahaein_apartment',
                        timeOfDay: 'evening'
                    })
                });
                
                const data = await response.json();
                
                if (data.imageUrl) {
                    statusDiv.textContent = 'Successfully generated with Google Imagen 4.0';
                    statusDiv.className = 'success';
                    
                    const img = document.createElement('img');
                    img.src = data.imageUrl;
                    img.className = 'generated-image';
                    img.alt = 'Google Imagen 4.0 Generated Image';
                    containerDiv.appendChild(img);
                } else {
                    statusDiv.textContent = 'Failed to generate image';
                    statusDiv.className = 'error';
                }
            } catch (error) {
                statusDiv.textContent = 'Error: ' + error.message;
                statusDiv.className = 'error';
            }
        }
    </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  });

  // Serve NovelAI generated images directly (bypasses Vite)
  app.get('/mature_*.png', (req, res) => {
    const filename = req.path.substring(1); // Remove leading slash
    const filePath = path.join(process.cwd(), 'public', filename);
    
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.sendFile(filePath);
    } else {
      res.status(404).send('Image not found');
    }
  });

  // Episode System - Get all episodes (database version)
  app.get("/api/episodes", async (req, res) => {
    try {
      const episodes = await episodeEngine.getAvailableEpisodes();
      res.json({ episodes });
    } catch (error) {
      console.error("Failed to fetch episodes:", error);
      res.status(500).json({ error: "Failed to fetch episodes" });
    }
  });



  // Profile Management - Get all profiles
  app.get('/api/profiles', async (req, res) => {
    try {
      const { db } = await import('./db');
      const { playerProfiles, gameStates } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const profiles = await db
        .select()
        .from(playerProfiles)
        .leftJoin(gameStates, eq(playerProfiles.gameStateId, gameStates.id))
        .orderBy(playerProfiles.lastPlayed);
      
      res.json({ profiles: profiles.map(p => ({ ...p.player_profiles, gameState: p.game_states })) });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      res.status(500).json({ error: 'Failed to fetch profiles' });
    }
  });

  // Profile Management - Create new profile
  app.post('/api/profiles', async (req, res) => {
    try {
      const { profileName, gameState } = req.body;
      const { db } = await import('./db');
      const { playerProfiles, gameStates, insertPlayerProfileSchema } = await import('@shared/schema');
      
      if (!profileName?.trim()) {
        return res.status(400).json({ error: 'Profile name is required' });
      }
      
      // Create game state first
      const [newGameState] = await db
        .insert(gameStates)
        .values({
          sessionId: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          narration: gameState?.narration || "Welcome to your romantic adventure with Cha Hae-In!",
          health: gameState?.health || 100,
          maxHealth: gameState?.maxHealth || 100,
          mana: gameState?.mana || 50,
          maxMana: gameState?.maxMana || 50,
          level: gameState?.level || 1,
          experience: gameState?.experience || 0,
          statPoints: gameState?.statPoints || 0,
          skillPoints: gameState?.skillPoints || 0,
          gold: gameState?.gold || 100,
          affectionLevel: gameState?.affectionLevel || 0,
          energy: gameState?.energy || 100,
          maxEnergy: gameState?.maxEnergy || 100,
          relationshipStatus: gameState?.relationshipStatus || "dating",
          intimacyLevel: gameState?.intimacyLevel || 1,
          sharedMemories: gameState?.sharedMemories || 0,
          livingTogether: gameState?.livingTogether || 0,
          daysTogether: gameState?.daysTogether || 1,
          apartmentTier: gameState?.apartmentTier || 1,
          currentScene: gameState?.currentScene || "entrance",
          choices: gameState?.choices || [
            { id: "greet", icon: "👋", text: "Greet Cha Hae-In warmly" },
            { id: "compliment", icon: "💝", text: "Compliment her appearance" }
          ],
          sceneData: gameState?.sceneData || null,
          storyPath: gameState?.storyPath || "entrance",
          choiceHistory: gameState?.choiceHistory || [],
          storyFlags: gameState?.storyFlags || {},
          inventory: gameState?.inventory || [],
          stats: gameState?.stats || {},
          skills: gameState?.skills || [],
          scheduledActivities: gameState?.scheduledActivities || [],
          activeQuests: gameState?.activeQuests || [],
          completedQuests: gameState?.completedQuests || []
        })
        .returning();
      
      // Create player profile
      const [newProfile] = await db
        .insert(playerProfiles)
        .values({
          profileName: profileName.trim(),
          gameStateId: newGameState.id,
          completedEpisodes: [],
          currentEpisode: null,
          currentEpisodeBeat: 0,
          episodeProgress: {},
          isActive: true
        })
        .returning();
      
      // Deactivate other profiles
      await db
        .update(playerProfiles)
        .set({ isActive: false });
      
      // Set new profile as active
      await db
        .update(playerProfiles)
        .set({ isActive: true })
        .where(eq(playerProfiles.id, newProfile.id));
      
      res.json({ profile: newProfile });
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(500).json({ error: 'Failed to create profile' });
    }
  });

  // Profile Management - Load profile
  app.get('/api/profiles/:profileId/load', async (req, res) => {
    try {
      const { profileId } = req.params;
      const { db } = await import('./db');
      const { playerProfiles, gameStates } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const profileWithGameState = await db
        .select()
        .from(playerProfiles)
        .leftJoin(gameStates, eq(playerProfiles.gameStateId, gameStates.id))
        .where(eq(playerProfiles.id, parseInt(profileId)))
        .limit(1);
      
      if (!profileWithGameState.length) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      // Set as active profile
      await db.update(playerProfiles).set({ isActive: false });
      await db
        .update(playerProfiles)
        .set({ isActive: true, lastPlayed: new Date() })
        .where(eq(playerProfiles.id, parseInt(profileId)));
      
      const profile = profileWithGameState[0];
      res.json({ 
        profile: profile.player_profiles, 
        gameState: profile.game_states 
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      res.status(500).json({ error: 'Failed to load profile' });
    }
  });

  // Profile Management - Save current progress to profile
  app.post('/api/profiles/:profileId/save', async (req, res) => {
    try {
      const { profileId } = req.params;
      const { gameData, gameState } = req.body;
      const dataToUpdate = gameState || gameData;
      const { db } = await import('./db');
      const { playerProfiles, gameStates } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const profile = await db
        .select()
        .from(playerProfiles)
        .where(eq(playerProfiles.id, parseInt(profileId)))
        .limit(1);
      
      if (!profile.length) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      // Update game state
      if (profile[0].gameStateId) {
        await db
          .update(gameStates)
          .set({
            narration: dataToUpdate.narration || "Your adventure continues...",
            health: dataToUpdate.health || 100,
            maxHealth: dataToUpdate.maxHealth || 100,
            mana: dataToUpdate.mana || 50,
            maxMana: dataToUpdate.maxMana || 50,
            level: dataToUpdate.level || 1,
            experience: dataToUpdate.experience || 0,
            statPoints: dataToUpdate.statPoints || 0,
            skillPoints: dataToUpdate.skillPoints || 0,
            gold: dataToUpdate.gold || 100,
            affectionLevel: dataToUpdate.affectionLevel || 0,
            energy: dataToUpdate.energy || 100,
            maxEnergy: dataToUpdate.maxEnergy || 100,
            relationshipStatus: dataToUpdate.relationshipStatus || "dating",
            intimacyLevel: dataToUpdate.intimacyLevel || 1,
            sharedMemories: dataToUpdate.sharedMemories || 0,
            livingTogether: dataToUpdate.livingTogether || 0,
            daysTogether: dataToUpdate.daysTogether || 1,
            apartmentTier: dataToUpdate.apartmentTier || 1,
            currentScene: dataToUpdate.currentScene || "entrance",
            choices: dataToUpdate.choices || [],
            sceneData: dataToUpdate.sceneData || null,
            storyPath: dataToUpdate.storyPath || "entrance",
            choiceHistory: dataToUpdate.choiceHistory || [],
            storyFlags: dataToUpdate.storyFlags || {},
            inventory: dataToUpdate.inventory || [],
            stats: dataToUpdate.stats || {},
            skills: dataToUpdate.skills || [],
            scheduledActivities: dataToUpdate.scheduledActivities || [],
            activeQuests: dataToUpdate.activeQuests || [],
            completedQuests: dataToUpdate.completedQuests || []
          })
          .where(eq(gameStates.id, profile[0].gameStateId));
      }
      
      // Update profile last played
      await db
        .update(playerProfiles)
        .set({ lastPlayed: new Date() })
        .where(eq(playerProfiles.id, parseInt(profileId)));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving profile:', error);
      res.status(500).json({ error: 'Failed to save profile' });
    }
  });

  // Profile Management - Delete profile
  app.delete('/api/profiles/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;
      const { db } = await import('./db');
      const { playerProfiles, gameStates, episodeProgress } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const profile = await db
        .select()
        .from(playerProfiles)
        .where(eq(playerProfiles.id, parseInt(profileId)))
        .limit(1);
      
      if (!profile.length) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      // Delete episode progress first
      await db
        .delete(episodeProgress)
        .where(eq(episodeProgress.profileId, parseInt(profileId)));
      
      // Delete profile (this will automatically set gameStateId foreign key to null)
      await db
        .delete(playerProfiles)
        .where(eq(playerProfiles.id, parseInt(profileId)));
      
      // Delete game state last
      if (profile[0].gameStateId) {
        await db
          .delete(gameStates)
          .where(eq(gameStates.id, profile[0].gameStateId));
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting profile:', error);
      res.status(500).json({ error: 'Failed to delete profile' });
    }
  });

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
        apartmentTier: 1,
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
        scheduledActivities: [],
        activeQuests: [],
        completedQuests: []
      };

      // Use the existing dual-generator system
      const imageUrl = await generateSceneImage(mockGameState as any);
      
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

  // Episode System - Get available episodes
  app.get("/api/episodes", (req, res) => {
    try {
      const episodes = episodeEngine.getAvailableEpisodes();
      res.json({ episodes });
    } catch (error) {
      console.error("Failed to get episodes:", error);
      res.status(500).json({ error: "Failed to retrieve episodes" });
    }
  });

  // Episode System - Get specific episode details
  app.get("/api/episodes/:episodeId", async (req, res) => {
    try {
      const { episodeId } = req.params;
      const episode = await episodeEngine.getEpisode(episodeId);
      
      if (!episode) {
        return res.status(404).json({ error: "Episode not found" });
      }
      
      // Add status and progress tracking for frontend compatibility
      const episodeWithStatus = {
        ...episode,
        status: 'available',
        currentBeatIndex: 0
      };
      
      res.json({ episode: episodeWithStatus });
    } catch (error) {
      console.error("Failed to get episode:", error);
      res.status(500).json({ error: "Failed to retrieve episode" });
    }
  });

  // Episode System - Execute episode action
  app.post("/api/episodes/:episodeId/execute", async (req, res) => {
    try {
      const { episodeId } = req.params;
      const { beatId, actionIndex } = req.body;
      
      if (beatId === undefined || actionIndex === undefined) {
        return res.status(400).json({ error: "Missing beatId or actionIndex" });
      }
      
      await episodeEngine.executeEpisodeAction(episodeId, beatId, actionIndex);
      
      res.json({ success: true, message: "Episode action executed" });
    } catch (error) {
      console.error("Failed to execute episode action:", error);
      res.status(500).json({ error: "Failed to execute episode action" });
    }
  });

  // Episode System - Track gameplay events for episode progression
  app.post("/api/episode-events", async (req, res) => {
    try {
      const { event, data, profileId } = req.body;
      
      if (!event || !profileId) {
        return res.status(400).json({ error: "Missing event or profileId" });
      }
      
      console.log(`🎮 Episode event: ${event}`, data);
      
      // Track the event with the episode engine for automatic progression
      await episodeEngine.trackGameplayEvent(event, data, profileId);
      
      res.json({ 
        success: true, 
        message: `Event ${event} tracked for episode progression`
      });
    } catch (error) {
      console.error("Episode event tracking error:", error);
      res.status(500).json({ error: "Failed to track episode event" });
    }
  });

  // Episode System - Trigger beat completion
  app.post("/api/episodes/:episodeId/complete-beat", async (req, res) => {
    try {
      const { episodeId } = req.params;
      const { beatId, eventData } = req.body;
      
      if (beatId === undefined) {
        return res.status(400).json({ error: "Missing beatId" });
      }
      
      const completed = await episodeEngine.triggerBeatCompletion(episodeId, beatId, eventData);
      
      res.json({ completed, message: completed ? "Beat completed" : "Beat completion conditions not met" });
    } catch (error) {
      console.error("Failed to complete beat:", error);
      res.status(500).json({ error: "Failed to complete beat" });
    }
  });

  // Episode System - Set focused episode
  app.post("/api/episodes/:episodeId/focus/:profileId", async (req, res) => {
    try {
      const { episodeId, profileId } = req.params;
      
      await episodeEngine.setFocusedEpisode(Number(profileId), episodeId);
      
      res.json({
        success: true,
        focusedEpisode: episodeId,
        message: `Episode ${episodeId} is now focused`
      });
    } catch (error) {
      console.error("Failed to set focused episode:", error);
      res.status(500).json({ error: "Failed to set focused episode" });
    }
  });

  // Episode System - Clear focused episode
  app.delete("/api/episodes/focus/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      
      await episodeEngine.setFocusedEpisode(Number(profileId), null);
      
      res.json({
        success: true,
        focusedEpisode: null,
        message: "No episode is focused"
      });
    } catch (error) {
      console.error("Failed to clear focused episode:", error);
      res.status(500).json({ error: "Failed to clear focused episode" });
    }
  });

  // Episode System - Set multiple active episodes with priority weighting
  app.post("/api/episodes/active/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      const { episodes } = req.body;
      
      if (!Array.isArray(episodes)) {
        return res.status(400).json({ error: "Episodes must be an array" });
      }
      
      await episodeEngine.setActiveEpisodes(Number(profileId), episodes);
      
      res.json({
        success: true,
        activeEpisodes: episodes,
        message: `Set ${episodes.length} active episodes with priority weighting`
      });
    } catch (error) {
      console.error("Failed to set active episodes:", error);
      res.status(500).json({ error: "Failed to set active episodes" });
    }
  });

  // Episode System - Get active episodes with priorities
  app.get("/api/episodes/active/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      
      const activeEpisodes = await episodeEngine.getActiveEpisodes(Number(profileId));
      
      res.json({
        activeEpisodes,
        count: activeEpisodes.length,
        message: `Found ${activeEpisodes.length} active episodes`
      });
    } catch (error) {
      console.error("Failed to get active episodes:", error);
      res.status(500).json({ error: "Failed to get active episodes" });
    }
  });

  // Episode System - Get focused episode (backwards compatibility)
  app.get("/api/episodes/focus/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      
      const focusedEpisode = await episodeEngine.getFocusedEpisode(Number(profileId));
      
      res.json({
        focusedEpisode,
        message: focusedEpisode ? `Episode ${focusedEpisode} is focused` : "No episode is focused"
      });
    } catch (error) {
      console.error("Failed to get focused episode:", error);
      res.status(500).json({ error: "Failed to get focused episode" });
    }
  });

  // Episode System - Load episode progress
  app.get("/api/episodes/:episodeId/progress/:profileId", async (req, res) => {
    try {
      const { episodeId, profileId } = req.params;
      
      const progress = await episodeEngine.loadEpisodeProgress(Number(profileId), episodeId);
      
      if (progress) {
        res.json({
          hasProgress: true,
          currentBeat: progress.currentBeat,
          playerChoices: progress.playerChoices,
          message: `Continue from beat ${progress.currentBeat}`
        });
      } else {
        res.json({
          hasProgress: false,
          currentBeat: 0,
          playerChoices: {},
          message: "Starting from beginning"
        });
      }
    } catch (error) {
      console.error("Failed to load episode progress:", error);
      res.status(500).json({ error: "Failed to load episode progress" });
    }
  });

  // Episode System - Trigger episode start (creates communicator message)
  app.post("/api/episodes/:episodeId/trigger", async (req, res) => {
    try {
      const { episodeId } = req.params;
      const { profileId } = req.body;
      
      if (!profileId) {
        return res.status(400).json({ error: "Missing profileId" });
      }
      
      const episode = await episodeEngine.getEpisode(episodeId);
      if (!episode) {
        return res.status(404).json({ error: "Episode not found" });
      }

      // Set this episode as focused to prevent narrative confusion
      await episodeEngine.setFocusedEpisode(Number(profileId), episodeId);

      // Load existing progress if available
      const progress = await episodeEngine.loadEpisodeProgress(Number(profileId), episodeId);
      const startBeat = progress ? progress.currentBeat : 0;

      // Create the episode alert message for the Hunter Communicator
      const episodeAlert = {
        id: `episode_${episodeId}`,
        title: episode.title,
        sender: "Hunter Association",
        content: "A new critical mission has been detected. This appears to be related to unusual gate activity in the area. Your expertise is required for this investigation.",
        timestamp: new Date(),
        type: "quest" as const,
        read: false,
        questData: {
          rank: "A",
          type: "investigation",
          reward: 50000000,
          location: "hunter_association",
          description: "Investigate the A-Rank Gate Alert",
          longDescription: "A powerful magical anomaly has been detected. Work with Cha Hae-In to investigate and eliminate the threat.",
          objectives: [
            {
              id: "investigate_gate",
              description: "Meet with Cha Hae-In at the Hunter Association",
              completed: false
            }
          ],
          timeLimit: 24,
          difficulty: 8,
          estimatedDuration: 2,
          isUrgent: true,
          guildSupport: false
        }
      };

      res.json({ 
        success: true, 
        message: "Episode triggered successfully",
        episodeAlert
      });
    } catch (error) {
      console.error("Failed to trigger episode:", error);
      res.status(500).json({ error: "Failed to trigger episode" });
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
    const basePrompt = `Generate intimate content featuring Cha Hae-In solo based on: "${userMessage}"`;
    
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
      const { 
        message, 
        gameState, 
        context, 
        conversationHistory, 
        characterState, 
        isUrgent, 
        proposedActivity, 
        communicatorMode 
      } = req.body;
      const playerId = gameState.playerId || 'default_player';
      
      // Handle communicator mode with conversation continuity
      if (communicatorMode && conversationHistory) {
        console.log('📱 Hunter\'s Communicator mode - maintaining conversation continuity');
        
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

        // Build conversation context for continuity
        const conversationContext = {
          affectionLevel: Math.floor((characterState?.affectionLevel || 25) / 20),
          currentScene: characterState?.location || 'hunter_association',
          timeOfDay: (context?.timeOfDay || 'afternoon') as 'morning' | 'afternoon' | 'evening' | 'night',
          recentActivity: characterState?.activity,
          mood: 'focused' as 'focused' | 'romantic' | 'playful' | 'confident' | 'vulnerable' | 'disappointed' | 'hurt' | 'defensive',
          userBehavior: 'positive' as 'positive' | 'neutral' | 'rude' | 'mean'
        };

        const personalityPrompt = getPersonalityPrompt(conversationContext);
        
        // Build conversation history for context
        const historyContext = conversationHistory.slice(-6).map((msg: any) => 
          `${msg.senderName}: ${msg.content}`
        ).join('\n');

        // Get contextual episode guidance with intelligent multi-episode blending
        const profileId = gameState?.profileId || context?.profileId || 1;
        const location = characterState?.location || context?.location || 'hunter_association';
        const timeOfDay = context?.timeOfDay || 'afternoon';
        const episodeGuidance = await episodeEngine.getContextualEpisodeGuidance(profileId, location, timeOfDay);
        
        const fullPrompt = `${personalityPrompt}

HUNTER'S COMMUNICATOR CONVERSATION:
You are continuing an ongoing conversation through the Hunter's Communicator messaging system.

Current Status: ${characterState?.status || 'available'}
Current Activity: ${characterState?.activity || 'reviewing reports at the Association'}
Location: ${characterState?.location || 'hunter_association'}
Time: ${context?.timeOfDay || 'afternoon'}

Recent conversation history:
${historyContext}

Player just sent: "${message}"

${isUrgent ? 'This message seems urgent - respond accordingly.' : ''}
${proposedActivity ? `Player proposed an activity: ${JSON.stringify(proposedActivity)}` : ''}
${episodeGuidance ? `STORY GUIDANCE: After a few exchanges, naturally suggest: "${episodeGuidance}" - weave this into the conversation flow naturally, don't mention it's a quest or episode.` : ''}

IMPORTANT: This is a CONTINUING conversation. Maintain natural flow and reference previous messages when appropriate. Don't repeat the same responses. Keep your response conversational and authentic to Cha Hae-In's character - professional but warm, strong but caring. Vary your responses based on the conversation history.

${episodeGuidance ? 'After responding to the current message naturally, guide the conversation toward the story progression mentioned above.' : ''}

Respond naturally as if you're texting back:`;

        const result = await model.generateContent(fullPrompt);
        const rawResponse = result.response.text();
        const sanitizedResponse = rawResponse.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
        const updatedGameState = { ...gameState };

        return res.json({
          response: sanitizedResponse,
          gameState: updatedGameState,
          expression: 'focused'
        });
      }
      
      // System 9: Generate contextual narrative analysis
      const narrativeContext = narrativeEngine.generateContextualNarrative(playerId, `Player said: "${message}" at ${context?.location || 'unknown location'}`);
      
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
                response: `*Cha Hae-In responds passionately to your request* ${message.includes('show me') || message.includes('picture') ? 'Here, let me show you exactly what you want to see...' : 'Mmm... I want that too...'} *her breathing becomes heavier as she fulfills your desire*`,
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
        
        // Check for episode guidance - inject natural story progression
        const episodeGuidance = await episodeEngine.getEpisodeGuidance('GAMEPLAY_TEST', 2);
        
        const fullPrompt = `${personalityPrompt}

CURRENT SITUATION:
- Location: ${context?.location || 'Hunter Association'}
- Time: ${context?.timeOfDay || 'afternoon'}
- Activity: ${context?.activity || 'working on reports'}
- Weather: ${context?.weather || 'clear'}

Jin-Woo just said: "${message}"

${episodeGuidance ? `STORY GUIDANCE: After responding naturally, guide the conversation toward: "${episodeGuidance}" - weave this into the conversation flow naturally, don't mention it's a quest or episode.` : ''}

RESPONSE INSTRUCTIONS:
- Respond naturally as Cha Hae-In in character
- Reference the current location and situation
- Show appropriate emotional reactions based on affection level
- Keep response conversational and under 100 words
- Use "Jin-Woo" when addressing him directly
- Show your hunter expertise when relevant
- Express growing feelings if affection is high enough
${episodeGuidance ? '- After responding to the current message, naturally suggest the story progression mentioned above' : ''}`;
        
        const result = await model.generateContent(fullPrompt);
        response = result.response.text().replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
        
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

      // System 9: Record story memory for narrative continuity
      const storyMemory: Omit<StoryMemory, 'id' | 'timestamp'> = {
        event: `Conversation: Player: "${message}" | Cha Hae-In: "${response}"`,
        location: context?.location || 'unknown',
        participants: ['jin_woo', 'cha_hae_in'],
        emotionalImpact: affectionBonus || 1,
        storyTags: [
          ...(showAffectionHeart ? ['romantic_moment', 'affection_gained'] : []),
          ...(activityProposal.isActivityProposal ? ['activity_proposal'] : ['casual_conversation']),
          ...(context?.location ? [`location_${context.location}`] : []),
          ...(gameState.affection >= 70 ? ['high_affection'] : gameState.affection >= 40 ? ['medium_affection'] : ['low_affection'])
        ],
        consequences: [
          ...(showAffectionHeart ? ['relationship_progress'] : []),
          ...(updatedGameState.scheduledActivities && updatedGameState.scheduledActivities.length > (gameState.scheduledActivities?.length || 0) ? ['activity_scheduled'] : [])
        ]
      };
      
      narrativeEngine.addStoryMemory(playerId, storyMemory);

      // Generate dynamic thought prompts with narrative context
      let dynamicPrompts;
      try {
        dynamicPrompts = await generateDynamicPrompts(response, message, context, gameState);
        
        // Enhance prompts with narrative suggestions if available (limit to 4 total)
        if (narrativeContext.suggestedResponses.length > 0) {
          dynamicPrompts = [...dynamicPrompts, ...narrativeContext.suggestedResponses].slice(0, 4);
        } else {
          dynamicPrompts = dynamicPrompts.slice(0, 4);
        }
        
        console.log(`🎭 Dynamic prompts generated with narrative context:`, dynamicPrompts);
      } catch (error) {
        console.error("Dynamic prompt generation failed, using fallback:", error);
        dynamicPrompts = generateFallbackPrompts(response, message, context).slice(0, 4);
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

  // System 9: Get Narrative Context
  app.get("/api/narrative-context/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const narrativeContext = narrativeEngine.getStoryContext(playerId);
      
      res.json({
        ...narrativeContext,
        recentMemories: narrativeContext.storyMemories.slice(-10), // Last 10 memories
        currentChapter: narrativeContext.activeStoryArcs[0]?.currentChapter || 1,
        storyTitle: narrativeContext.activeStoryArcs[0]?.title || 'The Hunter\'s Heart',
        emotionalSummary: narrativeContext.emotionalStates.cha_hae_in ? {
          dominantMood: Object.entries(narrativeContext.emotionalStates.cha_hae_in.currentMood)
            .sort(([,a], [,b]) => b - a)[0],
          relationshipLevel: Object.entries(narrativeContext.emotionalStates.cha_hae_in.relationshipDynamics)
            .sort(([,a], [,b]) => b - a)[0]
        } : null
      });
    } catch (error) {
      console.error("Narrative context error:", error);
      res.status(500).json({ error: "Failed to retrieve narrative context" });
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
        model: "gemini-1.5-flash",
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
      const rawResponse = result.response.text();
      const response = rawResponse.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
      
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
      const { chatHistory, activityId, userPrompt, intimacyLevel, setting, emotionalTone } = req.body;
      
      // Use the enhanced artistic prompt engine with explicit content support
      const promptOptions = {
        emotionalTone: emotionalTone || 'passionate',
        setting: setting || 'chahaein_apartment',
        activityContext: activityId || userPrompt || 'intimate_moment',
        intimacyLevel: intimacyLevel || 8
      };
      
      const artisticPrompt = artisticPromptEngine.generateArtisticPrompt(promptOptions);
      
      res.json({ prompt: artisticPrompt });
    } catch (error) {
      console.error("Narrative prompt generation error:", error);
      res.status(500).json({ error: "Failed to generate narrative prompt" });
    }
  });

  // Enhanced Image Generation for System 5 Narrative Lens - Direct Implementation
  app.post("/api/generate-novelai-intimate", async (req, res) => {
    try {
      const { prompt: rawPrompt, activityId, stylePreset, relationshipStatus, intimacyLevel } = req.body;
      const prompt = String(rawPrompt || '');
      
      console.log("🎨 Generating intimate scene exclusively with NovelAI V4.5 Full...");
      
      // Create enhanced romantic prompt for NovelAI V4.5 Full - Solo Cha Hae-In focus
      const enhancedIntimatePrompt = `masterpiece, best quality, detailed, ${prompt}, Cha Hae-In solo intimate scene, short bob cut golden blonde hair, violet eyes, Solo Leveling manhwa art style, romantic scene, beautiful lighting, emotional intimacy, explicit content, high quality artwork`;
      
      // Use NovelAI exclusively for intimate scenes
      const result = await imageGenerationService.generateImage(enhancedIntimatePrompt, 'NovelAI');
      
      if (result.success && result.imageUrl) {
        console.log('✅ NovelAI V4.5 Full intimate scene generated successfully');
        return res.json({ 
          imageUrl: result.imageUrl,
          provider: result.provider
        });
      }

      console.log('⚠️ Direct intimate image generation failed');
      
      // Return fallback response with descriptive text
      return res.json({ 
        imageUrl: null,
        fallbackText: "The intimate moment unfolds with tender passion, their connection deepening as they lose themselves in each other's embrace.",
        error: "NovelAI servers temporarily experiencing issues"
      });
    } catch (error) {
      console.error("Direct image generation error:", error);
      
      res.json({ 
        imageUrl: null,
        fallbackText: "The intimate moment unfolds with tender passion, their connection deepening as they lose themselves in each other's embrace.",
        error: "Image generation temporarily unavailable"
      });
    }
  });

  // Basic image generation endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, preferredProvider } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      console.log(`🎨 Generating image with prompt: ${prompt.substring(0, 50)}...`);
      const result = await imageGenerationService.generateImage(prompt, preferredProvider);
      
      if (result.success) {
        console.log(`✅ Image generated successfully with ${result.provider}`);
        return res.json({ 
          success: true,
          imageUrl: result.imageUrl,
          provider: result.provider
        });
      }

      console.log(`❌ Image generation failed: ${result.error}`);
      
      return res.json({ 
        success: false,
        imageUrl: null,
        error: result.error,
        availableProviders: await imageGenerationService.getAvailableProviders()
      });
    } catch (error) {
      console.error("Image generation error:", error);
      
      res.status(500).json({ 
        success: false,
        imageUrl: null,
        error: "Image generation temporarily unavailable"
      });
    }
  });

  // Debug endpoint to check available image providers
  app.get("/api/available-providers", async (req, res) => {
    try {
      const providers = await imageGenerationService.getAvailableProviders();
      res.json({ providers });
    } catch (error) {
      res.status(500).json({ error: "Failed to get providers" });
    }
  });

  // Narrative Architect AI - Episode Generation
  app.post("/api/generate-episode", async (req, res) => {
    try {
      const { directorsBrief, playerLevel, affectionLevel } = req.body;
      
      if (!directorsBrief || directorsBrief.trim().length === 0) {
        return res.status(400).json({ error: "Director's brief is required" });
      }

      console.log(`🎭 Generating episode from brief: ${directorsBrief.substring(0, 100)}...`);
      
      const episodeData = await narrativeArchitect.generateEpisode({
        directorsBrief,
        playerLevel,
        affectionLevel
      });

      console.log(`✅ Episode generated: ${episodeData.title}`);
      res.json({ episode: episodeData });
      
    } catch (error) {
      console.error('Episode generation failed:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        return res.status(503).json({ 
          error: "AI service unavailable. Please provide GOOGLE_API_KEY to enable episode generation." 
        });
      }
      res.status(500).json({ error: "Failed to generate episode" });
    }
  });

  // Save generated episode
  app.post("/api/save-episode", async (req, res) => {
    try {
      const { episodeData } = req.body;
      
      if (!episodeData || !episodeData.id) {
        return res.status(400).json({ error: "Valid episode data is required" });
      }

      const filepath = await narrativeArchitect.saveEpisode(episodeData);
      console.log(`💾 Episode saved: ${episodeData.title}`);
      
      res.json({ 
        success: true, 
        filepath,
        message: "Episode saved successfully"
      });
      
    } catch (error) {
      console.error('Episode save failed:', error);
      res.status(500).json({ error: "Failed to save episode" });
    }
  });

  // Serve test images page
  app.get("/test-images", (req, res) => {
    res.sendFile(path.join(__dirname, "../test_generated_images.html"));
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