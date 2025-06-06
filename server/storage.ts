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
      'pick-lock-success': "Your skilled fingers work the ancient lock mechanism with precision. The tumblers click into place one by one, and with a satisfying mechanical sound, the lock disengages. The heavy door swings open, revealing a chamber filled with ethereal light.",
      'pick-lock-fail': "Despite your best efforts, the ancient lock proves too complex. Your lockpicks slip, and you hear a warning click. The door's magical defenses activate, sending a mild shock through your hands. You'll need to try a different approach.",
      'ask-maya': "Maya looks up from her examination, her eyes bright with excitement. 'These runes tell a story,' she explains. 'They speak of a great treasure protected by trials of wisdom, courage, and sacrifice. But beware - the magic here is ancient and unpredictable.'",
      'enhanced-vision-success': "You successfully channel your magical energy, completing the complex runic sequence. Your vision transforms dramatically, revealing hidden magical pathways and secret passages throughout the chamber. The ancient mysteries become clear to you.",
      'enhanced-vision-fail': "Your attempt to activate enhanced vision falters as you misalign the magical sequence. The spell backfires, causing temporary disorientation and draining additional mana. The ancient magic resists your untrained approach.",
      continue: "You step forward through the ancient doorway. The air grows thick with magical energy as you enter a vast chamber. Crystalline formations along the walls pulse with an otherworldly light, illuminating mysterious symbols carved into the stone.",
      prepare: "You ready your weapons and focus your mind, sensing danger ahead. Alex nods approvingly while Maya begins weaving protective enchantments around your group. The ancient magic responds to your preparations, and you feel more confident.",
      investigate: "You search the area more thoroughly, discovering hidden passages and secret compartments. Your careful investigation reveals ancient artifacts and clues about the civilization that once inhabited this place.",
      retreat: "You step back cautiously, reassessing the situation. Sometimes wisdom lies in patience. The magical energies seem to calm slightly as you show respect for the ancient powers at work here."
    };

    let newNarration = responses[choice.id] || `You chose to '${choice.text}'. The world holds its breath, waiting for the consequences of your action...`;
    let newHealth = existing.health;
    let newMana = existing.mana;

    // Handle mini-game results and stat changes
    if (choice.id === 'enhanced-vision-success') {
      newMana = Math.max(0, existing.mana - 25);
    } else if (choice.id === 'enhanced-vision-fail') {
      newMana = Math.max(0, existing.mana - 35); // Extra penalty for failure
    } else if (choice.id === 'pick-lock-fail') {
      newHealth = Math.max(0, existing.health - 10); // Minor damage from shock
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
