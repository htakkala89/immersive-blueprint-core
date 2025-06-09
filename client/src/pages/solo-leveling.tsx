import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  Zap, 
  Star, 
  Mic, 
  MicOff,
  Volume2, 
  VolumeX, 
  Send,
  Sparkles,
  Crown,
  Gem,
  Coins,
  Battery,
  ShoppingCart,
  Home,
  Settings
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
  intimacyLevel?: number;
  energy?: number;
  maxEnergy?: number;
}

export default function SoloLeveling() {
  const [gameState, setGameState] = useState<GameState>({
    level: 345,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 78,
    currentScene: 'SHADOW_MONARCH',
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

  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [showIntimateModal, setShowIntimateModal] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string>('');
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Current story content
  const currentStory = {
    narration: "You are Sung Jin-Woo, the Shadow Monarch. After countless battles and becoming the world's strongest hunter, you've realized something is missing: true heart races whenever you see S-Rank Hunter Cha Hae-In. Today, you've decided to pursue something more challenging than any dungeon boss - her heart.",
    systemMessage: "The System has granted you a new quest: Win Cha Hae-In's heart!",
    choices: [
      { text: "Accept the quest", detail: "Begin your romantic journey", type: 'accept' },
      { text: "Check your stats first", detail: "Review your current status", type: 'stats' }
    ]
  };

  // Handle choice selection
  const handleChoice = (choice: any) => {
    if (choice.type === 'stats') {
      // Show stats or navigate to stats page
      console.log('Showing stats');
    } else if (choice.type === 'accept') {
      // Accept the romantic quest
      console.log('Quest accepted');
    }
  };

  // Chat functionality
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
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
        console.log('Chat response:', data);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/api/scene-image?scene=${gameState.currentScene}')`,
          filter: 'brightness(0.7) contrast(1.1)'
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-black/60" />
      
      {/* Floating UI Elements */}
      <div className="relative z-10 h-screen flex flex-col">
        
        {/* Top Status Bar */}
        <div className="flex justify-between items-center p-4">
          {/* Left Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold">{gameState.level}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-white">{gameState.health}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-white">{gameState.mana}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Battery className="w-4 h-4 text-green-400" />
              <span className="text-white">{gameState.energy}</span>
            </div>
          </div>

          {/* Right Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold">{gameState.gold}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-white">{gameState.affection}</span>
            </div>

            {/* Action Buttons */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDailyLifeHub(true)}
              className="bg-black/40 backdrop-blur-sm border-white/20 hover:bg-white/10 text-white"
            >
              <Home className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowUnifiedShop(true)}
              className="bg-black/40 backdrop-blur-sm border-white/20 hover:bg-white/10 text-white"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAudioMuted(!audioMuted)}
              className="bg-black/40 backdrop-blur-sm border-white/20 hover:bg-white/10 text-white"
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          
          {/* Story Panel */}
          <Card className="max-w-2xl w-full bg-black/60 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-8">
              
              {/* Narration */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-purple-300">
                  Narrator
                </h2>
                <p className="text-lg leading-relaxed mb-6">
                  {currentStory.narration}
                </p>
              </div>

              {/* System Message */}
              <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-400/30">
                <h3 className="text-purple-300 font-semibold mb-2">System</h3>
                <p className="text-purple-100">{currentStory.systemMessage}</p>
              </div>

              {/* Choices */}
              <div className="space-y-3">
                {currentStory.choices.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-6 h-auto text-left justify-start bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-white text-lg">{choice.text}</div>
                      <div className="text-purple-200 text-sm mt-1">{choice.detail}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Chat Interface */}
        <div className="p-4">
          <Card className="max-w-4xl mx-auto bg-black/60 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="What do you do?"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                
                <Button 
                  onClick={sendChatMessage}
                  disabled={isLoading || !chatInput.trim()}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                >
                  <Send className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  size="lg"
                  variant={isRecording ? "destructive" : "secondary"}
                  className="px-6"
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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