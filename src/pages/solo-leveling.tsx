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
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Dynamic Background with Parallax Effect */}
      {currentImage && (
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 transition-transform duration-1000"
            style={{ backgroundImage: `url(${currentImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-purple-900/40 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </div>
      )}
      
      {/* Animated Particles Overlay */}
      <div className="fixed inset-0 z-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400/40 rounded-full animate-ping" />
        <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-pink-400/20 rounded-full animate-bounce" />
      </div>
      
      {/* Main Game Interface */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Modern Gaming Header */}
        <div className="bg-gradient-to-r from-black/80 via-purple-900/60 to-black/80 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
          <div className="max-w-8xl mx-auto px-6 py-4">
            
            {/* Top Row - Title and Quick Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Solo Leveling
                  </h1>
                  <p className="text-purple-300 text-sm font-medium">Romance Quest • Shadow Monarch</p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowDailyLifeHub(true)}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Activities
                </Button>
                
                <Button
                  onClick={() => setShowUnifiedShop(true)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Shop
                </Button>
                
                <Button
                  onClick={() => setShowStatsModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <User className="w-5 h-5 mr-2" />
                  Stats
                </Button>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              
              {/* Level */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-yellow-300 text-xs font-medium uppercase tracking-wide">Level</p>
                    <p className="text-white text-2xl font-bold">{gameState.level}</p>
                  </div>
                </div>
              </div>
              
              {/* Health */}
              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 p-2 rounded-lg">
                    <Heart className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-red-300 text-xs font-medium uppercase tracking-wide">Health</p>
                    <div className="flex items-center gap-2">
                      <Progress value={(gameState.health / gameState.maxHealth) * 100} className="h-2 flex-1" />
                      <span className="text-white text-sm font-bold">{gameState.health}/{gameState.maxHealth}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mana */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-300 text-xs font-medium uppercase tracking-wide">Mana</p>
                    <div className="flex items-center gap-2">
                      <Progress value={(gameState.mana / gameState.maxMana) * 100} className="h-2 flex-1" />
                      <span className="text-white text-sm font-bold">{gameState.mana}/{gameState.maxMana}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Energy */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <Battery className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-300 text-xs font-medium uppercase tracking-wide">Energy</p>
                    <div className="flex items-center gap-2">
                      <Progress value={((gameState.energy || 0) / (gameState.maxEnergy || 100)) * 100} className="h-2 flex-1" />
                      <span className="text-white text-sm font-bold">{gameState.energy || 0}/{gameState.maxEnergy || 100}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Gold */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <Coins className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-yellow-300 text-xs font-medium uppercase tracking-wide">Gold</p>
                    <p className="text-white text-2xl font-bold">{gameState.gold || 0}</p>
                  </div>
                </div>
              </div>
              
              {/* Affection */}
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
                <div className="flex items-center gap-3">
                  <div className="bg-pink-500/20 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-pink-300 text-xs font-medium uppercase tracking-wide">Affection</p>
                    <div className="flex items-center gap-2">
                      <Progress value={gameState.affection} className="h-2 flex-1" />
                      <span className="text-white text-sm font-bold">{gameState.affection}/100</span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col xl:flex-row gap-6 p-6 max-w-8xl mx-auto w-full">
          
          {/* Left Panel - Scene & Visual */}
          <div className="xl:w-2/5 space-y-6">
            
            {/* Scene Viewer */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-black/90 via-purple-900/50 to-black/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
                <div className="aspect-video relative">
                  {currentImage ? (
                    <img 
                      src={currentImage}
                      alt="Current scene"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                      <div className="text-center text-purple-300">
                        <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Scene Loading...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Scene Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="space-y-2">
                        <Button 
                          onClick={generateSceneImage} 
                          disabled={isLoading}
                          className="bg-purple-600/90 hover:bg-purple-700 text-white backdrop-blur-sm border border-purple-400/30"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {isLoading ? "Generating..." : "New Scene"}
                        </Button>
                        
                        {generatedImages.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowImageGallery(true)}
                            className="bg-black/50 border-purple-400/30 text-purple-300 hover:text-white backdrop-blur-sm"
                          >
                            Gallery ({generatedImages.length})
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400/30 border-t-purple-400 mx-auto mb-4"></div>
                          <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-pink-400/20 mx-auto"></div>
                        </div>
                        <p className="text-lg font-medium">{loadingMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Story & Chat */}
          <div className="xl:w-3/5 space-y-6">
            
            {/* Story Panel */}
            <div className="bg-gradient-to-br from-black/90 via-purple-900/50 to-black/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Shadow Monarch's Quest</h3>
                  <p className="text-purple-300">Romance Campaign</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Narration */}
                <div className="bg-black/40 rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-300 font-medium">Current Scene</span>
                  </div>
                  <p className="text-gray-200 leading-relaxed text-lg">{currentStory.narration}</p>
                </div>
                
                {/* System Quest */}
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-400/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-purple-300 font-semibold">System Quest</span>
                  </div>
                  <p className="text-purple-100">Win Cha Hae-In's heart and unlock the power of love!</p>
                </div>
                
                {/* Story Choices */}
                {currentStory.choices.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-400" />
                      Choose Your Destiny
                    </h4>
                    <div className="grid gap-4">
                      {currentStory.choices.map((choice, index) => (
                        <Button
                          key={index}
                          onClick={() => handleChoice(choice)}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 border border-purple-500/40 text-white p-6 h-auto justify-start text-left transition-all duration-300 hover:scale-105 group"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div className="bg-purple-600/40 p-3 rounded-lg group-hover:bg-purple-600/60 transition-colors">
                              <Star className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg">{choice.text}</div>
                              {choice.detail && (
                                <div className="text-purple-300 mt-1">{choice.detail}</div>
                              )}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modern Chat Interface */}
            <div className="bg-gradient-to-br from-black/90 via-purple-900/50 to-black/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl">
              <div className="flex items-center gap-3 p-6 border-b border-purple-500/30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Chat with Cha Hae-In</h3>
                  <p className="text-purple-300">S-Rank Hunter • Love Interest</p>
                </div>
              </div>
              
              <div className="p-6">
                <ScrollArea className="h-96 mb-4">
                  <div className="space-y-4">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.speaker === 'player' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-3 rounded-2xl ${
                            msg.speaker === 'player'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-black/40 border border-purple-500/30 text-gray-200'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-3">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message to Cha Hae-In..."
                    className="flex-1 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={isLoading || !chatInput.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals and Overlays */}
        <DailyLifeHubModal
          isVisible={showDailyLifeHub}
          onClose={() => setShowDailyLifeHub(false)}
          gameState={gameState}
          onActivitySelect={handleActivitySelect}
          onImageGenerated={(imageUrl) => setCurrentImage(imageUrl)}
          audioMuted={audioMuted}
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
    </div>
  );
}