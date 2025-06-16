import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Crown, Zap, Coins, User, Sword, Star, 
  Camera, Eye, MapPin, Clock, Sun, Moon, CloudRain,
  MessageCircle, Gift, Coffee, Home, Building, Dumbbell,
  ShoppingCart, Calendar, Battery, Award, Package, X, Brain, Target, BookOpen, Wand2, Power, Bell
} from 'lucide-react';

import { DailyLifeHubComplete } from '@/components/DailyLifeHubComplete';
import { HunterCommunicatorMobile } from '@/components/HunterCommunicatorMobile';
import { WorldMapSystem8 } from '@/components/WorldMapSystem8';
import { UnifiedShop } from '@/components/UnifiedShop';
import { UltimateCombatSystem } from '@/components/UltimateCombatSystem';
import { PlayerProgressionSystem16 } from '@/components/PlayerProgressionSystem16';
import WorldMap from '@/components/WorldMapSimple';
import { CreatorPortalDashboard } from '@/components/CreatorPortalDashboard';
import { RoleSelectionScreen } from '@/components/RoleSelectionScreen';

interface CoreStats {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
}

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
  gold?: number;
  intimacyLevel?: number;
  energy?: number;
  maxEnergy?: number;
  experience?: number;
  maxExperience?: number;
  apartmentTier?: number;
  playerId?: string;
  activeQuests?: any[];
  completedQuests?: any[];
  intelligence?: number;
  storyFlags?: {
    redGateUnlocked?: boolean;
    dungeonAccessGranted?: boolean;
    tutorialCompleted?: boolean;
    firstMissionActive?: boolean;
  };
  hunterRank?: string;
  stats?: CoreStats;
  unspentStatPoints?: number;
  unspentSkillPoints?: number;
  storyProgress?: number;
  unlockedActivities?: string[];
  hasPlushSofa?: boolean;
  hasEntertainmentSystem?: boolean;
  ownedFurniture?: string[];
  sharedMemories?: any[];
  raidSynergyBuff?: number;
  currentRaidGate?: string;
  raidContext?: string;
  prevailingMood?: string;
  synergyFillRate?: number;
  romanticMilestone?: boolean;
  deepConversationUnlocked?: boolean;
}

interface Notification {
  id: string;
  type: 'message' | 'quest' | 'episode_available' | 'success' | 'warning';
  title: string;
  content: string;
  timestamp: Date;
  action?: () => void;
}

