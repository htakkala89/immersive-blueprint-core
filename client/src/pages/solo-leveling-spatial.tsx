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
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 0,
    currentScene: 'hunter_association',
    inventory: [
      {
        id: 'red_mana_crystal_1',
        name: 'Red Mana Crystal',
        description: 'A pulsing crimson crystal harvested from a B-rank fire elemental. Contains concentrated flame magic.',
        icon: '🔴',
        type: 'mana_crystal',
        quantity: 3,
        value: 750000,
        rarity: 'rare'
      },
      {
        id: 'shadow_wolf_core_1',
        name: 'Shadow Wolf Core',
        description: 'The dark essence core of an elite shadow wolf. Highly sought after for stealth enchantments.',
        icon: '🐺',
        type: 'monster_core',
        quantity: 2,
        value: 1200000,
        rarity: 'epic'
      },
      {
        id: 'blue_mana_crystal_1',
        name: 'Blue Mana Crystal',
        description: 'A crystallized fragment of pure ice magic from a C-rank frost giant.',
        icon: '🔵',
        type: 'mana_crystal',
        quantity: 5,
        value: 300000,
        rarity: 'uncommon'
      },
      {
        id: 'drake_scale_core_1',
        name: 'Drake Scale Core',
        description: 'Legendary core from a juvenile drake. Contains immense magical power and dragon essence.',
        icon: '🐉',
        type: 'monster_core',
        quantity: 1,
        value: 5000000,
        rarity: 'legendary'
      }
    ],
    inCombat: false,
    gold: 50000000,
    intimacyLevel: 1,
    energy: 80,
    maxEnergy: 100,
    apartmentTier: 2,
    storyFlags: {
      redGateUnlocked: true,
      dungeonAccessGranted: true,
      tutorialCompleted: true,
      firstMissionActive: true
    },
    activeQuests: [],
    completedQuests: [],
    // System 16: Player Progression
    hunterRank: 'E-Rank',
    stats: {
      strength: 25,
      agility: 20,
      vitality: 18,
      intelligence: 15,
      sense: 12
    },
    unspentStatPoints: 5,
    unspentSkillPoints: 3,
    unlockedActivities: []
  });

  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');
  const [weather, setWeather] = useState<'clear' | 'rain' | 'snow' | 'cloudy'>('clear');
  const [dialogueActive, setDialogueActive] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState('');
  const [thoughtPrompts, setThoughtPrompts] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState('');
  const [monarchAuraVisible, setMonarchAuraVisible] = useState(false);
  const [narrativeLensActive, setNarrativeLensActive] = useState(false);
  const [sceneImage, setSceneImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'cha_hae_in';
    text: string;
    timestamp: Date;
  }>>([]);
  const spatialViewRef = useRef<HTMLDivElement>(null);
  const conversationScrollRef = useRef<HTMLDivElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [gestureStart, setGestureStart] = useState({ x: 0, y: 0, time: 0 });
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [chaHaeInExpression, setChaHaeInExpression] = useState<'neutral' | 'focused' | 'recognition' | 'welcoming' | 'happy' | 'romantic' | 'surprised' | 'contemplative' | 'amused' | 'concerned'>('focused');
  const [showLivingPortrait, setShowLivingPortrait] = useState(false);
  const [emotionalImage, setEmotionalImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [scheduledActivities, setScheduledActivities] = useState<any[]>([]);
  const [showActivityNotification, setShowActivityNotification] = useState(false);
  const [showActivityScheduled, setShowActivityScheduled] = useState(false);
  
  // System 2: Affection Heart System state
  const [showAffectionHeart, setShowAffectionHeart] = useState(false);
  const affectionHeartTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // System 5: Intimate Activity System state
  const [showIntimateActivity, setShowIntimateActivity] = useState(false);
  const [currentIntimateActivity, setCurrentIntimateActivity] = useState<{
    id: string;
    title: string;
  } | null>(null);
  
  // System 15: Hunter's Communicator state
  const [showCommunicator, setShowCommunicator] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'message' | 'quest';
    title: string;
    content: string;
    timestamp: Date;
  }>>([]);

  // System 16: Player Progression state
  const [showPlayerProgression, setShowPlayerProgression] = useState(false);

  // System 3: Quest Log state
  const [showQuestLog, setShowQuestLog] = useState(false);

  // System 7: Item Inspection View state
  const [showItemInspection, setShowItemInspection] = useState(false);
  const [itemInspectionCategory, setItemInspectionCategory] = useState<'jewelry' | 'clothing' | 'living_room' | 'bedroom'>('jewelry');



  // System 8: World Map state - activeQuests defined below with other quest states

  // System 9: AI Narrative Engine state
  const [showNarrativeProgression, setShowNarrativeProgression] = useState(false);
  const [storyFlags, setStoryFlags] = useState<string[]>(['beginning_journey', 'gate_clearance_quest_active']);
  const [visitHistory, setVisitHistory] = useState<Record<string, number>>({});
  const [chaHaeInPresent, setChaHaeInPresent] = useState(true);

  // Focus Animation for immersive dialogue
  const handleChaHaeInInteraction = async () => {
    console.log('Starting Cha Hae-In interaction...');
    // Step 1: Focus Animation (300ms)
    setIsFocusMode(true);
    console.log('Focus mode activated');
    
    // Step 2: Generate character image if not available
    if (!emotionalImage) {
      try {
        const getEmotionalState = () => {
          if (gameState.affection >= 80) return 'romantic_anticipation';
          if (gameState.affection >= 60) return 'warm_welcoming';
          if (gameState.affection >= 40) return 'professional_friendly';
          return 'focused_professional';
        };

        const emotion = getEmotionalState();
        const params = new URLSearchParams({
          emotion,
          location: playerLocation,
          timeOfDay
        });

        const response = await fetch(`/api/chat-scene-image?${params}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            setEmotionalImage(data.imageUrl);
          }
        }
      } catch (error) {
        console.log('Character image generation skipped');
      }
    }
    
    // Step 3: UI transitions
    setTimeout(() => {
      console.log('Starting dialogue transitions...');
      setShowLivingPortrait(true);
      setChaHaeInExpression('recognition');
      
      // Step 4: Generate context-aware dialogue
      const contextualDialogue = "Oh, Jin-Woo. Sorry, I was just finishing up this report on the Jeju Island aftermath. What's on your mind?";
      setCurrentDialogue(contextualDialogue);
      
      // Step 5: Set thought prompts
      setThoughtPrompts([
        "Just wanted to see you.",
        "Anything interesting in the report?", 
        "Ready for a break? I can handle the rest."
      ]);
      
      setDialogueActive(true);
      console.log('Dialogue activated');
      setChaHaeInExpression('welcoming');
    }, 300);
  };

  const exitFocusMode = () => {
    setIsFocusMode(false);
    setDialogueActive(false);
    setShowLivingPortrait(false);
    setChaHaeInExpression('focused');
    setThoughtPrompts([]);
    setCurrentDialogue('');
  };

  const handleGestureActivation = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Only activate in top 80px of screen for Monarch's Aura gesture
    if (clientY <= 80) {
      setIsLongPressing(true);
      
      // Start long press timer (500ms)
      longPressTimer.current = setTimeout(() => {
        if (document.body) {
          document.body.style.background = 'linear-gradient(to bottom, rgba(147, 51, 234, 0.3), transparent)';
        }
      }, 500);

      // Add drag listener for gesture completion
      const handleDragMove = (dragEvent: TouchEvent | MouseEvent) => {
        const dragY = 'touches' in dragEvent ? (dragEvent as TouchEvent).touches[0].clientY : (dragEvent as MouseEvent).clientY;
        const deltaY = dragY - clientY;
        
        // If dragged down more than 100px, activate Monarch's Aura
        if (deltaY > 100 && isLongPressing) {
          setMonarchAuraVisible(true);
          if (document.body) {
            document.body.style.background = '';
          }
          cleanupGesture();
        }
      };

      const cleanupGesture = () => {
        setIsLongPressing(false);
        if (document.body) {
          document.body.style.background = '';
        }
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('touchend', cleanupGesture);
        document.removeEventListener('mouseup', cleanupGesture);
      };

      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('touchend', cleanupGesture);
      document.addEventListener('mouseup', cleanupGesture);
    }
  };

  // Modal states
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [showIntimateModal, setShowIntimateModal] = useState(false);
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [playerLocation, setPlayerLocation] = useState('hunter_association');
  const [gameTime, setGameTime] = useState(() => {
    return new Date(); // Use real-world time
  });
  
  // Real-time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setGameTime(now);
      const currentCalculatedTime = getCurrentTimeOfDay();
      if (currentCalculatedTime !== timeOfDay) {
        setTimeOfDay(currentCalculatedTime);
      }
    };

    // Update immediately
    updateTime();
    
    // Update every minute
    const timeInterval = setInterval(updateTime, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);
  
  const [showConstellation, setShowConstellation] = useState(false);
  const [showDungeonRaid, setShowDungeonRaid] = useState(false);
  
  // Debug logging for dungeon raid state
  useEffect(() => {
    console.log('🎯 DUNGEON RAID STATE CHANGED:', showDungeonRaid);
  }, [showDungeonRaid]);
  const [showArmory, setShowArmory] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showMonarchArmory, setShowMonarchArmory] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  // Economic system states
  const [showHunterMarketVendors, setShowHunterMarketVendors] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showQuestBoard, setShowQuestBoard] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    id: string;
    type: 'gain' | 'loss';
    amount: number;
    description: string;
    timestamp: string;
  }>>([]);
  const [activeQuests, setActiveQuests] = useState<string[]>(['hunter_association']); // System 8: Active quest markers

  // System 7 Commerce - Store States
  const [showLuxuryDepartmentStore, setShowLuxuryDepartmentStore] = useState(false);
  const [showGangnamFurnishings, setShowGangnamFurnishings] = useState(false);
  const [showLuxuryRealtor, setShowLuxuryRealtor] = useState(false);
  
  // NPC Dialogue System - Simple static dialogue box
  const [showReceptionistDialogue, setShowReceptionistDialogue] = useState<{
    dialogue: string;
    position: { x: number; y: number };
  } | null>(null);
  
  // Elevator System - Floor Selection UI
  const [showFloorSelect, setShowFloorSelect] = useState(false);
  const [elevatorTransition, setElevatorTransition] = useState(false);
  
  // Cinematic Mode - For atmospheric River's Edge experience
  const [cinematicMode, setCinematicMode] = useState(false);
  
  // Developer Menu - Collapsible state
  const [showDevMenu, setShowDevMenu] = useState(true);

  // Time and scheduling system
  const getCurrentTimeOfDay = (timeToCheck?: Date) => {
    const hour = (timeToCheck || gameTime).getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  const getChaHaeInLocation = (): string | null => {
    const currentTime = timeOfDay; // Use the timeOfDay state which can be overridden by dev menu
    const affection = gameState.affection;
    
    // Deterministic location system - Cha Hae-In has a predictable schedule
    if (currentTime === 'morning') {
      if (affection >= 80) return 'player_apartment'; // Very intimate - stays overnight
      if (affection >= 70) return 'chahaein_apartment'; // High affection - at her place
      return 'hunter_association'; // Always at work in mornings
    } else if (currentTime === 'afternoon') {
      return 'hunter_association'; // Always at Hunter Association during work hours
    } else if (currentTime === 'evening') {
      if (affection >= 60) return 'myeongdong_restaurant'; // Dinner together if close
      if (affection >= 40) return 'hongdae_cafe'; // Casual meetup
      if (Math.random() > 0.7 && affection >= 70) return 'luxury_realtor'; // Looking at properties together
      return 'hunter_association'; // Still working late
    } else { // night
      if (affection >= 80) return 'player_apartment'; // Very intimate - spends night together
      if (affection >= 70) return 'chahaein_apartment'; // High affection - at her place
      return null; // Not available at night unless very close
    }
  };

  const chaHaeInCurrentLocation = getChaHaeInLocation();

  // Helper function for receptionist dialogue - rotating pre-scripted hints
  const getReceptionistDialogue = (): string => {
    const dialogues = [
      "I heard the vendor at the Market is paying high prices for wolf cores this week.",
      "Some hunters were talking about a strange energy spike in the old subway tunnels. Might be a hidden gate.",
      "Did you know you can practice new skills at the Elite Training Center? It's top-of-the-line.",
      "The luxury department store in Gangnam has some rare enhancement stones on display.",
      "A-rank hunters have been reporting unusual mana fluctuations during recent raids.",
      "The new apartment complex offers great amenities for S-rank hunters. Worth checking out.",
      "I overheard that someone found a rare material vendor hidden in the back alleys of Hongdae."
    ];
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  };

  // Elevator floor selection handler
  const handleFloorSelection = async (floorId: string) => {
    setShowFloorSelect(false);
    setElevatorTransition(true);
    
    // Play elevator ding sound (placeholder for now)
    console.log('🛗 Elevator ding sound effect');
    
    // Wait for transition animation
    setTimeout(() => {
      // Handle different floor destinations
      switch (floorId) {
        case 'main_hall':
          // Already here, just close transition
          break;
        case 'training_center':
          console.log('Traveling to Elite Training Center (Floor 10)');
          // Could change location state here for different floor views
          break;
        case 'guild_master_office':
          console.log('Traveling to Guild Master Office (Floor 25)');
          // Could unlock based on player rank/story progress
          break;
        case 'rooftop_helipad':
          console.log('Rooftop Helipad - Access Denied');
          // Locked floor - show access denied message
          break;
      }
      
      setElevatorTransition(false);
    }, 1500); // 1.5 second transition
  };

  // Perspective-based scaling system per design specifications
  const getCharacterScale = (position: { x: number; y: number }, location: string) => {
    // Design spec: far side of table = 25-30% screen height (640-770px on iPhone 14 Pro)
    // Design spec: foreground = 60-70% screen height (1500-1800px)
    
    // Y position determines depth: higher Y = further back = smaller
    const depthFactor = Math.max(0.25, Math.min(0.7, 1 - (position.y / 100) * 0.45));
    
    // Location-specific scale adjustments based on spatial positioning
    const locationScales = {
      'hunter_association': 0.28, // Seated at desk, far side of table
      'chahaein_apartment': 0.55, // Standing in room, medium distance
      'myeongdong_restaurant': 0.32, // Seated at table, conversational distance
      'hongdae_cafe': 0.45, // Standing/sitting at cafe, closer interaction
    };
    
    const baseScale = locationScales[location as keyof typeof locationScales] || 0.3;
    return baseScale * depthFactor;
  };

  // Convert screen percentage to actual pixel dimensions for proper scaling
  const getCharacterDimensions = (position: { x: number; y: number }, location: string) => {
    const scale = getCharacterScale(position, location);
    const screenHeight = window.innerHeight || 812; // iPhone 14 Pro default
    
    // Calculate height based on design specifications
    const characterHeight = Math.floor(screenHeight * scale);
    const characterWidth = Math.floor(characterHeight * 0.6); // Maintain aspect ratio
    
    return { width: characterWidth, height: characterHeight };
  };
  
  const worldLocations = {

    // Gangnam District - Business & Hunter Association
    hunter_association: {
      id: 'hunter_association',
      name: 'Hunter Association HQ',
      description: 'The prestigious headquarters in Gangnam where elite hunters gather',
      backgroundImage: '/api/scenes/hunter_association.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'hunter_association',
      chaActivity: 'reviewing mission reports at her desk',
      chaPosition: { x: 75, y: 25 },
      chaExpression: 'focused' as const,
      interactiveElements: [
        { id: 'cha_desk', name: 'Cha Hae-In at her desk', position: { x: 60, y: 45 }, action: 'Approach Cha Hae-In' },
        { id: 'mission_board', name: 'Quest Board', position: { x: 20, y: 30 }, action: 'Check available missions' },
        { id: 'coffee_machine', name: 'Coffee Machine', position: { x: 80, y: 60 }, action: 'Offer to get coffee' }
      ]
    },
    
    gangnam_tower: {
      id: 'gangnam_tower',
      name: 'Gangnam Business Tower',
      description: 'High-end corporate district with view of Seoul',
      backgroundImage: '/api/scenes/gangnam_tower.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'hunter_association',
      chaActivity: 'attending a hunter briefing meeting',
      chaPosition: { x: 50, y: 35 },
      chaExpression: 'focused' as const,
      interactiveElements: [
        { id: 'conference_room', name: 'Conference Room', position: { x: 45, y: 30 }, action: 'Join the meeting' },
        { id: 'city_view', name: 'City View Window', position: { x: 80, y: 25 }, action: 'Admire the Seoul skyline' }
      ]
    },

    // Hongdae District - Youth & Entertainment
    hongdae_cafe: {
      id: 'hongdae_cafe',
      name: 'Artisan Coffee House',
      description: 'Trendy café in the heart of Hongdae\'s artistic district',
      backgroundImage: '/api/scenes/hongdae_cafe.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'hongdae_cafe',
      chaActivity: 'enjoying her morning latte while reading',
      chaPosition: { x: 45, y: 50 },
      chaExpression: 'happy' as const,
      interactiveElements: [
        { id: 'menu_board', name: 'Artisan Menu', position: { x: 70, y: 20 }, action: 'Browse specialty drinks together' },
        { id: 'window_seat', name: 'Cozy Window Seat', position: { x: 30, y: 60 }, action: 'Suggest sitting by the window' },
        { id: 'art_display', name: 'Local Art Display', position: { x: 15, y: 40 }, action: 'Discuss the artwork' }
      ]
    },

    hongdae_club: {
      id: 'hongdae_club',
      name: 'Underground Music Venue',
      description: 'Popular nightclub where hunters sometimes unwind',
      backgroundImage: '/api/scenes/hongdae_club.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'hongdae_cafe',
      chaActivity: 'reluctantly chaperoning younger hunters',
      chaPosition: { x: 65, y: 45 },
      chaExpression: 'shy' as const,
      interactiveElements: [
        { id: 'dance_floor', name: 'Dance Floor', position: { x: 50, y: 55 }, action: 'Ask her to dance' },
        { id: 'quiet_corner', name: 'Quiet Corner', position: { x: 20, y: 35 }, action: 'Find somewhere to talk' }
      ]
    },

    // Myeongdong District - Shopping & Dining
    myeongdong_restaurant: {
      id: 'myeongdong_restaurant',
      name: 'Traditional Korean Restaurant',
      description: 'Elegant dining establishment in Myeongdong',
      backgroundImage: '/api/scenes/myeongdong_restaurant.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'myeongdong_restaurant',
      chaActivity: 'enjoying a quiet dinner',
      chaPosition: { x: 55, y: 50 },
      chaExpression: 'happy' as const,
      interactiveElements: [
        { id: 'private_table', name: 'Private Dining Table', position: { x: 55, y: 55 }, action: 'Join her for dinner' },
        { id: 'garden_view', name: 'Traditional Garden View', position: { x: 75, y: 30 }, action: 'Comment on the scenery' }
      ]
    },

    myeongdong_shopping: {
      id: 'myeongdong_shopping',
      name: 'Myeongdong Shopping District',
      description: 'Bustling shopping area with luxury brands and street food',
      backgroundImage: '/api/scenes/myeongdong_shopping.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'myeongdong_restaurant',
      chaActivity: 'window shopping for hunter gear accessories',
      chaPosition: { x: 40, y: 45 },
      chaExpression: 'neutral' as const,
      interactiveElements: [
        { id: 'gear_shop', name: 'Hunter Gear Boutique', position: { x: 35, y: 40 }, action: 'Browse equipment together' },
        { id: 'street_food', name: 'Street Food Stalls', position: { x: 70, y: 60 }, action: 'Suggest trying local snacks' }
      ]
    },

    // Player's Personal Space
    player_apartment: (() => {
      const apartmentTier = gameState.apartmentTier || 1;
      
      // Dynamic apartment based on tier
      if (apartmentTier >= 3) {
        // Tier 3: Hannam-dong Penthouse
        return {
          id: 'player_apartment',
          name: 'Hannam-dong Penthouse',
          description: 'Your luxurious penthouse with panoramic city views and premium amenities',
          backgroundImage: '/api/scenes/hannam_penthouse.jpg',
          chaHaeInPresent: chaHaeInCurrentLocation === 'player_apartment',
          chaActivity: 'admiring the city skyline from your floor-to-ceiling windows',
          chaPosition: { x: 50, y: 45 },
          chaExpression: 'loving' as const,
          interactiveElements: [
            { id: 'master_bedroom', name: 'Master Suite', position: { x: 20, y: 25 }, action: 'Private penthouse bedroom' },
            { id: 'infinity_pool', name: 'Infinity Pool', position: { x: 75, y: 30 }, action: 'Romantic pool encounter' },
            { id: 'wine_cellar', name: 'Wine Cellar', position: { x: 15, y: 65 }, action: 'Intimate wine tasting' },
            { id: 'panoramic_balcony', name: 'City View Balcony', position: { x: 85, y: 50 }, action: 'Passionate balcony moments' },
            { id: 'luxury_bathroom', name: 'Marble Bathroom', position: { x: 45, y: 70 }, action: 'Luxurious bath together' },
            { id: 'private_elevator', name: 'Private Elevator', position: { x: 60, y: 80 }, action: 'Elevator intimacy' }
          ]
        };
      } else if (apartmentTier >= 2) {
        // Tier 2: Gangnam High-Rise
        return {
          id: 'player_apartment',
          name: 'Gangnam High-Rise',
          description: 'Your upscale apartment in Seoul\'s premier district with modern amenities',
          backgroundImage: '/api/scenes/gangnam_apartment.jpg',
          chaHaeInPresent: chaHaeInCurrentLocation === 'player_apartment',
          chaActivity: 'enjoying the sophisticated atmosphere of your upgraded home',
          chaPosition: { x: 45, y: 50 },
          chaExpression: 'loving' as const,
          interactiveElements: [
            { id: 'modern_bedroom', name: 'Modern Bedroom', position: { x: 25, y: 30 }, action: 'Stylish bedroom romance' },
            { id: 'city_view_couch', name: 'City View Living Room', position: { x: 55, y: 55 }, action: 'Intimate moments with city lights' },
            { id: 'designer_kitchen', name: 'Designer Kitchen', position: { x: 70, y: 35 }, action: 'Kitchen counter passion' },
            { id: 'luxury_shower', name: 'Rain Shower', position: { x: 80, y: 25 }, action: 'Steamy shower romance' },
            { id: 'rooftop_access', name: 'Rooftop Garden', position: { x: 40, y: 20 }, action: 'Garden terrace intimacy' }
          ]
        };
      } else {
        // Tier 1: Basic Apartment
        return {
          id: 'player_apartment',
          name: 'Your Apartment',
          description: 'Your modest but comfortable home base in Seoul',
          backgroundImage: '/api/scenes/player_apartment.jpg',
          chaHaeInPresent: chaHaeInCurrentLocation === 'player_apartment',
          chaActivity: 'relaxing on your couch, looking comfortable in your space',
          chaPosition: { x: 40, y: 55 },
          chaExpression: 'loving' as const,
          interactiveElements: [
            { id: 'bedroom', name: 'Bedroom', position: { x: 20, y: 30 }, action: 'Lead her to the bedroom' },
            { id: 'couch_intimate', name: 'Living Room Couch', position: { x: 45, y: 60 }, action: 'Make love on the couch' },
            { id: 'kitchen_counter', name: 'Kitchen Counter', position: { x: 70, y: 40 }, action: 'Intimate kitchen encounter' },
            { id: 'shower_room', name: 'Bathroom', position: { x: 80, y: 25 }, action: 'Shower together' }
          ]
        };
      }
    })(),

    // System 7 Commerce Locations
    luxury_department_store: {
      id: 'luxury_department_store',
      name: 'Luxury Department Store',
      description: 'Premium boutique with high-end gifts, jewelry, and designer accessories',
      backgroundImage: '/api/scenes/luxury_department_store.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'luxury_department_store',
      chaActivity: 'examining elegant jewelry displays',
      chaPosition: { x: 45, y: 40 },
      chaExpression: 'focused' as const,
      interactiveElements: [
        { id: 'jewelry_cases', name: 'Glass Jewelry Cases', position: { x: 25, y: 45 }, action: 'Browse premium jewelry collection' },
        { id: 'designer_mannequins', name: 'Designer Clothing', position: { x: 65, y: 35 }, action: 'Examine elegant dresses' },
        { id: 'luxury_shelves', name: 'Artisan Chocolates', position: { x: 50, y: 60 }, action: 'Select premium gift items' }
      ]
    },

    gangnam_furnishings: {
      id: 'gangnam_furnishings',
      name: 'Gangnam Modern Furnishings',
      description: 'Designer furniture showroom for luxury living spaces',
      backgroundImage: '/api/scenes/gangnam_furnishings.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'gangnam_furnishings',
      chaActivity: 'appreciating modern design aesthetics',
      chaPosition: { x: 55, y: 45 },
      chaExpression: 'happy' as const,
      interactiveElements: [
        { id: 'living_room_sets', name: 'Living Room Collections', position: { x: 30, y: 50 }, action: 'Browse furniture sets' },
        { id: 'bedroom_displays', name: 'Bedroom Furniture', position: { x: 70, y: 40 }, action: 'Examine bedroom collections' },
        { id: 'design_consultation', name: 'Design Consultant', position: { x: 50, y: 25 }, action: 'Discuss interior design' }
      ]
    },

    luxury_realtor: {
      id: 'luxury_realtor',
      name: 'Seoul Luxury Realty',
      description: 'Exclusive real estate office for premium properties',
      backgroundImage: '/api/scenes/luxury_realtor.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'luxury_realtor',
      chaActivity: 'discussing property investments with an agent',
      chaPosition: { x: 50, y: 40 },
      chaExpression: 'focused' as const,
      interactiveElements: [
        { id: 'property_listings', name: 'Premium Property Listings', position: { x: 30, y: 35 }, action: 'Browse luxury apartments' },
        { id: 'consultation_desk', name: 'Real Estate Agent', position: { x: 70, y: 45 }, action: 'Schedule property viewing' },
        { id: 'investment_portfolio', name: 'Investment Options', position: { x: 40, y: 60 }, action: 'Discuss investment opportunities' }
      ]
    },

    // Itaewon District - International & Diverse
    itaewon_market: {
      id: 'itaewon_market',
      name: 'International Hunter Market',
      description: 'Diverse marketplace with global hunter supplies',
      backgroundImage: '/api/scenes/itaewon_market.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'myeongdong_restaurant',
      chaActivity: 'researching international hunter techniques',
      chaPosition: { x: 50, y: 40 },
      chaExpression: 'focused' as const,
      interactiveElements: [
        { id: 'weapon_stall', name: 'International Weapons', position: { x: 25, y: 45 }, action: 'Examine foreign weaponry' },
        { id: 'technique_scrolls', name: 'Technique Scrolls', position: { x: 70, y: 35 }, action: 'Study combat methods together' }
      ]
    },

    // Economic Locations - Hunter Market & Luxury Realtor
    hunter_market: {
      id: 'hunter_market',
      name: 'Hunter Market',
      description: 'Bustling marketplace where hunters trade rare materials and equipment',
      backgroundImage: '/api/scenes/hunter_market.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'hunter_market',
      chaActivity: 'browsing rare equipment and chatting with vendors',
      chaPosition: { x: 35, y: 45 },
      chaExpression: 'focused' as const,
      interactiveElements: [
        { id: 'materials_trader', name: 'Materials Trader', position: { x: 25, y: 50 }, action: 'Trade rare materials and monster drops' },
        { id: 'equipment_smith', name: 'Equipment Smith', position: { x: 70, y: 40 }, action: 'Browse weapons and armor upgrades' },
        { id: 'alchemist', name: 'Alchemist', position: { x: 60, y: 65 }, action: 'Purchase potions and enhancement items' }
      ]
    },

    // Dongdaemun District - Training & Sports
    training_facility: {
      id: 'training_facility',
      name: 'Elite Hunter Training Center',
      description: 'State-of-the-art combat training facility in Dongdaemun',
      backgroundImage: '/api/scenes/training_facility.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'hunter_association',
      chaActivity: 'practicing advanced sword techniques',
      chaPosition: { x: 50, y: 45 },
      chaExpression: 'focused' as const,
      interactiveElements: [
        { id: 'training_dummy', name: 'Advanced Training Dummy', position: { x: 70, y: 50 }, action: 'Ask to spar together' },
        { id: 'equipment_rack', name: 'Training Equipment', position: { x: 20, y: 40 }, action: 'Examine training weapons' },
        { id: 'meditation_area', name: 'Meditation Corner', position: { x: 80, y: 25 }, action: 'Suggest meditation break' }
      ]
    },

    // Special Locations - Personal Spaces
    chahaein_apartment: {
      id: 'chahaein_apartment',
      name: "Cha Hae-In's Apartment",
      description: 'Her private sanctuary, warm and inviting with personal touches',
      backgroundImage: '/api/scenes/apartment.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'chahaein_apartment',
      chaActivity: timeOfDay === 'evening' ? 'relaxing on the couch with tea' : 'preparing for bed',
      chaPosition: { x: 40, y: 55 },
      chaExpression: 'loving' as const,
      interactiveElements: [
        { id: 'couch', name: 'Comfortable Couch', position: { x: 45, y: 60 }, action: 'Cuddle together on the couch' },
        { id: 'bedroom_door', name: 'Bedroom', position: { x: 80, y: 25 }, action: 'Suggest moving to the bedroom' },
        { id: 'kitchen', name: 'Modern Kitchen', position: { x: 75, y: 40 }, action: 'Cook together intimately' },
        { id: 'shower', name: 'Private Bathroom', position: { x: 20, y: 35 }, action: 'Share a romantic shower' }
      ]
    },

    hangang_park: {
      id: 'hangang_park',
      name: 'Hangang River Park',
      description: 'Peaceful riverside park perfect for evening walks',
      backgroundImage: '/api/scenes/hangang_park.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'hongdae_cafe',
      chaActivity: 'taking an evening walk along the river',
      chaPosition: { x: 60, y: 70 },
      chaExpression: 'happy' as const,
      interactiveElements: [
        { id: 'river_path', name: 'River Walking Path', position: { x: 65, y: 75 }, action: 'Walk together along the river' },
        { id: 'bench', name: 'Park Bench', position: { x: 30, y: 50 }, action: 'Sit and watch the sunset' },
        { id: 'food_truck', name: 'Evening Food Truck', position: { x: 80, y: 45 }, action: 'Buy snacks to share' }
      ]
    },

    namsan_tower: {
      id: 'namsan_tower',
      name: 'N Seoul Tower',
      description: 'Iconic tower with romantic city views',
      backgroundImage: '/api/scenes/namsan_tower.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'chahaein_apartment',
      chaActivity: 'enjoying the panoramic view of Seoul',
      chaPosition: { x: 45, y: 40 },
      chaExpression: 'happy' as const,
      interactiveElements: [
        { id: 'observation_deck', name: 'Observation Deck', position: { x: 50, y: 35 }, action: 'Admire the city lights together' },
        { id: 'love_locks', name: 'Love Lock Fence', position: { x: 70, y: 55 }, action: 'Attach a lock together' }
      ]
    }
  };

  const getTimeBasedSkyColor = () => {
    switch (timeOfDay) {
      case 'morning': return 'from-orange-200 via-yellow-100 to-blue-200';
      case 'afternoon': return 'from-blue-400 via-blue-300 to-blue-200';
      case 'evening': return 'from-purple-600 via-pink-400 to-orange-300';
      case 'night': return 'from-purple-900 via-blue-900 to-black';
    }
  };

  const getWeatherOverlay = () => {
    switch (weather) {
      case 'rain':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-8 bg-blue-300/30"
                style={{ left: `${Math.random() * 100}%`, top: '-32px' }}
                animate={{ y: '120vh' }}
                transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </div>
        );
      case 'snow':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/70 rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: '-8px' }}
                animate={{ y: '110vh', x: Math.sin(i) * 20 }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const currentLocationData = worldLocations[playerLocation as keyof typeof worldLocations] || worldLocations.hunter_association;

  // Debug logging for character presence
  console.log('Current time:', timeOfDay);
  console.log('Cha Hae-In location:', chaHaeInCurrentLocation);
  console.log('Player location:', playerLocation);
  console.log('Current scene:', gameState.currentScene);
  console.log('Should Cha be present?', currentLocationData?.chaHaeInPresent);
  console.log('Cha position:', currentLocationData?.chaPosition);

  const handlePlayerResponse = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to conversation history
    setConversationHistory(prev => [...prev, {
      type: 'user',
      text: message,
      timestamp: new Date()
    }]);
    
    setPlayerInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          gameState,
          context: {
            location: playerLocation,
            timeOfDay,
            weather,
            activity: currentLocationData.chaActivity,
            affectionLevel: gameState.affection
          }
        })
      });
      
      const data = await response.json();
      setCurrentDialogue(data.response);
      
      // Add Cha Hae-In's response to conversation history
      setConversationHistory(prev => [...prev, {
        type: 'cha_hae_in',
        text: data.response,
        timestamp: new Date()
      }]);
      
      // Update game state if provided
      if (data.gameState) {
        setGameState(data.gameState);
      }
      
      // Update Cha Hae-In's expression based on response
      if (data.expression) {
        const newExpression = data.expression;
        setChaHaeInExpression(newExpression);
        
        // Generate new avatar image when AI changes expression
        if (newExpression !== chaHaeInExpression) {
          generateAvatarForExpression(newExpression);
        }
      }
      
      // System 2: Affection Heart System - Trigger heart animation
      if (data.showAffectionHeart) {
        // Clear any existing heart timeout
        if (affectionHeartTimeout.current) {
          clearTimeout(affectionHeartTimeout.current);
        }
        
        // Show the affection heart with animation
        setShowAffectionHeart(true);
        console.log('💕 Affection Heart animation triggered!');
        
        // Hide the heart after 3 seconds with graceful fade
        affectionHeartTimeout.current = setTimeout(() => {
          setShowAffectionHeart(false);
        }, 3000);
      }
      
      // Update thought prompts dynamically based on conversation context
      if (data.thoughtPrompts && Array.isArray(data.thoughtPrompts)) {
        console.log('🎭 Received dynamic prompts:', data.thoughtPrompts);
        
        // Visual transition: fade out old prompts, then fade in new ones
        setThoughtPrompts([]); // Clear prompts briefly
        setTimeout(() => {
          setThoughtPrompts(data.thoughtPrompts);
        }, 200); // Small delay for visual refresh
      }
      
      // Update scheduled activities if new ones were created
      if (data.gameState?.scheduledActivities) {
        const newActivities = data.gameState.scheduledActivities;
        if (newActivities.length > scheduledActivities.length) {
          setScheduledActivities(newActivities);
          setShowActivityNotification(true);
          setTimeout(() => setShowActivityNotification(false), 5000);
        }
      }
      
      // Check if narrative lens should appear (intimate content)
      if (data.response.toLowerCase().includes('intimate') || data.response.toLowerCase().includes('close') || gameState.affection > 70) {
        setNarrativeLensActive(true);
      }
      
    } catch (error) {
      console.error('Response error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (conversationScrollRef.current) {
      conversationScrollRef.current.scrollTop = conversationScrollRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Generate new avatar image when expression changes
  const generateAvatarForExpression = async (expression: string) => {
    if (isGeneratingAvatar) return; // Prevent multiple simultaneous generations
    
    try {
      setIsGeneratingAvatar(true);
      
      const response = await fetch('/api/generate-avatar-expression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expression,
          location: playerLocation,
          timeOfDay: timeOfDay
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setAvatarImage(data.imageUrl);
          console.log(`Generated new avatar for expression: ${expression}`);
        }
      }
    } catch (error) {
      console.error('Failed to generate avatar expression:', error);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  // Real-time expression updates during typing
  const updateExpressionBasedOnInput = (input: string) => {
    const inputLower = input.toLowerCase();
    let newExpression: string;
    
    if (inputLower.includes('love') || inputLower.includes('beautiful') || inputLower.includes('kiss')) {
      newExpression = 'romantic';
    } else if (inputLower.includes('funny') || inputLower.includes('joke') || inputLower.includes('laugh')) {
      newExpression = 'amused';
    } else if (inputLower.includes('worried') || inputLower.includes('danger') || inputLower.includes('careful')) {
      newExpression = 'concerned';
    } else if (inputLower.includes('think') || inputLower.includes('wonder') || inputLower.includes('question')) {
      newExpression = 'contemplative';
    } else if (input.trim().length > 0) {
      newExpression = 'welcoming';
    } else {
      newExpression = 'focused';
    }
    
    // Only update if expression actually changed
    if (newExpression !== chaHaeInExpression) {
      setChaHaeInExpression(newExpression as any);
      // Generate new avatar image for the new expression
      generateAvatarForExpression(newExpression);
    }
  };

  const handleLocationTravel = (locationId: string) => {
    setPlayerLocation(locationId);
    setShowWorldMap(false);
    setCurrentDialogue('');
    setThoughtPrompts([]);
    
    // Close all location-specific interfaces
    setShowHunterMarketVendors(false);
    setShowQuestBoard(false);
    setShowUnifiedShop(false);
    setShowDailyLifeHub(false);
    setShowIntimateModal(false);
    setShowEnergyModal(false);
    setShowArmory(false);
    setDialogueActive(false);
    setShowLivingPortrait(false);
    setIsFocusMode(false);
    setShowReceptionistDialogue(null);
    setShowFloorSelect(false);
    
    // Generate scene for new location
    setTimeout(() => {
      generateSceneImage();
    }, 100);
  };

  // Economic system handlers
  const handleSellItem = async (itemId: string, quantity: number, totalValue: number) => {
    try {
      const response = await fetch('/api/sell-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          quantity,
          totalValue,
          gameState
        })
      });
      
      const data = await response.json();
      setGameState(data.gameState);
      
      // Add transaction to recent transactions
      const transaction = {
        id: Date.now().toString(),
        type: 'gain' as const,
        amount: totalValue,
        description: `Sold ${quantity}x item`,
        timestamp: new Date().toISOString()
      };
      setRecentTransactions(prev => [transaction, ...prev.slice(0, 9)]);
      
      console.log(`Sold ${quantity} items for ₩${totalValue.toLocaleString()}`);
    } catch (error) {
      console.error('Failed to sell item:', error);
    }
  };

  const handleAcceptQuest = async (quest: any) => {
    setActiveQuests(prev => [...prev, quest.id]);
    console.log(`Accepted quest: ${quest.title}`);
  };

  const handleEnvironmentalInteraction = async (interactionPoint: any) => {
    // Handle System 7 Commerce Store interactions
    if (playerLocation === 'luxury_department_store') {
      if (interactionPoint.id === 'jewelry_cases' || 
          interactionPoint.id === 'designer_mannequins' || 
          interactionPoint.id === 'luxury_shelves') {
        setShowLuxuryDepartmentStore(true);
        return;
      }
    }
    
    if (playerLocation === 'gangnam_furnishings') {
      if (interactionPoint.id === 'living_room_sets' || 
          interactionPoint.id === 'bedroom_displays' || 
          interactionPoint.id === 'design_consultation') {
        setShowGangnamFurnishings(true);
        return;
      }
    }
    
    if (playerLocation === 'luxury_realtor') {
      if (interactionPoint.id === 'property_listings' || 
          interactionPoint.id === 'consultation_desk' || 
          interactionPoint.id === 'investment_portfolio') {
        setShowLuxuryRealtor(true);
        return;
      }
    }

    // Handle specific Hunter Market vendor interactions
    if (playerLocation === 'hunter_market') {
      if (interactionPoint.id === 'materials_trader' || 
          interactionPoint.id === 'equipment_smith' || 
          interactionPoint.id === 'alchemist') {
        setSelectedVendor(interactionPoint.id);
        setShowHunterMarketVendors(true);
        return;
      }
    }
    
    // Handle intimate spatial interactions at romantic locations
    if (playerLocation === 'chahaein_apartment') {
      if (interactionPoint.id === 'bedroom_door') {
        setActiveActivity('bedroom_intimacy');
        setShowIntimateModal(true);
        return;
      }
      if (interactionPoint.id === 'shower') {
        setActiveActivity('shower_together');
        setShowIntimateModal(true);
        return;
      }
      if (interactionPoint.id === 'couch') {
        setActiveActivity('cuddle_together');
        setShowIntimateModal(true);
        return;
      }
    }
    
    // Handle intimate spatial interactions at player apartment
    if (playerLocation === 'player_apartment') {
      // Bed interactions when Cha Hae-In is present
      if (interactionPoint.id === 'bed' && chaHaeInCurrentLocation === 'player_apartment') {
        setActiveActivity('make_love');
        setShowIntimateModal(true);
        return;
      }
      if (interactionPoint.id === 'bedroom') {
        setActiveActivity('make_love');
        setShowIntimateModal(true);
        return;
      }
      if (interactionPoint.id === 'shower_room') {
        setActiveActivity('shower_together');
        setShowIntimateModal(true);
        return;
      }
      if (interactionPoint.id === 'couch_intimate') {
        setActiveActivity('cuddle_together');
        setShowIntimateModal(true);
        return;
      }
      if (interactionPoint.id === 'kitchen_counter') {
        setActiveActivity('bedroom_intimacy');
        setShowIntimateModal(true);
        return;
      }
    }
    
    if (playerLocation === 'hunter_association' && interactionPoint.id === 'mission_board') {
      setShowQuestBoard(true);
      return;
    }
    
    setDialogueActive(true);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `*${interactionPoint.action}*`,
          gameState,
          context: {
            location: playerLocation,
            timeOfDay,
            weather,
            interactionPoint: interactionPoint.name,
            affectionLevel: gameState.affection
          }
        })
      });
      
      const data = await response.json();
      setCurrentDialogue(data.response);
      
      // Generate contextual thought prompts based on the interaction
      const contextualPrompts = [
        "What do you think about this?",
        "Want to spend more time here?",
        "This reminds me of something..."
      ];
      setThoughtPrompts(contextualPrompts);
      
      if (data.gameState) {
        setGameState(data.gameState);
      }
      
    } catch (error) {
      console.error('Environmental interaction error:', error);
      setCurrentDialogue(`*You ${interactionPoint.action} and feel a sense of peace in this moment*`);
    } finally {
      setIsLoading(false);
    }
  };

  // System 7 Commerce - Purchase Handlers
  const handleLuxuryPurchase = (item: any) => {
    const currentGold = gameState.gold || 0;
    if (currentGold >= item.price) {
      setGameState(prev => ({
        ...prev,
        gold: (prev.gold || 0) - item.price,
        affection: prev.affection + item.affectionBonus
      }));
      
      setRecentTransactions(prev => [...prev, {
        id: Date.now().toString(),
        type: 'loss',
        amount: item.price,
        description: `Purchased ${item.name}`,
        timestamp: new Date().toISOString()
      }]);
      
      console.log(`Purchased ${item.name} for ₩${item.price.toLocaleString()}`);
    }
  };

  // Helper function to determine highest unlocked intimate activity
  const getHighestUnlockedIntimateActivity = (gameState: GameState): string | null => {
    const unlockedActivities = gameState.unlockedActivities || [];
    
    // Tier 3 - Ultimate intimate activities (requires penthouse)
    if (unlockedActivities.includes('master_suite_intimacy')) return 'master_suite_intimacy';
    if (unlockedActivities.includes('spend_the_night_together')) return 'spend_the_night_together';
    if (unlockedActivities.includes('penthouse_morning_together')) return 'penthouse_morning_together';
    
    // Tier 2 - Advanced intimate activities
    if (unlockedActivities.includes('passionate_night')) return 'passionate_night';
    if (unlockedActivities.includes('shower_together')) return 'shower_together';
    if (unlockedActivities.includes('intimate_massage')) return 'intimate_massage';
    
    // Tier 1 - Basic intimate activities
    if (unlockedActivities.includes('bedroom_intimacy')) return 'bedroom_intimacy';
    if (unlockedActivities.includes('first_kiss')) return 'first_kiss';
    
    // Default fallback
    return 'bedroom_intimacy';
  };

  // Handle Item Inspection View purchases
  const handleItemPurchase = (item: any) => {
    const cost = item.price;
    const affectionGain = item.affectionBonus;
    const currentGold = gameState.gold || 0;
    
    if (currentGold >= cost) {
      setGameState(prev => ({
        ...prev,
        gold: (prev.gold || 0) - cost,
        affection: Math.min(100, prev.affection + affectionGain),
        inventory: [...(prev.inventory || []), item.id]
      }));
      
      // Update living space for furniture purchases
      if (item.category === 'living_room' || item.category === 'bedroom') {
        if (item.category === 'living_room') {
          setGameState(prev => ({
            ...prev,
            apartmentTier: Math.max(prev.apartmentTier || 1, 2) // Upgrade to tier 2 minimum
          }));
        }
        if (item.category === 'bedroom' && item.id === 'king_platform_bed') {
          setGameState(prev => ({
            ...prev,
            apartmentTier: Math.max(prev.apartmentTier || 1, 3) // Upgrade to tier 3 for premium bedroom
          }));
        }
      }
      
      // Generate response dialogue
      handleEnvironmentalInteraction({
        id: `purchase_${item.id}`,
        action: `You purchase the ${item.name}. [- ₩${cost.toLocaleString()}]. ${item.chaHaeInReaction}`,
        name: item.name,
        x: 50,
        y: 50
      });
      
      console.log(`Purchased ${item.name} for ₩${cost.toLocaleString()} (+${affectionGain} affection)`);
      setShowItemInspection(false); // Close the inspection view after purchase
    }
  };

  const handlePropertyPurchase = (property: any) => {
    const currentGold = gameState.gold || 0;
    console.log('Property purchase attempt:', {
      propertyName: property.name,
      propertyPrice: property.price,
      currentGold: currentGold,
      canAfford: currentGold >= property.price
    });
    
    if (currentGold >= property.price) {
      setGameState(prev => ({
        ...prev,
        gold: (prev.gold || 0) - property.price,
        apartmentTier: property.tier,
        affection: Math.min(100, prev.affection + 5)
      }));
      
      setRecentTransactions(prev => [...prev, {
        id: Date.now().toString(),
        type: 'loss',
        amount: property.price,
        description: `Purchased ${property.name}`,
        timestamp: new Date().toISOString()
      }]);
      
      setShowLuxuryRealtor(false);
      console.log(`Purchased ${property.name} - Apartment upgraded to Tier ${property.tier}`);
      
      // Show success notification - simple toast message
      console.log(`✅ Property Purchase Complete: ${property.name} acquired for ₩${property.price.toLocaleString()}`);
      
      // You could add a toast notification here instead of handleEnvironmentalInteraction
      // to avoid triggering the intimate activity system
    }
  };

  const handleFurniturePurchase = (item: any) => {
    const currentGold = gameState.gold || 0;
    if (currentGold >= item.price) {
      setGameState(prev => ({
        ...prev,
        gold: (prev.gold || 0) - item.price
      }));
      
      setRecentTransactions(prev => [...prev, {
        id: Date.now().toString(),
        type: 'loss',
        amount: item.price,
        description: `Purchased ${item.name}`,
        timestamp: new Date().toISOString()
      }]);
      
      console.log(`Purchased ${item.name} for ₩${item.price.toLocaleString()}`);
    }
  };



  const generateSceneImage = async () => {
    try {
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: playerLocation,
          timeOfDay,
          weather
        })
      });
      
      const data = await response.json();
      if (data.imageUrl) {
        setSceneImage(data.imageUrl);
      }
    } catch (error) {
      console.error('Scene generation error:', error);
    }
  };

  // Generate initial scene and regenerate on location, time, or weather changes
  useEffect(() => {
    generateSceneImage();
  }, [playerLocation, timeOfDay, weather]);

  // Fetch emotional character image when she's present
  useEffect(() => {
    const fetchEmotionalImage = async () => {
      if (currentLocationData.chaHaeInPresent && !emotionalImage) {
        try {
          // Determine Cha Hae-In's emotional state based on context
          const getEmotionalState = () => {
            if (gameState.affection >= 80) return 'romantic_anticipation';
            if (gameState.affection >= 60) return 'warm_welcoming';
            if (gameState.affection >= 40) return 'professional_friendly';
            return 'focused_professional';
          };

          const emotion = getEmotionalState();
          const params = new URLSearchParams({
            emotion,
            location: playerLocation,
            timeOfDay
          });

          const response = await fetch(`/api/chat-scene-image?${params}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.imageUrl) {
              setEmotionalImage(data.imageUrl);
            }
          }
        } catch (error) {
          console.log('Character image generation skipped');
        }
      }
    };

    fetchEmotionalImage();
  }, [currentLocationData.chaHaeInPresent, playerLocation, timeOfDay, gameState.affection]);

  // Time progression
  useEffect(() => {
    const interval = setInterval(() => {
      const times: Array<'morning' | 'afternoon' | 'evening' | 'night'> = ['morning', 'afternoon', 'evening', 'night'];
      const currentIndex = times.indexOf(timeOfDay);
      const nextIndex = (currentIndex + 1) % times.length;
      setTimeOfDay(times[nextIndex]);
    }, 300000); // Change every 5 minutes

    return () => clearInterval(interval);
  }, [timeOfDay]);

  // System 15: Notification handlers
  const handleQuestAccept = (questData: any) => {
    console.log('Quest accepted from System 15:', questData);
    
    // Add to active quests in game state for System 3 Quest Log
    setGameState(prev => ({
      ...prev,
      activeQuests: [...(prev.activeQuests || []), questData]
    }));
    
    // Update active quests for System 8 World Map tracking (store location IDs)
    setActiveQuests(prev => [...prev, questData.targetLocation]);
    
    // Mark quest location on world map with golden exclamation point
    console.log(`Quest location "${questData.targetLocation}" marked on World Map with golden (!) indicator`);
    
    // Quest is now available in Monarch's Aura Quest Log (System 3)
    console.log(`"${questData.title}" added to Quest Log - Access via Monarch's Aura > Quests tab`);
  };

  const handleNewMessage = (conversationId: string, message: string) => {
    console.log('New message sent:', conversationId, message);
  };

  // Quest tracking and management handlers
  const handleQuestTrack = (questId: string) => {
    // Find the quest in gameState.activeQuests to get its target location
    const quest = gameState.activeQuests?.find(q => q.id === questId);
    if (quest) {
      console.log(`Tracking quest "${quest.title}" at location: ${quest.targetLocation}`);
      // Set the quest location as focused and open world map
      setActiveQuests(prev => {
        // Ensure quest location is marked if not already
        if (!prev.includes(quest.targetLocation)) {
          return [...prev, quest.targetLocation];
        }
        return prev;
      });
      // Close quest log and open world map for quest tracking
      setShowQuestLog(false);
      setShowWorldMap(true);
    } else {
      console.log(`Quest ${questId} not found in active quests`);
    }
  };

  const handleQuestAbandon = (questId: string) => {
    // Find the quest to get its target location before removing
    const quest = gameState.activeQuests?.find(q => q.id === questId);
    
    setGameState(prev => ({
      ...prev,
      activeQuests: (prev.activeQuests || []).filter(q => q.id !== questId)
    }));
    
    // Remove quest location from world map markers if no other quests use it
    if (quest) {
      const remainingQuests = gameState.activeQuests?.filter(q => q.id !== questId) || [];
      const stillHasQuestsAtLocation = remainingQuests.some(q => q.targetLocation === quest.targetLocation);
      
      if (!stillHasQuestsAtLocation) {
        setActiveQuests(prev => prev.filter(locationId => locationId !== quest.targetLocation));
      }
      
      console.log(`Quest "${quest.title}" abandoned and removed from ${quest.targetLocation}`);
    } else {
      console.log(`Quest ${questId} abandoned`);
    }
  };

  // Simulate asynchronous notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.98) {
        const isQuestNotification = Math.random() > 0.7;
        const newNotification = {
          id: `notif_${Date.now()}`,
          type: isQuestNotification ? 'quest' : 'message' as 'quest' | 'message',
          title: isQuestNotification ? 'New Quest Available' : 'Message from Cha Hae-In',
          content: isQuestNotification ? 'A-Rank Gate detected in Gangnam' : 'Just thinking of you. Be safe in there.',
          timestamp: new Date()
        };
        setNotifications(prev => [...prev, newNotification]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sf-pro">
      
      {/* Monarch's Aura - Shadow Crown */}
      <motion.button
        className="fixed top-6 right-6 w-16 h-16 rounded-full flex items-center justify-center z-[9999] cursor-pointer shadow-2xl overflow-hidden"
        style={{ 
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          pointerEvents: 'auto',
          background: 'radial-gradient(circle at 30% 30%, rgba(147, 51, 234, 0.9) 0%, rgba(79, 70, 229, 0.8) 30%, rgba(30, 27, 75, 0.9) 70%, rgba(0, 0, 0, 0.95) 100%)',
          border: '2px solid rgba(147, 51, 234, 0.6)',
          boxShadow: '0 0 30px rgba(147, 51, 234, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.3)'
        }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 0 40px rgba(147, 51, 234, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Crown button clicked, current state:', monarchAuraVisible);
          const newState = !monarchAuraVisible;
          console.log('Setting new state to:', newState);
          setMonarchAuraVisible(newState);
        }}
      >
        <SparkleEffect intensity="medium" color="purple" className="w-11 h-11">
          <svg className="w-11 h-11 text-purple-200 drop-shadow-lg pointer-events-none" viewBox="0 0 48 48" fill="none">
          {/* Main Crown Structure */}
          <path 
            d="M8 32 L12 36 L36 36 L40 32 L40 24 L8 24 Z" 
            fill="url(#crownGradient)"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="0.5"
          />
          
          {/* Crown Spikes with Shadow Monarch Style */}
          <path d="M10 24 L13 8 L16 24 Z" fill="currentColor" opacity="0.95" />
          <path d="M18 24 L24 4 L30 24 Z" fill="currentColor" />
          <path d="M32 24 L35 10 L38 24 Z" fill="currentColor" opacity="0.9" />
          
          {/* Central Shadow Orb */}
          <circle cx="24" cy="20" r="4" fill="url(#shadowOrb)" />
          <circle cx="24" cy="20" r="3" fill="rgba(0, 0, 0, 0.8)" />
          <circle cx="23" cy="19" r="1" fill="rgba(147, 51, 234, 0.9)" />
          
          {/* Side Gems */}
          <circle cx="16" cy="22" r="2" fill="rgba(147, 51, 234, 0.7)" />
          <circle cx="32" cy="22" r="2" fill="rgba(147, 51, 234, 0.7)" />
          
          {/* Shadow Aura Effect */}
          <path 
            d="M12 36 L10 42 L38 42 L36 36" 
            fill="rgba(0, 0, 0, 0.4)"
            opacity="0.7"
          />
          
          {/* Crown Details */}
          <path d="M12 24 L36 24" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.4" />
          <path d="M14 28 L34 28" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.3" />
          
          {/* Mystical Runes */}
          <text x="24" y="30" textAnchor="middle" fontSize="4" fill="rgba(147, 51, 234, 0.8)" fontFamily="serif">⚡</text>
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(147, 51, 234, 0.9)" />
              <stop offset="30%" stopColor="rgba(139, 92, 246, 0.8)" />
              <stop offset="70%" stopColor="rgba(79, 70, 229, 0.7)" />
              <stop offset="100%" stopColor="rgba(30, 27, 75, 0.8)" />
            </linearGradient>
            <radialGradient id="shadowOrb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 0, 0, 0.9)" />
              <stop offset="40%" stopColor="rgba(147, 51, 234, 0.6)" />
              <stop offset="80%" stopColor="rgba(79, 70, 229, 0.4)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.9)" />
            </radialGradient>
            <filter id="shadowGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Animated Glow Ring */}
          <g filter="url(#shadowGlow)">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="0.5" className="animate-pulse" />
          </g>
          </svg>
        </SparkleEffect>
        
        {/* Pulsing Ring Effect */}
        <div className="absolute inset-0 rounded-full border border-purple-400/20 animate-pulse" />
        <div className="absolute inset-1 rounded-full border border-purple-300/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </motion.button>
      
      {/* Spatial View - The Living Diorama */}
      <motion.div
        ref={spatialViewRef}
        className="relative w-full h-full overflow-hidden"
        animate={{
          scale: isFocusMode ? 1.05 : 1,
          filter: isFocusMode ? "blur(2px)" : "blur(0px)"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        
        {/* Background Sky Layer */}
        <div className={`absolute inset-0 bg-gradient-to-b ${getTimeBasedSkyColor()}`} />
        
        {/* Scene Image Layer */}
        {sceneImage && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <img 
              src={sceneImage} 
              alt={currentLocationData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>
        )}
        
        {/* Developer Menu */}
        <div className="absolute top-6 right-[320px] bg-black/90 backdrop-blur-sm text-white rounded-lg border border-purple-400/30 z-40 max-w-xs">
          {/* Collapsible Header */}
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setShowDevMenu(!showDevMenu)}
          >
            <div className="text-xs font-semibold text-purple-300">Developer Menu</div>
            <div className={`text-purple-300 transform transition-transform ${showDevMenu ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </div>
          
          {/* Collapsible Content */}
          {showDevMenu && (
            <div className="p-3 pt-0 border-t border-purple-400/20">
              {/* Affection Controls */}
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Affection: {gameState.affection}</div>
            <div className="flex gap-1 text-xs">
              <button 
                onClick={() => setGameState(prev => ({ ...prev, affection: 0 }))}
                className="px-2 py-1 rounded bg-red-600 hover:bg-red-700"
              >
                0
              </button>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, affection: 40 }))}
                className="px-2 py-1 rounded bg-yellow-600 hover:bg-yellow-700"
              >
                40
              </button>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, affection: 70 }))}
                className="px-2 py-1 rounded bg-green-600 hover:bg-green-700"
              >
                70
              </button>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, affection: 100 }))}
                className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700"
              >
                100
              </button>
            </div>
          </div>

          {/* Gold Display */}
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Gold: ₩{(gameState.gold || 0).toLocaleString()}</div>
            <div className="text-xs text-yellow-300 mb-1">Type: {typeof gameState.gold} | Raw: {gameState.gold}</div>
            <div className="text-xs text-purple-300 mb-1">Apartment Tier: {gameState.apartmentTier || 1}</div>
          </div>

          {/* Story Progress Controls */}
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Story Progress: {gameState.storyProgress || 0}</div>
            <div className="flex gap-1 text-xs">
              <button 
                onClick={() => setGameState(prev => ({ ...prev, storyProgress: 0 }))}
                className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-700"
              >
                0
              </button>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, storyProgress: 3 }))}
                className="px-2 py-1 rounded bg-green-600 hover:bg-green-700"
              >
                3
              </button>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, storyProgress: 5 }))}
                className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700"
              >
                5
              </button>
            </div>
          </div>

          {/* Time Period Override */}
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Time: {timeOfDay}</div>
            <div className="text-xs text-purple-300 mb-2">Cha Location: {chaHaeInCurrentLocation || 'Unavailable'}</div>
            <div className="flex gap-1 text-xs">
              <button 
                onClick={() => setTimeOfDay('morning')}
                className={`px-2 py-1 rounded ${timeOfDay === 'morning' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Morning
              </button>
              <button 
                onClick={() => setTimeOfDay('evening')}
                className={`px-2 py-1 rounded ${timeOfDay === 'evening' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Evening
              </button>
              <button 
                onClick={() => setTimeOfDay('night')}
                className={`px-2 py-1 rounded ${timeOfDay === 'night' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Night
              </button>
            </div>
          </div>

          {/* Resource Boosts */}
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Resources</div>
            <div className="flex gap-1 text-xs">
              <button 
                onClick={() => setGameState(prev => ({ ...prev, gold: 999999999 }))}
                className="px-2 py-1 rounded bg-yellow-600 hover:bg-yellow-700"
              >
                999M
              </button>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, gold: 10000000000 }))}
                className="px-2 py-1 rounded bg-yellow-500 hover:bg-yellow-600"
              >
                10B
              </button>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, level: 50, hunterRank: 'S-Rank' }))}
                className="px-2 py-1 rounded bg-red-600 hover:bg-red-700"
              >
                S-Rank
              </button>
            </div>
          </div>

          {/* Weather Controls */}
          <div>
            <div className="text-xs text-gray-300 mb-1">Weather</div>
            <div className="flex gap-1 text-xs">
              <button 
                onClick={() => setWeather('clear')}
                className={`px-2 py-1 rounded ${weather === 'clear' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Clear
              </button>
              <button 
                onClick={() => setWeather('rain')}
                className={`px-2 py-1 rounded ${weather === 'rain' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Rain
              </button>
              <button 
                onClick={() => setWeather('snow')}
                className={`px-2 py-1 rounded ${weather === 'snow' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Snow
              </button>
            </div>
          </div>
            </div>
          )}
        </div>

        {/* Weather Effects Layer */}
        {getWeatherOverlay()}
        




        {/* Cha Hae-In Presence Indicator - Golden Breathing Node */}
        {(chaHaeInCurrentLocation === playerLocation) && (
          <motion.div
            className="absolute cursor-pointer z-30 group"
            style={{
              left: `${currentLocationData.chaPosition.x}%`,
              top: `${currentLocationData.chaPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleChaHaeInInteraction}
          >
            <div className="relative">
              {/* Outer Pulsing Aura - Breathing Effect */}
              <motion.div
                className="w-20 h-20 rounded-full blur-md"
                style={{
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.15) 40%, transparent 70%)'
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Middle Glow Ring */}
              <motion.div
                className="absolute inset-2 w-16 h-16 rounded-full blur-sm"
                style={{
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.2) 50%, transparent 100%)'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.9, 0.5]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />
              
              {/* Core Presence Dot with Enhanced Pulsing */}
              <motion.div
                className="absolute inset-6 w-8 h-8 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full shadow-lg border border-yellow-200/50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.9, 1, 0.9],
                  boxShadow: [
                    '0 0 8px rgba(251, 191, 36, 0.4)',
                    '0 0 16px rgba(251, 191, 36, 0.6)',
                    '0 0 8px rgba(251, 191, 36, 0.4)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              />
              
              {/* Ripple Effect */}
              <motion.div
                className="absolute inset-0 w-20 h-20 rounded-full border border-amber-400/30"
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.6, 0, 0.6]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
              />
              
              {/* Context Box - Compact Info */}
              <motion.div
                className="absolute top-1 left-12 pointer-events-none z-30 whitespace-nowrap"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-sm border border-amber-400/20 shadow-md">
                  <div className="font-medium text-amber-300" style={{ fontSize: '10px' }}>Cha Hae-In</div>
                  <div className="text-gray-300" style={{ fontSize: '9px' }}>{currentLocationData.chaActivity}</div>
                </div>
              </motion.div>

              {/* Hover Interaction Hint */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 whitespace-nowrap">
                <div className="bg-purple-900/90 backdrop-blur-sm text-purple-200 text-xs px-3 py-1.5 rounded-lg border border-purple-400/30 shadow-xl">
                  Tap to interact
                </div>
              </div>

              {/* System 2: Affection Heart Animation */}
              <AnimatePresence>
                {showAffectionHeart && (
                  <motion.div
                    className="absolute -top-2 -right-2 z-40 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ 
                      opacity: [0, 1, 1, 1, 0],
                      scale: [0.5, 1.2, 1, 1, 0.8],
                      y: [10, -5, 0, 0, -10]
                    }}
                    exit={{ opacity: 0, scale: 0.5, y: -20 }}
                    transition={{ 
                      duration: 3,
                      times: [0, 0.1, 0.2, 0.8, 1],
                      ease: "easeInOut"
                    }}
                  >
                    {/* Outer Glow Effect */}
                    <motion.div
                      className="absolute inset-0 w-8 h-8 rounded-full blur-sm"
                      style={{
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(219, 39, 119, 0.3) 50%, transparent 100%)'
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.6, 0.9, 0.6]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: 1, 
                        ease: "easeInOut" 
                      }}
                    />
                    
                    {/* Heart Icon with Shimmer and Sparkles */}
                    <SparkleEffect intensity="high" color="pink" className="w-8 h-8">
                      <motion.div
                        className="w-8 h-8 flex items-center justify-center text-pink-400"
                        animate={{
                          rotate: [0, -10, 10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 0.8, 
                          repeat: 2, 
                          ease: "easeInOut" 
                        }}
                      >
                        <Heart 
                          className="w-6 h-6 fill-pink-400 drop-shadow-lg" 
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.8))'
                          }}
                        />
                      </motion.div>
                    </SparkleEffect>
                    
                    {/* Sparkle Effects */}
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1, 
                        delay: 0.5,
                        ease: "easeInOut" 
                      }}
                    />
                    <motion.div
                      className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-300 rounded-full"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1, 
                        delay: 0.8,
                        ease: "easeInOut" 
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
        
        {/* Quest Objective Indicator */}
        {gameState.activeQuests?.some(quest => quest.targetLocation === playerLocation) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-4 right-4 z-50"
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

        {/* Enhanced Interactive Nodes System */}
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
          onNodeInteraction={(nodeId, thoughtPrompt, outcome) => {
            console.log('Node interaction triggered:', { nodeId, thoughtPrompt, outcome });
            console.log('Current story flags:', storyFlags);
            console.log('Available for red_gate_entrance:', nodeId === 'red_gate_entrance');
            
            // Check if this interaction progresses an active quest
            const activeQuestAtLocation = gameState.activeQuests?.find(quest => 
              quest.targetLocation === playerLocation
            );
            
            if (activeQuestAtLocation) {
              // Update quest progress
              setGameState(prev => ({
                ...prev,
                activeQuests: prev.activeQuests?.map(quest => 
                  quest.id === activeQuestAtLocation.id 
                    ? { ...quest, progress: Math.min(100, (quest.progress || 0) + 25) }
                    : quest
                ) || []
              }));
              
              // Show quest progress notification
              setTimeout(() => {
                setShowActivityNotification(true);
                setTimeout(() => setShowActivityNotification(false), 3000);
              }, 1000);
              
              console.log(`Quest progress: ${activeQuestAtLocation.title} advanced by interaction`);
            }
            
            // Handle different node types with specific logic
            console.log('🔍 SWITCH STATEMENT - Processing nodeId:', nodeId);
            switch (nodeId) {
              case 'red_gate_entrance':
              case 'red_gate':
                // Enter the Red Gate dungeon for quest completion
                console.log('🚪 RED GATE ENTRANCE CASE MATCHED - Opening dungeon raid');
                console.log('Current showDungeonRaid state:', showDungeonRaid);
                setShowDungeonRaid(true);
                console.log('Dungeon raid state set to true');
                console.log('🎯 Red Gate case executed successfully');
                break;
              case 'jewelry_counter':
                // Open Item Inspection View for jewelry
                setItemInspectionCategory('jewelry');
                setShowItemInspection(true);
                console.log('Opening jewelry collection view');
                break;
              case 'designer_apparel':
                // Open Item Inspection View for clothing
                setItemInspectionCategory('clothing');
                setShowItemInspection(true);
                console.log('Opening designer apparel collection view');
                break;
              case 'luxury_confections':
                // Intimate treat sharing experience (keeping as simple interaction)
                if ((gameState.gold || 0) >= 15000) {
                  setGameState(prev => ({
                    ...prev,
                    gold: Math.max(0, (prev.gold || 0) - 15000),
                    affection: Math.min(100, prev.affection + 8)
                  }));
                  handleEnvironmentalInteraction({
                    id: 'chocolate_sharing',
                    action: 'You purchase an assortment of artisan chocolates. [- ₩15,000]. As you both sample the delicate truffles, Cha Hae-In closes her eyes to savor the flavors. "This one tastes like cherry blossoms," she murmurs with delight. The intimate moment of shared indulgence brings you closer.',
                    name: 'Luxury Confections',
                    x: 50,
                    y: 60
                  });
                  console.log('Chocolate purchase - Affection gained through intimate sharing');
                } else {
                  handleEnvironmentalInteraction({
                    id: 'confection_sampling',
                    action: 'The chocolatier offers you both a small sample of their signature truffle. Cha Hae-In\'s face lights up with pleasure at the exquisite taste. "I\'ve never had chocolate this refined," she admits, enjoying the luxurious experience even without a purchase.',
                    name: 'Luxury Confections',
                    x: 50,
                    y: 60
                  });
                }
                break;
              case 'living_room_collection':
                // Open Item Inspection View for living room furniture
                setItemInspectionCategory('living_room');
                setShowItemInspection(true);
                console.log('Opening living room furniture collection view');
                break;
              case 'bedroom_collection':
                // Open Item Inspection View for bedroom furniture
                setItemInspectionCategory('bedroom');
                setShowItemInspection(true);
                console.log('Opening bedroom furniture collection view');
                break;
              
              // Hongdae Cafe simple interactions
              case 'order_counter':
                // Simple drink ordering with preference detection
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
                    action: 'You browse the menu together. Cha Hae-In points to her usual order. "I always get the same thing," she admits with a small laugh. "Some habits are hard to break."',
                    name: 'Cafe Counter',
                    x: 30,
                    y: 45
                  });
                }
                break;
              case 'window_seat':
                // Contextual conversation scene
                handleEnvironmentalInteraction({
                  id: 'window_conversation',
                  action: 'You suggest taking the window seat. Cha Hae-In nods and settles in comfortably. "I like watching people go by," she says, gazing out at the bustling Hongdae street. "It reminds me that there\'s still normal life happening outside of our hunter world."',
                  name: 'Window Seat',
                  x: 70,
                  y: 35
                });
                // Set contextual thought prompts
                setThoughtPrompts([
                  "What do you see out there?",
                  "Do you miss normal life?",
                  "This is peaceful, isn't it?"
                ]);
                console.log('Window seat conversation - Contextual dialogue triggered');
                break;
                
              // Hangang River Park simple interactions  
              case 'park_bench':
                // Heartfelt conversation scene with Memory Star potential
                setGameState(prev => ({
                  ...prev,
                  affection: Math.min(100, prev.affection + 8)
                }));
                handleEnvironmentalInteraction({
                  id: 'bench_heart_to_heart',
                  action: 'You suggest sitting on the bench overlooking the river. Cha Hae-In sits beside you, closer than usual. The gentle breeze carries the scent of cherry blossoms. "Sometimes I forget how beautiful Seoul can be," she says softly, her usual stoic demeanor melting away in the peaceful moment.',
                  name: 'River Bench',
                  x: 45,
                  y: 60
                });
                // Set heartfelt thought prompts
                setThoughtPrompts([
                  "You seem more relaxed here.",
                  "What are you thinking about?",
                  "I could stay here with you forever."
                ]);
                console.log('Park bench - Heartfelt scene with high affection gain');
                break;
              case 'street_food_vendor':
                // Simple food sharing interaction
                if ((gameState.gold || 0) >= 5000) {
                  setGameState(prev => ({
                    ...prev,
                    gold: Math.max(0, (prev.gold || 0) - 5000),
                    affection: Math.min(100, prev.affection + 4)
                  }));
                  handleEnvironmentalInteraction({
                    id: 'street_food_sharing',
                    action: 'You buy hotteok from the street vendor. [- ₩5,000]. The sweet pancakes are still warm as you share them. Cha Hae-In laughs when the honey drips on her fingers. "I haven\'t had street food in ages," she admits, licking the sweetness away with genuine delight.',
                    name: 'Street Food Vendor',
                    x: 25,
                    y: 40
                  });
                  console.log('Street food sharing - Small affection gain through simple pleasure');
                } else {
                  handleEnvironmentalInteraction({
                    id: 'food_vendor_browse',
                    action: 'You approach the street food vendor together. The aroma of hotteok and tteokbokki fills the air. Cha Hae-In inhales deeply. "That smells incredible," she says wistfully.',
                    name: 'Street Food Vendor',
                    x: 25,
                    y: 40
                  });
                }
                break;
                
              case 'reception_desk':
              case 'architectural_models':
                setShowLuxuryRealtor(true);
                console.log('Opening luxury realtor property interface');
                break;
              // Myeongdong Fine Dining - Date Activity Exclusive Nodes
              case 'view_menu':
                // Menu UI for conversational ordering choices
                if (gameState.unlockedActivities?.includes('fine_dining_date')) {
                  handleEnvironmentalInteraction({
                    id: 'menu_discussion',
                    action: 'You and Cha Hae-In review the elegant menu together. "Everything looks exquisite," she says, studying the options carefully. "What catches your eye?" The sommelier approaches to discuss wine pairings.',
                    name: 'Fine Dining Menu',
                    x: 45,
                    y: 40
                  });
                  // Set menu-specific thought prompts
                  setThoughtPrompts([
                    "Order the chef's special for both of us.",
                    "Ask what she recommends.",
                    "Let's try something we've never had before."
                  ]);
                  console.log('Fine dining menu conversation triggered');
                } else {
                  handleEnvironmentalInteraction({
                    id: 'restaurant_closed',
                    action: 'The restaurant appears to be fully booked. You would need to make a reservation through the Daily Life Hub for a proper dining experience here.',
                    name: 'Myeongdong Restaurant',
                    x: 45,
                    y: 40
                  });
                }
                break;
              case 'speak_sommelier':
                // NPC dialogue with wine recommendation and purchase option
                if (gameState.unlockedActivities?.includes('fine_dining_date')) {
                  if ((gameState.gold || 0) >= 50000) {
                    setGameState(prev => ({
                      ...prev,
                      gold: Math.max(0, (prev.gold || 0) - 50000),
                      affection: Math.min(100, prev.affection + 12)
                    }));
                    handleEnvironmentalInteraction({
                      id: 'sommelier_recommendation',
                      action: 'The sommelier recommends a rare vintage. [- ₩50,000]. "An excellent choice," Cha Hae-In says as she savors the wine. "You have refined taste." The expensive gesture shows your commitment to making this evening special.',
                      name: 'Wine Recommendation',
                      x: 60,
                      y: 50
                    });
                    console.log('Premium wine ordered - High affection gain');
                  } else {
                    handleEnvironmentalInteraction({
                      id: 'sommelier_budget',
                      action: 'The sommelier suggests several excellent options within your budget. Cha Hae-In appreciates that you\'re being thoughtful about the selection rather than just ordering the most expensive option.',
                      name: 'Wine Selection',
                      x: 60,
                      y: 50
                    });
                  }
                } else {
                  handleEnvironmentalInteraction({
                    id: 'sommelier_unavailable',
                    action: 'The sommelier is busy with other guests. You would need a reservation to receive their full attention.',
                    name: 'Sommelier',
                    x: 60,
                    y: 50
                  });
                }
                break;
                
              // N Seoul Tower - Date Activity Exclusive Nodes
              case 'observation_deck':
                // Cinematic mode for romantic panoramic scene
                if (gameState.unlockedActivities?.includes('seoul_tower_date')) {
                  setCinematicMode(true);
                  setGameState(prev => ({
                    ...prev,
                    affection: Math.min(100, prev.affection + 10)
                  }));
                  handleEnvironmentalInteraction({
                    id: 'tower_cinematic',
                    action: 'The view from N Seoul Tower takes your breath away. The entire city spreads out below like a glittering tapestry. Cha Hae-In stands close beside you, her usual stoic expression softened by wonder. "Seoul looks so peaceful from up here," she whispers.',
                    name: 'Tower View',
                    x: 50,
                    y: 30
                  });
                  console.log('N Seoul Tower cinematic mode activated - Major romantic moment');
                } else {
                  handleEnvironmentalInteraction({
                    id: 'tower_general',
                    action: 'The observation deck offers an incredible view of Seoul. You would need to plan a special date here through the Daily Life Hub to fully experience this romantic location with Cha Hae-In.',
                    name: 'Tower View',
                    x: 50,
                    y: 30
                  });
                }
                break;
              case 'wall_of_locks':
                // Key relationship scene requiring padlock item
                if (gameState.unlockedActivities?.includes('seoul_tower_date')) {
                  const hasPadlock = gameState.inventory?.some(item => item.id === 'padlock' || item === 'padlock');
                  if (hasPadlock) {
                    setGameState(prev => ({
                      ...prev,
                      affection: Math.min(100, prev.affection + 15),
                      inventory: prev.inventory?.filter(item => 
                        (typeof item === 'string' ? item : item.id) !== 'padlock'
                      ) || []
                    }));
                    handleEnvironmentalInteraction({
                      id: 'lock_ceremony',
                      action: 'You produce the padlock you purchased. Cha Hae-In\'s eyes widen with surprise and genuine emotion. Together, you attach your lock to the wall among thousands of others. "This... this is forever," she says softly, her voice filled with meaning. [Memory Star Created]',
                      name: 'Love Lock Ceremony',
                      x: 70,
                      y: 60
                    });
                    console.log('Love lock ceremony completed - Memory Star created, highest affection gain');
                  } else {
                    handleEnvironmentalInteraction({
                      id: 'lock_wall_observe',
                      action: 'You examine the wall of love locks together. "So many promises," Cha Hae-In observes. "I wonder how many of them lasted." You would need to purchase a padlock to add your own.',
                      name: 'Wall of Locks',
                      x: 70,
                      y: 60
                    });
                  }
                } else {
                  handleEnvironmentalInteraction({
                    id: 'locks_casual',
                    action: 'The wall of love locks represents countless relationships and promises. A romantic gesture that would be more meaningful on a planned date.',
                    name: 'Wall of Locks',
                    x: 70,
                    y: 60
                  });
                }
                break;
                
              // Generic location nodes
              case 'counter':
              case 'window_seat':
                // Trigger environmental interaction with thought prompt
                handleEnvironmentalInteraction({
                  id: nodeId,
                  action: thoughtPrompt,
                  name: nodeId.replace(/_/g, ' '),
                  x: 50,
                  y: 50
                });
                break;

              case 'mission_board':
                // Opens lore panel with gate information
                setShowQuestBoard(true);
                console.log('Opening mission board with gate alerts and world lore');
                break;
              case 'receptionist':
                // Simple NPC dialogue box - no focus animation, brief interaction
                setShowReceptionistDialogue({
                  dialogue: getReceptionistDialogue(),
                  position: { x: 65, y: 45 }
                });
                console.log('Guild Employee Ji-Hoon providing rumor/hint');
                break;
              case 'elevator_bank':
                // Floor selection UI - opens sleek navigation panel
                setShowFloorSelect(true);
                console.log('Opening floor selection UI');
                break;
              case 'sparring_ring':
              case 'combat_analytics':
                // Training facility interactions
                handleEnvironmentalInteraction({
                  id: nodeId,
                  action: thoughtPrompt,
                  name: nodeId.replace(/_/g, ' '),
                  x: 50,
                  y: 50
                });
                break;
              // Penthouse Gateway Nodes - Tier 3 Luxury Experience
              case 'penthouse_living_room_couch':
                // Gateway: Relaxation unlock for Daily Life Hub
                setGameState(prev => ({
                  ...prev,
                  unlockedActivities: [
                    ...(prev.unlockedActivities || []),
                    'cuddle_and_watch_movie',
                    'deep_conversation_couch',
                    'romantic_movie_night'
                  ]
                }));
                handleEnvironmentalInteraction({
                  id: 'penthouse_relaxation',
                  action: '*You settle onto the luxurious sofa together, the city lights creating a perfect ambiance. The comfort of your success and her presence fills the space with warmth.*',
                  name: 'Penthouse Living Room',
                  x: 45,
                  y: 55
                });
                console.log('Penthouse relaxation state activated - New activities unlocked in Day Planner');
                break;

              case 'floor_to_ceiling_window':
                // Gateway: Cinematic observation mode
                setCinematicMode(true);
                handleEnvironmentalInteraction({
                  id: 'penthouse_view',
                  action: '*From up here, the entire city looks like a constellation at your feet. All the struggles, all the fights... they led to this moment of peace. You stand together, masters of your domain.*',
                  name: 'Top of the World',
                  x: 80,
                  y: 35
                });
                console.log('Penthouse cinematic mode - Ultimate city view experience');
                break;

              case 'master_suite_door':
                // Gateway: Unlock highest tier intimate activities
                setGameState(prev => ({
                  ...prev,
                  unlockedActivities: [
                    ...(prev.unlockedActivities || []),
                    'master_suite_intimacy',
                    'infinity_pool_romance',
                    'master_rain_shower',
                    'spend_the_night_together',
                    'penthouse_morning_together'
                  ]
                }));
                handleEnvironmentalInteraction({
                  id: 'master_suite_gateway',
                  action: '*You suggest heading to the master suite. This is a major step - a space of ultimate privacy and intimacy. New intimate activities are now available in your Day Planner.*',
                  name: 'Master Suite Gateway',
                  x: 20,
                  y: 30
                });
                setShowActivityNotification(true);
                setTimeout(() => setShowActivityNotification(false), 4000);
                console.log('Master suite gateway activated - Highest tier intimate activities unlocked');
                break;

              case 'wine_cellar_access':
                // Gateway: Add vintage wine to inventory
                setGameState(prev => ({
                  ...prev,
                  inventory: [
                    ...(prev.inventory || []),
                    {
                      id: 'vintage_wine',
                      name: 'Vintage Wine',
                      description: 'An exceptional bottle from your private collection',
                      type: 'romantic_item',
                      rarity: 'legendary'
                    }
                  ],
                  unlockedActivities: [
                    ...(prev.unlockedActivities || []),
                    'share_vintage_wine',
                    'wine_tasting_together',
                    'romantic_wine_evening'
                  ]
                }));
                handleEnvironmentalInteraction({
                  id: 'wine_cellar',
                  action: '*You retrieve a bottle of vintage wine. The rich history and craftsmanship in this bottle reflects your journey to the top. Perfect for sharing intimate moments.*',
                  name: 'Wine Cellar',
                  x: 20,
                  y: 70
                });
                console.log('Vintage wine added to inventory - Romantic activities unlocked');
                break;

              case 'private_elevator_exit':
                // Gateway: Open World Map for travel
                setShowWorldMap(true);
                console.log('Private elevator activated - Opening world map for travel');
                break;

              case 'materials_trader':
                // Open Hunter Market with Materials Trader selected
                setShowHunterMarketVendors(true);
                setSelectedVendor('materials_trader');
                console.log('Opening Materials Trader interface');
                break;
              case 'equipment_smith':
                // Open Hunter Market with Equipment Smith selected
                setShowHunterMarketVendors(true);
                setSelectedVendor('equipment_smith');
                console.log('Opening Equipment Smith interface');
                break;
              case 'alchemist':
                // Open Hunter Market with Alchemist selected
                setShowHunterMarketVendors(true);
                setSelectedVendor('alchemist');
                console.log('Opening Alchemist interface');
                break;
              // Your Apartment & Cha Hae-In's Apartment - Direct Intimacy Gateway Nodes
              case 'bed':
                // Direct gateway to highest-tier intimate activity
                const unlockedActivities = gameState.unlockedActivities || [];
                let selectedActivity = 'bedroom_intimacy'; // Default fallback
                
                // Tier 3 - Ultimate intimate activities (requires penthouse)
                if (unlockedActivities.includes('master_suite_intimacy')) selectedActivity = 'master_suite_intimacy';
                else if (unlockedActivities.includes('spend_the_night_together')) selectedActivity = 'spend_the_night_together';
                else if (unlockedActivities.includes('penthouse_morning_together')) selectedActivity = 'penthouse_morning_together';
                // Tier 2 - Advanced intimate activities
                else if (unlockedActivities.includes('passionate_night')) selectedActivity = 'passionate_night';
                else if (unlockedActivities.includes('shower_together')) selectedActivity = 'shower_together';
                else if (unlockedActivities.includes('intimate_massage')) selectedActivity = 'intimate_massage';
                // Tier 1 - Basic intimate activities
                else if (unlockedActivities.includes('bedroom_intimacy')) selectedActivity = 'bedroom_intimacy';
                else if (unlockedActivities.includes('first_kiss')) selectedActivity = 'first_kiss';
                
                setActiveActivity(selectedActivity);
                setShowIntimateModal(true);
                console.log(`Bedroom gateway - Initiating ${selectedActivity} directly`);
                break;
              case 'living_room_couch':
                // Relaxing scene that can lead to cuddling activity
                const hasFurniture = gameState.inventory?.some(item => 
                  (typeof item === 'string' ? item : item.id)?.includes('luxury_sofa') ||
                  (typeof item === 'string' ? item : item.id)?.includes('sectional')
                );
                
                if (hasFurniture && gameState.unlockedActivities?.includes('cuddle_and_watch_movie')) {
                  setActiveActivity('cuddle_and_watch_movie');
                  setShowIntimateModal(true);
                  console.log('Living room couch - Direct cuddling activity with luxury furniture');
                } else if (gameState.unlockedActivities?.includes('cuddle_and_watch_movie')) {
                  setActiveActivity('cuddle_and_watch_movie');
                  setShowIntimateModal(true);
                  console.log('Living room couch - Cuddling activity available');
                } else {
                  // Basic relaxation scene
                  handleEnvironmentalInteraction({
                    id: 'couch_relaxation',
                    action: 'You suggest relaxing on the sofa together. Cha Hae-In settles beside you with a content sigh. "This is nice," she says softly, leaning against your shoulder. The intimate proximity feels natural and comfortable.',
                    name: 'Living Room Couch',
                    x: 45,
                    y: 55
                  });
                  setGameState(prev => ({
                    ...prev,
                    affection: Math.min(100, prev.affection + 6)
                  }));
                  console.log('Living room couch - Basic relaxation scene with affection gain');
                }
                break;
              case 'vanity_table':
              case 'bookshelf':
              case 'window_view':
              case 'tea_station':
                // Other intimate apartment interactions - enhance affection
                setGameState(prev => ({
                  ...prev,
                  affection: Math.min(100, prev.affection + 2)
                }));
                handleEnvironmentalInteraction({
                  id: nodeId,
                  action: thoughtPrompt,
                  name: nodeId.replace(/_/g, ' '),
                  x: 50,
                  y: 50
                });
                break;
              default:
                handleEnvironmentalInteraction({
                  id: nodeId,
                  action: thoughtPrompt,
                  name: nodeId.replace(/_/g, ' '),
                  x: 50,
                  y: 50
                });
            }
          }}
        />
        


        {/* Location Info Overlay */}
        <motion.div
          className="absolute top-6 left-6 liquid-glass-enhanced px-3 py-2 max-w-64"
          initial={{ opacity: 0, x: -50 }}
          animate={{ 
            opacity: isFocusMode ? 0 : 1, 
            x: isFocusMode ? -50 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold text-white mb-1">{currentLocationData.name}</h2>
          <p className="text-slate-300 text-sm mb-2">{currentLocationData.description}</p>
          
          {/* Time and Weather */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="capitalize">{timeOfDay}</span>
            </div>
            <div className="flex items-center gap-1">
              {timeOfDay === 'night' || timeOfDay === 'evening' ? 
                <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />
              }
              <span className="capitalize">{weather}</span>
            </div>
          </div>
          
          {/* Presence Indicator */}
          {currentLocationData.chaHaeInPresent && (
            <motion.div
              className="flex items-center gap-2 mt-3 text-pink-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="w-2 h-2 bg-pink-400 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-medium">Cha Hae-In is here</span>
            </motion.div>
          )}
        </motion.div>
        
        {/* Narrative Lens Icon */}
        <AnimatePresence>
          {narrativeLensActive && (
            <motion.div
              className="absolute top-6 right-6"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <MysticalEye
                intensity="high"
                size="md"
                color="purple"
                isActive={true}
                onClick={() => {
                  console.log('Narrative lens activated');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Activity Scheduled Notification */}
      <AnimatePresence>
        {showActivityNotification && (
          <motion.div
            className="fixed top-6 right-6 z-50 p-4 rounded-lg max-w-sm"
            style={{
              backdropFilter: 'blur(60px) saturate(200%)',
              background: `
                linear-gradient(135deg, 
                  rgba(16, 185, 129, 0.9) 0%, 
                  rgba(5, 150, 105, 0.8) 100%
                )
              `,
              border: '1px solid rgba(16, 185, 129, 0.6)',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
            }}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Activity Scheduled!</h3>
                <p className="text-white/80 text-xs">
                  {scheduledActivities.length > 0 && scheduledActivities[scheduledActivities.length - 1]?.title}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogue System - Enhanced Glassmorphism */}
      <AnimatePresence>
        {dialogueActive && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 rounded-2xl shadow-2xl z-[9999]"
            style={{ 
              maxHeight: '60vh',
              backdropFilter: 'blur(120px) saturate(300%)',
              background: `
                linear-gradient(135deg, 
                  rgba(30, 41, 59, 0.95) 0%, 
                  rgba(51, 65, 85, 0.85) 25%,
                  rgba(30, 41, 59, 0.9) 50%,
                  rgba(15, 23, 42, 0.95) 75%,
                  rgba(30, 41, 59, 0.9) 100%
                ),
                radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)
              `,
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="p-3 flex flex-col h-full">
              
              {/* Close Button - Enhanced Glassmorphism */}
              <motion.button
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-[10000]"
                style={{
                  backdropFilter: 'blur(40px) saturate(200%)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onClick={exitFocusMode}
                whileHover={{ 
                  scale: 1.1,
                  background: 'rgba(255, 255, 255, 0.15)'
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <X className="w-4 h-4 text-white/80" />
              </motion.button>
              
              {/* Dialogue Text - Enhanced Glassmorphism */}
              <motion.div
                className="rounded-lg p-4 flex-1 overflow-y-auto mb-3"
                style={{
                  backdropFilter: 'blur(60px) saturate(200%)',
                  background: `
                    linear-gradient(135deg, 
                      rgba(30, 41, 59, 0.4) 0%, 
                      rgba(51, 65, 85, 0.3) 25%,
                      rgba(30, 41, 59, 0.35) 50%,
                      rgba(15, 23, 42, 0.4) 75%,
                      rgba(30, 41, 59, 0.35) 100%
                    )
                  `,
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-4">
                  {/* Cha Hae-In Emotional Avatar */}
                  <motion.div 
                    className="shrink-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: showLivingPortrait ? 1 : 0, x: showLivingPortrait ? 0 : -20 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="w-20 h-24 relative">
                      {/* Emotional Portrait Image - Enhanced with Expression-Based Animations */}
                      <motion.div 
                        className="absolute inset-0 rounded-xl overflow-hidden border-2 shadow-2xl"
                        animate={{
                          borderColor: chaHaeInExpression === 'romantic' ? 'rgba(236, 72, 153, 0.6)' :
                                      chaHaeInExpression === 'welcoming' ? 'rgba(16, 185, 129, 0.6)' :
                                      chaHaeInExpression === 'surprised' ? 'rgba(245, 158, 11, 0.6)' :
                                      chaHaeInExpression === 'amused' ? 'rgba(6, 182, 212, 0.6)' :
                                      chaHaeInExpression === 'contemplative' ? 'rgba(99, 102, 241, 0.6)' :
                                      chaHaeInExpression === 'concerned' ? 'rgba(239, 68, 68, 0.6)' :
                                      'rgba(139, 92, 246, 0.4)',
                          boxShadow: chaHaeInExpression === 'romantic' ? '0 0 25px rgba(236, 72, 153, 0.5)' :
                                    chaHaeInExpression === 'welcoming' ? '0 0 20px rgba(16, 185, 129, 0.4)' :
                                    chaHaeInExpression === 'surprised' ? '0 0 20px rgba(245, 158, 11, 0.4)' :
                                    chaHaeInExpression === 'amused' ? '0 0 20px rgba(6, 182, 212, 0.4)' :
                                    chaHaeInExpression === 'contemplative' ? '0 0 20px rgba(99, 102, 241, 0.4)' :
                                    chaHaeInExpression === 'concerned' ? '0 0 20px rgba(239, 68, 68, 0.4)' :
                                    '0 0 15px rgba(139, 92, 246, 0.3)',
                          scale: chaHaeInExpression === 'surprised' ? 1.02 :
                                chaHaeInExpression === 'romantic' ? 1.01 : 1
                        }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        {(avatarImage || emotionalImage) ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={(avatarImage || emotionalImage) as string}
                              alt="Cha Hae-In"
                              className="w-full h-full object-cover"
                            />
                            {isGeneratingAvatar && (
                              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-pink-300/20 flex items-center justify-center">
                            <div className="text-pink-200 text-center">
                              <div className="w-8 h-3 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-full mb-1 mx-auto" />
                              <div className="w-6 h-6 bg-gradient-to-b from-pink-100 to-pink-200 rounded-full mx-auto mb-1" />
                              <div className="w-5 h-4 bg-gradient-to-b from-blue-800 to-blue-900 rounded-b-lg mx-auto" />
                            </div>
                          </div>
                        )}

                        
                        {/* Gradient Overlay for Depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </motion.div>
                      
                      {/* Expression Indicator - Enhanced with More Emotions */}
                      <motion.div 
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs"
                        animate={{
                          backgroundColor: chaHaeInExpression === 'romantic' ? '#ec4899' :
                                          chaHaeInExpression === 'welcoming' ? '#10b981' : 
                                          chaHaeInExpression === 'surprised' ? '#f59e0b' :
                                          chaHaeInExpression === 'amused' ? '#06b6d4' :
                                          chaHaeInExpression === 'contemplative' ? '#6366f1' :
                                          chaHaeInExpression === 'concerned' ? '#ef4444' :
                                          chaHaeInExpression === 'focused' ? '#8b5cf6' : '#64748b'
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <span className="text-white text-xs">
                          {chaHaeInExpression === 'romantic' ? '💕' : 
                           chaHaeInExpression === 'welcoming' ? '😊' :
                           chaHaeInExpression === 'surprised' ? '😲' :
                           chaHaeInExpression === 'amused' ? '😄' :
                           chaHaeInExpression === 'contemplative' ? '🤔' :
                           chaHaeInExpression === 'concerned' ? '😟' :
                           chaHaeInExpression === 'focused' ? '🎯' : '😐'}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  <div className="flex-1">
                    {/* Cinematic Script-Style Conversation History */}
                    <div 
                      ref={conversationScrollRef}
                      className="space-y-3 max-h-48 overflow-y-auto scroll-smooth"
                    >
                      {conversationHistory.map((entry, index) => (
                        <motion.div
                          key={index}
                          className={`flex ${entry.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {entry.type === 'user' ? (
                            // User messages: Right-aligned, italic, no bubble, ethereal color
                            <div className="max-w-[85%] text-right">
                              <p className="text-slate-300/80 italic leading-relaxed text-sm">
                                {entry.text}
                              </p>
                            </div>
                          ) : (
                            // Cha Hae-In messages: Left-aligned, bright white, script-like
                            <div className="max-w-[85%]">
                              <p className="text-white leading-relaxed font-medium">
                                {entry.text}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {/* Current Response Loading Indicator */}
                      {isLoading && (
                        <motion.div
                          className="flex justify-start"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="flex items-center gap-2 text-slate-400">
                            <motion.div
                              className="w-2 h-2 bg-pink-400 rounded-full"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className="italic text-sm">Cha Hae-In is responding...</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Bottom Section - Always Visible */}
              <div className="space-y-3">
                {/* Thought Prompts */}
                {thoughtPrompts.length > 0 && (
                  <motion.div
                    className="flex gap-2 overflow-x-auto pb-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {thoughtPrompts.map((prompt, index) => (
                      <motion.button
                        key={index}
                        className="text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors"
                        style={{
                          backdropFilter: 'blur(40px) saturate(180%)',
                          background: `
                            linear-gradient(135deg, 
                              rgba(139, 92, 246, 0.25) 0%, 
                              rgba(168, 85, 247, 0.2) 25%,
                              rgba(139, 92, 246, 0.22) 50%,
                              rgba(124, 58, 237, 0.25) 75%,
                              rgba(139, 92, 246, 0.2) 100%
                            )
                          `,
                          border: '1px solid rgba(139, 92, 246, 0.4)'
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          background: `
                            linear-gradient(135deg, 
                              rgba(139, 92, 246, 0.4) 0%, 
                              rgba(168, 85, 247, 0.35) 25%,
                              rgba(139, 92, 246, 0.37) 50%,
                              rgba(124, 58, 237, 0.4) 75%,
                              rgba(139, 92, 246, 0.35) 100%
                            )
                          `
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePlayerResponse(prompt)}
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
                
                {/* Player Input */}
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <input
                    value={playerInput}
                    onChange={(e) => {
                      setPlayerInput(e.target.value);
                      updateExpressionBasedOnInput(e.target.value);
                    }}
                    placeholder="Speak from the heart..."
                    className="flex-1 text-white placeholder:text-slate-400 rounded-lg px-3 py-2 text-sm border-0 outline-none"
                    style={{
                      backdropFilter: 'blur(40px) saturate(180%)',
                      background: `
                        linear-gradient(135deg, 
                          rgba(30, 41, 59, 0.3) 0%, 
                          rgba(51, 65, 85, 0.25) 25%,
                          rgba(30, 41, 59, 0.28) 50%,
                          rgba(15, 23, 42, 0.3) 75%,
                          rgba(30, 41, 59, 0.25) 100%
                        )
                      `,
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handlePlayerResponse(playerInput)}
                  />
                  <motion.button
                    onClick={() => handlePlayerResponse(playerInput)}
                    className="rounded-lg px-4 py-2 text-white disabled:opacity-50"
                    style={{
                      backdropFilter: 'blur(40px) saturate(180%)',
                      background: `
                        linear-gradient(135deg, 
                          rgba(139, 92, 246, 0.6) 0%, 
                          rgba(236, 72, 153, 0.5) 50%,
                          rgba(139, 92, 246, 0.6) 100%
                        )
                      `,
                      border: '1px solid rgba(139, 92, 246, 0.4)'
                    }}
                    whileHover={{
                      background: `
                        linear-gradient(135deg, 
                          rgba(139, 92, 246, 0.8) 0%, 
                          rgba(236, 72, 153, 0.7) 50%,
                          rgba(139, 92, 246, 0.8) 100%
                        )
                      `,
                      scale: 1.05
                    }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!playerInput.trim() || isLoading}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </div>
              

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      


      {/* Monarch's Aura - Compact Clean Menu */}
      {monarchAuraVisible && (
        <div className="fixed top-20 right-6 w-40 bg-black/20 backdrop-blur-xl border border-white/30 rounded-lg p-2 z-[9998] shadow-2xl" 
             style={{ 
               background: 'rgba(255, 255, 255, 0.08)', 
               backdropFilter: 'blur(40px) saturate(180%)', 
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
             }}>
          <div className="text-white text-sm mb-2 font-medium text-center opacity-80">Monarch's Aura</div>
          {[
            { icon: Package, label: 'Inventory', color: 'text-purple-300', onClick: () => { setShowInventory(true); setMonarchAuraVisible(false); } },
            { icon: Crown, label: 'Armory', color: 'text-amber-300', onClick: () => { setShowMonarchArmory(true); setMonarchAuraVisible(false); } },
            { icon: Sword, label: 'Raid', color: 'text-red-300', onClick: () => { setShowDungeonRaid(true); setMonarchAuraVisible(false); } },
            { icon: Star, label: 'Quests', color: 'text-green-300', onClick: () => { setShowQuestLog(true); setMonarchAuraVisible(false); } },
            { icon: MapPin, label: 'World Map', color: 'text-blue-300', onClick: () => { setShowWorldMap(true); setMonarchAuraVisible(false); } },
            { icon: Heart, label: 'Constellation', color: 'text-pink-300', onClick: () => { setShowConstellation(true); setMonarchAuraVisible(false); } },
            { icon: Gift, label: 'Daily Life', color: 'text-yellow-300', onClick: () => { setShowDailyLifeHub(true); setMonarchAuraVisible(false); } },
            { icon: MessageCircle, label: 'Communicator', color: 'text-cyan-300', onClick: () => { setShowCommunicator(true); setMonarchAuraVisible(false); } },
            { icon: User, label: 'Character', color: 'text-indigo-300', onClick: () => { setShowPlayerProgression(true); setMonarchAuraVisible(false); } },
            { icon: Brain, label: 'Story Progress', color: 'text-violet-300', onClick: () => { setShowNarrativeProgression(true); setMonarchAuraVisible(false); } }
          ].map((item, index) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-2 p-2 rounded text-white hover:bg-white/10 transition-all mb-1"
              onClick={item.onClick}
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {monarchAuraVisible && (
        <div 
          className="fixed inset-0 z-[9997]" 
          onClick={() => setMonarchAuraVisible(false)}
        />
      )}

      {/* System 15: Notification Banners */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-80 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-4 cursor-pointer"
            onClick={() => {
              setShowCommunicator(true);
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                notification.type === 'quest' ? 'bg-yellow-400' : 'bg-pink-400'
              }`} />
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                <p className="text-white/70 text-xs mt-1">{notification.content}</p>
              </div>
              <MessageCircle className="w-4 h-4 text-white/60" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      


      {/* Feature Modals */}
      <DailyLifeHubComplete
        isVisible={showDailyLifeHub}
        onClose={() => setShowDailyLifeHub(false)}
        playerStats={{
          gold: gameState.gold || 0,
          level: gameState.level || 1,
          experience: gameState.experience || 0,
          affectionLevel: (gameState.affection || 0) * 10,
          energy: gameState.energy || 80,
          maxEnergy: 100,
          relationshipStatus: gameState.affection >= 5 ? 'married' : gameState.affection >= 4 ? 'engaged' : 'dating',
          intimacyLevel: gameState.intimacyLevel || (gameState.affection * 10) || 0,
          sharedMemories: (gameState.affection || 0) * 10,
          livingTogether: gameState.affection >= 4,
          daysTogether: (gameState.affection || 1) * 30,
          apartmentTier: gameState.apartmentTier || 1,
          hasModernKitchen: (gameState.apartmentTier ?? 1) >= 2,
          hasHomeGym: (gameState.apartmentTier ?? 1) >= 3
        }}
        timeOfDay={timeOfDay}
        onActivitySelect={(activity) => {
          setActiveActivity(activity.id);
          setShowDailyLifeHub(false);
          
          // Route activity to appropriate system
          if (activity.category === 'intimate') {
            // Route to System 5: Intimate Activity System for mature content
            setCurrentIntimateActivity({
              id: activity.id,
              title: activity.title
            });
            setShowIntimateActivity(true);
          } else if (activity.id === 'give_gift') {
            setShowUnifiedShop(true);
          } else if (activity.id === 'shopping_together') {
            setShowLuxuryDepartmentStore(true);
          } else {
            // Handle other activities through dialogue system
            setCurrentDialogue(`You and Cha Hae-In ${activity.description.toLowerCase()}`);
            setDialogueActive(true);
            setShowLivingPortrait(true);
            
            // Update game state based on activity
            setGameState(prev => ({
              ...prev,
              energy: Math.max(0, (prev.energy || 80) - activity.energyCost),
              affection: Math.min(100, prev.affection + (activity.affectionReward || 0)),
              experience: (prev.experience || 0) + 50
            }));
            
            generateSceneImage();
          }
        }}
      />

      <IntimateActivityModal
        isVisible={showIntimateModal}
        onClose={() => setShowIntimateModal(false)}
        onReturnToHub={() => {
          setShowIntimateModal(false);
          setShowDailyLifeHub(true);
        }}
        activityType={activeActivity as 'shower_together' | 'cuddle_together' | 'bedroom_intimacy' | 'make_love' | null}
        onAction={(action) => console.log('Intimate action:', action)}
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
              setSceneImage(data.imageUrl);
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
        onPurchase={(item: any) => {
          setGameState(prev => ({
            ...prev,
            gold: (prev.gold || 0) - item.cost,
            inventory: [...prev.inventory, item]
          }));
        }}
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

      <RelationshipConstellationSystem6
        isVisible={showConstellation}
        onClose={() => setShowConstellation(false)}
        affectionLevel={Math.min(100, gameState.affection * 10)} // Convert 0-10 scale to 0-100, cap at 100%
        memories={[]} // Additional custom memories can be added here
        onMemorySelect={(memory) => {
          console.log('Viewing memory:', memory.title);
          // Could trigger scene replay or dialogue here
        }}
      />

      <DungeonRaidSystem11
        isVisible={showDungeonRaid}
        onClose={() => {
          console.log('Closing dungeon raid');
          setShowDungeonRaid(false);
        }}
        onRaidComplete={(success, loot) => {
          if (success) {
            setGameState(prev => ({
              ...prev,
              gold: (prev.gold || 0) + 15000000,
              affection: Math.min(100, prev.affection + 10),
              experience: (prev.experience || 0) + 500
            }));
            loot.forEach(item => {
              setGameState(prev => ({
                ...prev,
                inventory: [...prev.inventory, item]
              }));
            });
          }
        }}
        playerLevel={gameState.level}
        affectionLevel={gameState.affection}
      />

      <MonarchArmory
        isVisible={showArmory}
        onClose={() => setShowArmory(false)}
        playerLevel={gameState.level}
        equipment={[]}
        onEquip={(itemId, slot) => {
          console.log(`Equipped ${itemId} to ${slot}`);
        }}
        onUpgrade={(itemId) => {
          console.log(`Upgraded ${itemId}`);
        }}
        onGiftToChaHaeIn={(itemId) => {
          console.log(`Gifted ${itemId} to Cha Hae-In`);
          setGameState(prev => ({
            ...prev,
            affection: Math.min(100, prev.affection + 5)
          }));
        }}
      />

      {/* System 5: Intimate Activity System */}
      <IntimateActivitySystem5
        isVisible={showIntimateActivity}
        onClose={() => {
          setShowIntimateActivity(false);
          setCurrentIntimateActivity(null);
        }}
        activityId={currentIntimateActivity?.id || ''}
        activityTitle={currentIntimateActivity?.title || ''}
        backgroundImage={sceneImage || undefined}
        onSceneComplete={(memory) => {
          // Add memory to constellation system
          console.log('New intimate memory created:', memory);
          setGameState(prev => ({
            ...prev,
            affection: Math.min(10, prev.affection + 0.5), // Increase affection
            intimacyLevel: Math.min(10, (prev.intimacyLevel || 1) + 1)
          }));
          setShowIntimateActivity(false);
          setCurrentIntimateActivity(null);
        }}
      />

      {/* System 16: Player Progression System */}
      <PlayerProgressionSystem16
        isVisible={showPlayerProgression}
        onClose={() => setShowPlayerProgression(false)}
        playerData={{
          name: "Sung Jin-Woo",
          hunterRank: gameState.hunterRank || 'E-Rank',
          level: gameState.level,
          experience: gameState.experience || 0,
          maxExperience: gameState.maxExperience || 1000,
          health: gameState.health,
          maxHealth: gameState.maxHealth,
          mana: gameState.mana,
          maxMana: gameState.maxMana,
          stats: gameState.stats || {
            strength: 10,
            agility: 10,
            vitality: 10,
            intelligence: 10,
            sense: 10
          },
          unspentStatPoints: gameState.unspentStatPoints || 0,
          unspentSkillPoints: gameState.unspentSkillPoints || 0
        }}
        onUpdatePlayer={(updates) => {
          setGameState(prev => ({
            ...prev,
            ...updates
          }));
        }}
      />



      {/* Wealth Display - Context-sensitive visibility */}
      <WealthDisplay
        currentGold={gameState.gold || 0}
        isVisible={showUnifiedShop || showHunterMarketVendors || playerLocation === 'luxury_realtor'}
        context={showHunterMarketVendors ? 'market' : showUnifiedShop ? 'vendor' : 'hidden'}
      />

      <WorldMapSystem8
        isVisible={showWorldMap}
        onClose={() => setShowWorldMap(false)}
        onLocationSelect={handleLocationTravel}
        currentTime={timeOfDay}
        chaHaeInLocation={chaHaeInCurrentLocation || ''}
        playerAffection={gameState.affection}
        storyProgress={gameState.storyProgress || gameState.level || 0}
        activeQuests={activeQuests}
      />

      {/* Economic System Interfaces */}
      <HunterMarketVendors
        isVisible={showHunterMarketVendors}
        onClose={() => {
          setShowHunterMarketVendors(false);
          setSelectedVendor(null);
        }}
        backgroundImage={sceneImage || undefined}
        inventory={gameState.inventory || []}
        currentGold={gameState.gold || 0}
        onSellItem={handleSellItem}
        selectedVendor={selectedVendor}
      />

      <QuestBoard
        isVisible={showQuestBoard}
        onClose={() => setShowQuestBoard(false)}
        playerLevel={gameState.level}
        onAcceptQuest={handleAcceptQuest}
        activeQuests={activeQuests}
      />

      {/* System 7 Commerce Store Modals */}
      <LuxuryDepartmentStore
        isVisible={showLuxuryDepartmentStore}
        onClose={() => setShowLuxuryDepartmentStore(false)}
        currentGold={gameState.gold || 0}
        onPurchase={handleLuxuryPurchase}
        backgroundImage={currentLocationData.backgroundImage}
      />

      <GangnamFurnishings
        isVisible={showGangnamFurnishings}
        onClose={() => setShowGangnamFurnishings(false)}
        currentGold={gameState.gold || 0}
        onPurchase={handleFurniturePurchase}
        backgroundImage={currentLocationData.backgroundImage}
      />

      <LuxuryRealtor
        isVisible={showLuxuryRealtor}
        onClose={() => setShowLuxuryRealtor(false)}
        currentGold={gameState.gold || 0}
        onPurchase={handlePropertyPurchase}
        backgroundImage={currentLocationData.backgroundImage}
      />

      {/* System 15: Hunter's Communicator */}
      <HunterCommunicatorSystem15
        isVisible={showCommunicator}
        onClose={() => setShowCommunicator(false)}
        onQuestAccept={handleQuestAccept}
        onNewMessage={handleNewMessage}
        playerLocation={gameState.currentScene}
        timeOfDay={timeOfDay}
        activeQuests={gameState.activeQuests || []}
      />

      {/* System 3: Quest Log - Accessed via Monarch's Aura */}
      <QuestLogSystem3
        isVisible={showQuestLog}
        onClose={() => setShowQuestLog(false)}
        activeQuests={gameState.activeQuests || []}
        completedQuests={gameState.completedQuests || []}
        onQuestTrack={handleQuestTrack}
        onQuestAbandon={handleQuestAbandon}
      />

      {/* System 9: AI Narrative Engine - Story Progression Display */}
      <NarrativeProgressionSystem9
        playerId={gameState.playerId || 'default_player'}
        isVisible={showNarrativeProgression}
        onClose={() => setShowNarrativeProgression(false)}
      />

      {/* Monarch's Inventory System */}
      <MonarchInventorySystem
        isVisible={showInventory}
        onClose={() => setShowInventory(false)}
      />

      {/* Monarch's Armory System */}
      <MonarchArmory2D
        isVisible={showMonarchArmory}
        onClose={() => setShowMonarchArmory(false)}
      />

      {/* Simple Receptionist Dialogue Box - Liquid Glassmorphism */}
      {showReceptionistDialogue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute"
            style={{
              left: `${showReceptionistDialogue.position.x}%`,
              top: `${showReceptionistDialogue.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-sm shadow-2xl">
              {/* NPC Portrait and Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JH</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Guild Employee Ji-Hoon</h3>
                  <p className="text-white/70 text-xs">Hunter Association</p>
                </div>
              </div>
              
              {/* Dialogue Text */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <p className="text-white/90 text-sm leading-relaxed">
                  "{showReceptionistDialogue.dialogue}"
                </p>
              </div>
              
              {/* Dismiss Button */}
              <button
                onClick={() => setShowReceptionistDialogue(null)}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white py-2 px-4 rounded-lg transition-colors border border-blue-400/30"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floor Selection UI - Sleek Liquid Glassmorphism Panel */}
      {showFloorSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg">🛗</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Floor Selection</h3>
                  <p className="text-white/70 text-sm">Hunter Association HQ</p>
                </div>
              </div>
              <button
                onClick={() => setShowFloorSelect(false)}
                className="text-white/60 hover:text-white/90 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Floor List */}
            <div className="space-y-3">
              <button
                onClick={() => handleFloorSelection('main_hall')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div>
                    <p className="text-white font-medium">Main Hall & Lobby</p>
                    <p className="text-white/60 text-sm">You are here</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleFloorSelection('training_center')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <div>
                    <p className="text-white font-medium">Elite Training Center</p>
                    <p className="text-white/60 text-sm">Floor 10</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleFloorSelection('guild_master_office')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <div>
                    <p className="text-white font-medium">Office of Guild Master Woo Jin-Chul</p>
                    <p className="text-white/60 text-sm">Floor 25</p>
                  </div>
                </div>
              </button>

              <button
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-left opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div>
                    <p className="text-white font-medium">Rooftop Helipad</p>
                    <p className="text-white/60 text-sm">Locked</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elevator Transition - Door Closing Effect */}
      {elevatorTransition && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="w-1/2 bg-gray-800 animate-in slide-in-from-left duration-700 ease-in-out"></div>
          <div className="w-1/2 bg-gray-800 animate-in slide-in-from-right duration-700 ease-in-out"></div>
        </div>
      )}

      {/* Cinematic Mode - River's Edge Atmospheric Experience */}
      {cinematicMode && (
        <div className="fixed inset-0 z-[70] bg-black flex items-center justify-center">
          <div className="relative w-full h-full overflow-hidden">
            {/* Slow pan effect with current scene image */}
            <motion.div
              initial={{ scale: 1, x: 0 }}
              animate={{ scale: 1.1, x: -100 }}
              transition={{ duration: 8, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <img 
                src={sceneImage || ''} 
                alt="River view" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {/* Contemplative text overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 2 }}
              className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 text-center"
            >
              <p className="text-white/90 text-lg italic font-light max-w-2xl leading-relaxed">
                Looking at the calm river, it's easy to forget about the gates and the monsters... even for a moment.
              </p>
            </motion.div>
            
            {/* Subtle close button after the experience */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 6, duration: 1 }}
              onClick={() => setCinematicMode(false)}
              className="absolute top-8 right-8 text-white/60 hover:text-white/90 transition-colors"
            >
              ✕
            </motion.button>
          </div>
        </div>
      )}

      {/* System 11: Dungeon Raid System */}
      {showDungeonRaid && (
        <DungeonRaidSystem11
          isVisible={showDungeonRaid}
          onClose={() => setShowDungeonRaid(false)}
          onRaidComplete={(success, loot) => {
            console.log('Raid completed:', { success, loot });
            setShowDungeonRaid(false);
            
            if (success) {
              // Add loot and experience
              setGameState(prev => ({
                ...prev,
                gold: (prev.gold || 0) + 50000000,
                experience: (prev.experience || 0) + 5000
              }));
              
              // Complete the red gate quest
              const redGateQuest = gameState.activeQuests?.find(q => q.id === 'red_gate_emergency');
              if (redGateQuest) {
                setGameState(prev => ({
                  ...prev,
                  activeQuests: prev.activeQuests?.filter(q => q.id !== 'red_gate_emergency') || [],
                  completedQuests: [
                    ...(prev.completedQuests || []),
                    { ...redGateQuest, status: 'completed' as const, completedAt: new Date().toISOString() }
                  ]
                }));
              }
            }
          }}
          playerLevel={gameState.level || 1}
          affectionLevel={gameState.affection || 0}
        />
      )}

      {/* Hunter Market Vendors Interface */}
      <HunterMarketVendors
        isVisible={showHunterMarketVendors}
        onClose={() => {
          setShowHunterMarketVendors(false);
          setSelectedVendor(null);
        }}
        inventory={gameState.inventory || []}
        currentGold={gameState.gold || 0}
        onSellItem={(itemId, quantity, totalValue) => {
          setGameState(prev => ({
            ...prev,
            gold: (prev.gold || 0) + totalValue,
            inventory: prev.inventory?.map(item => 
              item.id === itemId 
                ? { ...item, quantity: Math.max(0, item.quantity - quantity) }
                : item
            ).filter(item => item.quantity > 0) || []
          }));
        }}
        backgroundImage={currentLocationData.backgroundImage}
        selectedVendor={selectedVendor}
      />

      {/* Item Inspection View - Commerce System */}
      <ItemInspectionView
        isOpen={showItemInspection}
        onClose={() => setShowItemInspection(false)}
        category={itemInspectionCategory}
        playerGold={gameState.gold || 0}
        onPurchase={handleItemPurchase}
      />
    </div>
  );
}