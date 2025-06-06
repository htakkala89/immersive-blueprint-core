import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const MakeChoiceSchema = z.object({
  sessionId: z.string(),
  choice: z.object({
    id: z.string(),
    icon: z.string(),
    text: z.string(),
    detail: z.string().optional(),
  })
});

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

  const httpServer = createServer(app);
  return httpServer;
}
