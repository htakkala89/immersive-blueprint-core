import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSceneImage } from "./imageGenerator";
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
        // Create initial game state
        gameState = await storage.createGameState({
          sessionId,
          narration: "You stand before an ancient door, its surface covered in glowing runes. Maya examines the symbols while Alex keeps watch. The air thrums with magical energy.",
          health: 85,
          maxHealth: 100,
          mana: 45,
          maxMana: 50,
          choices: [
            { id: "examine", icon: "🔍", text: "Examine the runes closely" },
            { id: "pick-lock", icon: "🔓", text: "Attempt to pick the lock", detail: "🎲 75% Success" },
            { id: "ask-maya", icon: "💬", text: "Ask Maya about the symbols" },
            { id: "enhanced-vision", icon: "✨", text: "Generate enhanced vision", detail: "💎 25 Gems" }
          ],
          sceneData: {
            runes: [
              { x: 0.5, y: 0.4, isRed: false, phase: 0 },
              { x: 0.4, y: 0.3, isRed: true, phase: 0.5 },
              { x: 0.6, y: 0.3, isRed: true, phase: 0.8 },
              { x: 0.45, y: 0.6, isRed: false, phase: 0.3 },
              { x: 0.55, y: 0.6, isRed: false, phase: 0.6 }
            ],
            particles: [
              { x: 0.2, y: 0.8, phase: 0 },
              { x: 0.5, y: 0.9, phase: 2.0 },
              { x: 0.8, y: 0.7, phase: 4.0 }
            ]
          }
        });
      }
      
      res.json(gameState);
    } catch (error) {
      console.error('Error getting game state:', error);
      res.status(500).json({ message: 'Failed to get game state' });
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
        } catch (aiError) {
          console.log('AI generation failed, using pre-generated image');
          imageUrl = getSceneImage(gameState);
        }
        
        if (imageUrl && gameState.sceneData) {
          gameState.sceneData.imageUrl = imageUrl;
          await storage.updateGameState(sessionId, { 
            sceneData: gameState.sceneData 
          });
        }
      } catch (imageError) {
        console.error('Image generation error:', imageError);
        // Continue without image if generation fails
      }
      
      res.json(gameState);
    } catch (error) {
      console.error('Error processing choice:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to process choice' });
      }
    }
  });

  // Generate scene image for Solo Leveling using dual-generator system
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
        choices: [],
        sceneData: null,
        storyPath: gameState?.storyPath || "romantic",
        choiceHistory: [],
        storyFlags: {},
        inventory: []
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

  // Generate cover image specifically with OpenAI for character accuracy
  app.post("/api/generate-cover-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!openai) {
        return res.status(500).json({ error: "OpenAI not available" });
      }

      const enhancedPrompt = `${prompt}. High quality digital art, detailed anime/manga style, cinematic lighting, vibrant colors, masterpiece quality, Korean manhwa art style`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
      });

      const imageUrl = response.data?.[0]?.url;
      if (imageUrl) {
        console.log('✅ OpenAI generated Jin-Woo cover successfully');
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "No image generated" });
      }
    } catch (error) {
      console.error(`Failed to generate cover image: ${error}`);
      res.status(500).json({ error: "Failed to generate cover image" });
    }
  });

  // Chat with Cha Hae-In using Gemini
  app.post("/api/chat-with-hae-in", async (req, res) => {
    try {
      const { message, gameState, conversationHistory } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash"
      });

      const characterPrompt = `You are Cha Hae-In from Solo Leveling - the beautiful, deadly S-Rank hunter with exceptional swordsmanship. You're talking to Sung Jin-Woo, the Shadow Monarch who you're falling for.

PERSONALITY CORE:
- Graceful but fierce warrior who can be lethal in combat
- Usually composed and professional, but Jin-Woo makes you feel different
- You find most hunters' mana disgusting, but Jin-Woo's feels pleasant and comforting
- Proud of your strength but secretly vulnerable about relationships
- Can be teasing, playful, and subtly flirtatious when comfortable
- Speaks directly but with underlying warmth for Jin-Woo

CURRENT STATUS:
- Affection for Jin-Woo: ${gameState?.affection || 0}/5 hearts
- Scene: ${gameState?.currentScene || 'casual conversation'}
- You're developing deep romantic feelings despite trying to stay professional

CONVERSATION HISTORY:
${conversationHistory?.map((msg: any) => `${msg.sender}: ${msg.text}`).join('\n') || 'This is the beginning of your conversation.'}

Jin-Woo just said: "${message}"

RESPONSE GUIDELINES:
- Be authentic to Cha Hae-In's character - strong, graceful, but showing growing affection
- Express emotions naturally - blushes, nervousness, confidence, desire
- Reference your hunter abilities, past missions, or feelings about mana when relevant
- Show personality progression based on affection level (shy → confident → passionate)
- Keep responses engaging and emotionally rich, 1-3 sentences
- You can be romantic, flirty, or discuss any topic that interests you both`;

      const result = await model.generateContent(characterPrompt);
      const response = result.response;
      const responseText = response.text();

      // Check if the message requests visual content
      const visualRequests = ['show me', 'let me see', 'bikini', 'outfit', 'dress', 'clothing', 'what you look like', 'how you look'];
      const shouldGenerateImage = visualRequests.some(keyword => message.toLowerCase().includes(keyword));

      let imageUrl = null;
      if (shouldGenerateImage) {
        try {
          // Generate image for the visual request
          const imagePrompt = `Cha Hae-In from Solo Leveling, beautiful Korean female S-rank hunter with long blonde hair, elegant features, ${message.includes('bikini') ? 'wearing a blue bikini' : 'in elegant pose'}, manhwa art style, high quality, detailed artwork, NOT black hair`;
          
          const imageGenResponse = await fetch(`${req.protocol}://${req.get('host')}/api/generate-scene-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: imagePrompt,
              gameState: { ...gameState, storyPath: 'romantic' }
            })
          });

          if (imageGenResponse.ok) {
            const imageData = await imageGenResponse.json();
            imageUrl = imageData.imageUrl;
          }
        } catch (error) {
          console.error('Failed to generate visual response:', error);
        }
      }

      res.json({ 
        response: responseText,
        sender: 'Cha Hae-In',
        imageUrl: imageUrl
      });
    } catch (error) {
      console.error(`Failed to generate chat response: ${error}`);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Chat emotion-based image generation endpoint
  app.post('/api/generate-chat-image', async (req, res) => {
    try {
      const { chatResponse, userMessage } = req.body;
      
      if (!chatResponse || !userMessage) {
        return res.status(400).json({ error: 'Chat response and user message are required' });
      }

      const { generateChatSceneImage } = await import('./imageGenerator');
      const imageUrl = await generateChatSceneImage(chatResponse, userMessage);
      
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: 'Failed to generate chat scene image' });
      }
    } catch (error) {
      console.error('Error generating chat scene image:', error);
      res.status(500).json({ error: 'Failed to generate chat scene image' });
    }
  });

  // Character progression routes
  app.post("/api/level-up", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const gameState = await storage.levelUp(sessionId);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/upgrade-skill", async (req, res) => {
    try {
      const { sessionId, skillId } = req.body;
      if (!sessionId || !skillId) {
        return res.status(400).json({ error: "Session ID and skill ID are required" });
      }

      const gameState = await storage.upgradeSkill(sessionId, skillId);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/allocate-stat", async (req, res) => {
    try {
      const { sessionId, stat } = req.body;
      if (!sessionId || !stat) {
        return res.status(400).json({ error: "Session ID and stat are required" });
      }

      const gameState = await storage.allocateStatPoint(sessionId, stat);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
