import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

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

const getAvailableActivities = (stats: PlayerStats, timeOfDay: string): Activity[] => {
  const baseActivities: Activity[] = [
    {
      id: 'wake_up_together',
      title: 'Wake Up with Hae-In',
      description: stats.livingTogether ? 'Start your morning together in your shared apartment.' : 'Hae-In stayed over last night...',
      icon: '🌅',
      energyCost: 0,
      affectionReward: 1,
      available: timeOfDay === 'morning' && stats.relationshipStatus !== 'dating'
    },
    {
      id: 'morning_coffee',
      title: 'Morning Coffee Together',
      description: 'Share a quiet moment over coffee before the day begins.',
      icon: '☕',
      energyCost: 0,
      affectionReward: 1,
      available: timeOfDay === 'morning' && stats.livingTogether
    },
    {
      id: 'cook_together',
      title: 'Cook Breakfast Together',
      description: 'Prepare a meal together in your kitchen.',
      icon: '🍳',
      energyCost: 1,
      affectionReward: 2,
      available: timeOfDay === 'morning' && stats.intimacyLevel >= 3
    },
    {
      id: 'team_dungeon',
      title: 'Dungeon Raid as Partners',
      description: 'Clear dangerous gates together as the ultimate hunter duo.',
      icon: '👥',
      energyCost: 3,
      goldReward: 300,
      experienceReward: 100,
      affectionReward: 2,
      available: true
    },
    {
      id: 'romantic_dinner',
      title: 'Romantic Dinner',
      description: 'Take Hae-In to an upscale restaurant for an intimate evening.',
      icon: '🍽️',
      energyCost: 2,
      goldReward: -200,
      affectionReward: 3,
      available: timeOfDay === 'evening'
    },
    {
      id: 'propose_marriage',
      title: 'Propose Marriage',
      description: 'Take the next step in your relationship with Cha Hae-In.',
      icon: '💍',
      energyCost: 0,
      goldReward: -5000,
      affectionReward: 10,
      available: stats.relationshipStatus === 'dating' && stats.affectionLevel >= 8 && stats.intimacyLevel >= 7
    },
    {
      id: 'wedding_planning',
      title: 'Plan Wedding Together',
      description: 'Work together to plan your perfect wedding ceremony.',
      icon: '📋',
      energyCost: 2,
      affectionReward: 2,
      available: stats.relationshipStatus === 'engaged'
    },
    {
      id: 'apartment_hunting',
      title: 'Look for Apartment Together',
      description: 'Find the perfect place to start your life together.',
      icon: '🏠',
      energyCost: 2,
      goldReward: -1000,
      affectionReward: 2,
      available: stats.relationshipStatus === 'engaged' && !stats.livingTogether
    },
    {
      id: 'intimate_evening',
      title: 'Spend Intimate Evening',
      description: 'Enjoy a private, romantic evening together at home.',
      icon: '🌙',
      energyCost: 0,
      affectionReward: 3,
      available: timeOfDay === 'night' && stats.intimacyLevel >= 5 && (stats.livingTogether || stats.relationshipStatus === 'married')
    },
    {
      id: 'marriage_ceremony',
      title: 'Wedding Ceremony',
      description: 'Exchange vows and become husband and wife.',
      icon: '💒',
      energyCost: 0,
      goldReward: -10000,
      affectionReward: 15,
      available: stats.relationshipStatus === 'engaged' && stats.sharedMemories >= 10
    },
    {
      id: 'honeymoon',
      title: 'Honeymoon Trip',
      description: 'Take a romantic getaway to celebrate your marriage.',
      icon: '✈️',
      energyCost: 5,
      goldReward: -3000,
      affectionReward: 5,
      available: stats.relationshipStatus === 'married' && stats.daysTogether < 7
    },
    {
      id: 'marketplace',
      title: 'Shopping Together',
      description: stats.livingTogether ? 'Shop for household items together.' : 'Browse for the perfect gift for Hae-In.',
      icon: '🛒',
      energyCost: 1,
      available: true
    },
    {
      id: 'lazy_sunday',
      title: 'Lazy Day Together',
      description: 'Spend a relaxing day at home, just enjoying each other\'s company.',
      icon: '🛋️',
      energyCost: 0,
      affectionReward: 2,
      available: stats.livingTogether && timeOfDay === 'afternoon'
    }
  ];

  return baseActivities.filter(activity => activity.available);
};

