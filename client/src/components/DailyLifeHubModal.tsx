import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

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
}

interface DailyLifeHubModalProps {
  isVisible: boolean;
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
  onImageGenerated: (imageUrl: string) => void;
  gameState: any;
}

const getAvailableActivities = (stats: PlayerStats, timeOfDay: string): Activity[] => {
  const baseActivities: Activity[] = [
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

  if (stats.affectionLevel >= 70 && stats.relationshipStatus !== 'dating') {
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
  if (stats.affectionLevel >= 80 && !stats.livingTogether) {
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

  // Add intimate activities for higher relationship levels
  if (stats.relationshipStatus === 'married' || stats.intimacyLevel >= 3) {
    baseActivities.push(
      {
        id: 'cuddle_together',
        title: 'Cuddle Time',
        description: 'Relaxing intimate moments together',
        icon: '💕',
        energyCost: 15,
        affectionReward: 20,
        available: true
      },
      {
        id: 'shower_together',
        title: 'Shower Together',
        description: 'Intimate shower time (18+)',
        icon: '🚿',
        energyCost: 20,
        affectionReward: 25,
        available: stats.intimacyLevel >= 4
      }
    );
  }

  if (stats.relationshipStatus === 'married') {
    baseActivities.push({
      id: 'make_love',
      title: 'Make Love',
      description: 'Ultimate intimacy as married couple (18+)',
      icon: '❤️',
      energyCost: 40,
      affectionReward: 50,
      available: stats.intimacyLevel >= 5
    });
  }

  return baseActivities.filter(activity => activity.available);
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

export function DailyLifeHubModal({ isVisible, onClose, onActivitySelect, onImageGenerated, gameState }: DailyLifeHubModalProps) {
  const { playVoice } = useVoice();
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
    affectionLevel: gameState?.affection || 1,
    energy: gameState?.energy || 80,
    maxEnergy: 100,
    relationshipStatus: gameState?.affection >= 5 ? 'married' : gameState?.affection >= 4 ? 'engaged' : 'dating',
    intimacyLevel: gameState?.affection || 1,
    sharedMemories: gameState?.affection * 10 || 10,
    livingTogether: gameState?.affection >= 4,
    daysTogether: (gameState?.affection || 1) * 30
  };

  const availableActivities = getAvailableActivities(playerStats, currentTimeOfDay);

  const handleActivityClick = async (activity: Activity) => {
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
        playVoice(activityDialogue, 'cha-hae-in');
      }, intimateActivities.includes(activity.id) ? 1500 : 500); // Longer delay for image generation
    }

    // Pass activity context to enable continuous interaction
    onActivitySelect(activity);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
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
            className="w-8 h-8 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <X size={16} />
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
              <div className="text-pink-400 font-bold">❤️ {playerStats.affectionLevel}/5</div>
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

        {/* Activities */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-3">Available Activities</h3>
          <div className="space-y-3">
            {availableActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className="w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium group-hover:text-pink-300 transition-colors">
                      {activity.title}
                    </div>
                    <div className="text-gray-400 text-sm">{activity.description}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      {activity.energyCost && (
                        <span className="text-blue-400">⚡ -{activity.energyCost}</span>
                      )}
                      {activity.affectionReward && (
                        <span className="text-pink-400">❤️ +{activity.affectionReward}</span>
                      )}
                      {activity.goldReward && (
                        <span className={activity.goldReward > 0 ? "text-yellow-400" : "text-red-400"}>
                          💰 {activity.goldReward > 0 ? '+' : ''}{activity.goldReward}
                        </span>
                      )}
                    </div>
                  </div>
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
    </div>
  );
}