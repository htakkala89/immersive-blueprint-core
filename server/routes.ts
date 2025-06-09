import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSceneImage, generateIntimateActivityImage, resetMatureImageProtection } from "./imageGenerator";
import { voiceService } from "./voiceService";
import { getSceneImage } from "./preGeneratedImages";
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
      try {
        let imageUrl = null;
        try {
          imageUrl = await generateSceneImage(gameState);
        } catch (error) {
          console.error("AI image generation failed, using fallback:", error);
          imageUrl = getSceneImage(gameState);
        }
        
        if (imageUrl) {
          await storage.updateGameState(sessionId, {
            sceneData: { ...gameState.sceneData, imageUrl }
          });
        }
      } catch (error) {
        console.error("Scene image generation error:", error);
      }
      
      res.json(gameState);
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
      const { prompt, gameState } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Check for cached images first for instant loading
      const cachedImage = getSceneImage(gameState || { currentScene: 'default', narration: prompt });
      if (cachedImage === 'cached-cover') {
        console.log('📸 Using cached image for scene');
        // For cached images, we still generate AI images but return the cached one immediately
        // This provides instant loading while AI generation happens in background
      }

      // Create a mock GameState object for the image generator
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

  app.post("/api/generate-chat-image", async (req, res) => {
    try {
      const { chatResponse, userMessage, characterFocus } = req.body;
      
      if (!chatResponse) {
        return res.status(400).json({ error: "Missing chatResponse parameter" });
      }

      // Import the chat scene image generator
      const { generateChatSceneImage } = await import('./imageGenerator.js');
      
      const imageUrl = await generateChatSceneImage(chatResponse, userMessage || '');
      
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "Failed to generate chat image" });
      }
    } catch (error) {
      console.error(`Failed to generate chat image: ${error}`);
      res.status(500).json({ error: "Failed to generate chat image" });
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

  app.post("/api/chat-with-hae-in", async (req, res) => {
    try {
      const { message, gameState, affectionLevel, userBehavior } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Missing message parameter" });
      }

      // Import enhanced personality system
      const { getPersonalityPrompt } = await import('./chaHaeInPersonality.js');
      
      // Create enhanced context for Cha Hae-In's personality
      const currentAffectionLevel = affectionLevel || gameState?.affection || 0;
      const currentHour = new Date().getHours();
      const timeOfDay = currentHour < 6 ? 'night' : 
                       currentHour < 12 ? 'morning' :
                       currentHour < 18 ? 'afternoon' : 
                       currentHour < 22 ? 'evening' : 'night';
      
      // Determine mood based on message content
      let mood = 'balanced';
      if (message.toLowerCase().includes('fight') || message.toLowerCase().includes('battle')) mood = 'confident';
      else if (message.toLowerCase().includes('love') || message.toLowerCase().includes('feel')) mood = 'romantic';
      else if (message.includes('?')) mood = 'playful';
      else if (message.toLowerCase().includes('sorry') || message.toLowerCase().includes('sad')) mood = 'vulnerable';
      
      // Enhanced mood detection including negative emotions
      if (userBehavior === 'mean') mood = 'hurt';
      else if (userBehavior === 'rude') mood = 'disappointed';
      
      const conversationContext = {
        affectionLevel: currentAffectionLevel,
        currentScene: gameState?.currentScene || 'general',
        timeOfDay: timeOfDay as 'morning' | 'afternoon' | 'evening' | 'night',
        mood: mood as 'confident' | 'playful' | 'vulnerable' | 'focused' | 'romantic' | 'disappointed' | 'hurt' | 'defensive',
        userBehavior: userBehavior as 'positive' | 'neutral' | 'rude' | 'mean'
      };

      const context = getPersonalityPrompt(conversationContext);

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
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

      // Add conversation context and examples for better responses
      const conversationExamples = `
EXAMPLE RESPONSES (adapt these styles, don't copy exactly):

When greeted: "Oh, Jin-Woo! *turns with a genuine smile* I was just thinking about our last raid. How are you feeling today?"

When complimented: "*raises an eyebrow with a slight smirk* Flattery, Jin-Woo? Though I appreciate the sentiment. You're not bad yourself."

When asked about training: "Always ready to improve. *adjusts sword grip* Want to spar? I promise I'll go easy on you... maybe."

When discussing feelings: "*looks away briefly, then meets your eyes* You know, Jin-Woo, you have this way of making everything feel... different. In a good way."

When teased playfully: "*laughs softly* Is that so? *steps closer with a challenging look* Care to test that theory?"

Remember: Be dynamic, show personality, ask engaging questions back, reference your shared hunter experiences.`;

      const result = await model.generateContent([
        { text: context },
        { text: conversationExamples },
        { text: `Player message: "${message}"` },
        { text: "Respond as Cha Hae-In with personality and depth:" }
      ]);

      const response = result.response;
      const responseText = response.text();

      if (!responseText || responseText.trim().length === 0) {
        return res.status(500).json({ error: "Empty response from AI" });
      }

      res.json({ response: responseText.trim() });
    } catch (error) {
      console.error(`Chat API error: ${error}`);
      res.status(500).json({ error: "Failed to generate chat response" });
    }
  });

  // Voice timing tracker to ensure proper playback order
  let lastNarratorTime = 0;
  const NARRATOR_DELAY = 2000; // 2 second delay for narrator priority

  app.post("/api/generate-voice", async (req, res) => {
    try {
      const { text, character } = req.body;
      
      if (!text || !character) {
        return res.status(400).json({ error: "Missing text or character parameter" });
      }

      // Add delay for character voices to ensure narrator plays first
      if (character !== 'narrator' && character !== 'story-narration') {
        const timeSinceLastNarrator = Date.now() - lastNarratorTime;
        if (timeSinceLastNarrator < NARRATOR_DELAY) {
          const delayNeeded = NARRATOR_DELAY - timeSinceLastNarrator;
          console.log(`⏰ Delaying ${character} voice by ${delayNeeded}ms to ensure narrator plays first`);
          await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }
      } else {
        // Update narrator timestamp
        lastNarratorTime = Date.now();
      }
      
      const audioBuffer = await voiceService.generateVoiceByCharacter(character, text);
      
      if (audioBuffer) {
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString()
        });
        res.send(audioBuffer);
      } else {
        res.status(500).json({ error: "Failed to generate voice" });
      }
    } catch (error) {
      console.error(`Failed to generate voice: ${error}`);
      res.status(500).json({ error: "Failed to generate voice" });
    }
  });

  app.post("/api/generate-story-narration", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Missing text parameter" });
      }
      
      // Update narrator timestamp for story narration
      lastNarratorTime = Date.now();
      
      const audioBuffer = await voiceService.generateStoryNarrationVoice(text);
      
      if (audioBuffer) {
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString()
        });
        res.send(audioBuffer);
      } else {
        res.status(500).json({ error: "Failed to generate story narration" });
      }
    } catch (error) {
      console.error(`Failed to generate story narration: ${error}`);
      res.status(500).json({ error: "Failed to generate story narration" });
    }
  });

  // Reset mature image protection when user exits intimate activities
  app.post("/api/reset-mature-protection", async (req, res) => {
    try {
      resetMatureImageProtection();
      res.json({ success: true, message: "Mature image protection reset" });
    } catch (error) {
      console.error('Failed to reset mature protection:', error);
      res.status(500).json({ error: "Failed to reset protection" });
    }
  });

  const server = createServer(app);
  return server;
}