const getActivityResultTitle = (activity: Activity, stats: PlayerStats): string => {
  if (activity.id === 'propose_marriage') return '💍 Marriage Proposal';
  if (activity.id === 'marriage_ceremony') return '💒 Wedding Day';
  if (activity.id === 'wake_up_together') return '🌅 Good Morning Together';
  if (activity.id === 'intimate_evening') return '🌙 Intimate Evening';
  if (activity.id === 'cook_together') return '🍳 Cooking Together';
  if (activity.id === 'honeymoon') return '✈️ Honeymoon Bliss';
  if (activity.id === 'apartment_hunting') return '🏠 Finding Your Home';
  return activity.title;
};

const getIntimateDialogue = (activity: Activity, stats: PlayerStats): string => {
  const relationshipLevel = stats.relationshipStatus;
  const intimacy = stats.intimacyLevel;
  const affection = stats.affectionLevel;

  // Marriage proposal dialogue
  if (activity.id === 'propose_marriage') {
    return "Jin-Woo... yes! A thousand times yes! I've been waiting for this moment since the day you saved me from the Ant King. I love you more than words can express.";
  }

  // Wedding ceremony dialogue
  if (activity.id === 'marriage_ceremony') {
    return "Today I become Mrs. Sung Jin-Woo... I promise to stand by your side through every gate, every battle, and every quiet moment. You are my everything, my Shadow Monarch.";
  }

  // Honeymoon dialogue
  if (activity.id === 'honeymoon') {
    return "This is perfect, Jin-Woo. Just you and me, no gates, no guilds... just us. I've never been happier. Thank you for giving me a normal life filled with extraordinary love.";
  }

  // Wake up together dialogue
  if (activity.id === 'wake_up_together') {
    if (relationshipLevel === 'married') {
      return intimacy >= 8 
        ? "Good morning, my husband... I love waking up in your arms. Last night was incredible. Should we stay in bed a little longer?" 
        : "Good morning, honey. I made coffee already. I love our lazy mornings together.";
    } else {
      return "Mmm... good morning, Jin-Woo. I love staying over at your place. Your bed is so much more comfortable than mine.";
    }
  }

  // Intimate evening dialogue
  if (activity.id === 'intimate_evening') {
    if (relationshipLevel === 'married') {
      return intimacy >= 9 
        ? "Come here, my love... I've been thinking about you all day. Let me show you how much I missed you." 
        : "Tonight is just for us. No phones, no guild business... just you and me, Jin-Woo.";
    } else {
      return "I love these quiet evenings together. Being close to you like this... it feels so right, Jin-Woo.";
    }
  }

  // Cooking together dialogue
  if (activity.id === 'cook_together') {
    return relationshipLevel === 'married' 
      ? "I love cooking with my husband. We make such a good team, don't we? In the kitchen and everywhere else." 
      : "This feels so domestic and sweet. I could get used to cooking breakfast with you every morning, Jin-Woo.";
  }

  // Apartment hunting dialogue
  if (activity.id === 'apartment_hunting') {
    return "Our first home together... I'm so excited! I want us to find the perfect place where we can build our life together. Somewhere with a big kitchen for cooking and a cozy bedroom for... well, you know.";
  }

  // Wedding planning dialogue
  if (activity.id === 'wedding_planning') {
    return "Planning our wedding with you is like a dream come true. I want everything to be perfect for our special day. Do you think your shadow soldiers could help with the decorations?";
  }

  // Team dungeon dialogue
  if (activity.id === 'team_dungeon') {
    return affection >= 8 
      ? "Fighting alongside you never gets old. We're unstoppable together, Jin-Woo. In battle and in love." 
      : "I love how we work together. You protect me, I protect you. That's what real partners do.";
  }

  // Romantic dinner dialogue
  if (activity.id === 'romantic_dinner') {
    return relationshipLevel === 'married' 
      ? "Date nights are so important, even for married couples. You still make my heart flutter like we just started dating." 
      : "You always know how to make me feel special, Jin-Woo. This is exactly what I needed after that tough raid.";
  }

  // Morning coffee dialogue
  if (activity.id === 'morning_coffee') {
    return "These quiet moments before the day starts are my favorite. Just you, me, and coffee. Simple but perfect.";
  }

  // Lazy day dialogue
  if (activity.id === 'lazy_sunday') {
    return relationshipLevel === 'married' 
      ? "I love lazy Sundays with my husband. No guild responsibilities, no gates to clear... just us being a normal couple." 
      : "Days like this remind me why I fell for you. You're not just the Shadow Monarch... you're the man I want to spend forever with.";
  }

  // Shopping dialogue
  if (activity.id === 'marketplace') {
    return stats.livingTogether 
      ? "Shopping for our home together feels so natural. We really are building a life together, aren't we?" 
      : "I love that you want to buy me gifts, but just spending time with you is the best present I could ask for.";
  }

  // Default affectionate responses
  if (affection >= 8) {
    return "Every moment with you feels like a blessing, Jin-Woo. I love you so much.";
  } else if (affection >= 5) {
    return "I really enjoy spending time with you like this. You make me so happy.";
  } else {
    return "This was nice, Jin-Woo. Thank you for thinking of me.";
  }
};

