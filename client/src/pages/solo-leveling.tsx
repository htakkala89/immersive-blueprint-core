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
  Smile,
  Eye,
  EyeOff
} from 'lucide-react';

import { DailyLifeHubModal } from '@/components/DailyLifeHubModal';
import { IntimateActivityModal } from '@/components/IntimateActivityModal';
import { UnifiedShop } from '@/components/UnifiedShop';
import EnergyReplenishmentModal from './EnergyReplenishmentModal';

// Game state interfaces
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
  energy?: number;
  maxEnergy?: number;
}

interface Equipment {
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
  };
  description: string;
}

interface PlayerEquipment {
  weapon?: Equipment;
  armor?: Equipment;
  accessory?: Equipment;
}

interface ShopItem {
  id: string;
  name: string;
  category: 'weapons' | 'armor' | 'accessories' | 'gifts' | 'consumables';
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
  choices: Array<{
    text: string;
    detail: string;
  }>;
}

interface ChatMessage {
  speaker: 'player' | 'cha_hae_in' | 'system' | 'narrator';
  message: string;
  timestamp: Date;
  audioUrl?: string;
}

interface ActivityOption {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  affectionGain: number;
  intimacyGain?: number;
  requiredLevel?: number;
  icon: string;
  category: 'casual' | 'romantic' | 'intimate';
}

