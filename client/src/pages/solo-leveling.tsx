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
  Crown,
  Sparkles,
  Home,
  Volume2,
  VolumeX,
  Coins,
  Battery,
  Package,
  Map,
  ShoppingCart,
  Gem,
  ArrowUp,
  Send,
  Mic,
  MicOff,
  User,
  TrendingUp,
  Users
} from 'lucide-react';

import { DailyLifeHubModal } from '@/components/DailyLifeHubModal';
import { IntimateActivityModal } from '@/components/IntimateActivityModal';
import { UnifiedShop } from '@/components/UnifiedShop';
import EnergyReplenishmentModal from '@/components/EnergyReplenishmentModal';

// Types
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

export default function SoloLeveling() {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 0,
    currentScene: 'start',
    inventory: [],
    inCombat: false,
    experience: 0,
    statPoints: 5,
    skillPoints: 0,
    stats: { strength: 10, agility: 10, intelligence: 10, vitality: 10, sense: 10 },
    skills: [],
    gold: 100,
    intimacyLevel: 1,
    energy: 100,
    maxEnergy: 100
  });

  const [currentStory, setCurrentStory] = useState<StoryScene>({
    prompt: "Welcome to Solo Leveling: Romance Quest",
    narration: "You are Sung Jin-Woo, the Shadow Monarch. After countless battles and becoming the world's strongest hunter, you've realized something is missing: your heart races whenever you see S-Rank Hunter Cha Hae-In. Today, you've decided to pursue something more challenging than any dungeon boss - her heart.",
    choices: [
      { text: "Accept the quest", detail: "Begin your romantic journey" },
      { text: "Check your stats first", detail: "Review your current status" }
    ]
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [audioMuted, setAudioMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Modal states
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [showIntimateModal, setShowIntimateModal] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string>('');
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showRaidModal, setShowRaidModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  
  // Chat and interaction states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  
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
        
        // Auto-generate scene image for every response
        setTimeout(() => {
          generateSceneImage();
        }, 500);
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
      setMediaRecorder(recorder);
      setIsRecording(true);
      recorder.start();
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
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
        } else {
          // Auto-generate scene image for new story content
          setTimeout(() => {
            generateSceneImage();
          }, 1000);
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
      setIsLoading(true);
      setLoadingMessage("Generating scene image...");
      
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameState: {
            ...gameState,
            narration: currentStory.narration || "Shadow Monarch Sung Jin-Woo with S-Rank Hunter Cha Hae-In in a romantic scene",
            currentScene: gameState.currentScene || "romantic",
            storyPath: "romance_path",
            level: gameState.level || 1,
            affectionLevel: gameState.affection || 50
          }
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
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Activity and modal handlers
  const handleActivitySelect = (activity: any) => {
    setActiveActivity(activity.id);
    setShowDailyLifeHub(false);
    setShowIntimateModal(true);
  };

  const handlePurchase = (item: any) => {
    if ((gameState.gold || 0) >= item.price) {
      setGameState(prev => ({
        ...prev,
        gold: (prev.gold || 0) - item.price,
        inventory: [...prev.inventory, item]
      }));
    }
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

  // Auto-generate scene images for real-time immersion
  useEffect(() => {
    if (currentStory.narration) {
      generateSceneImage();
    }
  }, [currentStory.narration]);

  // Auto-generate when game state changes significantly
  useEffect(() => {
    if (gameState.currentScene && currentStory.narration) {
      generateSceneImage();
    }
  }, [gameState.currentScene, gameState.affection]);

  // Auto-generate initial scene image
  useEffect(() => {
    if (!currentImage) {
      generateSceneImage();
    }
  }, [gameState.currentScene]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
        <div className="bg-black/60 backdrop-blur-sm border-b border-white/20 p-3 lg:p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            
            {/* Left Stats */}
            <div className="flex items-center gap-3 lg:gap-6">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
                <span className="text-lg lg:text-xl font-bold">{gameState.level}</span>
              </div>

              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
                <Progress value={(gameState.health / gameState.maxHealth) * 100} className="w-16 lg:w-20 h-2" />
                <span className="text-xs lg:text-sm text-gray-300">{gameState.health}/{gameState.maxHealth}</span>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                <Progress value={(gameState.mana / gameState.maxMana) * 100} className="w-16 lg:w-20 h-2" />
                <span className="text-xs lg:text-sm text-gray-300">{gameState.mana}/{gameState.maxMana}</span>
              </div>

              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                <Progress value={((gameState.energy || 0) / (gameState.maxEnergy || 100)) * 100} className="w-16 lg:w-20 h-2" />
                <span className="text-xs lg:text-sm text-gray-300">{gameState.energy || 0}/{gameState.maxEnergy || 100}</span>
              </div>
            </div>

            {/* Title */}
            <div className="hidden lg:block">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Solo Leveling: Romance Quest
              </h1>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
                <span className="font-bold text-sm lg:text-base">{gameState.gold}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-pink-400" />
                <span className="text-sm lg:text-base">{gameState.affection}/100</span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDailyLifeHub(true)}
                className="hover:bg-white/10 p-1 lg:p-2"
                title="Daily Life Hub"
              >
                <Home className="w-3 h-3 lg:w-4 lg:h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowInventoryModal(true)}
                className="hover:bg-white/10 p-1 lg:p-2"
                title="Inventory"
              >
                <Package className="w-3 h-3 lg:w-4 lg:h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowUnifiedShop(true)}
                className="hover:bg-white/10 p-1 lg:p-2"
                title="Shop"
              >
                <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAudioMuted(!audioMuted)}
                className="hover:bg-white/10 p-1 lg:p-2"
                title="Audio"
              >
                {audioMuted ? <VolumeX className="w-3 h-3 lg:w-4 lg:h-4" /> : <Volume2 className="w-3 h-3 lg:w-4 lg:h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Game Area - Mobile First Responsive */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
          
          {/* Image Panel - Permanent & Responsive */}
          <div className="w-full lg:w-80 xl:w-96 order-1">
            <Card className="bg-black/70 backdrop-blur-md border-purple-500/30 h-64 lg:h-96">
              <CardContent className="p-4 h-full">
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm lg:text-base font-semibold text-white">Current Scene</h3>
                    <Button 
                      size="sm"
                      onClick={generateSceneImage} 
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700 text-xs px-2 py-1"
                    >
                      {isLoading ? "..." : "Generate"}
                    </Button>
                  </div>
                  
                  <div className="flex-1 relative">
                    {currentImage ? (
                      <img 
                        src={currentImage}
                        alt="Current scene"
                        className="w-full h-full object-cover rounded-lg border border-purple-400/30 shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-400/20 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Camera className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2" />
                          <p className="text-xs lg:text-sm">Click Generate to create scene image</p>
                        </div>
                      </div>
                    )}
                    
                    {isLoading && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p className="text-xs">Generating...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Story Panel */}
          <div className="flex-1 order-2 min-h-0">
            <div className="h-full flex flex-col">
              
              {/* Story Content */}
              <Card className="bg-black/60 backdrop-blur-md border-white/20 flex-1 mb-4">
                <CardContent className="p-4 lg:p-6 h-full overflow-y-auto">
                  
                  {/* Narration */}
                  <div className="mb-6">
                    <h2 className="text-lg lg:text-xl font-semibold mb-4 text-purple-300">
                      Narrator
                    </h2>
                    <p className="text-sm lg:text-base text-gray-200 leading-relaxed mb-6">
                      {currentStory.narration}
                    </p>
                  </div>

                  {/* System Message */}
                  <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-400/30">
                    <h3 className="text-purple-300 font-semibold mb-2">System</h3>
                    <p className="text-purple-100 text-sm lg:text-base">The System has granted you a new quest: Win Cha Hae-In's heart!</p>
                  </div>

                  {/* Story Choices */}
                  <div className="space-y-3">
                    {currentStory.choices.map((choice, index) => (
                      <Button
                        key={index}
                        onClick={() => handleChoice(choice)}
                        disabled={isLoading}
                        className="w-full p-4 lg:p-6 h-auto text-left justify-start bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300"
                      >
                        <div className="text-left">
                          <div className="font-semibold text-white text-sm lg:text-lg">{choice.text}</div>
                          <div className="text-purple-200 text-xs lg:text-sm mt-1">{choice.detail}</div>
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

          {/* Chat Panel - Mobile Responsive */}
          <div className="w-full lg:w-96 order-3">
            <Card className="bg-black/60 backdrop-blur-md border-white/20 h-80 lg:h-full">
              <CardContent className="p-4 h-full">
                <div className="h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/20">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-white">Chat with Cha Hae-In</h3>
                      <p className="text-xs text-gray-400">Your S-Rank partner</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto mb-3 space-y-3">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.speaker === 'player' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-lg text-sm ${
                          msg.speaker === 'player' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-700 text-gray-100'
                        }`}>
                          <div className="text-xs font-medium mb-1">
                            {msg.speaker === 'player' ? 'You' : 'Cha Hae-In'}
                          </div>
                          <div>{msg.message}</div>
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

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Talk to Cha Hae-In..."
                      className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-sm"
                      disabled={isLoading}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
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
              </CardContent>
            </Card>
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
        activityType={activeActivity as 'shower_together' | 'cuddle_together' | 'bedroom_intimacy' | 'make_love' | null}
        onAction={(action) => console.log('Action:', action)}
        intimacyLevel={gameState.intimacyLevel || 1}
        affectionLevel={gameState.affection}
        onImageGenerate={(prompt) => {
          fetch('/api/generate-intimate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, activityId: activeActivity })
          })
          .then(res => res.json())
          .then(data => {
            if (data.imageUrl) {
              setCurrentImage(data.imageUrl);
            }
          });
        }}
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
        isVisible={showEnergyModal}
        onClose={() => setShowEnergyModal(false)}
        currentEnergy={gameState.energy || 0}
        maxEnergy={gameState.maxEnergy || 100}
        playerGold={gameState.gold || 0}
        onEnergyRestore={(amount, cost) => {
          setGameState(prev => ({
            ...prev,
            energy: Math.min((prev.energy || 0) + amount, prev.maxEnergy || 100),
            gold: (prev.gold || 0) - cost
          }));
        }}
      />
    </div>
  );
}