export default function DailyLifeHub() {
  const [, setLocation] = useLocation();
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    gold: 500,
    level: 15,
    experience: 750,
    affectionLevel: 3,
    energy: 8,
    maxEnergy: 10,
    relationshipStatus: 'dating',
    intimacyLevel: 3,
    sharedMemories: 5,
    livingTogether: false,
    daysTogether: 14
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // Update activities based on stats and time
  useEffect(() => {
    setActivities(getAvailableActivities(playerStats, timeOfDay));
  }, [playerStats, timeOfDay]);

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
    setPlayerStats(prev => {
      const newStats = {
        ...prev,
        energy: prev.energy - activity.energyCost,
        gold: prev.gold + (activity.goldReward || 0),
        experience: prev.experience + (activity.experienceReward || 0),
        affectionLevel: Math.min(10, prev.affectionLevel + (activity.affectionReward || 0)),
        daysTogether: prev.daysTogether + 1
      };

      // Handle special relationship milestones
      if (activity.id === 'propose_marriage') {
        newStats.relationshipStatus = 'engaged';
        newStats.intimacyLevel = Math.min(10, prev.intimacyLevel + 2);
        newStats.sharedMemories = prev.sharedMemories + 3;
      } else if (activity.id === 'marriage_ceremony') {
        newStats.relationshipStatus = 'married';
        newStats.intimacyLevel = Math.min(10, prev.intimacyLevel + 3);
        newStats.sharedMemories = prev.sharedMemories + 5;
        newStats.livingTogether = true;
      } else if (activity.id === 'apartment_hunting') {
        newStats.livingTogether = true;
        newStats.sharedMemories = prev.sharedMemories + 2;
      } else if (activity.id.includes('together') || activity.id.includes('intimate')) {
        newStats.intimacyLevel = Math.min(10, prev.intimacyLevel + 1);
        newStats.sharedMemories = prev.sharedMemories + 1;
      }

      return newStats;
    });

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
              <div className="text-gray-300 text-sm">Hae-In's Love</div>
            </div>
          </div>
          
          {/* Relationship Status */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-pink-500/20 px-3 py-1 rounded-full">
                <span className="text-pink-300 text-sm font-medium">
                  {playerStats.relationshipStatus === 'dating' && '💑 Dating'}
                  {playerStats.relationshipStatus === 'engaged' && '💍 Engaged'}
                  {playerStats.relationshipStatus === 'married' && '💒 Married'}
                </span>
              </div>
              <div className="bg-purple-500/20 px-3 py-1 rounded-full">
                <span className="text-purple-300 text-sm">
                  {playerStats.livingTogether ? '🏠 Living Together' : '🏠 Separate Homes'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-sm">Days Together: {playerStats.daysTogether}</div>
              <div className="text-gray-300 text-xs">Intimacy: {playerStats.intimacyLevel}/10 • Memories: {playerStats.sharedMemories}</div>
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

        {/* Activity Result Modal with Intimate Dialogue */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                {getActivityResultTitle(selectedActivity, playerStats)}
              </h3>
              
              {/* Cha Hae-In's Response */}
              <div className="bg-pink-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-3">💖</div>
                  <div className="text-pink-300 font-medium">Cha Hae-In</div>
                </div>
                <p className="text-white italic">
                  "{getIntimateDialogue(selectedActivity, playerStats)}"
                </p>
              </div>
              
              <div className="space-y-2 mb-6">
                {selectedActivity.goldReward && (
                  <div className="text-yellow-300">💰 +{selectedActivity.goldReward} Gold</div>
                )}
                {selectedActivity.experienceReward && (
                  <div className="text-purple-300">✨ +{selectedActivity.experienceReward} Experience</div>
                )}
                {selectedActivity.affectionReward && (
                  <div className="text-pink-300">💕 +{selectedActivity.affectionReward} Love</div>
                )}
                {selectedActivity.id.includes('together') && (
                  <div className="text-blue-300">🌟 +1 Intimacy • +1 Shared Memory</div>
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