import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { CoffeeActivityModal } from './CoffeeActivityModal';

interface PlayerStats {
  gold: number;
  level: number;
  experience: number;
  affectionLevel: number;
  energy: number;
  maxEnergy: number;
  relationshipStatus: 'dating' | 'engaged' | 'married';
  intimacyLevel: number;
  sharedMemories: number;
  livingTogether: boolean;
  daysTogether: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string;
  energyCost: number;
  goldReward?: number;
  experienceReward?: number;
  affectionReward?: number;
  available: boolean;
  cooldown?: number;
  requiredLevel?: number;
  lockReason?: string;
}

interface DailyLifeHubModalProps {
  isVisible: boolean;
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
  onImageGenerated: (imageUrl: string) => void;
  gameState: any;
  audioMuted?: boolean;
}

const getAvailableActivities = (stats: PlayerStats, timeOfDay: string): Activity[] => {
  // Convert 0-5 affection scale to 0-100 scale for unlock logic
  const scaledAffection = stats.affectionLevel * 20;
  const baseActivities: Activity[] = [
    {
      id: 'grab_coffee',
      title: 'Grab a Coffee',
      description: 'Have a casual coffee date at Hongdae Cafe',
      icon: '☕',
      energyCost: 10,
      affectionReward: 3,
      available: true,
      goldReward: 0 // Will be deducted based on choice
    },
    {
      id: 'dungeon_raid',
      title: 'Dungeon Raids',
      description: 'Lead your shadow army into dangerous dungeons',
      icon: '⚔️',
      energyCost: 25,
      experienceReward: 200,
      goldReward: 500,
      available: true
    },
    {
      id: 'shadow_training',
      title: 'Shadow Army Management',
      description: 'Train and evolve your shadow soldiers',
      icon: '👥',
      energyCost: 15,
      experienceReward: 100,
      available: true
    },
    {
      id: 'morning_coffee',
      title: 'Morning Coffee',
      description: 'Start the day with Cha Hae-In over coffee',
      icon: '☕',
      energyCost: 10,
      affectionReward: 5,
      available: timeOfDay === 'morning'
    },
    {
      id: 'training_together',
      title: 'Train Together',
      description: 'Practice combat techniques as a team',
      icon: '⚔️',
      energyCost: 30,
      experienceReward: 50,
      affectionReward: 10,
      available: stats.energy >= 30
    },
    {
      id: 'romantic_dinner',
      title: 'Romantic Dinner',
      description: 'Share an intimate dinner at home',
      icon: '🍽️',
      energyCost: 20,
      goldReward: -100,
      affectionReward: 15,
      available: timeOfDay === 'evening' && stats.gold >= 100
    },
    {
      id: 'shopping_date',
      title: 'Shopping Date',
      description: 'Browse the hunter marketplace together',
      icon: '🛍️',
      energyCost: 25,
      goldReward: -50,
      affectionReward: 8,
      available: stats.energy >= 25
    },
    {
      id: 'marketplace_visit',
      title: 'Visit Marketplace',
      description: 'Buy supplies, weapons, and gifts',
      icon: '🏪',
      energyCost: 5,
      goldReward: 0,
      experienceReward: 0,
      affectionReward: 0,
      available: true
    }
  ];

  // Add raid activities based on level and affection
  if (stats.level >= 10) {
    baseActivities.push({
      id: 'solo_raid',
      title: 'Solo Gate Raid',
      description: 'Clear gates alone to earn gold and experience',
      icon: '🚪',
      energyCost: 40,
      goldReward: 100,
      experienceReward: 50,
      affectionReward: 0,
      available: stats.energy >= 40
    });
  }

  if (scaledAffection >= 70 && stats.relationshipStatus !== 'dating') {
    baseActivities.push({
      id: 'joint_raid',
      title: 'Joint Raid with Cha Hae-In',
      description: 'Take on dangerous gates together as a team',
      icon: '⚔️',
      energyCost: 50,
      goldReward: 200,
      experienceReward: 80,
      affectionReward: 10,
      available: stats.energy >= 50
    });
  }

  // Living together activities (unlocked at high affection)
  if (scaledAffection >= 80 && !stats.livingTogether) {
    baseActivities.push({
      id: 'propose_living_together',
      title: 'Ask to Live Together',
      description: 'Take your relationship to the next level',
      icon: '🏠',
      energyCost: 30,
      goldReward: 0,
      experienceReward: 0,
      affectionReward: 20,
      available: true
    });
  }

  // Always show intimate activities for motivation, but lock based on progression
  
  // Level 3+ - Romantic touching unlocked
  baseActivities.push({
    id: 'cuddle_together',
    title: 'Cuddle Time',
    description: scaledAffection >= 60 ? 'Relaxing intimate moments together' : '🔒 Unlock at Affection Level 3',
    icon: '💕',
    energyCost: 15,
    affectionReward: 15,
    available: scaledAffection >= 60,
    requiredLevel: 3,
    lockReason: scaledAffection < 60 ? 'Need stronger emotional bond (Level 3)' : undefined
  });

  // Level 4+ - Physical intimacy unlocked
  baseActivities.push({
    id: 'shower_together',
    title: 'Shower Together',
    description: scaledAffection >= 80 ? 'Intimate shower time (18+)' : '🔒 Unlock at Affection Level 4',
    icon: '🚿',
    energyCost: 20,
    affectionReward: 20,
    available: scaledAffection >= 80,
    requiredLevel: 4,
    lockReason: scaledAffection < 80 ? 'Need deeper trust and intimacy (Level 4)' : undefined
  });

  // Level 5+ - Private bedroom intimacy
  baseActivities.push({
    id: 'bedroom_intimacy',
    title: 'Bedroom Time',
    description: scaledAffection >= 100 ? 'Private intimate moments (18+)' : '🔒 Unlock at MAX Affection',
    icon: '🛏️',
    energyCost: 25,
    affectionReward: 25,
    available: scaledAffection >= 100,
    requiredLevel: 5,
    lockReason: scaledAffection < 100 ? 'Need maximum romantic commitment (Level 5)' : undefined
  });

  // Level 5+ - Ultimate intimacy (maximum motivation)
  baseActivities.push({
    id: 'make_love',
    title: 'Make Love',
    description: scaledAffection >= 100 ? 'Ultimate intimacy together (18+)' : '🔒 Unlock at MAX Affection',
    icon: '❤️‍🔥',
    energyCost: 40,
    affectionReward: 50,
    available: scaledAffection >= 100,
    requiredLevel: 5,
    lockReason: scaledAffection < 100 ? 'Need perfect love bond (MAX Level 5)' : undefined
  });

  // Level 4+ - Advanced intimate activities
  baseActivities.push({
    id: 'intimate_massage',
    title: 'Intimate Massage',
    description: scaledAffection >= 80 ? 'Sensual relaxation together (18+)' : '🔒 Unlock at Affection Level 4',
    icon: '💆‍♀️',
    energyCost: 30,
    affectionReward: 30,
    available: scaledAffection >= 80,
    requiredLevel: 4,
    lockReason: scaledAffection < 80 ? 'Need passionate connection (Level 4)' : undefined
  });

  // Level 4+ - Romantic luxury experiences
  baseActivities.push({
    id: 'romantic_bath',
    title: 'Romantic Bath',
    description: scaledAffection >= 80 ? 'Luxury intimate bath together (18+)' : '🔒 Unlock at Affection Level 4',
    icon: '🛁',
    energyCost: 35,
    affectionReward: 40,
    available: scaledAffection >= 80,
    requiredLevel: 4,
    lockReason: scaledAffection < 80 ? 'Need devoted partnership (Level 4)' : undefined
  });

  // Level 3+ - Sensual activities
  baseActivities.push({
    id: 'cooking_together',
    title: 'Cook Together',
    description: scaledAffection >= 60 ? 'Romantic cooking experience' : '🔒 Unlock at Affection Level 3',
    icon: '👩‍🍳',
    energyCost: 20,
    affectionReward: 25,
    available: scaledAffection >= 60,
    requiredLevel: 3,
    lockReason: scaledAffection < 60 ? 'Need domestic intimacy (Level 3)' : undefined
  });

  // Level 5+ - Ultimate exclusive content (maximum motivation)
  baseActivities.push({
    id: 'wedding_night',
    title: 'Wedding Night',
    description: scaledAffection >= 100 ? 'Ultimate romantic union (18+)' : '🔒 MAX LEVEL EXCLUSIVE - Affection Level 5',
    icon: '💒',
    energyCost: 50,
    affectionReward: 100,
    available: scaledAffection >= 100,
    requiredLevel: 5,
    lockReason: scaledAffection < 100 ? 'EXCLUSIVE: Perfect love required (MAX Level 5)' : undefined
  });

  // Level 5+ - Private beach getaway
  baseActivities.push({
    id: 'beach_vacation',
    title: 'Private Beach',
    description: scaledAffection >= 100 ? 'Secluded romantic getaway (18+)' : '🔒 MAX LEVEL EXCLUSIVE - Affection Level 5',
    icon: '🏖️',
    energyCost: 45,
    affectionReward: 80,
    available: scaledAffection >= 100,
    requiredLevel: 5,
    lockReason: scaledAffection < 100 ? 'EXCLUSIVE: Ultimate trust required (MAX Level 5)' : undefined
  });

  return baseActivities; // Show all activities, including locked ones for motivation
};

