import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Crown, Zap, Coins, User, Sword, Star, 
  Camera, Eye, MapPin, Clock, Sun, Moon, CloudRain,
  MessageCircle, Gift, Coffee, Home, Building, Dumbbell,
  ShoppingCart, Calendar, Battery, Award, Package, X
} from 'lucide-react';

import { DailyLifeHubModal } from '@/components/DailyLifeHubModal';
import { IntimateActivityModal } from '@/components/IntimateActivityModal';
import { UnifiedShop } from '@/components/UnifiedShop';
import EnergyReplenishmentModal from '@/components/EnergyReplenishmentModal';
import { RelationshipConstellation } from '@/components/RelationshipConstellation';
import { DungeonRaid } from '@/components/DungeonRaid';
import { MonarchArmory } from '@/components/MonarchArmory';
import { WorldMap } from '@/components/WorldMap';

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
    affection: 25,
    currentScene: 'hunter_association',
    inventory: [],
    inCombat: false,
    gold: 1000,
    intimacyLevel: 1,
    energy: 80,
    maxEnergy: 100
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
  const spatialViewRef = useRef<HTMLDivElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [gestureStart, setGestureStart] = useState({ x: 0, y: 0, time: 0 });
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [chaHaeInExpression, setChaHaeInExpression] = useState<'neutral' | 'focused' | 'recognition' | 'welcoming' | 'happy'>('focused');
  const [showLivingPortrait, setShowLivingPortrait] = useState(false);

  // Focus Animation for immersive dialogue
  const handleChaHaeInInteraction = async () => {
    console.log('Starting Cha Hae-In interaction...');
    // Step 1: Focus Animation (300ms)
    setIsFocusMode(true);
    console.log('Focus mode activated');
    
    // Step 2: UI transitions
    setTimeout(() => {
      console.log('Starting dialogue transitions...');
      setShowLivingPortrait(true);
      setChaHaeInExpression('recognition');
      
      // Step 3: Generate context-aware dialogue
      const contextualDialogue = "Oh, Jin-Woo. Sorry, I was just finishing up this report on the Jeju Island aftermath. What's on your mind?";
      setCurrentDialogue(contextualDialogue);
      
      // Step 4: Set thought prompts
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
  const [gameTime, setGameTime] = useState(new Date());
  const [showConstellation, setShowConstellation] = useState(false);
  const [showDungeonRaid, setShowDungeonRaid] = useState(false);
  const [showArmory, setShowArmory] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  // Time and scheduling system
  const getCurrentTimeOfDay = () => {
    const hour = gameTime.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  const getChaHaeInLocation = () => {
    const currentTime = getCurrentTimeOfDay();
    const affection = gameState.affection;
    
    // Enhanced probability-based location system with all Seoul districts
    if (currentTime === 'morning') {
      if (affection >= 70 && Math.random() < 0.4) return 'chahaein_apartment';
      if (Math.random() < 0.3) return 'training_facility';
      if (Math.random() < 0.3) return 'hongdae_cafe';
      if (Math.random() < 0.2) return 'gangnam_tower';
      return 'hunter_association';
    } else if (currentTime === 'afternoon') {
      if (Math.random() < 0.4) return 'hunter_association';
      if (Math.random() < 0.2) return 'training_facility';
      if (Math.random() < 0.15) return 'itaewon_market';
      if (Math.random() < 0.15) return 'myeongdong_shopping';
      return 'gangnam_tower';
    } else if (currentTime === 'evening') {
      if (affection >= 40 && Math.random() < 0.3) return 'myeongdong_restaurant';
      if (affection >= 50 && Math.random() < 0.2) return 'namsan_tower';
      if (affection >= 70 && Math.random() < 0.3) return 'chahaein_apartment';
      if (Math.random() < 0.2) return 'hangang_park';
      return 'hongdae_club';
    } else { // night
      if (affection >= 70 && Math.random() < 0.8) return 'chahaein_apartment';
      if (affection >= 60 && Math.random() < 0.2) return 'namsan_tower';
      return null; // She's not available at night unless high affection
    }
  };

  const chaHaeInCurrentLocation = getChaHaeInLocation();

  const worldLocations = {
    // Gangnam District - Business & Hunter Association
    hunter_association: {
      id: 'hunter_association',
      name: 'Hunter Association HQ',
      description: 'The prestigious headquarters in Gangnam where elite hunters gather',
      backgroundImage: '/api/scenes/hunter_association.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'hunter_association',
      chaActivity: 'reviewing mission reports at her desk',
      chaPosition: { x: 60, y: 40 },
      chaExpression: 'focused' as const,
      interactiveElements: [
        { id: 'cha_desk', name: 'Cha Hae-In at her desk', position: { x: 60, y: 45 }, action: 'Approach Cha Hae-In' },
        { id: 'mission_board', name: 'Mission Board', position: { x: 20, y: 30 }, action: 'Check available missions' },
        { id: 'coffee_machine', name: 'Coffee Machine', position: { x: 80, y: 60 }, action: 'Offer to get coffee' }
      ]
    },
    
    gangnam_tower: {
      id: 'gangnam_tower',
      name: 'Gangnam Business Tower',
      description: 'High-end corporate district with view of Seoul',
      backgroundImage: '/api/scenes/gangnam_tower.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'gangnam_tower',
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
      chaHaeInPresent: chaHaeInCurrentLocation === 'hongdae_club',
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
      chaHaeInPresent: chaHaeInCurrentLocation === 'myeongdong_shopping',
      chaActivity: 'window shopping for hunter gear accessories',
      chaPosition: { x: 40, y: 45 },
      chaExpression: 'neutral' as const,
      interactiveElements: [
        { id: 'gear_shop', name: 'Hunter Gear Boutique', position: { x: 35, y: 40 }, action: 'Browse equipment together' },
        { id: 'street_food', name: 'Street Food Stalls', position: { x: 70, y: 60 }, action: 'Suggest trying local snacks' }
      ]
    },

    // Itaewon District - International & Diverse
    itaewon_market: {
      id: 'itaewon_market',
      name: 'International Hunter Market',
      description: 'Diverse marketplace with global hunter supplies',
      backgroundImage: '/api/scenes/itaewon_market.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'itaewon_market',
      chaActivity: 'researching international hunter techniques',
      chaPosition: { x: 50, y: 40 },
      chaExpression: 'focused' as const,
      interactiveElements: [
        { id: 'weapon_stall', name: 'International Weapons', position: { x: 25, y: 45 }, action: 'Examine foreign weaponry' },
        { id: 'technique_scrolls', name: 'Technique Scrolls', position: { x: 70, y: 35 }, action: 'Study combat methods together' }
      ]
    },

    // Dongdaemun District - Training & Sports
    training_facility: {
      id: 'training_facility',
      name: 'Elite Hunter Training Center',
      description: 'State-of-the-art combat training facility in Dongdaemun',
      backgroundImage: '/api/scenes/training_facility.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'training_facility',
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
        { id: 'couch', name: 'Comfortable Couch', position: { x: 45, y: 60 }, action: 'Sit together' },
        { id: 'kitchen', name: 'Modern Kitchen', position: { x: 75, y: 40 }, action: 'Offer to cook together' },
        { id: 'balcony', name: 'City View Balcony', position: { x: 20, y: 30 }, action: 'Step out for fresh air' }
      ]
    },

    hangang_park: {
      id: 'hangang_park',
      name: 'Hangang River Park',
      description: 'Peaceful riverside park perfect for evening walks',
      backgroundImage: '/api/scenes/hangang_park.jpg',
      chaHaeInPresent: chaHaeInCurrentLocation === 'hangang_park',
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
      chaHaeInPresent: chaHaeInCurrentLocation === 'namsan_tower',
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

  const handlePlayerResponse = async (message: string) => {
    if (!message.trim()) return;
    
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
      
      if (data.gameState) {
        setGameState(data.gameState);
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

  const handleEnvironmentalInteraction = async (interactionPoint: any) => {
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



  const generateSceneImage = async () => {
    try {
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: playerLocation,
          timeOfDay
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

  // Generate initial scene
  useEffect(() => {
    generateSceneImage();
  }, [playerLocation, timeOfDay]);

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

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sf-pro">
      
      {/* Monarch's Aura Eye - Testing */}
      <motion.button
        className="fixed top-6 right-6 w-14 h-14 liquid-glass-enhanced rounded-full flex items-center justify-center z-[9999] cursor-pointer"
        style={{ 
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          pointerEvents: 'auto'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Eye button clicked, current state:', monarchAuraVisible);
          const newState = !monarchAuraVisible;
          console.log('Setting new state to:', newState);
          setMonarchAuraVisible(newState);
        }}
      >
        <svg className="w-8 h-8 text-purple-300 drop-shadow-lg pointer-events-none" viewBox="0 0 32 32" fill="currentColor">
          {/* Angular Crown Base */}
          <path d="M4 20 L8 24 L24 24 L28 20 L28 16 L4 16 Z" 
                fill="currentColor" 
                opacity="0.8"
          />
          {/* Sharp Crown Spikes */}
          <path d="M6 16 L8 8 L10 16 Z" fill="currentColor" />
          <path d="M11 16 L14 4 L17 16 Z" fill="currentColor" />
          <path d="M18 16 L20 6 L22 16 Z" fill="currentColor" />
          <path d="M23 16 L26 10 L28 16 Z" fill="currentColor" />
          {/* Runic Details */}
          <line x1="16" y1="8" x2="16" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <line x1="14" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          {/* Glowing Effect */}
          <defs>
            <filter id="purpleGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#purpleGlow)" className="animate-pulse">
            <path d="M4 20 L8 24 L24 24 L28 20 L28 16 L4 16 Z" 
                  fill="none" 
                  stroke="rgba(147, 51, 234, 0.9)" 
                  strokeWidth="0.8"
            />
          </g>
        </svg>
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
        
        {/* Weather Effects Layer */}
        {getWeatherOverlay()}
        
        {/* Character Layer - Cha Hae-In */}
        {currentLocationData.chaHaeInPresent && (
          <motion.div
            className="absolute cursor-pointer"
            style={{
              left: `${currentLocationData.chaPosition.x}%`,
              top: `${currentLocationData.chaPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleChaHaeInInteraction}
          >
            {/* Cha Hae-In Avatar */}
            <div className="relative">
              <div className="w-24 h-32 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg shadow-2xl flex items-end justify-center">
                <div className="text-white text-xs text-center p-2">
                  Cha Hae-In
                  <br />
                  <span className="text-blue-200 text-xs">{currentLocationData.chaActivity}</span>
                </div>
              </div>
              
              {/* Presence Glow */}
              <motion.div
                className="absolute inset-0 bg-pink-400/30 rounded-lg blur-lg"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Interaction Prompt */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                Tap to interact
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Interactive Elements Layer */}
        {currentLocationData.interactiveElements.map((element: any) => (
          <motion.div
            key={element.id}
            className="absolute group"
            style={{
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ opacity: isFocusMode ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className="w-8 h-8 bg-purple-500/80 rounded-full border-2 border-purple-300/90 backdrop-blur-sm relative shadow-lg shadow-purple-500/50"
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                console.log('Clicked element:', element.id);
                // Check if this is Cha Hae-In interaction
                if (element.id === 'cha_hae_in_desk') {
                  console.log('Triggering Cha Hae-In interaction');
                  handleChaHaeInInteraction();
                } else {
                  handleEnvironmentalInteraction({
                    action: element.action,
                    name: element.name,
                    x: element.position.x,
                    y: element.position.y
                  });
                }
              }}
            >
              {/* Pulsing glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-400/30"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Inner dot */}
              <div className="absolute inset-2 rounded-full bg-purple-200 shadow-inner" />
            </motion.button>
            
            {/* Tooltip on hover */}
            <motion.div
              className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              initial={{ y: 5 }}
              whileHover={{ y: 0 }}
            >
              {element.name}
            </motion.div>
          </motion.div>
        ))}
        


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
            <motion.button
              className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center border-2 border-white/30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                // Handle narrative lens activation
                console.log('Narrative lens activated');
              }}
            >
              <Eye className="w-6 h-6 text-white" />
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Dialogue System - Shared Moments */}
      <AnimatePresence>
        {dialogueActive && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-xl border-2 border-purple-400/50 rounded-2xl shadow-2xl z-[9999]"
            style={{ maxHeight: '60vh' }}
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="p-3 flex flex-col h-full">
              
              {/* Close Button */}
              <motion.button
                className="absolute top-2 right-2 w-8 h-8 bg-slate-800/60 hover:bg-slate-700/80 rounded-full flex items-center justify-center border border-slate-600/30 transition-colors z-[10000]"
                onClick={exitFocusMode}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <X className="w-4 h-4 text-slate-300" />
              </motion.button>
              
              {/* Dialogue Text - Scrollable */}
              <motion.div
                className="bg-slate-800/60 border border-purple-400/30 rounded-lg p-4 flex-1 overflow-y-auto mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-4">
                  {/* Living Portrait of Cha Hae-In */}
                  <motion.div 
                    className="shrink-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: showLivingPortrait ? 1 : 0, x: showLivingPortrait ? 0 : -20 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="w-16 h-20 relative">
                      {/* Portrait Background */}
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-lg backdrop-blur-sm border border-pink-300/20" />
                      
                      {/* Portrait Face */}
                      <div className="absolute inset-1 flex flex-col items-center justify-center text-pink-200">
                        {/* Hair */}
                        <div className="w-8 h-3 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-full mb-1" />
                        
                        {/* Face */}
                        <div className="w-6 h-6 bg-gradient-to-b from-pink-100 to-pink-200 rounded-full relative">
                          {/* Eyes - Expression changes based on chaHaeInExpression */}
                          <motion.div 
                            className="absolute top-1.5 left-1 w-1 h-1 bg-slate-800 rounded-full"
                            animate={{
                              scaleY: chaHaeInExpression === 'focused' ? 0.6 : 1,
                              y: chaHaeInExpression === 'recognition' ? -0.5 : 0
                            }}
                            transition={{ duration: 0.3 }}
                          />
                          <motion.div 
                            className="absolute top-1.5 right-1 w-1 h-1 bg-slate-800 rounded-full"
                            animate={{
                              scaleY: chaHaeInExpression === 'focused' ? 0.6 : 1,
                              y: chaHaeInExpression === 'recognition' ? -0.5 : 0
                            }}
                            transition={{ duration: 0.3 }}
                          />
                          
                          {/* Mouth - Expression changes */}
                          <motion.div
                            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-slate-700 rounded-full"
                            animate={{
                              width: chaHaeInExpression === 'welcoming' ? 10 : 8,
                              borderRadius: chaHaeInExpression === 'welcoming' ? '0 0 8px 8px' : '2px'
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        
                        {/* Body */}
                        <div className="w-5 h-4 bg-gradient-to-b from-blue-800 to-blue-900 rounded-b-lg mt-0.5" />
                      </div>
                      
                      {/* Glow effect based on expression */}
                      <motion.div 
                        className="absolute inset-0 rounded-lg"
                        animate={{
                          boxShadow: chaHaeInExpression === 'welcoming' 
                            ? '0 0 12px rgba(236, 72, 153, 0.4)' 
                            : '0 0 6px rgba(236, 72, 153, 0.2)'
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                  
                  <div className="flex-1">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <motion.div
                          className="w-2 h-2 bg-pink-400 rounded-full"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span>Cha Hae-In is responding...</span>
                      </div>
                    ) : (
                      <p className="text-white leading-relaxed">{currentDialogue}</p>
                    )}
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
                        className="bg-purple-600/30 hover:bg-purple-600/50 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-purple-400/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
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
                  <Input
                    value={playerInput}
                    onChange={(e) => setPlayerInput(e.target.value)}
                    placeholder="Speak from the heart..."
                    className="flex-1 bg-slate-800/50 border-purple-400/30 text-white placeholder:text-slate-400 rounded-lg px-3 py-2 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handlePlayerResponse(playerInput)}
                  />
                  <Button
                    onClick={() => handlePlayerResponse(playerInput)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg px-4 py-2"
                    disabled={!playerInput.trim() || isLoading}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
              

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      


      {/* Monarch's Aura - Simple Dropdown Menu */}
      {monarchAuraVisible && (
        <div className="fixed top-20 right-6 w-48 bg-purple-800/60 backdrop-blur-xl border border-white/40 rounded-xl p-4 z-[9998] shadow-2xl" style={{ backdropFilter: 'blur(40px) saturate(180%)', borderImage: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1)) 1' }}>
          <div className="text-white text-lg mb-3 font-semibold drop-shadow-lg">Monarch's Aura</div>
          {[
            { icon: User, label: 'Armory', color: 'text-purple-300', onClick: () => { setShowArmory(true); setMonarchAuraVisible(false); } },
            { icon: Sword, label: 'Raid', color: 'text-red-300', onClick: () => { setShowDungeonRaid(true); setMonarchAuraVisible(false); } },
            { icon: Star, label: 'Quests', color: 'text-green-300', onClick: () => { setShowUnifiedShop(true); setMonarchAuraVisible(false); } },
            { icon: MapPin, label: 'World Map', color: 'text-blue-300', onClick: () => { setShowWorldMap(true); setMonarchAuraVisible(false); } },
            { icon: Heart, label: 'Constellation', color: 'text-pink-300', onClick: () => { setShowConstellation(true); setMonarchAuraVisible(false); } },
            { icon: Gift, label: 'Daily Life', color: 'text-yellow-300', onClick: () => { setShowDailyLifeHub(true); setMonarchAuraVisible(false); } }
          ].map((item, index) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-white hover:bg-white/20 transition-all mb-2 bg-white/5 border border-white/10"
              onClick={item.onClick}
            >
              <item.icon className={`w-6 h-6 ${item.color} drop-shadow-lg`} />
              <span className="text-sm font-medium drop-shadow-sm">{item.label}</span>
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
      


      {/* Feature Modals */}
      <DailyLifeHubModal
        isVisible={showDailyLifeHub}
        onClose={() => setShowDailyLifeHub(false)}
        gameState={gameState}
        onActivitySelect={(activity: any) => {
          const activityId = typeof activity === 'string' ? activity : activity.id;
          setActiveActivity(activityId);
          setShowDailyLifeHub(false);
          setShowIntimateModal(true);
        }}
        onImageGenerated={(imageUrl) => setSceneImage(imageUrl)}
        audioMuted={false}
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

      <RelationshipConstellation
        isVisible={showConstellation}
        onClose={() => setShowConstellation(false)}
        affectionLevel={gameState.affection}
        memories={[]}
        onMemorySelect={(memory) => {
          console.log('Reliving memory:', memory.title);
          setShowConstellation(false);
        }}
      />

      <DungeonRaid
        isVisible={showDungeonRaid}
        onClose={() => setShowDungeonRaid(false)}
        onRaidComplete={(success, loot) => {
          if (success) {
            setGameState(prev => ({
              ...prev,
              gold: (prev.gold || 0) + 1000,
              affection: Math.min(100, prev.affection + 10)
            }));
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

      <WorldMap
        isVisible={showWorldMap}
        onClose={() => setShowWorldMap(false)}
        onLocationSelect={(location) => {
          setPlayerLocation(location.id);
          setShowWorldMap(false);
          generateSceneImage();
        }}
        currentTime={timeOfDay}
        chaHaeInLocation={chaHaeInCurrentLocation}
        playerAffection={gameState.affection}
        storyProgress={gameState.level}
      />
    </div>
  );
}