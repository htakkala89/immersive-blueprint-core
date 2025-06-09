import { useState, useEffect } from "react";
import { DailyLifeHubModal } from "@/components/DailyLifeHubModal";
import { EnhancedGateRaidSystem } from "@/components/EnhancedGateRaidSystem";

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
  intimacyLevel?: number;
}

interface StoryScene {
  prompt: string;
  narration: string;
  chat: Array<{ sender: string; text: string }>;
  choices: Array<{ text: string; detail?: string; type: string }>;
  leadsTo?: Record<string, string>;
}

const saveGameState = (state: GameState) => {
  try {
    localStorage.setItem('solo-leveling-game-state', JSON.stringify(state));
  } catch {
    // Handle storage errors silently
  }
};

const loadGameState = (): GameState | null => {
  try {
    const saved = localStorage.getItem('solo-leveling-game-state');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export default function SoloLeveling() {
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
      intimacyLevel: 3
    };
  };

  const [gameState, setGameState] = useState<GameState>(initializeGameState);
  const [showDailyLife, setShowDailyLife] = useState(false);
  const [showGateRaid, setShowGateRaid] = useState(false);

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
    }
  };

  const getCurrentStory = () => {
    return story[gameState.currentScene] || story['START'];
  };

  const currentStory = getCurrentStory();

  const handleChoice = (choice: any) => {
    const nextScene = currentStory.leadsTo?.[choice.type];
    if (nextScene && story[nextScene]) {
      setGameState(prev => ({
        ...prev,
        currentScene: nextScene
      }));
    }
  };

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-600/30 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Solo Leveling
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowDailyLife(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Daily Life
            </button>
            <button
              onClick={() => setShowGateRaid(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Gate Raids
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
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

      {/* Modals */}
      <DailyLifeHubModal
        isOpen={showDailyLife}
        onClose={() => setShowDailyLife(false)}
        gameState={gameState}
        setGameState={setGameState}
      />

      <EnhancedGateRaidSystem
        isOpen={showGateRaid}
        onClose={() => setShowGateRaid(false)}
        gameState={gameState}
        setGameState={setGameState}
      />
    </div>
  );
}