import type { GameState, InsertGameState, Choice, CharacterStats } from "@shared/schema";
import { STORY_NODES, getNextStoryNode, getAvailableChoices } from "./storyEngine";

export interface IStorage {
  getGameState(sessionId: string): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(sessionId: string, updates: Partial<InsertGameState>): Promise<GameState>;
  processChoice(sessionId: string, choice: Choice): Promise<GameState>;
  levelUp(sessionId: string): Promise<GameState>;
  upgradeSkill(sessionId: string, skillId: string): Promise<GameState>;
  allocateStatPoint(sessionId: string, stat: keyof CharacterStats): Promise<GameState>;
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
    const startingInventory = [
      {
        id: "basic-sword",
        name: "Iron Sword",
        description: "A simple but reliable blade for dungeon exploration",
        icon: "⚔️",
        type: "weapon" as const,
        quantity: 1
      },
      {
        id: "health-potion",
        name: "Health Potion",
        description: "Restores health when consumed",
        icon: "🧪",
        type: "consumable" as const,
        quantity: 3
      },
      {
        id: "torch",
        name: "Torch",
        description: "Provides light in dark places",
        icon: "🔥",
        type: "misc" as const,
        quantity: 5
      }
    ];

    const initialStats = {
      strength: 10,
      agility: 10,
      intelligence: 10,
      vitality: 10,
      sense: 10
    };

    const initialSkills = [
      {
        id: "shadow-extraction",
        name: "Shadow Extraction",
        description: "Extract shadows from defeated enemies to create loyal soldiers",
        type: "ultimate" as const,
        level: 1,
        maxLevel: 10,
        unlocked: true,
        prerequisites: [],
        effects: { shadowCapacity: 5 }
      },
      {
        id: "dagger-mastery",
        name: "Dagger Mastery", 
        description: "Increases damage and attack speed with daggers",
        type: "passive" as const,
        level: 1,
        maxLevel: 10,
        unlocked: true,
        prerequisites: [],
        effects: { daggerDamage: 10, attackSpeed: 5 }
      }
    ];

    const gameState: GameState = { 
      id,
      sessionId: insertGameState.sessionId,
      narration: startingNode.narration,
      health: insertGameState.health || 100,
      maxHealth: insertGameState.maxHealth || 100,
      mana: insertGameState.mana || 50,
      maxMana: insertGameState.maxMana || 50,
      level: 1,
      experience: 0,
      statPoints: 0,
      skillPoints: 0,
      choices: startingNode.choices,
      sceneData: insertGameState.sceneData || null,
      storyPath: "entrance",
      choiceHistory: [],
      storyFlags: {},
      inventory: startingInventory,
      stats: initialStats,
      skills: initialSkills
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
    
    if (choice.id.startsWith('custom-') || choice.id.startsWith('speak-')) {
      // For custom choices and speech, create a dynamic response based on the input
      const customText = choice.text.toLowerCase();
      let responseNarration = '';
      
      if (choice.id.startsWith('speak-')) {
        // Handle speech to characters
        if (customText.includes('maya') || customText.includes('hey maya') || customText.includes('hello maya')) {
          responseNarration = `You speak directly to Maya: "${choice.text}". Maya turns to you with a warm smile. "Hello! I'm glad you're speaking up," she responds cheerfully. "What would you like to know? I can tell you about the ancient magic here, or perhaps you'd like some advice on our next move?"`;
        } else if (customText.includes('alex')) {
          responseNarration = `You address Alex: "${choice.text}". Alex looks up from checking his equipment and grins. "Good to hear from you! I was just thinking we should stick together in this place. These old ruins can be tricky, but with teamwork we'll get through just fine."`;
        } else if (customText.includes('hello') || customText.includes('hi') || customText.includes('hey')) {
          responseNarration = `You call out: "${choice.text}". Both Maya and Alex turn toward you. Maya responds first: "Hello there! It's good to hear your voice." Alex adds with a nod: "Hey! Ready for whatever comes next?"`;
        } else {
          responseNarration = `You say: "${choice.text}". Maya listens intently and responds: "I appreciate you sharing that with us. Communication is key in adventures like this. What are you thinking we should do next?"`;
        }
      } else if (customText.includes('maya') || customText.includes('ask maya') || customText.includes('talk to maya')) {
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

  async levelUp(sessionId: string): Promise<GameState> {
    const existing = this.gameStates.get(sessionId);
    if (!existing) {
      throw new Error('Game state not found');
    }

    const expNeeded = existing.level * 100;
    if (existing.experience < expNeeded) {
      throw new Error('Not enough experience to level up');
    }

    const updated = {
      ...existing,
      level: existing.level + 1,
      experience: existing.experience - expNeeded,
      statPoints: existing.statPoints + 5,
      skillPoints: existing.skillPoints + 1,
      maxHealth: existing.maxHealth + 20,
      maxMana: existing.maxMana + 10,
      health: existing.maxHealth + 20,
      mana: existing.maxMana + 10
    };

    this.gameStates.set(sessionId, updated);
    return updated;
  }

  async upgradeSkill(sessionId: string, skillId: string): Promise<GameState> {
    const existing = this.gameStates.get(sessionId);
    if (!existing) {
      throw new Error('Game state not found');
    }

    if (existing.skillPoints < 1) {
      throw new Error('Not enough skill points');
    }

    const skillIndex = existing.skills.findIndex(s => s.id === skillId);
    if (skillIndex === -1) {
      throw new Error('Skill not found');
    }

    const skill = existing.skills[skillIndex];
    if (skill.level >= skill.maxLevel) {
      throw new Error('Skill already at max level');
    }

    const updatedSkills = [...existing.skills];
    updatedSkills[skillIndex] = {
      ...skill,
      level: skill.level + 1
    };

    const updated = {
      ...existing,
      skills: updatedSkills,
      skillPoints: existing.skillPoints - 1
    };

    this.gameStates.set(sessionId, updated);
    return updated;
  }

  async allocateStatPoint(sessionId: string, stat: keyof CharacterStats): Promise<GameState> {
    const existing = this.gameStates.get(sessionId);
    if (!existing) {
      throw new Error('Game state not found');
    }

    if (existing.statPoints < 1) {
      throw new Error('Not enough stat points');
    }

    const updatedStats = {
      ...existing.stats,
      [stat]: existing.stats[stat] + 1
    };

    // Calculate stat bonuses
    let healthBonus = 0;
    let manaBonus = 0;
    
    if (stat === 'vitality') {
      healthBonus = 15;
    }
    if (stat === 'intelligence') {
      manaBonus = 8;
    }

    const updated = {
      ...existing,
      stats: updatedStats,
      statPoints: existing.statPoints - 1,
      maxHealth: existing.maxHealth + healthBonus,
      maxMana: existing.maxMana + manaBonus,
      health: existing.health + healthBonus,
      mana: existing.mana + manaBonus
    };

    this.gameStates.set(sessionId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