export default function SoloLevelingSpatial() {
  // Core state management
  const [selectedRole, setSelectedRole] = useState<'none' | 'player' | 'creator'>('none');
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 0,
    currentScene: 'world_map',
    inventory: [],
    inCombat: false,
    gold: 1000,
    energy: 100,
    maxEnergy: 100,
    stats: {
      strength: 10,
      agility: 10,
      vitality: 10,
      intelligence: 10,
      sense: 10
    }
  });
  
  // UI state management
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [showCommunicator, setShowCommunicator] = useState(false);
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [showUltimateCombat, setShowUltimateCombat] = useState(false);
  const [showCharacterProgression, setShowCharacterProgression] = useState(false);
  const [monarchAuraVisible, setMonarchAuraVisible] = useState(true);
  
  const [playerLocation, setPlayerLocation] = useState('player_apartment');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [gameTime, setGameTime] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [weather, setWeather] = useState('clear');
  
  // Time and weather management
  const getCurrentTimeOfDay = (timeToCheck?: Date) => {
    const time = timeToCheck || gameTime;
    const hour = time.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };
  
  // Initialize time
  useEffect(() => {
    setTimeOfDay(getCurrentTimeOfDay());
    const timer = setInterval(() => {
      const newTime = new Date();
      setGameTime(newTime);
      setTimeOfDay(getCurrentTimeOfDay(newTime));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Role selection check
  if (selectedRole === 'none') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <RoleSelectionScreen 
          onRoleSelect={setSelectedRole}
        />
      </div>
    );
  }

  // Creator mode
  if (selectedRole === 'creator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <CreatorPortalDashboard onLogout={() => setSelectedRole('none')} />
      </div>
    );
  }

  // Main spatial interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Player Status */}
          <motion.div
            className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-purple-500/30"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">Level {gameState.level}</div>
                <div className="text-purple-300 text-xs">S-Rank Hunter</div>
              </div>
            </div>
          </motion.div>

          {/* Health & Mana */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-purple-500/30">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <Progress value={(gameState.health / gameState.maxHealth) * 100} className="w-16 h-2" />
                <span className="text-white text-xs">{gameState.health}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <Progress value={(gameState.mana / gameState.maxMana) * 100} className="w-16 h-2" />
                <span className="text-white text-xs">{gameState.mana}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time & Weather */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="text-white text-sm">
              {timeOfDay === 'morning' && <Sun className="w-4 h-4 text-yellow-400" />}
              {timeOfDay === 'afternoon' && <Sun className="w-4 h-4 text-orange-400" />}
              {timeOfDay === 'evening' && <CloudRain className="w-4 h-4 text-purple-400" />}
              {timeOfDay === 'night' && <Moon className="w-4 h-4 text-blue-400" />}
            </div>
            <div className="text-white text-sm capitalize">{timeOfDay}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-24 px-4 pb-4 relative z-10">
        {/* Welcome Message */}
        {gameState.currentScene === 'world_map' && !showWorldMap && !showDailyLifeHub && !showCommunicator && !showUnifiedShop && !showUltimateCombat && !showCharacterProgression && (
          <div className="max-w-4xl mx-auto text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to Seoul, <span className="text-purple-400">Monarch</span>
              </h1>
              <p className="text-purple-200 text-lg mb-6">
                Your journey as the Shadow Monarch continues. Cha Hae-In awaits your presence.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setShowWorldMap(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Explore Seoul
                </Button>
                <Button
                  onClick={() => setShowDailyLifeHub(true)}
                  variant="outline"
                  className="border-purple-500/50 hover:bg-purple-500/20"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Daily Life
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* World Map */}
        {showWorldMap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <WorldMap
              gameState={gameState}
              playerLocation={playerLocation}
              onLocationSelect={(locationId) => {
                setPlayerLocation(locationId);
                setShowWorldMap(false);
              }}
              timeOfDay={timeOfDay}
              gameTime={gameTime}
            />
          </motion.div>
        )}

        {/* Daily Life Hub */}
        {showDailyLifeHub && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <DailyLifeHubComplete
              isVisible={true}
              onActivitySelect={(activity) => setShowDailyLifeHub(false)}
              playerStats={gameState.stats || { strength: 10, agility: 10, vitality: 10, intelligence: 10, sense: 10 }}
              timeOfDay={timeOfDay}
            />
          </motion.div>
        )}

        {/* Hunter Communicator */}
        {showCommunicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <HunterCommunicatorMobile
              isVisible={true}
              onQuestAccept={(quest) => console.log('Quest accepted:', quest)}
              onNewMessage={(message) => console.log('New message:', message)}
            />
          </motion.div>
        )}

        {/* Unified Shop */}
        {showUnifiedShop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <UnifiedShop
              gameState={gameState}
              onClose={() => setShowUnifiedShop(false)}
            />
          </motion.div>
        )}

        {/* Ultimate Combat System */}
        {showUltimateCombat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <UltimateCombatSystem
              gameState={gameState}
              onClose={() => setShowUltimateCombat(false)}
            />
          </motion.div>
        )}

        {/* Character Progression */}
        {showCharacterProgression && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <PlayerProgressionSystem16
              gameState={gameState}
              onClose={() => setShowCharacterProgression(false)}
            />
          </motion.div>
        )}
      </div>

      {/* Monarch's Aura - Main Navigation */}
      {monarchAuraVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative">
            {/* Main Aura Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-full shadow-2xl border-2 border-purple-400/50 flex items-center justify-center relative overflow-hidden"
              onClick={() => setMonarchAuraVisible(!monarchAuraVisible)}
            >
              <Crown className="w-8 h-8 text-white z-10" />
              
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.button>

            {/* Navigation Menu */}
            <div className="absolute bottom-20 right-0 flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowWorldMap(true)}
                className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
              >
                <MapPin className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDailyLifeHub(true)}
                className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
              >
                <Home className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCommunicator(true)}
                className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowUnifiedShop(true)}
                className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowUltimateCombat(true)}
                className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
              >
                <Sword className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCharacterProgression(true)}
                className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-4 z-40 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-purple-500/30 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {notification.type === 'message' && <MessageCircle className="w-5 h-5 text-blue-400" />}
                {notification.type === 'quest' && <Target className="w-5 h-5 text-yellow-400" />}
                {notification.type === 'episode_available' && <BookOpen className="w-5 h-5 text-purple-400" />}
                {notification.type === 'success' && <Award className="w-5 h-5 text-green-400" />}
                {notification.type === 'warning' && <Bell className="w-5 h-5 text-orange-400" />}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{notification.title}</div>
                <div className="text-purple-200 text-xs mt-1">{notification.content}</div>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}