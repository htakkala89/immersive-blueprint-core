import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Crown, Zap, Coins, User, Sword, Star, 
  Camera, Eye, MapPin, Clock, Sun, Moon, CloudRain,
  MessageCircle, Gift, Coffee, Home, Building, Dumbbell,
  ShoppingCart, Calendar, Battery, Award, Package, X, Brain, Target
} from 'lucide-react';

import { DailyLifeHubComplete } from '@/components/DailyLifeHubComplete';
import { IntimateActivityModal } from '@/components/IntimateActivityModal';
import { CoffeeActivityModal } from '@/components/CoffeeActivityModal';
import { IntimateActivitySystem5 } from '@/components/IntimateActivitySystem5';
import { HunterCommunicatorSystem15 } from '@/components/HunterCommunicatorSystem15';
import { WorldMapSystem8 } from '@/components/WorldMapSystem8';
import { UnifiedShop } from '@/components/UnifiedShop';
import EnergyReplenishmentModal from '@/components/EnergyReplenishmentModal';
import { RelationshipConstellationSystem6 } from '@/components/RelationshipConstellationSystem6';
import { DungeonRaidSystem11 } from '@/components/DungeonRaidSystem11Fixed';
import { PlayerProgressionSystem16 } from '@/components/PlayerProgressionSystem16';
import { MonarchArmory } from '@/components/MonarchArmory';
import { MonarchInventorySystem } from '@/components/MonarchInventorySystem';
import { MonarchArmory2D } from '@/components/MonarchArmory2D';
import WorldMap from '@/components/WorldMap';
import WealthDisplay from '@/components/WealthDisplay';
import HunterMarket from '@/components/HunterMarket';
import HunterMarketVendors from '@/components/HunterMarketVendors';
import QuestBoard from '@/components/QuestBoard';
import LuxuryDepartmentStore from '@/components/LuxuryDepartmentStoreNew';
import { SparkleEffect } from '@/components/SparkleEffect';
import { MysticalEye } from '@/components/MysticalEye';
import GangnamFurnishings from '@/components/GangnamFurnishings';
import LuxuryRealtor from '@/components/LuxuryRealtor';
import { LocationInteractiveNodes } from '@/components/LocationInteractiveNodes';
import { NarrativeProgressionSystem9 } from '@/components/NarrativeProgressionSystem9';
import { QuestLogSystem3 } from '@/components/QuestLogSystem3';
import ItemInspectionView from '@/components/ItemInspectionView';

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
  storyFlags?: {
    redGateUnlocked?: boolean;
    dungeonAccessGranted?: boolean;
    tutorialCompleted?: boolean;
    firstMissionActive?: boolean;
  };
  // System 16: Player Progression
  hunterRank?: string;
  stats?: CoreStats;
  unspentStatPoints?: number;
  unspentSkillPoints?: number;
  storyProgress?: number;
  // System 4: Daily Life Hub - Unlocked Activities
  unlockedActivities?: string[];
}

interface WorldLocation {
  id: string;
  name: string;
  description: string;
  backgroundImage: string;
  chaHaeInPresent: boolean;
  chaActivity: string;
  chaPosition: { x: number; y: number };
  chaExpression: 'neutral' | 'happy' | 'focused' | 'shy' | 'loving';
  interactiveElements: Array<{
    id: string;
    name: string;
    position: { x: number; y: number };
    action: string;
  }>;
}

