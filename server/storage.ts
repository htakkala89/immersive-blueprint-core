import type { GameState, InsertGameState, Choice } from "@shared/schema";
import { STORY_NODES, getNextStoryNode, getAvailableChoices } from "./storyEngine";

export interface IStorage {
  getGameState(sessionId: string): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(sessionId: string, updates: Partial<InsertGameState>): Promise<GameState>;
  processChoice(sessionId: string, choice: Choice): Promise<GameState>;
}

export class MemStorage implements IStorage {
  private gameStates: Map<string, GameState>;
  private currentId: number;

  constructor() {
    this.gameStates = new Map();
    this.currentId = 1;
  }

  async getGameState(sessionId: string): Promise<GameState | undefined> {
    return this.gameStates.get(sessionId);
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const id = this.currentId++;
    const startingNode = STORY_NODES.entrance;
    const gameState: GameState = { 
      id,
      sessionId: insertGameState.sessionId,
      narration: startingNode.narration,
      health: insertGameState.health || 100,
      maxHealth: insertGameState.maxHealth || 100,
      mana: insertGameState.mana || 50,
      maxMana: insertGameState.maxMana || 50,
      choices: startingNode.choices,
      sceneData: insertGameState.sceneData || null,
      storyPath: "entrance",
      choiceHistory: [],
      storyFlags: {}
    };
    this.gameStates.set(insertGameState.sessionId, gameState);
    return gameState;
  }

  async updateGameState(sessionId: string, updates: Partial<InsertGameState>): Promise<GameState> {
    const existing = this.gameStates.get(sessionId);
    if (!existing) {
      throw new Error('Game state not found');
    }
    
    const updated = { ...existing, ...updates };
    this.gameStates.set(sessionId, updated);
    return updated;
  }

  async processChoice(sessionId: string, choice: Choice): Promise<GameState> {
    const existing = this.gameStates.get(sessionId);
    if (!existing) {
      throw new Error('Game state not found');
    }

    // Handle custom choices (chat input) differently from story engine choices
    let nextNode, newFlags;
    
    if (choice.id.startsWith('custom-')) {
      // For custom choices, create a dynamic response based on the input
      const customText = choice.text.toLowerCase();
      let responseNarration = '';
      
      if (customText.includes('maya') || customText.includes('ask maya') || customText.includes('talk to maya')) {
        responseNarration = `You turn to Maya with your question: "${choice.text}". Maya considers your words carefully before responding. "That's an interesting perspective," she says thoughtfully. "The ancient magic here responds to intention and wisdom. Your approach shows you're learning to think like an adventurer."`;
      } else if (customText.includes('examine') || customText.includes('look') || customText.includes('inspect')) {
        responseNarration = `You carefully examine the area as you suggested: "${choice.text}". Your detailed observation reveals subtle magical energies flowing through the ancient stonework. Alex nods approvingly at your thoroughness, while Maya points out mystical symbols you might have missed.`;
      } else if (customText.includes('cast') || customText.includes('magic') || customText.includes('spell')) {
        responseNarration = `You attempt to channel magical energy as you described: "${choice.text}". The ancient runes around you respond with a faint glow, sensing your magical intent. Maya watches with interest, ready to guide you if the magic becomes unstable.`;
      } else {
        responseNarration = `You take action with your own approach: "${choice.text}". The ancient chamber seems to acknowledge your unique strategy. Your companions observe with curiosity as you forge your own path through this mystical adventure.`;
      }
      
      // Stay in the same story node but provide custom response
      const currentNode = STORY_NODES[existing.storyPath || "entrance"];
      nextNode = {
        ...currentNode,
        narration: responseNarration
      };
      newFlags = existing.storyFlags || {};
    } else {
      // Use the story engine for predefined choices
      const result = getNextStoryNode(
        existing.storyPath || "entrance", 
        choice.id, 
        existing.storyFlags || {}, 
        existing.choiceHistory || []
      );
      nextNode = result.node;
      newFlags = result.newFlags;
    }

    // Update choice history
    const newChoiceHistory = [...(existing.choiceHistory || []), choice.id];

    // Handle stat changes based on choice outcomes
    let newHealth = existing.health;
    let newMana = existing.mana;

    // Apply stat modifications based on specific choices
    if (choice.id === 'enhanced-vision-success') {
      newMana = Math.max(0, existing.mana - 25);
    } else if (choice.id === 'enhanced-vision-fail') {
      newMana = Math.max(0, existing.mana - 35);
    } else if (choice.id === 'pick-lock-fail') {
      newHealth = Math.max(0, existing.health - 10);
    } else if (choice.id === 'face-dragon-success') {
      newHealth = Math.max(0, existing.health - 20);
      newMana = Math.min(existing.maxMana, existing.mana + 10);
    } else if (choice.id === 'face-dragon-fail') {
      newHealth = Math.max(0, existing.health - 40);
    } else if (choice.id === 'claim-power') {
      newHealth = existing.maxHealth;
      newMana = existing.maxMana;
    } else if (choice.id === 'destroy-source') {
      newHealth = 0;
    }

    // Get available choices for the new node
    const availableChoices = getAvailableChoices(nextNode, newFlags, newChoiceHistory);

    // Create new scene data with animated elements
    const newSceneData = {
      runes: Array.from({ length: nextNode.isEnding ? 5 : 3 }, (_, i) => ({
        x: 0.2 + i * 0.15,
        y: 0.3 + Math.sin(i) * 0.2,
        isRed: nextNode.endingType === 'defeat' || Math.random() > 0.7,
        phase: Math.random() * Math.PI * 2
      })),
      particles: Array.from({ length: nextNode.isEnding ? 12 : 8 }, (_, i) => ({
        x: Math.random(),
        y: Math.random(),
        phase: Math.random() * Math.PI * 2
      })),
      imageUrl: existing.sceneData?.imageUrl
    };

    const updated: GameState = {
      ...existing,
      narration: nextNode.narration,
      health: newHealth,
      mana: newMana,
      choices: availableChoices,
      sceneData: newSceneData,
      storyPath: nextNode.id,
      choiceHistory: newChoiceHistory,
      storyFlags: newFlags
    };

    this.gameStates.set(sessionId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