const getActivityDialogue = (activity: Activity): string => {
  const dialogues: Record<string, string> = {
    morning_coffee: "*stretches elegantly* Morning, Jin-Woo! I was thinking we could grab some coffee before today's missions. What do you say?",
    lunch_date: "*checks her sword briefly, then smiles* How about lunch? I know this place that serves amazing bulgogi. My treat?",
    evening_walk: "*looks out at the sunset* Perfect evening for a walk, don't you think? I could use some fresh air after today's training.",
    training_together: "*adjusts her stance with a competitive glint* Ready for some sparring? Fair warning - I won't go easy on you just because you're the Shadow Monarch.",
    shopping_trip: "*sighs slightly* I need to pick up some new gear. Want to come? Your opinion on equipment choices might actually be useful.",
    movie_night: "*leans against the wall casually* There's this action movie everyone's talking about. Interested? Though I doubt it's as intense as our real adventures.",
    solo_raid: "*confident expression* I've got a C-rank gate to clear solo. Quick work, but it keeps my skills sharp.",
    joint_raid: "*serious but excited* There's a dangerous A-rank gate that just opened. Want to tackle it together? I could use someone I trust watching my back.",
    marketplace_visit: "*thoughtful look* The hunters' marketplace has some rare items today. Might find something that catches your eye.",
    propose_living_together: "*takes a deep breath, looking slightly vulnerable* Jin-Woo... I've been thinking about us. Maybe it's time we... shared a place? What do you think?",
    cuddle_together: "*softer expression* Come here... *reaches out gently* Sometimes even hunters need to just... be close to someone they care about.",
    shower_together: "*blushes slightly but maintains eye contact* The water's perfect temperature... care to join me? I promise I'll behave... mostly.",
    make_love: "*moves closer with loving eyes* Jin-Woo... *touches your face gently* I want to show you just how much you mean to me. Every part of me is yours.",
    intimate_massage: "*notices your tension* You're carrying too much stress, my love. *gentle smile* Let me take care of you... I know exactly how to help you relax.",
    intimate_bath: "*lighting candles around the tub* I prepared something special for us... *extends her hand* Just you, me, and warm water... perfect for forgetting the world exists."
  };
  
  return dialogues[activity.id] || "*smiles warmly* What do you have in mind? I'm always up for spending quality time with you.";
};

