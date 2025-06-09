import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Crown, Zap, Coins, ShoppingCart, Calendar, 
  Send, Volume2, VolumeX, User, Sword, Star, Sparkles,
  BookOpen, Camera, RefreshCw, BarChart3, Battery
} from 'lucide-react';

import { DailyLifeHubModal } from '@/components/DailyLifeHubModal';
import { IntimateActivityModal } from '@/components/IntimateActivityModal';
import { UnifiedShop } from '@/components/UnifiedShop';
import EnergyReplenishmentModal from '@/components/EnergyReplenishmentModal';

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

export default function SoloLevelingNew() {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 25,
    currentScene: 'training_grounds',
    inventory: [],
    inCombat: false,
    gold: 1000,
    intimacyLevel: 1,
    energy: 80,
    maxEnergy: 100
  });

  const [currentStory, setCurrentStory] = useState<StoryScene>({
    prompt: '',
    narration: "You are Sung Jin-Woo, the Shadow Monarch. After countless battles and becoming the world's strongest hunter, you've realized something is missing: your heart races whenever you see S-Rank Hunter Cha Hae-In. Today, you've decided to pursue something more challenging than any dungeon boss - her heart.",
    choices: [
      { text: "Approach her directly", detail: "Be straightforward about your feelings" },
      { text: "Start with casual conversation", detail: "Build rapport gradually" },
      { text: "Invite her on a mission together", detail: "Bond through shared experiences" }
    ]
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  // Modal states
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [showIntimateModal, setShowIntimateModal] = useState(false);
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  const handleChoice = async (choice: any) => {
    setIsLoading(true);
    setLoadingMessage('Processing your choice...');
    
    try {
      const response = await fetch('/api/process-choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice, gameState })
      });
      
      const data = await response.json();
      if (data.gameState) {
        setGameState(data.gameState);
      }
      if (data.story) {
        setCurrentStory(data.story);
      }
    } catch (error) {
      console.error('Error processing choice:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      speaker: 'player',
      message: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);
    setLoadingMessage('Cha Hae-In is typing...');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: chatInput, 
          gameState,
          voiceEnabled 
        })
      });
      
      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        speaker: 'cha_hae_in',
        message: data.response,
        timestamp: new Date(),
        audioUrl: data.audioUrl
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      if (data.gameState) {
        setGameState(data.gameState);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleActivitySelect = (activity: any) => {
    const activityId = typeof activity === 'string' ? activity : activity.id;
    setActiveActivity(activityId);
    setShowDailyLifeHub(false);
    setShowIntimateModal(true);
  };

  const handlePurchase = async (item: any) => {
    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, gameState })
      });
      
      const data = await response.json();
      if (data.gameState) {
        setGameState(data.gameState);
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
    }
  };

  // Generate initial scene image on mount
  useEffect(() => {
    fetch('/api/generate-scene-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameState })
    })
    .then(res => res.json())
    .then(data => {
      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
      }
    })
    .catch(error => console.error('Error generating scene image:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
                <Sword className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Solo Leveling: Romance Quest
                </h1>
                <p className="text-gray-300 text-sm">Interactive Romance Adventure</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                variant={voiceEnabled ? "default" : "outline"}
                size="sm"
                className={`${voiceEnabled ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-400 hover:bg-green-600/20'}`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={() => setAudioMuted(!audioMuted)}
                variant={audioMuted ? "outline" : "default"}
                size="sm"
                className={`${audioMuted ? 'border-red-600 text-red-400 hover:bg-red-600/20' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-120px)]">
          
          {/* Left Panel - Character & Stats */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            
            {/* Character Profile */}
            <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/50 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-purple-400/30 shadow-2xl">
              
              {/* Character Header */}
              <div className="relative p-6 border-b border-purple-400/20">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-900/80 flex items-center justify-center">
                      <Crown className="w-10 h-10 text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Sung Jin-Woo</h2>
                    <p className="text-purple-300">Shadow Monarch</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Level {gameState.level}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="p-6 space-y-6">
                
                {/* Resources */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-yellow-400/20">
                    <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-400">{gameState.gold || 0}</div>
                    <div className="text-xs text-yellow-300">Gold</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-green-400/20">
                    <Battery className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-400">{gameState.energy || 100}</div>
                    <div className="text-xs text-green-300">Energy</div>
                  </div>
                </div>
                
                {/* Health & Mana Progress Bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-red-300 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Health
                      </span>
                      <span className="text-red-400 font-bold">{gameState.health}/{gameState.maxHealth}</span>
                    </div>
                    <Progress 
                      value={(gameState.health / gameState.maxHealth) * 100} 
                      className="h-3 bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-blue-300 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Mana
                      </span>
                      <span className="text-blue-400 font-bold">{gameState.mana}/{gameState.maxMana}</span>
                    </div>
                    <Progress 
                      value={(gameState.mana / gameState.maxMana) * 100} 
                      className="h-3 bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-pink-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Affection
                      </span>
                      <span className="text-pink-400 font-bold">{gameState.affection}/100</span>
                    </div>
                    <Progress 
                      value={gameState.affection} 
                      className="h-3 bg-slate-700"
                    />
                  </div>
                </div>
                
                {/* Romance Progress */}
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl p-5 border border-pink-400/30">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Romance Status
                  </h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-400 mb-1">{gameState.intimacyLevel || 1}</div>
                    <div className="text-pink-300 text-sm">Intimacy Level</div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-3">
                <Button
                  onClick={() => setShowDailyLifeHub(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Daily Life Activities
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setShowUnifiedShop(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-3 rounded-xl font-semibold"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Shop
                  </Button>
                  
                  <Button
                    onClick={() => setShowEnergyModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-3 rounded-xl font-semibold"
                  >
                    <Battery className="w-4 h-4 mr-2" />
                    Energy
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Scene Image */}
            <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/50 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-purple-400/30 shadow-2xl overflow-hidden">
              <div className="relative h-80">
                {currentImage ? (
                  <>
                    <img 
                      src={currentImage} 
                      alt="Current scene" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Button
                        onClick={() => {
                          setCurrentImage(null);
                          fetch('/api/generate-scene-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ gameState })
                          })
                          .then(res => res.json())
                          .then(data => {
                            if (data.imageUrl) {
                              setCurrentImage(data.imageUrl);
                            }
                          });
                        }}
                        size="sm"
                        className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                        <p className="text-white text-sm font-medium">Current Scene</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-blue-600/30">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70 text-lg mb-4">Generating scene...</p>
                      <Button
                        onClick={() => {
                          fetch('/api/generate-scene-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ gameState })
                          })
                          .then(res => res.json())
                          .then(data => {
                            if (data.imageUrl) {
                              setCurrentImage(data.imageUrl);
                            }
                          });
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Scene
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Middle Panel - Story Content */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-gradient-to-br from-slate-900/95 via-indigo-900/50 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-indigo-400/30 shadow-2xl h-full flex flex-col">
              
              {/* Story Header */}
              <div className="border-b border-indigo-400/20 p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Shadow Monarch's Quest</h3>
                    <p className="text-indigo-300 text-lg">Romance Campaign • Chapter 1</p>
                  </div>
                </div>
              </div>
              
              {/* Story Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <ScrollArea className="h-full">
                  <div className="space-y-8">
                    
                    {/* Current Scene */}
                    <div className="bg-slate-800/50 rounded-3xl p-8 border border-indigo-400/20">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-4 h-4 bg-indigo-400 rounded-full animate-pulse"></div>
                        <h4 className="text-indigo-300 font-bold text-xl">Current Scene</h4>
                      </div>
                      <p className="text-slate-200 leading-relaxed text-lg">{currentStory.narration}</p>
                    </div>
                    
                    {/* System Quest */}
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl p-8 border border-yellow-400/30">
                      <div className="flex items-center gap-4 mb-4">
                        <Crown className="w-8 h-8 text-yellow-400" />
                        <h4 className="text-yellow-300 font-bold text-2xl">System Quest</h4>
                      </div>
                      <p className="text-yellow-100 text-lg font-medium">Win Cha Hae-In's heart and unlock the power of love!</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-300">Progress: {gameState.affection}% complete</span>
                      </div>
                    </div>
                    
                    {/* Story Choices */}
                    {currentStory.choices.length > 0 && (
                      <div className="space-y-6">
                        <h4 className="text-2xl font-bold text-white flex items-center gap-3">
                          <Sparkles className="w-8 h-8 text-purple-400" />
                          Choose Your Path
                        </h4>
                        
                        <div className="space-y-4">
                          {currentStory.choices.map((choice, index) => (
                            <Button
                              key={index}
                              onClick={() => handleChoice(choice)}
                              disabled={isLoading}
                              className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/40 hover:to-pink-600/40 border border-purple-400/30 hover:border-purple-400/60 text-white p-8 h-auto justify-start text-left transition-all duration-500 hover:scale-[1.02] rounded-3xl"
                            >
                              <div className="flex items-start gap-6 w-full">
                                <div className="bg-purple-600/40 p-4 rounded-2xl shrink-0 group-hover:bg-purple-600/70 transition-all duration-300">
                                  <Star className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xl mb-3 text-white">{choice.text}</div>
                                  {choice.detail && (
                                    <div className="text-purple-300 text-base leading-relaxed">{choice.detail}</div>
                                  )}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Loading State */}
                    {isLoading && (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center gap-4 text-purple-300">
                          <div className="animate-spin w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full"></div>
                          <span className="text-xl font-medium">{loadingMessage}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Chat */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-gradient-to-br from-slate-900/95 via-pink-900/50 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-pink-400/30 shadow-2xl h-full flex flex-col">
              
              {/* Chat Header */}
              <div className="border-b border-pink-400/20 p-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-1">
                      <div className="w-full h-full rounded-full bg-slate-900/80 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-pink-400" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Cha Hae-In</h3>
                    <p className="text-pink-300">S-Rank Hunter • Your Destiny</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Active now</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-16">
                        <Heart className="w-16 h-16 text-pink-400/50 mx-auto mb-6" />
                        <p className="text-slate-400 text-lg">Start a conversation with Cha Hae-In...</p>
                        <p className="text-slate-500 text-sm mt-2">Express your feelings and build your relationship</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.speaker === 'player' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}
                        >
                          <div
                            className={`max-w-[85%] px-6 py-4 rounded-3xl shadow-lg ${
                              msg.speaker === 'player'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-slate-800/70 border border-pink-400/20 text-slate-200'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                            <div className="text-xs opacity-70 mt-2">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Chat Input */}
              <div className="border-t border-pink-400/20 p-6">
                <div className="flex gap-3">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message to Cha Hae-In..."
                    className="flex-1 bg-slate-800/50 border-pink-400/30 text-white placeholder:text-slate-400 rounded-2xl px-6 py-4 text-sm"
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={isLoading || !chatInput.trim()}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Press Enter to send • Shift+Enter for new line</span>
                  <span>Affection: {gameState.affection}%</span>
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
  );
}