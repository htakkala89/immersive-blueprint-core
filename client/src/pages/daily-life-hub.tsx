import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface PlayerStats {
  gold: number;
  level: number;
  experience: number;
  affectionLevel: number;
  energy: number;
  maxEnergy: number;
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

const DAILY_ACTIVITIES: Activity[] = [
  {
    id: 'dungeon_raid',
    title: 'Solo Dungeon Raid',
    description: 'Clear a C-rank dungeon alone to earn gold and experience.',
    icon: '⚔️',
    energyCost: 2,
    goldReward: 150,
    experienceReward: 50,
    available: true
  },
  {
    id: 'team_dungeon',
    title: 'Team Up with Hae-In',
    description: 'Partner with Cha Hae-In for a challenging B-rank dungeon.',
    icon: '👥',
    energyCost: 3,
    goldReward: 300,
    experienceReward: 100,
    affectionReward: 1,
    available: true
  },
  {
    id: 'training',
    title: 'Shadow Training',
    description: 'Train with your shadow soldiers to improve your abilities.',
    icon: '🥋',
    energyCost: 1,
    experienceReward: 25,
    available: true
  },
  {
    id: 'hunter_association',
    title: 'Hunter Association Tasks',
    description: 'Complete paperwork and administrative duties.',
    icon: '📋',
    energyCost: 1,
    goldReward: 75,
    available: true
  },
  {
    id: 'date_activity',
    title: 'Ask Hae-In on a Date',
    description: 'Spend quality time together to strengthen your bond.',
    icon: '💕',
    energyCost: 2,
    affectionReward: 2,
    available: true
  },
  {
    id: 'marketplace',
    title: 'Visit Hunter Marketplace',
    description: 'Browse and purchase gifts for Cha Hae-In.',
    icon: '🛒',
    energyCost: 0,
    available: true
  }
];

export default function DailyLifeHub() {
  const [, setLocation] = useLocation();
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    gold: 500,
    level: 15,
    experience: 750,
    affectionLevel: 3,
    energy: 8,
    maxEnergy: 10
  });

  const [activities] = useState<Activity[]>(DAILY_ACTIVITIES);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // Time progression system
  useEffect(() => {
    const getTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour < 6) return 'night';
      if (hour < 12) return 'morning';
      if (hour < 18) return 'afternoon';
      if (hour < 22) return 'evening';
      return 'night';
    };

    setTimeOfDay(getTimeOfDay());
    
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleActivitySelect = (activity: Activity) => {
    if (!activity.available || playerStats.energy < activity.energyCost) {
      return;
    }

    if (activity.id === 'marketplace') {
      setLocation('/marketplace');
      return;
    }

    if (activity.id === 'team_dungeon' || activity.id === 'date_activity') {
      // Navigate to specific scenes
      localStorage.setItem('activityType', activity.id);
      setLocation('/solo-leveling');
      return;
    }

    // Handle immediate activities
    setPlayerStats(prev => ({
      ...prev,
      energy: prev.energy - activity.energyCost,
      gold: prev.gold + (activity.goldReward || 0),
      experience: prev.experience + (activity.experienceReward || 0),
      affectionLevel: Math.min(10, prev.affectionLevel + (activity.affectionReward || 0))
    }));

    setSelectedActivity(activity);
  };

  const restoreEnergy = () => {
    setPlayerStats(prev => ({ ...prev, energy: prev.maxEnergy }));
  };

  const getBackgroundGradient = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
      case 'afternoon':
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 100%)';
      case 'evening':
        return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff8a80 100%)';
      case 'night':
        return 'linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #2980b9 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden transition-all duration-1000"
      style={{ background: getBackgroundGradient() }}
    >
      {/* Apartment Interior Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header with Stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">Daily Life Hub</h1>
            <div className="text-white text-sm">
              {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} • Level {playerStats.level}
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-yellow-400 text-2xl">💰</div>
              <div className="text-white font-semibold">{playerStats.gold}</div>
              <div className="text-gray-300 text-sm">Gold</div>
            </div>
            
            <div className="text-center">
              <div className="text-blue-400 text-2xl">⚡</div>
              <div className="text-white font-semibold">{playerStats.energy}/{playerStats.maxEnergy}</div>
              <div className="text-gray-300 text-sm">Energy</div>
            </div>
            
            <div className="text-center">
              <div className="text-purple-400 text-2xl">✨</div>
              <div className="text-white font-semibold">{playerStats.experience}</div>
              <div className="text-gray-300 text-sm">Experience</div>
            </div>
            
            <div className="text-center">
              <div className="text-pink-400 text-2xl">💕</div>
              <div className="text-white font-semibold">{playerStats.affectionLevel}/10</div>
              <div className="text-gray-300 text-sm">Hae-In's Affection</div>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {activities.map((activity) => {
            const canAfford = playerStats.energy >= activity.energyCost;
            const isDisabled = !activity.available || !canAfford;
            
            return (
              <div
                key={activity.id}
                className={`p-4 rounded-xl backdrop-blur-md border transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  isDisabled
                    ? 'bg-gray-800/50 border-gray-600/30 opacity-50 cursor-not-allowed'
                    : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
                }`}
                onClick={() => !isDisabled && handleActivitySelect(activity)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{activity.icon}</div>
                  <div>
                    <h3 className="text-white font-semibold">{activity.title}</h3>
                    <div className="text-blue-400 text-sm">⚡ {activity.energyCost} Energy</div>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{activity.description}</p>
                
                {/* Rewards */}
                <div className="flex gap-2 text-xs">
                  {activity.goldReward && (
                    <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                      +{activity.goldReward} 💰
                    </span>
                  )}
                  {activity.experienceReward && (
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      +{activity.experienceReward} XP
                    </span>
                  )}
                  {activity.affectionReward && (
                    <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded">
                      +{activity.affectionReward} 💕
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={restoreEnergy}
            className="px-6 py-3 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-lg transition-colors backdrop-blur-md"
            disabled={playerStats.energy === playerStats.maxEnergy}
          >
            ⚡ Rest (Restore Energy)
          </button>
          
          <button
            onClick={() => setLocation('/chapter-select')}
            className="px-6 py-3 bg-gray-600/80 hover:bg-gray-500/80 text-white rounded-lg transition-colors backdrop-blur-md"
          >
            📚 Chapter Select
          </button>
          
          <button
            onClick={() => setLocation('/marketplace')}
            className="px-6 py-3 bg-green-600/80 hover:bg-green-500/80 text-white rounded-lg transition-colors backdrop-blur-md"
          >
            🛒 Marketplace
          </button>
        </div>

        {/* Activity Result Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Activity Complete!</h3>
              <p className="text-gray-300 mb-4">You completed: {selectedActivity.title}</p>
              
              <div className="space-y-2 mb-6">
                {selectedActivity.goldReward && (
                  <div className="text-yellow-300">💰 +{selectedActivity.goldReward} Gold</div>
                )}
                {selectedActivity.experienceReward && (
                  <div className="text-purple-300">✨ +{selectedActivity.experienceReward} Experience</div>
                )}
                {selectedActivity.affectionReward && (
                  <div className="text-pink-300">💕 +{selectedActivity.affectionReward} Affection</div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedActivity(null)}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}