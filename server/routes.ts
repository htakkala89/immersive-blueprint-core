import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSceneImage } from "./imageGenerator";
import { getSceneImage } from "./preGeneratedImages";
import { log } from "./vite";
import { z } from "zod";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  // Generate scene image for Solo Leveling
  app.post("/api/generate-scene-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const enhancedPrompt = `${prompt}. High quality digital art, detailed anime/manga style, cinematic lighting, vibrant colors, masterpiece quality`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error("No image URL received from OpenAI");
      }
      res.json({ imageUrl });
    } catch (error) {
      console.error(`Failed to generate scene image: ${error}`);
      res.status(500).json({ error: "Failed to generate scene image" });
    }
  });

  // Chat with Cha Hae-In using Gemini
  app.post("/api/chat-with-hae-in", async (req, res) => {
    try {
      const { message, gameState, conversationHistory } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const characterPrompt = `You are Cha Hae-In from Solo Leveling, the S-Rank hunter known for your swordsmanship and grace. You're having a conversation with Sung Jin-Woo, the Shadow Monarch.

Current context:
- Your affection level for Jin-Woo: ${gameState?.affection || 0}/5
- Current scene: ${gameState?.currentScene || 'casual conversation'}
- You find Jin-Woo's mana pleasant and are developing romantic feelings for him
- You're strong, independent, but have a softer side when it comes to Jin-Woo
- You speak with confidence but show vulnerability around romantic topics

Conversation history:
${conversationHistory?.map((msg: any) => `${msg.sender}: ${msg.text}`).join('\n') || 'This is the start of your conversation.'}

Jin-Woo just said: "${message}"

Respond as Cha Hae-In would, keeping your response natural, in-character, and around 1-2 sentences. Show appropriate emotion based on the affection level and context.`;

      const result = await model.generateContent(characterPrompt);
      const response = result.response;
      const responseText = response.text();

      res.json({ 
        response: responseText,
        sender: 'Cha Hae-In'
      });
    } catch (error) {
      console.error(`Failed to generate chat response: ${error}`);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
