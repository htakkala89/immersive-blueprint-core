import { useState, useEffect, useRef } from "react";
import { SkillTree } from "@/components/SkillTree";
import { useCharacterProgression } from "@/hooks/useCharacterProgression";
import { useVoice } from "@/hooks/useVoice";
import { useStoryNarration } from "@/hooks/useStoryNarration";
import { LockPickingGame, RuneSequenceGame, DragonEncounterGame } from "@/components/MiniGames";
import { DailyLifeHubModal } from "@/components/DailyLifeHubModal";
import { RaidSystem } from "@/components/RaidSystem";
import { RelationshipSystem } from "@/components/RelationshipSystem";
import { MemoryLaneAnimation } from "@/components/MemoryLaneAnimation";
import { CombatSystem } from "@/components/CombatSystem";
import { AchievementSystem, useAchievementSystem } from "@/components/AchievementSystem";
import CharacterProfile from "@/components/CharacterProfileNew";
import { StoryBranching, EnhancedChoiceButton } from "@/components/StoryBranching";
import { DungeonRaidSystem } from "@/components/DungeonRaidSystem";
import { ShadowArmyManager } from "@/components/ShadowArmyManager";
import { InventorySystem } from "@/components/InventorySystem";
import { CombatTactics } from "@/components/CombatTactics";
import { EquipmentSystem, STARTING_EQUIPMENT, type Equipment, type EquippedGear } from "@/components/EquipmentSystem";
import { GiftSystem, type GiftItem } from "@/components/GiftSystem";
import { UnifiedShop, type ShopItem } from "@/components/UnifiedShop";
import { IntimateActivityModal } from "@/components/IntimateActivityModal";

interface GameState {
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  affection: number;
  currentScene: string;
  inventory: any[];
  inCombat: boolean;
  experience?: number;
  statPoints?: number;
  skillPoints?: number;
  stats?: any;
  skills?: any[];
  gold?: number;
  equippedGear?: EquippedGear;
  availableEquipment?: Equipment[];
  intimacyLevel?: number;
}

interface StoryScene {
  prompt: string;
  narration: string;
  chat: Array<{ sender: string; text: string }>;
  choices: Array<{ text: string; detail?: string; type: string }>;
  leadsTo?: Record<string, string>;
}

// Helper functions for game state management
const loadGameState = (): GameState | null => {
  try {
    const saved = localStorage.getItem('solo-leveling-game-state');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveGameState = (state: GameState) => {
  try {
    localStorage.setItem('solo-leveling-game-state', JSON.stringify(state));
  } catch {
    // Handle storage errors silently
  }
};

export default function SoloLeveling() {
  // Initialize game state with saved data or defaults
  const initializeGameState = (): GameState => {
    const savedState = loadGameState();
    if (savedState) {
      return savedState;
    }
    
    return {
      level: 146,
      health: 15420,
      maxHealth: 15420,
      mana: 8750,
      maxMana: 8750,
      affection: 95,
      currentScene: 'START',
      inventory: [],
      inCombat: false,
      experience: 89750,
      statPoints: 25,
      skillPoints: 12,
      stats: {
        strength: 184,
        agility: 167,
        intelligence: 189,
        vitality: 145,
        sense: 172
      },
      skills: [],
      gold: 50000,
      equippedGear: {
        weapon: STARTING_EQUIPMENT.weapons[0],
        armor: STARTING_EQUIPMENT.armor[0],
        accessory: null
      },
      availableEquipment: [...STARTING_EQUIPMENT.weapons, ...STARTING_EQUIPMENT.armor],
      intimacyLevel: 3
    };
  };

  const [gameState, setGameState] = useState<GameState>(initializeGameState);

  // Define story scenes
  const story: Record<string, StoryScene> = {
    'START': {
      prompt: "Jin-Woo starting his journey, meeting Cha Hae-In for the first time, anime style.",
      narration: "The bustling Hunter's Association lobby fills with nervous energy as you prepare for your first joint raid with the elite White Tiger Guild.",
      chat: [
        { sender: 'Cha Hae-In', text: "So you're the E-rank everyone's been talking about lately..." },
        { sender: 'player', text: "I know what you're thinking. An E-rank shouldn't be here." },
        { sender: 'Cha Hae-In', text: "Actually, I'm curious. There's something different about your scent." }
      ],
      choices: [
        { text: "Ask about her abilities", detail: "Learn more about her", type: 'ask_abilities' },
        { text: "Stay humble", detail: "Keep expectations low", type: 'stay_humble' },
        { text: "Show confidence", detail: "Demonstrate your growth", type: 'show_confidence' }
      ],
      leadsTo: { ask_abilities: 'ABILITIES_TALK', stay_humble: 'HUMBLE_APPROACH', show_confidence: 'CONFIDENT_DISPLAY' }
    },
    'ABILITIES_TALK': {
      prompt: "Jin-Woo asking Cha Hae-In about her abilities, professional discussion, anime style.",
      narration: "Cha Hae-In's eyes light up as she discusses her unique sensory abilities.",
      chat: [
        { sender: 'Cha Hae-In', text: "My ability is... unusual. I can sense the 'scent' of magic power." },
        { sender: 'player', text: "That must be incredibly useful in combat situations." },
        { sender: 'Cha Hae-In', text: "Most hunters have an unpleasant scent, but yours... it's completely different." }
      ],
      choices: [
        { text: "Ask what makes it different", detail: "Seek more details", type: 'ask_different' },
        { text: "Change the subject", detail: "Avoid personal topics", type: 'change_subject' },
        { text: "Share your experience", detail: "Open up about your journey", type: 'share_experience' }
      ],
      leadsTo: { ask_different: 'SCENT_MYSTERY', change_subject: 'PROFESSIONAL_TALK', share_experience: 'PERSONAL_SHARING' }
    }
  };

  // Get current story scene
  const getCurrentStory = () => {
    return story[gameState.currentScene] || story['START'];
  };

  const currentStory = getCurrentStory();

  // Handle story progression
  const handleChoice = (choice: any) => {
    const nextScene = currentStory.leadsTo?.[choice.type];
    if (nextScene && story[nextScene]) {
      setGameState(prev => ({
        ...prev,
        currentScene: nextScene
      }));
    }
  };

  // Auto-save game state
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex flex-col">
      {/* Game Content */}
      <div className="flex-1 flex flex-col">
        {/* Story Display */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{currentStory.narration}</h2>
            
            {/* Chat Messages */}
            <div className="space-y-4 mb-6">
              {currentStory.chat.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'player' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-white'
                  }`}>
                    <div className="text-sm opacity-70 mb-1">{message.sender === 'player' ? 'You' : 'Cha Hae-In'}</div>
                    <div>{message.text}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Choices */}
            <div className="space-y-3">
              {currentStory.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 text-left transition-colors"
                >
                  <div className="font-semibold">{choice.text}</div>
                  {choice.detail && <div className="text-sm opacity-70 mt-1">{choice.detail}</div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="bg-slate-800 p-4 border-t border-slate-600">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex space-x-6">
              <div>Level: {gameState.level}</div>
              <div>Health: {gameState.health}/{gameState.maxHealth}</div>
              <div>Mana: {gameState.mana}/{gameState.maxMana}</div>
              <div>Affection: {gameState.affection}</div>
            </div>
            <div className="text-sm opacity-70">
              Scene: {gameState.currentScene}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}