import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Crown, Zap, Coins, User, Sword, Star, 
  Camera, Eye, MapPin, Clock, Sun, Moon, CloudRain,
  MessageCircle, Gift, Coffee, Home, Building, Dumbbell,
  ShoppingCart, Calendar, Battery, Award, Package, X, Brain, Target, BookOpen, Wand2, Power, Bell
} from 'lucide-react';

import { DailyLifeHubComplete } from '@/components/DailyLifeHubComplete';
import { IntimateActivityModal } from '@/components/IntimateActivityModal';
import { CoffeeActivityModal } from '@/components/CoffeeActivityModal';
import { SparringSessionModal } from '@/components/SparringSessionModal';
import { TrainingActivityModal } from '@/components/TrainingActivityModal';
import { MovieNightModal } from '@/components/MovieNightModal';
import { HangangParkWalkModal } from '@/components/HangangParkWalkModal';
import { ShoppingDateModal } from '@/components/ShoppingDateModal';
import { ArcadeVisitModal } from '@/components/ArcadeVisitModal';
import { ReviewRaidFootageModal } from '@/components/ReviewRaidFootageModal';
import { ClearLowRankGateModal } from '@/components/ClearLowRankGateModal';
import { AssembleFurnitureModal } from '@/components/AssembleFurnitureModal';
import { BackRubActivityModal } from '@/components/BackRubActivityModal';
import { NSeoulTowerModal } from '@/components/NSeoulTowerModal';
import { CoopSkillTrainingModal } from '@/components/CoopSkillTrainingModal';
import { OrderTakeoutModal } from '@/components/OrderTakeoutModal';
import { TalkOnBalconyModal } from '@/components/TalkOnBalconyModal';
import { MyeongdongDinnerModal } from '@/components/MyeongdongDinnerModal';
import { DevToolsPanel } from '@/components/DevToolsPanel';
import { IntimateActivitySystem5 } from '@/components/IntimateActivitySystem5';
import { HunterCommunicatorSystem15 } from '@/components/HunterCommunicatorSystem15';
import { WorldMapCarousel } from '@/components/WorldMapCarousel';
import { UnifiedShop } from '@/components/UnifiedShop';
import EnergyReplenishmentModal from '@/components/EnergyReplenishmentModal';

import { DungeonRaidSystem11 } from '@/components/DungeonRaidSystem11Fixed';
import { PlayerProgressionSystemRedesigned as PlayerProgressionSystem16 } from '@/components/PlayerProgressionSystemRedesigned';
import { MonarchArmory } from '@/components/MonarchArmory';
import { MonarchInventorySystem } from '@/components/MonarchInventorySystemFixed';
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
import { triggerNotification } from '@/components/NotificationBell';
import { EpisodicStoryEngine } from '@/components/EpisodicStoryEngine';
import { RoleSelectionScreen } from '@/components/RoleSelectionScreen';
import { CreatorPortalDashboard } from '@/components/CreatorPortalDashboard';
import EpisodeSelector from '@/components/EpisodeSelector';
import EpisodePlayer from '@/components/EpisodePlayer';
import ProfileManager from '@/components/ProfileManager';
import SommelierDialog from '@/components/SommelierDialog';
import LuxuryRealtor from '@/components/LuxuryRealtor';
import { LocationInteractiveNodes } from '@/components/LocationInteractiveNodes';
import { NarrativeProgressionSystem9 } from '@/components/NarrativeProgressionSystem9';
import { QuestLogSystem3 } from '@/components/QuestLogSystem3';
import ItemInspectionView from '@/components/ItemInspectionView';
import { AutoWeatherSystem, DynamicWeatherSystem } from '@/components/DynamicWeatherSystem';


