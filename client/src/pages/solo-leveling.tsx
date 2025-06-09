import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart, 
  Sword, 
  Shield, 
  Zap, 
  Star, 
  Gift, 
  MessageCircle, 
  Camera, 
  Mic, 
  MicOff,
  Volume2, 
  VolumeX, 
  Settings, 
  ShoppingCart, 
  Home,
  Sparkles,
  Moon,
  Sun,
  Coffee,
  Sunset,
  Crown,
  Trophy,
  Target,
  Users,
  Map,
  Book,
  Clock,
  Battery,
  Flame,
  Gem,
  Coins,
  Package,
  ArrowUp,
  ChevronRight,
  X,
  Play,
  Pause,
  RotateCcw,
  Send,
  Plus,
  Minus
} from 'lucide-react';
import { DailyLifeHubModal } from '@/components/DailyLifeHubModal';
import { IntimateActivityModal } from '@/components/IntimateActivityModal';
import { UnifiedShop } from '@/components/UnifiedShop';
import EnergyReplenishmentModal from './EnergyReplenishmentModal';

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
  energy?: number;
  maxEnergy?: number;
}

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    critRate?: number;
    critDamage?: number;
  };
  price: number;
  description: string;
}

interface EquippedGear {
  weapon?: Equipment;
  armor?: Equipment;
  accessory?: Equipment;
}

