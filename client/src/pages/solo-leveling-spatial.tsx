import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Crown, Zap, Coins, User, Sword, Star, 
  Camera, Eye, MapPin, Clock, Sun, Moon, CloudRain,
  MessageCircle, Gift, Coffee, Home, Building, Dumbbell,
  ShoppingCart, Calendar, Battery, Award, Package
} from 'lucide-react';

import { DailyLifeHubModal } from '@/components/DailyLifeHubModal';
import { IntimateActivityModal } from '@/components/IntimateActivityModal';
import { UnifiedShop } from '@/components/UnifiedShop';
import EnergyReplenishmentModal from '@/components/EnergyReplenishmentModal';
import { RelationshipConstellation } from '@/components/RelationshipConstellation';
import { DungeonRaid } from '@/components/DungeonRaid';
import { MonarchArmory } from '@/components/MonarchArmory';

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

  const [currentLocation, setCurrentLocation] = useState('hunter_association');
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
  const [showConstellation, setShowConstellation] = useState(false);
  const [showDungeonRaid, setShowDungeonRaid] = useState(false);
  const [showArmory, setShowArmory] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  const worldLocations: Record<string, WorldLocation> = {
    hunter_association: {
      id: 'hunter_association',
      name: 'Hunter Association',
      description: 'The prestigious headquarters where elite hunters gather',
      backgroundImage: '/api/scenes/hunter_association.jpg',
      chaHaeInPresent: true,
      chaActivity: 'reviewing mission reports at her desk',
      chaPosition: { x: 60, y: 40 },
      chaExpression: 'focused',
      interactiveElements: [
        { id: 'mission_board', name: 'Mission Board', position: { x: 20, y: 30 }, action: 'Check available missions' },
        { id: 'coffee_machine', name: 'Coffee Machine', position: { x: 80, y: 60 }, action: 'Offer to get coffee' }
      ]
    },
    coffee_shop: {
      id: 'coffee_shop',
      name: 'Hunter Café',
      description: 'A cozy café where hunters unwind between missions',
      backgroundImage: '/api/scenes/coffee_shop.jpg',
      chaHaeInPresent: timeOfDay === 'morning',
      chaActivity: 'enjoying her morning latte',
      chaPosition: { x: 45, y: 50 },
      chaExpression: 'happy',
      interactiveElements: [
        { id: 'menu_board', name: 'Menu', position: { x: 70, y: 20 }, action: 'Browse the menu together' },
        { id: 'window_seat', name: 'Window Seat', position: { x: 30, y: 60 }, action: 'Suggest sitting by the window' }
      ]
    },
    training_facility: {
      id: 'training_facility',
      name: 'Training Facility',
      description: 'State-of-the-art combat training center',
      backgroundImage: '/api/scenes/training_facility.jpg',
      chaHaeInPresent: timeOfDay === 'afternoon',
      chaActivity: 'practicing sword techniques',
      chaPosition: { x: 50, y: 45 },
      chaExpression: 'focused',
      interactiveElements: [
        { id: 'training_dummy', name: 'Training Dummy', position: { x: 70, y: 50 }, action: 'Ask to spar together' },
        { id: 'equipment_rack', name: 'Equipment', position: { x: 20, y: 40 }, action: 'Examine training weapons' }
      ]
    },
    cha_apartment: {
      id: 'cha_apartment',
      name: "Cha Hae-In's Apartment",
      description: 'Her private sanctuary, warm and inviting',
      backgroundImage: '/api/scenes/apartment.jpg',
      chaHaeInPresent: timeOfDay === 'evening' || timeOfDay === 'night',
      chaActivity: timeOfDay === 'evening' ? 'relaxing on the couch' : 'preparing for bed',
      chaPosition: { x: 40, y: 55 },
      chaExpression: 'shy',
      interactiveElements: [
        { id: 'kitchen', name: 'Kitchen', position: { x: 75, y: 30 }, action: 'Offer to cook together' },
        { id: 'balcony', name: 'Balcony', position: { x: 85, y: 50 }, action: 'Step onto the balcony' }
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

  const currentLocationData = worldLocations[currentLocation];

  const handleChaHaeInTap = async () => {
    if (!currentLocationData.chaHaeInPresent) return;
    
    setDialogueActive(true);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `*approaches Cha Hae-In while she is ${currentLocationData.chaActivity}*`,
          gameState,
          context: {
            location: currentLocation,
            timeOfDay,
            weather,
            activity: currentLocationData.chaActivity,
            affectionLevel: gameState.affection
          }
        })
      });
      
      const data = await response.json();
      setCurrentDialogue(data.response);
      
      // Generate contextual thought prompts
      setThoughtPrompts([
        "How are you feeling today?",
        "Would you like to take a break?",
        "You look beautiful when you're focused"
      ]);
      
    } catch (error) {
      console.error('Dialogue error:', error);
      setCurrentDialogue("*Cha Hae-In looks up with a gentle smile*");
    } finally {
      setIsLoading(false);
    }
  };

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
            location: currentLocation,
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
            location: currentLocation,
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
          gameState,
          location: currentLocation,
          timeOfDay,
          weather,
          chaPresent: currentLocationData.chaHaeInPresent
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
  }, [currentLocation, timeOfDay]);

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
        className="fixed top-6 right-6 w-14 h-14 liquid-glass-enhanced rounded-full flex items-center justify-center z-[9999]"
        style={{ 
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'rgba(147, 51, 234, 0.7)',
          borderColor: 'rgba(147, 51, 234, 0.8)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMonarchAuraVisible(true)}
      >
        <Eye className="w-7 h-7 text-white" />
      </motion.button>
      
      {/* Spatial View - The Living Diorama */}
      <motion.div
        ref={spatialViewRef}
        className="relative w-full h-full"
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
            onClick={handleChaHaeInTap}
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
        {currentLocationData.interactiveElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute group"
            style={{
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <motion.button
              className="w-6 h-6 bg-purple-500/60 rounded-full border border-purple-300/80 backdrop-blur-sm relative"
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                handleEnvironmentalInteraction({
                  action: element.action,
                  name: element.name,
                  x: element.position.x,
                  y: element.position.y
                });
              }}
            >
              {/* Pulsing glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-400/30"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Inner dot */}
              <div className="absolute inset-1 rounded-full bg-purple-300" />
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
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
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
            className="fixed top-1/2 left-4 right-4 max-w-2xl mx-auto liquid-glass-modal z-50"
            style={{ transform: 'translateY(-50%)', maxHeight: '60vh' }}
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="p-3 flex flex-col h-full">
              
              {/* Dialogue Text - Scrollable */}
              <motion.div
                className="liquid-glass p-4 flex-1 overflow-y-auto mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
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
              
              {/* Close Dialogue */}
              <motion.button
                className="absolute top-4 right-4 w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                onClick={() => setDialogueActive(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Monarch's Aura - Radial Menu */}
      <AnimatePresence>
        {monarchAuraVisible && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMonarchAuraVisible(false)}
          >
            <motion.div
              className="relative w-80 h-80"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
              {/* Central Crown */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              {/* Radial Menu Items */}
              {[
                { icon: User, label: 'Armory', angle: 0, color: 'from-purple-600 to-purple-800', onClick: () => { setShowArmory(true); setMonarchAuraVisible(false); } },
                { icon: Sword, label: 'Raid', angle: 60, color: 'from-red-600 to-red-800', onClick: () => { setShowDungeonRaid(true); setMonarchAuraVisible(false); } },
                { icon: Star, label: 'Quests', angle: 120, color: 'from-green-600 to-green-800', onClick: () => { setShowUnifiedShop(true); setMonarchAuraVisible(false); } },
                { icon: MapPin, label: 'World Map', angle: 180, color: 'from-blue-600 to-blue-800', onClick: () => console.log('World map') },
                { icon: Heart, label: 'Constellation', angle: 240, color: 'from-pink-600 to-pink-800', onClick: () => { setShowConstellation(true); setMonarchAuraVisible(false); } },
                { icon: Gift, label: 'Daily Life', angle: 300, color: 'from-yellow-600 to-yellow-800', onClick: () => { setShowDailyLifeHub(true); setMonarchAuraVisible(false); } }
              ].map((item, index) => {
                const radius = 120;
                const radian = (item.angle * Math.PI) / 180;
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;
                
                return (
                  <motion.button
                    key={item.label}
                    className={`absolute w-20 h-20 liquid-glass-flowing rounded-full flex flex-col items-center justify-center text-white transition-all`}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={item.onClick}
                  >
                    <item.icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      


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
    </div>
  );
}