export function DailyLifeHubModal({ isVisible, onClose, onActivitySelect, onImageGenerated, gameState, audioMuted = false }: DailyLifeHubModalProps) {
  const { playVoice } = useVoice();
  const [coffeeActivityVisible, setCoffeeActivityVisible] = useState(false);
  const [currentTimeOfDay] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  });

  const playerStats: PlayerStats = {
    gold: gameState?.gold || 500,
    level: gameState?.level || 1,
    experience: gameState?.experience || 0,
    affectionLevel: (gameState?.affection || 0) * 10, // Convert 0-5 scale to 0-50, then multiply by 2 for percentage feel
    energy: gameState?.energy || 80,
    maxEnergy: 100,
    relationshipStatus: gameState?.affection >= 5 ? 'married' : gameState?.affection >= 4 ? 'engaged' : 'dating',
    intimacyLevel: (gameState?.intimacyLevel || gameState?.affection * 10 || 0),
    sharedMemories: gameState?.affection * 10 || 10,
    livingTogether: gameState?.affection >= 4,
    daysTogether: (gameState?.affection || 1) * 30
  };

  const availableActivities = getAvailableActivities(playerStats, currentTimeOfDay);

  const handleActivityClick = async (activity: Activity) => {
    // Handle coffee activity
    if (activity.id === 'grab_coffee') {
      setCoffeeActivityVisible(true);
      return;
    }

    // Handle special activities that open modals
    if (activity.id === 'solo_raid' || activity.id === 'joint_raid') {
      // Trigger raid system modal
      onActivitySelect(activity);
      return;
    }

    if (activity.id === 'marketplace_visit') {
      // Trigger marketplace modal
      onActivitySelect(activity);
      return;
    }

    // Generate image for intimate activities
    const intimateActivities = ['intimate_evening', 'cuddle_together', 'shower_together', 'make_love', 'strip_poker', 'intimate_massage', 'intimate_bath'];
    if (intimateActivities.includes(activity.id)) {
      try {
        console.log(`Generating image for activity: ${activity.id}`);
        const response = await fetch('/api/generate-intimate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activityId: activity.id,
            relationshipStatus: playerStats.relationshipStatus,
            intimacyLevel: playerStats.intimacyLevel
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            console.log(`Image generated for ${activity.id}:`, data.imageUrl.substring(0, 50) + '...');
            onImageGenerated(data.imageUrl);
          }
        } else {
          console.error('Failed to generate image:', response.status);
        }
      } catch (error) {
        console.error('Error generating activity image:', error);
      }
    }

    // Generate activity-specific dialogue (only once)
    const activityDialogue = getActivityDialogue(activity);
    
    // Play voice for activity dialogue with delay to allow image loading
    if (activityDialogue) {
      setTimeout(() => {
        console.log(`Playing dialogue for ${activity.id}:`, activityDialogue);
        playVoice(activityDialogue, 'cha-hae-in', audioMuted);
      }, intimateActivities.includes(activity.id) ? 1500 : 500); // Longer delay for image generation
    }

    // Pass activity context to enable continuous interaction
    onActivitySelect(activity);
  };

  // Handle coffee activity completion
  const handleCoffeeActivityComplete = (results: any) => {
    // Update game state with results
    if (gameState) {
      gameState.gold = Math.max(0, (gameState.gold || 500) - results.goldSpent);
      gameState.energy = Math.max(0, (gameState.energy || 80) - results.energySpent);
      gameState.affection = Math.min(5, (gameState.affection || 0) + (results.affectionGained / 20)); // Convert back to 0-5 scale
    }
    
    setCoffeeActivityVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999]">
      <div className="w-full max-w-4xl mx-4 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <div>
              <h2 className="text-white font-bold text-lg">Daily Life Hub</h2>
              <p className="text-pink-100 text-sm">Life with Cha Hae-In</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-all border border-white/20 shadow-lg relative z-[10001]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="p-4 border-b border-white/10">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="text-yellow-400 font-bold">{playerStats.gold}💰</div>
              <div className="text-gray-400">Gold</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold">{playerStats.energy}/{playerStats.maxEnergy}⚡</div>
              <div className="text-gray-400">Energy</div>
            </div>
            <div className="text-center">
              <div className="text-pink-400 font-bold">❤️ {Math.floor(playerStats.affectionLevel/10)}/10</div>
              <div className="text-gray-400">Affection</div>
            </div>
          </div>
        </div>

        {/* Time of Day */}
        <div className="p-4 border-b border-white/10">
          <div className="text-center">
            <span className="text-lg">
              {currentTimeOfDay === 'morning' ? '🌅' : currentTimeOfDay === 'afternoon' ? '☀️' : '🌙'}
            </span>
            <span className="text-white ml-2 capitalize">{currentTimeOfDay}</span>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4 text-lg">Activities & Intimate Moments</h3>
          <div className="grid grid-cols-2 gap-4">
            {availableActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => activity.available ? handleActivityClick(activity) : null}
                disabled={!activity.available}
                className={`p-4 rounded-xl border transition-all group relative ${
                  activity.available 
                    ? 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-pink-400/50 cursor-pointer' 
                    : 'bg-gray-800/50 border-gray-600/30 cursor-not-allowed'
                }`}
              >
                {/* Lock overlay for unavailable activities */}
                {!activity.available && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔒</div>
                      <div className="text-yellow-400 font-bold text-xs">Level {activity.requiredLevel}</div>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className={`text-2xl mb-2 ${!activity.available ? 'opacity-30' : ''}`}>
                    {activity.icon}
                  </div>
                  <div className={`font-medium text-sm mb-1 ${
                    activity.available ? 'text-white group-hover:text-pink-300' : 'text-gray-500'
                  }`}>
                    {activity.title}
                  </div>
                  <div className={`text-xs mb-2 leading-tight ${
                    activity.available ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {activity.description}
                  </div>
                  
                  {/* Rewards */}
                  {activity.available && (
                    <div className="flex justify-center items-center gap-2 text-xs">
                      {activity.energyCost && (
                        <span className="text-blue-400">⚡-{activity.energyCost}</span>
                      )}
                      {activity.affectionReward && (
                        <span className="text-pink-400">❤️+{activity.affectionReward}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Lock reason */}
                  {!activity.available && activity.lockReason && (
                    <div className="text-yellow-300 text-xs mt-1 font-medium">
                      {activity.lockReason}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                onClose();
                // Signal to parent to open marketplace with hub as previous page
                setTimeout(() => {
                  const event = new CustomEvent('openMarketplace', { detail: { previousPage: 'hub' } });
                  window.dispatchEvent(event);
                }, 100);
              }}
              className="flex items-center justify-center gap-2 p-3 bg-yellow-600/80 hover:bg-yellow-500/80 rounded-lg text-white transition-all"
            >
              <span>🛒</span>
              <span className="text-sm font-medium">Shop</span>
            </button>
            <button 
              onClick={() => {
                onClose();
                // Signal to parent to open raid system
                setTimeout(() => {
                  const event = new CustomEvent('openRaidSystem');
                  window.dispatchEvent(event);
                }, 100);
              }}
              className="flex items-center justify-center gap-2 p-3 bg-red-600/80 hover:bg-red-500/80 rounded-lg text-white transition-all"
            >
              <span>⚔️</span>
              <span className="text-sm font-medium">Raids</span>
            </button>
          </div>
        </div>

        {/* Relationship Status */}
        <div className="p-4 bg-gradient-to-r from-pink-900/50 to-purple-900/50 border-t border-white/10">
          <div className="text-center">
            <div className="text-pink-300 font-medium">
              Status: {playerStats.relationshipStatus.charAt(0).toUpperCase() + playerStats.relationshipStatus.slice(1)}
            </div>
            <div className="text-gray-400 text-sm">
              {playerStats.daysTogether} days together • {playerStats.sharedMemories} shared memories
            </div>
          </div>
        </div>
      </div>
      
      {/* Coffee Activity Modal */}
      <CoffeeActivityModal
        isVisible={coffeeActivityVisible}
        onClose={() => setCoffeeActivityVisible(false)}
        onActivityComplete={handleCoffeeActivityComplete}
        backgroundImage="/images/hongdae-cafe.jpg"
      />
    </div>
  );
}