// Premium script formatting parser for in-person dialogue display
const parseCinematicText = (content: string) => {
  const parts: Array<{
    type: 'dialogue' | 'action' | 'thought' | 'narrative';
    text: string;
  }> = [];

  let currentIndex = 0;
  const contentLength = content.length;

  while (currentIndex < contentLength) {
    const remainingContent = content.slice(currentIndex);

    // Look for dialogue (quoted text)
    const dialogueMatch = remainingContent.match(/^"([^"]*)"(\s*)/);
    if (dialogueMatch) {
      parts.push({
        type: 'dialogue',
        text: dialogueMatch[1]
      });
      currentIndex += dialogueMatch[0].length;
      continue;
    }

    // Look for actions (asterisk text)
    const actionMatch = remainingContent.match(/^\*([^*]*)\*(\s*)/);
    if (actionMatch) {
      parts.push({
        type: 'action',
        text: actionMatch[1]
      });
      currentIndex += actionMatch[0].length;
      continue;
    }

    // Look for thoughts (parenthesis text)
    const thoughtMatch = remainingContent.match(/^\(([^)]*)\)(\s*)/);
    if (thoughtMatch) {
      parts.push({
        type: 'thought',
        text: thoughtMatch[1]
      });
      currentIndex += thoughtMatch[0].length;
      continue;
    }

    // Look for narrative (everything else)
    const narrativeMatch = remainingContent.match(/^([^"*()]+)/);
    if (narrativeMatch) {
      const text = narrativeMatch[1].trim();
      if (text) {
        parts.push({
          type: 'narrative',
          text: text
        });
      }
      currentIndex += narrativeMatch[0].length;
      continue;
    }

    // Skip single character if no matches
    currentIndex += 1;
  }

  // Convert parts to JSX with proper styling
  return parts.map((part, index) => {
    switch (part.type) {
      case 'dialogue':
        return (
          <div key={index} className="text-white text-lg font-medium leading-relaxed mb-4 tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)', lineHeight: '1.6' }}>
            "{part.text}"
          </div>
        );
      case 'action':
        return (
          <div key={index} className="text-amber-400 italic text-base leading-relaxed mb-3 pl-4 font-light" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)', letterSpacing: '0.025em' }}>
            *{part.text}*
          </div>
        );
      case 'thought':
        return (
          <div key={index} className="text-gray-400 italic text-sm leading-relaxed mb-3 pl-6 border-l-2 border-gray-600 opacity-90" style={{ fontStyle: 'italic', letterSpacing: '0.02em' }}>
            ({part.text})
          </div>
        );
      case 'narrative':
        return (
          <div key={index} className="text-gray-200 text-base leading-relaxed mb-3 opacity-95" style={{ lineHeight: '1.65', letterSpacing: '0.01em' }}>
            {part.text}
          </div>
        );
      default:
        return null;
    }
  });
};

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
  // System 16: Player Progression
  hunterRank?: string;
  stats?: CoreStats;
  unspentStatPoints?: number;
  unspentSkillPoints?: number;
  storyProgress?: number;
  // System 4: Daily Life Hub - Unlocked Activities
  unlockedActivities?: string[];
  // Apartment furniture for Activity 3: Movie Night
  hasPlushSofa?: boolean;
  hasEntertainmentSystem?: boolean;
  // System 12: Inventory Management
  ownedFurniture?: string[];
  // System 6: Relationship Constellation
  sharedMemories?: any[];
  // Additional states
  raidSynergyBuff?: number;
  currentRaidGate?: string;
  raidContext?: string;
  prevailingMood?: string;
  synergyFillRate?: number;
  romanticMilestone?: boolean;
  deepConversationUnlocked?: boolean;
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
    affection: 50,
    currentScene: 'hunter_association',
    experience: 0,
    maxExperience: 1000,
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
    apartmentTier: 3,
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
    type: 'message' | 'quest' | 'episode_available';
    title: string;
    content: string;
    timestamp: Date;
    action?: () => void;
  }>>([]);

  // Integrated notification system state for Monarch's Aura menu
  const [monarchNotifications, setMonarchNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
    persistent?: boolean;
  }>>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Integrated notification system for Monarch's Aura menu
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const { title, message, type = 'info', persistent = false } = event.detail;
      
      // Prevent duplicate notifications with same title and message
      setMonarchNotifications(prev => {
        const isDuplicate = prev.some(notification => 
          notification.title === title && notification.message === message
        );
        
        if (isDuplicate) {
          return prev; // Don't add duplicate
        }
        
        const newNotification = {
          id: Date.now().toString(),
          title,
          message,
          type,
          timestamp: new Date(),
          read: false,
          persistent
        };

        setUnreadNotificationCount(count => count + 1);
        return [newNotification, ...prev];
      });
    };

    window.addEventListener('game-notification', handleNotification as EventListener);
    
    return () => {
      window.removeEventListener('game-notification', handleNotification as EventListener);
    };
  }, []);

  // Auto-remove non-persistent notifications after 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMonarchNotifications(prev => 
        prev.filter(notification => 
          notification.persistent || 
          Date.now() - notification.timestamp.getTime() < 30000
        )
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Notification management functions
  const markNotificationAsRead = (id: string) => {
    setMonarchNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadNotificationCount(prev => Math.max(0, prev - 1));
  };

  const clearNotification = (id: string) => {
    const notification = monarchNotifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    }
    setMonarchNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllNotificationsAsRead = () => {
    setMonarchNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadNotificationCount(0);
  };

  // System 16: Player Progression state
  const [showPlayerProgression, setShowPlayerProgression] = useState(false);
  
  // Relationship Constellation state
  const [showRelationshipConstellation, setShowRelationshipConstellation] = useState(false);

  // System 3: Quest Log state
  const [showQuestLog, setShowQuestLog] = useState(false);

  // System 18: Episodic Story Engine state
  const [showStoryEngine, setShowStoryEngine] = useState(false);

  // System 18: Episode Playback System state
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<string | null>(null);
  const [episodeInProgress, setEpisodeInProgress] = useState(false);
  const [availableEpisodes, setAvailableEpisodes] = useState<any[]>([]);
  const [episodeNotifications, setEpisodeNotifications] = useState<any[]>([]);
  const [episodeHints, setEpisodeHints] = useState<any[]>([]);

  // Profile Management System state
  const [showProfileManager, setShowProfileManager] = useState(false);

  // Role Selection System - Start with selection screen
  const [selectedRole, setSelectedRole] = useState<'none' | 'player' | 'creator'>('none');
  const [loadedProfileId, setLoadedProfileId] = useState<number | null>(null);

  // Notifications dropdown state
  const [showNotifications, setShowNotifications] = useState(false);

  // Sommelier Dialog state
  const [showSommelierDialog, setShowSommelierDialog] = useState(false);

  // System 7: Item Inspection View state
  const [showItemInspection, setShowItemInspection] = useState(false);
  const [itemInspectionCategory, setItemInspectionCategory] = useState<'jewelry' | 'clothing' | 'living_room' | 'bedroom'>('jewelry');

  // System 6: Memory Stars state
  const [memoryStars, setMemoryStars] = useState<Array<{
    id: string;
    title: string;
    description: string;
    emotion: string;
    timestamp: Date;
  }>>([]);



  // System 8: World Map state - activeQuests defined below with other quest states
  
  // Activity System states
  const [showSparringModal, setShowSparringModal] = useState(false);
  const [showMovieNightModal, setShowMovieNightModal] = useState(false);
  const [showHangangParkModal, setShowHangangParkModal] = useState(false);
  const [showShoppingDateModal, setShowShoppingDateModal] = useState(false);

  // System 9: AI Narrative Engine state
  const [showNarrativeProgression, setShowNarrativeProgression] = useState(false);
  const [storyFlags, setStoryFlags] = useState<string[]>(['beginning_journey', 'gate_clearance_quest_active']);
  const [visitHistory, setVisitHistory] = useState<Record<string, number>>({});
  const [chaHaeInPresent, setChaHaeInPresent] = useState(true);

  // Generate automatic greeting in the dialogue interface when clicking Cha Hae-In's node
  const handleChaHaeInInteraction = async () => {
    console.log('Starting Cha Hae-In interaction...');
    
    // Check for available episodes at current location first
    const locationEpisodes = getLocationEpisodes();
    if (locationEpisodes.length > 0) {
      const episode = locationEpisodes[0];
      triggerNotification({
        title: 'Story Episode Available',
        message: `"${episode.title}" - Begin this story with Cha Hae-In?`,
        type: 'info',
        persistent: true
      });
    }
    
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
    
    // Step 3: Generate automatic initial greeting and display in dialogue interface
    setTimeout(async () => {
      console.log('Starting dialogue transitions...');
      setShowLivingPortrait(true);
      setChaHaeInExpression('recognition');
      
      try {
        // Generate contextual greeting using AI
        const greetingPrompt = getLocationSpecificGreeting();
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: greetingPrompt,
            gameState: {
              ...gameState,
              playerId: gameState.playerId || 'spatial_player',
              sessionId: gameState.sessionId || 'spatial_session'
            },
            characterState: {
              location: playerLocation,
              activity: currentLocationData.chaActivity
            },
            context: {
              timeOfDay,
              location: playerLocation,
              isInitialGreeting: true
            },
            communicatorMode: false, // Use dialogue mode, not communicator
            conversationHistory: []
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Display the AI-generated greeting in the dialogue interface
          setCurrentDialogue(data.response);
          
          // Add the initial greeting to conversation history so it appears in the dialogue area
          setConversationHistory([{
            type: 'cha_hae_in',
            text: data.response,
            timestamp: new Date()
          }]);
          
          // Set contextual thought prompts based on location and relationship
          const contextualPrompts = getLocationSpecificPrompts();
          setThoughtPrompts(contextualPrompts);
          
          console.log('AI-generated greeting displayed in dialogue interface');
        } else {
          // Fallback to predefined greeting if AI fails
          const fallbackDialogue = getFallbackLocationDialogue();
          setCurrentDialogue(fallbackDialogue.dialogue);
          
          // Add fallback greeting to conversation history
          setConversationHistory([{
            type: 'cha_hae_in',
            text: fallbackDialogue.dialogue,
            timestamp: new Date()
          }]);
          
          setThoughtPrompts(fallbackDialogue.prompts);
          console.log('Using fallback dialogue due to AI generation failure');
        }
      } catch (error) {
        console.error('Error generating AI greeting:', error);
        // Fallback to predefined greeting
        const fallbackDialogue = getFallbackLocationDialogue();
        setCurrentDialogue(fallbackDialogue.dialogue);
        
        // Add fallback greeting to conversation history
        setConversationHistory([{
          type: 'cha_hae_in',
          text: fallbackDialogue.dialogue,
          timestamp: new Date()
        }]);
        
        setThoughtPrompts(fallbackDialogue.prompts);
      }
      
      setDialogueActive(true);
      setChaHaeInExpression('welcoming');
    }, 300);
  };

  // Generate location-specific greeting prompt
  const getLocationSpecificGreeting = () => {
    const affectionLevel = gameState.affection || 0;
    
    switch (playerLocation) {
      case 'chahaein_apartment':
        if (affectionLevel >= 70) {
          return "[INITIAL_GREETING] Jin-Woo just arrived at your apartment. You're happy to see him. Greet him warmly.";
        } else if (affectionLevel >= 40) {
          return "[INITIAL_GREETING] Jin-Woo unexpectedly visits your apartment. You're pleasantly surprised. Welcome him in.";
        } else {
          return "[INITIAL_GREETING] Jin-Woo shows up at your apartment door. You're curious why he's here. Greet him professionally but with slight concern.";
        }
        
      case 'hunter_association':
        return "[INITIAL_GREETING] Jin-Woo approaches you while you're working at the Hunter Association. You look up from your current task and acknowledge him.";
        
      case 'player_apartment':
        if (affectionLevel >= 80) {
          return "[INITIAL_GREETING] You're at Jin-Woo's apartment, feeling completely at home. Greet him with love and familiarity.";
        } else {
          return "[INITIAL_GREETING] You're visiting Jin-Woo's apartment. Greet him and comment on his home.";
        }
        
      case 'hongdae_cafe':
        return "[INITIAL_GREETING] Jin-Woo finds you at the café. You're enjoying your coffee. Look up and greet him with a smile.";
        
      case 'myeongdong_restaurant':
        return "[INITIAL_GREETING] You're at the restaurant when Jin-Woo arrives. Invite him to join you.";
        
      default:
        return `[INITIAL_GREETING] Jin-Woo approaches you at ${playerLocation}. You're ${currentLocationData.chaActivity}. Greet him naturally.`;
    }
  };



  // Generate contextual thought prompts based on location and relationship
  const getLocationSpecificPrompts = () => {
    const affectionLevel = gameState.affection || 0;
    
    switch (playerLocation) {
      case 'chahaein_apartment':
        if (affectionLevel >= 70) {
          return [
            "I'd love to stay with you.",
            "Your place feels like home.",
            "What would you like to do together?"
          ];
        } else if (affectionLevel >= 40) {
          return [
            "Thanks for inviting me in.",
            "Your apartment is beautiful.",
            "I hope I'm not intruding."
          ];
        } else {
          return [
            "I wanted to check on you.",
            "Sorry if this is sudden.",
            "Is everything alright?"
          ];
        }
        
      case 'hunter_association':
        return [
          "Just wanted to see you.",
          "Anything interesting in the report?",
          "Ready for a break?"
        ];
        
      case 'player_apartment':
        if (affectionLevel >= 80) {
          return [
            "I love having you here.",
            "This is our place now.",
            "Want to relax together?"
          ];
        } else {
          return [
            "I'm glad you like it.",
            "Would you like something to drink?",
            "Make yourself at home."
          ];
        }
        
      case 'hongdae_cafe':
        return [
          "Mind if I join you?",
          "What are you reading?",
          "How's your coffee?"
        ];
        
      case 'myeongdong_restaurant':
        return [
          "The food looks amazing.",
          "I'd love to join you.",
          "How's your meal?"
        ];
        
      default:
        return [
          "Just wanted to see you.",
          "How are things going?",
          "Do you have a moment to talk?"
        ];
    }
  };



  // Fallback dialogue if AI generation fails
  const getFallbackLocationDialogue = () => {
    const affectionLevel = gameState.affection || 0;
    
    switch (playerLocation) {
      case 'chahaein_apartment':
        if (affectionLevel >= 70) {
          return {
            dialogue: "Jin-Woo... I'm so glad you came over. I was just making some tea. Would you like to stay for a while?",
            prompts: [
              "I'd love to stay with you.",
              "Tea sounds perfect.",
              "How are you feeling tonight?"
            ]
          };
        } else if (affectionLevel >= 40) {
          return {
            dialogue: "Oh, Jin-Woo! I wasn't expecting you. Please, come in. Make yourself comfortable.",
            prompts: [
              "Thanks for inviting me in.",
              "Your place is beautiful.",
              "I hope I'm not intruding."
            ]
          };
        } else {
          return {
            dialogue: "Jin-Woo? What brings you to my apartment? Is everything alright?",
            prompts: [
              "I wanted to check on you.",
              "Sorry if this is sudden.",
              "We need to talk about something."
            ]
          };
        }
        
      case 'hunter_association':
        return {
          dialogue: "Oh, Jin-Woo. Sorry, I was just finishing up this report on the Jeju Island aftermath. What's on your mind?",
          prompts: [
            "Just wanted to see you.",
            "Anything interesting in the report?", 
            "Ready for a break?"
          ]
        };
        
      case 'player_apartment':
        if (affectionLevel >= 80) {
          return {
            dialogue: "Your place feels like home now, Jin-Woo. I love spending time here with you.",
            prompts: [
              "I love having you here.",
              "This is our place now.",
              "Want to relax together?"
            ]
          };
        } else {
          return {
            dialogue: "Your apartment has such a nice atmosphere, Jin-Woo. Thank you for having me over.",
            prompts: [
              "I'm glad you like it.",
              "Would you like something to drink?",
              "Make yourself at home."
            ]
          };
        }
        
      default:
        return {
          dialogue: "Jin-Woo, what brings you here? Is there something you need?",
          prompts: [
            "Just wanted to see you.",
            "How are things going?",
            "Do you have a moment to talk?"
          ]
        };
    }
  };;

  const exitFocusMode = () => {
    setIsFocusMode(false);
    setDialogueActive(false);
    setShowLivingPortrait(false);
    setChaHaeInExpression('focused');
    setThoughtPrompts([]);
    setCurrentDialogue('');
    // Clear coffee activity context when exiting dialogue
    setCoffeeActivityContext(null);
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
  

  const [showDungeonRaid, setShowDungeonRaid] = useState(false);
  const [showCoffeeActivity, setShowCoffeeActivity] = useState(false);
  const [showTrainingActivity, setShowTrainingActivity] = useState(false);
  const [coffeeActivityContext, setCoffeeActivityContext] = useState<string | null>(null);
  const [showArcadeVisit, setShowArcadeVisit] = useState(false);
  const [showReviewRaidFootage, setShowReviewRaidFootage] = useState(false);
  const [showClearLowRankGate, setShowClearLowRankGate] = useState(false);
  const [showAssembleFurniture, setShowAssembleFurniture] = useState(false);
  const [showBackRubActivity, setShowBackRubActivity] = useState(false);
  const [showNSeoulTower, setShowNSeoulTower] = useState(false);
  const [showCoopSkillTraining, setShowCoopSkillTraining] = useState(false);
  const [showOrderTakeout, setShowOrderTakeout] = useState(false);
  const [showTalkOnBalcony, setShowTalkOnBalcony] = useState(false);
  const [showMyeongdongDinner, setShowMyeongdongDinner] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [pendingFurnitureItem, setPendingFurnitureItem] = useState<any>(null);

  
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
  const [showDevMenu, setShowDevMenu] = useState(false);

  // Equipment Management System
  const [playerEquipment, setPlayerEquipment] = useState([
    {
      id: 'kasaka_fang',
      name: 'Kasaka\'s Poisonous Fang',
      type: 'weapon',
      rarity: 'legendary',
      stats: { attack: 1200, speed: 150 },
      description: 'A legendary dagger that deals poison damage over time',
      image: '/equipment/kasaka_fang.png',
      equipped: true,
      upgradable: true
    },
    {
      id: 'knight_killer',
      name: 'Knight Killer',
      type: 'weapon',
      rarity: 'rare',
      stats: { attack: 800, speed: 120 },
      description: 'A powerful sword effective against armored enemies',
      image: '/equipment/knight_killer.png',
      equipped: false,
      upgradable: true
    },
    {
      id: 'shadow_armor',
      name: 'Shadow Sovereign\'s Armor',
      type: 'armor',
      rarity: 'mythic',
      stats: { defense: 2000, mana: 500 },
      description: 'Armor worn by the Shadow Sovereign himself',
      image: '/equipment/shadow_armor.png',
      equipped: true,
      upgradable: false
    }
  ]);

  // Equipment management handlers
  const handleEquipItem = (itemId: string, slot: string) => {
    setPlayerEquipment(prev => prev.map(item => {
      if (item.id === itemId) {
        // Unequip other items of the same type first
        const updatedEquipment = prev.map(otherItem => 
          otherItem.type === item.type && otherItem.id !== itemId 
            ? { ...otherItem, equipped: false }
            : otherItem
        );
        return { ...item, equipped: true };
      }
      return item;
    }));
    
    // Apply stat bonuses to character
    const equippedItem = playerEquipment.find(item => item.id === itemId);
    if (equippedItem) {
      setGameState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          strength: (prev.stats?.strength || 100) + (equippedItem.stats.attack || 0) / 10,
          agility: (prev.stats?.agility || 100) + (equippedItem.stats.speed || 0) / 10,
          vitality: (prev.stats?.vitality || 100) + (equippedItem.stats.defense || 0) / 10,
          intelligence: (prev.stats?.intelligence || 100) + (equippedItem.stats.mana || 0) / 10,
          sense: prev.stats?.sense || 100
        }
      }));
      
      console.log(`✨ Equipped ${equippedItem.name} - Stats updated`);
    }
  };

  const handleUnequipItem = (itemId: string) => {
    setPlayerEquipment(prev => prev.map(item => 
      item.id === itemId ? { ...item, equipped: false } : item
    ));
    
    // Remove stat bonuses from character
    const unequippedItem = playerEquipment.find(item => item.id === itemId);
    if (unequippedItem) {
      setGameState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          strength: Math.max(10, (prev.stats?.strength || 100) - (unequippedItem.stats.attack || 0) / 10),
          agility: Math.max(10, (prev.stats?.agility || 100) - (unequippedItem.stats.speed || 0) / 10),
          vitality: Math.max(10, (prev.stats?.vitality || 100) - (unequippedItem.stats.defense || 0) / 10),
          intelligence: Math.max(10, (prev.stats?.intelligence || 100) - (unequippedItem.stats.mana || 0) / 10),
          sense: prev.stats?.sense || 100
        }
      }));
      
      console.log(`🔄 Unequipped ${unequippedItem.name} - Stats restored`);
    }
  };

  const handleUpgradeItem = (itemId: string) => {
    setPlayerEquipment(prev => prev.map(item => {
      if (item.id === itemId && item.upgradable) {
        const upgradeCost = 50000 * (item.rarity === 'legendary' ? 3 : item.rarity === 'epic' ? 2 : 1);
        
        if ((gameState.gold || 0) >= upgradeCost) {
          setGameState(prevState => ({
            ...prevState,
            gold: Math.max(0, (prevState.gold || 0) - upgradeCost)
          }));
          
          return {
            ...item,
            stats: {
              attack: (item.stats.attack || 0) * 1.2,
              defense: (item.stats.defense || 0) * 1.2,
              speed: (item.stats.speed || 0) * 1.1,
              mana: (item.stats.mana || 0) * 1.15
            },
            name: item.name + ' +1'
          };
        }
      }
      return item;
    }));
  };

  const handleGiftToChaHaeIn = (itemId: string) => {
    const giftedItem = playerEquipment.find(item => item.id === itemId);
    if (giftedItem) {
      // Remove item from inventory
      setPlayerEquipment(prev => prev.filter(item => item.id !== itemId));
      
      // Increase affection based on item rarity
      const affectionGain = {
        'common': 5,
        'rare': 10,
        'epic': 20,
        'legendary': 35,
        'mythic': 50
      }[giftedItem.rarity] || 5;
      
      setGameState(prev => ({
        ...prev,
        affection: Math.min(100, prev.affection + affectionGain)
      }));
      
      console.log(`💝 Gifted ${giftedItem.name} to Cha Hae-In - Affection +${affectionGain}`);
    }
  };

  // Keyboard shortcuts for development
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setShowDailyLifeHub(true);
      }
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDevTools(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  // Sommelier wine selection handler
  const handleWineSelection = (wine: any) => {
    console.log('🍷 Wine selected:', wine.name, 'for ₩' + wine.price.toLocaleString());
    
    // Deduct gold and add affection
    setGameState(prev => ({
      ...prev,
      gold: Math.max(0, (prev.gold || 0) - wine.price),
      affection: Math.min(100, prev.affection + wine.affectionBoost)
    }));

    // Generate appropriate dialogue based on wine choice
    let sommelierDialogue = '';
    let chaResponse = '';
    
    switch (wine.rarity) {
      case 'common':
        sommelierDialogue = 'An excellent everyday choice that pairs well with your meal.';
        chaResponse = 'This is nice. I appreciate that you\'re being thoughtful about the selection.';
        break;
      case 'rare':
        sommelierDialogue = 'A distinguished choice. This vintage has exceptional character.';
        chaResponse = 'Wow, this is really good! You have excellent taste.';
        break;
      case 'legendary':
        sommelierDialogue = 'Ah, from my private collection. You truly know quality when you see it.';
        chaResponse = 'This is incredible... I\'ve never tasted anything this exquisite. Thank you.';
        break;
    }

    // Show environmental interaction with the wine selection results
    handleEnvironmentalInteraction({
      id: 'wine_selected',
      action: `The sommelier nods approvingly. "${sommelierDialogue}" Cha Hae-In takes a sip and her eyes light up. "${chaResponse}" [+${wine.affectionBoost} Affection]`,
      name: wine.name,
      x: 60,
      y: 50
    });
  };

  // Episode System Integration Functions
  const checkAvailableEpisodes = async () => {
    try {
      const response = await fetch('/api/episodes');
      const data = await response.json();
      
      // Filter episodes based on current game state
      const validEpisodes = data.episodes?.filter((episode: any) => {
        const prereqs = episode.prerequisite;
        if (!prereqs) return true;
        
        return (
          (gameState.level || 1) >= (prereqs.player_level || 1) &&
          (gameState.affection || 0) >= (prereqs.affection_level || 0)
        );
      }) || [];
      
      setAvailableEpisodes(validEpisodes);
      
      // Check for new episode notifications
      const newEpisodeNotifications = validEpisodes
        .filter((episode: any) => !episodeNotifications.find(n => n.episodeId === episode.id))
        .map((episode: any) => ({
          id: `episode_${episode.id}_${Date.now()}`,
          episodeId: episode.id,
          type: 'episode_available' as const,
          title: 'New Story Episode Available',
          content: `"${episode.title}" is now available to play`,
          timestamp: new Date(),
          location: gameState.currentScene
        }));

      const newUINotifications = newEpisodeNotifications.map((notification: any) => ({
        id: notification.id,
        type: 'episode_available' as const,
        title: notification.title,
        content: notification.content,
        timestamp: notification.timestamp,
        action: () => triggerEpisode(notification.episodeId)
      }));
      
      if (newEpisodeNotifications.length > 0) {
        setEpisodeNotifications(prev => [...prev, ...newEpisodeNotifications]);
        
        // Send to centralized notification bell instead of local notifications
        newEpisodeNotifications.forEach((notification: any) => {
          const event = new CustomEvent('game-notification', {
            detail: {
              title: notification.title,
              message: notification.content,
              type: 'info',
              persistent: true
            }
          });
          window.dispatchEvent(event);
        });
      }
    } catch (error) {
      console.error('Failed to check available episodes:', error);
    }
  };

  const triggerEpisode = (episodeId: string) => {
    setCurrentEpisode(episodeId);
    setEpisodeInProgress(true);
    
    // Close other modals and focus on episode
    setShowDailyLifeHub(false);
    setShowCommunicator(false);
    setMonarchAuraVisible(false);
  };

  const handleEpisodeComplete = (episodeId: string) => {
    setEpisodeInProgress(false);
    setCurrentEpisode(null);
    
    // Check for new episodes that might have been unlocked
    setTimeout(() => {
      checkAvailableEpisodes();
    }, 1000);
  };

  const getLocationEpisodes = () => {
    return availableEpisodes.filter(episode => {
      // Episodes that can be triggered from current location
      return episode.startLocation === gameState.currentScene || !episode.startLocation;
    });
  };

  // Episode-Driven UI Hints System
  const getEpisodeHints = () => {
    const currentLocation = gameState.currentScene;
    const hints = [];

    // Check if we're at training facility and "Training Partners" episode is active
    if (currentLocation === 'training_facility') {
      hints.push({
        id: 'sparring_hint',
        type: 'story_progression',
        title: 'Episode Objective',
        message: 'Complete the sparring session with Cha Hae-In',
        action: 'Click on the Sparring Ring to begin training',
        interactionPoint: 'training_dummy',
        priority: 'high'
      });
    }

    // Check if we're at hongdae cafe and next objective is coffee
    if (currentLocation === 'hongdae_cafe') {
      hints.push({
        id: 'coffee_hint',
        type: 'story_progression',
        title: 'Episode Objective',
        message: 'Discuss mission details over coffee with Cha Hae-In',
        action: 'Start a coffee activity to continue the story',
        interactionPoint: 'menu_board',
        priority: 'high'
      });
    }

    return hints;
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
      chaPosition: { x: 50, y: 50 },
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
        console.log('🏠 Generating Tier 2+ apartment with furniture check:', {
          apartmentTier,
          hasPlushSofa: (gameState as any).hasPlushSofa,
          hasEntertainmentSystem: (gameState as any).hasEntertainmentSystem
        });
        
        const baseElements = [
          { id: 'modern_bedroom', name: 'Modern Bedroom', position: { x: 25, y: 30 }, action: 'Stylish bedroom romance' },
          { id: 'city_view_couch', name: 'City View Living Room', position: { x: 55, y: 55 }, action: 'Intimate moments with city lights' },
          { id: 'designer_kitchen', name: 'Designer Kitchen', position: { x: 70, y: 35 }, action: 'Kitchen counter passion' },
          { id: 'luxury_shower', name: 'Rain Shower', position: { x: 80, y: 25 }, action: 'Steamy shower romance' },
          { id: 'rooftop_access', name: 'Rooftop Garden', position: { x: 40, y: 20 }, action: 'Garden terrace intimacy' }
        ];

        // Add movie night node if furniture requirements are met
        if ((gameState as any).hasPlushSofa && (gameState as any).hasEntertainmentSystem) {
          console.log('🎬 Movie night requirements met - adding Entertainment Center node');
          baseElements.push({
            id: 'movie_night_setup',
            name: 'Entertainment Center',
            position: { x: 60, y: 65 },
            action: 'Watch a movie together on your luxurious sectional sofa'
          });
        } else {
          console.log('🎬 Movie night requirements NOT met:', {
            hasPlushSofa: (gameState as any).hasPlushSofa,
            hasEntertainmentSystem: (gameState as any).hasEntertainmentSystem
          });
        }

        return {
          id: 'player_apartment',
          name: 'Gangnam High-Rise',
          description: 'Your upscale apartment in Seoul\'s premier district with modern amenities',
          backgroundImage: '/api/scenes/gangnam_apartment.jpg',
          chaHaeInPresent: chaHaeInCurrentLocation === 'player_apartment',
          chaActivity: 'enjoying the sophisticated atmosphere of your upgraded home',
          chaPosition: { x: 45, y: 50 },
          chaExpression: 'loving' as const,
          interactiveElements: baseElements
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

  const currentLocationData = (() => {
    const baseLocation = worldLocations[playerLocation as keyof typeof worldLocations] || worldLocations.hunter_association;
    
    // Override presence for coffee activity
    if (coffeeActivityContext && playerLocation === 'hongdae_cafe') {
      return {
        ...baseLocation,
        chaHaeInPresent: true,
        chaActivity: coffeeActivityContext
      };
    }
    
    return baseLocation;
  })();

  // Debug logging for character presence
  console.log('Current time:', timeOfDay);
  console.log('Cha Hae-In location:', chaHaeInCurrentLocation);
  console.log('Player affection:', gameState.affection);
  console.log('Player location:', playerLocation);
  console.log('Current scene:', gameState.currentScene);
  console.log('Should Cha be present?', currentLocationData?.chaHaeInPresent);
  console.log('Cha position:', currentLocationData?.chaPosition);
  
  // DEBUG: Show when Cha would be available
  const debugGetLocation = (time: string) => {
    const affection = gameState.affection;
    if (time === 'morning') {
      if (affection >= 80) return 'player_apartment';
      if (affection >= 70) return 'chahaein_apartment';
      return 'hunter_association';
    } else if (time === 'afternoon') {
      return 'hunter_association';
    } else if (time === 'evening') {
      if (affection >= 60) return 'myeongdong_restaurant';
      if (affection >= 40) return 'hongdae_cafe';
      return 'hunter_association';
    } else {
      if (affection >= 80) return 'player_apartment';
      if (affection >= 70) return 'chahaein_apartment';
      return null;
    }
  };
  
  console.log('DEBUG - Cha location at different times:');
  console.log('  Morning:', debugGetLocation('morning'));
  console.log('  Afternoon:', debugGetLocation('afternoon'));
  console.log('  Evening:', debugGetLocation('evening'));
  console.log('  Night:', debugGetLocation('night'));

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
            activity: coffeeActivityContext || currentLocationData.chaActivity,
            affectionLevel: gameState.affection
          }
        })
      });
      
      const data = await response.json();
      
      // Set the raw response and let the display component handle formatting
      setCurrentDialogue(data.response);
      
      // Track episode event for player chatting with Cha Hae-In
      fetch('/api/episode-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'player_chats_with_cha',
          data: { 
            message: message,
            location: playerLocation,
            response: data.response 
          },
          profileId: loadedProfileId
        })
      }).catch(console.error);
      
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
          const latestActivity = newActivities[newActivities.length - 1];
          triggerNotification({
            title: 'Activity Scheduled!',
            message: latestActivity?.title || 'New activity has been scheduled',
            type: 'success'
          });
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

  // Auto-scroll behavior: smart scrolling to show beginning of new AI responses
  useEffect(() => {
    if (conversationScrollRef.current && conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      
      setTimeout(() => {
        if (conversationScrollRef.current) {
          if (lastMessage.type === 'cha_hae_in') {
            // For AI responses, scroll to show the beginning of the latest message
            const messages = conversationScrollRef.current.children;
            const lastMessageElement = messages[messages.length - 1] as HTMLElement;
            if (lastMessageElement) {
              // Scroll to position the start of the new message near the top of the visible area
              const containerHeight = conversationScrollRef.current.clientHeight;
              const messageTop = lastMessageElement.offsetTop;
              const targetScroll = Math.max(0, messageTop - containerHeight * 0.1); // 10% from top
              conversationScrollRef.current.scrollTop = targetScroll;
            }
          } else {
            // For user messages, scroll to bottom to see their input
            conversationScrollRef.current.scrollTop = conversationScrollRef.current.scrollHeight;
          }
        }
      }, 150); // Small delay to ensure content is rendered
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
        } else {
          console.log(`Avatar generation returned no image for expression: ${expression}`);
        }
      } else {
        console.log(`Avatar generation failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to generate avatar expression:', error);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  // DevTools game state update handler
  const handleGameStateUpdate = (updates: any) => {
    setGameState(prevState => ({
      ...prevState,
      ...updates
    }));
    console.log('🔧 DevTools updated game state:', updates);
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
    
    // Track episode event for location visit
    fetch('/api/episode-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'player_visits_location',
        data: { location_id: locationId },
        profileId: loadedProfileId
      })
    }).catch(console.error);
    
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
    // Check for episode triggers at current location
    const locationEpisodes = getLocationEpisodes();
    if (locationEpisodes.length > 0 && interactionPoint.id === 'cha_hae_in') {
      // If there's an available episode and player interacts with Cha Hae-In, offer to start episode
      const episode = locationEpisodes[0];
      triggerNotification({
        title: 'Story Episode Available',
        message: `"${episode.title}" - Would you like to begin this story?`,
        type: 'info',
        persistent: true
      });
      // Continue to dialogue interface instead of opening communicator
    }

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
      if (interactionPoint.id === 'bed') {
        // Bed in Cha Hae-In's apartment - gateway to intimate activities
        const currentAffection = gameState.affection || 0;
        const currentIntimacy = gameState.intimacyLevel || 0;
        let selectedActivity = 'cuddling'; // Safe default
        
        // Progressive intimacy based on relationship progress
        if (currentAffection >= 80 && currentIntimacy >= 70) {
          selectedActivity = 'make_love';
        } else if (currentAffection >= 60 && currentIntimacy >= 50) {
          selectedActivity = 'passionate_night';
        } else if (currentAffection >= 40 && currentIntimacy >= 30) {
          selectedActivity = 'bedroom_intimacy';
        } else if (currentAffection >= 20 && currentIntimacy >= 10) {
          selectedActivity = 'intimate_massage';
        } else {
          selectedActivity = 'cuddling';
        }
        
        setActiveActivity(selectedActivity);
        setShowIntimateModal(true);
        console.log(`Cha Hae-In's bed - Opening ${selectedActivity} (Affection: ${currentAffection}, Intimacy: ${currentIntimacy})`);
        return;
      }
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

  // Dynamic weather cycling system
  useEffect(() => {
    const weatherTypes: Array<'clear' | 'rain' | 'snow' | 'cloudy'> = ['clear', 'cloudy', 'rain', 'clear', 'snow', 'clear'];
    const interval = setInterval(() => {
      const currentIndex = weatherTypes.indexOf(weather);
      const nextIndex = (currentIndex + 1) % weatherTypes.length;
      setWeather(weatherTypes[nextIndex]);
    }, 240000); // Change every 4 minutes

    return () => clearInterval(interval);
  }, [weather]);

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

  // Episode system monitoring - check for available episodes when game state changes
  useEffect(() => {
    if (selectedRole === 'player' && loadedProfileId) {
      checkAvailableEpisodes();
    }
  }, [gameState.level, gameState.affection, playerLocation, selectedRole, loadedProfileId]);

  // Disabled automatic notifications to reduce push notification frequency
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (Math.random() > 0.98) {
  //       const isQuestNotification = Math.random() > 0.7;
  //       const newNotification = {
  //         id: `notif_${Date.now()}`,
  //         type: isQuestNotification ? 'quest' : 'message' as 'quest' | 'message',
  //         title: isQuestNotification ? 'New Quest Available' : 'Message from Cha Hae-In',
  //         content: isQuestNotification ? 'A-Rank Gate detected in Gangnam' : 'Just thinking of you. Be safe in there.',
  //         timestamp: new Date()
  //       };
  //       setNotifications(prev => [...prev, newNotification]);
  //     }
  //   }, 15000);

  //   return () => clearInterval(interval);
  // }, []);

  // Profile loading functionality
  const loadProfileData = async (profileId: number) => {
    try {
      const response = await fetch(`/api/profiles/${profileId}/load`);
      if (!response.ok) throw new Error('Failed to load profile');
      
      const { profile, gameState: loadedGameState } = await response.json();
      
      // Update current game state with loaded data
      setGameState({
        level: loadedGameState.level || 1,
        health: loadedGameState.health || 100,
        maxHealth: loadedGameState.maxHealth || 100,
        mana: loadedGameState.mana || 50,
        maxMana: loadedGameState.maxMana || 50,
        affection: loadedGameState.affectionLevel || 0,
        currentScene: loadedGameState.currentScene || "hunter_association",
        inventory: loadedGameState.inventory || [],
        inCombat: loadedGameState.inCombat || false,
        gold: loadedGameState.gold || 100,
        intimacyLevel: loadedGameState.intimacyLevel || 1,
        energy: loadedGameState.energy || 100,
        maxEnergy: loadedGameState.maxEnergy || 100,
        experience: loadedGameState.experience || 0,
        maxExperience: loadedGameState.maxExperience || 100,
        apartmentTier: loadedGameState.apartmentTier || 1,
        playerId: loadedGameState.sessionId,
        activeQuests: loadedGameState.activeQuests || [],
        completedQuests: loadedGameState.completedQuests || [],
        intelligence: loadedGameState.stats?.intelligence || 10,
        storyFlags: loadedGameState.storyFlags || {},
        stats: loadedGameState.stats || { strength: 10, agility: 10, vitality: 10, intelligence: 10, sense: 10 },
        unspentStatPoints: loadedGameState.statPoints || 0,
        unspentSkillPoints: loadedGameState.skillPoints || 0,
        storyProgress: loadedGameState.storyProgress || 0,
        unlockedActivities: loadedGameState.unlockedActivities || [],
        sharedMemories: loadedGameState.sharedMemories || []
      });

      console.log('Profile loaded successfully:', profile.profileName);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Auto-save functionality
  const autoSaveProgress = async () => {
    if (!loadedProfileId || selectedRole !== 'player') return;

    try {
      await fetch(`/api/profiles/${loadedProfileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameData: {
            level: gameState.level,
            health: gameState.health,
            maxHealth: gameState.maxHealth,
            mana: gameState.mana,
            maxMana: gameState.maxMana,
            affectionLevel: gameState.affection,
            intimacyLevel: gameState.intimacyLevel || 1,
            gold: gameState.gold || 100,
            currentScene: gameState.currentScene,
            energy: gameState.energy || 100,
            maxEnergy: gameState.maxEnergy || 100,
            experience: gameState.experience || 0,
            maxExperience: gameState.maxExperience || 100,
            apartmentTier: gameState.apartmentTier || 1,
            stats: gameState.stats || { strength: 10, agility: 10, vitality: 10, intelligence: 10, sense: 10 },
            statPoints: gameState.unspentStatPoints || 0,
            skillPoints: gameState.unspentSkillPoints || 0,
            storyProgress: gameState.storyProgress || 0,
            inventory: gameState.inventory || [],
            activeQuests: gameState.activeQuests || [],
            completedQuests: gameState.completedQuests || [],
            unlockedActivities: gameState.unlockedActivities || [],
            sharedMemories: gameState.sharedMemories || [],
            storyFlags: gameState.storyFlags || {}
          }
        })
      });
      console.log('Progress auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Auto-save every 5 minutes when in player mode (reduced frequency)
  useEffect(() => {
    if (selectedRole === 'player' && loadedProfileId) {
      const autoSaveInterval = setInterval(autoSaveProgress, 300000); // 5 minutes
      return () => clearInterval(autoSaveInterval);
    }
  }, [selectedRole, loadedProfileId, gameState]);

  // Save progress only on major events (reduced triggers)
  useEffect(() => {
    if (selectedRole === 'player' && loadedProfileId) {
      // Only save on level up and major milestones to reduce notifications
      if (gameState.level > 1 || gameState.apartmentTier > 1) {
        autoSaveProgress();
      }
    }
  }, [
    gameState.level,
    gameState.apartmentTier
  ]);

  // Leave World functionality
  const leaveWorld = async () => {
    if (loadedProfileId) {
      await autoSaveProgress(); // Save before leaving
    }
    setSelectedRole('none');
    setLoadedProfileId(null);
  };

  // Load profile data when entering player mode with a loaded profile
  useEffect(() => {
    if (selectedRole === 'player' && loadedProfileId) {
      loadProfileData(loadedProfileId);
    }
  }, [selectedRole, loadedProfileId]);

  // Role Selection Screen - Entry Point
  if (selectedRole === 'none') {
    return (
      <RoleSelectionScreen 
        onSelectRole={(role, profileId) => {
          setSelectedRole(role);
          if (profileId) {
            setLoadedProfileId(profileId);
          }
        }}
      />
    );
  }

  // Creator Portal Experience
  if (selectedRole === 'creator') {
    return (
      <CreatorPortalDashboard 
        onLogout={() => setSelectedRole('none')}
      />
    );
  }

  // System 18: Episode Selection and Player - Early Returns
  if (showEpisodeSelector) {
    return (
      <EpisodeSelector
        onSelectEpisode={(episode) => {
          setCurrentEpisode(episode.id);
          setShowEpisodeSelector(false);
        }}
        onBack={() => setShowEpisodeSelector(false)}
      />
    );
  }

  if (currentEpisode) {
    return (
      <EpisodePlayer
        episodeId={currentEpisode}
        onBack={() => {
          setCurrentEpisode(null);
          setShowEpisodeSelector(true);
        }}
        onComplete={(episodeId) => {
          setCurrentEpisode(null);
          setShowEpisodeSelector(false);
        }}
      />
    );
  }

  // Player Experience - Main Game Interface
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sf-pro">
      


      {/* Monarch's Aura - Mobile-Responsive Shadow Crown */}
      <motion.button
        className="fixed top-4 sm:top-6 right-4 sm:right-6 w-12 h-12 sm:w-11 sm:h-11 rounded-full flex items-center justify-center z-[9999] cursor-pointer shadow-2xl overflow-hidden"
        style={{ 
          position: 'fixed',
          zIndex: 9999,
          pointerEvents: 'auto',
          background: 'radial-gradient(circle at 30% 30%, rgba(147, 51, 234, 0.9) 0%, rgba(79, 70, 229, 0.8) 30%, rgba(30, 27, 75, 0.9) 70%, rgba(0, 0, 0, 0.95) 100%)',
          border: '2px solid rgba(147, 51, 234, 0.6)',
          boxShadow: '0 0 30px rgba(147, 51, 234, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.3)',
          touchAction: 'manipulation'
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
      
      {/* Dynamic Weather System */}
      <DynamicWeatherSystem 
        weather={weather} 
        intensity="moderate"
        windSpeed={Math.random() * 2 - 1}
      />
      
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
        <div className="absolute top-6 right-[170px] bg-black/90 backdrop-blur-sm text-white rounded-lg border border-purple-400/30 z-40 max-w-xs">
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

          {/* Apartment Furniture - Movie Night Testing */}
          <div className="mb-3">
            <div className="text-xs text-gray-300 mb-1">Movie Night Requirements</div>
            <div className="flex flex-col gap-1 text-xs">
              <button 
                onClick={() => setGameState(prev => ({ 
                  ...prev, 
                  ownedFurniture: [...(prev.ownedFurniture || []), 'luxury_sectional_sofa', 'smart_entertainment_system'],
                  apartmentTier: Math.max(prev.apartmentTier || 1, 2),
                  hasPlushSofa: true,
                  hasEntertainmentSystem: true
                }))}
                className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700"
              >
                Grant Movie Setup
              </button>
              <div className="text-xs text-gray-400 mt-1">
                Sofa: {(gameState as any).hasPlushSofa ? '✅' : '❌'} | Entertainment: {(gameState as any).hasEntertainmentSystem ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-400">
                Apt Tier: {gameState.apartmentTier || 1}
              </div>
            </div>
          </div>

          {/* DevTools Access */}
          <div className="mb-3">
            <button 
              onClick={() => setShowDevTools(true)}
              className="w-full px-3 py-2 rounded bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-xs transition-all"
            >
              🔧 Activity Requirements Manager
            </button>
            <div className="text-xs text-gray-400 mt-1 text-center">
              Ctrl+Shift+D
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

        {/* Episode-Driven Contextual Hints */}
        {getEpisodeHints().map((hint) => (
          <motion.div
            key={hint.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-32 left-4 right-4 z-40"
          >
            <div
              className="bg-purple-500/20 backdrop-blur-xl border border-purple-400/50 rounded-2xl p-4"
              style={{ 
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.1))'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center animate-pulse">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-purple-200 font-semibold text-sm">{hint.title}</h3>
                  <p className="text-purple-300/90 text-xs mt-1">{hint.message}</p>
                  <p className="text-purple-400/70 text-xs mt-2 italic">{hint.action}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

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
                triggerNotification({
                  title: 'Quest Progress',
                  message: 'You made progress on your current quest!',
                  type: 'success'
                });
              }, 1000);
              
              console.log(`Quest progress: ${activeQuestAtLocation.title} advanced by interaction`);
            }
            
            // Handle different node types with specific logic
            console.log('🔍 SWITCH STATEMENT - Processing nodeId:', nodeId);
            
            // Priority handler for bedroom intimate activities
            if (nodeId === 'bed' && playerLocation === 'player_apartment') {
              console.log('🛏️ BEDROOM NODE DETECTED - Opening System 5 Intimate Activity');
              const currentAffection = gameState.affection || 0;
              const currentIntimacy = gameState.intimacyLevel || 0;
              let selectedActivity = 'cuddling'; // Safe default for early game
              
              // Check relationship gates before allowing activities
              if (currentAffection >= 80 && currentIntimacy >= 80) {
                // High tier activities
                if (gameState.unlockedActivities?.includes('master_suite_intimacy')) selectedActivity = 'master_suite_intimacy';
                else if (gameState.unlockedActivities?.includes('passionate_night')) selectedActivity = 'passionate_night';
              } else if (currentAffection >= 50 && currentIntimacy >= 40) {
                // Mid tier activities
                if (gameState.unlockedActivities?.includes('passionate_night')) selectedActivity = 'passionate_night';
                else if (gameState.unlockedActivities?.includes('intimate_massage')) selectedActivity = 'intimate_massage';
              } else if (currentAffection >= 20 && currentIntimacy >= 10) {
                // Basic intimate activities
                if (gameState.unlockedActivities?.includes('bedroom_intimacy')) selectedActivity = 'bedroom_intimacy';
                else if (gameState.unlockedActivities?.includes('first_kiss')) selectedActivity = 'first_kiss';
              } else {
                // Very early game - only basic cuddling
                selectedActivity = 'cuddling';
              }
              
              setActiveActivity(selectedActivity);
              setShowIntimateModal(true);
              console.log(`Bedroom - Opening System 5 with ${selectedActivity} (Affection: ${currentAffection}, Intimacy: ${currentIntimacy})`);
              return; // Exit early to prevent other handlers
            }
            
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
                // Direct access to Myeongdong dinner modal
                console.log('🍽️ View menu clicked - opening Myeongdong dinner modal');
                setShowMyeongdongDinner(true);
                break;
              case 'speak_sommelier':
                // Open sommelier dialogue interface as per spec
                console.log('🍷 Sommelier interaction - opening wine selection dialogue');
                setShowSommelierDialog(true);
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
              case 'generic_counter':
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
                triggerNotification({
                  title: 'Master Suite Unlocked!',
                  message: 'Ultimate intimate activities are now available in your Day Planner',
                  type: 'success',
                  persistent: true
                });
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
                // Direct gateway respecting relationship progress
                const unlockedActivities = gameState.unlockedActivities || [];
                const currentAffection = gameState.affection || 0;
                const currentIntimacy = gameState.intimacyLevel || 0;
                let selectedActivity = 'cuddling'; // Safe default for early game
                
                // Check relationship gates before allowing activities
                if (currentAffection >= 80 && currentIntimacy >= 80) {
                  // Tier 3 - Ultimate intimate activities (requires penthouse + high stats)
                  if (unlockedActivities.includes('master_suite_intimacy')) selectedActivity = 'master_suite_intimacy';
                  else if (unlockedActivities.includes('spend_the_night_together')) selectedActivity = 'spend_the_night_together';
                  else if (unlockedActivities.includes('penthouse_morning_together')) selectedActivity = 'penthouse_morning_together';
                } else if (currentAffection >= 50 && currentIntimacy >= 40) {
                  // Tier 2 - Advanced intimate activities (requires moderate stats)
                  if (unlockedActivities.includes('passionate_night')) selectedActivity = 'passionate_night';
                  else if (unlockedActivities.includes('shower_together')) selectedActivity = 'shower_together';
                  else if (unlockedActivities.includes('intimate_massage')) selectedActivity = 'intimate_massage';
                } else if (currentAffection >= 20 && currentIntimacy >= 10) {
                  // Tier 1 - Basic intimate activities (requires some relationship progress)
                  if (unlockedActivities.includes('bedroom_intimacy')) selectedActivity = 'bedroom_intimacy';
                  else if (unlockedActivities.includes('first_kiss')) selectedActivity = 'first_kiss';
                } else {
                  // Very early game - only basic cuddling/conversation
                  selectedActivity = 'cuddling';
                }
                
                setActiveActivity(selectedActivity);
                setShowIntimateModal(true);
                console.log(`Bedroom gateway - Initiating ${selectedActivity} (Affection: ${currentAffection}, Intimacy: ${currentIntimacy})`);
                break;
              case 'living_room_couch':
                // Primary conversational node - relaxing at home scene
                const hasEntertainmentSystem = gameState.inventory?.some(item => 
                  (typeof item === 'string' ? item : item.id)?.includes('monarch_entertainment') ||
                  (typeof item === 'string' ? item : item.id)?.includes('entertainment_system')
                );
                
                if (hasEntertainmentSystem) {
                  // Unlock movie activity in Daily Life Hub
                  setGameState(prev => ({
                    ...prev,
                    unlockedActivities: [
                      ...(prev.unlockedActivities || []),
                      'watch_movie_together'
                    ],
                    affection: Math.min(100, prev.affection + 12)
                  }));
                  handleEnvironmentalInteraction({
                    id: 'couch_entertainment_unlock',
                    action: 'You suggest relaxing on the sofa together. With the Monarch-Class Entertainment System, the experience becomes truly luxurious. "This is incredible," Cha Hae-In says, settling comfortably beside you. New movie activities are now available in your Day Planner.',
                    name: 'Living Room Couch',
                    x: 45,
                    y: 55
                  });
                  console.log('Living room couch - Entertainment system unlocks movie activities with major affection gain');
                } else {
                  // Basic relaxation conversation scene
                  setGameState(prev => ({
                    ...prev,
                    affection: Math.min(100, prev.affection + 6)
                  }));
                  handleEnvironmentalInteraction({
                    id: 'couch_relaxation',
                    action: 'You suggest relaxing on the sofa together. Cha Hae-In settles beside you with a content sigh. "This is nice," she says softly, leaning against your shoulder. The comfortable intimacy feels natural and peaceful.',
                    name: 'Living Room Couch',
                    x: 45,
                    y: 55
                  });
                  console.log('Living room couch - Primary conversational scene with affection gain');
                }
                break;
              // Tier 2 - Gangnam High-Rise Apartment Nodes
              case 'modern_kitchen':
                // Direct cooking activity initiation
                setGameState(prev => ({
                  ...prev,
                  energy: Math.max(0, (prev.energy || 100) - 20),
                  affection: Math.min(100, prev.affection + 15)
                }));
                handleEnvironmentalInteraction({
                  id: 'cook_dinner_together',
                  action: 'You suggest cooking something together. "I\'d love that," Cha Hae-In says with genuine enthusiasm. The kitchen becomes filled with laughter and delicious aromas as you work side by side. This shared experience brings you significantly closer together. [- 20 Energy] [Memory Star potential]',
                  name: 'Cook Dinner Together',
                  x: 35,
                  y: 40
                });
                // Set cooking-specific thought prompts
                setThoughtPrompts([
                  "Let's try making Korean BBQ.",
                  "How about homemade pasta?",
                  "We should cook your favorite dish."
                ]);
                console.log('Cook dinner together - Major activity with high affection gain and energy cost');
                break;
              case 'bedroom_door':
                // Gateway to highest unlocked intimate activity - direct transition
                const highestUnlockedActivity = getHighestUnlockedIntimateActivity(gameState);
                if (highestUnlockedActivity) {
                  setActiveActivity(highestUnlockedActivity);
                  setShowIntimateModal(true);
                  console.log(`Bedroom door gateway - Opening highest unlocked intimate activity: ${highestUnlockedActivity}`);
                } else {
                  // Fallback to basic activity if none unlocked
                  setActiveActivity('cuddling');
                  setShowIntimateModal(true);
                  console.log('Bedroom door gateway - Opening basic cuddling activity');
                }
                break;
              case 'balcony_door':
                // Transition to unique Balcony Spatial View
                setPlayerLocation('gangnam_balcony');
                setCinematicMode(true);
                setGameState(prev => ({
                  ...prev,
                  affection: Math.min(100, prev.affection + 8)
                }));
                handleEnvironmentalInteraction({
                  id: 'balcony_transition',
                  action: 'You suggest getting some fresh air on the balcony. Cha Hae-In nods and follows you outside. The city lights create a breathtaking panorama as you step into this intimate, elevated space overlooking Gangnam.',
                  name: 'Balcony Transition',
                  x: 80,
                  y: 30
                });
                console.log('Balcony door - Transitioning to unique Balcony Spatial View');
                break;
              case 'city_view_balcony':
                // Gateway: Cinematic romantic balcony scenes
                setCinematicMode(true);
                setGameState(prev => ({
                  ...prev,
                  affection: Math.min(100, prev.affection + 8)
                }));
                handleEnvironmentalInteraction({
                  id: 'balcony_cinematic',
                  action: 'You step onto the balcony overlooking the glittering Gangnam district. The city lights create a romantic ambiance as Cha Hae-In joins you. "The view from here never gets old," she says softly, standing close beside you in the evening breeze.',
                  name: 'City View Balcony',
                  x: 80,
                  y: 30
                });
                console.log('Balcony cinematic mode - Romantic city view experience');
                break;
              case 'master_bedroom':
                // Enhanced bedroom with luxury amenities
                const tierTwoActivities = gameState.unlockedActivities || [];
                let selectedTierTwoActivity = 'bedroom_intimacy';
                
                if (tierTwoActivities.includes('passionate_night')) selectedTierTwoActivity = 'passionate_night';
                else if (tierTwoActivities.includes('intimate_massage')) selectedTierTwoActivity = 'intimate_massage';
                else if (tierTwoActivities.includes('romantic_evening')) selectedTierTwoActivity = 'romantic_evening';
                
                setActiveActivity(selectedTierTwoActivity);
                setShowIntimateModal(true);
                console.log(`Tier 2 master bedroom - Initiating ${selectedTierTwoActivity}`);
                break;
              case 'luxury_bathroom':
                // Gateway: Spa-like intimate activities
                if (gameState.unlockedActivities?.includes('luxury_bath_together')) {
                  setActiveActivity('luxury_bath_together');
                  setShowIntimateModal(true);
                  console.log('Luxury bathroom - Premium spa experience');
                } else {
                  setGameState(prev => ({
                    ...prev,
                    unlockedActivities: [
                      ...(prev.unlockedActivities || []),
                      'luxury_bath_together',
                      'romantic_spa_night'
                    ],
                    affection: Math.min(100, prev.affection + 4)
                  }));
                  handleEnvironmentalInteraction({
                    id: 'bathroom_upgrade',
                    action: 'The luxurious bathroom with its oversized soaking tub and rainfall shower creates a spa-like atmosphere. "This is incredible," Cha Hae-In says, admiring the elegant fixtures. New spa activities are now available.',
                    name: 'Luxury Bathroom',
                    x: 25,
                    y: 70
                  });
                  console.log('Luxury bathroom activated - Spa activities unlocked');
                }
                break;
              case 'movie_night_setup':
                // Movie night activity - direct to movie modal
                console.log('🎬 MOVIE NIGHT NODE CLICKED - Opening movie night modal');
                setShowMovieNightModal(true);
                break;
              case 'home_office':
                // Gateway: Professional bonding activities
                setGameState(prev => ({
                  ...prev,
                  unlockedActivities: [
                    ...(prev.unlockedActivities || []),
                    'work_together',
                    'strategy_planning',
                    'hunter_business_discussion'
                  ],
                  affection: Math.min(100, prev.affection + 3)
                }));
                handleEnvironmentalInteraction({
                  id: 'home_office_setup',
                  action: 'Your home office setup impresses Cha Hae-In with its professional equipment and organization. "You really have everything thought out," she observes approvingly. This space could be perfect for working on hunter business together.',
                  name: 'Home Office',
                  x: 60,
                  y: 25
                });
                console.log('Home office activated - Professional activities unlocked');
                break;
              case 'wine_collection':
                // Gateway: Add premium wine to inventory
                setGameState(prev => ({
                  ...prev,
                  inventory: [
                    ...(prev.inventory || []),
                    {
                      id: 'premium_wine',
                      name: 'Premium Wine Collection',
                      description: 'A curated selection of fine wines',
                      type: 'luxury_item',
                      rarity: 'rare'
                    }
                  ],
                  unlockedActivities: [
                    ...(prev.unlockedActivities || []),
                    'wine_tasting_evening',
                    'romantic_dinner_with_wine'
                  ]
                }));
                handleEnvironmentalInteraction({
                  id: 'wine_collection_access',
                  action: 'You showcase your wine collection to Cha Hae-In. Her knowledge of fine wines becomes apparent as she examines the labels with genuine appreciation. "You have excellent taste," she compliments. Perfect for special evenings together.',
                  name: 'Wine Collection',
                  x: 40,
                  y: 65
                });
                console.log('Wine collection accessed - Premium wine added, romantic activities unlocked');
                break;
                
              // Tier 3 - Monarch's Penthouse Nodes
              case 'infinity_pool':
                // Exclusive high-end swimming activity
                setGameState(prev => ({
                  ...prev,
                  energy: Math.max(0, (prev.energy || 100) - 25),
                  affection: Math.min(100, prev.affection + 18)
                }));
                handleEnvironmentalInteraction({
                  id: 'private_pool_swim',
                  action: 'You suggest a swim in the private infinity pool. "This is incredible," Cha Hae-In breathes, looking out over the city skyline that seems to blend seamlessly with the water\'s edge. The exclusive experience brings you to new heights of intimacy. [- 25 Energy] [High Memory Star potential]',
                  name: 'Infinity Pool',
                  x: 60,
                  y: 70
                });
                console.log('Infinity pool - Exclusive high-end activity with major affection gain');
                break;
              case 'artifact_display':
                // Direct link to Relationship Constellation System
                setShowInventory(true);
                handleEnvironmentalInteraction({
                  id: 'trophy_examination',
                  action: 'You examine your collection of trophies and artifacts together. Each piece tells a story of your journey - the battles fought, the victories won, the moments shared. Cha Hae-In studies each item with reverence, remembering the experiences that brought you here.',
                  name: 'Artifact Display',
                  x: 30,
                  y: 25
                });
                console.log('Artifact display - Opening Relationship Constellation with Memory Cards');
                break;
              case 'wine_cellar':
                // Simple wine selection with inventory addition
                if ((gameState.gold || 0) >= 25000) {
                  setGameState(prev => ({
                    ...prev,
                    gold: Math.max(0, (prev.gold || 0) - 25000),
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
                      'share_vintage_wine'
                    ]
                  }));
                  handleEnvironmentalInteraction({
                    id: 'wine_cellar_selection',
                    action: 'You select a rare vintage from your private wine cellar. [- ₩25,000]. "This is from a legendary vineyard," you explain to Cha Hae-In as she admires the bottle. The vintage wine is now available for special occasions.',
                    name: 'Wine Cellar',
                    x: 20,
                    y: 65
                  });
                  console.log('Wine cellar - Vintage wine selected and added to inventory');
                } else {
                  handleEnvironmentalInteraction({
                    id: 'wine_cellar_browse',
                    action: 'You browse your impressive wine collection together. Each bottle represents a significant investment, but the experience of sharing them would be priceless.',
                    name: 'Wine Cellar',
                    x: 20,
                    y: 65
                  });
                }
                break;
              case 'master_suite':
                // Ultimate gateway to highest-tier intimacy
                setActiveActivity('spend_the_night_together');
                setShowIntimateModal(true);
                console.log('Master suite - Ultimate intimacy gateway: Spend the Night Together');
                break;
              case 'private_elevator':
                // Smooth transition back to World Map
                setShowWorldMap(true);
                handleEnvironmentalInteraction({
                  id: 'penthouse_exit',
                  action: 'You take the private elevator down from your penthouse. The city awaits below, but the memories of this intimate space remain with you both.',
                  name: 'Private Elevator',
                  x: 50,
                  y: 15
                });
                console.log('Private elevator - Transitioning back to World Map');
                break;
              case 'kitchen_counter':
                // Apartment tier 1 - Kitchen intimacy (requires relationship progress)
                const kitchenAffection = gameState.affection || 0;
                const kitchenIntimacy = gameState.intimacyLevel || 0;
                
                if (kitchenAffection >= 30 && kitchenIntimacy >= 20) {
                  setActiveActivity('kitchen_intimacy');
                  setShowIntimateModal(true);
                  console.log('Kitchen counter - Initiating intimate kitchen scene');
                } else {
                  // Too early for intimate activities - just cooking conversation
                  handleEnvironmentalInteraction({
                    id: 'kitchen_cooking_chat',
                    action: 'You suggest making something together in the kitchen. "That sounds nice," Cha Hae-In says with a gentle smile. You work side by side preparing a simple meal, sharing light conversation and growing more comfortable with each other.',
                    name: 'Kitchen Cooking',
                    x: 70,
                    y: 40
                  });
                  setGameState(prev => ({
                    ...prev,
                    affection: Math.min(100, prev.affection + 3)
                  }));
                  console.log('Kitchen counter - Early game cooking conversation');
                }
                break;
              case 'shower':
                // Apartment tier 1 - Shower intimacy (requires high relationship progress)
                const showerAffection = gameState.affection || 0;
                const showerIntimacy = gameState.intimacyLevel || 0;
                
                if (showerAffection >= 60 && showerIntimacy >= 50) {
                  setActiveActivity('shower_together');
                  setShowIntimateModal(true);
                  console.log('Shower - Initiating shower together scene');
                } else {
                  // Too early for shower intimacy - just bathroom conversation
                  handleEnvironmentalInteraction({
                    id: 'bathroom_chat',
                    action: 'You mention the bathroom facilities. "It\'s very clean," Cha Hae-In observes politely, maintaining appropriate boundaries. This isn\'t the right time for more intimate activities.',
                    name: 'Bathroom',
                    x: 80,
                    y: 25
                  });
                  setGameState(prev => ({
                    ...prev,
                    affection: Math.min(100, prev.affection + 1)
                  }));
                  console.log('Shower - Early game bathroom conversation');
                }
                break;
              case 'vanity_table':
              case 'bookshelf':
              case 'window_view':
              case 'tea_station':
                // Other apartment interactions - enhance affection
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
        
        {/* Top-right UI Controls */}
        <motion.div
          className="absolute top-6 right-6 flex items-center gap-3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ 
            opacity: isFocusMode ? 0 : 1, 
            x: isFocusMode ? 50 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Narrative Lens Icon */}
          <AnimatePresence>
            {narrativeLensActive && (
              <motion.div
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
      </motion.div>
      


      {/* Dialogue System - Enhanced Glassmorphism */}
      <AnimatePresence>
        {dialogueActive && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl z-[9999] flex flex-col mobile-chat-container"
            style={{ 
              height: 'calc(55vh - max(20px, env(safe-area-inset-bottom)))',
              maxHeight: 'calc(55vh - max(20px, env(safe-area-inset-bottom)))',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
              backdropFilter: 'blur(20px) saturate(180%)',
              background: `
                linear-gradient(135deg, 
                  rgba(30, 41, 59, 0.3) 0%, 
                  rgba(51, 65, 85, 0.25) 25%,
                  rgba(30, 41, 59, 0.28) 50%,
                  rgba(15, 23, 42, 0.35) 75%,
                  rgba(30, 41, 59, 0.25) 100%
                ),
                radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.04) 0%, transparent 50%)
              `,
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderBottom: 'none'
            }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex flex-col h-full min-h-0 p-4" style={{ paddingBottom: '0' }}>
              
              {/* Close Button - Enhanced Glassmorphism */}
              <motion.button
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-[10000]"
                style={{
                  backdropFilter: 'blur(12px) saturate(150%)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
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
                className="rounded-lg p-4 flex-1 mb-3 flex flex-col"
                style={{
                  backdropFilter: 'blur(16px) saturate(180%)',
                  background: `
                    linear-gradient(135deg, 
                      rgba(30, 41, 59, 0.65) 0%, 
                      rgba(51, 65, 85, 0.6) 25%,
                      rgba(30, 41, 59, 0.63) 50%,
                      rgba(15, 23, 42, 0.67) 75%,
                      rgba(30, 41, 59, 0.65) 100%
                    )
                  `,
                  border: '1px solid rgba(139, 92, 246, 0.3)'
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
                        ) : isGeneratingAvatar ? (
                          <div className="w-full h-full bg-gradient-to-b from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-pink-300/20 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-pink-400/60 border-t-pink-400 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-pink-300/20 flex items-center justify-center">
                            <div className="text-pink-200 text-2xl">
                              {chaHaeInExpression === 'romantic' ? '💕' : 
                               chaHaeInExpression === 'welcoming' ? '😊' :
                               chaHaeInExpression === 'surprised' ? '😲' :
                               chaHaeInExpression === 'amused' ? '😄' :
                               chaHaeInExpression === 'contemplative' ? '🤔' :
                               chaHaeInExpression === 'concerned' ? '😟' :
                               chaHaeInExpression === 'focused' ? '🎯' : '✨'}
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
                      className="space-y-3 overflow-y-auto scroll-smooth mobile-conversation-area"
                      style={{ height: '200px', maxHeight: '200px' }}
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
                            <div className="max-w-[75%] text-right">
                              <p className="text-slate-300/80 italic leading-relaxed text-sm break-words hyphens-auto">
                                {entry.text}
                              </p>
                            </div>
                          ) : (
                            // Cha Hae-In messages: Left-aligned, cinematic script formatting
                            <div className="max-w-[90%] sm:max-w-[85%]">
                              <div className="leading-relaxed break-words hyphens-auto">
                                {parseCinematicText(entry.text)}
                              </div>
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
              <div className="space-y-3" style={{ paddingBottom: 'max(8px, var(--safe-area-inset-bottom))' }}>
                {/* Mobile-Responsive Thought Prompts */}
                {thoughtPrompts.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2 justify-center px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {thoughtPrompts.map((prompt, index) => (
                      <motion.button
                        key={index}
                        className="text-white px-2 py-1.5 rounded-lg text-xs sm:text-sm flex-1 min-w-0 max-w-[48%] sm:max-w-none transition-colors text-center leading-tight whitespace-normal"
                        style={{
                          backdropFilter: 'blur(12px) saturate(150%)',
                          background: `
                            linear-gradient(135deg, 
                              rgba(139, 92, 246, 0.15) 0%, 
                              rgba(168, 85, 247, 0.12) 25%,
                              rgba(139, 92, 246, 0.13) 50%,
                              rgba(124, 58, 237, 0.15) 75%,
                              rgba(139, 92, 246, 0.12) 100%
                            )
                          `,
                          border: '1px solid rgba(139, 92, 246, 0.25)'
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
                    className="flex-1 text-white placeholder:text-slate-300/70 rounded-lg px-3 py-2 text-sm border-0 outline-none"
                    style={{
                      backdropFilter: 'blur(16px) saturate(180%)',
                      background: `
                        linear-gradient(135deg, 
                          rgba(30, 41, 59, 0.65) 0%, 
                          rgba(51, 65, 85, 0.6) 25%,
                          rgba(30, 41, 59, 0.63) 50%,
                          rgba(15, 23, 42, 0.67) 75%,
                          rgba(30, 41, 59, 0.65) 100%
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
                      backdropFilter: 'blur(16px) saturate(180%)',
                      background: `
                        linear-gradient(135deg, 
                          rgba(139, 92, 246, 0.7) 0%, 
                          rgba(236, 72, 153, 0.65) 50%,
                          rgba(139, 92, 246, 0.7) 100%
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
      


      {/* Monarch's Aura - Redesigned Modern Menu */}
      <AnimatePresence>
        {monarchAuraVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-16 sm:top-20 right-2 sm:right-6 w-72 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-slate-700/50 rounded-2xl p-4 z-[9998] shadow-2xl"
            style={{ 
              backdropFilter: 'blur(40px) saturate(180%)', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/50">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Monarch's Aura</h3>
                <p className="text-slate-400 text-xs">Shadow Authority</p>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { icon: Sword, label: 'Raid', color: 'from-red-500 to-orange-500', onClick: () => { setShowDungeonRaid(true); setMonarchAuraVisible(false); } },
                { icon: Star, label: 'Quests', color: 'from-green-500 to-emerald-500', onClick: () => { setShowQuestLog(true); setMonarchAuraVisible(false); } },
                { icon: MapPin, label: 'World Map', color: 'from-blue-500 to-cyan-500', onClick: () => { setShowWorldMap(true); setMonarchAuraVisible(false); } },
                { icon: Heart, label: 'Constellation', color: 'from-pink-500 to-rose-500', onClick: () => { setShowRelationshipConstellation(true); setMonarchAuraVisible(false); } },
                { icon: Home, label: 'Daily Life', color: 'from-yellow-500 to-amber-500', onClick: () => { setShowDailyLifeHub(true); setMonarchAuraVisible(false); } },
                { icon: MessageCircle, label: 'Communicator', color: 'from-cyan-500 to-teal-500', onClick: () => { setShowCommunicator(true); setMonarchAuraVisible(false); } },
                { icon: BookOpen, label: 'Episodes', color: 'from-orange-500 to-red-500', onClick: () => { setShowEpisodeSelector(true); setMonarchAuraVisible(false); } },
                { icon: User, label: 'Character', color: 'from-indigo-500 to-purple-500', onClick: () => { setShowPlayerProgression(true); setMonarchAuraVisible(false); } }
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative p-3 bg-slate-800/40 hover:bg-slate-700/50 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 group"
                  onClick={item.onClick}
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium block">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Special Actions */}
            <div className="space-y-2">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full p-3 bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border border-amber-500/30 hover:border-amber-400/50 rounded-xl transition-all duration-200 relative"
                onClick={() => { 
                  setShowNotifications(!showNotifications); 
                  setMonarchAuraVisible(false); 
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-white text-sm font-medium block">Notifications</span>
                    <span className="text-amber-300 text-xs">System alerts</span>
                  </div>
                  {unreadNotificationCount > 0 && (
                    <div className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadNotificationCount}
                    </div>
                  )}
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.35 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full p-3 bg-gradient-to-r from-red-900/40 to-gray-900/40 border border-red-500/30 hover:border-red-400/50 rounded-xl transition-all duration-200"
                onClick={() => { 
                  if (confirm('Are you sure you want to leave the world?')) {
                    window.location.href = '/';
                  }
                  setMonarchAuraVisible(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-gray-500 rounded-lg flex items-center justify-center">
                    <Power className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-white text-sm font-medium block">Leave World</span>
                    <span className="text-red-300 text-xs">Exit to main menu</span>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-6 w-72 sm:w-80 max-h-96 bg-black/20 backdrop-blur-xl border border-white/30 rounded-lg z-[9998] shadow-2xl overflow-hidden" 
             style={{ 
               background: 'rgba(255, 255, 255, 0.08)', 
               backdropFilter: 'blur(40px) saturate(180%)', 
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
             }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-300" />
              <span className="text-white font-medium">Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadNotificationCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {monarchNotifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="p-2">
                {monarchNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 mb-2 rounded-lg border transition-all cursor-pointer ${
                      notification.read
                        ? 'bg-slate-800/30 border-slate-700/30 opacity-75'
                        : 'bg-slate-700/50 border-slate-600/50'
                    }`}
                    onClick={() => {
                      setMonarchNotifications(prev =>
                        prev.map(n =>
                          n.id === notification.id ? { ...n, read: true } : n
                        )
                      );
                      if (!notification.read) {
                        setUnreadNotificationCount(count => Math.max(0, count - 1));
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notification.type === 'success' ? 'bg-green-400' :
                        notification.type === 'warning' ? 'bg-yellow-400' :
                        notification.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                        <p className="text-slate-300 text-xs mt-1">{notification.message}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {monarchNotifications.length > 0 && (
            <div className="p-3 border-t border-white/20">
              <button
                onClick={() => {
                  setMonarchNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  setUnreadNotificationCount(0);
                }}
                className="w-full text-xs text-slate-400 hover:text-white py-2 rounded transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {(monarchAuraVisible || showNotifications) && (
        <div 
          className="fixed inset-0 z-[9997]" 
          onClick={() => {
            setMonarchAuraVisible(false);
            setShowNotifications(false);
          }}
        />
      )}

      {/* System 15: Mobile-Optimized Notification Banners */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-16 sm:top-20 right-2 sm:right-4 z-[9998] w-72 sm:w-80 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-3 sm:p-4 mb-2"
            style={{ 
              top: `${64 + (index * 70)}px`,
              zIndex: 9998 - index 
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                notification.type === 'quest' ? 'bg-yellow-400' : 
                notification.type === 'episode_available' ? 'bg-orange-400' : 'bg-pink-400'
              }`} />
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => {
                  if (notification.action) {
                    notification.action();
                  } else {
                    setShowCommunicator(true);
                  }
                  setNotifications(prev => prev.filter(n => n.id !== notification.id));
                }}
              >
                <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                <p className="text-white/70 text-xs mt-1">{notification.content}</p>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-white/60" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                  }}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center group"
                >
                  <X className="w-3 h-3 text-white/60 group-hover:text-white/80" />
                </button>
              </div>
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
          
          // Handle coffee activity specifically - follow exact spec
          if (activity.id === 'grab_coffee') {
            console.log('☕ Coffee activity selected - transitioning to Hongdae Cafe spatial view');
            // Step 1: Transition to Hongdae Cafe spatial view (Cha Hae-In already present)
            setPlayerLocation('hongdae_cafe');
            setGameState(prev => ({ ...prev, currentScene: 'hongdae_cafe' }));
            // Step 2: Show choice UI immediately in spatial view (not modal)
            setTimeout(() => {
              setShowCoffeeActivity(true);
            }, 800); // Allow time for spatial transition
            return;
          }

          // TFT-style raid is handled directly by DailyLifeHubComplete component
          // No need to intercept here - let it pass through to the modal system

          // Handle shadow army management activity
          if (activity.id === 'shadow_army_management') {
            console.log('👥 Shadow army management selected - opening character progression');
            setShowPlayerProgression(true);
            setGameState(prev => ({
              ...prev,
              energy: Math.max(0, (prev.energy || 80) - activity.energyCost)
            }));
            return;
          }

          // Handle training activity specifically
          if (activity.id === 'training_session') {
            console.log('🥋 Training activity selected - transitioning to Hunter Association Training Center');
            // First transition to the training center location
            setPlayerLocation('hunter_association');
            setGameState(prev => ({ ...prev, currentScene: 'hunter_association' }));
            // Then open the training modal after a brief delay for transition
            setTimeout(() => {
              setShowTrainingActivity(true);
            }, 500);
            return;
          }

          // Handle sparring session specifically - Activity 2: Gameplay-Integrated  
          if (activity.id === 'sparring_session') {
            console.log('⚔️ Sparring session selected - transitioning to Elite Training Center');
            // First transition to the training center location
            setPlayerLocation('training_facility');
            setGameState(prev => ({ ...prev, currentScene: 'training_facility' }));
            // Then open the sparring modal after a brief delay for transition
            setTimeout(() => {
              setShowSparringModal(true);
            }, 500);
            return;
          }

          // Handle movie night specifically - Activity 3: Domestic & Narrative Gateway
          if (activity.id === 'movie_on_couch') {
            console.log('🎬 Movie night selected - transitioning to apartment living room');
            // First transition to the apartment location
            setPlayerLocation('chahaein_apartment');
            setGameState(prev => ({ ...prev, currentScene: 'chahaein_apartment' }));
            // Then open the movie night modal after a brief delay for transition
            setTimeout(() => {
              setShowMovieNightModal(true);
            }, 500);
            return;
          }

          // Handle Hangang Park Walk - Activity 4: Casual Outing
          if (activity.id === 'hangang_walk') {
            console.log('🌊 Hangang Park walk selected - transitioning to riverfront location');
            // First transition to Hangang Park location
            setPlayerLocation('hangang_park');
            setGameState(prev => ({ ...prev, currentScene: 'hangang_park' }));
            // Then open the Hangang Park walk modal after a brief delay for transition
            setTimeout(() => {
              setShowHangangParkModal(true);
            }, 500);
            return;
          }

          // Handle Shopping for Gifts - Activity 5: Casual Outing → System 7 Bridge
          if (activity.id === 'shopping_for_gifts') {
            console.log('🛍️ Shopping for gifts selected - opening store selection modal');
            setShowShoppingDateModal(true);
            return;
          }

          // Handle Visit an Arcade - Activity 6: Casual Outing with Mini-Game
          if (activity.id === 'visit_arcade') {
            console.log('🎮 Arcade visit selected - transitioning to vibrant arcade spatial view');
            // First transition to arcade location 
            setPlayerLocation('arcade');
            setGameState(prev => ({ ...prev, currentScene: 'arcade' }));
            // Then open the arcade mini-game modal after spatial transition
            setTimeout(() => {
              setShowArcadeVisit(true);
            }, 800);
            return;
          }

          // Handle Review Raid Footage - Activity 7: Training & Hunter Life
          if (activity.id === 'review_raid_footage') {
            console.log('📹 Review raid footage selected - transitioning to Hunter Association analysis center');
            setPlayerLocation('hunter_association');
            setGameState(prev => ({ ...prev, currentScene: 'hunter_association' }));
            setTimeout(() => {
              setShowReviewRaidFootage(true);
            }, 800);
            return;
          }

          // Handle Clear Low-Rank Gate - Activity 8: Training & Hunter Life
          if (activity.id === 'clear_low_rank_gate') {
            console.log('⚔️ Clear low-rank gate selected - opening gate selection modal');
            setShowClearLowRankGate(true);
            return;
          }

          // Handle Assemble New Furniture - Activity 9: Home Life
          if (activity.id === 'assemble_furniture') {
            console.log('🔧 Assemble furniture selected - starting furniture assembly');
            setPlayerLocation('player_apartment');
            setGameState(prev => ({ ...prev, currentScene: 'player_apartment' }));
            setTimeout(() => {
              setShowAssembleFurniture(true);
            }, 500);
            return;
          }

          // Handle Give a Back Rub - Activity 10: Intimate
          if (activity.id === 'give_back_rub') {
            console.log('💆 Back rub selected - transitioning to intimate care scene');
            setPlayerLocation('player_apartment');
            setGameState(prev => ({ ...prev, currentScene: 'player_apartment' }));
            setTimeout(() => {
              setShowBackRubActivity(true);
            }, 500);
            return;
          }

          // Handle Visit N Seoul Tower - Activity 11: Romantic Milestone
          if (activity.id === 'n_seoul_tower') {
            console.log('🗼 N Seoul Tower selected - romantic milestone date');
            setPlayerLocation('n_seoul_tower');
            setGameState(prev => ({ ...prev, currentScene: 'n_seoul_tower' }));
            setTimeout(() => {
              setShowNSeoulTower(true);
            }, 800);
            return;
          }

          // Handle Co-op Skill Training - Activity 12: Training with Mini-Game
          if (activity.id === 'coop_skill_training') {
            console.log('🎯 Co-op skill training selected - synergy mini-game');
            setPlayerLocation('training_facility');
            setGameState(prev => ({ ...prev, currentScene: 'training_facility' }));
            setTimeout(() => {
              setShowCoopSkillTraining(true);
            }, 500);
            return;
          }

          // Handle Order Takeout - Activity 13: Home Life
          if (activity.id === 'order_takeout') {
            console.log('🍜 Order takeout selected - cozy evening meal');
            setPlayerLocation('player_apartment');
            setGameState(prev => ({ ...prev, currentScene: 'player_apartment' }));
            setTimeout(() => {
              setShowOrderTakeout(true);
            }, 500);
            return;
          }

          // Handle Talk on Balcony - Activity 14: Deep Conversations
          if (activity.id === 'talk_on_balcony') {
            console.log('🌙 Balcony talk selected - deep conversation scene');
            setPlayerLocation('player_apartment');
            setGameState(prev => ({ ...prev, currentScene: 'player_apartment_balcony' }));
            setTimeout(() => {
              setShowTalkOnBalcony(true);
            }, 500);
            return;
          }

          // Handle Dinner at Myeongdong - Activity 15: Fine Dining Date
          if (activity.id === 'dinner_myeongdong') {
            console.log('🍽️ Myeongdong dinner selected - fine dining experience');
            setPlayerLocation('myeongdong_restaurant');
            setGameState(prev => ({ ...prev, currentScene: 'myeongdong_restaurant' }));
            setTimeout(() => {
              setShowMyeongdongDinner(true);
            }, 800);
            return;
          }
          
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



      <DungeonRaidSystem11
        isVisible={showDungeonRaid}
        onClose={() => {
          console.log('Closing dungeon raid');
          setShowDungeonRaid(false);
        }}
        onRaidComplete={(success: boolean, loot: any[]) => {
          if (success) {
            setGameState(prev => ({
              ...prev,
              gold: (prev.gold || 0) + 15000000,
              affection: Math.min(100, prev.affection + 10),
              experience: (prev.experience || 0) + 500
            }));
            loot.forEach((item: any) => {
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
          unspentSkillPoints: gameState.unspentSkillPoints || 0,
          affection: gameState.affection || 0
        }}
        onUpdatePlayer={(updates) => {
          setGameState(prev => ({
            ...prev,
            ...updates
          }));
        }}
        onOpenInventory={() => setShowInventory(true)}
        onOpenArmory={() => setShowMonarchArmory(true)}
        onOpenRelationshipConstellation={() => setShowRelationshipConstellation(true)}
      />

      {/* System 18: Episodic Story Engine */}
      <EpisodicStoryEngine
        isVisible={showStoryEngine}
        onClose={() => setShowStoryEngine(false)}
        playerStats={{
          level: gameState.level || 1,
          affectionLevel: (gameState.affection || 0) * 10,
          gold: gameState.gold || 0
        }}
      />

      {/* Episode Player - Integrated into Main Game */}
      {episodeInProgress && currentEpisode && (
        <EpisodePlayer
          episodeId={currentEpisode}
          onBack={() => {
            setEpisodeInProgress(false);
            setCurrentEpisode(null);
          }}
          onComplete={handleEpisodeComplete}
          gameState={gameState}
          onGameStateUpdate={setGameState}
        />
      )}





      {/* Wealth Display - Context-sensitive visibility */}
      <WealthDisplay
        currentGold={gameState.gold || 0}
        isVisible={showUnifiedShop || showHunterMarketVendors || playerLocation === 'luxury_realtor'}
        context={showHunterMarketVendors ? 'market' : showUnifiedShop ? 'vendor' : 'hidden'}
      />

      <WorldMapCarousel
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
        chaHaeInShoppingMode={true}
      />

      <GangnamFurnishings
        isVisible={showGangnamFurnishings}
        onClose={() => setShowGangnamFurnishings(false)}
        currentGold={gameState.gold || 0}
        onPurchase={handleFurniturePurchase}
        backgroundImage={currentLocationData.backgroundImage}
        chaHaeInShoppingMode={true}
      />

      <LuxuryRealtor
        isVisible={showLuxuryRealtor}
        onClose={() => setShowLuxuryRealtor(false)}
        currentGold={gameState.gold || 0}
        onPurchase={handlePropertyPurchase}
        backgroundImage={currentLocationData.backgroundImage}
      />

      <ArcadeVisitModal
        isVisible={showArcadeVisit}
        onClose={() => setShowArcadeVisit(false)}
        backgroundImage={sceneImage || undefined}
        onComplete={(outcome, score) => {
          setShowArcadeVisit(false);
          
          // Apply game outcome effects
          const affectionGain = outcome === 'win' ? 15 : 10;
          setGameState(prev => ({
            ...prev,
            affection: Math.min(100, prev.affection + affectionGain),
            energy: Math.max(0, (prev.energy || 80) - 20),
            experience: (prev.experience || 0) + (outcome === 'win' ? 100 : 50),
            sharedMemories: [...(prev.sharedMemories || []), {
              id: `arcade_${Date.now()}`,
              type: 'fun',
              title: 'Arcade Adventure',
              description: outcome === 'win' 
                ? `Achieved high score of ${score} points! Cha Hae-In was impressed by your gaming skills.`
                : `Scored ${score} points. Cha Hae-In found your competitive spirit endearing.`,
              timestamp: new Date().toISOString(),
              location: 'arcade'
            }]
          }));

          // Show outcome-based conversational dialogue
          const winDialogue = [
            "Wow, Jin-Woo! Your reflexes are incredible. I guess all that hunter training pays off in unexpected ways.",
            "That was amazing! You make everything look so effortless. No wonder you're the strongest hunter.",
            "I love seeing this playful side of you. It's nice to just have fun together without worrying about gates or raids."
          ];

          const lossDialogue = [
            "Don't worry about the score, Jin-Woo. I had so much fun just being here with you.",
            "You know, seeing you get competitive over a simple game is actually really cute.",
            "Even the Shadow Monarch can't win at everything! But watching you try was entertaining."
          ];

          const selectedDialogue = outcome === 'win' 
            ? winDialogue[Math.floor(Math.random() * winDialogue.length)]
            : lossDialogue[Math.floor(Math.random() * lossDialogue.length)];

          setCurrentDialogue(selectedDialogue);
          setDialogueActive(true);
          setShowLivingPortrait(true);
          setChaHaeInExpression(outcome === 'win' ? 'happy' : 'amused');

          // Show affection heart effect
          setShowAffectionHeart(true);
          if (affectionHeartTimeout.current) clearTimeout(affectionHeartTimeout.current);
          affectionHeartTimeout.current = setTimeout(() => setShowAffectionHeart(false), 3000);

          console.log(`🎮 Arcade completed: ${outcome} with score ${score}, +${affectionGain} affection`);
        }}
      />

      <ReviewRaidFootageModal
        isVisible={showReviewRaidFootage}
        onClose={() => setShowReviewRaidFootage(false)}
        backgroundImage={sceneImage || undefined}
        onComplete={(synergyBuff) => {
          setShowReviewRaidFootage(false);
          
          // Apply raid analysis benefits
          setGameState(prev => ({
            ...prev,
            affection: Math.min(100, prev.affection + 8),
            energy: Math.max(0, (prev.energy || 80) - 15),
            experience: (prev.experience || 0) + 75,
            raidSynergyBuff: synergyBuff ? (prev.raidSynergyBuff || 0) + 5 : prev.raidSynergyBuff
          }));

          setCurrentDialogue("That analysis session was really productive. I think we've identified some great areas for improvement in our coordination.");
          setDialogueActive(true);
          setShowLivingPortrait(true);
          setChaHaeInExpression('focused');

          console.log(`📹 Raid footage review completed: ${synergyBuff ? '+5% synergy buff' : 'standard analysis'}`);
        }}
      />

      <ClearLowRankGateModal
        isVisible={showClearLowRankGate}
        onClose={() => setShowClearLowRankGate(false)}
        backgroundImage={sceneImage || undefined}
        onGateSelect={(gateId) => {
          setShowClearLowRankGate(false);
          
          // Launch System 11 Dungeon Raid with selected gate
          console.log(`⚔️ Launching dungeon raid for gate: ${gateId}`);
          setShowDungeonRaid(true);
          
          // Set up the raid context based on selected gate
          setGameState(prev => ({
            ...prev,
            currentRaidGate: gateId,
            raidContext: 'low_rank_clearing'
          }));
        }}
      />

      <AssembleFurnitureModal
        isVisible={showAssembleFurniture}
        onClose={() => setShowAssembleFurniture(false)}
        backgroundImage={sceneImage || undefined}
        furnitureItem={pendingFurnitureItem || {
          name: 'Modern Coffee Table',
          description: 'A sleek glass-top coffee table with metal legs',
          complexity: 'moderate'
        }}
        playerIntelligence={gameState.stats?.intelligence || 50}
        onComplete={(memory) => {
          setShowAssembleFurniture(false);
          
          // Apply furniture assembly results
          setGameState(prev => ({
            ...prev,
            affection: Math.min(100, prev.affection + memory.affectionGain),
            energy: Math.max(0, (prev.energy || 80) - 20),
            sharedMemories: [...(prev.sharedMemories || []), memory]
          }));

          setCurrentDialogue("Well, that was... an adventure. But look what we accomplished together!");
          setDialogueActive(true);
          setShowLivingPortrait(true);
          setChaHaeInExpression('amused');

          console.log(`🔧 Furniture assembly completed: ${memory.title}`);
        }}
      />

      <BackRubActivityModal
        isVisible={showBackRubActivity}
        onClose={() => setShowBackRubActivity(false)}
        backgroundImage={sceneImage || undefined}
        onComplete={(affectionGain, moodBoost) => {
          setShowBackRubActivity(false);
          
          // Apply intimate care benefits
          setGameState(prev => ({
            ...prev,
            affection: Math.min(100, prev.affection + affectionGain),
            energy: Math.max(0, (prev.energy || 80) - 10),
            intimacyLevel: Math.min(100, (prev.intimacyLevel || 0) + 5),
            prevailingMood: moodBoost ? 'deeply_relaxed' : prev.prevailingMood
          }));

          // Show affection heart effect
          setShowAffectionHeart(true);
          if (affectionHeartTimeout.current) clearTimeout(affectionHeartTimeout.current);
          affectionHeartTimeout.current = setTimeout(() => setShowAffectionHeart(false), 3000);

          setCurrentDialogue("That was exactly what I needed. Thank you for always knowing how to take care of me.");
          setDialogueActive(true);
          setShowLivingPortrait(true);
          setChaHaeInExpression('romantic');

          console.log(`💆 Back rub completed: +${affectionGain} affection, mood boost: ${moodBoost}`);
        }}
      />

      <NSeoulTowerModal
        isVisible={showNSeoulTower}
        onClose={() => setShowNSeoulTower(false)}
        backgroundImage={sceneImage || undefined}
        hasLovelock={gameState.inventory?.includes('love_padlock') || true}
        onComplete={(memory) => {
          setShowNSeoulTower(false);
          
          // Apply N Seoul Tower benefits
          setGameState(prev => ({
            ...prev,
            affection: Math.min(100, prev.affection + memory.affectionGain),
            energy: Math.max(0, (prev.energy || 80) - 30),
            sharedMemories: [...(prev.sharedMemories || []), memory],
            romanticMilestone: true
          }));

          // Show affection heart effect
          setShowAffectionHeart(true);
          if (affectionHeartTimeout.current) clearTimeout(affectionHeartTimeout.current);
          affectionHeartTimeout.current = setTimeout(() => setShowAffectionHeart(false), 3000);

          setCurrentDialogue("That was perfect... I'll treasure this memory forever. Thank you for such a beautiful evening.");
          setDialogueActive(true);
          setShowLivingPortrait(true);
          setChaHaeInExpression('romantic');

          console.log(`🗼 N Seoul Tower completed: S-Rank memory created, +${memory.affectionGain} affection`);
        }}
      />

      <CoopSkillTrainingModal
        isVisible={showCoopSkillTraining}
        onClose={() => setShowCoopSkillTraining(false)}
        backgroundImage={sceneImage || undefined}
        onComplete={(synergyBonus) => {
          setShowCoopSkillTraining(false);
          
          // Apply training benefits
          setGameState(prev => ({
            ...prev,
            energy: Math.max(0, (prev.energy || 80) - 25),
            synergyFillRate: (prev.synergyFillRate || 1) + synergyBonus,
            experience: (prev.experience || 0) + 50
          }));

          setCurrentDialogue(`Excellent training session! Our coordination is getting much better. I can feel our synergy improving.`);
          setDialogueActive(true);
          setShowLivingPortrait(true);
          setChaHaeInExpression('focused');

          console.log(`🎯 Co-op training completed: +${synergyBonus}% synergy fill rate bonus`);
        }}
      />

      <OrderTakeoutModal
        isVisible={showOrderTakeout}
        onClose={() => setShowOrderTakeout(false)}
        backgroundImage={sceneImage || undefined}
        onComplete={(goldCost, energyRestored, affectionGain) => {
          setShowOrderTakeout(false);
          
          // Apply takeout benefits
          setGameState(prev => ({
            ...prev,
            gold: Math.max(0, (prev.gold || 0) - goldCost),
            energy: Math.min(100, (prev.energy || 80) + energyRestored),
            affection: Math.min(100, prev.affection + affectionGain)
          }));

          setCurrentDialogue("That was exactly what I needed tonight. Sometimes the simple moments are the most precious.");
          setDialogueActive(true);
          setShowLivingPortrait(true);
          setChaHaeInExpression('happy');

          console.log(`🍜 Takeout completed: -₩${goldCost}, +${energyRestored} energy, +${affectionGain} affection`);
        }}
      />

      <TalkOnBalconyModal
        isVisible={showTalkOnBalcony}
        onClose={() => setShowTalkOnBalcony(false)}
        backgroundImage={sceneImage || undefined}
        onComplete={(affectionGain, deepConversation) => {
          setShowTalkOnBalcony(false);
          
          // Apply conversation benefits
          setGameState(prev => ({
            ...prev,
            affection: Math.min(100, prev.affection + affectionGain),
            energy: Math.max(0, (prev.energy || 80) - 10),
            deepConversationUnlocked: deepConversation,
            prevailingMood: 'contemplative'
          }));

          if (deepConversation) {
            // Show affection heart effect for deep conversations
            setShowAffectionHeart(true);
            if (affectionHeartTimeout.current) clearTimeout(affectionHeartTimeout.current);
            affectionHeartTimeout.current = setTimeout(() => setShowAffectionHeart(false), 3000);
          }

          setCurrentDialogue("Thank you for listening to my heart tonight. These quiet conversations mean everything to me.");
          setDialogueActive(true);
          setShowLivingPortrait(true);
          setChaHaeInExpression('welcoming');

          console.log(`🌙 Balcony talk completed: +${affectionGain} affection, deep conversation: ${deepConversation}`);
        }}
      />

      {/* Sommelier Dialog - Wine Selection Interface */}
      <SommelierDialog
        isOpen={showSommelierDialog}
        onClose={() => setShowSommelierDialog(false)}
        onWineSelected={handleWineSelection}
        playerGold={gameState.gold || 0}
      />

      {/* Myeongdong Dinner Modal - Activity 15: Fine Dining Date */}
      <MyeongdongDinnerModal
        isVisible={showMyeongdongDinner}
        onClose={() => setShowMyeongdongDinner(false)}
        onComplete={(results) => {
          setShowMyeongdongDinner(false);
          
          setGameState(prev => ({
            ...prev,
            energy: Math.max(0, (prev.energy || 80) - results.energySpent),
            affection: Math.min(100, prev.affection + results.affectionGained),
            gold: Math.max(0, (prev.gold || 0) - results.goldSpent),
            experience: (prev.experience || 0) + 200,
            sharedMemories: [...(prev.sharedMemories || []), results.memory]
          }));

          // Show affection heart effect for romantic dinner
          setShowAffectionHeart(true);
          if (affectionHeartTimeout.current) clearTimeout(affectionHeartTimeout.current);
          affectionHeartTimeout.current = setTimeout(() => setShowAffectionHeart(false), 3000);

          setCurrentDialogue("That was absolutely wonderful, Jin-Woo. The food was incredible, but spending this time with you made it perfect. Thank you for such a beautiful evening.");
          setDialogueActive(true);
          setShowLivingPortrait(true);
          setChaHaeInExpression('romantic');

          console.log(`🍽️ Dinner completed: +${results.affectionGained} affection, -₩${results.goldSpent}, quality: ${results.dinnerQuality}`);
        }}
        playerGold={gameState.gold || 0}
        affectionLevel={gameState.affection}
        backgroundImage={sceneImage || undefined}
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

      {/* DevTools Panel for Activity Management */}
      <DevToolsPanel
        isVisible={showDevTools}
        onClose={() => setShowDevTools(false)}
        gameState={gameState}
        onGameStateUpdate={handleGameStateUpdate}
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

      {/* Coffee Activity Modal */}
      <CoffeeActivityModal
        isVisible={showCoffeeActivity}
        onClose={() => setShowCoffeeActivity(false)}
        onActivityComplete={(results) => {
          console.log('☕ Coffee activity completed:', results);
          // Update game state based on actual coffee activity results
          setGameState(prev => ({
            ...prev,
            energy: Math.max(0, (prev.energy || 80) - results.energySpent),
            affection: Math.min(10, (prev.affection || 0) + (results.affectionGained / 10)), // Convert to 0-10 scale
            gold: Math.max(0, (prev.gold || 0) - results.goldSpent)
          }));
          setShowCoffeeActivity(false);
          // Step 5 of spec: Show standard Dialogue UI for conversation
          // Set coffee date context for AI to understand this is a coffee date
          setCoffeeActivityContext("enjoying coffee date with Jin-Woo");
          setCurrentDialogue("*Taking a sip of her drink and looking more relaxed* This is nice, Jin-Woo. It's been a while since I've had time to just sit and enjoy a coffee without thinking about the next raid or mission.");
          setThoughtPrompts([
            "I'm glad we could do this together.",
            "You seem more relaxed than usual.",
            "How's the coffee? I wasn't sure what you'd prefer."
          ]);

          // Trigger the sophisticated dialogue system with coffee context
          handleChaHaeInInteraction();
        }}
        backgroundImage="/images/hongdae-cafe.jpg"
      />

      {/* Sparring Session Modal */}
      <SparringSessionModal
        isVisible={showSparringModal}
        onClose={() => setShowSparringModal(false)}
        onReturnToHub={() => {
          setShowSparringModal(false);
          setShowDailyLifeHub(true);
        }}
        playerStats={{
          level: gameState.level,
          strength: gameState.stats?.strength || 10,
          agility: gameState.stats?.agility || 10,
          vitality: gameState.stats?.vitality || 10,
          energy: gameState.energy || 80
        }}
        onStatsUpdate={(updates) => {
          setGameState(prev => ({
            ...prev,
            energy: updates.energy !== undefined ? updates.energy : prev.energy,
            experience: updates.experience !== undefined ? (prev.experience || 0) + updates.experience : prev.experience,
            affection: updates.affection !== undefined ? Math.min(10, (prev.affection || 0) + updates.affection) : prev.affection
          }));
        }}
      />

      {/* Movie Night Modal - Activity 3: Domestic & Narrative Gateway */}
      <MovieNightModal
        isVisible={showMovieNightModal}
        onClose={() => setShowMovieNightModal(false)}
        onReturnToHub={() => {
          setShowMovieNightModal(false);
          setShowDailyLifeHub(true);
        }}
        playerStats={{
          gold: gameState.gold || 0,
          level: gameState.level,
          experience: gameState.experience || 0,
          affectionLevel: gameState.affection,
          energy: gameState.energy || 80,
          maxEnergy: gameState.maxEnergy || 100,
          apartmentTier: gameState.apartmentTier || 1,
          hasPlushSofa: (gameState as any).hasPlushSofa || false,
          hasEntertainmentSystem: (gameState as any).hasEntertainmentSystem || false
        }}
        onStatsUpdate={(updates) => {
          setGameState(prev => ({
            ...prev,
            energy: updates.energy !== undefined ? updates.energy : prev.energy,
            experience: updates.experience !== undefined ? (prev.experience || 0) + updates.experience : prev.experience,
            affection: updates.affection !== undefined ? Math.min(10, (prev.affection || 0) + updates.affection) : prev.affection
          }));
        }}
        onSetFlag={(flag) => {
          setStoryFlags(prev => [...prev, flag]);
        }}
      />

      {/* Hangang Park Walk Modal - Activity 4: Casual Outing */}
      <HangangParkWalkModal
        isVisible={showHangangParkModal}
        onClose={() => setShowHangangParkModal(false)}
        onReturnToHub={() => {
          setShowHangangParkModal(false);
          setShowDailyLifeHub(true);
        }}
        playerStats={{
          gold: gameState.gold || 0,
          level: gameState.level,
          experience: gameState.experience || 0,
          affectionLevel: gameState.affection,
          energy: gameState.energy || 80,
          maxEnergy: gameState.maxEnergy || 100,
          apartmentTier: gameState.apartmentTier || 1
        }}
        onStatsUpdate={(updates) => {
          setGameState(prev => ({
            ...prev,
            energy: updates.energy !== undefined ? updates.energy : prev.energy,
            experience: updates.experience !== undefined ? (prev.experience || 0) + updates.experience : prev.experience,
            affection: updates.affection !== undefined ? Math.min(10, (prev.affection || 0) + updates.affection) : prev.affection
          }));
        }}
        onCreateMemoryStar={(memory) => {
          setMemoryStars(prev => [...prev, {
            id: `memory_${Date.now()}`,
            title: memory.title,
            description: memory.description,
            emotion: memory.emotion,
            timestamp: new Date()
          }]);
        }}
      />

      {/* Shopping Date Modal */}
      <ShoppingDateModal
        isOpen={showShoppingDateModal}
        onClose={() => setShowShoppingDateModal(false)}
        onStoreSelect={(storeId) => {
          setShowShoppingDateModal(false);
          
          // Add medium affection gain from shared shopping experience
          setGameState(prev => ({
            ...prev,
            affection: Math.min(100, prev.affection + 3),
            energy: Math.max(0, (prev.energy || 80) - 15)
          }));
          
          // Transition to selected store location with Cha Hae-In's enhanced presence
          if (storeId === 'luxury_department') {
            console.log('🏬 Transitioning to Luxury Department Store with Cha Hae-In');
            setPlayerLocation('luxury_department_store');
            setShowLuxuryDepartmentStore(true);
            
            // Enable Cha Hae-In's commentary mode for this shopping session
            setGameState(prev => ({
              ...prev,
              chaHaeInShoppingMode: true,
              currentScene: 'luxury_department_store'
            }));
          } else if (storeId === 'gangnam_furnishings') {
            console.log('🪑 Transitioning to Gangnam Modern Furnishings with Cha Hae-In');
            setPlayerLocation('gangnam_furnishings');
            setShowGangnamFurnishings(true);
            
            // Enable Cha Hae-In's commentary mode for this shopping session
            setGameState(prev => ({
              ...prev,
              chaHaeInShoppingMode: true,
              currentScene: 'gangnam_furnishings'
            }));
          }
        }}
        gameState={{
          affection: gameState.affection,
          money: gameState.gold || 0,
          energy: gameState.energy || 80
        }}
      />



    </div>
  );
}