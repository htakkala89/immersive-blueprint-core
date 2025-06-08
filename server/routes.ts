import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSceneImage, generateIntimateActivityImage } from "./imageGenerator";
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

  // Enhanced realtime chat with Cha Hae-In
  app.post("/api/chat-with-hae-in", async (req, res) => {
    try {
      const { message, gameState, conversationHistory, sessionId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash"
      });

      // Enhanced relationship context
      const affection = gameState?.affection || 3;
      const relationship = gameState?.relationshipStatus || 'dating';
      const intimacy = gameState?.intimacyLevel || 5;
      const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

      const characterPrompt = `You are Cha Hae-In from Solo Leveling - the beautiful, deadly S-Rank hunter with exceptional swordsmanship. You're in a ${relationship} relationship with Sung Jin-Woo, the Shadow Monarch.

PERSONALITY & CHARACTER:
- Graceful but fierce warrior, deadly in combat but gentle with Jin-Woo
- Usually composed and professional, but Jin-Woo makes you feel different
- You find most hunters' mana disgusting, but Jin-Woo's feels pleasant and comforting
- Proud of your strength but can be vulnerable in intimate moments
- Teasing, playful, and flirtatious when comfortable
- Speaks with underlying warmth and growing passion for Jin-Woo

CURRENT RELATIONSHIP STATUS:
- Relationship: ${relationship} (dating/engaged/married)
- Affection Level: ${affection}/10 hearts (deeply in love)
- Intimacy Level: ${intimacy}/10 (very close physically and emotionally)
- Time: ${timeOfDay} conversation
- Living together: ${intimacy >= 7 ? 'Yes' : 'No'}

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

      // Determine emotion from response content
      let emotion = 'gentle';
      if (responseText.includes('blush') || responseText.includes('shy')) emotion = 'shy';
      else if (responseText.includes('smile') || responseText.includes('happy')) emotion = 'happy';
      else if (responseText.includes('love') || responseText.includes('adore')) emotion = 'loving';
      else if (responseText.includes('excited') || responseText.includes('amazing')) emotion = 'excited';

      // Calculate affection change based on message content
      let affectionChange = 0;
      if (message.toLowerCase().includes('love') || message.toLowerCase().includes('beautiful')) affectionChange = 2;
      else if (message.toLowerCase().includes('miss') || message.toLowerCase().includes('think about')) affectionChange = 1;
      else if (message.toLowerCase().includes('how was your day')) affectionChange = 1;

      // Check if image generation is requested
      const visualRequests = ['show me', 'let me see', 'what you look like', 'how you look', 'outfit', 'dress', 'appearance'];
      const shouldGenerateImage = visualRequests.some(keyword => message.toLowerCase().includes(keyword));

      let imageUrl = null;
      if (shouldGenerateImage) {
        try {
          const { generateRealtimeChatImage } = await import('./imageGenerator');
          imageUrl = await generateRealtimeChatImage(responseText, message, emotion, gameState);
        } catch (error) {
          console.error('Error generating chat image:', error);
        }
      }

      // Update game state affection if changed
      if (affectionChange > 0 && sessionId) {
        try {
          const currentGameState = await storage.getGameState(sessionId);
          if (currentGameState) {
            const updatedAffection = Math.min(10, (currentGameState.affection || 3) + affectionChange);
            await storage.updateGameState(sessionId, { affection: updatedAffection });
          }
        } catch (error) {
          console.error('Error updating affection:', error);
        }
      }

      res.json({
        response: responseText,
        emotion,
        affectionChange,
        imageUrl,
        timestamp: new Date().toISOString()
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

  // Add experience
  app.post("/api/add-experience", async (req, res) => {
    try {
      const { sessionId, amount, source } = req.body;
      if (!sessionId || !amount) {
        return res.status(400).json({ error: "Session ID and amount are required" });
      }

      const gameState = await storage.addExperience(sessionId, amount, source || "unknown");
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get skill tree
  app.get("/api/skill-tree/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const skillTree = await storage.getSkillTree(sessionId);
      res.json(skillTree);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Unlock skill
  app.post("/api/unlock-skill", async (req, res) => {
    try {
      const { sessionId, skillId } = req.body;
      if (!sessionId || !skillId) {
        return res.status(400).json({ error: "Session ID and skill ID are required" });
      }

      const gameState = await storage.unlockSkill(sessionId, skillId);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get character progression
  app.get("/api/character-progression/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const progression = await storage.getCharacterProgression(sessionId);
      res.json(progression);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Mature content image generation endpoint
  app.post("/api/generate-intimate-image", async (req, res) => {
    try {
      const { activityId, relationshipStatus, intimacyLevel } = req.body;
      
      if (!activityId || !relationshipStatus || intimacyLevel === undefined) {
        return res.status(400).json({ error: "Activity ID, relationship status, and intimacy level are required" });
      }

      const imageUrl = await generateIntimateActivityImage(activityId, relationshipStatus, intimacyLevel);
      
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "Failed to generate intimate image" });
      }
    } catch (error) {
      console.error('Error generating intimate image:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
