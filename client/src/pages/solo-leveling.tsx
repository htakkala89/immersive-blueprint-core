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

const defaultStats = {
  strength: 184,
  agility: 167,
  intelligence: 189,
  vitality: 145,
  sense: 172
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
      stats: defaultStats,
      skills: [],
      gold: 50000,
      equippedGear: {
        weapon: STARTING_EQUIPMENT.find(e => e.type === 'weapon'),
        armor: STARTING_EQUIPMENT.find(e => e.type === 'armor')
      },
      availableEquipment: STARTING_EQUIPMENT,
      intimacyLevel: 3
    };
  };

  const [gameState, setGameState] = useState<GameState>(initializeGameState);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showCombat, setShowCombat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showShadowArmy, setShowShadowArmy] = useState(false);
  const [showDailyLife, setShowDailyLife] = useState(false);
  const [showGateRaid, setShowGateRaid] = useState(false);
  const [showIntimateActivity, setShowIntimateActivity] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [showGifts, setShowGifts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentBackground, setCurrentBackground] = useState("/api/scene-image");
  const [sceneBackground, setSceneBackground] = useState("/api/scene-image");
  const [showTactics, setShowTactics] = useState(false);
  const [showDungeonRaid, setShowDungeonRaid] = useState(false);
  const [showRaidSystem, setShowRaidSystem] = useState(false);
  const [showRelationship, setShowRelationship] = useState(false);
  const [showMemoryLane, setShowMemoryLane] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showAchievementSystem, setShowAchievementSystem] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; id: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [pendingChoice, setPendingChoice] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const [chatPinned, setChatPinned] = useState(false);
  const [autoMessageVisible, setAutoMessageVisible] = useState(false);
  const [autoHiddenMessages, setAutoHiddenMessages] = useState<string[]>([]);
  const [messageStates, setMessageStates] = useState<Record<string, boolean>>({});
  const [messageTimers, setMessageTimers] = useState<Record<string, NodeJS.Timeout>>({});
  
  const [showAffectionIncrease, setShowAffectionIncrease] = useState(false);
  const [affectionIncreaseAmount, setAffectionIncreaseAmount] = useState(0);
  const [showAffectionDecrease, setShowAffectionDecrease] = useState(false);
  const [affectionDecreaseAmount, setAffectionDecreaseAmount] = useState(0);
  const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const characterProgression = useCharacterProgression(gameState, setGameState);
  const { playVoice } = useVoice();
  const { 
    generateStoryNarration,
    stopNarration,
    isPlaying,
    isLoading: narrationLoading
  } = useStoryNarration();
  
  const achievementSystem = useAchievementSystem();
  const isNarrationEnabled = true; // Default to enabled

  // Core story scenes and game logic
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
      prompt: "Cha Hae-In demonstrating her sword skills, elegant and powerful, anime style.",
      narration: "Cha Hae-In unsheaths her blade with fluid grace, the steel singing as it cuts through the air.",
      chat: [
        { sender: 'Cha Hae-In', text: "I specialize in swordsmanship. My enhanced senses help me track enemies." },
        { sender: 'player', text: "Your technique is incredible. How long have you been training?" },
        { sender: 'Cha Hae-In', text: "Since I awakened as a hunter. But you... there's definitely something unique about you." }
      ],
      choices: [
        { text: "Ask about the White Tiger Guild", detail: "Learn about her guild", type: 'guild_talk' },
        { text: "Share your own abilities", detail: "Open up about your powers", type: 'share_abilities' },
        { text: "Focus on the upcoming raid", detail: "Stay mission-focused", type: 'raid_focus' }
      ],
      leadsTo: { guild_talk: 'GUILD_DISCUSSION', share_abilities: 'ABILITY_SHARING', raid_focus: 'RAID_PREPARATION' }
    }
  };

  const getCurrentStory = () => {
    return story[gameState.currentScene] || story['START'];
  };

  const currentStory = getCurrentStory();

  // Handle story choices and progression
  const handleChoice = async (choice: any) => {
    if (choice.type === 'intimate_activity') {
      setActiveActivity(choice.activityId);
      setShowIntimateActivity(true);
      return;
    }

    if (choice.type === 'combat') {
      setGameState(prev => ({ ...prev, inCombat: true }));
      setShowCombat(true);
      return;
    }

    if (['lockpicking', 'rune_sequence', 'dragon_encounter'].includes(choice.type)) {
      setActiveMiniGame(choice.type);
      setPendingChoice(choice);
      return;
    }

    const nextScene = currentStory.leadsTo?.[choice.type];
    if (nextScene && story[nextScene]) {
      setGameState(prev => ({
        ...prev,
        currentScene: nextScene
      }));
      
      const newStory = story[nextScene];
      if (newStory.narration && isNarrationEnabled) {
        await generateStoryNarration(newStory.narration);
      }
    }
  };

  // Handle chat and AI interactions
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          gameState: gameState,
          chatMessages: chatMessages.slice(-5)
        })
      });

      if (!response.ok) throw new Error('Chat request failed');
      
      const data = await response.json();
      
      const messageId = Date.now().toString();
      setChatMessages(prev => [
        ...prev,
        { sender: 'player', text: userMessage, id: `user-${messageId}` },
        { sender: 'Cha Hae-In', text: data.response, id: `ai-${messageId}` }
      ]);

      if (autoPlayVoice && !audioMuted) {
        await playVoice(data.response, !audioMuted);
      }
      
      if (data.affectionChange) {
        triggerAffectionSparkle(data.affectionChange);
      }

      if (data.gameStateUpdate) {
        setGameState(prev => ({ ...prev, ...data.gameStateUpdate }));
      }

      setCurrentBackground(data.imageUrl || currentBackground);
      setSceneBackground(data.imageUrl || sceneBackground);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        { sender: 'player', text: userMessage, id: `user-${Date.now()}` },
        { sender: 'Cha Hae-In', text: "I'm having trouble understanding right now. Could you try again?", id: `error-${Date.now()}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Affection system helpers
  const triggerAffectionSparkle = (amount: number) => {
    if (amount > 0) {
      setAffectionIncreaseAmount(amount);
      setShowAffectionIncrease(true);
      setTimeout(() => setShowAffectionIncrease(false), 2000);
    } else if (amount < 0) {
      setAffectionDecreaseAmount(Math.abs(amount));
      setShowAffectionDecrease(true);
      setTimeout(() => setShowAffectionDecrease(false), 2000);
    }
  };

  // Equipment handling
  const handleEquipItem = (item: Equipment) => {
    if (!item) return;
    
    setGameState(prev => ({
      ...prev,
      equippedGear: {
        ...prev.equippedGear,
        [item.type]: item
      }
    }));
  };

  // Initialize game and load state
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse animation-delay-300"></div>
        
        <div className="text-center relative z-10 max-w-md mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Solo Leveling
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              You are Sung Jin-Woo, the weakest E-rank hunter who will become the strongest.
            </p>
          </div>
          
          <div className="space-y-4 mb-8 text-slate-400 text-sm">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
              <p>Your journey begins at the Hunter's Association, where you're about to meet Cha Hae-In of the White Tiger Guild for the first time.</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setGameStarted(true);
              const newStory = story[gameState.currentScene];
              if (newStory.narration && isNarrationEnabled) {
                generateSceneNarration(newStory.narration);
              }
            }}
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 active:scale-95"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>Begin Your Journey</span>
              <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
            </span>
          </button>
          
          <p className="mt-6 text-xs text-slate-500">
            Experience the world through Jin-Woo's eyes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Navigation Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-600/30 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Solo Leveling
          </h1>
          <div className="flex space-x-2 flex-wrap">
            <button onClick={() => setShowProfile(true)} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm">Profile</button>
            <button onClick={() => setShowSkillTree(true)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">Skills</button>
            <button onClick={() => setShowInventory(true)} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm">Inventory</button>
            <button onClick={() => setShowEquipment(true)} className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-sm">Equipment</button>
            <button onClick={() => setShowShop(true)} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-sm">Shop</button>
            <button onClick={() => setShowDailyLife(true)} className="px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors text-sm">Daily Life</button>
            <button onClick={() => setShowGateRaid(true)} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm">Gate Raids</button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Story Content */}
          <div 
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-600/30"
            style={{
              backgroundImage: `linear-gradient(rgba(30, 41, 59, 0.8), rgba(30, 41, 59, 0.8)), url(${currentBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <h2 className="text-2xl font-bold mb-4">{currentStory.narration}</h2>
            
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto" ref={chatContainerRef}>
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
              
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
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
            
            {/* Story Choices */}
            <div className="space-y-3 mb-6">
              {currentStory.choices.map((choice, index) => (
                <EnhancedChoiceButton
                  key={index}
                  choice={choice}
                  index={index}
                  isActive={index === currentChoiceIndex}
                  onClick={() => handleChoice(choice)}
                />
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Chat with Cha Hae-In..."
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleChatSubmit}
                disabled={isLoading || !chatInput.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Stats Footer */}
      <div className="bg-slate-800 p-4 border-t border-slate-600">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm">
          <div className="flex space-x-6">
            <div>Level: {gameState.level}</div>
            <div>Health: {gameState.health}/{gameState.maxHealth}</div>
            <div>Mana: {gameState.mana}/{gameState.maxMana}</div>
            <div>Gold: {gameState.gold?.toLocaleString() || 0}</div>
            <div>Affection: {gameState.affection}</div>
          </div>
          <div className="text-slate-400">
            Scene: {gameState.currentScene}
          </div>
        </div>
      </div>

      {/* Modals and Systems */}
      {showProfile && (
        <CharacterProfile
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showSkillTree && (
        <SkillTree
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setShowSkillTree(false)}
        />
      )}

      {showInventory && (
        <InventorySystem
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setShowInventory(false)}
        />
      )}

      {showEquipment && (
        <EquipmentSystem
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setShowEquipment(false)}
          onEquip={handleEquipItem}
        />
      )}

      {showShop && (
        <UnifiedShop
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setShowShop(false)}
        />
      )}

      {showDailyLife && (
        <DailyLifeHubModal
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setShowDailyLife(false)}
          onOpenActivity={(activityId) => {
            setActiveActivity(activityId);
            setShowIntimateActivity(true);
          }}
        />
      )}

      {showGateRaid && (
        <EnhancedGateRaidSystem
          isOpen={showGateRaid}
          onClose={() => setShowGateRaid(false)}
          gameState={gameState}
          setGameState={setGameState}
        />
      )}

      {showIntimateActivity && activeActivity && (
        <IntimateActivityModal
          isOpen={showIntimateActivity}
          onClose={() => {
            setShowIntimateActivity(false);
            setActiveActivity(null);
          }}
          activityId={activeActivity}
          gameState={gameState}
          setGameState={setGameState}
        />
      )}

      {showCombat && (
        <CombatSystem
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setShowCombat(false)}
          onVictory={() => {
            setGameState(prev => ({ ...prev, inCombat: false }));
            setShowCombat(false);
          }}
        />
      )}

      {/* Mini Games */}
      {activeMiniGame === 'lockpicking' && (
        <LockPickingGame
          onSuccess={() => {
            setActiveMiniGame(null);
            if (pendingChoice) handleChoice(pendingChoice);
            setPendingChoice(null);
          }}
          onFailure={() => setActiveMiniGame(null)}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {activeMiniGame === 'rune_sequence' && (
        <RuneSequenceGame
          onSuccess={() => {
            setActiveMiniGame(null);
            if (pendingChoice) handleChoice(pendingChoice);
            setPendingChoice(null);
          }}
          onFailure={() => setActiveMiniGame(null)}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {activeMiniGame === 'dragon_encounter' && (
        <DragonEncounterGame
          onSuccess={() => {
            setActiveMiniGame(null);
            if (pendingChoice) handleChoice(pendingChoice);
            setPendingChoice(null);
          }}
          onFailure={() => setActiveMiniGame(null)}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {/* Affection Feedback */}
      {showAffectionIncrease && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-green-400 text-2xl font-bold animate-bounce">
            +{affectionIncreaseAmount} Affection!
          </div>
        </div>
      )}

      {showAffectionDecrease && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-red-400 text-2xl font-bold animate-bounce">
            -{affectionDecreaseAmount} Affection
          </div>
        </div>
      )}
    </div>
  );
}