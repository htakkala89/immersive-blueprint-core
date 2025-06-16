import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import WorldMap from '@/components/WorldMap';
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
  
  // UI state
  const [showWorldMap, setShowWorldMap] = useState(true);
  const [playerLocation, setPlayerLocation] = useState('player_apartment');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [gameTime, setGameTime] = useState(new Date());
  
  // Load game state
  const { data: loadedGameState, isLoading: gameStateLoading } = useQuery({
    queryKey: ['/api/game-state', loadedProfileId],
    enabled: !!loadedProfileId && selectedRole === 'player'
  });

  // Update game state when loaded
  useEffect(() => {
    if (loadedGameState && !gameStateLoading) {
      try {
        if (typeof loadedGameState === 'string') {
          const parsed = JSON.parse(loadedGameState);
          setGameState(prev => ({ ...prev, ...parsed }));
        } else {
          setGameState(prev => ({ ...prev, ...loadedGameState }));
        }
      } catch (error) {
        console.log('Error parsing game state:', error);
      }
    }
  }, [loadedGameState, gameStateLoading]);

  // Game time update
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setGameTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timeInterval);
  }, []);

  // Time helper functions
  const getCurrentTimeOfDay = (timeToCheck?: Date) => {
    const hour = (timeToCheck || gameTime).getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  const getLocationName = (locationId: string): string => {
    const locationNames: { [key: string]: string } = {
      'hongdae_cafe': 'Cozy Hongdae Cafe',
      'myeongdong_restaurant': 'Myeongdong Restaurant',
      'hangang_park': 'Hangang River Park',
      'hunter_association': 'Hunter Association',
      'training_facility': 'Training Facility',
      'hunter_market': 'Hunter Market',
      'chahaein_apartment': 'Cha Hae-In\'s Apartment',
      'player_apartment': 'Your Apartment'
    };
    return locationNames[locationId] || locationId;
  };

  // Main game interface
  const renderGameInterface = () => {
    const timeOfDay = getCurrentTimeOfDay();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/30" />
        
        {/* Status bar */}
        <div className="relative z-10 p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Solo Leveling
              </h1>
              <div className="text-sm text-gray-300">
                {timeOfDay} • Level {gameState.level}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-400">Affection:</span>
                <span className="text-pink-400 ml-1">{gameState.affection}/100</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Gold:</span>
                <span className="text-yellow-400 ml-1">{gameState.gold || 0}</span>
              </div>
            </div>
          </div>

          {/* Health and Mana bars */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Health</span>
                <span>{gameState.health}/{gameState.maxHealth}</span>
              </div>
              <Progress 
                value={(gameState.health / gameState.maxHealth) * 100} 
                className="h-2 bg-gray-700"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mana</span>
                <span>{gameState.mana}/{gameState.maxMana}</span>
              </div>
              <Progress 
                value={(gameState.mana / gameState.maxMana) * 100} 
                className="h-2 bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* World Map */}
        {showWorldMap && (
          <div className="relative z-10 px-4">
            <WorldMap 
              gameState={gameState}
              playerLocation={playerLocation}
              onLocationSelect={(locationId) => {
                setPlayerLocation(locationId);
                console.log('Location selected:', locationId);
              }}
              timeOfDay={timeOfDay}
              gameTime={gameTime}
            />
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.slice(-3).map((notification) => (
              <Card key={notification.id} className="bg-black/80 border-purple-500/30 p-3 max-w-sm">
                <div className="text-sm">
                  <div className="font-semibold text-purple-300">{notification.title}</div>
                  <div className="text-gray-300">{notification.content}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Role selection screen
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

  // Creator portal
  if (selectedRole === 'creator') {
    return (
      <CreatorPortalDashboard 
        onBack={() => {
          setSelectedRole('none');
          setLoadedProfileId(null);
        }}
      />
    );
  }

  // Loading state
  if (gameStateLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game state...</div>
      </div>
    );
  }

  // Main game interface
  return renderGameInterface();
}