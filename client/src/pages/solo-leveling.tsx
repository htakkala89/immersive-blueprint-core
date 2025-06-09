import { useState, useEffect } from 'react';

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
  equippedGear?: any;
  availableEquipment?: any[];
  intimacyLevel?: number;
  energy?: number;
  maxEnergy?: number;
}

interface StoryScene {
  prompt: string;
  narration: string;
  chat: Array<{ sender: string; text: string }>;
  choices: Array<{ text: string; detail?: string; type: string }>;
  leadsTo?: Record<string, string>;
}

export default function SoloLeveling() {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 0,
    currentScene: 'START',
    inventory: [],
    inCombat: false,
    energy: 100,
    maxEnergy: 100
  });

  const story: Record<string, StoryScene> = {
    'START': {
      prompt: "Jin-Woo beginning his journey as the weakest hunter, anime style.",
      narration: "You stand before the imposing Hunter's Association building, your E-rank license clutched in your trembling hand.",
      chat: [
        { sender: 'system', text: "Welcome to Solo Leveling RPG" },
        { sender: 'Cha Hae-In', text: "Another new hunter? Be careful out there." },
        { sender: 'player', text: "I'll do my best to survive." }
      ],
      choices: [
        { text: "Enter the Association", detail: "Begin your hunter career", type: 'enter_association' },
        { text: "Train first", detail: "Prepare yourself", type: 'train' },
        { text: "Talk to Cha Hae-In", detail: "Introduce yourself", type: 'talk_cha' }
      ],
      leadsTo: { 
        enter_association: 'ASSOCIATION_LOBBY', 
        train: 'TRAINING_GROUNDS', 
        talk_cha: 'CHA_INTRODUCTION' 
      }
    },
    'ASSOCIATION_LOBBY': {
      prompt: "Hunter's Association lobby bustling with activity, anime style.",
      narration: "The lobby buzzes with hunters of all ranks discussing dungeons and raids.",
      chat: [
        { sender: 'receptionist', text: "Welcome to the Hunter's Association. How can I help you?" },
        { sender: 'player', text: "I'm looking for available dungeons." }
      ],
      choices: [
        { text: "Check E-rank dungeons", detail: "Safe beginner dungeons", type: 'e_dungeons' },
        { text: "Visit the shop", detail: "Buy equipment", type: 'shop' },
        { text: "Rest area", detail: "Recover energy", type: 'rest' }
      ],
      leadsTo: { 
        e_dungeons: 'DUNGEON_SELECTION', 
        shop: 'EQUIPMENT_SHOP', 
        rest: 'REST_AREA' 
      }
    },
    'CHA_INTRODUCTION': {
      prompt: "Jin-Woo meeting Cha Hae-In for the first time, anime style.",
      narration: "The S-rank hunter turns to face you, her silver hair catching the light.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're new here, aren't you? I can sense your... potential." },
        { sender: 'player', text: "Yes, I just got my license. I'm Jin-Woo." },
        { sender: 'Cha Hae-In', text: "I'm Cha Hae-In. Stay safe out there, Jin-Woo." }
      ],
      choices: [
        { text: "Ask for advice", detail: "Learn from an S-rank", type: 'ask_advice' },
        { text: "Thank her", detail: "Be polite", type: 'thank' },
        { text: "Ask about training", detail: "Improve your skills", type: 'training_request' }
      ],
      leadsTo: { 
        ask_advice: 'CHA_ADVICE', 
        thank: 'POLITE_FAREWELL', 
        training_request: 'TRAINING_OFFER' 
      }
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

  // Load game state on mount
  useEffect(() => {
    const loadGame = async () => {
      try {
        const response = await fetch('/api/game-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: 'player1' })
        });
        
        if (response.ok) {
          const gameData = await response.json();
          setGameState(gameData);
        }
      } catch (error) {
        console.error('Failed to load game:', error);
      }
    };
    
    loadGame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Solo Leveling RPG</h1>
          <div className="flex gap-4 text-sm">
            <span>Level: {gameState.level}</span>
            <span>Energy: {gameState.energy}/{gameState.maxEnergy}</span>
            <span>Affection: {gameState.affection}</span>
          </div>
        </div>
      </div>

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
                      : message.sender === 'system'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}>
                    <div className="text-sm opacity-70 mb-1">
                      {message.sender === 'player' ? 'You' : 
                       message.sender === 'system' ? 'System' : 
                       message.sender}
                    </div>
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
      </div>
    </div>
  );
}