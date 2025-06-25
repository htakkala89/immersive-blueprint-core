import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Crown, Zap, Coins, ShoppingCart, Calendar, 
  Send, Volume2, VolumeX, User, Sword, Star, Sparkles,
  BookOpen, Camera, RefreshCw, BarChart3, Battery,
  MapPin, Clock, Coffee, Home, Dumbbell, Building,
  Moon, Sun, CloudRain, Eye, MessageCircle, Gift
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

interface ChatMessage {
  speaker: 'player' | 'cha_hae_in' | 'system' | 'narrator';
  message: string;
  timestamp: Date;
  audioUrl?: string;
  location?: string;
  activity?: string;
}

interface WorldLocation {
  id: string;
  name: string;
  description: string;
  icon: any;
  chaHaeInPresent: boolean;
  currentActivity?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: string;
}

export default function SoloLevelingImmersive() {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 25,
    currentScene: 'hunter_association',
    inventory: [],
    inCombat: false,
    gold: 1000,
    intimacyLevel: 1,
    energy: 80,
    maxEnergy: 100
  });

  const [currentLocation, setCurrentLocation] = useState('hunter_association');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');
  const [chaHaeInActivity, setChaHaeInActivity] = useState('training');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  // Modal states
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [showIntimateModal, setShowIntimateModal] = useState(false);
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  const worldLocations: WorldLocation[] = [
    {
      id: 'hunter_association',
      name: 'Hunter Association',
      description: 'Professional headquarters for S-Rank hunters',
      icon: Building,
      chaHaeInPresent: true,
      currentActivity: 'reviewing mission reports',
      timeOfDay,
      weather: 'clear'
    },
    {
      id: 'training_facility',
      name: 'Training Facility',
      description: 'State-of-the-art combat training center',
      icon: Dumbbell,
      chaHaeInPresent: false,
      timeOfDay,
      weather: 'clear'
    },
    {
      id: 'coffee_shop',
      name: 'Hunter Café',
      description: 'Cozy café popular among hunters',
      icon: Coffee,
      chaHaeInPresent: timeOfDay === 'morning',
      currentActivity: timeOfDay === 'morning' ? 'having morning coffee' : undefined,
      timeOfDay,
      weather: 'clear'
    },
    {
      id: 'cha_apartment',
      name: "Cha Hae-In's Apartment",
      description: 'Her private residence (invitation required)',
      icon: Home,
      chaHaeInPresent: timeOfDay === 'evening' || timeOfDay === 'night',
      currentActivity: timeOfDay === 'evening' ? 'relaxing at home' : 'sleeping',
      timeOfDay,
      weather: 'clear'
    }
  ];

  const getWeatherIcon = () => {
    switch (timeOfDay) {
      case 'morning': return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'afternoon': return <Sun className="w-5 h-5 text-orange-400" />;
      case 'evening': return <CloudRain className="w-5 h-5 text-purple-400" />;
      case 'night': return <Moon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getCurrentLocationData = () => {
    return worldLocations.find(loc => loc.id === currentLocation) || worldLocations[0];
  };

  const sendContextualMessage = async (messageType: 'approach' | 'observe' | 'gift' | 'custom', customMessage?: string) => {
    const locationData = getCurrentLocationData();
    let message = '';
    
    switch (messageType) {
      case 'approach':
        message = `*approaches Cha Hae-In at the ${locationData.name}*`;
        break;
      case 'observe':
        message = `*quietly observes Cha Hae-In ${locationData.currentActivity || 'in the area'}*`;
        break;
      case 'gift':
        message = '*offers a small gift*';
        break;
      case 'custom':
        message = customMessage || '';
        break;
    }

    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      speaker: 'player',
      message,
      timestamp: new Date(),
      location: currentLocation,
      activity: locationData.currentActivity
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          gameState,
          context: {
            location: currentLocation,
            timeOfDay,
            chaActivity: locationData.currentActivity,
            weather: locationData.weather,
            affectionLevel: gameState.affection
          },
          voiceEnabled 
        })
      });
      
      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        speaker: 'cha_hae_in',
        message: data.response,
        timestamp: new Date(),
        audioUrl: data.audioUrl,
        location: currentLocation
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      if (data.gameState) {
        setGameState(data.gameState);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLocation = (locationId: string) => {
    setCurrentLocation(locationId);
    setCurrentImage(null);
    
    // Generate new scene image for location
    fetch('/api/generate-scene-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        gameState: { ...gameState, currentScene: locationId },
        location: locationId,
        timeOfDay
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
      }
    });

    // Add system message about location change
    const locationData = worldLocations.find(loc => loc.id === locationId);
    setChatMessages(prev => [...prev, {
      speaker: 'system',
      message: `You've arrived at ${locationData?.name}. ${locationData?.chaHaeInPresent ? `Cha Hae-In is here, ${locationData.currentActivity}.` : 'Cha Hae-In is not currently here.'}`,
      timestamp: new Date(),
      location: locationId
    }]);
  };

  const handleActivitySelect = (activity: any) => {
    const activityId = typeof activity === 'string' ? activity : activity.id;
    setActiveActivity(activityId);
    setShowDailyLifeHub(false);
    setShowIntimateModal(true);
  };

  // Generate initial scene
  useEffect(() => {
    fetch('/api/generate-scene-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        gameState,
        location: currentLocation,
        timeOfDay
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
      }
    });
  }, []);

  // Simulate time progression
  useEffect(() => {
    const interval = setInterval(() => {
      const times: Array<'morning' | 'afternoon' | 'evening' | 'night'> = ['morning', 'afternoon', 'evening', 'night'];
      const currentIndex = times.indexOf(timeOfDay);
      const nextIndex = (currentIndex + 1) % times.length;
      setTimeOfDay(times[nextIndex]);
    }, 120000); // Change every 2 minutes

    return () => clearInterval(interval);
  }, [timeOfDay]);

  const locationData = getCurrentLocationData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      
      {/* Immersive Header with World Context */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                  <Sword className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Solo Leveling World</h1>
                  <p className="text-purple-300 text-sm">Living Adventure</p>
                </div>
              </div>
              
              {/* World Status */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300">{locationData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 capitalize">{timeOfDay}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getWeatherIcon()}
                  <span className="text-yellow-300">{locationData.weather}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                variant={voiceEnabled ? "default" : "outline"}
                size="sm"
                className={`${voiceEnabled ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-400'}`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        
        {/* Left Sidebar - World Navigation & Character */}
        <div className="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col">
          
          {/* Character Status */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                <div className="w-full h-full rounded-full bg-slate-900/80 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sung Jin-Woo</h2>
                <p className="text-purple-300">Shadow Monarch</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Level {gameState.level}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-pink-400">{gameState.affection}%</div>
                <div className="text-xs text-pink-300">Affection</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-green-400">{gameState.energy}</div>
                <div className="text-xs text-green-300">Energy</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowDailyLifeHub(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Activities
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setShowUnifiedShop(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Shop
                </Button>
                <Button
                  onClick={() => setShowEnergyModal(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Battery className="w-3 h-3 mr-1" />
                  Rest
                </Button>
              </div>
            </div>
          </div>
          
          {/* World Locations */}
          <div className="flex-1 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              World Map
            </h3>
            
            <div className="space-y-3">
              {worldLocations.map((location) => (
                <Button
                  key={location.id}
                  onClick={() => changeLocation(location.id)}
                  className={`w-full p-4 h-auto justify-start text-left transition-all duration-300 ${
                    currentLocation === location.id
                      ? 'bg-purple-600/40 border-purple-400/60 text-white'
                      : 'bg-slate-800/30 hover:bg-slate-700/50 border-slate-600/30 text-slate-300'
                  }`}
                  variant="outline"
                >
                  <div className="flex items-start gap-3 w-full">
                    <location.icon className="w-5 h-5 text-purple-400 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1">{location.name}</div>
                      <div className="text-xs text-slate-400 mb-2">{location.description}</div>
                      {location.chaHaeInPresent && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                          <span className="text-pink-300 text-xs">Cha Hae-In is here</span>
                        </div>
                      )}
                      {location.currentActivity && (
                        <div className="text-xs text-blue-300 mt-1">
                          {location.currentActivity}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content - Immersive Scene */}
        <div className="flex-1 flex flex-col">
          
          {/* Scene Viewport */}
          <div className="flex-1 relative overflow-hidden">
            {currentImage ? (
              <>
                <img 
                  src={currentImage} 
                  alt={`${locationData.name} scene`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Scene Overlay UI */}
                <div className="absolute top-6 left-6">
                  <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-2">{locationData.name}</h2>
                    <p className="text-slate-300 text-sm mb-3">{locationData.description}</p>
                    {locationData.chaHaeInPresent && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                        <span className="text-pink-300 font-medium">Cha Hae-In is {locationData.currentActivity}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Interaction Buttons */}
                {locationData.chaHaeInPresent && (
                  <div className="absolute bottom-6 left-6 flex gap-3">
                    <Button
                      onClick={() => sendContextualMessage('approach')}
                      className="bg-purple-600/80 hover:bg-purple-600 backdrop-blur-sm border border-purple-400/30"
                      disabled={isLoading}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Approach
                    </Button>
                    <Button
                      onClick={() => sendContextualMessage('observe')}
                      className="bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm border border-blue-400/30"
                      disabled={isLoading}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Observe
                    </Button>
                    <Button
                      onClick={() => sendContextualMessage('gift')}
                      className="bg-pink-600/80 hover:bg-pink-600 backdrop-blur-sm border border-pink-400/30"
                      disabled={isLoading}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Offer Gift
                    </Button>
                  </div>
                )}
                
                <div className="absolute top-6 right-6">
                  <Button
                    onClick={() => {
                      setCurrentImage(null);
                      fetch('/api/generate-scene-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          gameState: { ...gameState, currentScene: currentLocation },
                          location: currentLocation,
                          timeOfDay
                        })
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
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-blue-600/30">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-xl mb-4">Loading {locationData.name}...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Contextual Chat Interface */}
          <div className="h-80 bg-black/40 backdrop-blur-xl border-t border-white/10 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-bold text-white">
                  {locationData.chaHaeInPresent ? `Interaction at ${locationData.name}` : 'No one to talk to here'}
                </h3>
              </div>
              {locationData.chaHaeInPresent && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Cha Hae-In present</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {chatMessages.filter(msg => msg.location === currentLocation).length === 0 ? (
                    <div className="text-center py-8">
                      {locationData.chaHaeInPresent ? (
                        <>
                          <Heart className="w-12 h-12 text-pink-400/50 mx-auto mb-4" />
                          <p className="text-slate-400">Use the interaction buttons to engage with Cha Hae-In</p>
                          <p className="text-slate-500 text-sm mt-2">Your actions here will affect your relationship</p>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                          <p className="text-slate-400">Cha Hae-In is not at this location</p>
                          <p className="text-slate-500 text-sm mt-2">Try visiting where she might be based on the time of day</p>
                        </>
                      )}
                    </div>
                  ) : (
                    chatMessages
                      .filter(msg => msg.location === currentLocation)
                      .map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.speaker === 'player' ? 'justify-end' : msg.speaker === 'system' ? 'justify-center' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                              msg.speaker === 'player'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : msg.speaker === 'system'
                                ? 'bg-yellow-600/20 border border-yellow-400/30 text-yellow-100 text-center'
                                : 'bg-slate-800/70 border border-pink-400/20 text-slate-200'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {locationData.chaHaeInPresent && (
              <div className="border-t border-white/10 p-4">
                <div className="flex gap-3">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Speak to Cha Hae-In at the ${locationData.name}...`}
                    className="flex-1 bg-slate-800/50 border-pink-400/30 text-white placeholder:text-slate-400 rounded-xl"
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendContextualMessage('custom', chatInput)}
                  />
                  <Button
                    onClick={() => sendContextualMessage('custom', chatInput)}
                    disabled={isLoading || !chatInput.trim()}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
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
        onPurchase={() => {}}
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