interface ShopItem {
  id: string;
  name: string;
  category: 'weapons' | 'armor' | 'gifts' | 'consumables' | 'special';
  price: number;
  description: string;
  icon: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  stats?: any;
  effect?: string;
  energyRestore?: number;
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
    experience: 0,
    statPoints: 0,
    skillPoints: 0,
    stats: {
      strength: 10,
      agility: 10,
      intelligence: 10,
      vitality: 10,
      luck: 10
    },
    skills: [],
    gold: 1000,
    equippedGear: {},
    availableEquipment: [],
    intimacyLevel: 0,
    energy: 100,
    maxEnergy: 100
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [currentBackground, setCurrentBackground] = useState('');
  const [sceneBackground, setSceneBackground] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; timestamp: number }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [inputMode, setInputMode] = useState<'choice' | 'text'>('choice');
  const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [showIntimateModal, setShowIntimateModal] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string>('');
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Audio and recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Animation states
  const [showAffectionIncrease, setShowAffectionIncrease] = useState(false);
  const [showAffectionDecrease, setShowAffectionDecrease] = useState(false);
  const [affectionIncreaseAmount, setAffectionIncreaseAmount] = useState(0);
  const [affectionDecreaseAmount, setAffectionDecreaseAmount] = useState(0);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // Story scenes
  const story: Record<string, StoryScene> = {
    'START': {
      prompt: "Jin-Woo beginning his journey as the weakest hunter, anime style.",
      narration: "You stand before the imposing Hunter's Association building, your E-rank license clutched in your trembling hand. The world of hunters awaits, filled with danger and opportunity.",
      chat: [
        { sender: 'system', text: "Welcome to Solo Leveling RPG! Your journey as the weakest hunter begins now." },
        { sender: 'Cha Hae-In', text: "Another new hunter? You seem... different from the others. Be careful out there." },
        { sender: 'player', text: "Thank you. I'll do my best to survive and grow stronger." }
      ],
      choices: [
        { text: "Enter the Association", detail: "Begin your hunter career", type: 'enter_association' },
        { text: "Train first", detail: "Prepare yourself", type: 'train' },
        { text: "Talk to Cha Hae-In", detail: "Introduce yourself properly", type: 'talk_cha' },
        { text: "Visit the shop", detail: "Buy equipment", type: 'shop' }
      ],
      leadsTo: { 
        enter_association: 'ASSOCIATION_LOBBY', 
        train: 'TRAINING_GROUNDS', 
        talk_cha: 'CHA_INTRODUCTION',
        shop: 'EQUIPMENT_SHOP'
      }
    },
    'ASSOCIATION_LOBBY': {
      prompt: "Hunter's Association lobby bustling with activity, anime style.",
      narration: "The lobby buzzes with hunters of all ranks. You see mission boards, equipment vendors, and fellow hunters discussing their latest adventures.",
      chat: [
        { sender: 'receptionist', text: "Welcome to the Hunter's Association. How can I help you today?" },
        { sender: 'player', text: "I'm looking for available dungeons suitable for my rank." },
        { sender: 'receptionist', text: "Let me check our E-rank dungeon listings for you." }
      ],
      choices: [
        { text: "Check E-rank dungeons", detail: "Safe beginner dungeons", type: 'e_dungeons' },
        { text: "Visit equipment shop", detail: "Buy gear and items", type: 'shop' },
        { text: "Rest area", detail: "Recover energy", type: 'rest' },
        { text: "Daily Life Hub", detail: "Interact with Cha Hae-In", type: 'daily_life' }
      ],
      leadsTo: { 
        e_dungeons: 'DUNGEON_SELECTION', 
        shop: 'EQUIPMENT_SHOP', 
        rest: 'REST_AREA',
        daily_life: 'DAILY_LIFE_HUB'
      }
    },
    'CHA_INTRODUCTION': {
      prompt: "Jin-Woo meeting Cha Hae-In for the first time, anime style.",
      narration: "The S-rank hunter turns to face you, her silver hair catching the light. There's something intriguing about her expression as she studies you.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're new here, aren't you? I can sense your... potential. Most hunters don't have that look in their eyes." },
        { sender: 'player', text: "Yes, I just got my license. I'm Jin-Woo. It's an honor to meet an S-rank hunter." },
        { sender: 'Cha Hae-In', text: "I'm Cha Hae-In. Stay safe out there, Jin-Woo. The dungeons can be unforgiving." }
      ],
      choices: [
        { text: "Ask for advice", detail: "Learn from an S-rank", type: 'ask_advice' },
        { text: "Thank her", detail: "Be polite and respectful", type: 'thank' },
        { text: "Ask about training", detail: "Request guidance", type: 'training_request' },
        { text: "Compliment her skills", detail: "Show admiration", type: 'compliment' }
      ],
      leadsTo: { 
        ask_advice: 'CHA_ADVICE', 
        thank: 'POLITE_FAREWELL', 
        training_request: 'TRAINING_OFFER',
        compliment: 'CHA_PLEASED'
      }
    }
  };

  // Get current story scene
  const getCurrentStory = () => {
    return story[gameState.currentScene] || story['START'];
  };

  const currentStory = getCurrentStory();

  // Save game state
  const saveGameState = (state: GameState) => {
    localStorage.setItem('soloLevelingGameState', JSON.stringify(state));
  };

  // Load game state
  const loadGameState = () => {
    const saved = localStorage.getItem('soloLevelingGameState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved game state');
      }
    }
    return null;
  };

  // Handle story progression
  const handleChoice = (choice: any) => {
    const nextScene = currentStory.leadsTo?.[choice.type];
    
    if (choice.type === 'shop') {
      setShowUnifiedShop(true);
      return;
    }
    
    if (choice.type === 'daily_life') {
      setShowDailyLifeHub(true);
      return;
    }
    
    if (nextScene && story[nextScene]) {
      setGameState(prev => ({
        ...prev,
        currentScene: nextScene
      }));
      
      // Trigger affection changes based on choice
      if (choice.type === 'compliment' || choice.type === 'thank') {
        triggerAffectionIncrease(5);
      }
    }
  };

  // Affection animation helpers
  const triggerAffectionIncrease = (amount: number) => {
    setAffectionIncreaseAmount(amount);
    setShowAffectionIncrease(true);
    setGameState(prev => ({
      ...prev,
      affection: Math.min(100, prev.affection + amount)
    }));
    
    setTimeout(() => setShowAffectionIncrease(false), 2000);
  };

  const triggerAffectionDecrease = (amount: number) => {
    setAffectionDecreaseAmount(amount);
    setShowAffectionDecrease(true);
    setGameState(prev => ({
      ...prev,
      affection: Math.max(0, prev.affection - amount)
    }));
    
    setTimeout(() => setShowAffectionDecrease(false), 2000);
  };

  // Energy management
  const consumeEnergy = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      energy: Math.max(0, (prev.energy || 100) - amount)
    }));
  };

  const restoreEnergy = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      energy: Math.min(prev.maxEnergy || 100, (prev.energy || 0) + amount)
    }));
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);
      recorder.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  // Chat functionality
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      sender: 'player',
      text: chatInput,
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState,
          userMessage: chatInput,
          context: 'solo_leveling'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setChatMessages(prev => [...prev, {
          sender: 'Cha Hae-In',
          text: data.response,
          timestamp: Date.now()
        }]);

        // Handle affection changes
        if (data.affectionChange) {
          if (data.affectionChange > 0) {
            triggerAffectionIncrease(data.affectionChange);
          } else {
            triggerAffectionDecrease(Math.abs(data.affectionChange));
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load game on mount
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      setGameState(savedState);
      setGameStarted(true);
    }

    // Update time
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-save game state
  useEffect(() => {
    if (gameStarted) {
      saveGameState(gameState);
    }
  }, [gameState, gameStarted]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Solo Leveling RPG
            </h1>
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              Level {gameState.level}
            </Badge>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span>{gameState.health}/{gameState.maxHealth}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>{gameState.mana}/{gameState.maxMana}</span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-green-400" />
              <span>{gameState.energy || 100}/{gameState.maxEnergy || 100}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEnergyModal(true)}
                className={`p-1 h-auto ${(gameState.energy || 100) < 30 ? 'animate-pulse text-red-400' : 'text-green-400'}`}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>{gameState.affection}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{gameState.gold || 0}</span>
            </div>
            <div className="text-xs opacity-70">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDailyLifeHub(true)}
              className="hover:bg-white/10"
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowUnifiedShop(true)}
              className="hover:bg-white/10"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAudioMuted(!audioMuted)}
              className="hover:bg-white/10"
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-80px)]">
        {/* Story Display */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Scene Narration */}
            <Card className="mb-6 bg-black/40 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-300">
                  {currentStory.narration}
                </h2>
                
                {/* Chat Messages */}
                <div className="space-y-3 mb-6" ref={chatContainerRef}>
                  {currentStory.chat.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === 'player' 
                          ? 'bg-blue-600 text-white' 
                          : message.sender === 'system'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}>
                        <div className="text-xs opacity-70 mb-1">
                          {message.sender === 'player' ? 'You' : 
                           message.sender === 'system' ? 'System' : 
                           message.sender}
                        </div>
                        <div className="text-sm">{message.text}</div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Live chat messages */}
                  {chatMessages.map((message, index) => (
                    <div 
                      key={`chat-${index}`}
                      className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === 'player' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-pink-600 text-white'
                      }`}>
                        <div className="text-xs opacity-70 mb-1">
                          {message.sender === 'player' ? 'You' : 'Cha Hae-In'}
                        </div>
                        <div className="text-sm">{message.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Chat Input */}
                <div className="flex gap-2 mb-4">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Chat with Cha Hae-In..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button 
                    onClick={sendChatMessage}
                    disabled={isLoading || !chatInput.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    size="sm"
                    variant={isRecording ? "destructive" : "secondary"}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                
                {/* Story Choices */}
                <div className="space-y-2">
                  {currentStory.choices.map((choice, index) => (
                    <Button
                      key={index}
                      onClick={() => handleChoice(choice)}
                      className="w-full p-4 h-auto text-left justify-start bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 transition-all duration-200"
                    >
                      <div>
                        <div className="font-semibold text-white">{choice.text}</div>
                        {choice.detail && (
                          <div className="text-sm opacity-70 mt-1">{choice.detail}</div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Affection Animations */}
      {showAffectionIncrease && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-2xl font-bold text-pink-400 animate-bounce">
            +{affectionIncreaseAmount} ❤️
          </div>
        </div>
      )}

      {showAffectionDecrease && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-2xl font-bold text-red-400 animate-bounce">
            -{affectionDecreaseAmount} 💔
          </div>
        </div>
      )}

      {/* Modals */}
      <DailyLifeHubModal
        isVisible={showDailyLifeHub}
        onClose={() => setShowDailyLifeHub(false)}
        gameState={gameState}
        onActivitySelect={(activity: any) => {
          setActiveActivity(activity.id);
          setShowIntimateModal(true);
          setShowDailyLifeHub(false);
        }}
        onImageGenerated={(imageUrl: string) => {
          console.log('Image generated:', imageUrl);
        }}
      />

      <IntimateActivityModal
        isVisible={showIntimateModal}
        onClose={() => setShowIntimateModal(false)}
        onReturnToHub={() => {
          setShowIntimateModal(false);
          setShowDailyLifeHub(true);
        }}
        activityType={activeActivity as any}
        onAction={(action: string) => {
          console.log('Action:', action);
        }}
        onImageGenerate={(prompt: string) => {
          console.log('Generating image:', prompt);
        }}
        intimacyLevel={gameState.intimacyLevel || 0}
        affectionLevel={gameState.affection}
      />

      <UnifiedShop
        isVisible={showUnifiedShop}
        onClose={() => setShowUnifiedShop(false)}
        playerGold={gameState.gold || 0}
        playerLevel={gameState.level}
        currentAffection={gameState.affection}
        currentIntimacy={gameState.intimacyLevel || 0}
        onPurchase={(item: any) => {
          setGameState(prev => ({
            ...prev,
            gold: Math.max(0, (prev.gold || 0) - item.price),
            inventory: [...prev.inventory, item]
          }));
        }}
      />

      <EnergyReplenishmentModal
        isOpen={showEnergyModal}
        onClose={() => setShowEnergyModal(false)}
        gameState={gameState}
        setGameState={setGameState}
      />
    </div>
  );
}