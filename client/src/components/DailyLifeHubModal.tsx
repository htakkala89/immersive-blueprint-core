import React, { useState } from 'react';
import { X } from 'lucide-react';

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
    }
  ];

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

export function DailyLifeHubModal({ isVisible, onClose, onActivitySelect, onImageGenerated, gameState }: DailyLifeHubModalProps) {
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
    // Generate image for the activity
    try {
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
          onImageGenerated(data.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error generating activity image:', error);
    }

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