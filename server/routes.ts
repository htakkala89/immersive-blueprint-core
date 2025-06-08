import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSceneImage, generateIntimateActivityImage } from "./imageGenerator";
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
      const { message, gameState } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Missing message parameter" });
      }

      // Create context for Cha Hae-In based on current game state
      const context = `You are Cha Hae-In from Solo Leveling, a beautiful and skilled S-Rank hunter. You have blonde hair, wear red armor, and are known for your swordsmanship and grace. You're intelligent, strong, but also has a softer side that she shows to Jin-Woo.

Current relationship context:
- Affection level: ${gameState?.affection || 0}/10
- Current scene: ${gameState?.currentScene || 'meeting'}
- Living together: ${gameState?.livingTogether ? 'Yes' : 'No'}
- Relationship status: ${gameState?.relationshipStatus || 'getting to know each other'}

Personality traits:
- Confident but not arrogant
- Skilled fighter who respects strength
- Has a gentle side she shows to those she trusts
- Values honesty and courage
- Can be playful and teasing when comfortable
- Shows vulnerability in intimate moments

Respond as Cha Hae-In would, keeping responses natural and in character. Include emotional reactions in parentheses when appropriate. Keep responses to 2-3 sentences maximum.`;

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

      const result = await model.generateContent([
        { text: context },
        { text: `Player message: "${message}"` },
        { text: "Respond as Cha Hae-In:" }
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

  app.post("/api/generate-voice", async (req, res) => {
    try {
      const { text, character } = req.body;
      
      if (!text || !character) {
        return res.status(400).json({ error: "Missing text or character parameter" });
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

  const server = createServer(app);
  return server;
}