// Main Solo Leveling component
export default function SoloLeveling() {
  // Core game state
  const [gameState, setGameState] = useState<GameState>({
    level: 345,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 78,
    currentScene: 'romantic_quest_beginning',
    inventory: [],
    inCombat: false,
    experience: 89750,
    statPoints: 15,
    skillPoints: 8,
    gold: 500,
    intimacyLevel: 65,
    energy: 85,
    maxEnergy: 100
  });

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [showIntimateModal, setShowIntimateModal] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string>('');
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  
  // Chat and interaction states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Story and progression states
  const [currentStory, setCurrentStory] = useState<StoryScene>({
    prompt: "The romantic quest begins...",
    narration: "You are Sung Jin-Woo, the Shadow Monarch. After countless battles and becoming the world's strongest hunter, you've realized something is missing: your heart races whenever you see S-Rank Hunter Cha Hae-In. Today, you've decided to pursue something more challenging than any dungeon boss - her heart.",
    choices: [
      { text: "Accept the quest", detail: "Begin your romantic journey" },
      { text: "Check your stats first", detail: "Review your current status" }
    ]
  });

  // Equipment and inventory
  const [playerEquipment, setPlayerEquipment] = useState<PlayerEquipment>({});
  
  // Image and media states
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showImageGallery, setShowImageGallery] = useState(false);

  // Chat interaction functions
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      speaker: 'player',
      message: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);
    setLoadingMessage('Cha Hae-In is thinking...');

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
        
        const aiMessage: ChatMessage = {
          speaker: 'cha_hae_in',
          message: data.response,
          timestamp: new Date(),
          audioUrl: data.audioUrl
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        
        // Update game state if provided
        if (data.gameStateUpdate) {
          setGameState(prev => ({ ...prev, ...data.gameStateUpdate }));
        }
        
        // Generate scene image if needed
        if (data.generateImage) {
          generateSceneImage();
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const formData = new FormData();
          formData.append('audio', event.data);
          
          try {
            const response = await fetch('/api/speech-to-text', {
              method: 'POST',
              body: formData
            });
            
            if (response.ok) {
              const data = await response.json();
              setChatInput(data.transcript);
            }
          } catch (error) {
            console.error('Speech to text error:', error);
          }
        }
      };
      
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

  // Story progression functions
  const handleChoice = async (choice: any) => {
    setIsLoading(true);
    setLoadingMessage('Advancing story...');

    try {
      const response = await fetch('/api/make-choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState,
          choice
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentStory(data.story);
        setGameState(prev => ({ ...prev, ...data.gameStateUpdate }));
        
        if (data.imageUrl) {
          setCurrentImage(data.imageUrl);
        }
      }
    } catch (error) {
      console.error('Choice error:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Image generation functions
  const generateSceneImage = async () => {
    try {
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setCurrentImage(data.imageUrl);
          setGeneratedImages(prev => [...prev, data.imageUrl]);
        }
      }
    } catch (error) {
      console.error('Image generation error:', error);
    }
  };

  // Activity and modal handlers
  const handleActivitySelect = (activity: any) => {
    setActiveActivity(activity.id);
    setShowIntimateModal(true);
    setShowDailyLifeHub(false);
  };

  const handleActivityAction = async (action: string, isCustom = false) => {
    try {
      const response = await fetch('/api/intimate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState,
          action,
          activityType: activeActivity,
          isCustom
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update game state
        setGameState(prev => ({ ...prev, ...data.gameStateUpdate }));
        
        // Add response to chat
        const message: ChatMessage = {
          speaker: 'cha_hae_in',
          message: data.response,
          timestamp: new Date(),
          audioUrl: data.audioUrl
        };
        
        setChatMessages(prev => [...prev, message]);
        
        // Generate image if provided
        if (data.imageUrl) {
          setCurrentImage(data.imageUrl);
          setGeneratedImages(prev => [...prev, data.imageUrl]);
        }
      }
    } catch (error) {
      console.error('Activity action error:', error);
    }
  };

  const handleImageGenerate = async (prompt: string) => {
    try {
      const response = await fetch('/api/generate-intimate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          activityId: activeActivity,
          relationshipStatus: 'married',
          intimacyLevel: gameState.intimacyLevel
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setCurrentImage(data.imageUrl);
          setGeneratedImages(prev => [...prev, data.imageUrl]);
        }
      }
    } catch (error) {
      console.error('Image generation error:', error);
    }
  };

  // Shop purchase handler
  const handlePurchase = (item: ShopItem) => {
    if (gameState.gold && gameState.gold >= item.price) {
      setGameState(prev => ({
        ...prev,
        gold: (prev.gold || 0) - item.price,
        inventory: [...prev.inventory, item]
      }));
    }
  };

  // Energy management
  const handleEnergyUse = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      energy: Math.max(0, (prev.energy || 0) - amount)
    }));
  };

  const handleEnergyRestore = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      energy: Math.min(prev.maxEnergy || 100, (prev.energy || 0) + amount)
    }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && chatInput.trim()) {
        e.preventDefault();
        sendChatMessage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [chatInput]);

  // Auto-generate initial scene image
  useEffect(() => {
    if (!currentImage) {
      generateSceneImage();
    }
  }, [gameState.currentScene]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Background Image */}
      {currentImage && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${currentImage})` }}
        />
      )}
      
      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Top Status Bar */}
        <div className="bg-black/60 backdrop-blur-sm border-b border-white/20 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            
            {/* Left Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-bold">{gameState.level}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span>{gameState.health}/{gameState.maxHealth}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span>{gameState.mana}/{gameState.maxMana}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-green-400" />
                <span>{gameState.energy}/{gameState.maxEnergy}</span>
              </div>
            </div>

            {/* Center Title */}
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Solo Leveling: Romance Quest
              </h1>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">{gameState.gold}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span>{gameState.affection}/100</span>
              </div>

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

        {/* Main Game Area */}
        <div className="flex-1 flex">
          
          {/* Story Panel */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              
              {/* Story Content */}
              <Card className="bg-black/60 backdrop-blur-md border-white/20 mb-6">
                <CardContent className="p-8">
                  
                  {/* Current Scene Image */}
                  {currentImage && (
                    <div className="mb-6">
                      <img 
                        src={currentImage}
                        alt="Current scene"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  {/* Narration */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-purple-300">
                      Narrator
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-100">
                      {currentStory.narration}
                    </p>
                  </div>

                  {/* System Message */}
                  <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-400/30">
                    <h3 className="text-purple-300 font-semibold mb-2">System</h3>
                    <p className="text-purple-100">The System has granted you a new quest: Win Cha Hae-In's heart!</p>
                  </div>

                  {/* Story Choices */}
                  <div className="space-y-3">
                    {currentStory.choices.map((choice, index) => (
                      <Button
                        key={index}
                        onClick={() => handleChoice(choice)}
                        disabled={isLoading}
                        className="w-full p-6 h-auto text-left justify-start bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300"
                      >
                        <div className="text-left">
                          <div className="font-semibold text-white text-lg">{choice.text}</div>
                          <div className="text-purple-200 text-sm mt-1">{choice.detail}</div>
                        </div>
                      </Button>
                    ))}
                  </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 text-purple-300">
                        <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                        {loadingMessage}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-96 border-l border-white/20 bg-black/40 backdrop-blur-sm">
            <div className="h-full flex flex-col">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-white/20">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  Chat with Cha Hae-In
                </h3>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4 chat-container">
                <div className="space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.speaker === 'player' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        msg.speaker === 'player' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white/10 text-gray-100'
                      }`}>
                        <div className="text-sm font-medium mb-1">
                          {msg.speaker === 'player' ? 'You' : 'Cha Hae-In'}
                        </div>
                        <div className="text-sm">{msg.message}</div>
                        {msg.audioUrl && voiceEnabled && (
                          <audio 
                            src={msg.audioUrl} 
                            autoPlay 
                            className="hidden"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/20">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Talk to Cha Hae-In..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                    disabled={isLoading}
                  />
                  
                  <Button 
                    onClick={sendChatMessage}
                    disabled={isLoading || !chatInput.trim()}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DailyLifeHubModal
        isVisible={showDailyLifeHub}
        onClose={() => setShowDailyLifeHub(false)}
        gameState={gameState}
        onActivitySelect={handleActivitySelect}
        onImageGenerated={setCurrentImage}
      />

      <IntimateActivityModal
        isVisible={showIntimateModal}
        onClose={() => setShowIntimateModal(false)}
        onReturnToHub={() => {
          setShowIntimateModal(false);
          setShowDailyLifeHub(true);
        }}
        activityType={activeActivity as any}
        onAction={handleActivityAction}
        onImageGenerate={handleImageGenerate}
        currentResponse={chatMessages[chatMessages.length - 1]?.message}
        intimacyLevel={gameState.intimacyLevel || 0}
        affectionLevel={gameState.affection}
        generatedImage={currentImage}
      />

      <UnifiedShop
        isVisible={showUnifiedShop}
        onClose={() => setShowUnifiedShop(false)}
        playerGold={gameState.gold || 0}
        playerLevel={gameState.level}
        currentAffection={gameState.affection}
        currentIntimacy={gameState.intimacyLevel || 0}
        onPurchase={handlePurchase}
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