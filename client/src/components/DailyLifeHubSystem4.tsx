import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Coffee, 
  Utensils, 
  Dumbbell, 
  Gift, 
  Home, 
  MapPin, 
  Sparkles, 
  Lock,
  Zap,
  X,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  apartmentTier: number;
  hasModernKitchen: boolean;
  hasHomeGym: boolean;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  energyCost: number;
  category: 'casual' | 'training' | 'home' | 'intimate' | 'special';
  previewImage?: string;
  affectionReward?: number;
  memoryReward?: boolean;
  available: boolean;
  lockReason?: string;
  requiredLevel?: number;
  requiredApartmentTier?: number;
  requiredAffection?: number;
  outcomes?: string[];
}

interface DailyLifeHubSystem4Props {
  isVisible: boolean;
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
  playerStats: PlayerStats;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

const ACTIVITY_CATEGORIES = [
  { id: 'all', label: 'All', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'casual', label: 'Casual Outings', icon: <MapPin className="w-4 h-4" /> },
  { id: 'training', label: 'Training', icon: <Dumbbell className="w-4 h-4" /> },
  { id: 'home', label: 'Home Life', icon: <Home className="w-4 h-4" /> },
  { id: 'intimate', label: 'Intimate', icon: <Heart className="w-4 h-4" /> }
];

const getAvailableActivities = (stats: PlayerStats, timeOfDay: string): Activity[] => {
  const activities: Activity[] = [
    // Casual Outings
    {
      id: 'hangang_walk',
      title: 'Walk at Hangang Park',
      description: 'Take a peaceful stroll along the Han River and enjoy the city views together.',
      icon: <MapPin className="w-5 h-5" />,
      energyCost: 15,
      category: 'casual',
      affectionReward: 2,
      memoryReward: true,
      available: true,
      outcomes: ['Affection++', 'New Memory']
    },
    {
      id: 'hongdae_cafe',
      title: 'Coffee Date in Hongdae',
      description: 'Visit a cozy artisan café and share intimate conversation over specialty coffee.',
      icon: <Coffee className="w-5 h-5" />,
      energyCost: 10,
      category: 'casual',
      affectionReward: 2,
      available: true,
      outcomes: ['Affection++', 'Relaxation']
    },
    {
      id: 'shopping_together',
      title: 'Shopping in Gangnam',
      description: 'Browse luxury boutiques together and help each other pick out outfits.',
      icon: <Gift className="w-5 h-5" />,
      energyCost: 20,
      category: 'casual',
      affectionReward: 1,
      available: stats.gold >= 100000,
      lockReason: stats.gold < 100000 ? 'Requires ₩100,000 for shopping' : undefined,
      outcomes: ['Affection+', 'Fashion Bonus']
    },

    // Training Activities
    {
      id: 'combat_training',
      title: 'Combat Training Together',
      description: 'Practice your fighting techniques and help each other improve.',
      icon: <Dumbbell className="w-5 h-5" />,
      energyCost: 25,
      category: 'training',
      affectionReward: 1,
      available: true,
      outcomes: ['Skill+', 'Teamwork+']
    },
    {
      id: 'dungeon_strategy',
      title: 'Plan Raid Strategy',
      description: 'Study dungeon layouts and coordinate your next joint raid.',
      icon: <Sparkles className="w-5 h-5" />,
      energyCost: 15,
      category: 'training',
      available: stats.level >= 10,
      lockReason: stats.level < 10 ? 'Requires Level 10' : undefined,
      outcomes: ['Strategy+', 'Coordination+']
    },

    // Home Life Activities
    {
      id: 'cook_together',
      title: 'Cook Dinner Together',
      description: 'Spend a quiet evening at home and make a meal together.',
      icon: <Utensils className="w-5 h-5" />,
      energyCost: 20,
      category: 'home',
      affectionReward: 3,
      memoryReward: true,
      available: stats.hasModernKitchen,
      lockReason: !stats.hasModernKitchen ? 'Requires: Modern Kitchen in Tier 2+ Apartment' : undefined,
      requiredApartmentTier: 2,
      outcomes: ['Affection+++', 'Domestic Bliss']
    },
    {
      id: 'movie_night',
      title: 'Movie Night at Home',
      description: 'Curl up together and watch your favorite films.',
      icon: <Home className="w-5 h-5" />,
      energyCost: 10,
      category: 'home',
      affectionReward: 2,
      available: stats.livingTogether,
      lockReason: !stats.livingTogether ? 'Requires: Living Together' : undefined,
      outcomes: ['Affection++', 'Cozy Evening']
    },
    {
      id: 'home_workout',
      title: 'Private Training Session',
      description: 'Use your home gym for an intense, private workout together.',
      icon: <Dumbbell className="w-5 h-5" />,
      energyCost: 30,
      category: 'home',
      affectionReward: 2,
      available: stats.hasHomeGym,
      lockReason: !stats.hasHomeGym ? 'Requires: Home Gym Equipment' : undefined,
      outcomes: ['Fitness+', 'Intimacy+']
    },

    // Intimate Activities
    {
      id: 'romantic_dinner',
      title: 'Candlelit Dinner',
      description: 'Share an intimate dinner by candlelight in your private dining room.',
      icon: <Heart className="w-5 h-5" />,
      energyCost: 25,
      category: 'intimate',
      affectionReward: 4,
      memoryReward: true,
      available: stats.affectionLevel >= 60 && stats.apartmentTier >= 3,
      lockReason: stats.affectionLevel < 60 ? 'Requires: Higher Affection Level' : 
                  stats.apartmentTier < 3 ? 'Requires: Luxury Apartment' : undefined,
      requiredAffection: 60,
      requiredApartmentTier: 3,
      outcomes: ['Affection++++', 'Romance++']
    },
    {
      id: 'stargazing',
      title: 'Rooftop Stargazing',
      description: 'Spend the evening on your private rooftop, looking at stars together.',
      icon: <Sparkles className="w-5 h-5" />,
      energyCost: 15,
      category: 'intimate',
      affectionReward: 3,
      memoryReward: true,
      available: stats.affectionLevel >= 40 && stats.apartmentTier >= 2,
      lockReason: stats.affectionLevel < 40 ? 'Requires: Higher Affection Level' : 
                  stats.apartmentTier < 2 ? 'Requires: Apartment with Rooftop Access' : undefined,
      outcomes: ['Affection+++', 'Romantic Memory']
    },

    // Special Activities
    {
      id: 'give_gift',
      title: 'Give a Special Gift',
      description: 'Present one of your carefully chosen gifts to Cha Hae-In.',
      icon: <Gift className="w-5 h-5" />,
      energyCost: 5,
      category: 'special',
      affectionReward: 3,
      available: true, // Always available if player has gifts
      outcomes: ['Affection+++', 'Gratitude+']
    }
  ];

  return activities;
};

const getGreetingMessage = (timeOfDay: string, affectionLevel: number): string => {
  const baseGreetings = {
    morning: "Good morning, Jin-Woo! What should we do today?",
    afternoon: "The afternoon is perfect for spending time together. What do you have in mind?",
    evening: "What a lovely evening! How would you like to spend it with me?",
    night: "The night is still young... what should we do together?"
  };

  if (affectionLevel >= 80) {
    return {
      morning: "Good morning, my love! Every day with you feels like a new adventure. What should we do today?",
      afternoon: "Another beautiful afternoon with my Shadow Monarch. How shall we spend our time together?",
      evening: "Evening already? Time flies when I'm with you. What would make tonight special?",
      night: "Just you and me under the stars... what should we do tonight, darling?"
    }[timeOfDay] || baseGreetings[timeOfDay as keyof typeof baseGreetings];
  } else if (affectionLevel >= 40) {
    return {
      morning: "Morning, Jin-Woo! I've been looking forward to spending time with you. What should we do?",
      afternoon: "Perfect timing! I was just thinking about you. What do you want to do together?",
      evening: "The evening is ours. What sounds good to you?",
      night: "A quiet night together sounds perfect. What do you have in mind?"
    }[timeOfDay] || baseGreetings[timeOfDay as keyof typeof baseGreetings];
  }

  return baseGreetings[timeOfDay as keyof typeof baseGreetings];
};

export function DailyLifeHubSystem4({ 
  isVisible, 
  onClose, 
  onActivitySelect, 
  playerStats, 
  timeOfDay 
}: DailyLifeHubSystem4Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  
  const availableActivities = getAvailableActivities(playerStats, timeOfDay);
  const greetingMessage = getGreetingMessage(timeOfDay, playerStats.affectionLevel);

  const filteredActivities = selectedCategory === 'all' 
    ? availableActivities 
    : availableActivities.filter(activity => activity.category === selectedCategory);

  const handleActivitySelect = (activity: Activity) => {
    if (!activity.available) return;
    if (playerStats.energy < activity.energyCost) return;
    
    onActivitySelect(activity);
  };

  const getEnergyOrbStyle = () => {
    const energyPercentage = (playerStats.energy / playerStats.maxEnergy) * 100;
    if (energyPercentage > 70) return 'from-purple-400 to-purple-600 shadow-purple-400/50';
    if (energyPercentage > 30) return 'from-yellow-400 to-orange-500 shadow-yellow-400/50';
    return 'from-red-400 to-red-600 shadow-red-400/50';
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center"
      >
        {/* Beautiful Background with Glass Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1)_0%,transparent_50%)]" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-6xl mx-4 h-[90vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header with Greeting */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-white font-bold text-2xl mb-2">Day Planner</h2>
                <p className="text-purple-200 text-lg italic">{greetingMessage}</p>
              </div>
              
              {/* Energy Orb */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getEnergyOrbStyle()} flex items-center justify-center shadow-lg`}>
                    <div className="text-white font-bold text-lg">
                      {playerStats.energy}
                    </div>
                  </div>
                  <div className="text-white/70 text-sm mt-1">Energy</div>
                </div>
                
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:bg-white/10 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="p-6 border-b border-white/10">
            <div className="flex gap-2 overflow-x-auto">
              {ACTIVITY_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className={`whitespace-nowrap flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {category.icon}
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Activity Cards Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => {
                const canAfford = playerStats.energy >= activity.energyCost;
                const isLocked = !activity.available;
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: isLocked ? 1 : 1.02 }}
                    onHoverStart={() => setHoveredActivity(activity.id)}
                    onHoverEnd={() => setHoveredActivity(null)}
                    className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 cursor-pointer transition-all duration-300 ${
                      isLocked 
                        ? 'opacity-50 cursor-not-allowed' 
                        : canAfford
                        ? 'hover:bg-white/10 hover:border-purple-400/30 hover:shadow-purple-400/20 hover:shadow-lg'
                        : 'cursor-not-allowed'
                    }`}
                    onClick={() => handleActivitySelect(activity)}
                  >
                    {/* Lock Overlay */}
                    {isLocked && (
                      <div className="absolute top-4 right-4">
                        <Lock className="w-5 h-5 text-red-400" />
                      </div>
                    )}

                    {/* Activity Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      isLocked 
                        ? 'bg-gray-600/50 text-gray-400' 
                        : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                    }`}>
                      {activity.icon}
                    </div>

                    {/* Activity Info */}
                    <h3 className="text-white font-bold text-lg mb-2">{activity.title}</h3>
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">{activity.description}</p>

                    {/* Energy Cost */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                        canAfford && !isLocked
                          ? 'bg-purple-600/20 text-purple-300'
                          : 'bg-red-600/20 text-red-300'
                      }`}>
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-semibold">-{activity.energyCost}</span>
                      </div>
                    </div>

                    {/* Outcomes */}
                    {activity.outcomes && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {activity.outcomes.map((outcome, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-pink-600/20 text-pink-300 text-xs rounded-full"
                          >
                            {outcome}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Lock Reason */}
                    {isLocked && activity.lockReason && (
                      <div className="text-red-400 text-xs bg-red-900/20 rounded-lg p-2 border border-red-600/30">
                        🔒 {activity.lockReason}
                      </div>
                    )}

                    {/* Insufficient Energy Warning */}
                    {!isLocked && !canAfford && (
                      <div className="text-yellow-400 text-xs bg-yellow-900/20 rounded-lg p-2 border border-yellow-600/30">
                        ⚡ Not enough energy
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}