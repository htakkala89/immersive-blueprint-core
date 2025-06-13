import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Crown, Zap, Coins, User, Sword, Star, 
  Camera, Eye, MapPin, Clock, Sun, Moon, CloudRain,
  MessageCircle, Gift, Coffee, Home, Building, Dumbbell,
  ShoppingCart, Calendar, Battery, Award, Package, X, Brain, Target, BookOpen, Wand2
} from 'lucide-react';

// Removed unused imports to fix React hooks error
import { RoleSelectionScreen } from '@/components/RoleSelectionScreen';
import { CreatorPortalDashboard } from '@/components/CreatorPortalDashboard';
import EpisodeSelector from '@/components/EpisodeSelector';

// Core game state interface
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

export default function SoloLevelingSpatialFixed() {
  // Core game state
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 0,
    currentScene: 'hunter_association',
    inventory: [],
    inCombat: false,
    gold: 1000,
    intimacyLevel: 1,
    energy: 100,
    maxEnergy: 100,
    experience: 0,
    maxExperience: 100,
    apartmentTier: 1,
    playerId: 'player_1',
    activeQuests: [],
    completedQuests: [],
    intelligence: 10,
    storyFlags: {
      redGateUnlocked: false,
      dungeonAccessGranted: false,
      tutorialCompleted: false,
      firstMissionActive: false
    },
    hunterRank: 'E-Rank',
    stats: { strength: 10, agility: 10, vitality: 10, intelligence: 10, sense: 10 },
    unspentStatPoints: 0,
    unspentSkillPoints: 0,
    storyProgress: 0,
    unlockedActivities: ['coffee_date', 'sparring_session', 'training_session'],
    hasPlushSofa: false,
    hasEntertainmentSystem: false,
    ownedFurniture: [],
    sharedMemories: [],
    raidSynergyBuff: 0,
    currentRaidGate: '',
    raidContext: '',
    prevailingMood: 'neutral',
    synergyFillRate: 1.0,
    romanticMilestone: false,
    deepConversationUnlocked: false
  });

  // UI state
  const [selectedRole, setSelectedRole] = useState<'none' | 'player' | 'creator'>('none');
  const [loadedProfileId, setLoadedProfileId] = useState<number | null>(null);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<string | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<any>(null);
  const [episodeBeatIndex, setEpisodeBeatIndex] = useState(0);

  // Simple episode execution function
  const executeStoryAction = (action: any) => {
    switch (action.type) {
      case 'DELIVER_MESSAGE':
        console.log('Episode message:', action.message || action.content);
        break;
      case 'ACTIVATE_QUEST':
        const newQuest = {
          id: action.quest_id,
          title: action.title,
          description: action.description || '',
          objectives: action.objectives || [],
          targetLocation: action.target_location || 'current',
          status: 'active' as const,
          rewards: action.rewards || {}
        };
        setGameState(prev => ({
          ...prev,
          activeQuests: [...(prev.activeQuests || []), newQuest]
        }));
        break;
      case 'BOOST_AFFECTION':
        setGameState(prev => ({ 
          ...prev, 
          affection: Math.min(100, prev.affection + (action.amount || 5))
        }));
        break;
      default:
        console.log('Unknown story action type:', action.type);
    }
  };

  // Episode integration effect - MUST be before any conditional returns
  useEffect(() => {
    if (currentEpisode && !activeEpisode) {
      fetch(`/api/episodes/${currentEpisode}`)
        .then(res => res.json())
        .then(data => {
          const episode = data.episode;
          setActiveEpisode(episode);
          setEpisodeBeatIndex(0);
          
          // Execute first beat
          const firstBeat = episode.beats[0];
          if (firstBeat) {
            firstBeat.actions.forEach((action: any, actionIndex: number) => {
              setTimeout(() => {
                executeStoryAction(action);
              }, actionIndex * 1000);
            });
          }
          
          setCurrentEpisode(null);
          setShowEpisodeSelector(false);
        })
        .catch(err => {
          console.error('Failed to load episode:', err);
          setCurrentEpisode(null);
          setShowEpisodeSelector(false);
        });
    }
  }, [currentEpisode, activeEpisode]);

  // Role Selection Screen
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

  // Creator Portal
  if (selectedRole === 'creator') {
    return (
      <CreatorPortalDashboard 
        onLogout={() => setSelectedRole('none')}
      />
    );
  }

  // Episode Selector
  if (showEpisodeSelector) {
    return (
      <EpisodeSelector
        onSelectEpisode={(episode: any) => {
          setCurrentEpisode(episode.id);
          setShowEpisodeSelector(false);
        }}
        onBack={() => setShowEpisodeSelector(false)}
      />
    );
  }

  // Main spatial game interface
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sf-pro">
      {/* Leave World Button */}
      <motion.button
        className="fixed top-6 right-20 w-11 h-11 rounded-full flex items-center justify-center z-[9999] cursor-pointer shadow-2xl overflow-hidden"
        style={{ 
          position: 'fixed',
          top: '24px',
          right: '80px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setSelectedRole('none');
          setLoadedProfileId(null);
        }}
      >
        <Home className="w-5 h-5 text-white" />
      </motion.button>

      {/* Episodes Button */}
      <motion.button
        className="fixed top-6 right-36 w-11 h-11 rounded-full flex items-center justify-center z-[9999] cursor-pointer shadow-2xl overflow-hidden"
        style={{ 
          position: 'fixed',
          top: '24px',
          right: '144px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowEpisodeSelector(true)}
      >
        <BookOpen className="w-5 h-5 text-white" />
      </motion.button>

      {/* Game World Content */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Solo Leveling: Spatial World</h1>
          <p className="text-xl mb-8">Affection: {gameState.affection}/100</p>
          <p className="text-lg mb-4">Level: {gameState.level} | Gold: {gameState.gold}</p>
          
          {activeEpisode && (
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30 mb-4">
              <h3 className="text-lg font-semibold text-purple-300">Active Episode</h3>
              <p className="text-purple-200">{activeEpisode.title}</p>
              <p className="text-sm text-purple-400">Beat {episodeBeatIndex + 1} of {activeEpisode.beats?.length || 0}</p>
            </div>
          )}

          <div className="space-y-2">
            <p>Episodes now integrate directly into the spatial world</p>
            <p>Click the Episodes button to start a story</p>
            <p>Stories execute actions in the game world instead of separate viewer</p>
          </div>
        </div>
      </div>
    </div>
  );
}