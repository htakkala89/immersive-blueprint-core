import type { GameState, InsertGameState, Choice } from "@shared/schema";

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
    const gameState: GameState = { ...insertGameState, id };
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

    // AI Game Master responses based on choice
    const responses: Record<string, string> = {
      examine: "You lean closer to the ancient door, studying the intricate runes. As your eyes trace their patterns, you notice they seem to shift and pulse with inner light. Maya whispers, 'These are protection wards, but they're weakening...'",
      'pick-lock': "You carefully examine the lock mechanism. Your trained fingers work the tumblers while Alex keeps watch. After several tense moments, you hear a satisfying click. The door creaks open slightly, revealing darkness beyond.",
      'ask-maya': "Maya looks up from her examination, her eyes bright with excitement. 'These runes tell a story,' she explains. 'They speak of a great treasure protected by trials of wisdom, courage, and sacrifice. But beware - the magic here is ancient and unpredictable.'",
      'enhanced-vision': "You focus your magical energy, feeling the familiar tingle as mana flows through you. Your vision sharpens dramatically, revealing hidden layers of the runes. You can now see spectral threads connecting each symbol, forming a complex magical circuit.",
      continue: "You step forward through the ancient doorway. The air grows thick with magical energy as you enter a vast chamber. Crystalline formations along the walls pulse with an otherworldly light, illuminating mysterious symbols carved into the stone.",
      prepare: "You ready your weapons and focus your mind, sensing danger ahead. Alex nods approvingly while Maya begins weaving protective enchantments around your group. The ancient magic responds to your preparations, and you feel more confident.",
      investigate: "You search the area more thoroughly, discovering hidden passages and secret compartments. Your careful investigation reveals ancient artifacts and clues about the civilization that once inhabited this place.",
      retreat: "You step back cautiously, reassessing the situation. Sometimes wisdom lies in patience. The magical energies seem to calm slightly as you show respect for the ancient powers at work here."
    };

    let newNarration = responses[choice.id] || `You chose to '${choice.text}'. The world holds its breath, waiting for the consequences of your action...`;
    let newHealth = existing.health;
    let newMana = existing.mana;

    // Handle mana cost for enhanced vision
    if (choice.id === 'enhanced-vision') {
      newMana = Math.max(0, existing.mana - 25);
    }

    // Generate new choices based on the action taken
    const newChoices: Choice[] = [
      { id: 'continue', icon: '🚶', text: 'Continue forward' },
      { id: 'prepare', icon: '🛡️', text: 'Prepare for danger' },
      { id: 'investigate', icon: '🔍', text: 'Investigate further' },
      { id: 'retreat', icon: '↩️', text: 'Step back cautiously' }
    ];

    const updated: GameState = {
      ...existing,
      narration: newNarration,
      health: newHealth,
      mana: newMana,
      choices: newChoices
    };

    this.gameStates.set(sessionId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