export default function SoloLevelingSpatial() {
  // Core game state
  const [gameState, setGameState] = useState<GameState>({
    level: 15,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 45,
    currentScene: 'apartment',
    inventory: [],
    inCombat: false,
    gold: 2500000,
    intimacyLevel: 25,
    energy: 85,
    maxEnergy: 100,
    experience: 1250,
    maxExperience: 2000,
    apartmentTier: 2,
    playerId: 'sung_jin_woo',
    activeQuests: [],
    completedQuests: [],
    storyFlags: {
      redGateUnlocked: true,
      dungeonAccessGranted: true,
      tutorialCompleted: true,
      firstMissionActive: false
    },
    hunterRank: 'S-Rank',
    stats: {
      strength: 120,
      agility: 95,
      vitality: 110,
      intelligence: 85,
      sense: 100
    },
    unspentStatPoints: 15,
    unspentSkillPoints: 8,
    storyProgress: 35,
    unlockedActivities: [
      'coffee', 'training', 'lunch', 'evening_walk', 'intimate',
      'cuddling', 'first_kiss', 'bedroom_intimacy', 'intimate_massage'
    ]
  });

  // UI state
  const [playerLocation, setPlayerLocation] = useState<string>('player_apartment');
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showIntimateModal, setShowIntimateModal] = useState(false);
  const [showIntimateSystem5, setShowIntimateSystem5] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string>('');

  // Location and environment state
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rainy'>('sunny');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');
  const [showActivityNotification, setShowActivityNotification] = useState(false);

  // Quest and story state
  const [storyFlags, setStoryFlags] = useState({
    redGateUnlocked: true,
    dungeonAccessGranted: true,
    tutorialCompleted: true,
    firstMissionActive: false
  });

  // Character state
  const [chaHaeInPresent, setChaHaeInPresent] = useState(true);

  // Narrative state
  const [currentNarrativeContext, setCurrentNarrativeContext] = useState('');
  const [environmentalInteractions, setEnvironmentalInteractions] = useState<any[]>([]);

  // World locations data
  const worldLocations: Record<string, WorldLocation> = {
    hongdae_cafe: {
      id: 'hongdae_cafe',
      name: 'Cozy Hongdae Cafe',
      description: 'A warm, intimate cafe in the heart of Hongdae district',
      backgroundImage: '/images/hongdae-cafe.jpg',
      chaHaeInPresent: true,
      chaActivity: 'reading_menu',
      chaPosition: { x: 65, y: 40 },
      chaExpression: 'happy',
      interactiveElements: [
        {
          id: 'order_counter',
          name: 'Order Counter',
          position: { x: 30, y: 45 },
          action: 'Order drinks and engage in conversation'
        },
        {
          id: 'window_seat',
          name: 'Window Seat',
          position: { x: 75, y: 60 },
          action: 'Sit together and enjoy the view'
        }
      ]
    },
    player_apartment: {
      id: 'player_apartment',
      name: 'Player Apartment',
      description: 'Your comfortable living space',
      backgroundImage: '/images/apartment-living.jpg',
      chaHaeInPresent: false,
      chaActivity: 'not_present',
      chaPosition: { x: 50, y: 50 },
      chaExpression: 'neutral',
      interactiveElements: []
    }
  };

  // Get current location data
  const currentLocationData = worldLocations[playerLocation] || worldLocations.player_apartment;

  // Helper functions
  const getCurrentTimeOfDay = (timeToCheck?: Date) => {
    const now = timeToCheck || new Date();
    const hour = now.getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  const handleEnvironmentalInteraction = (interaction: any) => {
    setEnvironmentalInteractions(prev => [...prev, {
      ...interaction,
      timestamp: Date.now()
    }]);
    setCurrentNarrativeContext(interaction.action);
  };

  // Environmental interaction handler for LocationInteractiveNodes
  const handleNodeInteraction = (nodeId: string, thoughtPrompt: string, outcome: any) => {
    console.log('Node interaction triggered:', { nodeId, thoughtPrompt, outcome });
    
    switch (nodeId) {
      case 'order_counter':
        if ((gameState.gold || 0) >= 8000) {
          setGameState(prev => ({
            ...prev,
            gold: Math.max(0, (prev.gold || 0) - 8000),
            affection: Math.min(100, prev.affection + 5)
          }));
          handleEnvironmentalInteraction({
            id: 'cafe_order',
            action: 'You order drinks for both of you. [- ₩8,000]. "I\'ll have an iced americano," Cha Hae-In says with a smile. You remember her preference and order accordingly. She seems pleased that you\'re paying attention to the small details.',
            name: 'Cafe Counter',
            x: 30,
            y: 45
          });
          console.log('Cafe order - Small affection gain through attentiveness');
        } else {
          handleEnvironmentalInteraction({
            id: 'cafe_browsing',
            action: 'You browse the menu together. Cha Hae-In points to the specialty drinks. "Their signature blend looks interesting," she notes, her hunter\'s attention to detail evident even in simple moments like this.',
            name: 'Cafe Counter',
            x: 30,
            y: 45
          });
        }
        break;
        
      case 'window_seat':
        handleEnvironmentalInteraction({
          id: 'window_seating',
          action: 'You both settle into the comfortable window seats. The afternoon light frames Cha Hae-In beautifully as she gazes out at the bustling Hongdae streets. "It\'s peaceful here," she murmurs, a rare moment of relaxation for the S-Rank hunter.',
          name: 'Window Seat',
          x: 75,
          y: 60
        });
        
        // Small affection gain for choosing a romantic spot
        setGameState(prev => ({
          ...prev,
          affection: Math.min(100, prev.affection + 3)
        }));
        console.log('Window seat - Romantic choice increases affection');
        break;
        
      default:
        handleEnvironmentalInteraction({
          id: 'general_interaction',
          action: thoughtPrompt,
          name: 'General Area',
          x: 50,
          y: 50
        });
        break;
    }
  };

  // Initialize time of day
  useEffect(() => {
    setTimeOfDay(getCurrentTimeOfDay());
    const interval = setInterval(() => {
      setTimeOfDay(getCurrentTimeOfDay());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Spatial View Container */}
      <motion.div 
        className="relative w-full h-full"
        key={playerLocation}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${currentLocationData.backgroundImage})`,
            filter: 'brightness(0.85)'
          }}
        />

        {/* Interactive Nodes */}
        <LocationInteractiveNodes
          locationId={playerLocation}
          playerStats={{
            affection: gameState.affection,
            gold: gameState.gold || 0,
            apartmentTier: gameState.apartmentTier || 1
          }}
          environmentalContext={{
            weather: weather,
            timeOfDay: timeOfDay,
            storyFlags: Object.keys(storyFlags).filter((flag: string) => storyFlags[flag as keyof typeof storyFlags]),
            visitHistory: {},
            chaHaeInPresent: chaHaeInPresent
          }}
          onNodeInteraction={handleNodeInteraction}
        />

        {/* Character Presence - Cha Hae-In */}
        {currentLocationData.chaHaeInPresent && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: `${currentLocationData.chaPosition.x}%`,
              top: `${currentLocationData.chaPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative">
              {/* Character indicator */}
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full border-4 border-white/80 shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CHA</span>
              </div>
              
              {/* Activity indicator */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                {currentLocationData.chaActivity.replace('_', ' ')}
              </div>
            </div>
          </motion.div>
        )}

        {/* UI Overlays */}
        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Location Info */}
              <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-2xl p-3">
                <h2 className="text-white font-bold text-lg">{currentLocationData.name}</h2>
                <p className="text-white/70 text-sm">{currentLocationData.description}</p>
              </div>
              
              {/* Time and Weather */}
              <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-2">
                {timeOfDay === 'morning' && <Sun className="w-5 h-5 text-yellow-400" />}
                {timeOfDay === 'afternoon' && <Sun className="w-5 h-5 text-orange-400" />}
                {timeOfDay === 'evening' && <Moon className="w-5 h-5 text-blue-300" />}
                {timeOfDay === 'night' && <Moon className="w-5 h-5 text-purple-300" />}
                <span className="text-white text-sm capitalize">{timeOfDay}</span>
              </div>
            </div>

            {/* Player Stats */}
            <div className="flex items-center gap-3">
              <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-white text-sm">{gameState.affection}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">₩{(gameState.gold || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Battery className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm">{gameState.energy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-50 p-4">
          <div className="flex justify-center">
            <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
              <Button 
                onClick={() => setShowDailyLifeHub(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Daily Life
              </Button>
              
              <Button 
                onClick={() => setPlayerLocation('player_apartment')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Building className="w-4 h-4 mr-2" />
                Apartment
              </Button>
              
              {playerLocation !== 'hongdae_cafe' && (
                <Button 
                  onClick={() => setPlayerLocation('hongdae_cafe')}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  Cafe
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Environmental Narrative Display */}
        {currentNarrativeContext && (
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-black/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6">
              <p className="text-white text-center leading-relaxed">{currentNarrativeContext}</p>
              <Button 
                onClick={() => setCurrentNarrativeContext('')}
                className="mt-4 mx-auto block bg-purple-600 hover:bg-purple-700 text-white"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quest Objective Available Notification */}
      {gameState.activeQuests && gameState.activeQuests.some(quest => 
        quest.targetLocation === playerLocation && quest.progress < 100
      ) && (
        <motion.div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="bg-yellow-500/20 backdrop-blur-xl border border-yellow-400/50 rounded-2xl p-4"
            style={{ 
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 193, 7, 0.1))'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Target className="w-4 h-4 text-black" />
              </div>
              <div>
                <h3 className="text-yellow-200 font-semibold text-sm">Quest Objective Available</h3>
                <p className="text-yellow-300/80 text-xs">Look for glowing interaction points to progress your mission</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modals and UI Components */}
      <AnimatePresence>
        {showDailyLifeHub && (
          <DailyLifeHubComplete
            onClose={() => setShowDailyLifeHub(false)}
            onActivitySelect={(activity) => {
              console.log('Daily Life Hub - Activity selected:', activity);
              setSelectedActivity(activity);
              
              if (activity === 'coffee') {
                console.log('Coffee activity selected - navigating to Hongdae Cafe');
                setShowDailyLifeHub(false);
                setPlayerLocation('hongdae_cafe');
                setShowCoffeeModal(true);
              } else if (activity === 'intimate') {
                setActiveActivity('cuddling');
                setShowIntimateModal(true);
                setShowDailyLifeHub(false);
              } else {
                setShowDailyLifeHub(false);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Coffee Activity Modal */}
      <AnimatePresence>
        {showCoffeeModal && (
          <CoffeeActivityModal
            onClose={() => setShowCoffeeModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Intimate Activity Modal */}
      <AnimatePresence>
        {showIntimateModal && (
          <IntimateActivityModal
            activity={activeActivity}
            onClose={() => setShowIntimateModal(false)}
          />
        )}
      </AnimatePresence>

      {/* System 5: Intimate Activity System */}
      <AnimatePresence>
        {showIntimateSystem5 && (
          <IntimateActivitySystem5
            onClose={() => setShowIntimateSystem5(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}